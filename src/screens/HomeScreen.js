import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import HeartRateMonitor from '../components/HeartRateMonitor';
import StreakCounter from '../components/StreakCounter';
import EmotionalStateIndicator from '../components/EmotionalStateIndicator';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { state, actions } = useApp();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setDynamicGreeting();
  }, []);

  const setDynamicGreeting = () => {
    const hour = new Date().getHours();
    let greetingText = '';
    
    if (hour < 12) {
      greetingText = 'Buenos días';
    } else if (hour < 18) {
      greetingText = 'Buenas tardes';
    } else {
      greetingText = 'Buenas noches';
    }
    
    setGreeting(greetingText);
  };

  const quickActions = [
    {
      id: 'workout',
      title: 'Entrenar Ahora',
      subtitle: 'Rutina personalizada',
      icon: 'fitness',
      color: ['#FF6B35', '#FF8E53'],
      onPress: () => navigation.navigate('Workout'),
    },
    {
      id: 'ai',
      title: 'Hablar con IA',
      subtitle: 'Tu coach personal',
      icon: 'chatbubble-ellipses',
      color: ['#4ECDC4', '#44A08D'],
      onPress: () => navigation.navigate('AI Trainer'),
    },
    {
      id: 'stats',
      title: 'Ver Progreso',
      subtitle: 'Estadísticas',
      icon: 'analytics',
      color: ['#A8E6CF', '#7FCDCD'],
      onPress: () => Alert.alert('Próximamente', 'Función en desarrollo'),
    },
    {
      id: 'bluetooth',
      title: 'Conectar Reloj',
      subtitle: state.bluetoothConnected ? 'Conectado' : 'Desconectado',
      icon: 'watch',
      color: state.bluetoothConnected ? ['#90EE90', '#32CD32'] : ['#FFB6C1', '#FF69B4'],
      onPress: () => toggleBluetooth(),
    },
  ];

  const toggleBluetooth = () => {
    // Simular conexión Bluetooth
    const newStatus = !state.bluetoothConnected;
    actions.toggleBluetooth(newStatus);
    
    Alert.alert(
      newStatus ? 'Conectado' : 'Desconectado',
      newStatus ? 'Dispositivo conectado exitosamente' : 'Dispositivo desconectado',
      [{ text: 'OK' }]
    );
  };

  const dailyTips = [
    '💧 Recuerda hidratarte durante el entrenamiento',
    '🧘‍♂️ La respiración correcta mejora tu rendimiento',
    '🍎 Una buena alimentación es clave para tus resultados',
    '😴 El descanso es tan importante como el ejercicio',
    '🎯 Mantén la constancia, los resultados llegarán',
  ];

  const [currentTip] = useState(dailyTips[Math.floor(Math.random() * dailyTips.length)]);

  return (
    <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName}>{state.user?.name || 'Usuario'}!</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle" size={40} color="#FF6B35" />
          </TouchableOpacity>
        </View>

        {/* Status Cards */}
        <View style={styles.statusContainer}>
          <View style={styles.statusCard}>
            <StreakCounter streaks={state.streaks} />
          </View>
          <View style={styles.statusCard}>
            <HeartRateMonitor heartRate={state.heartRate} />
          </View>
          <View style={styles.statusCard}>
            <EmotionalStateIndicator emotionalState={state.emotionalState} />
          </View>
        </View>

        {/* Daily Tip */}
        <View style={styles.tipContainer}>
          <LinearGradient
            colors={['rgba(255,107,53,0.1)', 'rgba(255,142,83,0.1)']}
            style={styles.tipGradient}
          >
            <Ionicons name="bulb" size={24} color="#FF6B35" />
            <Text style={styles.tipText}>{currentTip}</Text>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, { width: (width - 60) / 2 }]}
                onPress={action.onPress}
              >
                <LinearGradient
                  colors={action.color}
                  style={styles.actionGradient}
                >
                  <Ionicons name={action.icon} size={32} color="#FFFFFF" />
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          {state.workouts.length > 0 ? (
            <View style={styles.activityList}>
              {state.workouts.slice(-3).reverse().map((workout, index) => (
                <View key={index} style={styles.activityItem}>
                  <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
                  <View style={styles.activityText}>
                    <Text style={styles.activityTitle}>{workout.name}</Text>
                    <Text style={styles.activityDate}>{workout.date}</Text>
                  </View>
                  <Text style={styles.activityDuration}>{workout.duration}min</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyActivity}>
              <Ionicons name="fitness-outline" size={48} color="#8E8E93" />
              <Text style={styles.emptyText}>¡Aún no hay entrenamientos!</Text>
              <Text style={styles.emptySubtext}>Comienza tu primera rutina</Text>
            </View>
          )}
        </View>

        {/* Today's Goals */}
        <View style={styles.goalsContainer}>
          <Text style={styles.sectionTitle}>Objetivos de Hoy</Text>
          <View style={styles.goalsList}>
            <View style={styles.goalItem}>
              <Ionicons name="water" size={20} color="#4ECDC4" />
              <Text style={styles.goalText}>Beber 8 vasos de agua</Text>
              <View style={styles.goalProgress}>
                <View style={[styles.goalProgressBar, { width: '60%' }]} />
              </View>
            </View>
            <View style={styles.goalItem}>
              <Ionicons name="footsteps" size={20} color="#FF6B35" />
              <Text style={styles.goalText}>10,000 pasos</Text>
              <View style={styles.goalProgress}>
                <View style={[styles.goalProgressBar, { width: '40%' }]} />
              </View>
            </View>
            <View style={styles.goalItem}>
              <Ionicons name="time" size={20} color="#A8E6CF" />
              <Text style={styles.goalText}>30 min de ejercicio</Text>
              <View style={styles.goalProgress}>
                <View style={[styles.goalProgressBar, { width: '0%' }]} />
              </View>
            </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    color: '#8E8E93',
    fontSize: 16,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileButton: {
    padding: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  statusCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.2)',
  },
  tipContainer: {
    marginBottom: 25,
  },
  tipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.3)',
  },
  tipText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  actionsContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  actionCard: {
    height: 120,
    borderRadius: 15,
    overflow: 'hidden',
  },
  actionGradient: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  actionSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  activityContainer: {
    marginBottom: 25,
  },
  activityList: {
    gap: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.1)',
  },
  activityText: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  activityDate: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  activityDuration: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 10,
  },
  emptySubtext: {
    color: '#6D6D6D',
    fontSize: 14,
    marginTop: 5,
  },
  goalsContainer: {
    marginBottom: 40,
  },
  goalsList: {
    gap: 15,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 12,
  },
  goalText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  goalProgress: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
  },
  goalProgressBar: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
});

export default HomeScreen;