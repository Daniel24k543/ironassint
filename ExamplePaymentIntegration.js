// ExamplePaymentIntegration.js - Ejemplo de cómo integrar PaymentScreen
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { PaymentScreen } from './screens/PaymentScreen';

const Stack = createStackNavigator();

// Ejemplo de pantalla que puede navegar a Payment
const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iron Assistant</Text>
      <Text style={styles.subtitle}>Tu entrenador personal con IA</Text>
      
      {/* Botón para ir a suscripción premium */}
      <TouchableOpacity
        style={styles.upgradeButton}
        onPress={() => navigation.navigate('Payment')}
      >
        <FontAwesome5 name="crown" size={20} color="#F59E0B" />
        <Text style={styles.upgradeText}>Upgrade a Premium</Text>
      </TouchableOpacity>

      {/* Otros botones de la app */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Rutinas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Progreso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>SmartWatch</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function PaymentNavigationExample() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#121212' }
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
        />
        <Stack.Screen 
          name="Payment" 
          component={PaymentScreen}
          options={{
            // Opcional: agregar header personalizado
            gestureEnabled: false, // Evitar swipe back durante pago
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 40,
  },
  upgradeButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  upgradeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  optionsContainer: {
    width: '100%',
    gap: 16,
  },
  option: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#F9FAFB',
    fontWeight: '600',
  },
});

/*
USO CON EXPO ROUTER:

// app/(tabs)/payment.js
import { PaymentScreen } from '../screens/PaymentScreen';
export default PaymentScreen;

// app/(tabs)/index.js (Home)
import { Link } from 'expo-router';

export default function Home() {
  return (
    <View>
      <Link href="/payment" asChild>
        <TouchableOpacity style={upgradeButtonStyle}>
          <Text>Upgrade a Premium</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

INTEGRACIÓN EN TU APP EXISTENTE:

// En cualquier screen donde quieras mostrar el botón de upgrade
import { useNavigation } from '@react-navigation/native';

function YourScreen() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Payment')}
    >
      <Text>Hazte Premium</Text>
    </TouchableOpacity>
  );
}
*/