import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert, Permission, PermissionsAndroid, Platform } from 'react-native';
import { realBluetoothService } from '../services/RealBluetoothService';

export interface BluetoothDevice {
  id: string;
  name: string;
  address: string;
  rssi?: number;
  connected: boolean;
  type: 'smartwatch' | 'heart_rate_monitor' | 'fitness_band' | 'other';
}

export interface HealthMetrics {
  heartRate?: number;
  steps?: number;
  calories?: number;
  distance?: number;
  lastUpdated: Date;
}

interface BluetoothContextType {
  isScanning: boolean;
  devices: BluetoothDevice[];
  connectedDevice: BluetoothDevice | null;
  healthMetrics: HealthMetrics;
  startScanning: () => Promise<void>;
  stopScanning: () => Promise<void>;
  connectToDevice: (device: BluetoothDevice) => Promise<boolean>;
  disconnectDevice: () => Promise<void>;
  isBluetoothEnabled: boolean;
  requestPermissions: () => Promise<boolean>;
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined);

export function BluetoothProvider({ children }: { children: React.ReactNode }) {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({
    lastUpdated: new Date(),
  });

  useEffect(() => {
    checkBluetoothStatus();
    
    // Check for already connected devices
    const connectedDevicesList = realBluetoothService.getConnectedDevices();
    if (connectedDevicesList.length > 0) {
      const device = connectedDevicesList[0];
      setConnectedDevice({
        id: device.id,
        name: device.name,
        address: device.id,
        rssi: device.rssi,
        connected: true,
        type: device.type === 'smartwatch' ? 'smartwatch' : 
              device.type === 'heart_rate_monitor' ? 'heart_rate_monitor' : 
              device.type === 'fitness_tracker' ? 'fitness_band' : 'other'
      });
    }
  }, []);

  const checkBluetoothStatus = async () => {
    try {
      const enabled = await realBluetoothService.isBluetoothEnabled();
      setIsBluetoothEnabled(enabled);
    } catch (error) {
      console.error('Error checking Bluetooth status:', error);
      setIsBluetoothEnabled(false);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        const allGranted = Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          Alert.alert('Permisos necesarios', 'Los permisos de Bluetooth son necesarios para conectar dispositivos');
          return false;
        }
        return true;
      } catch (error) {
        console.error('Error requesting permissions:', error);
        return false;
      }
    }
    return true; // iOS handles permissions differently
  };

  const startScanning = async () => {
    try {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) return;

      const bluetoothEnabled = await realBluetoothService.isBluetoothEnabled();
      if (!bluetoothEnabled) {
        await realBluetoothService.requestBluetoothEnable();
        return;
      }

      setIsScanning(true);
      
      // Use real Bluetooth scanning
      const discoveredDevices = await realBluetoothService.startScanning();
      
      // Convert to our format
      const formattedDevices = discoveredDevices.map(device => ({
        id: device.id,
        name: device.name,
        address: device.id, // BLE uses UUID instead of MAC
        rssi: device.rssi,
        connected: device.isConnected,
        type: device.type === 'smartwatch' ? 'smartwatch' : 
              device.type === 'heart_rate_monitor' ? 'heart_rate_monitor' : 
              device.type === 'fitness_tracker' ? 'fitness_band' : 'other' as const
      }));
      
      setDevices(formattedDevices);
      
      // Auto stop scanning after 10 seconds
      setTimeout(() => {
        setIsScanning(false);
        realBluetoothService.stopScanning();
      }, 10000);
      
    } catch (error) {
      console.error('Error starting scan:', error);
      setIsScanning(false);
      Alert.alert('Error', 'No se pudo iniciar el escaneo de dispositivos');
    }
  };

  const stopScanning = async () => {
    realBluetoothService.stopScanning();
    setIsScanning(false);
  };

  const connectToDevice = async (device: BluetoothDevice): Promise<boolean> => {
    try {
      const success = await realBluetoothService.connectToDevice(device.id);
      
      if (success) {
        const connectedDeviceData = { ...device, connected: true };
        setConnectedDevice(connectedDeviceData);
        
        // Update devices list
        setDevices(prev => 
          prev.map(d => 
            d.id === device.id 
              ? connectedDeviceData 
              : { ...d, connected: false }
          )
        );

        Alert.alert(
          'Conectado', 
          `Dispositivo ${device.name} conectado exitosamente`
        );
        
        // Start listening to health metrics
        realBluetoothService.subscribeToHealthMetrics('context', (metrics) => {
          setHealthMetrics({
            heartRate: metrics.heartRate,
            steps: metrics.steps,
            calories: metrics.calories,
            distance: metrics.distance,
            lastUpdated: new Date(metrics.timestamp)
          });
        });
      } else {
        Alert.alert('Error', `No se pudo conectar a ${device.name}`);
      }
      
      return success;
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert('Error', `No se pudo conectar a ${device.name}`);
      return false;
    }
  };

  const disconnectDevice = async () => {
    try {
      if (connectedDevice) {
        const success = await realBluetoothService.disconnectFromDevice(connectedDevice.id);
        
        if (success) {
          realBluetoothService.unsubscribeFromHealthMetrics('context');
          setConnectedDevice(null);
          setDevices(prev => 
            prev.map(d => 
              d.id === connectedDevice.id 
                ? { ...d, connected: false } 
                : d
            )
          );
          
          Alert.alert('Desconectado', 'Dispositivo desconectado');
        }
      }
    } catch (error) {
      console.error('Disconnection error:', error);
    }
  };

  const value: BluetoothContextType = {
    isScanning,
    devices,
    connectedDevice,
    healthMetrics,
    startScanning,
    stopScanning,
    connectToDevice,
    disconnectDevice,
    isBluetoothEnabled,
    requestPermissions,
  };

  return (
    <BluetoothContext.Provider value={value}>
      {children}
    </BluetoothContext.Provider>
  );
}

export function useBluetooth() {
  const context = useContext(BluetoothContext);
  if (context === undefined) {
    throw new Error('useBluetooth must be used within a BluetoothProvider');
  }
  return context;
}