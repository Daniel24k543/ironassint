// ExampleUsage.js - Ejemplo de cómo usar las pantallas en React Navigation

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

// Import de las pantallas
import { SmartWatchScreen, MetricsScreen } from './screens';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'SmartWatch') {
              iconName = 'bluetooth';
            } else if (route.name === 'Metrics') {
              iconName = 'analytics';
            }

            return <MaterialIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            backgroundColor: '#1F2937',
            borderTopColor: '#374151',
          },
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="SmartWatch" 
          component={SmartWatchScreen}
          options={{
            title: 'Dispositivo'
          }}
        />
        <Tab.Screen 
          name="Metrics" 
          component={MetricsScreen}
          options={{
            title: 'Métricas'
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

/* 
EJEMPLO DE USO INDIVIDUAL:

import { SmartWatchScreen, MetricsScreen } from './screens';
import { useBluetooth, useHealthSensors } from './hooks';

// En cualquier componente
function MyComponent() {
  const bluetooth = useBluetooth();
  const sensors = useHealthSensors();

  return (
    <View>
      {bluetooth.isConnected && <MetricsScreen />}
      {!bluetooth.isConnected && <SmartWatchScreen />}
    </View>
  );
}
*/