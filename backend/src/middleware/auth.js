const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const logger = require('../services/logger');
const db = require('../models/database');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * Verify Firebase ID token
 */
async function verifyFirebaseToken(token) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    logger.security('firebase_token_verification_failed', { error: error.message });
    return null;
  }
}

/**
 * Verify JWT token (for internal API calls)
 */
function verifyJWTToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'iron-assistant-secret');
    return decoded;
  } catch (error) {
    logger.security('jwt_token_verification_failed', { error: error.message });
    return null;
  }
}

/**
 * Get or create user in database
 */
async function getOrCreateUser(firebaseUser) {
  try {
    // Check if user exists
    let user = await db('users')
      .where('firebase_uid', firebaseUser.uid)
      .first();

    if (!user) {
      // Create new user
      const userData = {
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        email_verified: firebaseUser.email_verified || false,
        name: firebaseUser.name || null,
        picture: firebaseUser.picture || null,
        provider: firebaseUser.firebase.sign_in_provider,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: new Date(),
        is_active: true,
        subscription_status: 'free',
        preferences: {
          notifications: true,
          marketing_emails: true,
          language: 'es',
          timezone: 'America/Mexico_City',
        },
      };

      const [insertedUser] = await db('users')
        .insert(userData)
        .returning('*');

      user = insertedUser;
      
      logger.auth('user_created', user.id, true, { 
        provider: userData.provider,
        email: userData.email 
      });
    } else {
      // Update last login
      await db('users')
        .where('id', user.id)
        .update({ 
          last_login: new Date(),
          updated_at: new Date()
        });

      logger.auth('user_login', user.id, true);
    }

    return user;
  } catch (error) {
    logger.errorWithContext(error, { 
      context: 'get_or_create_user', 
      firebaseUid: firebaseUser.uid 
    });
    throw error;
  }
}

/**
 * Main authentication middleware
 */
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      logger.security('missing_auth_header', { 
        ip: req.ip, 
        userAgent: req.get('User-Agent'),
        path: req.path 
      });
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization header provided',
      });
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logger.security('invalid_auth_header_format', { 
        ip: req.ip,
        authHeader: authHeader.substring(0, 20) + '...'
      });
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authorization header format',
      });
    }

    const token = parts[1];
    let decodedToken = null;
    let authType = null;

    // Try Firebase token first
    decodedToken = await verifyFirebaseToken(token);
    if (decodedToken) {
      authType = 'firebase';
    } else {
      // Try JWT token
      decodedToken = verifyJWTToken(token);
      authType = 'jwt';
    }

    if (!decodedToken) {
      logger.security('token_verification_failed', { 
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path
      });
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }

    // Get or create user
    let user;
    if (authType === 'firebase') {
      user = await getOrCreateUser(decodedToken);
    } else {
      // For JWT tokens, user should already exist
      user = await db('users')
        .where('id', decodedToken.userId)
        .first();

      if (!user) {
        logger.security('jwt_user_not_found', { 
          userId: decodedToken.userId,
          ip: req.ip 
        });
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not found',
        });
      }
    }

    // Check if user is active
    if (!user.is_active) {
      logger.security('inactive_user_access_attempt', { 
        userId: user.id,
        ip: req.ip 
      });
      return res.status(403).json({
        error: 'Forbidden',
        message: 'User account is inactive',
      });
    }

    // Add user to request
    req.user = user;
    req.authType = authType;
    req.decodedToken = decodedToken;

    next();
  } catch (error) {
    logger.errorWithContext(error, { 
      context: 'auth_middleware',
      ip: req.ip,
      path: req.path 
    });
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication service error',
    });
  }
}

/**
 * Optional authentication middleware (doesn't require authentication)
 */
async function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      // If auth header is present, validate it
      await authMiddleware(req, res, next);
    } else {
      // If no auth header, continue without user
      req.user = null;
      next();
    }
  } catch (error) {
    // If auth fails but it's optional, continue without user
    req.user = null;
    next();
  }
}

/**
 * Admin role middleware
 */
async function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'admin') {
    logger.security('admin_access_denied', { 
      userId: req.user.id,
      role: req.user.role,
      ip: req.ip,
      path: req.path 
    });
    
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required',
    });
  }

  next();
}

/**
 * Premium subscription middleware
 */
async function requirePremium(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  const subscription = await db('subscriptions')
    .where('user_id', req.user.id)
    .where('is_active', true)
    .where('current_period_end', '>', new Date())
    .first();

  if (!subscription) {
    logger.security('premium_access_denied', { 
      userId: req.user.id,
      subscriptionStatus: req.user.subscription_status,
      ip: req.ip,
      path: req.path 
    });
    
    return res.status(403).json({
      error: 'Premium Required',
      message: 'Active premium subscription required for this feature',
      upgradeUrl: process.env.FRONTEND_URL + '/premium',
    });
  }

  req.subscription = subscription;
  next();
}

/**
 * Rate limiting with user context
 */
function createUserRateLimit(options = {}) {
  const rateLimit = require('express-rate-limit');
  
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise use IP
      return req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
    },
    message: {
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    onLimitReached: (req, res, options) => {
      logger.security('rate_limit_exceeded', {
        userId: req.user?.id || null,
        ip: req.ip,
        path: req.path,
        limit: options.max,
        windowMs: options.windowMs,
      });
    },
  });
}

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  requireAdmin,
  requirePremium,
  createUserRateLimit,
  verifyFirebaseToken,
  verifyJWTToken,
};