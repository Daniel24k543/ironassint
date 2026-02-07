import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Importar pantallas
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import AITrainerScreen from '../screens/AITrainerScreen';
import ShopScreen from '../screens/ShopScreen';
import FeedScreen from '../screens/FeedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useApp } from '../context/AppContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Navegación de autenticación
const AuthNavigator = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
      gestureEnabled: false 
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
  </Stack.Navigator>
);

// Navegación principal con tabs
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Workout') {
          iconName = focused ? 'fitness' : 'fitness-outline';
        } else if (route.name === 'AI Trainer') {
          iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
        } else if (route.name === 'Feed') {
          iconName = focused ? 'play-circle' : 'play-circle-outline';
        } else if (route.name === 'Shop') {
          iconName = focused ? 'storefront' : 'storefront-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#FF6B35',
      tabBarInactiveTintColor: '#8E8E93',
      tabBarStyle: {
        backgroundColor: '#1C1C1E',
        borderTopColor: '#38383A',
        height: 85,
        paddingBottom: 20,
        paddingTop: 10,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
      },
      headerStyle: {
        backgroundColor: '#1C1C1E',
      },
      headerTitleStyle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
      },
      headerTintColor: '#FF6B35',
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen}
      options={{ title: 'Inicio' }}
    />
    <Tab.Screen 
      name="Workout" 
      component={WorkoutScreen}
      options={{ title: 'Entrenar' }}
    />
    <Tab.Screen 
      name="AI Trainer" 
      component={AITrainerScreen}
      options={{ title: 'IA Coach' }}
    />
    <Tab.Screen 
      name="Feed" 
      component={FeedScreen}
      options={{ title: 'Feed' }}
    />
    <Tab.Screen 
      name="Shop" 
      component={ShopScreen}
      options={{ title: 'Tienda' }}
    />
  </Tab.Navigator>
);

// Navegador principal
const AppNavigator = () => {
  const { state } = useApp();
  
  if (state.isLoading) {
    return null; // Puedes agregar una pantalla de carga aquí
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {state.isLoggedIn ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          presentation: 'modal',
          headerShown: true,
          title: 'Perfil',
          headerStyle: { backgroundColor: '#1C1C1E' },
          headerTitleStyle: { color: '#FFFFFF' },
          headerTintColor: '#FF6B35',
        }} 
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;