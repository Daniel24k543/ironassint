// components/BotAvatar.js - Componente del avatar del bot con globo de texto
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

export const BotAvatar = ({ message, isTyping = false, isVisible = true }) => {
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const typingAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isVisible) {
      // Animación de aparición del avatar
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 150,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();

      // Animación de pulso sutil para el avatar
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      // Animación de desaparición
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isVisible]);

  useEffect(() => {
    if (isTyping) {
      // Animación de typing dots
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      typingAnim.setValue(0);
    }
  }, [isTyping]);

  const TypingIndicator = () => (
    <View style={styles.typingContainer}>
      {[0, 1, 2].map((index) => (
        <Animated.View
          key={index}
          style={[
            styles.typingDot,
            {
              opacity: typingAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
              transform: [{
                scale: typingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                })
              }]
            }
          ]}
        />
      ))}
    </View>
  );

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      {/* Avatar del Bot */}
      <Animated.View 
        style={[
          styles.avatarContainer,
          {
            transform: [{ scale: pulseAnim }]
          }
        ]}
      >
        {/* Por ahora usamos un placeholder, luego se puede cambiar por un avatar 3D */}
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>🤖</Text>
          <View style={styles.avatarGlow} />
        </View>
      </Animated.View>

      {/* Globo de texto */}
      <View style={styles.speechBubbleContainer}>
        <View style={styles.speechBubble}>
          {isTyping ? (
            <TypingIndicator />
          ) : (
            <Text style={styles.messageText}>{message}</Text>
          )}
          
          {/* Flecha del globo */}
          <View style={styles.speechArrow} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1F2937',
    borderWidth: 4,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  avatarText: {
    fontSize: 48,
    textAlign: 'center',
  },
  avatarGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 70,
    backgroundColor: '#3B82F6',
    opacity: 0.1,
    zIndex: -1,
  },
  speechBubbleContainer: {
    width: width - 40,
    alignItems: 'center',
  },
  speechBubble: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
    maxWidth: width - 60,
    minHeight: 80,
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#374151',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  speechArrow: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#374151',
  },
  messageText: {
    fontSize: 16,
    color: '#F9FAFB',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  typingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 24,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 3,
  },
});