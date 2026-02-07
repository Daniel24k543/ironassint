// Configuration for gamification features

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (userData: any) => boolean;
  reward: {
    points: number;
    type: 'badge' | 'coupon' | 'streak_boost';
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_workout',
    title: 'Primer Paso',
    description: 'Completa tu primer entrenamiento',
    icon: 'fitness',
    condition: (userData) => userData.totalWorkouts >= 1,
    reward: { points: 100, type: 'badge' },
  },
  {
    id: 'week_streak',
    title: 'Guerrero Semanal',
    description: 'Mantén una racha de 7 días',
    icon: 'flame',
    condition: (userData) => userData.currentStreak >= 7,
    reward: { points: 500, type: 'coupon' },
  },
  {
    id: 'month_streak',
    title: 'Atleta Constante',
    description: 'Mantén una racha de 30 días',
    icon: 'trophy',
    condition: (userData) => userData.currentStreak >= 30,
    reward: { points: 2000, type: 'streak_boost' },
  },
  {
    id: 'ten_workouts',
    title: 'Dedicado',
    description: 'Completa 10 entrenamientos',
    icon: 'medal',
    condition: (userData) => userData.totalWorkouts >= 10,
    reward: { points: 300, type: 'badge' },
  },
  {
    id: 'fifty_workouts',
    title: 'Máquina de Entrenar',
    description: 'Completa 50 entrenamientos',
    icon: 'star',
    condition: (userData) => userData.totalWorkouts >= 50,
    reward: { points: 1000, type: 'coupon' },
  },
  {
    id: 'morning_warrior',
    title: 'Madrugador',
    description: 'Entrena 5 veces en la mañana',
    icon: 'sunny',
    condition: (userData) => userData.morningWorkouts >= 5,
    reward: { points: 200, type: 'badge' },
  },
];

export const STREAK_REWARDS = {
  7: { points: 100, message: '¡Una semana completa! 🔥' },
  14: { points: 250, message: '¡Dos semanas increíbles! 💪' },
  21: { points: 500, message: '¡Tres semanas de dedicación! 🏆' },
  30: { points: 1000, message: '¡Un mes entero! ¡Eres imparable! 🌟' },
  50: { points: 2000, message: '¡Cincuenta días! ¡Leyenda! 👑' },
  100: { points: 5000, message: '¡CENTURIÓN! ¡100 días de pura dedicación! 🦾' },
};

export const POINT_VALUES = {
  WORKOUT_COMPLETE: 50,
  STREAK_DAILY: 10,
  AI_INTERACTION: 5,
  CHALLENGE_COMPLETE: 100,
  FRIEND_REFERRAL: 200,
};

export interface CouponType {
  id: string;
  title: string;
  description: string;
  discount: string;
  brand: string;
  image: string;
  pointsCost: number;
  expirationDays: number;
  category: 'supplement' | 'equipment' | 'clothing' | 'food';
}

export const AVAILABLE_COUPONS: CouponType[] = [
  {
    id: 'protein_10',
    title: '10% OFF Proteína',
    description: 'Descuento en suplementos de proteína',
    discount: '10%',
    brand: 'NutriMax',
    image: '',
    pointsCost: 500,
    expirationDays: 30,
    category: 'supplement',
  },
  {
    id: 'equipment_15',
    title: '15% OFF Equipamiento',
    description: 'Descuento en equipamiento deportivo',
    discount: '15%',
    brand: 'FitGear',
    image: '',
    pointsCost: 800,
    expirationDays: 45,
    category: 'equipment',
  },
  {
    id: 'clothing_20',
    title: '20% OFF Ropa Deportiva',
    description: 'Descuento en indumentaria fitness',
    discount: '20%',
    brand: 'ActiveWear',
    image: '',
    pointsCost: 1000,
    expirationDays: 60,
    category: 'clothing',
  },
  {
    id: 'smoothie_free',
    title: 'Smoothie Gratis',
    description: 'Un smoothie proteico gratis',
    discount: '100%',
    brand: 'HealthyCorner',
    image: '',
    pointsCost: 300,
    expirationDays: 15,
    category: 'food',
  },
];

export const WHEEL_PRIZES = [
  { id: 'points_50', label: '50 Puntos', value: 50, type: 'points', probability: 25 },
  { id: 'points_100', label: '100 Puntos', value: 100, type: 'points', probability: 20 },
  { id: 'points_200', label: '200 Puntos', value: 200, type: 'points', probability: 15 },
  { id: 'coupon_protein', label: 'Cupón Proteína', value: 'protein_10', type: 'coupon', probability: 10 },
  { id: 'streak_boost', label: 'Boost de Racha', value: 3, type: 'streak_protection', probability: 8 },
  { id: 'points_500', label: '500 Puntos', value: 500, type: 'points', probability: 7 },
  { id: 'coupon_equipment', label: 'Cupón Equipamiento', value: 'equipment_15', type: 'coupon', probability: 5 },
  { id: 'mega_points', label: '1000 Puntos', value: 1000, type: 'points', probability: 3 },
];

export const WORKOUT_TYPES = [
  { id: 'strength', name: 'Fuerza', emoji: '💪', color: '#FF6B6B' },
  { id: 'cardio', name: 'Cardio', emoji: '🏃‍♂️', color: '#4ECDC4' },
  { id: 'flexibility', name: 'Flexibilidad', emoji: '🧘‍♀️', color: '#45B7D1' },
  { id: 'hiit', name: 'HIIT', emoji: '🔥', color: '#FFA726' },
  { id: 'yoga', name: 'Yoga', emoji: '🕉️', color: '#AB47BC' },
  { id: 'pilates', name: 'Pilates', emoji: '⚖️', color: '#66BB6A' },
  { id: 'sports', name: 'Deportes', emoji: '⚽', color: '#FF7043' },
  { id: 'dance', name: 'Baile', emoji: '💃', color: '#EC407A' },
];

export const DIFFICULTY_LEVELS = [
  { id: 'beginner', name: 'Principiante', multiplier: 1, emoji: '🌱' },
  { id: 'intermediate', name: 'Intermedio', multiplier: 1.5, emoji: '💪' },
  { id: 'advanced', name: 'Avanzado', multiplier: 2, emoji: '🔥' },
  { id: 'expert', name: 'Experto', multiplier: 3, emoji: '⚡' },
];

export function checkAchievements(userData: any, previousUserData: any): Achievement[] {
  const newAchievements: Achievement[] = [];
  
  for (const achievement of ACHIEVEMENTS) {
    const wasAlreadyUnlocked = previousUserData?.achievements?.includes(achievement.id);
    const isNowUnlocked = achievement.condition(userData);
    
    if (isNowUnlocked && !wasAlreadyUnlocked) {
      newAchievements.push(achievement);
    }
  }
  
  return newAchievements;
}

export function calculateStreakReward(streakDays: number): { points: number; message: string } | null {
  return STREAK_REWARDS[streakDays] || null;
}

export function getRandomWheelPrize() {
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const prize of WHEEL_PRIZES) {
    cumulative += prize.probability;
    if (random <= cumulative) {
      return prize;
    }
  }
  
  return WHEEL_PRIZES[0]; // Fallback
}