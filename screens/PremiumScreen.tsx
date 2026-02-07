import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePayment } from '../context/PaymentContext';
import { useAuth } from '../context/AuthContext';
import { stripePaymentService, SubscriptionPlan } from '../services/StripePaymentService';
import { StripeProvider, CardField, useStripe } from '@stripe/stripe-react-native';

export default function PremiumScreen() {
  return (
    <StripeProvider publishableKey={stripePaymentService.getPublishableKey()}>
      <PremiumScreenContent />
    </StripeProvider>
  );
}

function PremiumScreenContent() {
  const { 
    subscriptionStatus, 
    isLoading, 
    isPremium, 
    availablePlans,
    recommendedPlan,
    purchasePlan,
    cancelSubscription,
    getDaysRemaining,
    getTrialDaysRemaining,
    trackPremiumFeatureUsage
  } = usePayment();
  
  const { user } = useAuth();
  const stripe = useStripe();
  
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(recommendedPlan);
  const [cardComplete, setCardComplete] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    trackPremiumFeatureUsage('premium_screen_viewed');
  }, []);

  useEffect(() => {
    if (recommendedPlan && !selectedPlan) {
      setSelectedPlan(recommendedPlan);
    }
  }, [recommendedPlan]);

  const handlePurchase = async () => {
    if (!selectedPlan || !stripe || !user || !cardComplete) {
      Alert.alert('Error', 'Por favor completa los datos de la tarjeta');
      return;
    }

    setProcessingPayment(true);
    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        paymentMethodType: 'Card',
        card: {
          // Card details are handled by CardField component
        },
      });

      if (paymentMethodError) {
        Alert.alert('Error', 'Error al procesar la tarjeta: ' + paymentMethodError.message);
        return;
      }

      if (!paymentMethod) {
        Alert.alert('Error', 'No se pudo crear el método de pago');
        return;
      }

      // Purchase the plan
      const success = await purchasePlan(selectedPlan.id, paymentMethod.id);
      
      if (success) {
        Alert.alert(
          '¡Éxito!', 
          `¡Bienvenido a Iron Premium ${selectedPlan.name}! Ahora tienes acceso a todas las características premium.`,
          [{ text: 'OK', onPress: () => {
            trackPremiumFeatureUsage('premium_purchase_success');
          }}]
        );
      } else {
        Alert.alert('Error', 'No se pudo procesar el pago. Por favor intenta nuevamente.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', 'Hubo un problema procesando tu pago. Por favor intenta nuevamente.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancel = async () => {
    try {
      const success = await cancelSubscription();
      
      if (success) {
        Alert.alert(
          'Suscripción cancelada',
          'Tu suscripción ha sido cancelada. Seguirás teniendo acceso premium hasta el final de tu período actual.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'No se pudo cancelar la suscripción. Por favor contacta soporte.');
      }
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema cancelando tu suscripción.');
    }
    setShowCancelConfirm(false);
  };

  const PlanCard = ({ plan, isSelected, onSelect }: {
    plan: SubscriptionPlan;
    isSelected: boolean;
    onSelect: () => void;
  }) => (
    <TouchableOpacity
      onPress={onSelect}
      className={`mb-4 rounded-2xl border-2 ${
        isSelected ? 'border-orange-500' : 'border-gray-800'
      } ${plan.popular ? 'relative' : ''}`}
    >
      {plan.popular && (
        <View className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <LinearGradient
            colors={['#F97316', '#EA580C']}
            className="px-4 py-2 rounded-full"
          >
            <Text className="text-white font-bold text-sm">MÁS POPULAR</Text>
          </LinearGradient>
        </View>
      )}
      
      <LinearGradient
        colors={isSelected ? ['#F97316', '#EA580C'] : ['#1F2937', '#374151']}
        className="rounded-2xl"
      >
        <View className="p-6">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-white text-xl font-bold">{plan.name}</Text>
              <Text className="text-gray-300 text-sm">{plan.description}</Text>
            </View>
            {plan.discount && (
              <View className="bg-green-500 px-3 py-1 rounded-full">
                <Text className="text-white font-bold text-sm">-{plan.discount}%</Text>
              </View>
            )}
          </View>

          <View className="mb-4">
            <View className="flex-row items-baseline">
              <Text className="text-white text-3xl font-bold">
                {stripePaymentService.formatPrice(plan.price)}
              </Text>
              {plan.interval !== 'month' || plan.id === 'iron_lifetime' ? (
                <Text className="text-gray-300 text-lg ml-2">
                  {plan.id === 'iron_lifetime' ? 'única vez' : `/${plan.interval === 'year' ? 'año' : plan.interval}`}
                </Text>
              ) : (
                <Text className="text-gray-300 text-lg ml-2">/mes</Text>
              )}
            </View>
            
            {plan.interval === 'year' && (
              <Text className="text-green-400 text-sm mt-1">
                ¡Ahorra ${((plan.price * 12 - plan.price) / 100).toFixed(2)} comparado al plan mensual!
              </Text>
            )}
          </View>

          <View className="space-y-3">
            {plan.features.map((feature, index) => (
              <View key={index} className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text className="text-gray-300 ml-3 flex-1">{feature}</Text>
              </View>
            ))}
          </View>

          {isSelected && (
            <View className="mt-4 pt-4 border-t border-gray-600">
              <View className="flex-row items-center justify-center">
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text className="text-orange-400 font-semibold ml-2">Plan seleccionado</Text>
              </View>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (isPremium) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <ScrollView className="flex-1 px-4">
          {/* Header */}
          <LinearGradient
            colors={['#F97316', '#EA580C']}
            className="rounded-2xl p-6 mb-6"
          >
            <View className="flex-row items-center">
              <Ionicons name="diamond" size={32} color="white" />
              <View className="ml-4 flex-1">
                <Text className="text-white text-2xl font-bold">Iron Premium</Text>
                <Text className="text-orange-100">Miembro activo</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Current Subscription Info */}
          <View className="bg-gray-900 rounded-2xl p-6 mb-6">
            <Text className="text-white text-xl font-bold mb-4">Tu Suscripción</Text>
            
            <View className="space-y-4">
              <View className="flex-row justify-between">
                <Text className="text-gray-400">Plan actual:</Text>
                <Text className="text-white font-semibold">
                  {subscriptionStatus.plan?.name || 'Premium'}
                </Text>
              </View>
              
              {subscriptionStatus.currentPeriodEnd && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Renovación:</Text>
                  <Text className="text-white">
                    {subscriptionStatus.currentPeriodEnd.toLocaleDateString('es-ES')}
                  </Text>
                </View>
              )}
              
              <View className="flex-row justify-between">
                <Text className="text-gray-400">Días restantes:</Text>
                <Text className="text-green-400 font-semibold">
                  {getDaysRemaining()} días
                </Text>
              </View>

              {subscriptionStatus.cancelAtPeriodEnd && (
                <View className="bg-orange-900/50 border border-orange-500 rounded-lg p-3">
                  <Text className="text-orange-400 text-center">
                    ⚠️ Tu suscripción se cancelará al final del período actual
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Premium Features */}
          <View className="bg-gray-900 rounded-2xl p-6 mb-6">
            <Text className="text-white text-xl font-bold mb-4">Características Premium Activas</Text>
            
            <View className="space-y-3">
              {[
                { icon: 'robot-outline', text: 'IA Coach Avanzada' },
                { icon: 'analytics-outline', text: 'Análisis Detallado' },
                { icon: 'musical-notes-outline', text: 'Música Premium' },
                { icon: 'trophy-outline', text: 'Logros Exclusivos' },
                { icon: 'shield-checkmark-outline', text: 'Sin Anuncios' },
                { icon: 'gift-outline', text: 'Cupones Premium' },
              ].map((feature, index) => (
                <View key={index} className="flex-row items-center">
                  <View className="bg-orange-500 rounded-full p-2">
                    <Ionicons name={feature.icon as any} size={16} color="white" />
                  </View>
                  <Text className="text-white ml-4">{feature.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Manage Subscription */}
          <View className="bg-gray-900 rounded-2xl p-6 mb-6">
            <Text className="text-white text-xl font-bold mb-4">Gestionar Suscripción</Text>
            
            <View className="space-y-4">
              <TouchableOpacity 
                className="bg-gray-800 rounded-lg p-4 flex-row items-center justify-between"
                onPress={() => {/* Navigate to payment methods */}}
              >
                <View className="flex-row items-center">
                  <Ionicons name="card-outline" size={24} color="#6B7280" />
                  <Text className="text-white ml-3">Métodos de pago</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-gray-800 rounded-lg p-4 flex-row items-center justify-between"
                onPress={() => {/* Navigate to billing history */}}
              >
                <View className="flex-row items-center">
                  <Ionicons name="receipt-outline" size={24} color="#6B7280" />
                  <Text className="text-white ml-3">Historial de facturación</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
              
              {!subscriptionStatus.cancelAtPeriodEnd && (
                <TouchableOpacity 
                  className="bg-red-900/50 border border-red-500 rounded-lg p-4 flex-row items-center justify-center"
                  onPress={() => setShowCancelConfirm(true)}
                >
                  <Ionicons name="close-circle-outline" size={24} color="#EF4444" />
                  <Text className="text-red-400 ml-3 font-semibold">Cancelar suscripción</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <View className="absolute inset-0 bg-black/80 flex-1 justify-center items-center px-6">
            <View className="bg-gray-900 rounded-2xl p-6 w-full">
              <Text className="text-white text-xl font-bold mb-4 text-center">
                ¿Cancelar suscripción?
              </Text>
              <Text className="text-gray-300 mb-6 text-center">
                Tu suscripción se cancelará al final del período actual ({subscriptionStatus.currentPeriodEnd?.toLocaleDateString('es-ES')}). 
                Seguirás teniendo acceso a todas las características premium hasta entonces.
              </Text>
              <View className="flex-row space-x-4">
                <TouchableOpacity 
                  className="flex-1 bg-gray-800 rounded-lg p-4"
                  onPress={() => setShowCancelConfirm(false)}
                >
                  <Text className="text-white text-center font-semibold">Mantener</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="flex-1 bg-red-600 rounded-lg p-4"
                  onPress={handleCancel}
                >
                  <Text className="text-white text-center font-semibold">Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="flex-1 px-4">
        {/* Header */}
        <View className="py-6">
          <Text className="text-white text-3xl font-bold text-center mb-2">
            Desbloquea Iron Premium
          </Text>
          <Text className="text-gray-400 text-center">
            Accede a características avanzadas y mejora tu experiencia de fitness
          </Text>
        </View>

        {/* Trial Banner */}
        {getTrialDaysRemaining() > 0 && (
          <LinearGradient
            colors={['#10B981', '#059669']}
            className="rounded-2xl p-4 mb-6"
          >
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={24} color="white" />
              <View className="ml-3">
                <Text className="text-white font-bold">Prueba Gratuita</Text>
                <Text className="text-green-100">
                  {getTrialDaysRemaining()} días restantes
                </Text>
              </View>
            </View>
          </LinearGradient>
        )}

        {/* Plans */}
        <View className="mb-6">
          {availablePlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan?.id === plan.id}
              onSelect={() => setSelectedPlan(plan)}
            />
          ))}
        </View>

        {/* Payment Section */}
        {selectedPlan && (
          <View className="bg-gray-900 rounded-2xl p-6 mb-6">
            <Text className="text-white text-xl font-bold mb-4">Información de Pago</Text>
            
            <CardField
              postalCodeEnabled={true}
              placeholders={{
                number: '4242 4242 4242 4242',
              }}
              cardStyle={{
                backgroundColor: '#374151',
                textColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#6B7280',
                borderRadius: 8,
              }}
              style={{
                width: '100%',
                height: 50,
                marginVertical: 16,
              }}
              onCardChange={(cardDetails) => {
                setCardComplete(cardDetails.complete);
              }}
            />

            <TouchableOpacity
              className={`rounded-lg p-4 ${
                cardComplete && selectedPlan && !processingPayment && !isLoading
                  ? 'bg-orange-600' 
                  : 'bg-gray-700'
              }`}
              onPress={handlePurchase}
              disabled={!cardComplete || !selectedPlan || processingPayment || isLoading}
            >
              <Text className="text-white text-center font-semibold text-lg">
                {processingPayment 
                  ? 'Procesando...' 
                  : `Suscribirse por ${stripePaymentService.formatPrice(selectedPlan?.price || 0)}`
                }
              </Text>
            </TouchableOpacity>

            <Text className="text-gray-400 text-xs text-center mt-4">
              Al suscribirte aceptas nuestros Términos de Servicio y Política de Privacidad.
              Puedes cancelar en cualquier momento.
            </Text>
          </View>
        )}

        {/* Features Summary */}
        <View className="bg-gray-900 rounded-2xl p-6 mb-6">
          <Text className="text-white text-xl font-bold mb-4 text-center">
            ¿Por qué elegir Iron Premium?
          </Text>
          
          <View className="space-y-4">
            {[
              {
                icon: 'rocket-outline',
                title: 'Resultados Más Rápidos',
                description: 'Planes personalizados con IA avanzada para maximizar tu progreso'
              },
              {
                icon: 'analytics-outline',
                title: 'Análisis Profundo',
                description: 'Estadísticas detalladas y reportes para optimizar tu entrenamiento'
              },
              {
                icon: 'shield-checkmark-outline',
                title: 'Experiencia Premium',
                description: 'Sin anuncios, acceso ilimitado y soporte prioritario'
              },
            ].map((feature, index) => (
              <View key={index} className="flex-row items-start">
                <View className="bg-orange-500 rounded-full p-2 mr-4">
                  <Ionicons name={feature.icon as any} size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold mb-1">{feature.title}</Text>
                  <Text className="text-gray-400 text-sm">{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}