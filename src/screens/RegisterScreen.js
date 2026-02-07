// Placeholder para RegisterScreen
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const RegisterScreen = () => {
  return (
    <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.text}>Pantalla de Registro</Text>
        <Text style={styles.subtext}>En desarrollo</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtext: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 10,
  },
});

export default RegisterScreen;