// ExampleNavigationConfig.js - Ejemplo de cómo agregar las nuevas pantallas
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importar tus pantallas existentes
// import { HomeScreen } from './screens/HomeScreen';
// import { ProfileScreen } from './screens/ProfileScreen';

// Importar las nuevas pantallas de escaneo corporal
import { 
  BodyScanIntroScreen, 
  BodyScanCaptureScreen,
  SmartWatchScreen,
  MetricsScreen,
  OnboardingScreen,
  PaymentScreen
} from './screens';

const Stack = createStackNavigator();

export const AppNavigationExample = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#121212',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Tus pantallas existentes */}
        {/* <Stack.Screen name="Home" component={HomeScreen} /> */}
        {/* <Stack.Screen name="Profile" component={ProfileScreen} /> */}

        {/* Nuevas pantallas de escaneo corporal */}
        <Stack.Screen 
          name="BodyScanIntro" 
          component={BodyScanIntroScreen}
          options={{
            title: 'Escaneo Corporal con IA',
            headerBackTitle: 'Perfil'
          }}
        />
        
        <Stack.Screen 
          name="BodyScanCapture" 
          component={BodyScanCaptureScreen}
          options={{
            title: 'Captura tu Progreso',
            headerBackTitle: 'Atrás'
          }}
        />

        {/* Pantallas existentes de las iteraciones anteriores */}
        <Stack.Screen 
          name="SmartWatch" 
          component={SmartWatchScreen}
          options={{ title: 'SmartWatch' }}
        />
        
        <Stack.Screen 
          name="Metrics" 
          component={MetricsScreen}
          options={{ title: 'Métricas' }}
        />

        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{ title: 'Registro', headerShown: false }}
        />

        <Stack.Screen 
          name="Payment" 
          component={PaymentScreen}
          options={{ title: 'Suscripción Premium' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

/*
FLUJO DE NAVEGACIÓN ESPERADO:

1. ProfileScreen → BodyScanIntroScreen
   - Usuario toca el banner de escaneo corporal
   - navigation.navigate('BodyScanIntro')

2. BodyScanIntroScreen → BodyScanCaptureScreen
   - Usuario toca "Comenzar Escaneo"
   - navigation.navigate('BodyScanCapture')

3. BodyScanCaptureScreen → ProfileScreen
   - Usuario completa el escaneo
   - navigation.goBack() o navigation.navigate('Profile')

PARÁMETROS DE NAVEGACIÓN OPCIONALES:

navigation.navigate('BodyScanCapture', {
  userId: user.id,
  previousScanDate: lastScanDate,
  scanType: 'progress' // 'initial' | 'progress'
});

EJEMPLO DE USO EN ProfileScreen.js:

const handleBodyScanPress = () => {
  // Opcional: verificar permisos de cámara antes de navegar
  navigation.navigate('BodyScanIntro', {
    returnTo: 'Profile',
    userWeight: userData.weight,
    userHeight: userData.height
  });
};
*/