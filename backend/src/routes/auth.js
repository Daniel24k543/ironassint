const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const admin = require('firebase-admin');
const router = express.Router();

const db = require('../models/database');
const logger = require('../services/logger');
const { APIError, createValidationError, asyncHandler } = require('../middleware/errorHandler');
const { verifyFirebaseToken, createUserRateLimit } = require('../middleware/auth');

// Rate limiting for auth routes
const authLimiter = createUserRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
});

const loginLimiter = createUserRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 login attempts per 15 minutes
});

/**
 * POST /api/auth/register
 * Register a new user with email and password
 */
router.post('/register', 
  authLimiter,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .escape(),
    body('acceptTerms')
      .isBoolean()
      .custom(value => {
        if (!value) {
          throw new Error('You must accept the terms and conditions');
        }
        return true;
      }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError(errors);
    }

    const { email, password, name, acceptTerms } = req.body;

    // Check if user already exists
    const existingUser = await db('users')
      .where('email', email)
      .first();

    if (existingUser) {
      throw new APIError('User with this email already exists', 409, 'USER_EXISTS');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in our database
    const userData = {
      email,
      password_hash: hashedPassword,
      name,
      email_verified: false,
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true,
      subscription_status: 'free',
      accepted_terms: acceptTerms,
      accepted_terms_at: acceptTerms ? new Date() : null,
      preferences: {
        notifications: true,
        marketing_emails: true,
        language: 'es',
        timezone: 'America/Mexico_City',
      },
    };

    const [user] = await db('users')
      .insert(userData)
      .returning(['id', 'email', 'name', 'created_at', 'subscription_status']);

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        type: 'access' 
      },
      process.env.JWT_SECRET || 'iron-assistant-secret',
      { expiresIn: '7d' }
    );

    // Log successful registration
    logger.auth('user_registration', user.id, true, {
      email: user.email,
      name: user.name,
      method: 'email_password'
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          subscription_status: user.subscription_status,
          created_at: user.created_at,
        },
        token,
        expires_in: '7d',
      },
    });
  })
);

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login',
  loginLimiter,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError(errors);
    }

    const { email, password } = req.body;

    // Find user
    const user = await db('users')
      .where('email', email)
      .where('is_active', true)
      .first();

    if (!user || !user.password_hash) {
      logger.auth('login_attempt', null, false, { 
        email, 
        reason: 'user_not_found_or_no_password',
        ip: req.ip 
      });
      
      throw new APIError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      logger.auth('login_attempt', user.id, false, { 
        email, 
        reason: 'invalid_password',
        ip: req.ip 
      });
      
      throw new APIError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Update last login
    await db('users')
      .where('id', user.id)
      .update({ 
        last_login: new Date(),
        updated_at: new Date()
      });

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        type: 'access' 
      },
      process.env.JWT_SECRET || 'iron-assistant-secret',
      { expiresIn: '7d' }
    );

    // Get subscription info
    const subscription = await db('subscriptions')
      .where('user_id', user.id)
      .where('is_active', true)
      .where('current_period_end', '>', new Date())
      .first();

    logger.auth('login_success', user.id, true, {
      email: user.email,
      method: 'email_password',
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          subscription_status: subscription ? 'premium' : 'free',
          email_verified: user.email_verified,
          created_at: user.created_at,
          last_login: new Date(),
        },
        token,
        expires_in: '7d',
        subscription: subscription ? {
          plan_id: subscription.plan_id,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
        } : null,
      },
    });
  })
);

/**
 * POST /api/auth/firebase
 * Authenticate with Firebase ID token
 */
router.post('/firebase',
  loginLimiter,
  [
    body('idToken')
      .notEmpty()
      .withMessage('Firebase ID token is required'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError(errors);
    }

    const { idToken } = req.body;

    // Verify Firebase token
    const decodedToken = await verifyFirebaseToken(idToken);
    
    if (!decodedToken) {
      throw new APIError('Invalid Firebase token', 401, 'INVALID_FIREBASE_TOKEN');
    }

    // Get or create user
    let user = await db('users')
      .where('firebase_uid', decodedToken.uid)
      .first();

    if (!user) {
      // Create new user from Firebase data
      const userData = {
        firebase_uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified || false,
        name: decodedToken.name || null,
        picture: decodedToken.picture || null,
        provider: decodedToken.firebase.sign_in_provider,
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

      [user] = await db('users')
        .insert(userData)
        .returning('*');

      logger.auth('firebase_user_created', user.id, true, {
        firebase_uid: decodedToken.uid,
        email: decodedToken.email,
        provider: decodedToken.firebase.sign_in_provider
      });
    } else {
      // Update existing user last login
      await db('users')
        .where('id', user.id)
        .update({ 
          last_login: new Date(),
          updated_at: new Date()
        });

      logger.auth('firebase_login_success', user.id, true, {
        firebase_uid: decodedToken.uid,
        provider: decodedToken.firebase.sign_in_provider
      });
    }

    // Create JWT token for internal API calls
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        firebase_uid: user.firebase_uid,
        type: 'access' 
      },
      process.env.JWT_SECRET || 'iron-assistant-secret',
      { expiresIn: '7d' }
    );

    // Get subscription info
    const subscription = await db('subscriptions')
      .where('user_id', user.id)
      .where('is_active', true)
      .where('current_period_end', '>', new Date())
      .first();

    res.json({
      success: true,
      message: 'Firebase authentication successful',
      data: {
        user: {
          id: user.id,
          firebase_uid: user.firebase_uid,
          email: user.email,
          name: user.name,
          picture: user.picture,
          subscription_status: subscription ? 'premium' : 'free',
          email_verified: user.email_verified,
          provider: user.provider,
          created_at: user.created_at,
          last_login: new Date(),
        },
        token,
        expires_in: '7d',
        subscription: subscription ? {
          plan_id: subscription.plan_id,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
        } : null,
      },
    });
  })
);

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh',
  [
    body('token')
      .notEmpty()
      .withMessage('Refresh token is required'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError(errors);
    }

    const { token } = req.body;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'iron-assistant-secret');
      
      if (decoded.type !== 'access') {
        throw new APIError('Invalid token type', 401, 'INVALID_TOKEN_TYPE');
      }

      // Check if user still exists and is active
      const user = await db('users')
        .where('id', decoded.userId)
        .where('is_active', true)
        .first();

      if (!user) {
        throw new APIError('User not found or inactive', 401, 'USER_NOT_FOUND');
      }

      // Create new token
      const newToken = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          firebase_uid: user.firebase_uid,
          type: 'access' 
        },
        process.env.JWT_SECRET || 'iron-assistant-secret',
        { expiresIn: '7d' }
      );

      logger.auth('token_refresh', user.id, true);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: newToken,
          expires_in: '7d',
        },
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new APIError('Invalid or expired token', 401, 'INVALID_TOKEN');
      }
      throw error;
    }
  })
);

/**
 * POST /api/auth/logout
 * Logout user (invalidate session if using sessions)
 */
router.post('/logout',
  asyncHandler(async (req, res) => {
    // If using sessions, destroy session
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          logger.error('Session destruction failed:', err);
        }
      });
    }

    // Log logout event
    if (req.user) {
      logger.auth('logout', req.user.id, true);
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  })
);

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
router.post('/forgot-password',
  authLimiter,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createValidationError(errors);
    }

    const { email } = req.body;

    const user = await db('users')
      .where('email', email)
      .where('is_active', true)
      .first();

    // Always return success for security (don't reveal if email exists)
    if (user) {
      // Generate reset token
      const resetToken = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          type: 'password_reset' 
        },
        process.env.JWT_SECRET || 'iron-assistant-secret',
        { expiresIn: '1h' }
      );

      // Store reset token (implement token storage)
      await db('password_reset_tokens').insert({
        user_id: user.id,
        token: resetToken,
        expires_at: new Date(Date.now() + 3600000), // 1 hour
        created_at: new Date(),
      });

      // TODO: Send email with reset link
      logger.auth('password_reset_requested', user.id, true, { email });
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  })
);

module.exports = router;