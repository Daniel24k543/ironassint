# 🤖 Iron Assistant - Sistema de Onboarding Inteligente

Sistema completo de onboarding/registro para Iron Assistant con bot interactivo, validaciones y animaciones profesionales.

## 📋 Características Implementadas

### 🎯 Sistema de Preguntas Inteligente

- **10 preguntas personalizadas** con validación en tiempo real
- **Tipos de entrada múltiples**: texto, número, selección múltiple
- **Validaciones específicas** para cada tipo de dato
- **Navegación bidireccional** con botones anterior/siguiente
- **Prevención de teclado** tapando preguntas

### 🤖 Bot Interactivo (Iron Assistant)

- **Avatar animado** con efectos de pulso y brillo
- **Globo de texto profesional** con animaciones de escritura
- **Indicador de typing** con puntos animados
- **Personalización dinámica** de mensajes según respuestas
- **Animaciones de entrada/salida** suaves

### 🎨 UI/UX Premium

- **Diseño dark mode** profesional (#121212)
- **Animaciones fluidas** entre transiciones
- **Barra de progreso** animada
- **Botones grandes** y tipografía moderna
- **Indicadores visuales** de error y éxito
- **Responsive design** para diferentes tamaños de pantalla

### 💾 Gestión de Estado

- **Context API** para manejo global de datos
- **AsyncStorage** integrado (futuro)
- **Validación en tiempo real**
- **Estado persistente** durante navegación

## 🗂️ Estructura de Archivos

```
├── context/
│   ├── OnboardingContext.js     # Context principal con 10 preguntas
│   └── index.js                 # Exports del context
├── components/
│   ├── BotAvatar.js            # Avatar del bot con globo de texto
│   ├── QuestionCard.js         # Componente para diferentes tipos de preguntas
│   └── index.js                # Exports de componentes
├── screens/
│   ├── OnboardingScreen.js     # Pantalla principal del onboarding
│   └── index.js                # Exports de pantallas
└── config/
    └── permissions.js          # Configuraciones (heredado de smartwatch)
```

## 📊 Preguntas del Onboarding

1. **Nombre** - Texto libre (mín. 2 caracteres)
2. **Edad** - Número (13-80 años)
3. **Género** - Selección múltiple (4 opciones + no especifica)
4. **Peso actual** - Número (30-300 kg)
5. **Estatura** - Número (100-250 cm)
6. **Nivel de actividad** - Selección (sedentario a muy activo)
7. **Objetivo principal** - Selección (bajar/mantener/subir peso, etc.)
8. **Lesiones previas** - Texto libre (con validación)
9. **Días disponibles** - Selección (1-2 hasta 7 días)
10. **Motivación personal** - Texto libre (mín. 5 caracteres)

## 🚀 Uso Rápido

### Setup Básico

```javascript
import { OnboardingProvider } from "./context/OnboardingContext";
import { OnboardingScreen } from "./screens/OnboardingScreen";

export default function App() {
  return (
    <OnboardingProvider>
      <OnboardingScreen />
    </OnboardingProvider>
  );
}
```

### Acceder a Datos del Usuario

```javascript
import { useOnboarding } from "./context/OnboardingContext";

function HomeScreen() {
  const { userProfile, isCompleted } = useOnboarding();

  if (!isCompleted) {
    return <OnboardingScreen />;
  }

  return (
    <View>
      <Text>¡Hola {userProfile.nombre}!</Text>
      <Text>Tu objetivo: {userProfile.objetivo}</Text>
      <Text>Días disponibles: {userProfile.diasDisponibles}</Text>
    </View>
  );
}
```

## 🎯 Flujo de Usuario

1. **Bienvenida** - Bot saluda y pide nombre
2. **Datos básicos** - Edad, género, peso, estatura
3. **Perfil fitness** - Actividad, objetivo, disponibilidad
4. **Información médica** - Lesiones o limitaciones
5. **Motivación** - Razón personal para entrenar
6. **Mensaje motivacional** - Bot dice lema inspirador
7. **Redirección automática** - Va a /home tras 4 segundos

## ⚙️ Configuración Avanzada

### Personalizar Preguntas

```javascript
// En OnboardingContext.js, modificar array 'questions'
const questions = [
  {
    id: "nombre",
    text: "¿Cuál es tu nombre?",
    type: "text", // 'text' | 'number' | 'select'
    validation: (value) => value.length >= 2,
    errorMessage: "Nombre muy corto",
  },
  // ... más preguntas
];
```

### Cambiar Avatar del Bot

```javascript
// En BotAvatar.js, reemplazar el placeholder
<View style={styles.avatarPlaceholder}>
  {/* Cambiar por tu avatar 3D */}
  <Text style={styles.avatarText}>🤖</Text>
</View>
```

### Modificar Mensajes Motivacionales

```javascript
// En OnboardingScreen.js
const motivationalMessages = [
  "¡Tu lema personalizado aquí! 💪",
  "¡Otro mensaje motivador! 🔥",
  // ... más mensajes
];
```

## 🎨 Personalización Visual

### Colores Principales

- **Background**: #121212 (Negro dark mode)
- **Cards**: #1F2937 (Gris oscuro)
- **Primary**: #3B82F6 (Azul)
- **Success**: #4CAF50 (Verde)
- **Error**: #EF4444 (Rojo)
- **Text**: #F9FAFB (Blanco)

### Fuentes y Tamaños

- **Title**: 28-32px, FontWeight bold
- **Body**: 16px, FontWeight 500
- **Small**: 14px, FontWeight 400

## 🔄 Integraciones

### Con React Navigation

```javascript
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

<NavigationContainer>
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    <Stack.Screen name="Home" component={HomeScreen} />
  </Stack.Navigator>
</NavigationContainer>;
```

### Con Expo Router

```javascript
// app/_layout.js
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
```

## 📱 Optimizaciones Mobile

- **KeyboardAvoidingView** previene overlay del teclado
- **ScrollView** para contenido largo en pantallas pequeñas
- **Platform-specific** padding para iOS/Android
- **Animated API** para transiciones suaves
- **TouchableOpacity** con activeOpacity para mejor feedback

## 🚨 Consideraciones Importantes

1. **Validaciones**: Cada pregunta tiene validación específica
2. **Navegación**: Usuario no puede avanzar sin respuesta válida
3. **Estado**: Los datos se mantienen al navegar hacia atrás
4. **Persistencia**: Implementar AsyncStorage para guardar perfil
5. **Accesibilidad**: Agregar labels para screen readers

## 📊 Datos de Salida

El objeto `userProfile` final contiene:

```javascript
{
  nombre: 'Juan Pérez',
  edad: '25',
  genero: 'masculino',
  peso: '75',
  estatura: '180',
  nivelActividad: 'moderado',
  objetivo: 'subir_peso',
  lesiones: 'Ninguna',
  diasDisponibles: '3-4',
  motivacion: 'Quiero sentirme mejor conmigo mismo'
}
```

---

_Sistema desarrollado con React Native + Expo Go + NativeWind para Iron Assistant_
