import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const AIAvatar = ({ isActive = false, size = 80 }) => {
  const pulseAnimation = new Animated.Value(0);
  const glowAnimation = new Animated.Value(0);

  useEffect(() => {
    if (isActive) {
      // Animación de pulso
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animación de brillo
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isActive]);

  const pulseScale = pulseAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Efecto de brillo exterior */}
      {isActive && (
        <Animated.View
          style={[
            styles.glowContainer,
            {
              width: size * 1.5,
              height: size * 1.5,
              borderRadius: (size * 1.5) / 2,
              opacity: glowOpacity,
            },
          ]}
        />
      )}
      
      {/* Avatar principal */}
      <Animated.View
        style={[
          styles.avatarContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ scale: pulseScale }],
          },
        ]}
      >
        <LinearGradient
          colors={['#FF6B35', '#FF8E53', '#FFA570']}
          style={[styles.gradient, { width: size, height: size, borderRadius: size / 2 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.iconContainer}>
            <Ionicons 
              name="flash" 
              size={size * 0.4} 
              color="#FFFFFF" 
            />
          </View>
        </LinearGradient>
      </Animated.View>
      
      {/* Partículas flotantes */}
      {isActive && (
        <>
          <Animated.View
            style={[
              styles.particle,
              styles.particle1,
              { opacity: glowOpacity },
            ]}
          />
          <Animated.View
            style={[
              styles.particle,
              styles.particle2,
              { opacity: glowOpacity },
            ]}
          />
          <Animated.View
            style={[
              styles.particle,
              styles.particle3,
              { opacity: glowOpacity },
            ]}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(255,107,53,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,107,53,0.5)',
  },
  avatarContainer: {
    elevation: 10,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B35',
  },
  particle1: {
    top: 10,
    right: 15,
  },
  particle2: {
    bottom: 15,
    left: 10,
  },
  particle3: {
    top: 30,
    left: -5,
  },
});

export default AIAvatar;