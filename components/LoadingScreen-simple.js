import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const LoadingScreen = ({ 
  message = "Iniciando Iron Assistant...", 
  showRetryButton = false,
  onRetry = null 
}) => {
  const pulseAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Animación de pulso continua
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Animación de rotación continua  
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    // Animación de escala suave
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    rotateAnimation.start();
    scaleAnimation.start();

    return () => {
      pulseAnimation.stop();
      rotateAnimation.stop(); 
      scaleAnimation.stop();
    };
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Círculos animados de fondo */}
      <Animated.View 
        style={[
          styles.backgroundCircle,
          styles.circle1,
          { 
            transform: [
              { scale: pulseAnim },
              { rotate: rotateInterpolate }
            ] 
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.backgroundCircle,
          styles.circle2,
          { 
            transform: [
              { scale: scaleAnim },
            ] 
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.backgroundCircle,
          styles.circle3,
          { 
            transform: [
              { scale: pulseAnim },
            ] 
          }
        ]} 
      />

      {/* Icono principal animado */}
      <Animated.View 
        style={[
          styles.iconContainer,
          { 
            transform: [
              { scale: scaleAnim },
              { rotate: rotateInterpolate }
            ] 
          }
        ]}
      >
        <Text style={styles.icon}>🏋️‍♂️</Text>
      </Animated.View>

      {/* Contenido de texto */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Iron Assistant</Text>
        <Text style={styles.subtitle}>tu entrenador personal con IA</Text>
        <Text style={styles.message}>{message}</Text>
      </View>

      {/* Indicador de puntos animados */}
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.dot, { opacity: scaleAnim }]} />  
        <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
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
  // Círculos animados de fondo
  backgroundCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 1000,
    opacity: 0.1,
  },
  circle1: {
    width: 200,
    height: 200,
    borderColor: '#3b82f6',
    top: height * 0.2,
  },
  circle2: {
    width: 300,
    height: 300,
    borderColor: '#10b981',
    top: height * 0.1,
  },
  circle3: {
    width: 150,
    height: 150,
    borderColor: '#f59e0b',
    bottom: height * 0.2,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  icon: {
    fontSize: 60,
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
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
    marginHorizontal: 6,
  },
});

export default LoadingScreen;