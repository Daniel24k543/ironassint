// screens/BodyScanIntroScreen.js - Pantalla de introducción al escaneo corporal
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  Animated,
  Image,
  StatusBar
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export const BodyScanIntroScreen = ({ navigation }) => {
  const [showModal, setShowModal] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    // Animación de aparición de la pantalla
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Animación del modal bottom sheet
    if (showModal) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [showModal]);

  // Datos de los pasos del carrusel
  const instructionSteps = [
    {
      id: 0,
      title: 'Usa ropa mínima',
      description: 'Para obtener mejores resultados, usa ropa ajustada o mínima',
      correctExample: 'Usuario en ropa deportiva ajustada',
      incorrectExample: 'Usuario con ropa holgada o abrigos',
    },
    {
      id: 1,
      title: 'Buena iluminación',
      description: 'Asegúrate de estar en un lugar con luz natural o artificial clara',
      correctExample: 'Habitación bien iluminada',
      incorrectExample: 'Habitación oscura o con sombras',
    },
    {
      id: 2,
      title: 'Posición correcta',
      description: 'Mantente erguido, brazos ligeramente separados del cuerpo',
      correctExample: 'Postura erguida, brazos separados',
      incorrectExample: 'Postura encorvada o brazos pegados',
    },
    {
      id: 3,
      title: 'Fondo neutro',
      description: 'Colócate frente a una pared lisa o fondo sin distracciones',
      correctExample: 'Pared blanca o lisa de fondo',
      incorrectExample: 'Fondo con objetos o patrones',
    }
  ];

  const handleNextStep = () => {
    if (currentStep < instructionSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Último paso - navegar a captura
      handleCloseModal();
      setTimeout(() => {
        navigation.navigate('BodyScanCapture');
      }, 300);
    }
  };

  const handleCloseModal = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowModal(false);
    });
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {instructionSteps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentStep ? styles.activeDot : styles.inactiveDot
            ]}
          />
        ))}
      </View>
    );
  };

  const renderExampleImages = () => {
    const step = instructionSteps[currentStep];
    return (
      <View style={styles.examplesContainer}>
        {/* Imagen correcta */}
        <View style={styles.exampleCard}>
          <View style={styles.exampleImageContainer}>
            <View style={[styles.exampleImagePlaceholder, styles.correctExample]}>
              <MaterialIcons name="check-circle" size={32} color="#10B981" />
            </View>
          </View>
          <View style={styles.exampleLabel}>
            <MaterialIcons name="check" size={16} color="#10B981" />
            <Text style={styles.correctText}>Correcto</Text>
          </View>
        </View>

        {/* Imagen incorrecta */}
        <View style={styles.exampleCard}>
          <View style={styles.exampleImageContainer}>
            <View style={[styles.exampleImagePlaceholder, styles.incorrectExample]}>
              <MaterialIcons name="close" size={32} color="#EF4444" />
            </View>
          </View>
          <View style={styles.exampleLabel}>
            <MaterialIcons name="close" size={16} color="#EF4444" />
            <Text style={styles.incorrectText}>Incorrecto</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <Animated.View 
        style={[
          styles.mainContent,
          {
            opacity: fadeAnim
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Escaneo Corporal</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Vista Antes/Después */}
        <View style={styles.beforeAfterSection}>
          <Text style={styles.sectionTitle}>Resultados de ejemplo</Text>
          
          <View style={styles.comparisonContainer}>
            {/* Imagen "Antes" */}
            <View style={styles.beforeAfterCard}>
              <View style={styles.beforeAfterImageContainer}>
                <View style={styles.beforeAfterPlaceholder}>
                  <Ionicons name="body" size={40} color="#6B7280" />
                </View>
              </View>
              <Text style={styles.beforeAfterLabel}>Antes</Text>
            </View>

            {/* Línea divisoria */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerIcon}>
                <MaterialIcons name="trending-up" size={16} color="#3B82F6" />
              </View>
            </View>

            {/* Imagen "Después" */}
            <View style={styles.beforeAfterCard}>
              <View style={styles.beforeAfterImageContainer}>
                <View style={[styles.beforeAfterPlaceholder, styles.afterPlaceholder]}>
                  <Ionicons name="body" size={40} color="#10B981" />
                </View>
              </View>
              <Text style={styles.beforeAfterLabel}>Después</Text>
            </View>
          </View>

          <Text style={styles.comparisonDescription}>
            La IA analizará tu estructura corporal y te dará métricas detalladas sobre tu composición física
          </Text>
        </View>
      </Animated.View>

      {/* Modal Bottom Sheet de Instrucciones */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Handle del modal */}
            <View style={styles.modalHandle} />

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {/* Título de la instrucción */}
              <View style={styles.instructionHeader}>
                <Text style={styles.instructionTitle}>
                  {instructionSteps[currentStep].title}
                </Text>
                <Text style={styles.instructionDescription}>
                  {instructionSteps[currentStep].description}
                </Text>
              </View>

              {/* Imágenes de ejemplo */}
              {renderExampleImages()}

              {/* Indicadores de puntos */}
              {renderDots()}

              {/* Botón de siguiente */}
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNextStep}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === instructionSteps.length - 1 ? 'Comenzar' : 'Siguiente'}
                </Text>
                <MaterialIcons 
                  name={currentStep === instructionSteps.length - 1 ? "camera-alt" : "arrow-forward"} 
                  size={20} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>

              {/* Botón para saltar instrucciones */}
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.skipButtonText}>Saltar instrucciones</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginLeft: -32, // Compensar el botón de back
  },
  headerSpacer: {
    width: 40,
  },
  
  // Before/After Section
  beforeAfterSection: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  beforeAfterCard: {
    flex: 1,
    alignItems: 'center',
  },
  beforeAfterImageContainer: {
    marginBottom: 12,
  },
  beforeAfterPlaceholder: {
    width: 120,
    height: 160,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
  },
  afterPlaceholder: {
    borderColor: '#10B981',
    backgroundColor: '#064e3b',
  },
  beforeAfterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  dividerContainer: {
    alignItems: 'center',
    marginHorizontal: 20,
    position: 'relative',
  },
  dividerLine: {
    width: 2,
    height: 60,
    backgroundColor: '#374151',
  },
  dividerIcon: {
    position: 'absolute',
    top: '50%',
    backgroundColor: '#1F2937',
    padding: 8,
    borderRadius: 20,
    marginTop: -16,
  },
  comparisonDescription: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 20,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.7,
    paddingTop: 12,
  },
  modalHandle: {
    width: 50,
    height: 4,
    backgroundColor: '#4B5563',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // Instruction Content
  instructionHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  instructionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionDescription: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Examples
  examplesContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 32,
  },
  exampleCard: {
    flex: 1,
    alignItems: 'center',
  },
  exampleImageContainer: {
    marginBottom: 12,
  },
  exampleImagePlaceholder: {
    width: (width - 88) / 2,
    height: 140,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  correctExample: {
    backgroundColor: '#064e3b',
    borderColor: '#10B981',
  },
  incorrectExample: {
    backgroundColor: '#7f1d1d',
    borderColor: '#EF4444',
  },
  exampleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  correctText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  incorrectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },

  // Dots Indicator
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: '#3B82F6',
  },
  inactiveDot: {
    backgroundColor: '#4B5563',
  },

  // Buttons
  nextButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});