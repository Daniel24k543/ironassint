import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { signIn } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.replace('/(auth)/onboarding');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo iniciar sesión con Google');
    }
  };

  const handleEmailSignIn = () => {
    // For demo, use mock credentials
    Alert.alert(
      'Demo Login',
      'Esta es una demostración. En producción aquí iría el formulario de email/password.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Demo Login', 
          onPress: async () => {
            try {
              await signIn({
                email: 'demo@ironassistant.com',
                name: 'Usuario Demo',
                id: 'demo_' + Date.now(),
              });
              router.replace('/(tabs)');
            } catch (error) {
              Alert.alert('Error', 'No se pudo iniciar sesión');
            }
          }
        }
      ]
    );
  };

  const handleGuestLogin = () => {
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-dark-100">
      <StatusBar style="light" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#1e1e1e', '#2d2d2d', '#1e1e1e']}
        className="absolute inset-0"
      />

      {/* Animated Content */}
      <Animated.View 
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
        className="flex-1 justify-center items-center px-8"
      >
        {/* Logo/Bot Placeholder */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }]
          }}
          className="mb-12"
        >
          <View className="w-40 h-40 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 items-center justify-center shadow-2xl">
            {/* 3D Bot Placeholder */}
            <View className="w-32 h-32 rounded-full bg-primary-600/20 items-center justify-center">
              <Ionicons name="fitness" size={64} color="#f97316" />
              
              {/* AI Indicator */}
              <View className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 items-center justify-center">
                <View className="w-3 h-3 rounded-full bg-white/90" />
              </View>
            </View>
            
            {/* Pulsing Ring */}
            <Animated.View 
              style={{
                transform: [{ scale: scaleAnim }]
              }}
              className="absolute w-44 h-44 rounded-full border-2 border-primary-500/30"
            />
          </View>
        </Animated.View>

        {/* App Title */}
        <View className="items-center mb-16">
          <Text className="text-4xl font-bold text-white mb-2">
            Iron Assistant
          </Text>
          <Text className="text-lg text-gray-400 text-center">
            Tu entrenador personal con IA
          </Text>
          <Text className="text-sm text-primary-500 mt-2">
            🤖 Powered by AI • 💪 Built for Champions
          </Text>
        </View>

        {/* Sign In Buttons */}
        <View className="w-full space-y-4">
          {/* Email Sign In Button */}
          <TouchableOpacity
            onPress={handleEmailSignIn}
            className="w-full h-14 flex-row items-center justify-center bg-primary-500 rounded-2xl shadow-lg"
            style={{
              shadowColor: '#f97316',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Ionicons name="mail" size={24} color="white" />
            <Text className="text-lg font-semibold text-white ml-3">
              Continuar con Email
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-gray-600" />
            <Text className="px-4 text-gray-400 text-sm">o</Text>
            <View className="flex-1 h-px bg-gray-600" />
          </View>

          {/* Google Sign In Button */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            className="w-full h-14 flex-row items-center justify-center bg-white rounded-2xl shadow-lg"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Ionicons name="logo-google" size={24} color="#DB4437" />
            <Text className="text-lg font-semibold text-gray-800 ml-3">
              Continuar con Google
            </Text>
          </TouchableOpacity>

          {/* Guest Access */}
          <TouchableOpacity
            onPress={handleGuestLogin}
            className="w-full h-14 items-center justify-center border-2 border-primary-500/50 rounded-2xl"
          >
            <Text className="text-lg font-semibold text-primary-500">
              Acceso de Invitado
            </Text>
          </TouchableOpacity>
        </View>

        {/* Features Preview */}
        <View className="mt-16 space-y-3">
          <View className="flex-row items-center">
            <Ionicons name="flash" size={16} color="#f97316" />
            <Text className="text-gray-400 text-sm ml-2">
              🤖 Coach IA real con OpenAI
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="cloud" size={16} color="#f97316" />
            <Text className="text-gray-400 text-sm ml-2">
              ☁️ Sincronización con Firebase
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="heart" size={16} color="#f97316" />
            <Text className="text-gray-400 text-sm ml-2">
              ♥️ Rutinas personalizadas
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="trophy" size={16} color="#f97316" />
            <Text className="text-gray-400 text-sm ml-2">
              🏆 Sistema de logros inteligente
            </Text>
          </View>
        </View>

        {/* Terms */}
        <Text className="text-xs text-gray-500 text-center mt-8 px-4">
          Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad
        </Text>
      </Animated.View>

      {/* Floating Elements */}
      <View className="absolute top-20 right-8 w-16 h-16 rounded-full bg-primary-500/10 items-center justify-center">
        <Ionicons name="fitness" size={24} color="#f97316" />
      </View>
      
      <View className="absolute bottom-32 left-8 w-12 h-12 rounded-full bg-primary-600/10 items-center justify-center">
        <Ionicons name="flash" size={16} color="#ea580c" />
      </View>
    </View>
  );
}