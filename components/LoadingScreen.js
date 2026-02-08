import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { StatusBar } from 'expo-status-bar';

// Importar la animación directamente
import loadingAnimation from '../assets/loading-animation.json';

const { width, height } = Dimensions.get('window');

const LoadingScreen = ({ 
  message = "Iniciando Iron Assistant...", 
  showRetryButton = false,
  onRetry = null 
}) => {
  const animationRef = useRef(null);

  useEffect(() => {
    // Iniciar la animación cuando se monta el componente
    if (animationRef.current) {
      animationRef.current.play();
    }
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Animación Lottie */}
      <View style={styles.animationContainer}>
        <LottieView
          ref={animationRef}
          source={loadingAnimation}
          style={styles.animation}
          autoPlay={true}
          loop={true}
          speed={1}
        />
      </View>

      {/* Contenido de texto */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>🏋️‍♂️ Iron Assistant</Text>
        <Text style={styles.subtitle}>tu entrenador personal con IA</Text>
        <Text style={styles.message}>{message}</Text>
      </View>

      {/* Indicador de puntos animados */}
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, styles.dot1]} />
        <View style={[styles.dot, styles.dot2]} />
        <View style={[styles.dot, styles.dot3]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  animationContainer: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#888888',
    textAlign: 'center',
    marginBottom: 30,
  },
  message: {
    fontSize: 18,
    fontWeight: '500',
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginHorizontal: 4,
  },
  dot1: {
    opacity: 1,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 0.4,
  },
});

export default LoadingScreen;