// hooks/useBluetooth.js - Custom hook para gestión de Bluetooth
import { useState, useEffect, useRef } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid, Alert } from 'react-native';

export const useBluetooth = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [deviceBattery, setDeviceBattery] = useState(null);
  
  const bleManagerRef = useRef(new BleManager());

  // Check permissions
  useEffect(() => {
    checkPermissions();
    
    return () => {
      if (bleManagerRef.current) {
        bleManagerRef.current.destroy();
      }
    };
  }, []);

  const checkPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        
        const allGranted = Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED
        );
        
        setHasPermission(allGranted);
        
        if (!allGranted) {
          Alert.alert(
            'Permisos Requeridos',
            'Esta app necesita permisos de Bluetooth y ubicación para conectar con dispositivos de fitness.',
            [{ text: 'OK' }]
          );
        }
      } else {
        // iOS permissions are handled by the system
        setHasPermission(true);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setError('Error verificando permisos');
    }
  };

  const startDeviceScan = () => {
    if (!hasPermission) {
      checkPermissions();
      return;
    }

    setIsScanning(true);
    setDevices([]);
    setError(null);

    bleManagerRef.current.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Scan error:', error);
        setError('Error escaneando dispositivos: ' + error.message);
        setIsScanning(false);
        return;
      }

      if (device && device.name && isFitnessDevice(device)) {
        setDevices(prevDevices => {
          const index = prevDevices.findIndex(d => d.id === device.id);
          if (index !== -1) {
            return prevDevices.map((d, i) => i === index ? device : d);
          } else {
            return [...prevDevices, device];
          }
        });
      }
    });

    // Stop scanning after 15 seconds
    setTimeout(() => {
      stopDeviceScan();
    }, 15000);
  };

  const stopDeviceScan = () => {
    bleManagerRef.current.stopDeviceScan();
    setIsScanning(false);
  };

  const connectToDevice = async (device) => {
    try {
      setError(null);
      console.log('Connecting to device:', device.name);
      
      const connectedDevice = await bleManagerRef.current.connectToDevice(device.id);
      await connectedDevice.discoverAllServicesAndCharacteristics();
      
      setConnectedDevice(connectedDevice);
      
      // Try to read battery level
      await getBatteryLevel(connectedDevice);
      
      Alert.alert(
        'Conectado',
        `Dispositivo ${device.name || device.id} conectado exitosamente`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Connection error:', error);
      setError('Error conectando dispositivo: ' + error.message);
    }
  };

  const disconnectDevice = async () => {
    if (connectedDevice) {
      try {
        await bleManagerRef.current.cancelDeviceConnection(connectedDevice.id);
        setConnectedDevice(null);
        setDeviceBattery(null);
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }
  };

  const getBatteryLevel = async (device) => {
    try {
      // Battery Service UUID
      const BATTERY_SERVICE_UUID = '0000180F-0000-1000-8000-00805F9B34FB';
      const BATTERY_CHARACTERISTIC_UUID = '00002A19-0000-1000-8000-00805F9B34FB';
      
      const characteristic = await device.readCharacteristicForService(
        BATTERY_SERVICE_UUID,
        BATTERY_CHARACTERISTIC_UUID
      );
      
      if (characteristic.value) {
        const batteryLevel = Buffer.from(characteristic.value, 'base64')[0];
        setDeviceBattery(batteryLevel);
      }
    } catch (error) {
      console.log('Could not read battery level:', error.message);
      // Battery service might not be available on all devices
    }
  };

  // Helper function to identify fitness devices
  const isFitnessDevice = (device) => {
    const fitnessKeywords = [
      'watch', 'band', 'fit', 'heart', 'polar', 'garmin', 
      'apple', 'samsung', 'xiaomi', 'amazfit', 'fitbit',
      'health', 'sport', 'running', 'cycling'
    ];
    
    const deviceName = (device.name || '').toLowerCase();
    return fitnessKeywords.some(keyword => deviceName.includes(keyword));
  };

  return {
    isScanning,
    devices,
    connectedDevice,
    error,
    hasPermission,
    deviceBattery,
    startDeviceScan,
    stopDeviceScan,
    connectToDevice,
    disconnectDevice,
    getBatteryLevel
  };
};