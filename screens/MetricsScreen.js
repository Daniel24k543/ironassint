// screens/MetricsScreen.js - Pantalla de métricas en tiempo real
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated
} from 'react-native';
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useHealthSensors } from '../hooks/useHealthSensors';
import { useBluetooth } from '../hooks/useBluetooth';

const screenWidth = Dimensions.get('window').width;

export const MetricsScreen = ({ navigation }) => {
  const {
    heartRate,
    isHeartRateActive,
    accelerometerData,
    effortLevel,
    location,
    distance,
    isRunning,
    hasLocationPermission,
    error: sensorsError,
    startRunningSession,
    stopRunningSession,
    getEffortHistory
  } = useHealthSensors();

  const {
    isConnected,
    connectedDevice,
    batteryLevel
  } = useBluetooth();

  const [sessionTime, setSessionTime] = useState(0);
  const [heartRateHistory, setHeartRateHistory] = useState([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [calories, setCalories] = useState(0);
  const [averageHeartRate, setAverageHeartRate] = useState(0);

  // Animations
  const heartBeatAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Session timer
  useEffect(() => {
    let interval;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  // Heart rate animation
  useEffect(() => {
    if (isHeartRateActive && heartRate) {
      const bpm = heartRate;
      const interval = 60 / bpm * 1000; // Convert BPM to milliseconds

      const animate = () => {
        Animated.sequence([
          Animated.timing(heartBeatAnim, {
            toValue: 1.2,
            duration: interval / 4,
            useNativeDriver: true,
          }),
          Animated.timing(heartBeatAnim, {
            toValue: 1,
            duration: interval / 4,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isHeartRateActive) {
            setTimeout(animate, interval / 2);
          }
        });
      };

      animate();
    }
  }, [heartRate, isHeartRateActive]);

  // Pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Track heart rate history
  useEffect(() => {
    if (heartRate && isSessionActive) {
      const now = Date.now();
      setHeartRateHistory(prev => {
        const newHistory = [...prev, { timestamp: now, value: heartRate }];
        // Keep only last 5 minutes
        const fiveMinutesAgo = now - 5 * 60 * 1000;
        return newHistory.filter(entry => entry.timestamp > fiveMinutesAgo);
      });

      // Calculate average heart rate
      setAverageHeartRate(prev => {
        if (heartRateHistory.length === 0) return heartRate;
        const total = heartRateHistory.reduce((sum, entry) => sum + entry.value, 0) + heartRate;
        return Math.round(total / (heartRateHistory.length + 1));
      });

      // Estimate calories (simplified formula)
      const caloriesPerMinute = ((heartRate * 0.4) * 70) / 1000; // Very basic estimation
      setCalories(prev => prev + (caloriesPerMinute / 60));
    }
  }, [heartRate, isSessionActive]);

  const startSession = async () => {
    if (!isConnected && !isHeartRateActive) {
      Alert.alert(
        'Dispositivo no conectado',
        '¿Quieres iniciar la sesión sin smartwatch conectado?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Continuar',
            onPress: () => {
              setIsSessionActive(true);
              setSessionTime(0);
              setCalories(0);
              setHeartRateHistory([]);
            }
          }
        ]
      );
      return;
    }

    setIsSessionActive(true);
    setSessionTime(0);
    setCalories(0);
    setHeartRateHistory([]);
    
    if (hasLocationPermission) {
      await startRunningSession();
    }
  };

  const endSession = () => {
    Alert.alert(
      'Finalizar Sesión',
      '¿Estás seguro de que quieres finalizar tu entrenamiento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          onPress: () => {
            setIsSessionActive(false);
            stopRunningSession();
            // Here you would save the session data
            showSessionSummary();
          },
          style: 'destructive'
        }
      ]
    );
  };

  const showSessionSummary = () => {
    const hours = Math.floor(sessionTime / 3600);
    const minutes = Math.floor((sessionTime % 3600) / 60);
    const seconds = sessionTime % 60;
    
    Alert.alert(
      '¡Sesión Completada!',
      `Tiempo: ${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s
Calorías: ${Math.round(calories)}
Distancia: ${distance.toFixed(2)} km
Ritmo cardíaco promedio: ${averageHeartRate} bpm`,
      [{ text: 'OK' }]
    );
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (km) => {
    if (km < 1) {
      return `${(km * 1000).toFixed(0)} m`;
    }
    return `${km.toFixed(2)} km`;
  };

  const getHeartRateZone = (hr) => {
    if (hr < 100) return 'Descanso';
    if (hr < 120) return 'Ligero';
    if (hr < 140) return 'Moderado';
    if (hr < 160) return 'Intenso';
    return 'Máximo';
  };

  const getHeartRateZoneColor = (hr) => {
    if (hr < 100) return '#4CAF50';
    if (hr < 120) return '#8BC34A';
    if (hr < 140) return '#FF9800';
    if (hr < 160) return '#FF5722';
    return '#F44336';
  };

  // Chart data preparation
  const chartData = {
    labels: heartRateHistory.length > 0 
      ? heartRateHistory.map((_, index) => 
          index % Math.ceil(heartRateHistory.length / 6) === 0 ? `${Math.floor(index / 10)}m` : ''
        )
      : ['0'],
    datasets: [{
      data: heartRateHistory.length > 0 
        ? heartRateHistory.map(entry => entry.value)
        : [75],
      color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
      strokeWidth: 3
    }]
  };

  const progressData = {
    labels: ['Movimiento', 'Calorías', 'Tiempo'],
    data: [
      effortLevel / 100,
      Math.min(calories / 300, 1), // Goal: 300 calories
      Math.min(sessionTime / 3600, 1), // Goal: 1 hour
    ]
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Métricas en Vivo</Text>
          <View style={styles.connectionStatus}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: isConnected ? '#4CAF50' : (isHeartRateActive ? '#FF9800' : '#757575') }
            ]} />
            <Text style={styles.statusText}>
              {isConnected ? 'Conectado' : (isHeartRateActive ? 'Sensores Activos' : 'Sin Conexión')}
            </Text>
          </View>
        </View>

        {/* Session Controls */}
        <View style={styles.sessionControls}>
          {!isSessionActive ? (
            <TouchableOpacity
              style={styles.startButton}
              onPress={startSession}
            >
              <MaterialIcons name="play-arrow" size={32} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Iniciar Entrenamiento</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.stopButton}
              onPress={endSession}
            >
              <MaterialIcons name="stop" size={32} color="#FFFFFF" />
              <Text style={styles.stopButtonText}>Finalizar Sesión</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Main Metrics */}
        <View style={styles.metricsGrid}>
          {/* Heart Rate */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Animated.View style={{ transform: [{ scale: heartBeatAnim }] }}>
                <FontAwesome5 name="heartbeat" size={24} color="#FF6B66" />
              </Animated.View>
              <Text style={styles.metricLabel}>Ritmo Cardíaco</Text>
            </View>
            <Text style={[styles.metricValue, { color: getHeartRateZoneColor(heartRate || 0) }]}>
              {heartRate || '--'}
            </Text>
            <Text style={styles.metricUnit}>bpm</Text>
            {heartRate && (
              <Text style={[styles.heartRateZone, { color: getHeartRateZoneColor(heartRate) }]}>
                {getHeartRateZone(heartRate)}
              </Text>
            )}
          </View>

          {/* Session Time */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <MaterialIcons name="timer" size={24} color="#2196F3" />
              <Text style={styles.metricLabel}>Tiempo</Text>
            </View>
            <Text style={styles.metricValue}>
              {formatTime(sessionTime)}
            </Text>
            <Text style={styles.metricUnit}></Text>
            <Text style={styles.metricSubtext}>
              {isSessionActive ? 'En progreso' : 'No iniciado'}
            </Text>
          </View>

          {/* Calories */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <MaterialIcons name="local-fire-department" size={24} color="#FF9800" />
              <Text style={styles.metricLabel}>Calorías</Text>
            </View>
            <Text style={styles.metricValue}>
              {Math.round(calories)}
            </Text>
            <Text style={styles.metricUnit}>kcal</Text>
            <Text style={styles.metricSubtext}>
              Meta: 300 kcal
            </Text>
          </View>

          {/* Distance */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <MaterialIcons name="directions-run" size={24} color="#4CAF50" />
              <Text style={styles.metricLabel}>Distancia</Text>
            </View>
            <Text style={styles.metricValue}>
              {formatDistance(distance)}
            </Text>
            <Text style={styles.metricUnit}></Text>
            <Text style={styles.metricSubtext}>
              {isRunning ? 'Rastreando GPS' : 'GPS desactivado'}
            </Text>
          </View>
        </View>

        {/* Charts Section */}
        <View style={styles.chartsSection}>
          {/* Heart Rate Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Ritmo Cardíaco (5 min)</Text>
            <LineChart
              data={chartData}
              width={screenWidth - 60}
              height={200}
              chartConfig={{
                backgroundColor: '#1F2937',
                backgroundGradientFrom: '#1F2937',
                backgroundGradientTo: '#1F2937',
                color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#FF6B66'
                }
              }}
              style={styles.chart}
            />
          </View>

          {/* Progress Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Progreso de Objetivos</Text>
            <ProgressChart
              data={progressData}
              width={screenWidth - 60}
              height={180}
              strokeWidth={12}
              radius={25}
              chartConfig={{
                backgroundColor: '#1F2937',
                backgroundGradientFrom: '#1F2937',
                backgroundGradientTo: '#1F2937',
                color: (opacity = 1, index) => {
                  const colors = ['#4CAF50', '#FF9800', '#2196F3'];
                  return `rgba(${colors[index] === '#4CAF50' ? '76, 175, 80' : 
                                   colors[index] === '#FF9800' ? '255, 152, 0' : 
                                   '33, 150, 243'}, ${opacity})`;
                }
              }}
              style={styles.chart}
            />
          </View>
        </View>

        {/* Device Info */}
        {isConnected && connectedDevice && (
          <View style={styles.deviceInfoCard}>
            <View style={styles.deviceHeader}>
              <MaterialIcons name="watch" size={20} color="#2196F3" />
              <Text style={styles.deviceName}>{connectedDevice.name}</Text>
              {batteryLevel !== null && (
                <View style={styles.batteryInfo}>
                  <MaterialIcons name="battery-std" size={16} color="#4CAF50" />
                  <Text style={styles.batteryText}>{batteryLevel}%</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Error Display */}
        {sensorsError && (
          <View style={styles.errorCard}>
            <MaterialIcons name="error" size={20} color="#FF5252" />
            <Text style={styles.errorText}>{sensorsError}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  sessionControls: {
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  stopButton: {
    backgroundColor: '#FF5252',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  metricCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricUnit: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  metricSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  heartRateZone: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  chartsSection: {
    marginBottom: 30,
  },
  chartCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  deviceInfoCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 8,
  },
  batteryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '600',
  },
  errorCard: {
    backgroundColor: '#7F1D1D',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
});