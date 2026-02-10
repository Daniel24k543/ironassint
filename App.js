import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  Animated,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// ============== PANTALLA DE CARGA ==============
const LoadingScreen = ({ message = "Iniciando Iron Assistant..." }) => {
  const pulseAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    pulseAnimation.start();
    rotateAnimation.start();

    return () => {
      pulseAnimation.stop();
      rotateAnimation.stop();
    };
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.loadingContainer}>
      <StatusBar style="light" />
      
      {/* Círculos animados */}
      <Animated.View 
        style={[
          styles.circle,
          { 
            transform: [
              { scale: pulseAnim },
              { rotate: rotateInterpolate }
            ] 
          }
        ]} 
      />

      {/* Icono principal */}
      <Animated.View 
        style={[
          styles.iconContainer,
          { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <Text style={styles.loadingIcon}>🏋️‍♂️</Text>
      </Animated.View>

      <Text style={styles.loadingTitle}>Iron Assistant</Text>
      <Text style={styles.loadingMessage}>{message}</Text>

      {/* Dots animados */}
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />  
        <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
      </View>
    </View>
  );
};

// ============== PANTALLA DE LOGIN ==============
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = () => {
    // Validación básica
    if (email && password) {
      onLogin();
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.loginContainer}
    >
      <StatusBar style="light" />
      
      <Animated.View style={[styles.loginContent, { opacity: fadeAnim }]}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🏋️‍♂️</Text>
          <Text style={styles.loginTitle}>Iron Assistant</Text>
          <Text style={styles.loginSubtitle}>Tu entrenador personal con IA</Text>
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email o usuario"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.guestButton}
            onPress={onLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.guestButtonText}>Continuar como invitado</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>v1.0.0 - Railway ✅</Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

// ============== PANTALLA PRINCIPAL ==============
const HomeScreen = () => {
  const handlePress = (section) => {
    // Navegar a sección (implementar después)
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>🏋️‍♂️ Iron Assistant</Text>
        <Text style={styles.subtitle}>Tu entrenador personal con IA</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>✅ Railway Conectado</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => handlePress("Entrenamientos")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>💪 Empezar Entrenamiento</Text>
          <Text style={styles.buttonSubtext}>Rutinas personalizadas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => handlePress("Estadísticas")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>📊 Ver Estadísticas</Text>
          <Text style={styles.buttonSubtext}>Tu progreso y métricas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => handlePress("IA Entrenador")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>🤖 IA Entrenador</Text>
          <Text style={styles.buttonSubtext}>Chat 24/7</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => handlePress("Tienda")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>🛒 Tienda</Text>
          <Text style={styles.buttonSubtext}>Suplementos y equipos</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.footer}>Hecho con 💪 para tus entrenamientos</Text>
    </View>
  );
};


// ============== APP PRINCIPAL CON ERROR BOUNDARY ==============
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Error capturado silenciosamente
  }

  render() {
    if (this.state.hasError) {
      return (
        <LoadingScreen message="Recuperándose de un error... Reiniciando..." />
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Iniciando Iron Assistant...");

  useEffect(() => {
    const loadingSteps = [
      { message: "Iniciando Iron Assistant...", duration: 1000 },
      { message: "Conectando con Railway...", duration: 1200 },
      { message: "Configurando tu entrenador IA...", duration: 1000 },
      { message: "¡Listo para entrenar! 💪", duration: 500 }
    ];

    let currentStep = 0;
    const timeouts = [];
    
    const processStep = () => {
      if (currentStep < loadingSteps.length) {
        const step = loadingSteps[currentStep];
        setLoadingMessage(step.message);
        
        const timeout1 = setTimeout(() => {
          currentStep++;
          if (currentStep < loadingSteps.length) {
            processStep();
          } else {
            const timeout2 = setTimeout(() => {
              setIsLoading(false);
              setShowLogin(true);
            }, 500);
            timeouts.push(timeout2);
          }
        }, step.duration);
        timeouts.push(timeout1);
      }
    };

    processStep();

    // Cleanup: cancelar todos los timeouts si el componente se desmonta
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  if (isLoading) {
    return <LoadingScreen message={loadingMessage} />;
  }

  if (showLogin) {
    return (
      <ErrorBoundary>
        <LoginScreen onLogin={() => setShowLogin(false)} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <HomeScreen />
    </ErrorBoundary>
  );
}


// ============== ESTILOS ==============
const styles = StyleSheet.create({
  // Loading Screen
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#3b82f6',
    opacity: 0.2,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  loadingIcon: {
    fontSize: 60,
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 15,
  },
  loadingMessage: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
    marginHorizontal: 5,
  },

  // Login Screen
  loginContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    padding: 20,
  },
  loginContent: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  loginTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#888888',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    color: '#ffffff',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  guestButton: {
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
  },
  guestButtonText: {
    color: '#888888',
    fontSize: 16,
  },
  versionText: {
    color: '#444',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 30,
  },

  // Home Screen
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 15,
  },
  statusBadge: {
    backgroundColor: '#1a7a3e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    width: '100%',
    maxWidth: 320,
  },
  button: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#3b82f6',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: '#888888',
    fontSize: 14,
  },
  footer: {
    color: '#444444',
    fontSize: 12,
    marginTop: 30,
  },
});