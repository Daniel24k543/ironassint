// screens/OnboardingScreen.js - Pantalla principal de onboarding con Iron Assistant + Supabase
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
  Alert,
  StatusBar,
  ActivityIndicator,
  Text
} from 'react-native';
import { useRouter } from 'expo-router';

import { useOnboarding } from '../context/OnboardingContext';
import { BotAvatar } from '../components/BotAvatar';
import { QuestionCard } from '../components/QuestionCard';
import { ProfileService } from '../src/services/profile.service';
import { testConnection } from '../src/lib/supabase';

const { width, height } = Dimensions.get('window');

export const OnboardingScreen = () => {
  const router = useRouter();
  const {
    currentQuestion,
    isCompleted,
    userProfile,
    updateProfile,
    nextQuestion,
    previousQuestion,
    getCurrentQuestion,
    isLastQuestion,
    getProgress
  } = useOnboarding();

  const [isTyping, setIsTyping] = useState(true);
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentError, setCurrentError] = useState(null);
  const [showMotivationalMessage, setShowMotivationalMessage] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Animaciones
  const progressAnim = useRef(new Animated.Value(0)).current;
  const questionFadeAnim = useRef(new Animated.Value(0)).current;
  const motivationalFadeAnim = useRef(new Animated.Value(0)).current;

  const question = getCurrentQuestion();

  // Mensajes motivacionales aleatorios para el final
  const motivationalMessages = [
    '¡El hierro no miente, tú tampoco lo harás! 💪',
    '¡Tu transformación comienza ahora! ¡Vamos por esos objetivos! 🔥',
    '¡Cada repetición cuenta, cada día importa! ¡Estamos listos! ⚡',
    '¡La disciplina de hoy es la libertad del mañana! ¡A entrenar! 🚀',
    '¡Tu único límite eres tú mismo! ¡Rompamos barreras juntos! 💯'
  ];

  useEffect(() => {
    // Animación de progreso
    Animated.timing(progressAnim, {
      toValue: getProgress(),
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [currentQuestion]);

  useEffect(() => {
    // Simular typing y mostrar pregunta después de un delay
    setIsTyping(true);
    setShowQuestion(false);
    setCurrentError(null);

    const typingTimeout = setTimeout(() => {
      setIsTyping(false);
      setShowQuestion(true);
      
      // Animar aparición de la tarjeta de pregunta
      Animated.timing(questionFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 2000);

    // Reset de la animación al cambiar pregunta
    questionFadeAnim.setValue(0);

    return () => clearTimeout(typingTimeout);
  }, [currentQuestion]);

  useEffect(() => {
    // Manejar completación del onboarding
    if (isCompleted) {
      handleOnboardingComplete();
    }
  }, [isCompleted]);

  const handleOnboardingComplete = async () => {
    console.log('🚀 Iniciando proceso de finalización del onboarding...');
    
    // Ocultar pregunta
    setShowQuestion(false);
    
    // Seleccionar mensaje motivacional aleatorio
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    setMotivationalMessage(randomMessage);
    
    // Mostrar mensaje motivacional
    setIsTyping(false);
    setShowMotivationalMessage(true);
    setIsSavingProfile(true);
    
    // Animar aparición del mensaje
    Animated.timing(motivationalFadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    try {
      // ✅ INTEGRACIÓN SUPABASE: Guardar perfil en base de datos
      console.log('💾 Guardando perfil de usuario en Supabase...', userProfile);
      
      const saveResult = await ProfileService.upsertProfile(userProfile);
      
      if (saveResult.success) {
        console.log('✅ Perfil guardado exitosamente en Supabase:', saveResult.data);
        setSaveError(null);
        
        // Actualizar mensaje motivacional con confirmación
        setMotivationalMessage(`${randomMessage}\n\n✅ ¡Tu perfil se guardó correctamente!`);
        
        // Después de 4 segundos, redirigir a home
        setTimeout(() => {
          // Animar desaparición del bot
          Animated.timing(motivationalFadeAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }).start(() => {
            setIsSavingProfile(false);
            
            // Redirigir a home
            router.replace('/home');
          });
        }, 4000);
        
      } else {
        throw new Error(saveResult.error || 'Error desconocido al guardar perfil');
      }
      
    } catch (error) {
      console.error('❌ Error guardando perfil:', error);
      setSaveError(error.message);
      setIsSavingProfile(false);
      
      // Mostrar error al usuario
      setMotivationalMessage('😔 Ocurrió un error guardando tu perfil.\n\n¡Pero no te preocupes! Tus datos están seguros localmente.');
      
      // Mostrar alert con opciones
      Alert.alert(
        'Error de Guardado',
        'No se pudo guardar tu perfil en la nube, pero tus datos están seguros localmente. ¿Qué quieres hacer?',
        [
          {
            text: 'Reintentar',
            onPress: () => handleOnboardingComplete(),
          },
          {
            text: 'Continuar sin guardar',
            onPress: () => {
              setTimeout(() => {
                router.replace('/home');
              }, 2000);
            },
          },
        ]
      );
    }
  };

  const handleValueChange = (value) => {
    setCurrentError(null);
    updateProfile(question.id, value);
  };

  const handleNext = () => {
    const currentValue = userProfile[question.id];
    
    // Validar respuesta
    if (question.validation && !question.validation(currentValue)) {
      setCurrentError(question.errorMessage);
      return;
    }

    // Animar salida de la pregunta actual
    Animated.timing(questionFadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      nextQuestion();
    });
  };

  const handlePrevious = () => {
    setCurrentError(null);
    
    // Animar salida de la pregunta actual
    Animated.timing(questionFadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      previousQuestion();
    });
  };

  // Obtener mensaje con nombre personalizado para ciertas preguntas
  const getPersonalizedMessage = () => {
    if (question.id === 'edad' && userProfile.nombre) {
      return `Perfecto, ${userProfile.nombre}. ¿Cuántos años tienes?`;
    }
    return question.text;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View 
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                })
              }
            ]} 
          />
        </View>
      </View>

      {/* Bot Avatar */}
      <View style={styles.avatarSection}>
        <BotAvatar 
          message={showMotivationalMessage ? motivationalMessage : getPersonalizedMessage()}
          isTyping={isTyping}
          isVisible={!showMotivationalMessage || motivationalFadeAnim._value > 0}
        />
      </View>

      {/* Question Card */}
      {showQuestion && !showMotivationalMessage && (
        <Animated.View 
          style={[
            styles.questionSection,
            {
              opacity: questionFadeAnim
            }
          ]}
        >
          <QuestionCard
            question={question}
            value={userProfile[question.id]}
            onValueChange={handleValueChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isFirst={currentQuestion === 0}
            isLast={isLastQuestion()}
            error={currentError}
          />
        </Animated.View>
      )}

      {/* Motivational Message Overlay */}
      {showMotivationalMessage && (
        <Animated.View 
          style={[
            styles.motivationalOverlay,
            {
              opacity: motivationalFadeAnim
            }
          ]}
        >
          {/* Indicador de guardado */}
          {isSavingProfile && (
            <View style={styles.savingIndicator}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.savingText}>Guardando tu perfil...</Text>
            </View>
          )}
          
          {/* Error de guardado */}
          {saveError && (
            <View style={styles.errorIndicator}>
              <Text style={styles.errorText}>⚠️ {saveError}</Text>
            </View>
          )}
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    zIndex: 10,
  },
  progressBackground: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  avatarSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  questionSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  motivationalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#121212',
    zIndex: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingIndicator: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  savingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  errorIndicator: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#EF4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
});