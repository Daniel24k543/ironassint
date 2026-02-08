import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import LoadingScreen from './components/LoadingScreen';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.toString() };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <StatusBar style="light" />
          <Text style={styles.errorTitle}>🚨 Iron Assistant</Text>
          <Text style={styles.errorSubtitle}>Error detectado - Recuperándose...</Text>
          <LoadingScreen 
            message="Reiniciando la aplicación de forma segura..."
          />
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              this.setState({ hasError: false, errorMessage: '' });
              this.props.onRetry?.();
            }}
          >
            <Text style={styles.retryButtonText}>🔄 Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Componente principal de la App
const MainApp = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Iniciando Iron Assistant...");
  
  useEffect(() => {
    // Simular proceso de carga con pasos
    const loadingSteps = [
      { message: "Iniciando Iron Assistant...", duration: 1000 },
      { message: "Conectando con Railway...", duration: 1500 },
      { message: "Configurando tu entrenador IA...", duration: 1200 },
      { message: "Preparando interfaz...", duration: 800 },
      { message: "¡Listo para entrenar! 💪", duration: 500 }
    ];

    let currentStep = 0;
    
    const processStep = () => {
      if (currentStep < loadingSteps.length) {
        const step = loadingSteps[currentStep];
        setLoadingMessage(step.message);
        
        setTimeout(() => {
          currentStep++;
          if (currentStep < loadingSteps.length) {
            processStep();
          } else {
            // Finalizar carga
            setTimeout(() => setIsLoading(false), 500);
          }
        }, step.duration);
      }
    };

    // Iniciar proceso de carga
    processStep();
  }, []);

  const handleButtonPress = (section) => {
    Alert.alert(
      `${section} 🏋️‍♂️`,
      "¡Funcionalidad en desarrollo! Tu Iron Assistant está creciendo cada día.",
      [{ text: "¡Genial!", style: "default" }]
    );
  };

  // Mostrar pantalla de carga
  if (isLoading) {
    return <LoadingScreen message={loadingMessage} />;
  }

  // App principal
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>🏋️‍♂️ Iron Assistant</Text>
        <Text style={styles.subtitle}>Tu entrenador personal con IA</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>✅ Conectado a Railway</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => handleButtonPress("Entrenamientos")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>💪 Empezar Entrenamiento</Text>
          <Text style={styles.buttonSubtext}>Rutinas personalizadas con IA</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => handleButtonPress("Estadísticas")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>📊 Ver Estadísticas</Text>
          <Text style={styles.buttonSubtext}>Tu progreso y métricas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => handleButtonPress("IA Entrenador")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>🤖 IA Entrenador</Text>
          <Text style={styles.buttonSubtext}>Chat inteligente 24/7</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => handleButtonPress("Tienda")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>🛒 Tienda</Text>
          <Text style={styles.buttonSubtext}>Suplementos y equipos</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Iron Assistant v1.0.0</Text>
        <Text style={styles.footerSubtext}>Hecho con 💪 para tus entrenamientos</Text>
      </View>
    </View>
  );
};

// App principal con Error Boundary
export default function App() {
  const [key, setKey] = useState(0);

  const handleRetry = () => {
    // Forzar re-render completo de la app
    setKey(prev => prev + 1);
  };

  return (
    <ErrorBoundary key={key} onRetry={handleRetry}>
      <MainApp />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
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
    fontWeight: '400',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubtext: {
    color: '#444444',
    fontSize: 12,
    textAlign: 'center',
  },
  // Estilos para ErrorBoundary
  errorContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ff6b6b',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 30,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});