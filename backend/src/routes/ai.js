// backend/src/routes/ai.js

const express = require('express');
const router = express.Router();
const { verifyAuth, requirePremium } = require('../middleware/auth');
const logger = require('../services/logger');
const { body, validationResult } = require('express-validator');

// Mock AI service - In production, integrate with OpenAI API
class AIService {
  static async generateWorkoutPlan(userProfile, goals, fitnessLevel) {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const workoutPlans = {
      beginner: {
        name: 'Plan de Inicio Personalizado',
        description: 'Rutina diseñada para principiantes enfocada en forma y técnica',
        duration_weeks: 4,
        sessions_per_week: 3,
        exercises: [
          { name: 'Push-ups', sets: 3, reps: '8-12', rest: 60 },
          { name: 'Bodyweight Squats', sets: 3, reps: '10-15', rest: 60 },
          { name: 'Plank', sets: 3, reps: '30-60 sec', rest: 45 },
          { name: 'Lunges', sets: 3, reps: '8-12 each leg', rest: 60 }
        ]
      },
      intermediate: {
        name: 'Plan Intermedio de Fuerza',
        description: 'Rutina balanceada para desarrollar fuerza y resistencia',
        duration_weeks: 6,
        sessions_per_week: 4,
        exercises: [
          { name: 'Bench Press', sets: 4, reps: '8-10', rest: 90 },
          { name: 'Squats', sets: 4, reps: '6-8', rest: 120 },
          { name: 'Deadlifts', sets: 3, reps: '5-6', rest: 120 },
          { name: 'Pull-ups', sets: 3, reps: '6-10', rest: 90 }
        ]
      },
      advanced: {
        name: 'Plan Avanzado de Rendimiento',
        description: 'Rutina intensiva para atletas experimentados',
        duration_weeks: 8,
        sessions_per_week: 5,
        exercises: [
          { name: 'Olympic Lifts', sets: 5, reps: '3-5', rest: 180 },
          { name: 'Heavy Squats', sets: 5, reps: '3-5', rest: 180 },
          { name: 'Weighted Pull-ups', sets: 4, reps: '5-8', rest: 120 },
          { name: 'Plyometric Exercises', sets: 4, reps: '6-10', rest: 90 }
        ]
      }
    };

    return workoutPlans[fitnessLevel] || workoutPlans.beginner;
  }

  static async analyzeWorkoutPerformance(workoutData, userMetrics) {
    await new Promise(resolve => setTimeout(resolve, 800));

    const analysis = {
      performance_score: Math.floor(Math.random() * 30) + 70, // 70-100
      improvements: [],
      concerns: [],
      recommendations: []
    };

    // Mock analysis logic
    if (workoutData.duration > 90) {
      analysis.concerns.push('Entrenamientos muy largos pueden llevar al sobreentrenamiento');
      analysis.recommendations.push('Considera reducir la duración a 60-75 minutos');
    }

    if (workoutData.frequency > 6) {
      analysis.concerns.push('Alta frecuencia de entrenamiento detectada');
      analysis.recommendations.push('Incluye días de descanso para recuperación');
    }

    analysis.improvements.push('Consistencia excelente en los entrenamientos');
    analysis.improvements.push('Progresión constante en levantamiento de peso');
    
    analysis.recommendations.push('Incrementa la intensidad gradualmente');
    analysis.recommendations.push('Mantén hidratación adecuada durante entrenamientos');

    return analysis;
  }

  static async generateMotivationalMessage(userProgress, context = 'general') {
    await new Promise(resolve => setTimeout(resolve, 500));

    const messages = {
      workout_start: [
        '¡Es hora de brillar! Tu cuerpo es capaz de más de lo que imaginas 💪',
        '¡Vamos! Cada repetición te acerca a tu mejor versión ⚡',
        '¡Dale fuego! Hoy vas a superar tus límites 🔥',
        '¡A por todas! Tu futuro yo te agradecerá este esfuerzo ✨'
      ],
      workout_complete: [
        '¡Increíble trabajo! Has demostrado que la disciplina vence al talento 🏆',
        '¡Felicitaciones! Acabas de invertir en tu salud y bienestar 🌟',
        '¡Misión cumplida! Tu determinación es inspiradora 👏',
        '¡Excelente! Cada entrenamiento te hace más fuerte física y mentalmente 💯'
      ],
      streak_milestone: [
        `¡${userProgress.streak} días consecutivos! Tu constancia es admirable 🔥`,
        `¡Racha de ${userProgress.streak} días! Estás construyendo hábitos ganadores 📈`,
        `¡${userProgress.streak} días seguidos! Tu disciplina es tu superpoder ⚡`
      ],
      general: [
        '¡Recuerda: el progreso no siempre es visible, pero siempre está ahí! 🌱',
        '¡Tu único competidor eres tú mismo de ayer! 🏃‍♂️',
        '¡Cada día es una nueva oportunidad para ser mejor! ☀️',
        '¡El camino hacia tus metas comienza con un solo paso! 👣'
      ]
    };

    const categoryMessages = messages[context] || messages.general;
    const randomMessage = categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
    
    return {
      message: randomMessage,
      category: context,
      generated_at: new Date()
    };
  }

  static async generateNutritionAdvice(userProfile, goals) {
    await new Promise(resolve => setTimeout(resolve, 700));

    const advice = {
      daily_calories: 2000 + (userProfile.weight * 10),
      macros: {
        protein: Math.round(userProfile.weight * 2.2),
        carbs: Math.round(userProfile.weight * 4),
        fats: Math.round(userProfile.weight * 0.8)
      },
      recommendations: []
    };

    if (goals.includes('lose_weight')) {
      advice.daily_calories -= 300;
      advice.recommendations.push('Mantén un déficit calórico moderado de 300-500 calorías');
      advice.recommendations.push('Prioriza proteínas magras y vegetales');
    }

    if (goals.includes('build_muscle')) {
      advice.daily_calories += 200;
      advice.macros.protein += 20;
      advice.recommendations.push('Consume proteína dentro de 30 minutos post-entrenamiento');
      advice.recommendations.push('Distribuye las proteínas a lo largo del día');
    }

    advice.recommendations.push('Bebe al menos 2.5 litros de agua al día');
    advice.recommendations.push('Incluye micronutrientes con frutas y verduras variadas');

    return advice;
  }

  static async generateRecoveryPlan(workoutIntensity, sleepData, stressLevel) {
    await new Promise(resolve => setTimeout(resolve, 600));

    const recoveryPlan = {
      recommended_rest_days: 1,
      sleep_target: 8,
      activities: [],
      warnings: []
    };

    if (workoutIntensity === 'high') {
      recoveryPlan.recommended_rest_days = 2;
      recoveryPlan.activities.push('Masaje o rodillo de espuma');
      recoveryPlan.activities.push('Baño de hielo o ducha fría');
    }

    if (sleepData.average < 7) {
      recoveryPlan.warnings.push('Sueño insuficiente detectado');
      recoveryPlan.sleep_target = 8.5;
      recoveryPlan.activities.push('Técnicas de relajación antes de dormir');
    }

    if (stressLevel === 'high') {
      recoveryPlan.activities.push('Meditación o mindfulness');
      recoveryPlan.activities.push('Yoga suave o estiramientos');
      recoveryPlan.warnings.push('Nivel de estrés elevado - prioriza la recuperación');
    }

    recoveryPlan.activities.push('Hidratación adecuada');
    recoveryPlan.activities.push('Caminata ligera o actividad de baja intensidad');

    return recoveryPlan;
  }
}

// Generate personalized workout plan
router.post('/workout-plan',
  verifyAuth,
  requirePremium,
  [
    body('fitness_level').isIn(['beginner', 'intermediate', 'advanced']),
    body('goals').isArray(),
    body('available_days').isInt({ min: 1, max: 7 }),
    body('session_duration').isInt({ min: 15, max: 180 }),
    body('equipment').optional().isArray()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de solicitud inválidos',
          errors: errors.array()
        });
      }

      const db = req.app.get('db');
      const { fitness_level, goals, available_days, session_duration, equipment } = req.body;

      // Get user profile
      const userProfile = await db('user_profiles')
        .where('user_id', req.user.id)
        .first();

      if (!userProfile) {
        return res.status(400).json({
          success: false,
          message: 'Completa tu perfil antes de generar un plan'
        });
      }

      const workoutPlan = await AIService.generateWorkoutPlan(
        userProfile,
        goals,
        fitness_level
      );

      // Customize based on user preferences
      workoutPlan.sessions_per_week = Math.min(workoutPlan.sessions_per_week, available_days);
      workoutPlan.session_duration = session_duration;

      logger.info('AI workout plan generated', {
        userId: req.user.id,
        fitnessLevel: fitness_level,
        goals: goals.join(', ')
      });

      res.json({
        success: true,
        data: { workout_plan: workoutPlan }
      });
    } catch (error) {
      logger.error('Error generating workout plan', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }
);

// Analyze workout performance
router.post('/analyze-performance',
  verifyAuth,
  requirePremium,
  [
    body('workout_sessions').isArray(),
    body('period_days').isInt({ min: 7, max: 90 })
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de análisis inválidos',
          errors: errors.array()
        });
      }

      const db = req.app.get('db');
      const { workout_sessions, period_days } = req.body;

      // Get recent workout data
      const recentWorkouts = await db('workout_sessions')
        .where('user_id', req.user.id)
        .where('status', 'completed')
        .where('completed_at', '>=', new Date(Date.now() - period_days * 24 * 60 * 60 * 1000))
        .select('*');

      // Get user metrics
      const userMetrics = await db('user_metrics')
        .where('user_id', req.user.id)
        .where('recorded_at', '>=', new Date(Date.now() - period_days * 24 * 60 * 60 * 1000))
        .select('*');

      const workoutData = {
        duration: recentWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / recentWorkouts.length,
        frequency: recentWorkouts.length,
        period: period_days
      };

      const analysis = await AIService.analyzeWorkoutPerformance(workoutData, userMetrics);

      logger.info('Performance analysis generated', {
        userId: req.user.id,
        workoutsAnalyzed: recentWorkouts.length,
        periodDays: period_days
      });

      res.json({
        success: true,
        data: { 
          analysis,
          period: {
            days: period_days,
            workouts_analyzed: recentWorkouts.length
          }
        }
      });
    } catch (error) {
      logger.error('Error analyzing performance', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }
);

// Get motivational message
router.get('/motivation',
  verifyAuth,
  async (req, res, next) => {
    try {
      const db = req.app.get('db');
      const { context = 'general' } = req.query;

      // Get user progress for personalized motivation
      const userStats = await db('workout_sessions')
        .where('user_id', req.user.id)
        .where('status', 'completed')
        .orderBy('completed_at', 'desc')
        .limit(30)
        .select('completed_at');

      // Calculate current streak
      let streak = 0;
      let lastDate = null;
      for (const session of userStats) {
        const sessionDate = new Date(session.completed_at);
        const daysDiff = lastDate ? 
          Math.floor((lastDate - sessionDate) / (1000 * 60 * 60 * 24)) : 0;

        if (lastDate === null || daysDiff === 1) {
          streak++;
          lastDate = sessionDate;
        } else if (daysDiff > 1) {
          break;
        }
      }

      const userProgress = {
        streak,
        total_workouts: userStats.length
      };

      const motivationalMessage = await AIService.generateMotivationalMessage(userProgress, context);

      logger.info('Motivational message generated', {
        userId: req.user.id,
        context,
        streak
      });

      res.json({
        success: true,
        data: { 
          message: motivationalMessage,
          user_progress: userProgress
        }
      });
    } catch (error) {
      logger.error('Error generating motivational message', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }
);

// Get nutrition advice
router.get('/nutrition-advice',
  verifyAuth,
  requirePremium,
  async (req, res, next) => {
    try {
      const db = req.app.get('db');

      const userProfile = await db('user_profiles')
        .where('user_id', req.user.id)
        .first();

      if (!userProfile) {
        return res.status(400).json({
          success: false,
          message: 'Completa tu perfil para obtener consejos nutricionales'
        });
      }

      const goals = userProfile.goals ? JSON.parse(userProfile.goals) : [];
      const nutritionAdvice = await AIService.generateNutritionAdvice(userProfile, goals);

      logger.info('Nutrition advice generated', {
        userId: req.user.id,
        userWeight: userProfile.weight,
        goals: goals.join(', ')
      });

      res.json({
        success: true,
        data: { nutrition_advice: nutritionAdvice }
      });
    } catch (error) {
      logger.error('Error generating nutrition advice', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }
);

// Get recovery recommendations
router.get('/recovery-plan',
  verifyAuth,
  requirePremium,
  async (req, res, next) => {
    try {
      const db = req.app.get('db');

      // Get recent workout intensity
      const recentWorkouts = await db('workout_sessions')
        .where('user_id', req.user.id)
        .where('status', 'completed')
        .where('completed_at', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .select('duration_minutes');

      const avgDuration = recentWorkouts.length > 0 ?
        recentWorkouts.reduce((sum, w) => sum + w.duration_minutes, 0) / recentWorkouts.length : 0;

      const workoutIntensity = avgDuration > 90 ? 'high' : avgDuration > 60 ? 'medium' : 'low';

      // Get sleep data
      const sleepData = await db('user_metrics')
        .where('user_id', req.user.id)
        .where('metric_type', 'sleep_hours')
        .where('recorded_at', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .select('value');

      const avgSleep = sleepData.length > 0 ?
        sleepData.reduce((sum, s) => sum + s.value, 0) / sleepData.length : 7.5;

      // Mock stress level (in production, this would come from user input or wearable data)
      const stressLevel = avgSleep < 6 || recentWorkouts.length > 5 ? 'high' : 'medium';

      const recoveryPlan = await AIService.generateRecoveryPlan(
        workoutIntensity,
        { average: avgSleep },
        stressLevel
      );

      logger.info('Recovery plan generated', {
        userId: req.user.id,
        workoutIntensity,
        avgSleep,
        stressLevel
      });

      res.json({
        success: true,
        data: { 
          recovery_plan: recoveryPlan,
          context: {
            workout_intensity: workoutIntensity,
            avg_sleep: avgSleep,
            stress_level: stressLevel
          }
        }
      });
    } catch (error) {
      logger.error('Error generating recovery plan', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }
);

// Chat with AI coach
router.post('/coach-chat',
  verifyAuth,
  [
    body('message').isLength({ min: 1, max: 500 }).trim(),
    body('context').optional().isIn(['workout', 'nutrition', 'motivation', 'general'])
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Mensaje inválido',
          errors: errors.array()
        });
      }

      const { message, context = 'general' } = req.body;

      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Mock responses based on context and common questions
      const responses = {
        workout: [
          'Para maximizar tus resultados, asegúrate de mantener una técnica correcta. ¿En qué ejercicio específico necesitas ayuda?',
          'Recuerda que la progresión gradual es clave. ¿Has notado mejoras en tu fuerza últimamente?',
          'La consistencia es más importante que la intensidad. ¿Cómo va tu adherencia al plan de entrenamiento?'
        ],
        nutrition: [
          'La nutrición representa el 70% de tus resultados. ¿Estás siguiendo algún plan nutricional específico?',
          'Asegúrate de consumir suficiente proteína para la recuperación muscular. ¿Cuántas veces comes al día?',
          'La hidratación es fundamental. ¿Estás bebiendo suficiente agua durante tus entrenamientos?'
        ],
        motivation: [
          '¡Recuerda por qué empezaste! Cada día de entrenamiento es una inversión en tu mejor versión. ¿Qué te motiva más a seguir?',
          'Los resultados toman tiempo, pero cada esfuerzo cuenta. ¿Qué pequeñas victorias has celebrado últimamente?',
          'Tu disciplina de hoy es la libertad de mañana. ¿Cómo te sientes después de completar un entrenamiento?'
        ],
        general: [
          'Estoy aquí para apoyarte en tu journey fitness. ¿En qué puedo ayudarte hoy?',
          '¡Excelente que me preguntes! ¿Hay algo específico sobre tu entrenamiento que te preocupe?',
          'Cada pregunta es una oportunidad de mejorar. ¿Qué aspecto de tu rutina te gustaría optimizar?'
        ]
      };

      const contextResponses = responses[context];
      const response = contextResponses[Math.floor(Math.random() * contextResponses.length)];

      logger.info('AI coach chat response generated', {
        userId: req.user.id,
        context,
        messageLength: message.length
      });

      res.json({
        success: true,
        data: {
          response,
          context,
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error('Error in coach chat', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }
);

module.exports = router;