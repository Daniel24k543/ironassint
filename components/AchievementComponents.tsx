import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ACHIEVEMENTS, Achievement } from '../constants/GameConfig';

interface AchievementBadgeProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress?: number;
  onPress?: () => void;
}

export function AchievementBadge({ 
  achievement, 
  isUnlocked, 
  progress = 0, 
  onPress 
}: AchievementBadgeProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onPress?.();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <LinearGradient
          colors={
            isUnlocked 
              ? ['#FFD700', '#FFA500'] 
              : ['#374151', '#4B5563']
          }
          className={`
            rounded-xl p-4 mx-2 mb-4 border-2 
            ${isUnlocked ? 'border-yellow-300' : 'border-gray-600'}
          `}
          style={{ minWidth: 140, minHeight: 120 }}
        >
          <View className="items-center">
            <View className={`
              w-12 h-12 rounded-full items-center justify-center mb-2
              ${isUnlocked ? 'bg-white bg-opacity-90' : 'bg-gray-700'}
            `}>
              <Ionicons 
                name={achievement.icon as any} 
                size={24} 
                color={isUnlocked ? '#F59E0B' : '#9CA3AF'} 
              />
            </View>
            
            <Text className={`
              text-sm font-bold text-center mb-1
              ${isUnlocked ? 'text-white' : 'text-gray-300'}
            `}>
              {achievement.title}
            </Text>
            
            <Text className={`
              text-xs text-center
              ${isUnlocked ? 'text-white text-opacity-90' : 'text-gray-400'}
            `}>
              {achievement.description}
            </Text>
            
            {!isUnlocked && progress > 0 && (
              <View className="mt-2 w-full">
                <View className="bg-gray-700 h-2 rounded-full overflow-hidden">
                  <View 
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${Math.min(progress * 100, 100)}%` }}
                  />
                </View>
                <Text className="text-xs text-gray-400 text-center mt-1">
                  {Math.round(progress * 100)}%
                </Text>
              </View>
            )}
            
            {isUnlocked && (
              <View className="mt-2 flex-row items-center">
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text className="text-xs text-white ml-1">
                  +{achievement.reward.points} pts
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface AchievementListProps {
  userAchievements: string[];
  userData: any;
  onAchievementPress?: (achievement: Achievement) => void;
}

export function AchievementList({ 
  userAchievements, 
  userData, 
  onAchievementPress 
}: AchievementListProps) {
  const calculateProgress = (achievement: Achievement) => {
    // This is a simplified progress calculation
    // In a real app, you'd want more sophisticated progress tracking
    switch (achievement.id) {
      case 'week_streak':
        return Math.min(userData.currentStreak / 7, 1);
      case 'month_streak':
        return Math.min(userData.currentStreak / 30, 1);
      case 'ten_workouts':
        return Math.min(userData.totalWorkouts / 10, 1);
      case 'fifty_workouts':
        return Math.min(userData.totalWorkouts / 50, 1);
      case 'morning_warrior':
        return Math.min((userData.morningWorkouts || 0) / 5, 1);
      default:
        return 0;
    }
  };

  const unlockedAchievements = ACHIEVEMENTS.filter(achievement => 
    userAchievements.includes(achievement.id)
  );
  
  const lockedAchievements = ACHIEVEMENTS.filter(achievement => 
    !userAchievements.includes(achievement.id)
  );

  return (
    <View className="flex-1">
      {unlockedAchievements.length > 0 && (
        <View className="mb-6">
          <Text className="text-xl font-bold text-white mb-4 px-4">
            🏆 Logros Desbloqueados
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row px-2">
              {unlockedAchievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  isUnlocked={true}
                  onPress={() => onAchievementPress?.(achievement)}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <View className="mb-6">
        <Text className="text-xl font-bold text-white mb-4 px-4">
          🎯 Logros por Desbloquear
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row px-2">
            {lockedAchievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                isUnlocked={false}
                progress={calculateProgress(achievement)}
                onPress={() => onAchievementPress?.(achievement)}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

interface AchievementPopupProps {
  achievement: Achievement;
  visible: boolean;
  onClose: () => void;
}

export function AchievementPopup({ achievement, visible, onClose }: AchievementPopupProps) {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

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
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View 
      className="absolute inset-0 bg-black bg-opacity-50 items-center justify-center z-50"
      style={{ opacity: opacityAnim }}
    >
      <Animated.View 
        style={{ transform: [{ scale: scaleAnim }] }}
        className="mx-8"
      >
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          className="rounded-2xl p-6 border-4 border-yellow-300"
        >
          <View className="items-center">
            <Text className="text-2xl font-bold text-white mb-2 text-center">
              🎉 ¡LOGRO DESBLOQUEADO! 🎉
            </Text>
            
            <View className="w-20 h-20 bg-white bg-opacity-90 rounded-full items-center justify-center mb-4">
              <Ionicons 
                name={achievement.icon as any} 
                size={40} 
                color="#F59E0B" 
              />
            </View>
            
            <Text className="text-xl font-bold text-white mb-2 text-center">
              {achievement.title}
            </Text>
            
            <Text className="text-sm text-white text-opacity-90 text-center mb-4">
              {achievement.description}
            </Text>
            
            <View className="bg-white bg-opacity-20 rounded-lg p-3 mb-4">
              <Text className="text-white text-center font-bold">
                +{achievement.reward.points} Puntos
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={onClose}
              className="bg-white bg-opacity-90 rounded-lg px-6 py-3"
            >
              <Text className="text-orange-600 font-bold text-center">
                ¡Genial!
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
}