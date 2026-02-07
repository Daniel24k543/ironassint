import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const WorkoutScreen = ({ navigation }) => {
  const { state, actions } = useApp();
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const workoutPlans = [
    {
      id: '1',
      name: 'Rutina para Principiantes',
      duration: 30,
      exercises: [
        'Flexiones de rodillas - 3x8',
        'Sentadillas - 3x10', 
        'Plancha - 3x20s',
        'Elevaciones de pantorrilla - 3x15',
      ],
      difficulty: 'Principiante',
      calories: 150,
      icon: 'leaf',
      color: ['#4ECDC4', '#44A08D'],
    },
    {
      id: '2', 
      name: 'Entrenamiento Intermedio',
      duration: 45,
      exercises: [
        'Flexiones - 3x12',
        'Sentadillas con salto - 3x10',
        'Plancha con elevación - 3x30s',
        'Burpees - 3x8',
        'Mountain climbers - 3x20',
      ],
      difficulty: 'Intermedio',
      calories: 280,
      icon: 'flash',
      color: ['#FFD700', '#FFA500'],
    },
    {
      id: '3',
      name: 'Rutina Avanzada',
      duration: 60,
      exercises: [
        'Flexiones diamante - 4x10',
        'Sentadillas pistola - 4x6',
        'Plancha a una mano - 4x20s',
        'Burpees con salto - 4x12',
        'Handstand push-ups - 4x5',
        'Sprint en el lugar - 4x30s',
      ],
      difficulty: 'Avanzado',
      calories: 450,
      icon: 'flame',
      color: ['#FF6B35', '#FF8E53'],
    },
  ];

  const aiSuggestions = [
    {
      id: 'ai-1',
      title: 'Rutina Personalizada por IA',
      description: 'Basada en tu perfil y objetivos',
      icon: 'brain',
      color: ['#A8E6CF', '#7FCDCD'],
      onPress: () => generateAIWorkout(),
    },
    {
      id: 'ai-2', 
      title: 'Adaptación Emocional',
      description: 'Según tu estado de ánimo actual',
      icon: 'heart',
      color: ['#FFB6C1', '#FF69B4'],
      onPress: () => generateEmotionalWorkout(),
    },
  ];

  const startWorkout = (workout) => {
    Alert.alert(
      'Iniciar Entrenamiento',
      `¿Estás listo para comenzar "${workout.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Comenzar', onPress: () => beginWorkout(workout) },
      ]
    );
  };

  const beginWorkout = (workout) => {
    // Simular entrenamiento completado
    const workoutData = {
      id: Date.now().toString(),
      name: workout.name,
      duration: workout.duration,
      calories: workout.calories,
      date: new Date().toLocaleDateString(),
      completed: true,
    };
    
    actions.addWorkout(workoutData);
    actions.addRewards(10);
    
    Alert.alert(
      '¡Entrenamiento Completado!',
      `Has completado "${workout.name}" y ganado 10 puntos de recompensa.`,
      [{ text: 'Genial!', onPress: () => navigation.navigate('Home') }]
    );
  };

  const generateAIWorkout = () => {
    Alert.alert(
      'IA Generando Rutina',
      'Tu entrenador personal está creando una rutina perfecta para ti...',
      [{ text: 'OK' }]
    );
  };

  const generateEmotionalWorkout = () => {
    const emotionalWorkouts = {
      happy: 'Rutina Energética - ¡Aprovecha tu buen ánimo!',
      tired: 'Rutina Suave - Ejercicios de recuperación',
      stressed: 'Rutina Relajante - Yoga y estiramientos',
      energetic: 'Rutina Intensa - ¡Quema esa energía!',
      neutral: 'Rutina Equilibrada - Entrenamiento completo',
    };

    const workout = emotionalWorkouts[state.emotionalState] || emotionalWorkouts.neutral;
    Alert.alert('Rutina Emocional', workout);
  };

  return (
    <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Entrenamientos</Text>
          <Text style={styles.subtitle}>
            Elige tu rutina perfecta
          </Text>
        </View>

        {/* AI Suggestions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 Sugerencias de IA</Text>
          <View style={styles.aiContainer}>
            {aiSuggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.id}
                style={styles.aiCard}
                onPress={suggestion.onPress}
              >
                <LinearGradient
                  colors={suggestion.color}
                  style={styles.aiCardGradient}
                >
                  <Ionicons name={suggestion.icon} size={24} color="#FFFFFF" />
                  <View style={styles.aiCardContent}>
                    <Text style={styles.aiCardTitle}>{suggestion.title}</Text>
                    <Text style={styles.aiCardDesc}>{suggestion.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Workout Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💪 Rutinas Predefinidas</Text>
          {workoutPlans.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={styles.workoutCard}
              onPress={() => startWorkout(workout)}
            >
              <LinearGradient
                colors={[...workout.color, 'rgba(0,0,0,0.1)']}
                style={styles.workoutGradient}
              >
                <View style={styles.workoutHeader}>
                  <View style={styles.workoutIconContainer}>
                    <Ionicons name={workout.icon} size={32} color="#FFFFFF" />
                  </View>
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <Text style={styles.workoutDifficulty}>{workout.difficulty}</Text>
                  </View>
                  <View style={styles.workoutStats}>
                    <Text style={styles.workoutDuration}>{workout.duration}min</Text>
                    <Text style={styles.workoutCalories}>{workout.calories}cal</Text>
                  </View>
                </View>
                
                <View style={styles.exercisesList}>
                  {workout.exercises.map((exercise, index) => (
                    <View key={index} style={styles.exerciseItem}>
                      <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.exerciseText}>{exercise}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.startButton}>
                  <Text style={styles.startButtonText}>Comenzar Entrenamiento</Text>
                  <Ionicons name="play" size={16} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Exercises */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Ejercicios Rápidos</Text>
          <View style={styles.quickExercises}>
            {[
              { name: '50 Jumping Jacks', duration: '2 min', icon: 'man' },
              { name: '20 Flexiones', duration: '3 min', icon: 'fitness' },
              { name: 'Plancha 1 min', duration: '1 min', icon: 'time' },
              { name: 'Estiramiento', duration: '5 min', icon: 'leaf' },
            ].map((exercise, index) => (
              <TouchableOpacity key={index} style={styles.quickExerciseCard}>
                <Ionicons name={exercise.icon} size={20} color="#FF6B35" />
                <View style={styles.quickExerciseInfo}>
                  <Text style={styles.quickExerciseName}>{exercise.name}</Text>
                  <Text style={styles.quickExerciseDuration}>{exercise.duration}</Text>
                </View>
                <Ionicons name="play-circle" size={24} color="#FF6B35" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 5,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  aiContainer: {
    gap: 10,
  },
  aiCard: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  aiCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  aiCardContent: {
    flex: 1,
    marginLeft: 15,
  },
  aiCardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aiCardDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  workoutCard: {
    borderRadius: 20,
    marginBottom: 15,
    overflow: 'hidden',
  },
  workoutGradient: {
    padding: 20,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  workoutIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutInfo: {
    flex: 1,
    marginLeft: 15,
  },
  workoutName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  workoutDifficulty: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  workoutStats: {
    alignItems: 'flex-end',
  },
  workoutDuration: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  workoutCalories: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  exercisesList: {
    marginBottom: 15,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginLeft: 10,
  },
  startButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickExercises: {
    gap: 10,
  },
  quickExerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.2)',
  },
  quickExerciseInfo: {
    flex: 1,
    marginLeft: 15,
  },
  quickExerciseName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quickExerciseDuration: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
});

export default WorkoutScreen;