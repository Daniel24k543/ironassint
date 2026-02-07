// Simple test server for GymIA Backend
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Simple health check
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    status: 'ok', 
    message: 'GymIA Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Simple API test
app.get('/api/test', (req, res) => {
  console.log('API test requested');
  res.json({ 
    success: true, 
    message: 'API is working!',
    data: { test: true }
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  console.log('Login requested:', req.body);
  res.json({
    success: true,
    data: {
      user: {
        id: 1,
        email: req.body.email || 'demo@gymia.app',
        displayName: 'Usuario Demo'
      },
      token: 'demo_token_123'
    }
  });
});

app.get('/api/workouts/routines', (req, res) => {
  console.log('Routines requested');
  res.json({
    success: true,
    data: {
      routines: [
        { id: 1, name: 'Rutina de Fuerza', exercises: 8 },
        { id: 2, name: 'Cardio Intenso', exercises: 6 }
      ]
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`*******************************************`);
  console.log(`🚀 GymIA Backend Server STARTED!`);
  console.log(`*******************************************`);
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 API Base: http://localhost:${PORT}/api`);
  console.log(`*******************************************`);
  console.log(`Ready to receive requests! 💪`);
});

// Error handler
process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('⚠️ Unhandled Rejection:', err);
});