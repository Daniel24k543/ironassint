const logger = require('../services/logger');

/**
 * Custom error class for API errors
 */
class APIError extends Error {
  constructor(message, statusCode = 500, code = null, details = null) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error handler
 */
function createValidationError(validationResult) {
  const errors = validationResult.array().map(error => ({
    field: error.path,
    message: error.msg,
    value: error.value,
  }));

  return new APIError(
    'Validation failed',
    400,
    'VALIDATION_ERROR',
    { fields: errors }
  );
}

/**
 * Database error handler
 */
function handleDatabaseError(error) {
  logger.errorWithContext(error, { context: 'database_error' });

  // PostgreSQL specific errors
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique violation
        return new APIError(
          'Resource already exists',
          409,
          'DUPLICATE_RESOURCE',
          { constraint: error.constraint }
        );
      
      case '23503': // Foreign key violation
        return new APIError(
          'Referenced resource not found',
          400,
          'INVALID_REFERENCE',
          { constraint: error.constraint }
        );
      
      case '23502': // Not null violation
        return new APIError(
          'Required field missing',
          400,
          'MISSING_REQUIRED_FIELD',
          { column: error.column }
        );
      
      case '22001': // String data too long
        return new APIError(
          'Data too long for field',
          400,
          'DATA_TOO_LONG',
          { column: error.column }
        );
      
      case 'ECONNREFUSED':
        return new APIError(
          'Database connection failed',
          503,
          'DATABASE_UNAVAILABLE'
        );
      
      default:
        return new APIError(
          'Database operation failed',
          500,
          'DATABASE_ERROR',
          { code: error.code }
        );
    }
  }

  return new APIError('Database operation failed', 500, 'DATABASE_ERROR');
}

/**
 * Stripe error handler
 */
function handleStripeError(error) {
  logger.payment('stripe_error', null, null, null, { 
    type: error.type,
    code: error.code,
    message: error.message 
  });

  switch (error.type) {
    case 'StripeCardError':
      return new APIError(
        error.message,
        400,
        'CARD_ERROR',
        { 
          decline_code: error.decline_code,
          code: error.code 
        }
      );
    
    case 'StripeRateLimitError':
      return new APIError(
        'Too many requests to payment processor',
        429,
        'RATE_LIMIT_ERROR'
      );
    
    case 'StripeInvalidRequestError':
      return new APIError(
        'Invalid payment request',
        400,
        'INVALID_PAYMENT_REQUEST',
        { param: error.param }
      );
    
    case 'StripeAPIError':
      return new APIError(
        'Payment processor error',
        502,
        'PAYMENT_SERVICE_ERROR'
      );
    
    case 'StripeConnectionError':
      return new APIError(
        'Payment service unavailable',
        503,
        'PAYMENT_SERVICE_UNAVAILABLE'
      );
    
    default:
      return new APIError(
        'Payment processing failed',
        500,
        'PAYMENT_ERROR',
        { type: error.type }
      );
  }
}

/**
 * Firebase error handler
 */
function handleFirebaseError(error) {
  logger.auth('firebase_error', null, false, { 
    code: error.code,
    message: error.message 
  });

  switch (error.code) {
    case 'auth/id-token-expired':
      return new APIError(
        'Authentication token expired',
        401,
        'TOKEN_EXPIRED'
      );
    
    case 'auth/id-token-revoked':
      return new APIError(
        'Authentication token revoked',
        401,
        'TOKEN_REVOKED'
      );
    
    case 'auth/invalid-id-token':
      return new APIError(
        'Invalid authentication token',
        401,
        'INVALID_TOKEN'
      );
    
    case 'auth/user-not-found':
      return new APIError(
        'User not found',
        404,
        'USER_NOT_FOUND'
      );
    
    case 'auth/user-disabled':
      return new APIError(
        'User account disabled',
        403,
        'USER_DISABLED'
      );
    
    default:
      return new APIError(
        'Authentication service error',
        500,
        'AUTH_SERVICE_ERROR',
        { code: error.code }
      );
  }
}

/**
 * Main error handler middleware
 */
function errorHandler(error, req, res, next) {
  let apiError = error;

  // Convert non-APIError instances to APIError
  if (!(error instanceof APIError)) {
    // Handle specific error types
    if (error.name === 'ValidationError' || error.array) {
      // Express-validator errors
      apiError = createValidationError(error);
    } else if (error.code && (error.code.startsWith('23') || error.code === 'ECONNREFUSED')) {
      // Database errors
      apiError = handleDatabaseError(error);
    } else if (error.type && error.type.startsWith('Stripe')) {
      // Stripe errors
      apiError = handleStripeError(error);
    } else if (error.code && error.code.startsWith('auth/')) {
      // Firebase errors
      apiError = handleFirebaseError(error);
    } else {
      // Generic errors
      apiError = new APIError(
        process.env.NODE_ENV === 'production' 
          ? 'An unexpected error occurred' 
          : error.message,
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  // Log the error with context
  const errorContext = {
    context: 'api_error_handler',
    userId: req.user?.id || null,
    ip: req.ip,
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent'),
    statusCode: apiError.statusCode,
    code: apiError.code,
    isOperational: apiError.isOperational,
  };

  if (apiError.statusCode >= 500) {
    logger.errorWithContext(apiError, errorContext);
  } else {
    logger.warn('Client Error', {
      ...errorContext,
      message: apiError.message,
      details: apiError.details,
    });
  }

  // Prepare response
  const response = {
    error: getErrorName(apiError.statusCode),
    message: apiError.message,
    code: apiError.code,
    timestamp: new Date().toISOString(),
  };

  // Add details in development
  if (process.env.NODE_ENV === 'development') {
    response.details = apiError.details;
    response.stack = apiError.stack;
  } else {
    // Only add details for client errors in production
    if (apiError.statusCode < 500 && apiError.details) {
      response.details = apiError.details;
    }
  }

  // Add request ID if available
  if (req.id) {
    response.requestId = req.id;
  }

  res.status(apiError.statusCode).json(response);
}

/**
 * Get error name from status code
 */
function getErrorName(statusCode) {
  const errorNames = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };

  return errorNames[statusCode] || 'Unknown Error';
}

/**
 * Async error wrapper
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    const result = fn(req, res, next);
    
    if (result && typeof result.catch === 'function') {
      result.catch(next);
    }
  };
}

/**
 * 404 not found handler
 */
function notFoundHandler(req, res, next) {
  const error = new APIError(
    `Route ${req.method} ${req.path} not found`,
    404,
    'ROUTE_NOT_FOUND',
    { 
      method: req.method, 
      path: req.path 
    }
  );
  
  next(error);
}

/**
 * Request timeout handler
 */
function timeoutHandler(timeout = 30000) {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      const error = new APIError(
        'Request timeout',
        408,
        'REQUEST_TIMEOUT'
      );
      next(error);
    }, timeout);

    const originalSend = res.send;
    res.send = function(data) {
      clearTimeout(timer);
      originalSend.call(this, data);
    };

    next();
  };
}

/**
 * CORS error handler
 */
function corsErrorHandler(error, req, res, next) {
  if (error.message && error.message.includes('CORS')) {
    const corsError = new APIError(
      'Cross-origin request blocked',
      403,
      'CORS_ERROR',
      { 
        origin: req.get('Origin'),
        method: req.method 
      }
    );
    return next(corsError);
  }
  
  next(error);
}

module.exports = {
  APIError,
  errorHandler,
  asyncHandler,
  notFoundHandler,
  timeoutHandler,
  corsErrorHandler,
  createValidationError,
  handleDatabaseError,
  handleStripeError,
  handleFirebaseError,
};