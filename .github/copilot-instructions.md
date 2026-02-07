<!-- GymIA - App de Fitness con Inteligencia Artificial -->

## Descripción del Proyecto

GymIA es una aplicación móvil de fitness con características avanzadas:

- IA entrenador personal y apoyo emocional
- Conexión con smartwatch via Bluetooth
- Detección de latidos y estado emocional
- Sistema de rachas y recompensas
- Tienda con ruleta de cupones
- Feed social tipo TikTok
- Música motivacional automática

## Stack Tecnológico

- **Frontend**: React Native con Expo Go
- **Estado**: React Context + AsyncStorage
- **Navegación**: React Navigation
- **UI**: React Native Elements + Styled Components
- **Bluetooth**: expo-bluetooth
- **Audio**: expo-av
- **Sensores**: expo-sensors
- **IA**: OpenAI API / Gemini API

## Estructura del Proyecto

```
src/
├── components/        # Componentes reutilizables
├── screens/          # Pantallas principales
├── navigation/       # Configuración de navegación
├── context/          # Manejo de estado global
├── services/         # APIs y servicios externos
├── utils/            # Utilidades y helpers
├── assets/           # Imágenes, sonidos, etc.
└── hooks/            # Hooks personalizados
```

## Características Principales

1. **Login Elegante**: Interfaz moderna con animaciones
2. **IA Entrenador**: Asistente personalizado con procesamiento de lenguaje natural
3. **Registro Guiado**: IA guía el proceso de onboarding
4. **Rutinas Personalizadas**: Ejercicios adaptados al usuario
5. **Monitor Emocional**: Detección via sensores y música automática
6. **Sistema de Rachas**: Gamificación con recompensas
7. **Tienda Integrada**: Patrocinios y sistema de cupones
8. **Feed Social**: Contenido motivacional tipo TikTok
9. **Conectividad Bluetooth**: Sincronización con wearables

## Reglas de Desarrollo

- Usar Expo Go para testing (no Expo para desarrolladores)
- Código limpio y bien documentado
- Componentes modulares y reutilizables
- Manejo eficiente del estado
- UX/UI intuitiva y atractiva
- Optimización para performance móvil

## Instrucciones Específicas

- Priorizar funcionalidad core antes que features avanzadas
- Implementar sistema de fallbacks para funcionalidades dependientes de hardware
- Usar mock data durante desarrollo inicial
- Diseño mobile-first responsive
