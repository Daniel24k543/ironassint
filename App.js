import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

// Pantalla Principal
const HomeScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Iron Assistant</Text>
          <Text style={styles.subtitle}>Tu entrenador personal con IA</Text>
        </View>
        
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('Workout')}
          >
            <Text style={styles.cardTitle}>💪 Entrenamientos</Text>
            <Text style={styles.cardText}>Rutinas personalizadas con IA</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('Stats')}
          >
            <Text style={styles.cardTitle}>📊 Estadísticas</Text>
            <Text style={styles.cardText}>Seguimiento de progreso</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('AI')}
          >
            <Text style={styles.cardTitle}>🤖 Entrenador IA</Text>
            <Text style={styles.cardText}>Asistente personal inteligente</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('Store')}
          >
            <Text style={styles.cardTitle}>🛍️ Tienda</Text>
            <Text style={styles.cardText}>Productos y cupones</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

// Pantallas secundarias
const WorkoutScreen = () => (
  <SafeAreaView style={styles.container}>
    <View style={styles.screenContent}>
      <Text style={styles.screenTitle}>💪 Entrenamientos</Text>
      <Text style={styles.screenText}>Próximamente: Rutinas personalizadas</Text>
    </View>
  </SafeAreaView>
);

const StatsScreen = () => (
  <SafeAreaView style={styles.container}>
    <View style={styles.screenContent}>
      <Text style={styles.screenTitle}>📊 Estadísticas</Text>
      <Text style={styles.screenText}>Próximamente: Análisis de progreso</Text>
    </View>
  </SafeAreaView>
);

const AIScreen = () => (
  <SafeAreaView style={styles.container}>
    <View style={styles.screenContent}>
      <Text style={styles.screenTitle}>🤖 Entrenador IA</Text>
      <Text style={styles.screenText}>Próximamente: Asistente inteligente</Text>
    </View>
  </SafeAreaView>
);

const StoreScreen = () => (
  <SafeAreaView style={styles.container}>
    <View style={styles.screenContent}>
      <Text style={styles.screenTitle}>🛍️ Tienda</Text>
      <Text style={styles.screenText}>Próximamente: Productos y ofertas</Text>
    </View>
  </SafeAreaView>
);

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: '#1a1a1a' },
            headerTintColor: '#ff6b35',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Iron Assistant' }}
          />
          <Stack.Screen 
            name="Workout" 
            component={WorkoutScreen} 
            options={{ title: 'Entrenamientos' }}
          />
          <Stack.Screen 
            name="Stats" 
            component={StatsScreen} 
            options={{ title: 'Estadísticas' }}
          />
          <Stack.Screen 
            name="AI" 
            component={AIScreen} 
            options={{ title: 'Entrenador IA' }}
          />
          <Stack.Screen 
            name="Store" 
            component={StoreScreen} 
            options={{ title: 'Tienda' }}
          />
        </Stack.Navigator>
        <StatusBar style="light" backgroundColor="#1a1a1a" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  safeArea: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b35',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#cccccc',
  },
  screenContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginBottom: 20,
  },
  screenText: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
  },
});