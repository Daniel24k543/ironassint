import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { LogBox } from 'react-native';

// Ignorar warnings durante desarrollo
LogBox.ignoreLogs([
  'Warning: ...',
  'Remote debugger',
  'Require cycle:'
]);

// Componente de error fallback
const ErrorFallback = ({ error }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTitle}>¡Ops! Algo salió mal</Text>
    <Text style={styles.errorText}>La app se reiniciará automáticamente</Text>
  </View>
);

export default function App() {
  try {
    return (
      <AppProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="light" backgroundColor="#1a1a1a" />
        </NavigationContainer>
      </AppProvider>
    );
  } catch (error) {
    console.log('App Error:', error);
    return <ErrorFallback error={error} />;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  errorTitle: {
    color: '#FF6B35',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
});
