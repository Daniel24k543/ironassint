import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Text as SvgText, G } from 'react-native-svg';
import { WHEEL_PRIZES, getRandomWheelPrize } from '../constants/GameConfig';

const { width } = Dimensions.get('window');
const wheelSize = Math.min(width - 40, 300);
const radius = wheelSize / 2;
const center = radius;

interface WheelSegment {
  id: string;
  label: string;
  color: string;
  startAngle: number;
  endAngle: number;
  value: any;
  type: string;
}

export function SpinWheel({ 
  onSpinComplete, 
  disabled = false,
  cost = 100 
}: { 
  onSpinComplete: (prize: any) => void;
  disabled?: boolean;
  cost?: number;
}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation] = useState(new Animated.Value(0));
  const [result, setResult] = useState<any>(null);

  // Generate wheel segments
  const segments: WheelSegment[] = WHEEL_PRIZES.map((prize, index) => {
    const segmentAngle = 360 / WHEEL_PRIZES.length;
    const startAngle = index * segmentAngle;
    const endAngle = startAngle + segmentAngle;
    
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA726',
      '#AB47BC', '#66BB6A', '#FF7043', '#EC407A'
    ];
    
    return {
      id: prize.id,
      label: prize.label,
      color: colors[index % colors.length],
      startAngle,
      endAngle,
      value: prize.value,
      type: prize.type,
    };
  });

  const spin = () => {
    if (isSpinning || disabled) return;
    
    setIsSpinning(true);
    setResult(null);
    
    // Get random prize
    const prize = getRandomWheelPrize();
    
    // Calculate target angle
    const segmentIndex = WHEEL_PRIZES.findIndex(p => p.id === prize.id);
    const segmentAngle = 360 / WHEEL_PRIZES.length;
    const targetAngle = (segmentIndex * segmentAngle) + (segmentAngle / 2);
    
    // Add multiple rotations for dramatic effect
    const finalAngle = 360 * 5 + (360 - targetAngle); // 5 full rotations
    
    Animated.timing(rotation, {
      toValue: finalAngle,
      duration: 4000,
      useNativeDriver: true,
    }).start(() => {
      setIsSpinning(false);
      setResult(prize);
      onSpinComplete(prize);
    });
  };

  const createSegmentPath = (startAngle: number, endAngle: number) => {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <View className="items-center">
      {/* Cost Display */}
      <View className="bg-gray-800 rounded-lg px-4 py-2 mb-4">
        <Text className="text-white text-center">
          <Ionicons name="star" size={16} color="#FFD700" /> {cost} puntos por giro
        </Text>
      </View>

      {/* Wheel */}
      <View className="relative items-center justify-center">
        <Animated.View
          style={{
            transform: [{ 
              rotate: rotation.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg'],
              }) 
            }],
          }}
        >
          <Svg width={wheelSize} height={wheelSize} className="rounded-full border-4 border-white">
            {segments.map((segment, index) => (
              <G key={segment.id}>
                <Path
                  d={createSegmentPath(segment.startAngle, segment.endAngle)}
                  fill={segment.color}
                  stroke="#FFF"
                  strokeWidth={2}
                />
                
                {/* Text labels */}
                <SvgText
                  x={center + (radius * 0.7) * Math.cos(((segment.startAngle + segment.endAngle) / 2) * Math.PI / 180)}
                  y={center + (radius * 0.7) * Math.sin(((segment.startAngle + segment.endAngle) / 2) * Math.PI / 180)}
                  fill="#FFF"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {segment.label.length > 12 ? segment.label.substring(0, 10) + '...' : segment.label}
                </SvgText>
              </G>
            ))}
          </Svg>
        </Animated.View>
        
        {/* Pointer */}
        <View className="absolute top-2 items-center">
          <View className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-white" />
        </View>
      </View>

      {/* Spin Button */}
      <TouchableOpacity
        onPress={spin}
        disabled={isSpinning || disabled}
        className="mt-6"
      >
        <LinearGradient
          colors={disabled ? ['#6B7280', '#4B5563'] : ['#F59E0B', '#D97706']}
          className={`
            rounded-full px-8 py-4 items-center justify-center
            ${isSpinning ? 'opacity-50' : ''}
          `}
        >
          {isSpinning ? (
            <View className="flex-row items-center">
              <Animated.View
                style={{
                  transform: [{ 
                    rotate: rotation.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg'],
                    }) 
                  }],
                }}
              >
                <Ionicons name="refresh" size={20} color="white" />
              </Animated.View>
              <Text className="text-white font-bold ml-2">Girando...</Text>
            </View>
          ) : (
            <View className="flex-row items-center">
              <Ionicons name="play" size={20} color="white" />
              <Text className="text-white font-bold ml-2">
                {disabled ? 'Sin puntos' : '¡GIRAR!'}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Result Display */}
      {result && !isSpinning && (
        <View className="mt-4 bg-green-600 rounded-lg px-6 py-3">
          <Text className="text-white text-center font-bold">
            🎉 ¡Ganaste: {result.label}! 🎉
          </Text>
        </View>
      )}
    </View>
  );
}

interface WheelResultModalProps {
  visible: boolean;
  prize: any;
  onClose: () => void;
}

export function WheelResultModal({ visible, prize, onClose }: WheelResultModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 150,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible || !prize) return null;

  const getIconForPrizeType = () => {
    switch (prize.type) {
      case 'points':
        return 'star';
      case 'coupon':
        return 'ticket';
      case 'streak_protection':
        return 'shield';
      default:
        return 'gift';
    }
  };

  const getPrizeMessage = () => {
    switch (prize.type) {
      case 'points':
        return `¡Ganaste ${prize.value} puntos!`;
      case 'coupon':
        return '¡Ganaste un cupón de descuento!';
      case 'streak_protection':
        return `¡${prize.value} días de protección de racha!`;
      default:
        return '¡Premio especial!';
    }
  };

  return (
    <Animated.View 
      className="absolute inset-0 bg-black bg-opacity-75 items-center justify-center z-50"
      style={{ opacity: opacityAnim }}
    >
      <Animated.View 
        style={{ transform: [{ scale: scaleAnim }] }}
        className="mx-8 w-80"
      >
        <LinearGradient
          colors={['#10B981', '#059669']}
          className="rounded-2xl p-6 border-4 border-green-300"
        >
          <View className="items-center">
            <Text className="text-3xl text-center mb-4">
              🎉🎊🎉
            </Text>
            
            <View className="w-20 h-20 bg-white bg-opacity-90 rounded-full items-center justify-center mb-4">
              <Ionicons 
                name={getIconForPrizeType() as any} 
                size={40} 
                color="#059669" 
              />
            </View>
            
            <Text className="text-2xl font-bold text-white mb-2 text-center">
              ¡FELICITACIONES!
            </Text>
            
            <Text className="text-lg text-white text-center mb-4">
              {getPrizeMessage()}
            </Text>
            
            <View className="bg-white bg-opacity-20 rounded-lg p-3 mb-6 w-full">
              <Text className="text-white text-center font-bold text-lg">
                {prize.label}
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={onClose}
              className="bg-white bg-opacity-90 rounded-lg px-8 py-3 w-full"
            >
              <Text className="text-green-700 font-bold text-center text-lg">
                ¡Continuar!
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
}