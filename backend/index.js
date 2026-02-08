// Simplified development server for GymIA Backend
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple in-memory data store for development
const users = new Map();
const workouts = new Map();
const analytics = new Map();

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'GymIA API',
    timestamp: new Date().toISOString(),
    environment: 'development' 
  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email);
  
  res.json({
    success: true,
    data: {
      user: {
        id: 1,
        email: email,
        displayName: 'Usuario Demo',
        premiumStatus: true
      },
      token: 'demo_jwt_token_development'
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, displayName } = req.body;
  console.log('Register attempt:', email);
  
  res.json({
    success: true,
    data: {
      user: {
        id: Date.now(),
        email: email,
        displayName: displayName || 'Nuevo Usuario',
        premiumStatus: false
      },
      token: 'demo_jwt_token_development'
    }
  });
});

// User routes
app.get('/api/users/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: 1,
        email: 'demo@gymia.app',
        displayName: 'Usuario Demo',
        premiumStatus: true,
        age: 28,
        height: 175,
        weight: 70,
        fitnessLevel: 'intermediate',
        goals: ['build_muscle', 'lose_weight']
      }
    }
  });
});

// Workout routes
app.get('/api/workouts/routines', (req, res) => {
  res.json({
    success: true,
    data: {
      routines: [
        {
          id: 1,
          name: 'Rutina de Fuerza',
          description: 'Entrenamiento completo de fuerza',
          exerciseCount: 8,
          estimatedDuration: 60
        },
        {
          id: 2, 
          name: 'Cardio Intenso',
          description: 'Rutina cardiovascular de alta intensidad',
          exerciseCount: 6,
          estimatedDuration: 45
        }
      ]
    }
  });
});

app.get('/api/workouts/exercises', (req, res) => {
  res.json({
    success: true,
    data: {
      exercises: [
        {
          id: 1,
          name: 'Press de Banca',
          category: 'strength',
          muscleGroups: ['chest', 'triceps'],
          description: 'Ejercicio fundamental para pecho y triceps',
          instructions: ['Acostarse en el banco', 'Agarrar la barra', 'Bajar controlado', 'Empujar hacia arriba']
        },
        {
          id: 2,
          name: 'Sentadillas',
          category: 'strength', 
          muscleGroups: ['legs', 'glutes'],
          description: 'Ejercicio básico para piernas y glúteos',
          instructions: ['Pies a ancho de hombros', 'Bajar como sentándose', 'Mantener espalda recta', 'Subir empujando talones']
        }
      ]
    }
  });
});

// Analytics routes
app.get('/api/analytics/workout-stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalWorkouts: 45,
      totalMinutes: 2700,
      avgDuration: 60,
      totalCaloriesBurned: 18500,
      totalWeightLifted: 12650,
      currentStreak: 7
    }
  });
});

app.get('/api/analytics/progress', (req, res) => {
  const progressData = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: Math.floor(Math.random() * 3) + 1 // 1-3 workouts per day
  }));

  res.json({
    success: true,
    data: {
      metric: 'workouts',
      period: 'week',
      progress: progressData
    }
  });
});

// AI routes  
app.post('/api/ai/workout-plan', (req, res) => {
  console.log('Generating AI workout plan:', req.body);
  
  res.json({
    success: true,
    data: {
      workoutPlan: {
        name: 'Plan Personalizado de IA',
        description: 'Rutina generada específicamente para tus objetivos',
        durationWeeks: 6,
        sessionsPerWeek: 4,
        exercises: [
          { name: 'Push-ups', sets: 3, reps: '12-15', rest: 60 },
          { name: 'Squats', sets: 4, reps: '8-12', rest: 90 },
          { name: 'Plank', sets: 3, reps: '45-60 sec', rest: 45 },
          { name: 'Lunges', sets: 3, reps: '10 cada pierna', rest: 60 }
        ]
      }
    }
  });
});

app.get('/api/ai/motivation', (req, res) => {
  const messages = [
    '¡Hoy es el día perfecto para superar tus límites! 💪',
    '¡Cada repetición te acerca a tu mejor versión! ⚡',
    '¡Tu determinación es tu superpoder! 🔥',
    '¡El progreso se construye día a día! 🌟'
  ];
  
  res.json({
    success: true,
    data: {
      message: {
        message: messages[Math.floor(Math.random() * messages.length)],
        category: 'motivation',
        generatedAt: new Date()
      }
    }
  });
});

// Subscription routes
app.get('/api/subscriptions/plans', (req, res) => {
  res.json({
    success: true,
    data: {
      plans: [
        {
          id: 'premium_monthly',
          name: 'Premium Mensual', 
          price: 999, // cents
          currency: 'usd',
          interval: 'month',
          features: ['IA Entrenador Personal', 'Analytics Avanzados', 'Rutinas Ilimitadas', 'Soporte Premium']
        },
        {
          id: 'premium_yearly',
          name: 'Premium Anual',
          price: 9999, // cents 
          currency: 'usd',
          interval: 'year',
          features: ['IA Entrenador Personal', 'Analytics Avanzados', 'Rutinas Ilimitadas', 'Soporte Premium', '2 meses gratis']
        }
      ]
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} no encontrado`,
    availableEndpoints: [
      'GET /health',
      'POST /api/auth/login',
      'POST /api/auth/register', 
      'GET /api/users/profile',
      'GET /api/workouts/routines',
      'GET /api/workouts/exercises',
      'GET /api/analytics/workout-stats',
      'GET /api/analytics/progress',
      'POST /api/ai/workout-plan',
      'GET /api/ai/motivation',
      'GET /api/subscriptions/plans'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 GymIA Backend Server Started!
-----------------------------------
🌐 Server: http://localhost:${PORT}
🔍 Health: http://localhost:${PORT}/health
📱 API: http://localhost:${PORT}/api

Environment: Development
Mode: Simplified (In-Memory)

Available endpoints:
• Auth: POST /api/auth/login, /api/auth/register
• Users: GET /api/users/profile  
• Workouts: GET /api/workouts/routines, /api/workouts/exercises
• Analytics: GET /api/analytics/workout-stats, /api/analytics/progress
• AI: POST /api/ai/workout-plan, GET /api/ai/motivation
• Subscriptions: GET /api/subscriptions/plans

Ready to receive requests! 💪
`);
});

module.exports = app;