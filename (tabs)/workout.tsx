import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function WorkoutScreen() {
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
          <Text className="text-3xl font-bold text-white mb-2">
            Entrenamientos
          </Text>
          <Text className="text-gray-400 text-lg">
            Elige tu rutina perfecta
          </Text>
        </View>

        {/* Quick Start */}
        <View className="mx-6 mb-6">
          <LinearGradient
            colors={['#dc2626', '#b91c1c', '#991b1b']}
            className="rounded-2xl p-6"
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white text-2xl font-bold mb-2">
                  ⚡ Inicio Rápido
                </Text>
                <Text className="text-white/80">
                  Rutina personalizada con IA
                </Text>
              </View>
              <TouchableOpacity className="bg-white/20 rounded-full p-3">
                <Ionicons name="play" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Workout Categories */}
        <View className="mx-6 mb-6">
          <Text className="text-white text-xl font-bold mb-4">
            Categorías
          </Text>
          
          <View className="space-y-3">
            <TouchableOpacity className="bg-gray-800/50 rounded-2xl p-4 flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-red-500/20 items-center justify-center mr-4">
                <Ionicons name="heart" size={24} color="#ef4444" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-lg">Cardio</Text>
                <Text className="text-gray-400">Quema calorías y mejora tu resistencia</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-800/50 rounded-2xl p-4 flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-blue-500/20 items-center justify-center mr-4">
                <Ionicons name="barbell" size={24} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-lg">Fuerza</Text>
                <Text className="text-gray-400">Desarrolla músculo y poder</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-800/50 rounded-2xl p-4 flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-green-500/20 items-center justify-center mr-4">
                <Ionicons name="leaf" size={24} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-lg">Flexibilidad</Text>
                <Text className="text-gray-400">Yoga y estiramientos</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-800/50 rounded-2xl p-4 flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-orange-500/20 items-center justify-center mr-4">
                <Ionicons name="flash" size={24} color="#f97316" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-lg">HIIT</Text>
                <Text className="text-gray-400">Entrenamientos de alta intensidad</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Workouts */}
        <View className="mx-6 mb-8">
          <Text className="text-white text-xl font-bold mb-4">
            Entrenamientos Recientes
          </Text>
          
          <View className="bg-gray-800/50 rounded-2xl p-6 items-center">
            <Ionicons name="fitness-outline" size={48} color="#666" />
            <Text className="text-gray-400 text-lg mt-4 mb-2">
              No hay entrenamientos recientes
            </Text>
            <Text className="text-gray-500 text-center">
              ¡Comienza tu primer entrenamiento para ver tu historial aquí!
            </Text>
            
            <TouchableOpacity className="mt-4 bg-primary-500 rounded-xl px-6 py-3">
              <Text className="text-white font-semibold">
                Empezar Ahora
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}