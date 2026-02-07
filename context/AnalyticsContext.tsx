import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { analyticsService, WorkoutStats, ProgressData, HealthMetrics, AIInsight, UserMetric } from '../services/AnalyticsService';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AnalyticsContextType {
  // Stats and metrics
  workoutStats: WorkoutStats;
  progressData: ProgressData[];
  healthMetrics: HealthMetrics;
  aiInsights: AIInsight[];
  isLoading: boolean;
  
  // Data management
  recordMetric: (metric: Omit<UserMetric, 'id'>) => Promise<boolean>;
  updateDailyProgress: () => Promise<void>;
  refreshData: () => Promise<void>;
  syncData: () => Promise<void>;
  
  // Insights and recommendations
  generateInsights: () => Promise<void>;
  getProgressForPeriod: (startDate: Date, endDate: Date) => Promise<ProgressData[]>;
  getWorkoutStatsForPeriod: (period: 'week' | 'month' | 'year' | 'all') => Promise<WorkoutStats>;
  
  // Achievement system
  achievements: any[];
  checkAchievements: () => Promise<string[]>;
  
  // Metrics by type
  getMetricHistory: (type: string, days?: number) => Promise<UserMetric[]>;
  getLatestMetric: (type: string) => Promise<UserMetric | null>;
  
  // Health tracking
  recordWeight: (weight: number, notes?: string) => Promise<boolean>;
  recordBodyFat: (bodyFat: number, notes?: string) => Promise<boolean>;
  recordRestingHeartRate: (heartRate: number) => Promise<boolean>;
  recordSteps: (steps: number) => Promise<boolean>;
  recordSleep: (hours: number, quality?: number) => Promise<boolean>;
  recordHydration: (glasses: number) => Promise<boolean>;
  
  // Insights management
  dismissInsight: (insightIndex: number) => void;
  markInsightAsActioned: (insightIndex: number) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats>({
    totalWorkouts: 0,
    totalMinutes: 0,
    totalCaloriesBurned: 0,
    totalWeightLifted: 0,
    averageWorkoutRating: 0,
    currentStreak: 0,
    longestStreak: 0,
    weeklyAverage: 0,
    monthlyProgress: 0,
  });
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({});
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize analytics service when user changes
  useEffect(() => {
    if (user?.uid) {
      analyticsService.setUserId(user.uid);
      loadInitialData();
    } else {
      // Reset data when user logs out
      resetAnalyticsData();
    }
  }, [user?.uid]);

  // Auto-sync data periodically
  useEffect(() => {
    if (!user?.uid) return;

    const interval = setInterval(() => {
      syncData();
    }, 5 * 60 * 1000); // Sync every 5 minutes

    return () => clearInterval(interval);
  }, [user?.uid]);

  const loadInitialData = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      await Promise.all([
        loadWorkoutStats(),
        loadProgressData(),
        loadHealthMetrics(),
        loadAchievements(),
        loadAIInsights(),
      ]);
    } catch (error) {
      console.error('Error loading initial analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkoutStats = async () => {
    try {
      const stats = await analyticsService.getWorkoutStats();
      setWorkoutStats(stats);
    } catch (error) {
      console.error('Error loading workout stats:', error);
    }
  };

  const loadProgressData = async () => {
    try {
      // Load last 30 days of progress
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      const progress = await analyticsService.getProgressData(startDate, endDate);
      setProgressData(progress);
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const loadHealthMetrics = async () => {
    try {
      const metrics = await analyticsService.getHealthMetrics();
      setHealthMetrics(metrics);
    } catch (error) {
      console.error('Error loading health metrics:', error);
    }
  };

  const loadAchievements = async () => {
    try {
      const userAchievements = await analyticsService.getAchievements();
      setAchievements(userAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const loadAIInsights = async () => {
    try {
      // Load cached insights first
      const cachedInsights = await AsyncStorage.getItem(`ai_insights_${user?.uid}`);
      if (cachedInsights) {
        const insights = JSON.parse(cachedInsights);
        // Filter out expired insights
        const validInsights = insights.filter((insight: AIInsight) => 
          !insight.expiresAt || new Date(insight.expiresAt) > new Date()
        );
        setAiInsights(validInsights);
      }

      // Generate fresh insights
      await generateInsights();
    } catch (error) {
      console.error('Error loading AI insights:', error);
    }
  };

  const recordMetric = async (metric: Omit<UserMetric, 'id'>): Promise<boolean> => {
    try {
      const success = await analyticsService.recordMetric(metric);
      
      if (success) {
        // Update relevant state based on metric type
        if (['weight', 'body_fat', 'muscle_mass', 'resting_heart_rate', 'steps', 'sleep_hours', 'hydration'].includes(metric.metricType)) {
          await loadHealthMetrics();
        }
        
        // Update daily progress
        await updateDailyProgress();
        
        // Check for achievements
        await checkAchievements();
      }
      
      return success;
    } catch (error) {
      console.error('Error recording metric:', error);
      return false;
    }
  };

  const updateDailyProgress = async (): Promise<void> => {
    try {
      await analyticsService.updateDailyProgress();
      await loadProgressData();
      await loadWorkoutStats();
    } catch (error) {
      console.error('Error updating daily progress:', error);
    }
  };

  const refreshData = async (): Promise<void> => {
    await loadInitialData();
  };

  const syncData = async (): Promise<void> => {
    try {
      if (!user?.uid) return;
      
      await analyticsService.syncAllData();
      
      // Refresh local data after sync
      await Promise.all([
        loadWorkoutStats(),
        loadProgressData(),
        loadHealthMetrics(),
        loadAchievements(),
      ]);
    } catch (error) {
      console.error('Error syncing data:', error);
    }
  };

  const generateInsights = async (): Promise<void> => {
    try {
      const insights = await analyticsService.generateAIInsights();
      setAiInsights(insights);
      
      // Cache insights
      await AsyncStorage.setItem(`ai_insights_${user?.uid}`, JSON.stringify(insights));
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  const getProgressForPeriod = async (startDate: Date, endDate: Date): Promise<ProgressData[]> => {
    try {
      return await analyticsService.getProgressData(startDate, endDate);
    } catch (error) {
      console.error('Error getting progress for period:', error);
      return [];
    }
  };

  const getWorkoutStatsForPeriod = async (period: 'week' | 'month' | 'year' | 'all'): Promise<WorkoutStats> => {
    try {
      return await analyticsService.getWorkoutStats(period);
    } catch (error) {
      console.error('Error getting workout stats for period:', error);
      return workoutStats;
    }
  };

  const checkAchievements = async (): Promise<string[]> => {
    try {
      const newAchievements = await analyticsService.checkAchievements();
      
      if (newAchievements.length > 0) {
        // Refresh achievements list
        await loadAchievements();
        
        // Generate insights about new achievements
        await generateInsights();
      }
      
      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  };

  const getMetricHistory = async (type: string, days: number = 30): Promise<UserMetric[]> => {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
      return await analyticsService.getMetrics(type, startDate, endDate);
    } catch (error) {
      console.error('Error getting metric history:', error);
      return [];
    }
  };

  const getLatestMetric = async (type: string): Promise<UserMetric | null> => {
    try {
      return await analyticsService.getLatestMetric(type);
    } catch (error) {
      console.error('Error getting latest metric:', error);
      return null;
    }
  };

  // Convenience methods for common health metrics
  const recordWeight = async (weight: number, notes?: string): Promise<boolean> => {
    return recordMetric({
      metricType: 'weight',
      value: weight,
      unit: 'kg',
      recordedDate: new Date(),
      source: 'manual',
      notes,
    });
  };

  const recordBodyFat = async (bodyFat: number, notes?: string): Promise<boolean> => {
    return recordMetric({
      metricType: 'body_fat',
      value: bodyFat,
      unit: '%',
      recordedDate: new Date(),
      source: 'manual',
      notes,
    });
  };

  const recordRestingHeartRate = async (heartRate: number): Promise<boolean> => {
    return recordMetric({
      metricType: 'resting_heart_rate',
      value: heartRate,
      unit: 'bpm',
      recordedDate: new Date(),
      source: 'manual',
    });
  };

  const recordSteps = async (steps: number): Promise<boolean> => {
    return recordMetric({
      metricType: 'steps',
      value: steps,
      unit: 'steps',
      recordedDate: new Date(),
      source: 'fitness_tracker',
    });
  };

  const recordSleep = async (hours: number, quality?: number): Promise<boolean> => {
    return recordMetric({
      metricType: 'sleep_hours',
      value: hours,
      unit: 'hours',
      recordedDate: new Date(),
      source: 'manual',
      metadata: quality ? { quality } : undefined,
    });
  };

  const recordHydration = async (glasses: number): Promise<boolean> => {
    return recordMetric({
      metricType: 'hydration',
      value: glasses,
      unit: 'glasses',
      recordedDate: new Date(),
      source: 'manual',
    });
  };

  const dismissInsight = (insightIndex: number) => {
    setAiInsights(prev => prev.filter((_, index) => index !== insightIndex));
  };

  const markInsightAsActioned = (insightIndex: number) => {
    setAiInsights(prev => 
      prev.map((insight, index) => 
        index === insightIndex 
          ? { ...insight, actionable: false }
          : insight
      )
    );
  };

  const resetAnalyticsData = () => {
    setWorkoutStats({
      totalWorkouts: 0,
      totalMinutes: 0,
      totalCaloriesBurned: 0,
      totalWeightLifted: 0,
      averageWorkoutRating: 0,
      currentStreak: 0,
      longestStreak: 0,
      weeklyAverage: 0,
      monthlyProgress: 0,
    });
    setProgressData([]);
    setHealthMetrics({});
    setAiInsights([]);
    setAchievements([]);
    setIsLoading(false);
  };

  const value: AnalyticsContextType = {
    workoutStats,
    progressData,
    healthMetrics,
    aiInsights,
    isLoading,
    recordMetric,
    updateDailyProgress,
    refreshData,
    syncData,
    generateInsights,
    getProgressForPeriod,
    getWorkoutStatsForPeriod,
    achievements,
    checkAchievements,
    getMetricHistory,
    getLatestMetric,
    recordWeight,
    recordBodyFat,
    recordRestingHeartRate,
    recordSteps,
    recordSleep,
    recordHydration,
    dismissInsight,
    markInsightAsActioned,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};