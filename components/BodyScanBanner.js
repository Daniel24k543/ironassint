// components/BodyScanBanner.js - Banner para escaneo corporal en ProfileScreen
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const BodyScanBanner = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <LinearGradient
        colors={['#1E3A8A', '#3B82F6', '#1E40AF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Icono de escaneo */}
          <View style={styles.iconContainer}>
            <Ionicons name="body" size={28} color="#FFFFFF" />
          </View>

          {/* Texto principal */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>Escanea tu cuerpo</Text>
            <Text style={styles.subtitle}>Obtén métricas de tu físico con IA</Text>
          </View>

          {/* Chevron derecha */}
          <View style={styles.chevronContainer}>
            <MaterialIcons name="chevron-right" size={24} color="#E5E7EB" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 18,
  },
  chevronContainer: {
    padding: 4,
  },
});