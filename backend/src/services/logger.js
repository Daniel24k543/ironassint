const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log format configuration
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += '\n' + JSON.stringify(meta, null, 2);
    }
    
    return log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'iron-assistant-api',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    // Error logs
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Combined logs
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Performance logs for analytics
    new winston.transports.File({
      filename: path.join(logsDir, 'performance.log'),
      level: 'debug',
      maxsize: 5242880, // 5MB
      maxFiles: 3,
    }),
  ],
});

// Console logging for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

// Custom logging methods for different contexts
logger.api = (method, url, statusCode, responseTime, userId = null) => {
  logger.info('API Request', {
    type: 'api_request',
    method,
    url,
    statusCode,
    responseTime,
    userId,
  });
};

logger.auth = (action, userId, success, details = {}) => {
  logger.info('Authentication Event', {
    type: 'auth_event',
    action,
    userId,
    success,
    ...details,
  });
};

logger.subscription = (action, userId, planId, details = {}) => {
  logger.info('Subscription Event', {
    type: 'subscription_event',
    action,
    userId,
    planId,
    ...details,
  });
};

logger.workout = (action, userId, workoutId, details = {}) => {
  logger.info('Workout Event', {
    type: 'workout_event',
    action,
    userId,
    workoutId,
    ...details,
  });
};

logger.security = (event, details = {}) => {
  logger.warn('Security Event', {
    type: 'security_event',
    event,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

logger.performance = (operation, duration, details = {}) => {
  logger.debug('Performance Metric', {
    type: 'performance_metric',
    operation,
    duration,
    ...details,
  });
};

logger.ai = (action, userId, model, details = {}) => {
  logger.info('AI Event', {
    type: 'ai_event',
    action,
    userId,
    model,
    ...details,
  });
};

logger.notification = (action, userId, type, details = {}) => {
  logger.info('Notification Event', {
    type: 'notification_event',
    action,
    userId,
    notificationType: type,
    ...details,
  });
};

// Error tracking with context
logger.errorWithContext = (error, context = {}) => {
  logger.error('Application Error', {
    type: 'application_error',
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context,
  });
};

// Database operation logging
logger.db = (operation, table, duration, success, details = {}) => {
  logger.debug('Database Operation', {
    type: 'database_operation',
    operation,
    table,
    duration,
    success,
    ...details,
  });
};

// Payment processing logging
logger.payment = (action, userId, amount, currency, details = {}) => {
  logger.info('Payment Event', {
    type: 'payment_event',
    action,
    userId,
    amount,
    currency,
    ...details,
  });
};

// Health check logging
logger.health = (component, status, details = {}) => {
  const level = status === 'healthy' ? 'info' : 'error';
  logger[level]('Health Check', {
    type: 'health_check',
    component,
    status,
    ...details,
  });
};

// Stream for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = logger;