// Servicios para IA y APIs externas

// Simulación de servicio de IA para entrenamiento
export const AITrainerService = {
  generateWorkout: async (userProfile, emotionalState) => {
    // Simular llamada a API de IA
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const workouts = {
      beginner_happy: {
        name: 'Rutina Energética para Principiante',
        exercises: [
          'Caminar en el lugar - 5 min',
          'Flexiones de rodillas - 2x8',
          'Sentadillas asistidas - 2x10',
          'Plancha - 2x15s',
        ],
        duration: 25,
        difficulty: 'Principiante',
        mood: 'happy'
      },
      intermediate_motivated: {
        name: 'Entrenamiento Motivacional',
        exercises: [
          'Saltos de tijera - 3 min',
          'Flexiones - 3x10',
          'Sentadillas - 3x15',
          'Plancha - 3x30s',
          'Mountain climbers - 3x20',
        ],
        duration: 35,
        difficulty: 'Intermedio',
        mood: 'motivated'
      }
    };
    
    const key = `${userProfile.fitnessLevel}_${emotionalState}`.toLowerCase();
    return workouts[key] || workouts.beginner_happy;
  },

  getMotivationalMessage: (emotionalState, context = 'general') => {
    const messages = {
      tired: [
        'Entiendo que te sientes cansado. ¿Qué te parece un entrenamiento suave hoy?',
        'El cansancio es temporal, pero la satisfacción de entrenar es duradera.',
        'Incluso 10 minutos de movimiento pueden cambiar tu energía.',
      ],
      stressed: [
        'El ejercicio es una excelente forma de liberar estrés. ¡Vamos a canalizar esa energía!',
        'Respira profundo. El entrenamiento te ayudará a encontrar tu centro.',
        'Cada repetición es un paso hacia la calma mental.',
      ],
      happy: [
        '¡Excelente energía! Aprovechemos este buen momento para un gran entrenamiento.',
        '¡Tu actitud positiva es contagiosa! Vamos a brillar en este entrenamiento.',
        '¡Perfecto! Con esta energía podemos lograr grandes cosas hoy.',
      ],
      motivated: [
        '¡Esa motivación es increíble! Vamos a convertirla en resultados.',
        '¡Me encanta tu determinación! Hoy será un gran día de entrenamiento.',
        '¡Con esa actitud conquistaremos todos los objetivos!',
      ]
    };

    const stateMessages = messages[emotionalState] || messages.happy;
    return stateMessages[Math.floor(Math.random() * stateMessages.length)];
  },

  analyzeProgress: (workouts, userGoals) => {
    const totalWorkouts = workouts.length;
    const thisWeekWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return workoutDate >= weekAgo;
    }).length;

    const analysis = {
      consistency: thisWeekWorkouts >= 3 ? 'Excelente' : thisWeekWorkouts >= 1 ? 'Buena' : 'Necesita mejorar',
      recommendation: thisWeekWorkouts >= 3 
        ? 'Mantén este ritmo, vas muy bien!'
        : 'Intenta entrenar al menos 3 veces esta semana.',
      nextGoal: totalWorkouts < 10 
        ? 'Llegar a 10 entrenamientos'
        : 'Mantener la constancia',
    };

    return analysis;
  }
};

// Servicio para manejo de música motivacional
export const MusicService = {
  getMotivationalPlaylist: (emotionalState, workoutType) => {
    const playlists = {
      energetic: [
        { title: 'Eye of the Tiger', artist: 'Survivor', duration: '4:05' },
        { title: 'Stronger', artist: 'Kanye West', duration: '5:12' },
        { title: 'Can\'t Hold Us', artist: 'Macklemore', duration: '4:18' },
      ],
      calm: [
        { title: 'Weightless', artist: 'Marconi Union', duration: '8:08' },
        { title: 'Deep Peace', artist: 'Deuter', duration: '6:23' },
        { title: 'Meditation', artist: 'Liquid Mind', duration: '7:45' },
      ],
      motivation: [
        { title: 'Till I Collapse', artist: 'Eminem', duration: '4:57' },
        { title: 'Lose Yourself', artist: 'Eminem', duration: '5:26' },
        { title: 'Remember the Name', artist: 'Fort Minor', duration: '3:50' },
      ]
    };

    const moodToPlaylist = {
      tired: 'energetic',
      stressed: 'calm',
      happy: 'motivation',
      motivated: 'motivation',
      neutral: 'motivation'
    };

    const playlistType = moodToPlaylist[emotionalState] || 'motivation';
    return playlists[playlistType];
  },

  playMusic: async (song) => {
    // Simular reproducción de música
    console.log(`🎵 Reproduciendo: ${song.title} - ${song.artist}`);
    return true;
  }
};

// Servicio para simulación de Bluetooth
export const BluetoothService = {
  scanForDevices: async () => {
    // Simular búsqueda de dispositivos
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return [
      { id: '1', name: 'Apple Watch Series 8', type: 'smartwatch', connected: false },
      { id: '2', name: 'Fitbit Charge 5', type: 'fitness_tracker', connected: false },
      { id: '3', name: 'Samsung Galaxy Watch', type: 'smartwatch', connected: false },
    ];
  },

  connectToDevice: async (deviceId) => {
    // Simular conexión
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 80% de probabilidad de éxito
    const success = Math.random() > 0.2;
    return {
      success,
      message: success ? 'Dispositivo conectado exitosamente' : 'Error al conectar'
    };
  },

  getHeartRate: () => {
    // Simular lectura de frecuencia cardíaca
    return Math.floor(Math.random() * (180 - 60) + 60);
  },

  getSteps: () => {
    // Simular contador de pasos
    return Math.floor(Math.random() * 10000);
  }
};

// Servicio para análisis emocional
export const EmotionalAnalysisService = {
  analyzeEmotionalState: (heartRate, activityLevel, timeOfDay) => {
    let state = 'neutral';
    
    if (heartRate > 100 && activityLevel > 0.7) {
      state = 'energetic';
    } else if (heartRate < 70 && timeOfDay > 20) {
      state = 'tired';
    } else if (heartRate > 90 && activityLevel < 0.3) {
      state = 'stressed';
    } else if (heartRate >= 70 && heartRate <= 90 && activityLevel > 0.5) {
      state = 'happy';
    }
    
    return state;
  },

  getSuggestedMusic: (emotionalState) => {
    const suggestions = {
      tired: 'Música energética para activarte',
      stressed: 'Música relajante para calmar',
      happy: 'Música motivacional para mantener el ánimo',
      energetic: 'Música intensa para el entrenamiento',
      neutral: 'Música motivacional general'
    };
    
    return suggestions[emotionalState] || suggestions.neutral;
  }
};

// Servicio para gamificación y recompensas
export const RewardService = {
  calculateRewards: (workoutCompleted) => {
    let points = 10; // Base points
    
    if (workoutCompleted.duration >= 30) points += 5;
    if (workoutCompleted.difficulty === 'Intermedio') points += 3;
    if (workoutCompleted.difficulty === 'Avanzado') points += 5;
    
    return points;
  },

  getAchievements: (userStats) => {
    const achievements = [];
    
    if (userStats.streaks >= 7) {
      achievements.push({
        id: 'week_streak',
        title: '🔥 Semana Completa',
        description: '7 días consecutivos de entrenamiento'
      });
    }
    
    if (userStats.workouts.length >= 10) {
      achievements.push({
        id: 'ten_workouts',
        title: '💪 Guerrero',
        description: '10 entrenamientos completados'
      });
    }
    
    return achievements;
  }
};

export default {
  AITrainerService,
  MusicService,
  BluetoothService,
  EmotionalAnalysisService,
  RewardService
};