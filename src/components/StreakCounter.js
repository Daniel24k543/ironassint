import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StreakCounter = ({ streaks }) => {
  const scaleAnimation = new Animated.Value(1);

  useEffect(() => {
    // Animar cuando cambia el streak
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 1.3,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [streaks]);

  const getStreakColor = () => {
    if (streaks === 0) return '#8E8E93';
    if (streaks < 3) return '#4ECDC4';
    if (streaks < 7) return '#90EE90';
    if (streaks < 14) return '#FFD700';
    return '#FF6B35';
  };

  const getStreakMessage = () => {
    if (streaks === 0) return 'Comienza hoy';
    if (streaks === 1) return '¡Buen comienzo!';
    if (streaks < 7) return '¡Sigue así!';
    if (streaks < 14) return '¡Increíble!';
    return '¡Imparable!';
  };

  const streakColor = getStreakColor();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="flame" size={20} color={streakColor} />
        <Text style={styles.title}>Racha</Text>
      </View>
      <Animated.Text 
        style={[
          styles.value, 
          { 
            color: streakColor,
            transform: [{ scale: scaleAnimation }]
          }
        ]}
      >
        {streaks}
      </Animated.Text>
      <Text style={styles.unit}>días</Text>
      <Text style={[styles.message, { color: streakColor }]}>
        {getStreakMessage()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#8E8E93',
    fontSize: 12,
    marginLeft: 5,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  unit: {
    color: '#8E8E93',
    fontSize: 10,
    marginBottom: 5,
  },
  message: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default StreakCounter;