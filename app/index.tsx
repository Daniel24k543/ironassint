import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function AppIndex() {
  const { isAuthenticated, isLoading } = useAuth();
  const { userData } = useUserData();

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View className="flex-1 bg-dark-100 items-center justify-center">
        <LinearGradient
          colors={['#1e1e1e', '#2d2d2d', '#1e1e1e']}
          className="absolute inset-0"
        />
        
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-primary-500 items-center justify-center mb-4">
            <Ionicons name="fitness" size={40} color="#fff" />
          </View>
          
          <Text className="text-white text-2xl font-bold mb-2">
            Iron Assistant
          </Text>
          
          <Text className="text-gray-400">
            Cargando...
          </Text>
        </View>
      </View>
    );
  }

  // Redirect based on authentication state
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // If authenticated but onboarding not completed
  if (!userData.onboardingCompleted) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  // If authenticated and onboarding completed, go to main app
  return <Redirect href="/(tabs)" />;
}