// components/QuestionCard.js - Componente para manejar diferentes tipos de preguntas
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const QuestionCard = ({ 
  question, 
  value, 
  onValueChange, 
  onNext, 
  onPrevious,
  isFirst = false,
  isLast = false,
  error = null
}) => {
  const [localValue, setLocalValue] = useState(value || '');
  const [isValid, setIsValid] = useState(false);
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const errorShakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de aparición
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  useEffect(() => {
    // Validar en tiempo real
    if (question.validation) {
      setIsValid(question.validation(localValue));
    }
  }, [localValue, question]);

  useEffect(() => {
    // Animación de error
    if (error) {
      Animated.sequence([
        Animated.timing(errorShakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(errorShakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(errorShakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(errorShakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error]);

  const handleValueChange = (newValue) => {
    setLocalValue(newValue);
    onValueChange(newValue);
  };

  const handleNext = () => {
    if (isValid) {
      onNext();
    }
  };

  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <TextInput
            style={[styles.textInput, error && styles.inputError]}
            value={localValue}
            onChangeText={handleValueChange}
            placeholder={question.placeholder}
            placeholderTextColor="#9CA3AF"
            multiline={question.id === 'motivacion' || question.id === 'lesiones'}
            numberOfLines={question.id === 'motivacion' || question.id === 'lesiones' ? 3 : 1}
            textAlignVertical={question.id === 'motivacion' || question.id === 'lesiones' ? 'top' : 'center'}
            autoFocus={true}
            returnKeyType="done"
            onSubmitEditing={handleNext}
          />
        );

      case 'number':
        return (
          <TextInput
            style={[styles.textInput, error && styles.inputError]}
            value={localValue}
            onChangeText={handleValueChange}
            placeholder={question.placeholder}
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            autoFocus={true}
            returnKeyType="done"
            onSubmitEditing={handleNext}
          />
        );

      case 'select':
        return (
          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  localValue === option.value && styles.optionButtonSelected,
                  error && styles.optionButtonError
                ]}
                onPress={() => handleValueChange(option.value)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <Text style={[
                    styles.optionText,
                    localValue === option.value && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {localValue === option.value && (
                    <MaterialIcons name="check-circle" size={24} color="#3B82F6" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { translateX: errorShakeAnim }
            ]
          }
        ]}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Question Input */}
          <View style={styles.inputContainer}>
            {renderInput()}
          </View>

          {/* Error Message */}
          {error && (
            <Animated.View style={styles.errorContainer}>
              <MaterialIcons name="error" size={20} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          )}

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {!isFirst && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={onPrevious}
                activeOpacity={0.7}
              >
                <MaterialIcons name="arrow-back" size={24} color="#9CA3AF" />
                <Text style={styles.backButtonText}>Anterior</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.nextButton,
                !isValid && styles.nextButtonDisabled,
                isFirst && styles.nextButtonFull
              ]}
              onPress={handleNext}
              disabled={!isValid}
              activeOpacity={0.7}
            >
              {isLast ? (
                <>
                  <Text style={[
                    styles.nextButtonText,
                    !isValid && styles.nextButtonTextDisabled
                  ]}>
                    Finalizar
                  </Text>
                  <MaterialIcons 
                    name="check" 
                    size={24} 
                    color={isValid ? "#FFFFFF" : "#6B7280"} 
                  />
                </>
              ) : (
                <>
                  <Text style={[
                    styles.nextButtonText,
                    !isValid && styles.nextButtonTextDisabled
                  ]}>
                    Siguiente
                  </Text>
                  <MaterialIcons 
                    name="arrow-forward" 
                    size={24} 
                    color={isValid ? "#FFFFFF" : "#6B7280"} 
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '60%',
    borderTopWidth: 2,
    borderTopColor: '#374151',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    color: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#4B5563',
    minHeight: 56,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#7F1D1D',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#4B5563',
    minHeight: 56,
  },
  optionButtonSelected: {
    backgroundColor: '#1E3A8A',
    borderColor: '#3B82F6',
  },
  optionButtonError: {
    borderColor: '#EF4444',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#F9FAFB',
    fontWeight: '500',
    flex: 1,
  },
  optionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7F1D1D',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  backButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    minHeight: 56,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
    borderWidth: 1,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  nextButtonTextDisabled: {
    color: '#6B7280',
  },
});