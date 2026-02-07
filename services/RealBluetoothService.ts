import { BleManager, Device, Service, Characteristic, State } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

export interface BluetoothDevice {
  id: string;
  name: string;
  type: 'smartwatch' | 'fitness_tracker' | 'heart_rate_monitor' | 'scale';
  isConnected: boolean;
  batteryLevel?: number;
  rssi?: number;
}

export interface HealthMetrics {
  heartRate?: number;
  steps?: number;
  calories?: number;
  distance?: number;
  weight?: number;
  bloodOxygen?: number;
  timestamp: number;
}

// Known fitness device UUIDs
const FITNESS_DEVICE_UUIDS = {
  HEART_RATE: '0000180D-0000-1000-8000-00805f9b34fb',
  FITNESS_MACHINE: '00001826-0000-1000-8000-00805f9b34fb',
  DEVICE_INFO: '0000180A-0000-1000-8000-00805f9b34fb',
  BATTERY: '0000180F-0000-1000-8000-00805f9b34fb',
  CYCLING_POWER: '00001818-0000-1000-8000-00805f9b34fb',
  RUNNING_SPEED: '00001814-0000-1000-8000-00805f9b34fb',
};

const CHARACTERISTIC_UUIDS = {
  HEART_RATE_MEASUREMENT: '00002A37-0000-1000-8000-00805f9b34fb',
  BATTERY_LEVEL: '00002A19-0000-1000-8000-00805f9b34fb',
  DEVICE_NAME: '00002A00-0000-1000-8000-00805f9b34fb',
  MANUFACTURER_NAME: '00002A29-0000-1000-8000-00805f9b34fb',
};

class RealBluetoothService {
  private bleManager: BleManager;
  private connectedDevices: Map<string, Device> = new Map();
  private healthMetrics: HealthMetrics = { timestamp: Date.now() };
  private listeners: Map<string, (data: HealthMetrics) => void> = new Map();
  private scanTimeout: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor() {
    this.bleManager = new BleManager();
    this.initialize();
  }

  private async initialize() {
    try {
      // Request permissions on Android
      if (Platform.OS === 'android') {
        await this.requestAndroidPermissions();
      }

      // Monitor Bluetooth state
      this.bleManager.onStateChange((state) => {
        console.log('Bluetooth state:', state);
        if (state === 'PoweredOn') {
          this.isInitialized = true;
        } else {
          this.isInitialized = false;
          this.stopScanning();
        }
      }, true);

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Bluetooth:', error);
      this.isInitialized = false;
    }
  }

  private async requestAndroidPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      const apiLevel = Platform.constants.Release;
      
      if (apiLevel >= 31) {
        // Android 12+
        const permissions = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ];

        const granted = await PermissionsAndroid.requestMultiple(permissions);
        return Object.values(granted).every(status => status === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        // Android < 12
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  async startScanning(): Promise<BluetoothDevice[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const discoveredDevices: BluetoothDevice[] = [];
    const deviceMap = new Map<string, BluetoothDevice>();

    try {
      console.log('Starting BLE scan...');
      
      this.bleManager.startDeviceScan(
        Object.values(FITNESS_DEVICE_UUIDS),
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            console.error('Scan error:', error);
            return;
          }

          if (device && device.name && !deviceMap.has(device.id)) {
            const deviceType = this.determineDeviceType(device);
            const bluetoothDevice: BluetoothDevice = {
              id: device.id,
              name: device.name,
              type: deviceType,
              isConnected: false,
              rssi: device.rssi,
            };

            deviceMap.set(device.id, bluetoothDevice);
            discoveredDevices.push(bluetoothDevice);
          }
        }
      );

      // Stop scanning after 10 seconds
      this.scanTimeout = setTimeout(() => {
        this.stopScanning();
      }, 10000);

      return discoveredDevices;
    } catch (error) {
      console.error('Failed to start scanning:', error);
      throw error;
    }
  }

  stopScanning() {
    try {
      this.bleManager.stopDeviceScan();
      if (this.scanTimeout) {
        clearTimeout(this.scanTimeout);
        this.scanTimeout = null;
      }
      console.log('BLE scan stopped');
    } catch (error) {
      console.error('Failed to stop scanning:', error);
    }
  }

  async connectToDevice(deviceId: string): Promise<boolean> {
    try {
      const device = await this.bleManager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      
      this.connectedDevices.set(deviceId, device);
      
      // Start monitoring health data
      await this.startMonitoringDevice(device);
      
      console.log(`Connected to device: ${device.name}`);
      return true;
    } catch (error) {
      console.error(`Failed to connect to device ${deviceId}:`, error);
      return false;
    }
  }

  async disconnectFromDevice(deviceId: string): Promise<boolean> {
    try {
      const device = this.connectedDevices.get(deviceId);
      if (device) {
        await device.cancelConnection();
        this.connectedDevices.delete(deviceId);
        console.log(`Disconnected from device: ${deviceId}`);
      }
      return true;
    } catch (error) {
      console.error(`Failed to disconnect from device ${deviceId}:`, error);
      return false;
    }
  }

  private async startMonitoringDevice(device: Device) {
    try {
      // Monitor heart rate
      const heartRateChar = await this.findCharacteristic(
        device, 
        FITNESS_DEVICE_UUIDS.HEART_RATE,
        CHARACTERISTIC_UUIDS.HEART_RATE_MEASUREMENT
      );

      if (heartRateChar) {
        device.monitorCharacteristicForService(
          FITNESS_DEVICE_UUIDS.HEART_RATE,
          CHARACTERISTIC_UUIDS.HEART_RATE_MEASUREMENT,
          (error, characteristic) => {
            if (error) {
              console.error('Heart rate monitoring error:', error);
              return;
            }
            
            if (characteristic?.value) {
              const heartRate = this.parseHeartRateData(characteristic.value);
              this.updateHealthMetrics({ heartRate });
            }
          }
        );
      }

      // Monitor battery level
      const batteryChar = await this.findCharacteristic(
        device,
        FITNESS_DEVICE_UUIDS.BATTERY,
        CHARACTERISTIC_UUIDS.BATTERY_LEVEL
      );

      if (batteryChar) {
        const batteryData = await batteryChar.read();
        if (batteryData.value) {
          const batteryLevel = this.parseBatteryLevel(batteryData.value);
          // Update device battery level in your state management
        }
      }

    } catch (error) {
      console.error('Failed to start monitoring device:', error);
    }
  }

  private async findCharacteristic(
    device: Device, 
    serviceUUID: string, 
    characteristicUUID: string
  ): Promise<Characteristic | null> {
    try {
      const services = await device.services();
      const service = services.find(s => s.uuid.toLowerCase() === serviceUUID.toLowerCase());
      
      if (!service) return null;
      
      const characteristics = await service.characteristics();
      return characteristics.find(c => c.uuid.toLowerCase() === characteristicUUID.toLowerCase()) || null;
    } catch (error) {
      console.error('Failed to find characteristic:', error);
      return null;
    }
  }

  private determineDeviceType(device: Device): BluetoothDevice['type'] {
    const name = device.name?.toLowerCase() || '';
    
    if (name.includes('apple watch') || name.includes('galaxy watch') || name.includes('fitbit')) {
      return 'smartwatch';
    } else if (name.includes('tracker') || name.includes('band')) {
      return 'fitness_tracker';
    } else if (name.includes('heart') || name.includes('polar') || name.includes('garmin')) {
      return 'heart_rate_monitor';
    } else if (name.includes('scale') || name.includes('weight')) {
      return 'scale';
    } else {
      return 'fitness_tracker'; // Default
    }
  }

  private parseHeartRateData(base64Data: string): number {
    try {
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Heart Rate Measurement format (according to Bluetooth specification)
      const flags = buffer[0];
      const is16Bit = (flags & 0x01) === 1;
      
      if (is16Bit) {
        // 16-bit heart rate value
        return buffer.readUInt16LE(1);
      } else {
        // 8-bit heart rate value
        return buffer[1];
      }
    } catch (error) {
      console.error('Failed to parse heart rate data:', error);
      return 0;
    }
  }

  private parseBatteryLevel(base64Data: string): number {
    try {
      const buffer = Buffer.from(base64Data, 'base64');
      return buffer[0]; // Battery level is a single byte (0-100)
    } catch (error) {
      console.error('Failed to parse battery level:', error);
      return 0;
    }
  }

  private updateHealthMetrics(newData: Partial<HealthMetrics>) {
    this.healthMetrics = {
      ...this.healthMetrics,
      ...newData,
      timestamp: Date.now(),
    };

    // Notify all listeners
    this.listeners.forEach(callback => {
      callback(this.healthMetrics);
    });
  }

  // Public API methods
  getHealthMetrics(): HealthMetrics {
    return { ...this.healthMetrics };
  }

  getConnectedDevices(): BluetoothDevice[] {
    return Array.from(this.connectedDevices.entries()).map(([id, device]) => ({
      id,
      name: device.name || 'Unknown Device',
      type: this.determineDeviceType(device),
      isConnected: true,
      rssi: device.rssi,
    }));
  }

  subscribeToHealthMetrics(listenerId: string, callback: (data: HealthMetrics) => void) {
    this.listeners.set(listenerId, callback);
  }

  unsubscribeFromHealthMetrics(listenerId: string) {
    this.listeners.delete(listenerId);
  }

  async isBluetoothEnabled(): Promise<boolean> {
    try {
      const state = await this.bleManager.state();
      return state === 'PoweredOn';
    } catch (error) {
      console.error('Failed to check Bluetooth state:', error);
      return false;
    }
  }

  async requestBluetoothEnable(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        // On Android, we can prompt user to enable Bluetooth
        Alert.alert(
          'Bluetooth Desactivado',
          'Por favor, activa Bluetooth para conectar con dispositivos fitness',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Configuración', 
              onPress: () => {
                // Open Bluetooth settings
                // Note: You might need react-native-android-intent for this
              }
            },
          ]
        );
      }
      return false;
    } catch (error) {
      console.error('Failed to request Bluetooth enable:', error);
      return false;
    }
  }

  // Simulate realistic fitness data for demo purposes
  simulateWorkoutData(workoutType: 'cardio' | 'strength' | 'yoga') {
    const baseHeartRate = workoutType === 'cardio' ? 140 : 
                         workoutType === 'strength' ? 110 : 80;
    
    const variation = Math.floor(Math.random() * 20) - 10;
    const heartRate = Math.max(60, baseHeartRate + variation);
    
    this.updateHealthMetrics({
      heartRate,
      calories: Math.floor(Math.random() * 50) + (workoutType === 'cardio' ? 200 : 150),
      steps: workoutType === 'cardio' ? Math.floor(Math.random() * 1000) + 500 : 0,
    });
  }

  destroy() {
    this.stopScanning();
    this.connectedDevices.forEach(async (device) => {
      try {
        await device.cancelConnection();
      } catch (error) {
        console.error('Error disconnecting device on destroy:', error);
      }
    });
    this.connectedDevices.clear();
    this.listeners.clear();
    this.bleManager.destroy();
  }
}

export const realBluetoothService = new RealBluetoothService();