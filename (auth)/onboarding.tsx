import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUserData } from '../../context/UserDataContext';
import { useAuth } from '../../context/AuthContext';

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  type: 'select' | 'input' | 'multiselect';
  options?: Array<{ label: string; value: any; icon?: string }>;
  inputType?: 'number' | 'text';
  field: keyof import('../../context/UserDataContext').UserData;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: '¿Cuántos años tienes?',
    subtitle: 'Esto nos ayuda a personalizar tu entrenamiento',
    type: 'input',
    inputType: 'number',
    field: 'age',
  },
  {
    id: 2,
    title: '¿Cuál es tu género?',
    subtitle: 'Para ajustar las recomendaciones de entrenamiento',
    type: 'select',
    field: 'gender',
    options: [
      { label: 'Masculino', value: 'male', icon: 'man' },
      { label: 'Femenino', value: 'female', icon: 'woman' },
      { label: 'Otro', value: 'other', icon: 'person' },
    ],
  },
  {
    id: 3,
    title: '¿Cuál es tu peso actual?',
    subtitle: 'En kilogramos',
    type: 'input',
    inputType: 'number',
    field: 'weight',
  },
  {
    id: 4,
    title: '¿Cuál es tu altura?',
    subtitle: 'En centímetros',
    type: 'input',
    inputType: 'number',
    field: 'height',
  },
  {
    id: 5,
    title: '¿Cuál es tu objetivo principal?',
    subtitle: 'Selecciona tu meta principal',
    type: 'select',
    field: 'primaryGoal',
    options: [
      { label: 'Perder peso', value: 'lose_weight', icon: 'trending-down' },
      { label: 'Ganar músculo', value: 'gain_muscle', icon: 'fitness' },
      { label: 'Mantener forma física', value: 'maintain_fitness', icon: 'heart' },
      { label: 'Ser más fuerte', value: 'get_stronger', icon: 'barbell' },
    ],
  },
  {
    id: 6,
    title: '¿Cuál es tu nivel de fitness?',
    subtitle: 'Sé honesto, esto afecta tu plan de entrenamiento',
    type: 'select',
    field: 'fitnessLevel',
    options: [
      { label: 'Principiante', value: 'beginner', icon: 'leaf' },
      { label: 'Intermedio', value: 'intermediate', icon: 'flame' },
      { label: 'Avanzado', value: 'advanced', icon: 'flash' },
    ],
  },
  {
    id: 7,
    title: '¿Cuántas veces entrenas por semana?',
    subtitle: 'Días por semana',
    type: 'select',
    field: 'workoutFrequency',
    options: [
      { label: '1-2 veces', value: 2, icon: 'calendar' },
      { label: '3-4 veces', value: 4, icon: 'calendar' },
      { label: '5-6 veces', value: 6, icon: 'calendar-sharp' },
      { label: 'Todos los días', value: 7, icon: 'flame' },
    ],
  },
  {
    id: 8,
    title: '¿Cuándo prefieres entrenar?',
    subtitle: 'Tu horario preferido',
    type: 'select',
    field: 'preferredWorkoutTime',
    options: [
      { label: 'Mañana', value: 'morning', icon: 'sunny' },
      { label: 'Tarde', value: 'afternoon', icon: 'partly-sunny' },
      { label: 'Noche', value: 'evening', icon: 'moon' },
    ],
  },
  {
    id: 9,
    title: '¿Qué tipos de ejercicio te gustan?',
    subtitle: 'Puedes seleccionar varios',
    type: 'multiselect',
    field: 'preferredWorkoutTypes',
    options: [
      { label: 'Cardio', value: 'cardio', icon: 'heart' },
      { label: 'Pesas', value: 'weights', icon: 'barbell' },
      { label: 'Yoga', value: 'yoga', icon: 'leaf' },
      { label: 'HIIT', value: 'hiit', icon: 'flash' },
      { label: 'Natación', value: 'swimming', icon: 'water' },
      { label: 'Correr', value: 'running', icon: 'walk' },
    ],
  },
  {
    id: 10,
    title: '¿Tienes alguna condición de salud?',
    subtitle: 'Opcional - nos ayuda a personalizar mejor',
    type: 'multiselect',
    field: 'healthConditions',
    options: [
      { label: 'Ninguna', value: 'none', icon: 'checkmark-circle' },
      { label: 'Lesión de espalda', value: 'back_injury', icon: 'alert-circle' },
      { label: 'Lesión de rodilla', value: 'knee_injury', icon: 'alert-circle' },
      { label: 'Problemas cardíacos', value: 'heart_condition', icon: 'heart-dislike' },
      { label: 'Diabetes', value: 'diabetes', icon: 'medical' },
      { label: 'Otro', value: 'other', icon: 'ellipsis-horizontal' },
    ],
  },
];

export default function OnboardingScreen() {
  const { updateUserData, completeOnboarding } = useUserData();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [inputValue, setInputValue] = useState('');

  const step = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  const handleNext = async () => {
    let answer = inputValue;
    
    if (step.type === 'input') {
      answer = step.inputType === 'number' ? parseFloat(inputValue) : inputValue;
    } else if (step.type === 'select') {
      // answer should already be set from handleSelect
    }

    if (!answer && step.type === 'input') return;

    const newAnswers = { ...answers, [step.field]: answer };
    setAnswers(newAnswers);

    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setInputValue('');
    } else {
      // Complete onboarding
      try {
        await updateUserData(newAnswers);
        await completeOnboarding();
        router.replace('/(tabs)');
      } catch (error) {
        console.error('Error completing onboarding:', error);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setInputValue('');
    }
  };

  const handleSelect = (value: any) => {
    const newAnswers = { ...answers, [step.field]: value };
    setAnswers(newAnswers);
    
    // Auto-advance for single select
    setTimeout(() => {
      if (currentStep < onboardingSteps.length - 1) {
        setCurrentStep(currentStep + 1);
        setInputValue('');
      } else {
        handleNext();
      }
    }, 300);
  };

  const handleMultiSelect = (value: any) => {
    const currentValues = answers[step.field] || [];
    let newValues;

    if (value === 'none') {
      newValues = ['none'];
    } else {
      const filteredValues = currentValues.filter((v: any) => v !== 'none');
      if (filteredValues.includes(value)) {
        newValues = filteredValues.filter((v: any) => v !== value);
      } else {
        newValues = [...filteredValues, value];
      }
    }

    const newAnswers = { ...answers, [step.field]: newValues };
    setAnswers(newAnswers);
  };

  const isSelected = (value: any) => {
    if (step.type === 'select') {
      return answers[step.field] === value;
    } else if (step.type === 'multiselect') {
      const currentValues = answers[step.field] || [];
      return currentValues.includes(value);
    }
    return false;
  };

  const canProceed = () => {
    if (step.type === 'input') {
      return inputValue.trim() !== '';
    } else if (step.type === 'multiselect') {
      const currentValues = answers[step.field] || [];
      return currentValues.length > 0;
    } else {
      return answers[step.field] !== undefined;
    }
  };

  return (
    <View className="flex-1 bg-dark-100">
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#1e1e1e', '#2d2d2d', '#1e1e1e']}
        className="absolute inset-0"
      />

      {/* Progress Bar */}
      <View className="pt-16 px-6">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity 
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-gray-700/50 items-center justify-center"
            disabled={currentStep === 0}
          >
            <Ionicons 
              name="chevron-back" 
              size={20} 
              color={currentStep === 0 ? "#666" : "#fff"} 
            />
          </TouchableOpacity>
          
          <Text className="text-white font-medium">
            {currentStep + 1} de {onboardingSteps.length}
          </Text>
          
          <View className="w-10 h-10" />
        </View>
        
        <View className="h-2 bg-gray-700/50 rounded-full mb-8">
          <Animated.View 
            className="h-full bg-primary-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Question */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-white mb-2">
            {step.title}
          </Text>
          <Text className="text-gray-400 text-lg">
            {step.subtitle}
          </Text>
        </View>

        {/* Input Field */}
        {step.type === 'input' && (
          <View className="mb-8">
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType={step.inputType === 'number' ? 'numeric' : 'default'}
              placeholder="Ingresa tu respuesta..."
              placeholderTextColor="#666"
              className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-4 text-white text-lg"
              autoFocus
            />
          </View>
        )}

        {/* Options */}
        {(step.type === 'select' || step.type === 'multiselect') && (
          <View className="space-y-3 mb-8">
            {step.options?.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => 
                  step.type === 'select' 
                    ? handleSelect(option.value)
                    : handleMultiSelect(option.value)
                }
                className={`flex-row items-center p-4 rounded-2xl border-2 ${
                  isSelected(option.value)
                    ? 'border-primary-500 bg-primary-500/20'
                    : 'border-gray-700 bg-gray-800/50'
                }`}
              >
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                  isSelected(option.value) ? 'bg-primary-500' : 'bg-gray-700'
                }`}>
                  <Ionicons 
                    name={option.icon as any} 
                    size={24} 
                    color={isSelected(option.value) ? '#fff' : '#999'} 
                  />
                </View>
                
                <Text className={`text-lg font-medium ${
                  isSelected(option.value) ? 'text-white' : 'text-gray-300'
                }`}>
                  {option.label}
                </Text>

                {isSelected(option.value) && (
                  <Ionicons 
                    name="checkmark-circle" 
                    size={24} 
                    color="#f97316" 
                    className="ml-auto"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Continue Button */}
        {step.type === 'input' && (
          <TouchableOpacity
            onPress={handleNext}
            disabled={!canProceed()}
            className={`h-14 rounded-2xl items-center justify-center mb-8 ${
              canProceed() 
                ? 'bg-primary-500' 
                : 'bg-gray-700'
            }`}
          >
            <Text className={`text-lg font-semibold ${
              canProceed() ? 'text-white' : 'text-gray-400'
            }`}>
              {currentStep === onboardingSteps.length - 1 ? 'Finalizar' : 'Continuar'}
            </Text>
          </TouchableOpacity>
        )}

        {step.type === 'multiselect' && (
          <TouchableOpacity
            onPress={handleNext}
            disabled={!canProceed()}
            className={`h-14 rounded-2xl items-center justify-center mb-8 ${
              canProceed() 
                ? 'bg-primary-500' 
                : 'bg-gray-700'
            }`}
          >
            <Text className={`text-lg font-semibold ${
              canProceed() ? 'text-white' : 'text-gray-400'
            }`}>
              {currentStep === onboardingSteps.length - 1 ? 'Finalizar' : 'Continuar'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}