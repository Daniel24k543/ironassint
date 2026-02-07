// dependencies.md - Lista completa de dependencias para Iron Assistant

# 📦 Dependencias de Iron Assistant

## 🔧 Dependencias Principales

### Expo & React Native

```json
{
  "expo": "~54.0.33",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "expo-dev-client": "~5.0.12"
}
```

### Navegación

```json
{
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/stack": "^6.3.20",
  "@react-navigation/bottom-tabs": "^6.5.11",
  "react-native-screens": "~4.16.0",
  "react-native-safe-area-context": "^5.6.2",
  "expo-router": "^6.0.23"
}
```

### UI & Styling

```json
{
  "nativewind": "^4.2.1",
  "@expo/vector-icons": "^15.0.3",
  "react-native-svg": "15.12.1",
  "expo-linear-gradient": "^15.0.8"
}
```

### SmartWatch & Sensores

```json
{
  "react-native-ble-plx": "^3.1.2",
  "expo-sensors": "^15.0.8",
  "expo-location": "^19.0.8",
  "react-native-health": "^1.19.0"
}
```

### Gráficos & Charts

```json
{
  "react-native-chart-kit": "^6.12.0"
}
```

### Storage & Datos

```json
{
  "@react-native-async-storage/async-storage": "^2.2.0"
}
```

### Otros Módulos Expo

```json
{
  "expo-status-bar": "~3.0.9",
  "expo-constants": "^18.0.13",
  "expo-device": "^8.0.10",
  "expo-haptics": "^15.0.8",
  "expo-av": "^16.0.8"
}
```

## 🔨 Comandos de Instalación

### Instalación Completa

```bash
# Navegación
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs

# Dependencias de navegación para React Native
npx expo install react-native-screens react-native-safe-area-context

# SmartWatch y Sensores
npx expo install expo-sensors expo-location react-native-ble-plx

# Gráficos
npm install react-native-chart-kit

# Storage
npx expo install @react-native-async-storage/async-storage

# UI y Styling
npm install nativewind

# Health (solo iOS automático, Android requiere config manual)
npm install react-native-health
```

### Instalación por Características

#### Solo Onboarding

```bash
npm install @react-navigation/native @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install @react-native-async-storage/async-storage
```

#### SmartWatch & Métricas

```bash
npx expo install expo-dev-client expo-sensors expo-location
npm install react-native-ble-plx react-native-chart-kit
# iOS: npm install react-native-health
```

## ⚙️ Configuraciones Requeridas

### app.json (Permisos y Plugins)

```json
{
  "expo": {
    "developmentClient": {
      "silentLaunch": true
    },
    "ios": {
      "infoPlist": {
        "NSBluetoothAlwaysUsageDescription": "Esta app usa Bluetooth para conectar con dispositivos fitness.",
        "NSHealthShareUsageDescription": "Esta app lee datos de salud para monitorear entrenamientos.",
        "NSLocationWhenInUseUsageDescription": "Esta app usa ubicación para rastrear entrenamientos.",
        "NSMotionUsageDescription": "Esta app usa sensores de movimiento para detectar actividad física."
      }
    },
    "android": {
      "permissions": [
        "android.permission.BLUETOOTH",
        "android.permission.BLUETOOTH_ADMIN",
        "android.permission.BLUETOOTH_CONNECT",
        "android.permission.BLUETOOTH_SCAN",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.BODY_SENSORS"
      ]
    },
    "plugins": [
      [
        "react-native-ble-plx",
        {
          "isBackgroundEnabled": true,
          "modes": ["peripheral", "central"],
          "bluetoothAlwaysPermission": "Esta app usa Bluetooth para dispositivos fitness."
        }
      ]
    ]
  }
}
```

### NativeWind (tailwind.config.js)

```javascript
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

## 🚨 Consideraciones de Desarrollo

### Expo Go vs expo-dev-client

- **Onboarding**: Funciona en Expo Go ✅
- **SmartWatch/Sensores**: Requiere expo-dev-client ⚠️

### Comandos para Testing

```bash
# Expo Go (solo onboarding)
npx expo start

# Device real con sensores
npx expo run:ios     # iPhone físico
npx expo run:android # Android físico
```

### Platform Differences

- **iOS**: HealthKit automático, mejor soporte BLE
- **Android**: Requiere permisos runtime adicionales
- **Web**: Limitado, solo UI components funcionan

## 📱 Estructura Recomendada

```
iron-assistant/
├── package.json          # Todas las dependencias
├── app.json              # Configuración Expo
├── tailwind.config.js    # NativeWind setup
├── global.css            # Estilos globales
├── context/              # React Context (onboarding)
├── hooks/                # Custom hooks (bluetooth, sensors)
├── components/           # UI components reutilizables
├── screens/              # Pantallas principales
└── config/               # Configuraciones y constantes
```

## 🔄 Actualizaciones Futuras

### Dependencias a Considerar

- **react-native-keychain**: Para credenciales seguras
- **react-native-gesture-handler**: Para gestos avanzados
- **react-native-reanimated**: Para animaciones complejas
- **expo-camera**: Para escaneo QR de dispositivos
- **expo-notifications**: Para recordatorios de entrenamientos

---

_Última actualización: Febrero 2026 - Iron Assistant v1.0_
