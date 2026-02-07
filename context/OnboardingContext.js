// context/OnboardingContext.js - Context para manejo de datos de onboarding
import React, { createContext, useContext, useState } from 'react';

const OnboardingContext = createContext();

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider = ({ children }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [userProfile, setUserProfile] = useState({
    nombre: '',
    edad: '',
    genero: '',
    peso: '',
    estatura: '',
    nivelActividad: '',
    objetivo: '',
    lesiones: '',
    diasDisponibles: '',
    motivacion: ''
  });

  // Array de preguntas con configuración
  const questions = [
    {
      id: 'nombre',
      text: '¡Hola! Soy Iron Assistant, tu entrenador personal. ¿Cuál es tu nombre?',
      type: 'text',
      placeholder: 'Escribe tu nombre...',
      validation: (value) => value.trim().length >= 2,
      errorMessage: 'Por favor ingresa un nombre válido'
    },
    {
      id: 'edad',
      text: `Perfecto, ${userProfile.nombre || 'atleta'}. ¿Cuántos años tienes?`,
      type: 'number',
      placeholder: 'Ej: 25',
      validation: (value) => value >= 13 && value <= 80,
      errorMessage: 'Debes tener entre 13 y 80 años'
    },
    {
      id: 'genero',
      text: '¿Con qué género te identificas?',
      type: 'select',
      options: [
        { label: 'Masculino', value: 'masculino' },
        { label: 'Femenino', value: 'femenino' },
        { label: 'No binario', value: 'no_binario' },
        { label: 'Prefiero no decir', value: 'no_especifica' }
      ],
      validation: (value) => value !== '',
      errorMessage: 'Por favor selecciona una opción'
    },
    {
      id: 'peso',
      text: '¿Cuál es tu peso actual en kilogramos?',
      type: 'number',
      placeholder: 'Ej: 70',
      validation: (value) => value >= 30 && value <= 300,
      errorMessage: 'Ingresa un peso válido (30-300 kg)'
    },
    {
      id: 'estatura',
      text: '¿Cuál es tu estatura en centímetros?',
      type: 'number',
      placeholder: 'Ej: 175',
      validation: (value) => value >= 100 && value <= 250,
      errorMessage: 'Ingresa una estatura válida (100-250 cm)'
    },
    {
      id: 'nivelActividad',
      text: '¿Cuál es tu nivel actual de actividad física?',
      type: 'select',
      options: [
        { label: 'Sedentario (sin ejercicio)', value: 'sedentario' },
        { label: 'Ligero (1-3 días/semana)', value: 'ligero' },
        { label: 'Moderado (3-5 días/semana)', value: 'moderado' },
        { label: 'Activo (6-7 días/semana)', value: 'activo' },
        { label: 'Muy activo (2 veces/día)', value: 'muy_activo' }
      ],
      validation: (value) => value !== '',
      errorMessage: 'Selecciona tu nivel de actividad'
    },
    {
      id: 'objetivo',
      text: '¿Cuál es tu objetivo principal?',
      type: 'select',
      options: [
        { label: 'Bajar de peso', value: 'bajar_peso' },
        { label: 'Mantener peso', value: 'mantener_peso' },
        { label: 'Subir de peso/masa muscular', value: 'subir_peso' },
        { label: 'Mejorar resistencia', value: 'resistencia' },
        { label: 'Tonificar músculo', value: 'tonificar' }
      ],
      validation: (value) => value !== '',
      errorMessage: 'Selecciona tu objetivo principal'
    },
    {
      id: 'lesiones',
      text: '¿Tienes alguna lesión previa o limitación física que deba considerar?',
      type: 'text',
      placeholder: 'Ej: Lesión de rodilla, dolor de espalda, o "Ninguna"',
      validation: (value) => value.trim().length >= 1,
      errorMessage: 'Por favor describe tus lesiones o escribe "Ninguna"'
    },
    {
      id: 'diasDisponibles',
      text: '¿Cuántos días a la semana puedes entrenar?',
      type: 'select',
      options: [
        { label: '1-2 días (Principiante)', value: '1-2' },
        { label: '3-4 días (Intermedio)', value: '3-4' },
        { label: '5-6 días (Avanzado)', value: '5-6' },
        { label: '7 días (Atleta)', value: '7' }
      ],
      validation: (value) => value !== '',
      errorMessage: 'Selecciona cuántos días puedes entrenar'
    },
    {
      id: 'motivacion',
      text: '¡Última pregunta! ¿Qué te motiva hoy a comenzar este cambio?',
      type: 'text',
      placeholder: 'Ej: Quiero sentirme mejor conmigo mismo...',
      validation: (value) => value.trim().length >= 5,
      errorMessage: 'Comparte tu motivación (mínimo 5 caracteres)'
    }
  ];

  const updateProfile = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Pregunta final completada
      setIsCompleted(true);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const resetOnboarding = () => {
    setCurrentQuestion(0);
    setIsCompleted(false);
    setUserProfile({
      nombre: '',
      edad: '',
      genero: '',
      peso: '',
      estatura: '',
      nivelActividad: '',
      objetivo: '',
      lesiones: '',
      diasDisponibles: '',
      motivacion: ''
    });
  };

  const getCurrentQuestion = () => {
    return questions[currentQuestion];
  };

  const isLastQuestion = () => {
    return currentQuestion === questions.length - 1;
  };

  const getProgress = () => {
    return (currentQuestion + 1) / questions.length;
  };

  const value = {
    // Estado
    currentQuestion,
    isCompleted,
    userProfile,
    questions,
    
    // Funciones
    updateProfile,
    nextQuestion,
    previousQuestion,
    resetOnboarding,
    getCurrentQuestion,
    isLastQuestion,
    getProgress,
    
    // Utilidades
    totalQuestions: questions.length
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};