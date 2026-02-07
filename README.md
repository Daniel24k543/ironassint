# 🏋️‍♂️ GymIA - Tu Entrenador Personal con Inteligencia Artificial

## 🌟 Descripción

**GymIA** es una aplicación móvil revolucionaria de fitness que combina inteligencia artificial con gamificación para crear la experiencia de entrenamiento más personalizada y motivacional del mercado.

### ✨ Características Principales

- 🤖 **IA Entrenador Personal**: Asistente inteligente que adapta rutinas según tu perfil
- 💓 **Monitoreo Emocional**: Detecta tu estado emocional y ajusta música/entrenamientos
- 📱 **Conectividad Bluetooth**: Sincronización con smartwatches y dispositivos fitness
- 🎵 **Música Inteligente**: Reproduce automáticamente música según tu estado emocional
- 🔥 **Sistema de Rachas**: Gamificación con recompensas y logros
- 🛒 **Tienda Integrada**: Sistema de ruleta con cupones y patrocinios
- 📺 **Feed Social**: Contenido motivacional estilo TikTok
- 🎯 **Rutinas Personalizadas**: Ejercicios adaptados a tu nivel y objetivos

## 🚀 Nuevas Funcionalidades - SmartWatch Integration

### 📱 Pantallas Implementadas

#### 1. SmartWatch Connection Screen (`/screens/SmartWatchScreen.js`)

- **Escaneo automático** de dispositivos Bluetooth LE
- **Conexión en tiempo real** con smartwatches y fitness trackers
- **Filtrado inteligente** para mostrar solo dispositivos de fitness
- **Indicadores visuales** de estado de conexión y batería
- **Configuración avanzada** con auto-reconexión y notificaciones
- **Soporte multi-marca**: Apple Watch, Samsung Galaxy Watch, Fitbit, Garmin, Polar

#### 2. Real-Time Metrics Screen (`/screens/MetricsScreen.js`)

- **Monitoreo cardíaco** en tiempo real con animaciones
- **Gráficos interactivos** de ritmo cardíaco (5 minutos histórico)
- **Tracking GPS** para distancia y ubicación durante entrenamientos
- **Cálculo de calorías** basado en esfuerzo y frecuencia cardíaca
- **Detección de movimiento** usando acelerómetro y giroscopio
- **Zonas de entrenamiento** automáticas (Descanso, Ligero, Moderado, Intenso, Máximo)
- **Timer de sesión** con resumen completo al finalizar

#### 3. Payment Screen (`/screens/PaymentScreen.js`) - 💳 NUEVO

- **Bot IA interactivo** con mensaje de bienvenida motivacional
- **Plan Premium elegante** con lista de características incluidas
- **Integración MercadoPago** real con WebBrowser de Expo
- **Modal de transferencia bancaria** con datos BCP completos
- **Feedback post-pago** con loading y confirmación de éxito
- **Diseño premium** fondo #121212, cards #1E1E1E, botón púrpura vibrante

### 🛠️ Hooks Personalizados

#### `useBluetooth()` - Gestión de Conectividad

```javascript
const {
  isScanning,
  isConnected,
  connectedDevice,
  scannedDevices,
  batteryLevel,
  connectionStatus,
  startDeviceScan,
  connectToDevice,
  disconnectDevice,
} = useBluetooth();
```

#### `useHealthSensors()` - Métricas de Salud

```javascript
const {
  heartRate,
  accelerometerData,
  effortLevel,
  distance,
  location,
  isRunning,
  startRunningSession,
  stopRunningSession,
} = useHealthSensors();
```

### ⚙️ Configuración para Hardware Real

**⚠️ IMPORTANTE: Esta implementación requiere expo-dev-client y dispositivos físicos.**

#### Dependencies Agregadas:

```json
{
  "expo-dev-client": "~5.0.12",
  "react-native-ble-plx": "^3.1.2",
  "react-native-chart-kit": "^6.12.0",
  "expo-sensors": "^15.0.8",
  "expo-location": "^19.0.8",
  "react-native-health": "^1.19.0",
  "expo-web-browser": "^14.0.1"
}
```

#### Permisos Nativos Configurados:

- **iOS**: Health, Bluetooth Always Usage, Location, Motion
- **Android**: Bluetooth Connect/Scan, Fine Location, Body Sensors
- **Plugins**: react-native-ble-plx con soporte background

#### Comandos para Dispositivos Reales:

```bash
npx expo run:ios     # iOS dispositivo físico
npx expo run:android # Android dispositivo físico
```

## 🚀 Tecnologías Utilizadas

- **Frontend**: React Native con Expo + expo-dev-client
- **Estado**: React Context + AsyncStorage
- **Navegación**: React Navigation v6
- **UI**: React Native Elements + Styled Components
- **Bluetooth**: expo-bluetooth
- **Audio**: expo-av
- **Sensores**: expo-sensors
- **Animaciones**: React Native Reanimated
- **Gradientes**: expo-linear-gradient

## 📋 Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn
- Expo CLI
- Expo Go app en tu dispositivo móvil

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd GymIA
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar el proyecto

```bash
npm start
```

### 4. Abrir en tu dispositivo

- Escanea el código QR con la app Expo Go
- O abre en el simulador/emulador

## 📱 Uso de la Aplicación

### 🔐 Login & Registro

1. **Login Elegante**: Interfaz moderna con animaciones fluidas
2. **Registro Guiado**: IA te guía paso a paso en el onboarding
3. **Datos Personales**: Peso, altura, nivel fitness, objetivos

### 🏠 Pantalla Principal

- **Dashboard**: Resumen de estadísticas (rachas, ritmo cardíaco, estado emocional)
- **Acciones Rápidas**: Botones para entrenar, hablar con IA, conectar dispositivos
- **Consejos Diarios**: Tips personalizados
- **Actividad Reciente**: Historial de entrenamientos

### 💪 Entrenamientos

- **Rutinas por IA**: Generadas según tu perfil y estado emocional
- **Rutinas Predefinidas**: Para principiantes, intermedios y avanzados
- **Ejercicios Rápidos**: Sesiones de 2-10 minutos
- **Seguimiento**: Contador automático de rachas

### 🤖 IA Entrenador

- **Chat Inteligente**: Conversación natural con tu coach personal
- **Preguntas Frecuentes**: Respuestas rápidas a dudas comunes
- **Análisis Emocional**: Detecta tu estado y adapta respuestas
- **Motivación Personalizada**: Mensajes según tu progreso

### 🛒 Tienda

- **Ruleta de Premios**: Gira y gana cupones de descuento
- **Catálogo de Productos**: Suplementos, ropa deportiva, accesorios
- **Sistema de Puntos**: Gana recompensas entrenando
- **Patrocinios**: Marcas oficiales con ofertas exclusivas

### 📺 Feed Social

- **Contenido Motivacional**: Videos estilo TikTok
- **Categorías**: Motivación, ejercicios, nutrición, historias de éxito
- **Interacciones**: Like, compartir, guardar
- **Live Streams**: Entrenamientos en vivo

## 🎯 Funcionalidades Avanzadas

### 💓 Monitoreo de Salud

```javascript
// Detección automática de ritmo cardíaco
const heartRate = BluetoothService.getHeartRate();

// Análisis del estado emocional
const emotionalState = EmotionalAnalysisService.analyzeEmotionalState(
  heartRate,
  activityLevel,
  timeOfDay,
);
```

### 🎵 Música Inteligente

```javascript
// Selección automática de música según estado emocional
const playlist = MusicService.getMotivationalPlaylist(
  emotionalState,
  workoutType,
);
```

### 🔗 Conectividad Bluetooth

```javascript
// Búsqueda y conexión de dispositivos
const devices = await BluetoothService.scanForDevices();
const connected = await BluetoothService.connectToDevice(deviceId);
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── AIAvatar.js     # Avatar animado de la IA
│   ├── HeartRateMonitor.js
│   ├── StreakCounter.js
│   └── EmotionalStateIndicator.js
├── screens/            # Pantallas principales
│   ├── LoginScreen.js  # Login elegante con animaciones
│   ├── OnboardingScreen.js # Registro guiado por IA
│   ├── HomeScreen.js   # Dashboard principal
│   ├── WorkoutScreen.js # Entrenamientos
│   ├── AITrainerScreen.js # Chat con IA
│   ├── ShopScreen.js   # Tienda y ruleta
│   ├── FeedScreen.js   # Feed social
│   └── ProfileScreen.js # Perfil del usuario
├── navigation/         # Configuración de navegación
│   └── AppNavigator.js
├── context/           # Estado global
│   └── AppContext.js  # Context principal con reducers
├── services/          # APIs y servicios
│   └── AppServices.js # IA, Bluetooth, música, etc.
├── utils/            # Utilidades
└── hooks/            # Hooks personalizados
```

## 🎨 Diseño y UX

### Paleta de Colores

- **Primario**: `#FF6B35` (Naranja energético)
- **Secundario**: `#4ECDC4` (Verde azulado)
- **Fondo**: `#1a1a1a` (Negro profundo)
- **Texto**: `#FFFFFF` (Blanco)
- **Acento**: `#FFD700` (Dorado para recompensas)

### Tipografía

- **Títulos**: Bold, 20-28px
- **Subtítulos**: Semi-bold, 16-18px
- **Cuerpo**: Regular, 14-16px
- **Captions**: 12px

## 📊 Estado de la Aplicación

### Context Principal

```javascript
const initialState = {
  user: null,
  isLoggedIn: false,
  workouts: [],
  streaks: 0,
  emotionalState: "neutral",
  heartRate: 0,
  bluetoothConnected: false,
  aiConversation: [],
  rewards: 0,
  shopItems: [],
  feed: [],
};
```

## 🔧 Desarrollo y Contribución

### Scripts Disponibles

```bash
npm start          # Iniciar en desarrollo
npm run android    # Ejecutar en Android
npm run ios        # Ejecutar en iOS (requiere macOS)
npm run web        # Ejecutar en navegador
```

### Agregar Nuevas Funcionalidades

1. **Componentes**: Crear en `/src/components/`
2. **Pantallas**: Agregar en `/src/screens/`
3. **Servicios**: Extender `/src/services/AppServices.js`
4. **Estado**: Actualizar `/src/context/AppContext.js`

## 🎮 Gamificación

### Sistema de Puntos

- **Entrenamiento completado**: 10 puntos base
- **Rutina larga (+30 min)**: +5 puntos
- **Nivel intermedio**: +3 puntos
- **Nivel avanzado**: +5 puntos

### Logros Disponibles

- 🔥 **Semana Completa**: 7 días consecutivos
- 💪 **Guerrero**: 10 entrenamientos
- 🏆 **Imparable**: 30 días de racha
- ⭐ **Experto**: 100 entrenamientos

## 🔮 Roadmap Futuro

### Versión 1.1

- [ ] Integración con APIs reales de IA (OpenAI/Gemini)
- [ ] Bluetooth real con dispositivos físicos
- [ ] Sistema de notificaciones push
- [ ] Analytics detallados de progreso

### Versión 1.2

- [ ] Comunidad social completa
- [ ] Challenges grupales
- [ ] Integración con redes sociales
- [ ] Modo offline

### Versión 2.0

- [ ] Realidad aumentada para ejercicios
- [ ] IA de visión para corrección de posturas
- [ ] Wearable integration avanzada
- [ ] Marketplace de entrenadores

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de Metro**:

   ```bash
   npx react-native start --reset-cache
   ```

2. **Problemas de dependencias**:

   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Expo Go no conecta**:
   - Verificar misma red WiFi
   - Reiniciar Expo CLI
   - Usar túnel: `expo start --tunnel`

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollador Principal**: Tu Nombre
- **Diseño UX/UI**: Tu Nombre
- **IA & Backend**: Tu Nombre

## 📞 Soporte

- **Email**: soporte@gymia.app
- **Website**: [www.gymia.app](http://www.gymia.app)
- **Discord**: [GymIA Community](https://discord.gg/gymia)

---

### 🚀 ¡Transforma tu vida fitness con GymIA!

**"Tu mejor versión está a un entrenamiento de distancia"** 💪
