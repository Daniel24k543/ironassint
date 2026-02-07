import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HeartRateMonitor = ({ heartRate }) => {
  const pulseAnimation = new Animated.Value(0);

  useEffect(() => {
    if (heartRate > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [heartRate]);

  const pulseScale = pulseAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const getHeartRateStatus = () => {
    if (heartRate === 0) return { text: 'No detectado', color: '#8E8E93' };
    if (heartRate < 60) return { text: 'Relajado', color: '#4ECDC4' };
    if (heartRate < 100) return { text: 'Normal', color: '#90EE90' };
    if (heartRate < 150) return { text: 'Activo', color: '#FFD700' };
    return { text: 'Intenso', color: '#FF6B35' };
  };

  const status = getHeartRateStatus();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.View style={{ transform: [{ scale: pulseScale }] }}>
          <Ionicons name="heart" size={20} color={status.color} />
        </Animated.View>
        <Text style={styles.title}>Ritmo Cardíaco</Text>
      </View>
      <Text style={[styles.value, { color: status.color }]}>
        {heartRate > 0 ? `${heartRate}` : '--'}
      </Text>
      <Text style={styles.unit}>BPM</Text>
      <Text style={[styles.status, { color: status.color }]}>
        {status.text}
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
  status: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default HeartRateMonitor;