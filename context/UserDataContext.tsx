import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

export interface UserData {
  // Personal Info
  age?: number;
  weight?: number;
  height?: number;
  gender?: 'male' | 'female' | 'other';
  
  // Fitness Goals
  primaryGoal?: 'lose_weight' | 'gain_muscle' | 'maintain_fitness' | 'get_stronger';
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  workoutFrequency?: number; // times per week
  preferredWorkoutTime?: 'morning' | 'afternoon' | 'evening';
  
  // Preferences
  preferredWorkoutTypes?: string[];
  healthConditions?: string[];
  
  // App Settings
  onboardingCompleted?: boolean;
  notificationsEnabled?: boolean;
  dailyGoalCalories?: number;
  dailyGoalSteps?: number;
  
  // Progress Tracking
  currentStreak?: number;
  totalWorkouts?: number;
  achievements?: string[];
  
  // Gamification System
  points?: number;
  level?: number;
  wheelSpins?: number;
  coupons?: any[];
  weeklyWorkouts?: number;
  monthlyWorkouts?: number;
  morningWorkouts?: number;
  lastWorkoutDate?: string;
  streakStartDate?: string;
  
  // Premium Features
  isPremium?: boolean;
  premiumExpiresAt?: string;
}

interface UserDataContextType {
  userData: UserData;
  isLoading: boolean;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  resetUserData: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  completeWorkout: (workoutType?: string) => Promise<{ pointsEarned: number; streakDays: number } | undefined>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData>({
    currentStreak: 0,
    totalWorkouts: 0,
    achievements: [],
    onboardingCompleted: false,
    points: 0,
    level: 1,
    wheelSpins: 0,
    coupons: [],
    weeklyWorkouts: 0,
    monthlyWorkouts: 0,
    morningWorkouts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Reset userData when user logs out
      setUserData({
        currentStreak: 0,
        totalWorkouts: 0,
        achievements: [],
        onboardingCompleted: false,
        points: 0,
        level: 1,
        wheelSpins: 0,
        coupons: [],
        weeklyWorkouts: 0,
        monthlyWorkouts: 0,
        morningWorkouts: 0,
      });
      setIsLoading(false);
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      // Try to load from Firestore first
      const userDataDoc = await getDoc(doc(db, 'userData', user.id));
      
      if (userDataDoc.exists()) {
        const firestoreData = userDataDoc.data();
        setUserData(prev => ({ ...prev, ...firestoreData }));
      } else {
        // Try to load from AsyncStorage (for migration)
        const storedData = await AsyncStorage.getItem('@iron_assistant_user_data');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setUserData(prev => ({ ...prev, ...parsedData }));
          
          // Migrate to Firestore and remove from AsyncStorage
          await setDoc(doc(db, 'userData', user.id), parsedData);
          await AsyncStorage.removeItem('@iron_assistant_user_data');
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserData = async (data: Partial<UserData>) => {
    try {
      const updatedData = { ...userData, ...data };
      setUserData(updatedData);
      
      // Save to Firestore if user is logged in
      if (user) {
        await setDoc(doc(db, 'userData', user.id), updatedData, { merge: true });
      } else {
        // Fallback to AsyncStorage for guest users
        await AsyncStorage.setItem('@iron_assistant_user_data', JSON.stringify(updatedData));
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  const resetUserData = async () => {
    try {
      const defaultData: UserData = {
        currentStreak: 0,
        totalWorkouts: 0,
        achievements: [],
        onboardingCompleted: false,
        points: 0,
        level: 1,
        wheelSpins: 0,
        coupons: [],
        weeklyWorkouts: 0,
        monthlyWorkouts: 0,
        morningWorkouts: 0,
      };
      
      setUserData(defaultData);
      
      if (user) {
        await setDoc(doc(db, 'userData', user.id), defaultData);
      } else {
        await AsyncStorage.setItem('@iron_assistant_user_data', JSON.stringify(defaultData));
      }
    } catch (error) {
      console.error('Error resetting user data:', error);
      throw error;
    }
  };

  const completeWorkout = async (workoutType?: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastWorkoutDate = userData.lastWorkoutDate;
      
      // Check if already worked out today
      if (lastWorkoutDate === today) {
        return; // Already worked out today
      }
      
      let newStreak = userData.currentStreak || 0;
      
      // Calculate streak
      if (lastWorkoutDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastWorkoutDate === yesterdayStr) {
          newStreak += 1; // Continue streak
        } else {
          newStreak = 1; // New streak starts
        }
      } else {
        newStreak = 1; // First workout
      }
      
      // Calculate points
      let pointsEarned = 50; // Base points for workout
      pointsEarned += newStreak * 5; // Bonus points for streak
      
      // Morning workout bonus
      const hour = new Date().getHours();
      const isMorningWorkout = hour >= 6 && hour < 12;
      if (isMorningWorkout) {
        pointsEarned += 10; // Morning bonus
      }
      
      // Update data
      const updatedData = {
        ...userData,
        totalWorkouts: (userData.totalWorkouts || 0) + 1,
        currentStreak: newStreak,
        points: (userData.points || 0) + pointsEarned,
        lastWorkoutDate: today,
        weeklyWorkouts: (userData.weeklyWorkouts || 0) + 1,
        monthlyWorkouts: (userData.monthlyWorkouts || 0) + 1,
        morningWorkouts: isMorningWorkout ? (userData.morningWorkouts || 0) + 1 : userData.morningWorkouts,
        streakStartDate: newStreak === 1 ? today : userData.streakStartDate,
      };
      
      await updateUserData(updatedData);
      
      return { pointsEarned, streakDays: newStreak };
    } catch (error) {
      console.error('Error completing workout:', error);
      throw error;
    }
  };

  const completeOnboarding = async () => {
    try {
      // Award onboarding completion bonus
      await updateUserData({ 
        onboardingCompleted: true,
        points: (userData.points || 0) + 100, // Bonus for completing onboarding
      });
      // Keep AsyncStorage backup for onboarding status
      await AsyncStorage.setItem('@iron_assistant_onboarding_completed', 'true');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  const value: UserDataContextType = {
    userData,
    isLoading,
    updateUserData,
    resetUserData,
    completeOnboarding,
    completeWorkout,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}