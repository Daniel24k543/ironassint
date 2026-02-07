// ExampleOnboardingIntegration.js - Ejemplo de integración del sistema de onboarding
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';

import { OnboardingProvider } from './context/OnboardingContext';
import { OnboardingScreen } from './screens/OnboardingScreen';

const Stack = createStackNavigator();

// Ejemplo de Home Screen que puede usar los datos del onboarding
const HomeScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
        ¡Bienvenido a Iron Assistant! 💪
      </Text>
      <Text style={{ color: '#9CA3AF', textAlign: 'center', margin: 20 }}>
        Tu perfil ha sido guardado y tu rutina personalizada está lista
      </Text>
    </View>
  );
};

export default function ExampleOnboardingApp() {
  return (
    <OnboardingProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#121212" />
        <Stack.Navigator
          initialRouteName="Onboarding"
          screenOptions={{
            headerShown: false,
            gestureEnabled: false,
            animationTypeForReplace: 'push',
          }}
        >
          <Stack.Screen 
            name="Onboarding" 
            component={OnboardingScreen}
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </OnboardingProvider>
  );
}

/*
INSTRUCCIONES DE USO:

1. INSTALACIÓN DE DEPENDENCIAS:
npm install @react-navigation/native @react-navigation/stack @expo/vector-icons react-native-screens react-native-safe-area-context

2. CONFIGURACIÓN NATIVEWIND:
- Asegúrate de tener tailwind.config.js configurado
- Importa './global.css' en tu App.js principal

3. USO CON EXPO ROUTER:
// app/_layout.js
import { OnboardingProvider } from '../context/OnboardingContext';

export default function RootLayout() {
  return (
    <OnboardingProvider>
      <Stack>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </OnboardingProvider>
  );
}

// app/onboarding.js
import { OnboardingScreen } from '../screens/OnboardingScreen';
export default OnboardingScreen;

4. ACCEDER A DATOS DEL USUARIO:
import { useOnboarding } from './context/OnboardingContext';

function AnyScreen() {
  const { userProfile } = useOnboarding();
  
  // userProfile contiene:
  // {
  //   nombre: 'Juan',
  //   edad: '25',
  //   genero: 'masculino',
  //   peso: '75',
  //   estatura: '180',
  //   nivelActividad: 'moderado',
  //   objetivo: 'subir_peso',
  //   lesiones: 'Ninguna',
  //   diasDisponibles: '3-4',
  //   motivacion: 'Quiero sentirme mejor...'
  // }
  
  return (
    <View>
      <Text>Hola {userProfile.nombre}</Text>
      <Text>Tu objetivo: {userProfile.objetivo}</Text>
    </View>
  );
}

5. PERSONALIZACIÓN:
- Cambia colores en los StyleSheets
- Modifica las preguntas en OnboardingContext.js
- Cambia el avatar 3D en BotAvatar.js
- Ajusta mensajes motivacionales en OnboardingScreen.js
*/