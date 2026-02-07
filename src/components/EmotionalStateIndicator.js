import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EmotionalStateIndicator = ({ emotionalState }) => {
  const getEmotionalData = () => {
    switch (emotionalState) {
      case 'happy':
        return {
          icon: 'happy',
          color: '#90EE90',
          text: 'Feliz',
          message: '¡Excelente!'
        };
      case 'motivated':
        return {
          icon: 'flash',
          color: '#FFD700',
          text: 'Motivado',
          message: '¡A entrenar!'
        };
      case 'tired':
        return {
          icon: 'moon',
          color: '#8E8E93',
          text: 'Cansado',
          message: 'Descansa'
        };
      case 'stressed':
        return {
          icon: 'warning',
          color: '#FF6B35',
          text: 'Estresado',
          message: 'Relájate'
        };
      case 'energetic':
        return {
          icon: 'battery-charging',
          color: '#4ECDC4',
          text: 'Enérgico',
          message: '¡Vamos!'
        };
      default:
        return {
          icon: 'remove-circle',
          color: '#8E8E93',
          text: 'Neutral',
          message: 'Normal'
        };
    }
  };

  const emotionalData = getEmotionalData();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons 
          name={emotionalData.icon} 
          size={20} 
          color={emotionalData.color} 
        />
        <Text style={styles.title}>Estado</Text>
      </View>
      <Text style={[styles.text, { color: emotionalData.color }]}>
        {emotionalData.text}
      </Text>
      <Text style={[styles.message, { color: emotionalData.color }]}>
        {emotionalData.message}
      </Text>
      
      {/* Indicador visual del estado */}
      <View style={styles.stateIndicator}>
        <View 
          style={[
            styles.stateDot,
            { 
              backgroundColor: emotionalData.color,
              width: emotionalState === 'happy' ? 16 : 
                    emotionalState === 'energetic' ? 14 :
                    emotionalState === 'motivated' ? 12 : 8
            }
          ]} 
        />
      </View>
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
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  message: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  stateIndicator: {
    width: 20,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  stateDot: {
    height: 4,
    borderRadius: 2,
    maxWidth: 20,
  },
});

export default EmotionalStateIndicator;