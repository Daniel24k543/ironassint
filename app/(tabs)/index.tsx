import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useUserData } from '../../context/UserDataContext';
import { useBluetooth } from '../../context/BluetoothContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const { userData } = useUserData();
  const { connectedDevice, healthMetrics, startScanning } = useBluetooth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '¡Buenos días!';
    if (hour < 18) return '¡Buenas tardes!';
    return '¡Buenas noches!';
  };

  const getMotivationalMessage = () => {
    const messages = [
      "💪 ¡Es hora de entrenar!",
      "🔥 Tu cuerpo puede, tu mente decide",
      "⚡ Cada día eres más fuerte",
      "🎯 Enfócate en tus objetivos",
      "🚀 ¡Supérate a ti mismo!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleBluetoothConnect = () => {
    if (connectedDevice) {
      Alert.alert('Dispositivo conectado', `${connectedDevice.name} está sincronizado`);
    } else {
      startScanning();
    }
  };

  return (
    <View className="flex-1 bg-dark-100">
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#1e1e1e', '#2d2d2d', '#1a1a1a']}
        className="absolute inset-0"
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="pt-16 px-6 pb-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-white">
                {getGreeting()}
              </Text>
              <Text className="text-gray-400 text-lg">
                {user?.name || 'Usuario'}
              </Text>
            </View>
            
            <TouchableOpacity 
              onPress={signOut}
              className="w-12 h-12 rounded-full bg-gray-800/50 items-center justify-center"
            >
              <Ionicons name="log-out-outline" size={24} color="#f97316" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Motivational Card */}
        <View className="mx-6 mb-6">
          <LinearGradient
            colors={['#f97316', '#ea580c', '#dc2626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl p-6"
          >
            <Text className="text-white text-xl font-bold mb-2">
              {getMotivationalMessage()}
            </Text>
            <Text className="text-white/80">
              Racha actual: {userData.currentStreak || 0} días
            </Text>
          </LinearGradient>
        </View>

        {/* Quick Stats */}
        <View className="mx-6 mb-6">
          <Text className="text-white text-xl font-bold mb-4">
            Estadísticas de Hoy
          </Text>
          
          <View className="flex-row space-x-3">
            {/* Heart Rate */}
            <View className="flex-1 bg-gray-800/50 rounded-2xl p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="heart" size={20} color="#ef4444" />
                <Text className="text-gray-400 text-sm ml-2">BPM</Text>
              </View>
              <Text className="text-white text-2xl font-bold">
                {healthMetrics.heartRate || '--'}
              </Text>
            </View>

            {/* Steps */}
            <View className="flex-1 bg-gray-800/50 rounded-2xl p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="walk" size={20} color="#10b981" />
                <Text className="text-gray-400 text-sm ml-2">Pasos</Text>
              </View>
              <Text className="text-white text-2xl font-bold">
                {healthMetrics.steps?.toLocaleString() || '--'}
              </Text>
            </View>

            {/* Calories */}
            <View className="flex-1 bg-gray-800/50 rounded-2xl p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="flame" size={20} color="#f97316" />
                <Text className="text-gray-400 text-sm ml-2">Kcal</Text>
              </View>
              <Text className="text-white text-2xl font-bold">
                {healthMetrics.calories || '--'}
              </Text>
            </View>
          </View>
        </View>

        {/* Device Connection */}
        <View className="mx-6 mb-6">
          <Text className="text-white text-xl font-bold mb-4">
            Dispositivos
          </Text>
          
          <TouchableOpacity 
            onPress={handleBluetoothConnect}
            className="bg-gray-800/50 rounded-2xl p-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <View className={`w-12 h-12 rounded-full items-center justify-center ${
                connectedDevice ? 'bg-green-500/20' : 'bg-gray-700/50'
              }`}>
                <Ionicons 
                  name="watch" 
                  size={24} 
                  color={connectedDevice ? '#10b981' : '#666'} 
                />
              </View>
              
              <View className="ml-3">
                <Text className="text-white font-semibold">
                  {connectedDevice ? connectedDevice.name : 'Conectar dispositivo'}
                </Text>
                <Text className="text-gray-400 text-sm">
                  {connectedDevice ? 'Conectado' : 'Buscar smartwatch o banda'}
                </Text>
              </View>
            </View>
            
            <View className={`w-3 h-3 rounded-full ${
              connectedDevice ? 'bg-green-500' : 'bg-gray-600'
            }`} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View className="mx-6 mb-8">
          <Text className="text-white text-xl font-bold mb-4">
            Acciones Rápidas
          </Text>
          
          <View className="space-y-3">
            <TouchableOpacity className="bg-primary-500/20 border border-primary-500/50 rounded-2xl p-4 flex-row items-center">
              <Ionicons name="flash" size={24} color="#f97316" />
              <Text className="text-white font-semibold text-lg ml-3">
                Entrenar Ahora
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#f97316" className="ml-auto" />
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-gray-800/50 rounded-2xl p-4 flex-row items-center">
              <Ionicons name="chatbubbles" size={24} color="#f97316" />
              <Text className="text-white font-semibold text-lg ml-3">
                Hablar con Coach IA
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#666" className="ml-auto" />
            </TouchableOpacity>
          </View>
        </View>

        {/* User Profile Info */}
        {userData.onboardingCompleted && (
          <View className="mx-6 mb-8">
            <Text className="text-white text-xl font-bold mb-4">
              Tu Perfil
            </Text>
            
            <View className="bg-gray-800/50 rounded-2xl p-6">
              <View className="flex-row justify-between mb-3">
                <Text className="text-gray-400">Objetivo:</Text>
                <Text className="text-white font-medium">
                  {userData.primaryGoal === 'lose_weight' && 'Perder peso'}
                  {userData.primaryGoal === 'gain_muscle' && 'Ganar músculo'}
                  {userData.primaryGoal === 'maintain_fitness' && 'Mantener forma'}
                  {userData.primaryGoal === 'get_stronger' && 'Ser más fuerte'}
                </Text>
              </View>
              
              <View className="flex-row justify-between mb-3">
                <Text className="text-gray-400">Nivel:</Text>
                <Text className="text-white font-medium">
                  {userData.fitnessLevel === 'beginner' && 'Principiante'}
                  {userData.fitnessLevel === 'intermediate' && 'Intermedio'}
                  {userData.fitnessLevel === 'advanced' && 'Avanzado'}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-400">Entrenamientos por semana:</Text>
                <Text className="text-white font-medium">
                  {userData.workoutFrequency || 'No definido'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}