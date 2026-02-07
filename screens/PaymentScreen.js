// screens/PaymentScreen.js - Pantalla de pagos premium para Iron Assistant
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Animated,
  Dimensions,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { MaterialIcons, Entypo, FontAwesome5 } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

const { width, height } = Dimensions.get('window');

export const PaymentScreen = ({ navigation }) => {
  // Estados principales
  const [showBankModal, setShowBankModal] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;

  // Configuración
  const MERCADO_PAGO_LINK = 'https://link.mercadopago.com.pe/gymironassistant';
  const PLAN_PRICE = 'S/ 29.90';
  const BANK_DETAILS = {
    bank: 'BCP',
    accountType: 'Cuenta de Ahorros',
    accountNumber: '191-12345678-9-10',
    cci: '00219100123456789012',
    holderName: 'Iron Assistant EIRL'
  };

  useEffect(() => {
    // Animación inicial
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();

    // Animación de pulso para el bot
    startPulseAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ])
    ).start();
  };

  const handleMercadoPagoPayment = async () => {
    try {
      // Abrir MercadoPago en el navegador
      const result = await WebBrowser.openBrowserAsync(MERCADO_PAGO_LINK, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.OVER_FULL_SCREEN,
        controlsColor: '#8B5CF6',
        toolbarColor: '#121212',
      });

      // Al cerrar el navegador, mostrar opción de confirmar pago
      if (result.type === 'cancel' || result.type === 'dismiss') {
        setTimeout(() => {
          setPaymentCompleted(true);
        }, 500);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo abrir el enlace de pago. Verifica tu conexión e intenta nuevamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBankTransferPress = () => {
    setShowBankModal(true);
  };

  const handlePaymentConfirmation = () => {
    setIsProcessing(true);
    
    // Animación de carga
    Animated.timing(loadingAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Simular procesamiento (en app real, aquí harías llamada al backend)
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      
      // Animación de éxito
      Animated.spring(successAnim, {
        toValue: 1,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Auto-cerrar después de 3 segundos
      setTimeout(() => {
        navigation.navigate('Home'); // o la pantalla que corresponda
      }, 3000);
    }, 2500);
  };

  const copyToClipboard = async (text, label) => {
    // En Expo Go, no hay acceso directo al clipboard
    // Mostramos un alert con la información
    Alert.alert(
      'Información Copiada',
      `${label}: ${text}`,
      [
        { text: 'OK' }
      ]
    );
  };

  const BankTransferModal = () => (
    <Modal
      visible={showBankModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowBankModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header del modal */}
          <View style={styles.modalHeader}>
            <FontAwesome5 name="university" size={24} color="#8B5CF6" />
            <Text style={styles.modalTitle}>Transferencia Bancaria</Text>
            <TouchableOpacity
              onPress={() => setShowBankModal(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Datos bancarios */}
          <View style={styles.bankDetailsContainer}>
            <Text style={styles.bankDetailsTitle}>Transfiere a esta cuenta:</Text>
            
            <View style={styles.bankDetailItem}>
              <Text style={styles.bankDetailLabel}>Banco:</Text>
              <TouchableOpacity 
                onPress={() => copyToClipboard(BANK_DETAILS.bank, 'Banco')}
                style={styles.copyableItem}
              >
                <Text style={styles.bankDetailValue}>{BANK_DETAILS.bank}</Text>
                <MaterialIcons name="content-copy" size={16} color="#8B5CF6" />
              </TouchableOpacity>
            </View>

            <View style={styles.bankDetailItem}>
              <Text style={styles.bankDetailLabel}>Tipo:</Text>
              <Text style={styles.bankDetailValue}>{BANK_DETAILS.accountType}</Text>
            </View>

            <View style={styles.bankDetailItem}>
              <Text style={styles.bankDetailLabel}>Número de cuenta:</Text>
              <TouchableOpacity 
                onPress={() => copyToClipboard(BANK_DETAILS.accountNumber, 'Número de cuenta')}
                style={styles.copyableItem}
              >
                <Text style={styles.bankDetailValue}>{BANK_DETAILS.accountNumber}</Text>
                <MaterialIcons name="content-copy" size={16} color="#8B5CF6" />
              </TouchableOpacity>
            </View>

            <View style={styles.bankDetailItem}>
              <Text style={styles.bankDetailLabel}>CCI:</Text>
              <TouchableOpacity 
                onPress={() => copyToClipboard(BANK_DETAILS.cci, 'CCI')}
                style={styles.copyableItem}
              >
                <Text style={styles.bankDetailValue}>{BANK_DETAILS.cci}</Text>
                <MaterialIcons name="content-copy" size={16} color="#8B5CF6" />
              </TouchableOpacity>
            </View>

            <View style={styles.bankDetailItem}>
              <Text style={styles.bankDetailLabel}>Titular:</Text>
              <Text style={styles.bankDetailValue}>{BANK_DETAILS.holderName}</Text>
            </View>

            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Monto a transferir:</Text>
              <Text style={styles.amountValue}>{PLAN_PRICE}</Text>
            </View>
          </View>

          {/* Botón de confirmación */}
          <TouchableOpacity
            style={styles.transferConfirmButton}
            onPress={() => {
              setShowBankModal(false);
              setTimeout(() => setPaymentCompleted(true), 500);
            }}
          >
            <Text style={styles.transferConfirmText}>Ya realicé la transferencia</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const SuccessScreen = () => (
    <Animated.View 
      style={[
        styles.successOverlay,
        {
          opacity: successAnim,
          transform: [{ scale: successAnim }]
        }
      ]}
    >
      <View style={styles.successContent}>
        <View style={styles.successIconContainer}>
          <FontAwesome5 name="check-circle" size={64} color="#10B981" />
        </View>
        <Text style={styles.successTitle}>¡Pago Recibido! 🎉</Text>
        <Text style={styles.successMessage}>
          Tu cuenta se activará en breve. ¡Prepárate para entrenar como un verdadero guerrero!
        </Text>
      </View>
    </Animated.View>
  );

  if (showSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <SuccessScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Bot Avatar con mensaje */}
          <View style={styles.botSection}>
            <Animated.View 
              style={[
                styles.botAvatarContainer,
                {
                  transform: [{ scale: pulseAnim }]
                }
              ]}
            >
              <View style={styles.botAvatar}>
                <Text style={styles.botAvatarText}>🤖</Text>
                <View style={styles.botGlow} />
              </View>
            </Animated.View>

            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>
                ¡Excelente elección, Guerrero! Estás a un paso de desbloquear tu máximo potencial y empezar a ganar rachas.
              </Text>
              <View style={styles.speechArrow} />
            </View>
          </View>

          {/* Tarjeta del Plan Premium */}
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <FontAwesome5 name="crown" size={24} color="#F59E0B" />
              <Text style={styles.planTitle}>Suscripción Premium</Text>
              <Text style={styles.planSubtitle}>Iron Assistant</Text>
            </View>

            <View style={styles.planFeatures}>
              <View style={styles.featureItem}>
                <MaterialIcons name="check-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>IA Entrenador Personal 24/7</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="check-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Rutinas personalizadas ilimitadas</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="check-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Análisis avanzado de progreso</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="check-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Conexión con SmartWatch</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="check-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Sistema de rachas y recompensas</Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.priceValue}>{PLAN_PRICE}</Text>
              <Text style={styles.priceLabel}>por mes</Text>
            </View>
          </View>

          {/* Botones de pago */}
          <View style={styles.paymentMethodsContainer}>
            <Text style={styles.paymentMethodsTitle}>Métodos de Pago</Text>

            {/* Botón principal - MercadoPago */}
            <TouchableOpacity
              style={styles.primaryPaymentButton}
              onPress={handleMercadoPagoPayment}
              activeOpacity={0.8}
            >
              <View style={styles.paymentButtonContent}>
                <FontAwesome5 name="credit-card" size={24} color="#FFFFFF" />
                <View style={styles.paymentButtonText}>
                  <Text style={styles.paymentButtonTitle}>Yape / Tarjetas</Text>
                  <Text style={styles.paymentButtonSubtitle}>Pago rápido y seguro</Text>
                </View>
                <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            {/* Botón secundario - Transferencia */}
            <TouchableOpacity
              style={styles.secondaryPaymentButton}
              onPress={handleBankTransferPress}
              activeOpacity={0.8}
            >
              <View style={styles.paymentButtonContent}>
                <FontAwesome5 name="university" size={20} color="#9CA3AF" />
                <View style={styles.paymentButtonText}>
                  <Text style={styles.secondaryPaymentButtonTitle}>Transferencia BCP</Text>
                  <Text style={styles.secondaryPaymentButtonSubtitle}>Manual - 24-48 horas</Text>
                </View>
                <MaterialIcons name="arrow-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Botón post-pago */}
          {paymentCompleted && (
            <Animated.View style={styles.postPaymentContainer}>
              <Text style={styles.postPaymentText}>
                ¿Ya completaste tu pago?
              </Text>
              
              {isProcessing ? (
                <Animated.View 
                  style={[
                    styles.processingContainer,
                    {
                      opacity: loadingAnim
                    }
                  ]}
                >
                  <ActivityIndicator size="small" color="#8B5CF6" />
                  <Text style={styles.processingText}>Verificando pago...</Text>
                </Animated.View>
              ) : (
                <TouchableOpacity
                  style={styles.confirmPaymentButton}
                  onPress={handlePaymentConfirmation}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.confirmPaymentText}>Ya realicé mi pago</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}

          {/* Información de seguridad */}
          <View style={styles.securityInfo}>
            <MaterialIcons name="security" size={16} color="#6B7280" />
            <Text style={styles.securityText}>
              Tus datos están protegidos con encriptación SSL
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Modal de transferencia bancaria */}
      <BankTransferModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    padding: 20,
  },
  
  // Bot Section
  botSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  botAvatarContainer: {
    marginBottom: 20,
  },
  botAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1E1E1E',
    borderWidth: 3,
    borderColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  botAvatarText: {
    fontSize: 40,
  },
  botGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 58,
    backgroundColor: '#8B5CF6',
    opacity: 0.1,
    zIndex: -1,
  },
  speechBubble: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxWidth: width - 60,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#374151',
  },
  speechText: {
    fontSize: 16,
    color: '#F9FAFB',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  speechArrow: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#374151',
  },

  // Plan Card
  planCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginTop: 8,
  },
  planSubtitle: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  planFeatures: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#D1D5DB',
    marginLeft: 12,
    fontWeight: '500',
  },
  priceContainer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  priceValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  priceLabel: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 4,
  },

  // Payment Methods
  paymentMethodsContainer: {
    marginBottom: 30,
  },
  paymentMethodsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 20,
    textAlign: 'center',
  },
  primaryPaymentButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryPaymentButton: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#374151',
  },
  paymentButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentButtonText: {
    flex: 1,
    marginLeft: 16,
  },
  paymentButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  paymentButtonSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  secondaryPaymentButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  secondaryPaymentButtonSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },

  // Post Payment
  postPaymentContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
  },
  postPaymentText: {
    fontSize: 16,
    color: '#F9FAFB',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  processingText: {
    fontSize: 14,
    color: '#8B5CF6',
    marginLeft: 8,
    fontWeight: '500',
  },
  confirmPaymentButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confirmPaymentText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Security Info
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  securityText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: height * 0.8,
    borderWidth: 2,
    borderColor: '#374151',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F9FAFB',
    flex: 1,
    textAlign: 'center',
    marginLeft: -24,
  },
  closeButton: {
    padding: 4,
  },
  bankDetailsContainer: {
    padding: 20,
  },
  bankDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 20,
    textAlign: 'center',
  },
  bankDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  bankDetailLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
    flex: 1,
  },
  bankDetailValue: {
    fontSize: 14,
    color: '#F9FAFB',
    fontWeight: '600',
    textAlign: 'right',
  },
  copyableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountContainer: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  transferConfirmButton: {
    backgroundColor: '#10B981',
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  transferConfirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Success Screen
  successOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    paddingHorizontal: 40,
  },
  successContent: {
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
});