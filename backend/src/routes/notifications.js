// backend/src/routes/notifications.js

const express = require('express');
const router = express.Router();
const { verifyAuth } = require('../middleware/auth');
const logger = require('../services/logger');
const { body, validationResult, query, param } = require('express-validator');

// Register push token
router.post('/register-token',
  verifyAuth,
  [
    body('push_token').notEmpty().trim(),
    body('platform').isIn(['ios', 'android', 'web']),
    body('device_id').optional().trim()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de token inválidos',
          errors: errors.array()
        });
      }

      const db = req.app.get('db');
      const { push_token, platform, device_id } = req.body;

      // Check if token already exists
      const existingToken = await db('user_push_tokens')
        .where('user_id', req.user.id)
        .where('push_token', push_token)
        .first();

      if (existingToken) {
        // Update existing token
        await db('user_push_tokens')
          .where('id', existingToken.id)
          .update({
            platform,
            device_id,
            is_active: true,
            updated_at: new Date()
          });

        logger.info('Push token updated', {
          userId: req.user.id,
          platform,
          tokenId: existingToken.id
        });
      } else {
        // Create new token
        const [tokenId] = await db('user_push_tokens').insert({
          user_id: req.user.id,
          push_token,
          platform,
          device_id,
          is_active: true,
          created_at: new Date()
        });

        logger.info('Push token registered', {
          userId: req.user.id,
          platform,
          tokenId
        });
      }

      res.json({
        success: true,
        message: 'Token de notificación registrado exitosamente'
      });
    } catch (error) {
      logger.error('Error registering push token', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }
);

// Remove push token
router.delete('/remove-token/:token',
  verifyAuth,
  [param('token').notEmpty()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Token inválido',
          errors: errors.array()
        });
      }

      const db = req.app.get('db');
      const { token } = req.params;

      await db('user_push_tokens')
        .where('user_id', req.user.id)
        .where('push_token', token)
        .update({ is_active: false });

      logger.info('Push token removed', {
        userId: req.user.id,
        token: token.substring(0, 10) + '...'
      });

      res.json({
        success: true,
        message: 'Token de notificación removido exitosamente'
      });
    } catch (error) {
      logger.error('Error removing push token', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }
);

// Get user notifications
router.get('/',
  verifyAuth,
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
    query('status').optional().isIn(['all', 'read', 'unread']),
    query('type').optional().isString()
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
      const { 
        limit = 20, 
        offset = 0, 
        status = 'all', 
        type 
      } = req.query;

      let query = db('user_notifications')
        .select('*')
        .where('user_id', req.user.id)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);

      if (status !== 'all') {
        query = query.where('is_read', status === 'read');
      }

      if (type) {
        query = query.where('notification_type', type);
      }

      const notifications = await query;

      // Count unread notifications
      const unreadCount = await db('user_notifications')
        .count('* as count')
        .where('user_id', req.user.id)
        .where('is_read', false)
        .first();

      // Parse JSON data
      notifications.forEach(notification => {
        if (notification.data) {
          try {
            notification.data = JSON.parse(notification.data);
          } catch (e) {
            notification.data = {};
          }
        }
      });

      logger.info('Notifications retrieved', {
        userId: req.user.id,
        count: notifications.length,
        unreadCount: unreadCount.count
      });

      res.json({
        success: true,
        data: {
          notifications,
          unread_count: parseInt(unreadCount.count),
          total_returned: notifications.length
        }
      });
    } catch (error) {
      logger.error('Error retrieving notifications', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }
);

// Mark notification as read
router.put('/:notificationId/read',
  verifyAuth,
  [param('notificationId').isInt().toInt()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'ID de notificación inválido',
          errors: errors.array()
        });
      }

      const db = req.app.get('db');
      const { notificationId } = req.params;

      const result = await db('user_notifications')
        .where('id', notificationId)
        .where('user_id', req.user.id)
        .update({ is_read: true, read_at: new Date() });

      if (result === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada'
        });
      }

      logger.info('Notification marked as read', {
        userId: req.user.id,
        notificationId
      });

      res.json({
        success: true,
        message: 'Notificación marcada como leída'
      });
    } catch (error) {
      logger.error('Error marking notification as read', {
        error: error.message,
        userId: req.user?.id,
        notificationId: req.params.notificationId
      });
      next(error);
    }
  }
);

// Mark all notifications as read
router.put('/read-all',
  verifyAuth,
  async (req, res, next) => {
    try {
      const db = req.app.get('db');

      const result = await db('user_notifications')
        .where('user_id', req.user.id)
        .where('is_read', false)
        .update({ is_read: true, read_at: new Date() });

      logger.info('All notifications marked as read', {
        userId: req.user.id,
        count: result
      });

      res.json({
        success: true,
        message: `${result} notificaciones marcadas como leídas`
      });
    } catch (error) {
      logger.error('Error marking all notifications as read', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }
);

// Delete notification
router.delete('/:notificationId',
  verifyAuth,
  [param('notificationId').isInt().toInt()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'ID de notificación inválido',
          errors: errors.array()
        });
      }

      const db = req.app.get('db');
      const { notificationId } = req.params;

      const result = await db('user_notifications')
        .where('id', notificationId)
        .where('user_id', req.user.id)
        .delete();

      if (result === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada'
        });
      }

      logger.info('Notification deleted', {
        userId: req.user.id,
        notificationId
      });

      res.json({
        success: true,
        message: 'Notificación eliminada exitosamente'
      });
    } catch (error) {
      logger.error('Error deleting notification', {
        error: error.message,
        userId: req.user?.id,
        notificationId: req.params.notificationId
      });
      next(error);
    }
  }
);

// Send manual notification (Admin only - would need admin middleware)
router.post('/send',
  verifyAuth,
  [
    body('user_ids').optional().isArray(),
    body('title').isLength({ min: 1, max: 100 }).trim(),
    body('body').isLength({ min: 1, max: 500 }).trim(),
    body('type').isIn(['system', 'workout', 'achievement', 'social', 'promotion']),
    body('data').optional().isObject(),
    body('send_push').optional().isBoolean()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de notificación inválidos',
          errors: errors.array()
        });
      }

      // TODO: Add admin role check
      // if (req.user.role !== 'admin') {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Acceso denegado'
      //   });
      // }

      const db = req.app.get('db');
      const {
        user_ids = [req.user.id], // Default to self for testing
        title,
        body,
        type,
        data = {},
        send_push = true
      } = req.body;

      const notifications = user_ids.map(userId => ({
        user_id: userId,
        notification_type: type,
        title,
        body,
        data: JSON.stringify(data),
        is_read: false,
        created_at: new Date()
      }));

      const insertedIds = await db('user_notifications').insert(notifications);

      // TODO: Implement actual push notification sending
      if (send_push) {
        logger.info('Push notifications would be sent here', {
          userIds: user_ids,
          title,
          type
        });
      }

      logger.info('Manual notifications sent', {
        senderId: req.user.id,
        recipientCount: user_ids.length,
        type
      });

      res.status(201).json({
        success: true,
        message: `Notificación enviada a ${user_ids.length} usuario(s)`,
        data: { notification_ids: insertedIds }
      });
    } catch (error) {
      logger.error('Error sending manual notification', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }
);

// Get notification settings
router.get('/settings',
  verifyAuth,
  async (req, res, next) => {
    try {
      const db = req.app.get('db');

      const preferences = await db('user_preferences')
        .select('notification_settings')
        .where('user_id', req.user.id)
        .first();

      let notificationSettings = {
        workout_reminders: true,
        achievement_notifications: true,
        social_notifications: true,
        promotional_notifications: false,
        quiet_hours: {
          enabled: false,
          start_time: '22:00',
          end_time: '08:00'
        }
      };

      if (preferences && preferences.notification_settings) {
        try {
          const storedSettings = JSON.parse(preferences.notification_settings);
          notificationSettings = { ...notificationSettings, ...storedSettings };
        } catch (e) {
          logger.warn('Invalid notification settings JSON', {
            userId: req.user.id
          });
        }
      }

      res.json({
        success: true,
        data: { notification_settings: notificationSettings }
      });
    } catch (error) {
      logger.error('Error retrieving notification settings', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }
);

// Update notification settings
router.put('/settings',
  verifyAuth,
  [
    body('workout_reminders').optional().isBoolean(),
    body('achievement_notifications').optional().isBoolean(),
    body('social_notifications').optional().isBoolean(),
    body('promotional_notifications').optional().isBoolean(),
    body('quiet_hours').optional().isObject(),
    body('quiet_hours.enabled').optional().isBoolean(),
    body('quiet_hours.start_time').optional().matches(/^[0-2][0-9]:[0-5][0-9]$/),
    body('quiet_hours.end_time').optional().matches(/^[0-2][0-9]:[0-5][0-9]$/)
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Configuración de notificaciones inválida',
          errors: errors.array()
        });
      }

      const db = req.app.get('db');
      const notificationSettings = req.body;

      const existingPreferences = await db('user_preferences')
        .where('user_id', req.user.id)
        .first();

      if (existingPreferences) {
        await db('user_preferences')
          .where('user_id', req.user.id)
          .update({
            notification_settings: JSON.stringify(notificationSettings)
          });
      } else {
        await db('user_preferences').insert({
          user_id: req.user.id,
          notification_settings: JSON.stringify(notificationSettings)
        });
      }

      logger.info('Notification settings updated', {
        userId: req.user.id,
        settings: Object.keys(notificationSettings)
      });

      res.json({
        success: true,
        message: 'Configuración de notificaciones actualizada exitosamente'
      });
    } catch (error) {
      logger.error('Error updating notification settings', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }
);

// Schedule workout reminder
router.post('/schedule-reminder',
  verifyAuth,
  [
    body('title').isLength({ min: 1, max: 100 }).trim(),
    body('body').isLength({ min: 1, max: 300 }).trim(),
    body('scheduled_for').isISO8601(),
    body('repeat').optional().isIn(['daily', 'weekly', 'none'])
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de recordatorio inválidos',
          errors: errors.array()
        });
      }

      const db = req.app.get('db');
      const {
        title,
        body,
        scheduled_for,
        repeat = 'none'
      } = req.body;

      // Check if scheduled time is in the future
      const scheduledTime = new Date(scheduled_for);
      if (scheduledTime <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'La hora programada debe ser en el futuro'
        });
      }

      const [reminderId] = await db('scheduled_notifications').insert({
        user_id: req.user.id,
        notification_type: 'workout',
        title,
        body,
        scheduled_for: scheduledTime,
        repeat_pattern: repeat,
        is_active: true,
        created_at: new Date()
      });

      logger.info('Workout reminder scheduled', {
        userId: req.user.id,
        reminderId,
        scheduledFor: scheduledTime,
        repeat
      });

      res.status(201).json({
        success: true,
        message: 'Recordatorio programado exitosamente',
        data: { reminder_id: reminderId }
      });
    } catch (error) {
      logger.error('Error scheduling reminder', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }
);

// Get scheduled reminders
router.get('/reminders',
  verifyAuth,
  async (req, res, next) => {
    try {
      const db = req.app.get('db');

      const reminders = await db('scheduled_notifications')
        .select('*')
        .where('user_id', req.user.id)
        .where('is_active', true)
        .orderBy('scheduled_for', 'asc');

      logger.info('Scheduled reminders retrieved', {
        userId: req.user.id,
        count: reminders.length
      });

      res.json({
        success: true,
        data: { reminders }
      });
    } catch (error) {
      logger.error('Error retrieving reminders', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }
);

// Cancel scheduled reminder
router.delete('/reminders/:reminderId',
  verifyAuth,
  [param('reminderId').isInt().toInt()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'ID de recordatorio inválido',
          errors: errors.array()
        });
      }

      const db = req.app.get('db');
      const { reminderId } = req.params;

      const result = await db('scheduled_notifications')
        .where('id', reminderId)
        .where('user_id', req.user.id)
        .update({ is_active: false });

      if (result === 0) {
        return res.status(404).json({
          success: false,
          message: 'Recordatorio no encontrado'
        });
      }

      logger.info('Scheduled reminder cancelled', {
        userId: req.user.id,
        reminderId
      });

      res.json({
        success: true,
        message: 'Recordatorio cancelado exitosamente'
      });
    } catch (error) {
      logger.error('Error cancelling reminder', {
        error: error.message,
        userId: req.user?.id,
        reminderId: req.params.reminderId
      });
      next(error);
    }
  }
);

module.exports = router;