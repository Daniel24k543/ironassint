import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

export interface UserMetric {
  id?: number;
  metricType: string;
  value: number;
  unit: string;
  recordedDate: Date;
  source: 'manual' | 'bluetooth_device' | 'smart_scale' | 'fitness_tracker' | 'estimated';
  deviceName?: string;
  metadata?: any;
  isValidated?: boolean;
  notes?: string;
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalMinutes: number;
  totalCaloriesBurned: number;
  totalWeightLifted: number;
  averageWorkoutRating: number;
  currentStreak: number;
  longestStreak: number;
  weeklyAverage: number;
  monthlyProgress: number;
}

export interface ProgressData {
  date: Date;
  workoutsCompleted: number;
  totalWorkoutMinutes: number;
  totalCaloriesBurned: number;
  totalWeightLifted: number;
  currentWorkoutStreak: number;
  averageWorkoutRating: number;
  aiInsights?: string[];
  overallFitnessScore?: number;
  achievementsEarned?: string[];
}

export interface HealthMetrics {
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  restingHeartRate?: number;
  averageHeartRate?: number;
  stepCount?: number;
  sleepHours?: number;
  hydrationGlasses?: number;
}

export interface AIInsight {
  type: 'progress' | 'recommendation' | 'achievement' | 'health' | 'motivation';
  title: string;
  content: string;
  data?: any;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  expiresAt?: Date;
}

class AnalyticsService {
  private apiUrl: string;
  private userId: string | null = null;

  constructor() {
    this.apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  // =============== USER METRICS ===============
  
  async recordMetric(metric: Omit<UserMetric, 'id'>): Promise<boolean> {
    try {
      if (!this.userId) return false;

      // Store locally first (for offline support)
      await this.storeMetricLocally(metric);

      // Sync with server if online
      const response = await fetch(`${this.apiUrl}/analytics/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(metric),
      });

      if (response.ok) {
        await this.markMetricAsSynced(metric);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error recording metric:', error);
      return false;
    }
  }

  async getMetrics(type?: string, startDate?: Date, endDate?: Date): Promise<UserMetric[]> {
    try {
      if (!this.userId) return [];

      let url = `${this.apiUrl}/analytics/metrics`;
      const params = new URLSearchParams();
      
      if (type) params.append('type', type);
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.metrics || [];
      }

      // Fallback to local data
      return await this.getLocalMetrics(type, startDate, endDate);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      return await this.getLocalMetrics(type, startDate, endDate);
    }
  }

  async getLatestMetric(type: string): Promise<UserMetric | null> {
    try {
      const metrics = await this.getMetrics(type);
      return metrics.length > 0 ? metrics[metrics.length - 1] : null;
    } catch (error) {
      console.error('Error fetching latest metric:', error);
      return null;
    }
  }

  // =============== WORKOUT STATISTICS ===============

  async getWorkoutStats(period: 'week' | 'month' | 'year' | 'all' = 'all'): Promise<WorkoutStats> {
    try {
      if (!this.userId) {
        return this.getDefaultStats();
      }

      const response = await fetch(`${this.apiUrl}/analytics/workout-stats?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.stats;
      }

      // Fallback to local calculation
      return await this.calculateLocalWorkoutStats(period);
    } catch (error) {
      console.error('Error fetching workout stats:', error);
      return await this.calculateLocalWorkoutStats(period);
    }
  }

  async getProgressData(startDate: Date, endDate: Date): Promise<ProgressData[]> {
    try {
      if (!this.userId) return [];

      const response = await fetch(`${this.apiUrl}/analytics/progress?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.progress.map((p: any) => ({
          ...p,
          date: new Date(p.date),
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching progress data:', error);
      return [];
    }
  }

  async updateDailyProgress(): Promise<void> {
    try {
      if (!this.userId) return;

      // Calculate today's progress from local data
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const localWorkouts = await this.getLocalWorkouts(today, new Date());
      const progressData: Partial<ProgressData> = {
        date: today,
        workoutsCompleted: localWorkouts.length,
        totalWorkoutMinutes: localWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
        totalCaloriesBurned: localWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
        totalWeightLifted: localWorkouts.reduce((sum, w) => sum + (w.totalWeightLifted || 0), 0),
        averageWorkoutRating: this.calculateAverageRating(localWorkouts),
        currentWorkoutStreak: await this.calculateCurrentStreak(),
      };

      // Send to server
      await fetch(`${this.apiUrl}/analytics/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(progressData),
      });

      // Store locally
      await this.storeProgressLocally(progressData as ProgressData);

    } catch (error) {
      console.error('Error updating daily progress:', error);
    }
  }

  // =============== AI INSIGHTS ===============

  async generateAIInsights(): Promise<AIInsight[]> {
    try {
      if (!this.userId) return [];

      const response = await fetch(`${this.apiUrl}/ai/insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          includeRecommendations: true,
          includeProgress: true,
          includeHealth: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.insights || [];
      }

      // Fallback to local insights generation
      return await this.generateLocalInsights();
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return await this.generateLocalInsights();
    }
  }

  async getHealthMetrics(): Promise<HealthMetrics> {
    try {
      const latestWeight = await this.getLatestMetric('weight');
      const latestBodyFat = await this.getLatestMetric('body_fat');
      const latestMuscleMass = await this.getLatestMetric('muscle_mass');
      const latestRestingHR = await this.getLatestMetric('resting_heart_rate');
      const latestSteps = await this.getLatestMetric('steps');
      const latestSleep = await this.getLatestMetric('sleep_hours');
      const latestHydration = await this.getLatestMetric('hydration');

      return {
        weight: latestWeight?.value,
        bodyFat: latestBodyFat?.value,
        muscleMass: latestMuscleMass?.value,
        restingHeartRate: latestRestingHR?.value,
        stepCount: latestSteps?.value,
        sleepHours: latestSleep?.value,
        hydrationGlasses: latestHydration?.value,
      };
    } catch (error) {
      console.error('Error fetching health metrics:', error);
      return {};
    }
  }

  // =============== ACHIEVEMENTS ===============

  async checkAchievements(): Promise<string[]> {
    try {
      if (!this.userId) return [];

      const response = await fetch(`${this.apiUrl}/analytics/check-achievements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.newAchievements || [];
      }

      return [];
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  async getAchievements(): Promise<any[]> {
    try {
      if (!this.userId) return [];

      const response = await fetch(`${this.apiUrl}/analytics/achievements`, {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.achievements || [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  // =============== DATA SYNCHRONIZATION ===============

  async syncAllData(): Promise<void> {
    try {
      if (!this.userId) return;

      // Sync pending metrics
      await this.syncPendingMetrics();
      
      // Sync workout data
      await this.syncWorkoutData();
      
      // Update progress
      await this.updateDailyProgress();
      
      // Check for new achievements
      await this.checkAchievements();

      console.log('Data synchronization completed');
    } catch (error) {
      console.error('Error during data sync:', error);
    }
  }

  // =============== PRIVATE METHODS ===============

  private async storeMetricLocally(metric: Omit<UserMetric, 'id'>): Promise<void> {
    try {
      const key = `metrics_${this.userId}`;
      const existing = await AsyncStorage.getItem(key);
      const metrics = existing ? JSON.parse(existing) : [];
      
      metrics.push({
        ...metric,
        id: Date.now(), // Temporary ID
        syncedToServer: false,
      });

      await AsyncStorage.setItem(key, JSON.stringify(metrics));
    } catch (error) {
      console.error('Error storing metric locally:', error);
    }
  }

  private async markMetricAsSynced(metric: Omit<UserMetric, 'id'>): Promise<void> {
    try {
      const key = `metrics_${this.userId}`;
      const existing = await AsyncStorage.getItem(key);
      if (!existing) return;

      const metrics = JSON.parse(existing);
      const updated = metrics.map((m: any) => 
        m.metricType === metric.metricType && 
        new Date(m.recordedDate).getTime() === metric.recordedDate.getTime()
          ? { ...m, syncedToServer: true }
          : m
      );

      await AsyncStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.error('Error marking metric as synced:', error);
    }
  }

  private async getLocalMetrics(type?: string, startDate?: Date, endDate?: Date): Promise<UserMetric[]> {
    try {
      const key = `metrics_${this.userId}`;
      const existing = await AsyncStorage.getItem(key);
      if (!existing) return [];

      let metrics = JSON.parse(existing);

      // Filter by type
      if (type) {
        metrics = metrics.filter((m: any) => m.metricType === type);
      }

      // Filter by date range
      if (startDate || endDate) {
        metrics = metrics.filter((m: any) => {
          const date = new Date(m.recordedDate);
          return (!startDate || date >= startDate) && (!endDate || date <= endDate);
        });
      }

      return metrics.map((m: any) => ({
        ...m,
        recordedDate: new Date(m.recordedDate),
      }));
    } catch (error) {
      console.error('Error getting local metrics:', error);
      return [];
    }
  }

  private async syncPendingMetrics(): Promise<void> {
    try {
      const key = `metrics_${this.userId}`;
      const existing = await AsyncStorage.getItem(key);
      if (!existing) return;

      const metrics = JSON.parse(existing);
      const pendingMetrics = metrics.filter((m: any) => !m.syncedToServer);

      for (const metric of pendingMetrics) {
        await this.recordMetric(metric);
      }
    } catch (error) {
      console.error('Error syncing pending metrics:', error);
    }
  }

  private async calculateLocalWorkoutStats(period: string): Promise<WorkoutStats> {
    try {
      const workouts = await this.getLocalWorkouts();
      
      // Filter by period
      let filteredWorkouts = workouts;
      const now = new Date();
      
      switch (period) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filteredWorkouts = workouts.filter(w => new Date(w.date) >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          filteredWorkouts = workouts.filter(w => new Date(w.date) >= monthAgo);
          break;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          filteredWorkouts = workouts.filter(w => new Date(w.date) >= yearAgo);
          break;
      }

      return {
        totalWorkouts: filteredWorkouts.length,
        totalMinutes: filteredWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
        totalCaloriesBurned: filteredWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
        totalWeightLifted: filteredWorkouts.reduce((sum, w) => sum + (w.totalWeightLifted || 0), 0),
        averageWorkoutRating: this.calculateAverageRating(filteredWorkouts),
        currentStreak: await this.calculateCurrentStreak(),
        longestStreak: await this.calculateLongestStreak(),
        weeklyAverage: this.calculateWeeklyAverage(workouts),
        monthlyProgress: this.calculateMonthlyProgress(workouts),
      };
    } catch (error) {
      console.error('Error calculating local workout stats:', error);
      return this.getDefaultStats();
    }
  }

  private async getLocalWorkouts(startDate?: Date, endDate?: Date): Promise<any[]> {
    try {
      const key = `workouts_${this.userId}`;
      const existing = await AsyncStorage.getItem(key);
      if (!existing) return [];

      let workouts = JSON.parse(existing);

      if (startDate || endDate) {
        workouts = workouts.filter((w: any) => {
          const date = new Date(w.date);
          return (!startDate || date >= startDate) && (!endDate || date <= endDate);
        });
      }

      return workouts;
    } catch (error) {
      console.error('Error getting local workouts:', error);
      return [];
    }
  }

  private calculateAverageRating(workouts: any[]): number {
    const ratedWorkouts = workouts.filter(w => w.rating);
    if (ratedWorkouts.length === 0) return 0;
    return ratedWorkouts.reduce((sum, w) => sum + w.rating, 0) / ratedWorkouts.length;
  }

  private async calculateCurrentStreak(): Promise<number> {
    try {
      const workouts = await this.getLocalWorkouts();
      workouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < workouts.length; i++) {
        const workoutDate = new Date(workouts[i].date);
        workoutDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streak) {
          streak++;
        } else if (daysDiff > streak) {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating current streak:', error);
      return 0;
    }
  }

  private async calculateLongestStreak(): Promise<number> {
    try {
      const workouts = await this.getLocalWorkouts();
      // Implementation for longest streak calculation
      return 0; // Placeholder
    } catch (error) {
      return 0;
    }
  }

  private calculateWeeklyAverage(workouts: any[]): number {
    // Implementation for weekly average calculation
    return 0; // Placeholder
  }

  private calculateMonthlyProgress(workouts: any[]): number {
    // Implementation for monthly progress calculation
    return 0; // Placeholder
  }

  private async generateLocalInsights(): Promise<AIInsight[]> {
    try {
      const stats = await this.getWorkoutStats('week');
      const healthMetrics = await this.getHealthMetrics();
      const insights: AIInsight[] = [];

      // Generate basic insights based on local data
      if (stats.currentStreak > 7) {
        insights.push({
          type: 'achievement',
          title: '🔥 ¡Racha increíble!',
          content: `Has entrenado ${stats.currentStreak} días seguidos. ¡Sigue así!`,
          priority: 'high',
          actionable: false,
        });
      }

      if (stats.totalWorkouts > 0 && stats.averageWorkoutRating < 3) {
        insights.push({
          type: 'recommendation',
          title: '💡 Mejora tu experiencia',
          content: 'Parece que tus entrenamientos no te están gustando mucho. ¿Te gustaría probar algo diferente?',
          priority: 'medium',
          actionable: true,
        });
      }

      return insights;
    } catch (error) {
      console.error('Error generating local insights:', error);
      return [];
    }
  }

  private getDefaultStats(): WorkoutStats {
    return {
      totalWorkouts: 0,
      totalMinutes: 0,
      totalCaloriesBurned: 0,
      totalWeightLifted: 0,
      averageWorkoutRating: 0,
      currentStreak: 0,
      longestStreak: 0,
      weeklyAverage: 0,
      monthlyProgress: 0,
    };
  }

  private async storeProgressLocally(progress: ProgressData): Promise<void> {
    try {
      const key = `progress_${this.userId}`;
      const existing = await AsyncStorage.getItem(key);
      const progressArray = existing ? JSON.parse(existing) : [];
      
      // Update or add progress for the date
      const existingIndex = progressArray.findIndex((p: any) => 
        new Date(p.date).toDateString() === progress.date.toDateString()
      );

      if (existingIndex >= 0) {
        progressArray[existingIndex] = progress;
      } else {
        progressArray.push(progress);
      }

      await AsyncStorage.setItem(key, JSON.stringify(progressArray));
    } catch (error) {
      console.error('Error storing progress locally:', error);
    }
  }

  private async syncWorkoutData(): Promise<void> {
    try {
      // Implementation for syncing workout data
      // This would sync local workout data with the server
    } catch (error) {
      console.error('Error syncing workout data:', error);
    }
  }
}

export const analyticsService = new AnalyticsService();