// backend/src/routes/analytics.js

const express = require('express');
const router = express.Router();
const { verifyAuth, requirePremium } = require('../middleware/auth');
const logger = require('../services/logger');
const { body, validationResult, query } = require('express-validator');

// Record user metric
router.post('/metrics',
  verifyAuth,
  [
    body('type').isIn([
      'workout_completed', 'exercise_completed', 'weight_lifted',
      'calories_burned', 'workout_duration', 'heart_rate',
      'steps', 'distance', 'sleep_hours', 'weight', 'body_fat',
      'muscle_mass', 'app_open', 'screen_view', 'feature_used'
    ]),
    body('value').isFloat(),
    body('unit').optional().isLength({ max: 20 }),
    body('metadata').optional().isObject(),
    body('recorded_at').optional().isISO8601()
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
      const { type, value, unit, metadata, recorded_at } = req.body;

      const [metricId] = await db('user_metrics').insert({
        user_id: req.user.id,
        metric_type: type,
        value: parseFloat(value),
        unit: unit || '',
        metadata: metadata ? JSON.stringify(metadata) : null,
        recorded_at: recorded_at ? new Date(recorded_at) : new Date()
      });

      logger.info('Metric recorded', {
        userId: req.user.id,
        metricId,
        type,
        value
      });

      res.status(201).json({
        success: true,
        message: 'Métrica registrada exitosamente',
        data: { metricId }
      });
    } catch (error) {
      logger.error('Error recording metric', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }
);

// Get user metrics with filtering
router.get('/metrics',
  verifyAuth,
  [
    query('type').optional().isString(),
    query('start_date').optional().isISO8601(),
    query('end_date').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 1000 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt()
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
        type,
        start_date,
        end_date,
        limit = 100,
        offset = 0
      } = req.query;

      let query = db('user_metrics')
        .select('*')
        .where('user_id', req.user.id)
        .orderBy('recorded_at', 'desc')
        .limit(limit)
        .offset(offset);

      if (type) {
        query = query.where('metric_type', type);
      }

      if (start_date) {
        query = query.where('recorded_at', '>=', new Date(start_date));
      }

      if (end_date) {
        query = query.where('recorded_at', '<=', new Date(end_date));
      }

      const metrics = await query;

      // Parse JSON metadata
      metrics.forEach(metric => {
        if (metric.metadata) {
          try {
            metric.metadata = JSON.parse(metric.metadata);
          } catch (e) {
            metric.metadata = {};
          }
        }
      });

      logger.info('Metrics retrieved', {
        userId: req.user.id,
        count: metrics.length,
        type,
        dateRange: start_date && end_date ? `${start_date} - ${end_date}` : 'all'
      });

      res.json({
        success: true,
        data: { metrics }
      });
    } catch (error) {
      logger.error('Error retrieving metrics', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }
);

// Get workout statistics
router.get('/workout-stats',
  verifyAuth,
  [
    query('period').optional().isIn(['week', 'month', 'quarter', 'year']),
    query('start_date').optional().isISO8601(),
    query('end_date').optional().isISO8601()
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
      const { period, start_date, end_date } = req.query;

      let startDate, endDate;

      if (start_date && end_date) {
        startDate = new Date(start_date);
        endDate = new Date(end_date);
      } else {
        endDate = new Date();
        startDate = new Date();

        switch (period || 'month') {
          case 'week':
            startDate.setDate(endDate.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(endDate.getMonth() - 1);
            break;
          case 'quarter':
            startDate.setMonth(endDate.getMonth() - 3);
            break;
          case 'year':
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
        }
      }

      // Basic workout statistics
      const basicStats = await db('workout_sessions')
        .where('user_id', req.user.id)
        .where('status', 'completed')
        .where('completed_at', '>=', startDate)
        .where('completed_at', '<=', endDate)
        .select(
          db.raw('COUNT(*) as total_workouts'),
          db.raw('SUM(duration_minutes) as total_minutes'),
          db.raw('AVG(duration_minutes) as avg_duration'),
          db.raw('SUM(total_calories) as total_calories')
        )
        .first();

      // Current streak calculation
      const recentWorkouts = await db('workout_sessions')
        .select('completed_at')
        .where('user_id', req.user.id)
        .where('status', 'completed')
        .orderBy('completed_at', 'desc')
        .limit(30);

      let currentStreak = 0;
      let lastWorkoutDate = null;

      for (const workout of recentWorkouts) {
        const workoutDate = new Date(workout.completed_at);
        const daysDiff = lastWorkoutDate ? 
          Math.floor((lastWorkoutDate - workoutDate) / (1000 * 60 * 60 * 24)) : 0;

        if (lastWorkoutDate === null || daysDiff === 1) {
          currentStreak++;
          lastWorkoutDate = workoutDate;
        } else if (daysDiff > 1) {
          break;
        }
      }

      // Weight lifted total
      const weightStats = await db('workout_records')
        .join('workout_sessions', 'workout_records.session_id', 'workout_sessions.id')
        .where('workout_sessions.user_id', req.user.id)
        .where('workout_sessions.status', 'completed')
        .where('workout_sessions.completed_at', '>=', startDate)
        .where('workout_sessions.completed_at', '<=', endDate)
        .select('workout_records.sets_data')
        .then(records => {
          let totalWeight = 0;
          records.forEach(record => {
            try {
              const sets = JSON.parse(record.sets_data);
              sets.forEach(set => {
                if (set.weight && set.reps && set.completed) {
                  totalWeight += set.weight * set.reps;
                }
              });
            } catch (e) {
              // Skip invalid JSON
            }
          });
          return totalWeight;
        });

      logger.info('Workout statistics retrieved', {
        userId: req.user.id,
        period: period || 'custom',
        dateRange: `${startDate.toISOString()} - ${endDate.toISOString()}`,
        totalWorkouts: basicStats.total_workouts
      });

      res.json({
        success: true,
        data: {
          period: period || 'custom',
          date_range: {
            start: startDate,
            end: endDate
          },
          total_workouts: parseInt(basicStats.total_workouts) || 0,
          total_minutes: parseInt(basicStats.total_minutes) || 0,
          avg_duration: Math.round(parseFloat(basicStats.avg_duration)) || 0,
          total_calories_burned: parseInt(basicStats.total_calories) || 0,
          total_weight_lifted: Math.round(weightStats),
          current_streak: currentStreak
        }
      });
    } catch (error) {
      logger.error('Error retrieving workout statistics', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }
);

// Get progress data for charts
router.get('/progress',
  verifyAuth,
  [
    query('metric').optional().isIn(['workouts', 'weight', 'calories', 'duration']),
    query('period').optional().isIn(['week', 'month', 'quarter', 'year']),
    query('groupBy').optional().isIn(['day', 'week', 'month'])
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
        metric = 'workouts',
        period = 'month',
        groupBy = 'day'
      } = req.query;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();

      switch (period) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      let dateFormat;
      switch (groupBy) {
        case 'day':
          dateFormat = '%Y-%m-%d';
          break;
        case 'week':
          dateFormat = '%Y-%u';
          break;
        case 'month':
          dateFormat = '%Y-%m';
          break;
        default:
          dateFormat = '%Y-%m-%d';
      }

      let query;
      let valueColumn;

      switch (metric) {
        case 'workouts':
          query = db('workout_sessions')
            .where('user_id', req.user.id)
            .where('status', 'completed')
            .where('completed_at', '>=', startDate)
            .where('completed_at', '<=', endDate)
            .select(
              db.raw(`DATE_FORMAT(completed_at, '${dateFormat}') as date_group`),
              db.raw('COUNT(*) as value')
            )
            .groupBy('date_group')
            .orderBy('date_group');
          break;

        case 'weight':
          query = db('user_metrics')
            .where('user_id', req.user.id)
            .where('metric_type', 'weight')
            .where('recorded_at', '>=', startDate)
            .where('recorded_at', '<=', endDate)
            .select(
              db.raw(`DATE_FORMAT(recorded_at, '${dateFormat}') as date_group`),
              db.raw('AVG(value) as value')
            )
            .groupBy('date_group')
            .orderBy('date_group');
          break;

        case 'calories':
          query = db('workout_sessions')
            .where('user_id', req.user.id)
            .where('status', 'completed')
            .where('completed_at', '>=', startDate)
            .where('completed_at', '<=', endDate)
            .whereNotNull('total_calories')
            .select(
              db.raw(`DATE_FORMAT(completed_at, '${dateFormat}') as date_group`),
              db.raw('SUM(total_calories) as value')
            )
            .groupBy('date_group')
            .orderBy('date_group');
          break;

        case 'duration':
          query = db('workout_sessions')
            .where('user_id', req.user.id)
            .where('status', 'completed')
            .where('completed_at', '>=', startDate)
            .where('completed_at', '<=', endDate)
            .select(
              db.raw(`DATE_FORMAT(completed_at, '${dateFormat}') as date_group`),
              db.raw('SUM(duration_minutes) as value')
            )
            .groupBy('date_group')
            .orderBy('date_group');
          break;

        default:
          throw new Error('Métrica no válida');
      }

      const progressData = await query;

      // Format the response
      const formattedData = progressData.map(row => ({
        date: row.date_group,
        value: parseFloat(row.value) || 0
      }));

      logger.info('Progress data retrieved', {
        userId: req.user.id,
        metric,
        period,
        groupBy,
        dataPoints: formattedData.length
      });

      res.json({
        success: true,
        data: {
          metric,
          period,
          group_by: groupBy,
          date_range: {
            start: startDate,
            end: endDate
          },
          progress: formattedData
        }
      });
    } catch (error) {
      logger.error('Error retrieving progress data', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }
);

// Get AI insights (Premium feature)
router.get('/insights',
  verifyAuth,
  requirePremium,
  [
    query('category').optional().isIn(['all', 'performance', 'health', 'nutrition', 'recovery']),
    query('priority').optional().isIn(['all', 'high', 'medium', 'low'])
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

      // This is a simplified version - in production you would
      // integrate with OpenAI or another AI service to generate insights
      const mockInsights = [
        {
          id: 1,
          type: 'performance',
          priority: 'high',
          title: 'Mejora en Fuerza Detectada',
          content: 'Has aumentado tu peso en press de banca en un 15% en las últimas 2 semanas. ¡Excelente progreso!',
          actionable: true,
          generated_at: new Date(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        },
        {
          id: 2,
          type: 'health',
          priority: 'medium',
          title: 'Patrón de Sueño',
          content: 'Tu rendimiento mejora 20% cuando duermes más de 7 horas. Considera priorizar tu descanso.',
          actionable: true,
          generated_at: new Date(),
          expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
        },
        {
          id: 3,
          type: 'nutrition',
          priority: 'low',
          title: 'Hidratación',
          content: 'Recuerda mantener una hidratación adecuada durante tus entrenamientos intensos.',
          actionable: false,
          generated_at: new Date(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      ];

      const { category = 'all', priority = 'all' } = req.query;

      let filteredInsights = mockInsights;

      if (category !== 'all') {
        filteredInsights = filteredInsights.filter(insight => insight.type === category);
      }

      if (priority !== 'all') {
        filteredInsights = filteredInsights.filter(insight => insight.priority === priority);
      }

      logger.info('AI insights retrieved', {
        userId: req.user.id,
        category,
        priority,
        count: filteredInsights.length
      });

      res.json({
        success: true,
        data: { insights: filteredInsights }
      });
    } catch (error) {
      logger.error('Error retrieving AI insights', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }
);

// Mark insight as read/dismissed
router.put('/insights/:insightId/dismiss',
  verifyAuth,
  requirePremium,
  async (req, res, next) => {
    try {
      // In a real implementation, you would update the insight status
      // For now, just log the action
      logger.info('Insight dismissed', {
        userId: req.user.id,
        insightId: req.params.insightId
      });

      res.json({
        success: true,
        message: 'Insight marcado como leído'
      });
    } catch (error) {
      logger.error('Error dismissing insight', {
        error: error.message,
        userId: req.user?.id,
        insightId: req.params.insightId
      });
      next(error);
    }
  }
);

// Get health metrics summary
router.get('/health-summary',
  verifyAuth,
  async (req, res, next) => {
    try {
      const db = req.app.get('db');

      // Get latest metrics of each type
      const latestMetrics = await db('user_metrics')
        .select('metric_type', 'value', 'unit', 'recorded_at')
        .where('user_id', req.user.id)
        .whereIn('metric_type', ['weight', 'body_fat', 'muscle_mass', 'heart_rate', 'steps', 'sleep_hours'])
        .whereIn(
          'recorded_at',
          db('user_metrics')
            .select(db.raw('MAX(recorded_at)'))
            .where('user_id', req.user.id)
            .groupBy('metric_type')
        );

      // Format as object for easier consumption
      const healthMetrics = {};
      latestMetrics.forEach(metric => {
        healthMetrics[metric.metric_type] = {
          value: metric.value,
          unit: metric.unit,
          recorded_at: metric.recorded_at
        };
      });

      logger.info('Health summary retrieved', {
        userId: req.user.id,
        metricsCount: latestMetrics.length
      });

      res.json({
        success: true,
        data: { health_metrics: healthMetrics }
      });
    } catch (error) {
      logger.error('Error retrieving health summary', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }
);

module.exports = router;