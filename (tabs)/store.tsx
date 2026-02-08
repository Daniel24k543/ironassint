import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUserData } from '../../context/UserDataContext';
import { SpinWheel, WheelResultModal } from '../../components/SpinWheel';
import { AVAILABLE_COUPONS, CouponType, POINT_VALUES } from '../../constants/GameConfig';

export default function StoreScreen() {
  const { userData, updateUserData } = useUserData();
  const [activeTab, setActiveTab] = useState<'wheel' | 'coupons' | 'premium'>('wheel');
  const [showWheelResult, setShowWheelResult] = useState(false);
  const [lastPrize, setLastPrize] = useState(null);

  // Simulate user points - in real app this would come from userData
  const userPoints = userData.points || 0;

  const handleWheelSpin = async (prize: any) => {
    try {
      // Deduct points for spin
      const newPoints = Math.max(0, userPoints - 100);
      
      // Add prize points if applicable
      let pointsToAdd = 0;
      if (prize.type === 'points') {
        pointsToAdd = prize.value;
      }

      await updateUserData({
        ...userData,
        points: newPoints + pointsToAdd,
        wheelSpins: (userData.wheelSpins || 0) + 1,
      });

      setLastPrize(prize);
      setShowWheelResult(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar el premio');
    }
  };

  const handleCouponPurchase = async (coupon: CouponType) => {
    if (userPoints < coupon.pointsCost) {
      Alert.alert('Puntos Insuficientes', 'No tienes suficientes puntos para este cupón');
      return;
    }

    Alert.alert(
      'Confirmar Compra',
      `¿Quieres canjear ${coupon.pointsCost} puntos por este cupón?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const newPoints = userPoints - coupon.pointsCost;
              const userCoupons = userData.coupons || [];
              
              await updateUserData({
                ...userData,
                points: newPoints,
                coupons: [...userCoupons, {
                  ...coupon,
                  purchaseDate: new Date().toISOString(),
                  expiresAt: new Date(Date.now() + coupon.expirationDays * 24 * 60 * 60 * 1000).toISOString(),
                }],
              });

              Alert.alert('¡Éxito!', 'Cupón canjeado exitosamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo canjear el cupón');
            }
          },
        },
      ]
    );
  };

  const CouponCard = ({ coupon }: { coupon: CouponType }) => (
    <View className="bg-gray-800 rounded-xl p-4 mb-4 mx-4">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-white font-bold text-lg">{coupon.title}</Text>
          <Text className="text-gray-300 text-sm">{coupon.brand}</Text>
        </View>
        <View className="bg-red-600 rounded-full px-2 py-1">
          <Text className="text-white font-bold">{coupon.discount}</Text>
        </View>
      </View>
      
      <Text className="text-gray-400 text-sm mb-3">{coupon.description}</Text>
      
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text className="text-yellow-500 font-bold ml-1">{coupon.pointsCost}</Text>
        </View>
        
        <TouchableOpacity
          onPress={() => handleCouponPurchase(coupon)}
          disabled={userPoints < coupon.pointsCost}
        >
          <LinearGradient
            colors={userPoints >= coupon.pointsCost ? ['#F59E0B', '#D97706'] : ['#6B7280', '#4B5563']}
            className="rounded-lg px-4 py-2"
          >
            <Text className="text-white font-bold">
              {userPoints >= coupon.pointsCost ? 'Canjear' : 'Sin puntos'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-900">
      <StatusBar style="light" />
      
      {/* Header */}
      <LinearGradient
        colors={['#1F2937', '#374151']}
        className="px-6 pt-12 pb-6"
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-bold text-white">🛒 Tienda</Text>
          <View className="bg-yellow-500 bg-opacity-20 rounded-lg px-3 py-2">
            <View className="flex-row items-center">
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text className="text-yellow-500 font-bold ml-2">{userPoints}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View className="flex-row bg-gray-800 mx-4 mt-4 rounded-xl p-1">
        {[
          { key: 'wheel', label: '🎯 Ruleta', icon: 'radio-button-on' },
          { key: 'coupons', label: '🎫 Cupones', icon: 'ticket' },
          { key: 'premium', label: '👑 Premium', icon: 'star' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            className="flex-1"
          >
            <View className={`
              rounded-lg py-3 px-4 items-center
              ${activeTab === tab.key ? 'bg-blue-600' : 'bg-transparent'}
            `}>
              <Text className={`
                font-bold text-center
                ${activeTab === tab.key ? 'text-white' : 'text-gray-400'}
              `}>
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView className="flex-1 mt-4">
        {activeTab === 'wheel' && (
          <View className="p-6">
            <Text className="text-white text-xl font-bold text-center mb-2">
              🎯 Ruleta de la Suerte
            </Text>
            <Text className="text-gray-400 text-center mb-6">
              ¡Gira y gana puntos, cupones y premios especiales!
            </Text>
            
            <SpinWheel
              onSpinComplete={handleWheelSpin}
              disabled={userPoints < 100}
              cost={100}
            />
            
            {userPoints < 100 && (
              <View className="mt-4 bg-red-600 bg-opacity-20 rounded-lg p-4">
                <Text className="text-red-400 text-center">
                  Necesitas al menos 100 puntos para girar la ruleta
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'coupons' && (
          <View className="pb-6">
            <Text className="text-white text-xl font-bold text-center mb-2 px-6">
              🎫 Cupones de Descuento
            </Text>
            <Text className="text-gray-400 text-center mb-6 px-6">
              Canjea tus puntos por descuentos exclusivos
            </Text>
            
            {AVAILABLE_COUPONS.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </View>
        )}

        {activeTab === 'premium' && (
          <View className="p-6">
            <Text className="text-white text-xl font-bold text-center mb-2">
              👑 Membresía Premium
            </Text>
            <Text className="text-gray-400 text-center mb-6">
              Desbloquea características exclusivas
            </Text>
            
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              className="rounded-xl p-6 mb-4"
            >
              <Text className="text-white text-2xl font-bold text-center mb-4">
                ¡Conviértete en Premium!
              </Text>
              
              <View className="space-y-3">
                {[
                  '🤖 IA Coach avanzada con planes personalizados',
                  '📊 Análisis detallado de progreso',
                  '🎵 Biblioteca musical premium ilimitada',
                  '🏆 Logros y retos exclusivos',
                  '⚡ Sin anuncios',
                  '💎 Descuentos especiales en cupones',
                ].map((feature, index) => (
                  <View key={index} className="flex-row items-center mb-2">
                    <Text className="text-white ml-2">{feature}</Text>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity className="bg-white bg-opacity-90 rounded-lg py-4 mt-6">
                <Text className="text-orange-600 font-bold text-center text-lg">
                  Activar Premium - $9.99/mes
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}
      </ScrollView>

      {/* Wheel Result Modal */}
      <WheelResultModal
        visible={showWheelResult}
        prize={lastPrize}
        onClose={() => setShowWheelResult(false)}
      />
    </View>
  );
}