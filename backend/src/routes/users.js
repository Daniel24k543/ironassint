// backend/src/routes/users.js

const express = require('express');
const router = express.Router();
const { verifyAuth, requirePremium } = require('../middleware/auth');
const logger = require('../services/logger');
const { body, validationResult, param, query } = require('express-validator');

// Get user profile
router.get('/profile', verifyAuth, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    
    const [user] = await db('users')
      .leftJoin('user_profiles', 'users.id', 'user_profiles.user_id')
      .select(
        'users.id',
        'users.email',
        'users.display_name',
        'users.firebase_uid',
        'users.premium_status',
        'users.created_at',
        'user_profiles.age',
        'user_profiles.height',
        'user_profiles.weight',
        'user_profiles.gender',
        'user_profiles.fitness_level',
        'user_profiles.goals',
        'user_profiles.profile_picture_url',
        'user_profiles.bio',
        'user_profiles.location'
      )
      .where('users.id', req.user.id)
      .first();

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    // Parse JSON fields
    user.goals = user.goals ? JSON.parse(user.goals) : [];

    logger.info('User profile retrieved', { userId: user.id });

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Error retrieving user profile', { 
      error: error.message, 
      userId: req.user?.id 
    });
    next(error);
  }
});

// Update user profile
router.put('/profile', 
  verifyAuth,
  [
    body('displayName').optional().isLength({ min: 2, max: 50 }).trim(),
    body('age').optional().isInt({ min: 13, max: 120 }),
    body('height').optional().isFloat({ min: 50, max: 250 }),
    body('weight').optional().isFloat({ min: 20, max: 500 }),
    body('gender').optional().isIn(['male', 'female', 'other']),
    body('fitnessLevel').optional().isIn(['beginner', 'intermediate', 'advanced']),
    body('goals').optional().isArray(),
    body('bio').optional().isLength({ max: 500 }).trim(),
    body('location').optional().isLength({ max: 100 }).trim()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Datos de entrada inválidos',
          errors: errors.array() 
        });
      }

      const db = req.app.get('db');
      const userId = req.user.id;

      const {
        displayName,
        age,
        height,
        weight,
        gender,
        fitnessLevel,
        goals,
        bio,
        location
      } = req.body;

      await db.transaction(async (trx) => {
        // Update users table
        const userUpdates = {};
        if (displayName !== undefined) userUpdates.display_name = displayName;

        if (Object.keys(userUpdates).length > 0) {
          await trx('users')
            .where('id', userId)
            .update(userUpdates);
        }

        // Update or insert user_profiles
        const profileUpdates = {};
        if (age !== undefined) profileUpdates.age = age;
        if (height !== undefined) profileUpdates.height = height;
        if (weight !== undefined) profileUpdates.weight = weight;
        if (gender !== undefined) profileUpdates.gender = gender;
        if (fitnessLevel !== undefined) profileUpdates.fitness_level = fitnessLevel;
        if (goals !== undefined) profileUpdates.goals = JSON.stringify(goals);
        if (bio !== undefined) profileUpdates.bio = bio;
        if (location !== undefined) profileUpdates.location = location;

        if (Object.keys(profileUpdates).length > 0) {
          const existingProfile = await trx('user_profiles')
            .where('user_id', userId)
            .first();

          if (existingProfile) {
            await trx('user_profiles')
              .where('user_id', userId)
              .update(profileUpdates);
          } else {
            await trx('user_profiles')
              .insert({
                user_id: userId,
                ...profileUpdates
              });
          }
        }
      });

      logger.info('User profile updated', { userId, updates: Object.keys(req.body) });

      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente'
      });
    } catch (error) {
      logger.error('Error updating user profile', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }
);

// Upload profile picture
router.post('/profile/picture', 
  verifyAuth,
  // TODO: Add multer middleware for file upload
  async (req, res, next) => {
    try {
      // Placeholder for profile picture upload
      // In production, you would:
      // 1. Use multer to handle file upload
      // 2. Validate file type and size
      // 3. Upload to cloud storage (AWS S3, Cloudinary, etc.)
      // 4. Update user profile with new URL

      res.status(501).json({
        success: false,
        message: 'Subida de imagen no implementada aún'
      });
    } catch (error) {
      logger.error('Error uploading profile picture', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }
);

// Get user achievements
router.get('/achievements', verifyAuth, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    
    const achievements = await db('user_achievements')
      .join('achievements', 'user_achievements.achievement_id', 'achievements.id')
      .select(
        'achievements.id',
        'achievements.name',
        'achievements.description',
        'achievements.icon',
        'achievements.category',
        'achievements.tier',
        'achievements.points',
        'user_achievements.earned_at',
        'user_achievements.progress'
      )
      .where('user_achievements.user_id', req.user.id)
      .orderBy('user_achievements.earned_at', 'desc');

    const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);

    logger.info('User achievements retrieved', { 
      userId: req.user.id, 
      count: achievements.length 
    });

    res.json({
      success: true,
      data: { 
        achievements,
        totalPoints,
        count: achievements.length
      }
    });
  } catch (error) {
    logger.error('Error retrieving user achievements', { 
      error: error.message, 
      userId: req.user?.id 
    });
    next(error);
  }
});

// Get user metrics history
router.get('/metrics', 
  verifyAuth,
  [
    query('type').optional().isIn(['weight', 'body_fat', 'muscle_mass', 'heart_rate', 'steps', 'sleep']),
    query('period').optional().isInt({ min: 1, max: 365 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Parámetros de consulta inválidos',
          errors: errors.array() 
        });
      }

      const db = req.app.get('db');
      const { type, period = 30, limit = 50 } = req.query;

      let query = db('user_metrics')
        .select('*')
        .where('user_id', req.user.id)
        .orderBy('recorded_at', 'desc')
        .limit(parseInt(limit));

      if (type) {
        query = query.where('metric_type', type);
      }

      if (period) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));
        query = query.where('recorded_at', '>=', startDate);
      }

      const metrics = await query;

      logger.info('User metrics retrieved', { 
        userId: req.user.id, 
        type, 
        period, 
        count: metrics.length 
      });

      res.json({
        success: true,
        data: { metrics }
      });
    } catch (error) {
      logger.error('Error retrieving user metrics', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }
);

// Record user metric
router.post('/metrics',
  verifyAuth,
  [
    body('type').isIn(['weight', 'body_fat', 'muscle_mass', 'heart_rate', 'steps', 'sleep']),
    body('value').isFloat({ min: 0 }),
    body('unit').isLength({ min: 1, max: 20 }).trim(),
    body('notes').optional().isLength({ max: 500 }).trim()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Datos de métrica inválidos',
          errors: errors.array() 
        });
      }

      const db = req.app.get('db');
      const { type, value, unit, notes } = req.body;

      const [metricId] = await db('user_metrics').insert({
        user_id: req.user.id,
        metric_type: type,
        value: parseFloat(value),
        unit,
        notes,
        recorded_at: new Date()
      });

      logger.info('User metric recorded', { 
        userId: req.user.id, 
        type, 
        value, 
        metricId 
      });

      res.status(201).json({
        success: true,
        message: 'Métrica registrada exitosamente',
        data: { metricId }
      });
    } catch (error) {
      logger.error('Error recording user metric', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }
);

// Get user preferences
router.get('/preferences', verifyAuth, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    
    const preferences = await db('user_preferences')
      .select('*')
      .where('user_id', req.user.id)
      .first();

    if (!preferences) {
      // Return default preferences
      const defaultPreferences = {
        notifications_enabled: true,
        workout_reminders: true,
        achievement_notifications: true,
        email_updates: false,
        theme: 'dark',
        units: 'metric',
        privacy_level: 'public'
      };

      res.json({
        success: true,
        data: { preferences: defaultPreferences }
      });
    } else {
      // Parse JSON fields
      const parsedPreferences = {
        ...preferences,
        notification_settings: preferences.notification_settings ? 
          JSON.parse(preferences.notification_settings) : {},
        privacy_settings: preferences.privacy_settings ? 
          JSON.parse(preferences.privacy_settings) : {}
      };

      res.json({
        success: true,
        data: { preferences: parsedPreferences }
      });
    }

    logger.info('User preferences retrieved', { userId: req.user.id });
  } catch (error) {
    logger.error('Error retrieving user preferences', { 
      error: error.message, 
      userId: req.user?.id 
    });
    next(error);
  }
});

// Update user preferences
router.put('/preferences',
  verifyAuth,
  [
    body('notifications_enabled').optional().isBoolean(),
    body('workout_reminders').optional().isBoolean(),
    body('achievement_notifications').optional().isBoolean(),
    body('email_updates').optional().isBoolean(),
    body('theme').optional().isIn(['light', 'dark', 'auto']),
    body('units').optional().isIn(['metric', 'imperial']),
    body('privacy_level').optional().isIn(['public', 'friends', 'private']),
    body('notification_settings').optional().isObject(),
    body('privacy_settings').optional().isObject()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Preferencias inválidas',
          errors: errors.array() 
        });
      }

      const db = req.app.get('db');
      const userId = req.user.id;

      const updates = { ...req.body };
      
      // Stringify JSON fields
      if (updates.notification_settings) {
        updates.notification_settings = JSON.stringify(updates.notification_settings);
      }
      if (updates.privacy_settings) {
        updates.privacy_settings = JSON.stringify(updates.privacy_settings);
      }

      const existingPreferences = await db('user_preferences')
        .where('user_id', userId)
        .first();

      if (existingPreferences) {
        await db('user_preferences')
          .where('user_id', userId)
          .update(updates);
      } else {
        await db('user_preferences')
          .insert({
            user_id: userId,
            ...updates
          });
      }

      logger.info('User preferences updated', { 
        userId, 
        updates: Object.keys(updates) 
      });

      res.json({
        success: true,
        message: 'Preferencias actualizadas exitosamente'
      });
    } catch (error) {
      logger.error('Error updating user preferences', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }
);

// Delete user account
router.delete('/account',
  verifyAuth,
  [
    body('confirmation').equals('DELETE_ACCOUNT')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Confirmación requerida. Escriba "DELETE_ACCOUNT"' 
        });
      }

      const db = req.app.get('db');
      const userId = req.user.id;

      // Soft delete - mark as deleted instead of actually removing
      await db('users')
        .where('id', userId)
        .update({
          deleted_at: new Date(),
          email: `deleted_${userId}_${Date.now()}@deleted.com`,
          display_name: 'Usuario Eliminado'
        });

      logger.warn('User account deleted', { userId, firebaseUid: req.user.firebaseUid });

      res.json({
        success: true,
        message: 'Cuenta eliminada exitosamente'
      });
    } catch (error) {
      logger.error('Error deleting user account', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }
);

module.exports = router;