import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import AIAvatar from '../components/AIAvatar';

const OnboardingScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    fitnessLevel: '',
    goals: '',
  });
  const [aiMessage, setAiMessage] = useState('');
  const { actions, state } = useApp();

  // Animaciones
  const slideAnimation = new Animated.Value(0);
  const fadeAnimation = new Animated.Value(0);

  const onboardingSteps = [
    {
      title: '¡Hola! 👋',
      aiText: '¡Bienvenido a GymIA! Soy tu entrenador personal con inteligencia artificial. Te voy a guiar en tu registro para poder diseñar el plan perfecto para ti. ¿Cuál es tu nombre?',
      field: 'name',
      placeholder: 'Tu nombre',
      icon: 'person-outline',
    },
    {
      title: 'Perfecto, ',
      aiText: 'Encantado de conocerte! Ahora necesito saber tu edad para adaptar mejor tu entrenamiento. ¿Cuántos años tienes?',
      field: 'age',
      placeholder: 'Tu edad',
      icon: 'calendar-outline',
      keyboardType: 'numeric',
    },
    {
      title: 'Genial!',
      aiText: 'Ahora vamos con tu peso actual. Esto me ayudará a calcular las cargas adecuadas para tus ejercicios. ¿Cuánto pesas?',
      field: 'weight',
      placeholder: 'Tu peso (kg)',
      icon: 'scale-outline',
      keyboardType: 'numeric',
    },
    {
      title: 'Excelente!',
      aiText: 'Y tu estatura, ¿cuál es? Con estos datos podré calcular tu IMC y personalizar mejor tu plan de entrenamiento.',
      field: 'height',
      placeholder: 'Tu estatura (cm)',
      icon: 'resize-outline',
      keyboardType: 'numeric',
    },
    {
      title: 'Casi listo!',
      aiText: 'Ahora cuéntame sobre tu nivel de fitness actual. ¿Eres principiante, intermedio o avanzado?',
      field: 'fitnessLevel',
      placeholder: 'Principiante/Intermedio/Avanzado',
      icon: 'fitness-outline',
      isSelect: true,
      options: ['Principiante', 'Intermedio', 'Avanzado'],
    },
    {
      title: '¡Último paso!',
      aiText: '¿Cuáles son tus objetivos principales? ¿Quieres perder peso, ganar músculo, mejorar resistencia o mantenerte en forma?',
      field: 'goals',
      placeholder: 'Tus objetivos fitness',
      icon: 'flag-outline',
      isSelect: true,
      options: ['Perder peso', 'Ganar músculo', 'Mejorar resistencia', 'Mantenerme en forma'],
    },
  ];

  useEffect(() => {
    animateStep();
    updateAIMessage();
  }, [currentStep]);

  const animateStep = () => {
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const updateAIMessage = () => {
    const step = onboardingSteps[currentStep];
    let message = step.aiText;
    
    if (step.title.includes('Perfecto, ') && userData.name) {
      message = `Perfecto, ${userData.name}! ` + step.aiText.substring(step.aiText.indexOf('Encantado'));
    }
    
    setAiMessage(message);
  };

  const handleNext = () => {
    const currentField = onboardingSteps[currentStep].field;
    const currentValue = userData[currentField];

    if (!currentValue) {
      Alert.alert('Campo requerido', 'Por favor completa este campo antes de continuar.');
      return;
    }

    if (currentStep < onboardingSteps.length - 1) {
      // Reset animations
      slideAnimation.setValue(0);
      fadeAnimation.setValue(0);
      
      setCurrentStep(currentStep + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    // Guardar datos del usuario
    const updatedUser = { ...state.user, ...userData };
    actions.login(updatedUser);

    // Mensaje final de la IA
    setAiMessage(`¡Perfecto ${userData.name}! Ya tengo toda la información que necesito. Tu lema personal es: "Cada día es una oportunidad para ser mejor que ayer". ¡Empecemos tu transformación!`);
    
    setTimeout(() => {
      navigation.replace('Main');
    }, 3000);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      slideAnimation.setValue(0);
      fadeAnimation.setValue(0);
      setCurrentStep(currentStep - 1);
    }
  };

  const updateUserData = (value) => {
    const field = onboardingSteps[currentStep].field;
    setUserData({ ...userData, [field]: value });
  };

  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* AI Avatar y mensaje */}
        <Animated.View 
          style={[
            styles.aiContainer,
            { opacity: fadeAnimation }
          ]}
        >
          <AIAvatar isActive={true} />
          <View style={styles.messageBubble}>
            <Text style={styles.aiMessage}>{aiMessage}</Text>
          </View>
        </Animated.View>

        {/* Formulario */}
        <Animated.View 
          style={[
            styles.formContainer,
            {
              transform: [{
                translateX: slideAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0],
                })
              }],
              opacity: fadeAnimation,
            }
          ]}
        >
          <Text style={styles.stepTitle}>
            {step.title}{step.title.includes('Perfecto, ') ? userData.name : ''}
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons name={step.icon} size={24} color="#FF6B35" style={styles.inputIcon} />
            
            {step.isSelect ? (
              <View style={styles.selectContainer}>
                {step.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      userData[step.field] === option && styles.optionSelected
                    ]}
                    onPress={() => updateUserData(option)}
                  >
                    <Text style={[
                      styles.optionText,
                      userData[step.field] === option && styles.optionTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <TextInput
                style={styles.input}
                placeholder={step.placeholder}
                placeholderTextColor="#8E8E93"
                value={userData[step.field]}
                onChangeText={updateUserData}
                keyboardType={step.keyboardType || 'default'}
              />
            )}
          </View>

          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            {onboardingSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index <= currentStep && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Botones de navegación */}
        <View style={styles.buttonsContainer}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="chevron-back" size={24} color="#FF6B35" />
              <Text style={styles.backText}>Atrás</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <LinearGradient
              colors={['#FF6B35', '#FF8E53']}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextText}>
                {isLastStep ? '¡Terminar!' : 'Siguiente'}
              </Text>
              <Ionicons 
                name={isLastStep ? "checkmark" : "chevron-forward"} 
                size={24} 
                color="#FFFFFF" 
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  aiContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  messageBubble: {
    backgroundColor: 'rgba(255,107,53,0.1)',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  aiMessage: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputIcon: {
    alignSelf: 'center',
    marginBottom: 15,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 18,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.3)',
    textAlign: 'center',
  },
  selectContainer: {
    gap: 10,
  },
  optionButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.3)',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF8E53',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,107,53,0.3)',
  },
  progressDotActive: {
    backgroundColor: '#FF6B35',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  backText: {
    color: '#FF6B35',
    fontSize: 16,
    marginLeft: 5,
  },
  nextButton: {
    flex: 1,
    marginLeft: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
    gap: 10,
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;