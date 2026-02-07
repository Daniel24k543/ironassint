// backend/src/routes/workouts.js

const express = require('express');
const router = express.Router();
const { verifyAuth, requirePremium } = require('../middleware/auth');
const logger = require('../services/logger');
const { body, validationResult, param, query } = require('express-validator');

// Get all exercises
router.get('/exercises', verifyAuth, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const { category, muscle_group, difficulty } = req.query;

    let query = db('exercises').select('*');

    if (category) {
      query = query.where('category', category);
    }
    if (muscle_group) {
      query = query.where('muscle_groups', 'like', `%${muscle_group}%`);
    }
    if (difficulty) {
      query = query.where('difficulty_level', difficulty);
    }

    const exercises = await query.orderBy('name');

    // Parse JSON fields
    exercises.forEach(exercise => {
      exercise.muscle_groups = exercise.muscle_groups ? JSON.parse(exercise.muscle_groups) : [];
      exercise.instructions = exercise.instructions ? JSON.parse(exercise.instructions) : [];
    });

    logger.info('Exercises retrieved', { 
      userId: req.user.id, 
      count: exercises.length,
      filters: { category, muscle_group, difficulty }
    });

    res.json({
      success: true,
      data: { exercises }
    });
  } catch (error) {
    logger.error('Error retrieving exercises', { 
      error: error.message, 
      userId: req.user?.id 
    });
    next(error);
  }
});

// Get user's workout routines
router.get('/routines', verifyAuth, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    
    const routines = await db('workout_routines')
      .leftJoin('routine_exercises', 'workout_routines.id', 'routine_exercises.routine_id')
      .leftJoin('exercises', 'routine_exercises.exercise_id', 'exercises.id')
      .select(
        'workout_routines.id',
        'workout_routines.name',
        'workout_routines.description',
        'workout_routines.difficulty_level',
        'workout_routines.estimated_duration',
        'workout_routines.is_public',
        'workout_routines.created_at',
        db.raw('COUNT(routine_exercises.id) as exercise_count')
      )
      .where('workout_routines.user_id', req.user.id)
      .where('workout_routines.deleted_at', null)
      .groupBy('workout_routines.id')
      .orderBy('workout_routines.created_at', 'desc');

    logger.info('User routines retrieved', { 
      userId: req.user.id, 
      count: routines.length 
    });

    res.json({
      success: true,
      data: { routines }
    });
  } catch (error) {
    logger.error('Error retrieving user routines', { 
      error: error.message, 
      userId: req.user?.id 
    });
    next(error);
  }
});

// Get specific routine with exercises
router.get('/routines/:id', 
  verifyAuth,
  [param('id').isInt().toInt()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID de rutina inválido',
          errors: errors.array() 
        });
      }

      const db = req.app.get('db');
      const routineId = req.params.id;

      const routine = await db('workout_routines')
        .select('*')
        .where('id', routineId)
        .where('user_id', req.user.id)
        .where('deleted_at', null)
        .first();

      if (!routine) {
        return res.status(404).json({ 
          success: false, 
          message: 'Rutina no encontrada' 
        });
      }

      const exercises = await db('routine_exercises')
        .join('exercises', 'routine_exercises.exercise_id', 'exercises.id')
        .select(
          'exercises.id',
          'exercises.name',
          'exercises.description',
          'exercises.category',
          'exercises.muscle_groups',
          'exercises.instructions',
          'exercises.video_url',
          'exercises.image_url',
          'routine_exercises.sets',
          'routine_exercises.reps',
          'routine_exercises.weight',
          'routine_exercises.duration_seconds',
          'routine_exercises.rest_seconds',
          'routine_exercises.order_index',
          'routine_exercises.notes'
        )
        .where('routine_exercises.routine_id', routineId)
        .orderBy('routine_exercises.order_index');

      // Parse JSON fields
      exercises.forEach(exercise => {
        exercise.muscle_groups = exercise.muscle_groups ? JSON.parse(exercise.muscle_groups) : [];
        exercise.instructions = exercise.instructions ? JSON.parse(exercise.instructions) : [];
      });

      logger.info('Routine details retrieved', { 
        userId: req.user.id, 
        routineId, 
        exerciseCount: exercises.length 
      });

      res.json({
        success: true,
        data: { 
          routine,
          exercises 
        }
      });
    } catch (error) {
      logger.error('Error retrieving routine details', { 
        error: error.message, 
        userId: req.user?.id,
        routineId: req.params.id 
      });
      next(error);
    }
  }
);

// Create new workout routine
router.post('/routines',
  verifyAuth,
  [
    body('name').isLength({ min: 2, max: 100 }).trim(),
    body('description').optional().isLength({ max: 500 }).trim(),
    body('difficulty_level').isIn(['beginner', 'intermediate', 'advanced']),
    body('estimated_duration').isInt({ min: 5, max: 300 }),
    body('is_public').isBoolean(),
    body('exercises').isArray().isLength({ min: 1 }),
    body('exercises.*.exercise_id').isInt(),
    body('exercises.*.sets').isInt({ min: 1, max: 20 }),
    body('exercises.*.reps').optional().isInt({ min: 1, max: 200 }),
    body('exercises.*.weight').optional().isFloat({ min: 0 }),
    body('exercises.*.duration_seconds').optional().isInt({ min: 0 }),
    body('exercises.*.rest_seconds').optional().isInt({ min: 0, max: 600 }),
    body('exercises.*.notes').optional().isLength({ max: 200 }).trim()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Datos de rutina inválidos',
          errors: errors.array() 
        });
      }

      const db = req.app.get('db');
      const { 
        name, 
        description, 
        difficulty_level, 
        estimated_duration, 
        is_public, 
        exercises 
      } = req.body;

      const result = await db.transaction(async (trx) => {
        // Create routine
        const [routineId] = await trx('workout_routines').insert({
          user_id: req.user.id,
          name,
          description,
          difficulty_level,
          estimated_duration,
          is_public: is_public || false
        });

        // Add exercises to routine
        const routineExercises = exercises.map((exercise, index) => ({
          routine_id: routineId,
          exercise_id: exercise.exercise_id,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          duration_seconds: exercise.duration_seconds,
          rest_seconds: exercise.rest_seconds || 60,
          order_index: index + 1,
          notes: exercise.notes
        }));

        await trx('routine_exercises').insert(routineExercises);

        return routineId;
      });

      logger.info('Workout routine created', { 
        userId: req.user.id, 
        routineId: result,
        exerciseCount: exercises.length 
      });

      res.status(201).json({
        success: true,
        message: 'Rutina creada exitosamente',
        data: { routineId: result }
      });
    } catch (error) {
      logger.error('Error creating workout routine', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }
);

// Start a workout session
router.post('/sessions',
  verifyAuth,
  [
    body('routine_id').optional().isInt(),
    body('name').isLength({ min: 2, max: 100 }).trim(),
    body('exercises').optional().isArray()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Datos de sesión inválidos',
          errors: errors.array() 
        });
      }

      const db = req.app.get('db');
      const { routine_id, name, exercises } = req.body;

      const [sessionId] = await db('workout_sessions').insert({
        user_id: req.user.id,
        routine_id,
        name: name || 'Entrenamiento Personal',
        status: 'active',
        started_at: new Date()
      });

      logger.info('Workout session started', { 
        userId: req.user.id, 
        sessionId,
        routineId: routine_id 
      });

      res.status(201).json({
        success: true,
        message: 'Sesión de entrenamiento iniciada',
        data: { sessionId }
      });
    } catch (error) {
      logger.error('Error starting workout session', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }
);

// Record exercise in session
router.post('/sessions/:sessionId/exercises',
  verifyAuth,
  [
    param('sessionId').isInt().toInt(),
    body('exercise_id').isInt(),
    body('sets').isArray().isLength({ min: 1 }),
    body('sets.*.reps').isInt({ min: 0, max: 200 }),
    body('sets.*.weight').optional().isFloat({ min: 0 }),
    body('sets.*.duration_seconds').optional().isInt({ min: 0 }),
    body('sets.*.completed').isBoolean(),
    body('notes').optional().isLength({ max: 200 }).trim()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Datos de ejercicio inválidos',
          errors: errors.array() 
        });
      }

      const db = req.app.get('db');
      const { sessionId } = req.params;
      const { exercise_id, sets, notes } = req.body;

      // Verify session belongs to user and is active
      const session = await db('workout_sessions')
        .select('*')
        .where('id', sessionId)
        .where('user_id', req.user.id)
        .where('status', 'active')
        .first();

      if (!session) {
        return res.status(404).json({ 
          success: false, 
          message: 'Sesión de entrenamiento no encontrada o no activa' 
        });
      }

      const [recordId] = await db('workout_records').insert({
        user_id: req.user.id,
        session_id: sessionId,
        exercise_id,
        sets_data: JSON.stringify(sets),
        notes,
        recorded_at: new Date()
      });

      logger.info('Exercise recorded in session', { 
        userId: req.user.id, 
        sessionId, 
        exerciseId: exercise_id,
        recordId,
        setsCount: sets.length 
      });

      res.status(201).json({
        success: true,
        message: 'Ejercicio registrado exitosamente',
        data: { recordId }
      });
    } catch (error) {
      logger.error('Error recording exercise', { 
        error: error.message, 
        userId: req.user?.id,
        sessionId: req.params.sessionId 
      });
      next(error);
    }
  }
);

// Complete workout session
router.put('/sessions/:sessionId/complete',
  verifyAuth,
  [
    param('sessionId').isInt().toInt(),
    body('total_calories').optional().isFloat({ min: 0 }),
    body('notes').optional().isLength({ max: 500 }).trim()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Datos de finalización inválidos',
          errors: errors.array() 
        });
      }

      const db = req.app.get('db');
      const { sessionId } = req.params;
      const { total_calories, notes } = req.body;

      // Verify session belongs to user and is active
      const session = await db('workout_sessions')
        .select('*')
        .where('id', sessionId)
        .where('user_id', req.user.id)
        .where('status', 'active')
        .first();

      if (!session) {
        return res.status(404).json({ 
          success: false, 
          message: 'Sesión de entrenamiento no encontrada o no activa' 
        });
      }

      const endTime = new Date();
      const durationMinutes = Math.round((endTime - new Date(session.started_at)) / (1000 * 60));

      await db('workout_sessions')
        .where('id', sessionId)
        .update({
          status: 'completed',
          completed_at: endTime,
          duration_minutes: durationMinutes,
          total_calories: total_calories || null,
          notes
        });

      logger.info('Workout session completed', { 
        userId: req.user.id, 
        sessionId,
        duration: durationMinutes,
        calories: total_calories 
      });

      res.json({
        success: true,
        message: 'Entrenamiento completado exitosamente',
        data: { 
          sessionId,
          duration: durationMinutes,
          calories: total_calories 
        }
      });
    } catch (error) {
      logger.error('Error completing workout session', { 
        error: error.message, 
        userId: req.user?.id,
        sessionId: req.params.sessionId 
      });
      next(error);
    }
  }
);

// Get workout history
router.get('/history',
  verifyAuth,
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
    query('status').optional().isIn(['active', 'completed', 'cancelled'])
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
      const { limit = 20, offset = 0, status } = req.query;

      let query = db('workout_sessions')
        .select(
          'id',
          'routine_id',
          'name',
          'status',
          'started_at',
          'completed_at',
          'duration_minutes',
          'total_calories',
          'notes'
        )
        .where('user_id', req.user.id)
        .orderBy('started_at', 'desc')
        .limit(limit)
        .offset(offset);

      if (status) {
        query = query.where('status', status);
      }

      const sessions = await query;

      // Get exercise count for each session
      for (let session of sessions) {
        const exerciseCount = await db('workout_records')
          .count('* as count')
          .where('session_id', session.id)
          .first();
        
        session.exercise_count = parseInt(exerciseCount.count);
      }

      logger.info('Workout history retrieved', { 
        userId: req.user.id, 
        count: sessions.length,
        limit,
        offset 
      });

      res.json({
        success: true,
        data: { sessions }
      });
    } catch (error) {
      logger.error('Error retrieving workout history', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }
);

// Get workout statistics
router.get('/stats',
  verifyAuth,
  [
    query('period').optional().isIn(['week', 'month', 'quarter', 'year', 'all']),
    query('exercise_id').optional().isInt()
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
      const { period = 'month', exercise_id } = req.query;

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
        case 'all':
          startDate.setFullYear(2020); // Set to very early date
          break;
      }

      let baseQuery = db('workout_sessions')
        .where('user_id', req.user.id)
        .where('status', 'completed');

      if (period !== 'all') {
        baseQuery = baseQuery.where('completed_at', '>=', startDate);
      }

      // Basic stats
      const basicStats = await baseQuery.clone()
        .select(
          db.raw('COUNT(*) as total_workouts'),
          db.raw('SUM(duration_minutes) as total_minutes'),
          db.raw('SUM(total_calories) as total_calories'),
          db.raw('AVG(duration_minutes) as avg_duration')
        )
        .first();

      // Workout frequency
      const workoutsByDay = await baseQuery.clone()
        .select(
          db.raw('DATE(completed_at) as workout_date'),
          db.raw('COUNT(*) as workout_count')
        )
        .groupBy(db.raw('DATE(completed_at)'))
        .orderBy('workout_date');

      // Most trained exercises
      const topExercises = await db('workout_records')
        .join('workout_sessions', 'workout_records.session_id', 'workout_sessions.id')
        .join('exercises', 'workout_records.exercise_id', 'exercises.id')
        .select(
          'exercises.id',
          'exercises.name',
          db.raw('COUNT(*) as sessions_count')
        )
        .where('workout_sessions.user_id', req.user.id)
        .where('workout_sessions.status', 'completed')
        .where('workout_sessions.completed_at', '>=', period === 'all' ? '2020-01-01' : startDate)
        .groupBy('exercises.id', 'exercises.name')
        .orderBy('sessions_count', 'desc')
        .limit(10);

      logger.info('Workout stats retrieved', { 
        userId: req.user.id, 
        period,
        totalWorkouts: basicStats.total_workouts 
      });

      res.json({
        success: true,
        data: {
          period,
          basic_stats: {
            total_workouts: parseInt(basicStats.total_workouts) || 0,
            total_minutes: parseInt(basicStats.total_minutes) || 0,
            total_calories: parseInt(basicStats.total_calories) || 0,
            avg_duration: Math.round(parseFloat(basicStats.avg_duration)) || 0
          },
          workout_frequency: workoutsByDay,
          top_exercises: topExercises
        }
      });
    } catch (error) {
      logger.error('Error retrieving workout stats', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }
);

module.exports = router;