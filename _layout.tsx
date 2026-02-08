import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';
import { AuthProvider } from '../context/AuthContext';
import { UserDataProvider } from '../context/UserDataContext';
import { BluetoothProvider } from '../context/BluetoothContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <UserDataProvider>
          <BluetoothProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#1e1e1e' }
              }}
            >
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="light" backgroundColor="#1e1e1e" />
          </BluetoothProvider>
        </UserDataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}