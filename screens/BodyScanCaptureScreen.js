// screens/BodyScanCaptureScreen.js - Pantalla de captura para escaneo corporal + Supabase
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  StatusBar,
  Image
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BodyScanService } from '../src/services/bodyScan.service';

const { width, height } = Dimensions.get('window');

export const BodyScanCaptureScreen = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonScaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  useEffect(() => {
    // Animación del botón cuando se habilita/deshabilita
    Animated.spring(buttonScaleAnim, {
      toValue: selectedImage ? 1 : 0.95,
      tension: 150,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [selectedImage]);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos requeridos',
        'Necesitamos acceso a tu galería para seleccionar fotos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert(
      'Seleccionar imagen',
      '¿Cómo quieres añadir tu foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cámara',
          onPress: () => openCamera(),
        },
        {
          text: 'Galería',
          onPress: () => openGallery(),
        },
      ]
    );
  };

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir la cámara');
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir la galería');
    }
  };

  const startScan = async () => {
    if (!selectedImage) return;

    setIsLoading(true);

    try {
      console.log('🔄 Iniciando escaneo corporal completo...');
      
      // ✅ INTEGRACIÓN SUPABASE: Procesar escaneo con servicio
      const scanResult = await BodyScanService.processBodyScan(
        selectedImage.uri,
        {
          // Datos adicionales opcionales para el análisis
          scanType: 'progress',
          capturedAt: new Date().toISOString(),
          imageQuality: selectedImage.width && selectedImage.height ? 
            `${selectedImage.width}x${selectedImage.height}` : 'unknown'
        }
      );
      
      setIsLoading(false);

      if (scanResult.success) {
        console.log('✅ Escaneo completado exitosamente:', scanResult.data);
        
        Alert.alert(
          '¡Escaneo completado! 🎉',
          `Tu análisis corporal se ha procesado correctamente. 
          
Resultados destacados:
• Confianza del análisis: ${(scanResult.data.analysis.confidence * 100).toFixed(1)}%
• Estado: ${scanResult.data.analysis.progress === 'improving' ? 'Mejorando' : 'Estable'}
          
Ve a tu perfil para ver los resultados completos.`,
          [
            {
              text: 'Ver resultados',
              onPress: () => {
                // Navegar de vuelta al perfil o a pantalla de resultados
                navigation.navigate('Profile');
              }
            }
          ]
        );
      } else {
        throw new Error(scanResult.error || 'Error desconocido en el escaneo');
      }
      
    } catch (error) {
      console.error('❌ Error en escaneo:', error);
      setIsLoading(false);
      
      Alert.alert(
        'Error en el escaneo',
        `No se pudo procesar tu imagen:
        
${error.message}

¿Qué quieres hacer?`,
        [
          {
            text: 'Reintentar',
            onPress: () => startScan(),
          },
          {
            text: 'Seleccionar otra imagen',
            onPress: () => setSelectedImage(null),
          },
          {
            text: 'Cancelar',
            style: 'cancel',
          },
        ]
      );
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
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
          <Text style={styles.headerTitle}>Captura tu foto</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Instrucciones */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>
            Sube una foto de tu cuerpo
          </Text>
          <Text style={styles.instructionsText}>
            Asegúrate de seguir las indicaciones para obtener mejores resultados
          </Text>
        </View>

        {/* Área de imagen */}
        <View style={styles.imageSection}>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            {selectedImage ? (
              <View style={styles.imageWrapper}>
                <Image 
                  source={{ uri: selectedImage.uri }} 
                  style={styles.selectedImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={removeImage}
                >
                  <MaterialIcons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <View style={styles.iconContainer}>
                  <Ionicons name="camera" size={48} color="#6B7280" />
                </View>
                <Text style={styles.placeholderText}>Añadir una foto</Text>
                <Text style={styles.placeholderSubtext}>
                  Toca para seleccionar desde galería o cámara
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Tips rápidos */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Tips rápidos:</Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <MaterialIcons name="wb-sunny" size={16} color="#F59E0B" />
                <Text style={styles.tipText}>Buena iluminación</Text>
              </View>
              <View style={styles.tipItem}>
                <MaterialIcons name="straighten" size={16} color="#3B82F6" />
                <Text style={styles.tipText}>Postura erguida</Text>
              </View>
              <View style={styles.tipItem}>
                <MaterialIcons name="crop_free" size={16} color="#8B5CF6" />
                <Text style={styles.tipText}>Cuerpo completo visible</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Botón de escaneo */}
        <View style={styles.bottomSection}>
          <Animated.View
            style={{
              transform: [{ scale: buttonScaleAnim }]
            }}
          >
            <TouchableOpacity
              style={[
                styles.scanButton,
                !selectedImage && styles.scanButtonDisabled
              ]}
              onPress={startScan}
              disabled={!selectedImage || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Animated.View style={styles.loadingSpinner}>
                    <MaterialIcons name="sync" size={24} color="#FFFFFF" />
                  </Animated.View>
                  <Text style={styles.scanButtonText}>Analizando...</Text>
                </View>
              ) : (
                <>
                  <MaterialIcons 
                    name="smart-toy" 
                    size={24} 
                    color={selectedImage ? "#FFFFFF" : "#6B7280"} 
                  />
                  <Text style={[
                    styles.scanButtonText,
                    !selectedImage && styles.scanButtonTextDisabled
                  ]}>
                    Iniciar Escaneo
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.disclaimerText}>
            El análisis puede tomar unos minutos. Tu privacidad está protegida.
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
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
    marginLeft: -32,
  },
  headerSpacer: {
    width: 40,
  },

  // Instructions
  instructionsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Image Section
  imageSection: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  imagePlaceholder: {
    width: width - 80,
    height: height * 0.4,
    backgroundColor: '#1F2937',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  imageWrapper: {
    position: 'relative',
  },
  selectedImage: {
    width: width - 80,
    height: height * 0.4,
    borderRadius: 20,
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tips
  tipsContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#D1D5DB',
  },

  // Bottom Section
  bottomSection: {
    padding: 20,
    paddingTop: 0,
  },
  scanButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  scanButtonDisabled: {
    backgroundColor: '#374151',
    shadowOpacity: 0,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingSpinner: {
    // Animación de rotación se puede agregar aquí
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scanButtonTextDisabled: {
    color: '#6B7280',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});