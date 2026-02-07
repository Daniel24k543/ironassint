// config/permissions.js - Configuración de permisos nativos

export const PERMISSIONS_CONFIG = {
  // iOS Permissions
  ios: {
    bluetooth: 'NSBluetoothAlwaysUsageDescription',
    health: 'NSHealthShareUsageDescription',
    location: 'NSLocationWhenInUseUsageDescription',
    motion: 'NSMotionUsageDescription'
  },

  // Android Permissions
  android: {
    bluetooth: [
      'android.permission.BLUETOOTH',
      'android.permission.BLUETOOTH_ADMIN',
      'android.permission.BLUETOOTH_CONNECT',
      'android.permission.BLUETOOTH_SCAN'
    ],
    location: [
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION'
    ],
    sensors: [
      'android.permission.BODY_SENSORS',
      'android.permission.ACTIVITY_RECOGNITION'
    ]
  }
};

// Mensajes de permisos mostrados al usuario
export const PERMISSION_MESSAGES = {
  bluetooth: {
    title: 'Permisos de Bluetooth',
    message: 'Esta app necesita acceso a Bluetooth para conectar con tu smartwatch y dispositivos fitness.',
    ios: 'Permettre à GymIA d\'utiliser Bluetooth pour se connecter aux appareils fitness.',
    android: 'Permitir que GymIA use Bluetooth para conectarse a dispositivos fitness.'
  },

  health: {
    title: 'Permisos de Salud',
    message: 'Acceso a datos de salud para monitorear tu frecuencia cardíaca y métricas de ejercicio.',
    ios: 'Permettre à GymIA de lire et écrire des données de santé.',
    android: 'Permitir que GymIA acceda a sensores corporales para métricas de salud.'
  },

  location: {
    title: 'Permisos de Ubicación',
    message: 'Necesario para rastrear distancia y rutas durante entrenamientos al aire libre.',
    ios: 'Permettre à GymIA d\'accéder à votre position pendant l\'utilisation.',
    android: 'Permitir que GymIA acceda a la ubicación durante entrenamientos.'
  },

  motion: {
    title: 'Permisos de Movimiento',
    message: 'Acceso a sensores de movimiento para detectar actividad física y nivel de esfuerzo.',
    ios: 'Permettre à GymIA d\'accéder aux capteurs de mouvement.',
    android: 'Permitir que GymIA acceda a sensores de actividad física.'
  }
};

// Configuración de servicios BLE para fitness devices
export const BLE_SERVICES = {
  HEART_RATE: '0000180d-0000-1000-8000-00805f9b34fb',
  BATTERY: '0000180f-0000-1000-8000-00805f9b34fb',
  DEVICE_INFO: '0000180a-0000-1000-8000-00805f9b34fb',
  FITNESS_MACHINE: '00001826-0000-1000-8000-00805f9b34fb',
  CYCLING_POWER: '00001818-0000-1000-8000-00805f9b34fb',
  RUNNING_SPEED: '00001814-0000-1000-8000-00805f9b34fb'
};

// Características BLE comunes
export const BLE_CHARACTERISTICS = {
  HEART_RATE_MEASUREMENT: '00002a37-0000-1000-8000-00805f9b34fb',
  BATTERY_LEVEL: '00002a19-0000-1000-8000-00805f9b34fb',
  MANUFACTURER_NAME: '00002a29-0000-1000-8000-00805f9b34fb',
  MODEL_NUMBER: '00002a24-0000-1000-8000-00805f9b34fb',
  FIRMWARE_REVISION: '00002a26-0000-1000-8000-00805f9b34fb'
};

// Marcas de dispositivos fitness compatibles
export const SUPPORTED_DEVICES = {
  appleWatch: {
    namePatterns: ['Apple Watch', 'Watch'],
    brandColor: '#007AFF',
    icon: 'watch'
  },
  samsungGalaxy: {
    namePatterns: ['Galaxy Watch', 'Samsung', 'SM-'],
    brandColor: '#1976D2',
    icon: 'watch'
  },
  fitbit: {
    namePatterns: ['Fitbit', 'Versa', 'Charge', 'Inspire'],
    brandColor: '#00B0B9',
    icon: 'fitness-center'
  },
  garmin: {
    namePatterns: ['Garmin', 'Forerunner', 'Fenix', 'Vivoactive'],
    brandColor: '#007CC3',
    icon: 'directions-run'
  },
  polar: {
    namePatterns: ['Polar', 'H10', 'OH1', 'Vantage'],
    brandColor: '#0090D0',
    icon: 'favorite'
  }
};

export default {
  PERMISSIONS_CONFIG,
  PERMISSION_MESSAGES,
  BLE_SERVICES,
  BLE_CHARACTERISTICS,
  SUPPORTED_DEVICES
};