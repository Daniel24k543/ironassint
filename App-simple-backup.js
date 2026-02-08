import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>🏋️‍♂️ Iron Assistant</Text>
        <Text style={styles.subtitle}>Tu entrenador personal con IA</Text>
      </View>
      
      <View style={styles.content}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>💪 Empezar Entrenamiento</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>📊 Ver Estadísticas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>🤖 IA Entrenador</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>🛒 Tienda</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.footer}>Versión 1.0.0 - Conectado ✅</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    color: '#666',
    fontSize: 12,
    marginTop: 40,
    textAlign: 'center',
  },
});