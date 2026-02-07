import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export interface PushNotificationData {
  userId: string;
  type: 'workout_reminder' | 'streak_alert' | 'achievement' | 'motivation' | 'social' | 'premium';
  title: string;
  body: string;
  data?: any;
  scheduledFor?: Date;
  priority?: 'default' | 'high' | 'max';
  sound?: string;
  vibrate?: boolean;
  category?: string;
}

export interface NotificationTemplate {
  id: string;
  type: string;
  title: string;
  body: string;
  trigger: 'time' | 'event' | 'location' | 'immediate';
  conditions?: any;
  personalizable: boolean;
}

export interface UserNotificationProfile {
  userId: string;
  pushToken: string;
  preferences: {
    workoutReminders: boolean;
    streakAlerts: boolean;
    achievements: boolean;
    social: boolean;
    premium: boolean;
    quietHours: { start: string; end: string };
    frequency: 'low' | 'medium' | 'high';
  };
  timezone: string;
  bestWorkoutTimes: string[];
  personalData: {
    name: string;
    streakDays: number;
    level: number;
    preferredExercises: string[];
  };
}

// Advanced notification templates
const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'streak_danger',
    type: 'streak_alert',
    title: '🔥 ¡Tu racha está en peligro!',
    body: 'Llevas {streakDays} días consecutivos. ¡No la pierdas ahora, entrenar solo te tomará 15 minutos!',
    trigger: 'time',
    personalizable: true,
  },
  {
    id: 'achievement_unlock',
    type: 'achievement',
    title: '🏆 ¡Nuevo logro desbloqueado!',
    body: 'Has logrado "{achievementName}". ¡Ganaste {points} puntos!',
    trigger: 'event',
    personalizable: true,
  },
  {
    id: 'weekly_summary',
    type: 'motivation',
    title: '📊 Tu semana en números',
    body: 'Esta semana: {workouts} entrenamientos, {calories} calorías quemadas, racha de {streak} días',
    trigger: 'time',
    personalizable: true,
  },
  {
    id: 'friend_challenge',
    type: 'social',
    title: '💪 Desafío de amigo',
    body: '{friendName} te ha retado a superar {challengeGoal}. ¿Aceptas el desafío?',
    trigger: 'event',
    personalizable: true,
  },
  {
    id: 'premium_features',
    type: 'premium',
    title: '👑 Características Premium disponibles',
    body: 'Desbloquea {featureName} y lleva tu entrenamiento al siguiente nivel',
    trigger: 'time',
    personalizable: true,
  },
  {
    id: 'perfect_time',
    type: 'workout_reminder',
    title: '⏰ Es tu momento perfecto',
    body: 'Basado en tu historial, este es tu mejor momento para entrenar. ¡Tu cuerpo está listo!',
    trigger: 'time',
    personalizable: true,
  },
  {
    id: 'mood_based',
    type: 'motivation',
    title: 'Ejercicio para tu estado de ánimo',
    body: 'Detectamos que podrías necesitar un impulso. Un entrenamiento de 20 min puede mejorar tu día un 73%',
    trigger: 'event',
    personalizable: true,
  },
];

class AdvancedNotificationService {
  private userProfiles: Map<string, UserNotificationProfile> = new Map();
  private isInitialized = false;
  
  async initialize(): Promise<string | null> {
    try {
      // Configure notification handling
      Notifications.setNotificationHandler({
        handleNotification: async (notification) => {
          // Smart notification filtering
          const shouldShow = await this.shouldShowNotification(notification);
          
          return {
            shouldShowAlert: shouldShow,
            shouldPlaySound: shouldShow,
            shouldSetBadge: false,
          };
        },
      });

      // Set up notification categories for actions
      await this.setupNotificationCategories();

      // Get push token
      const pushToken = await this.registerForPushNotificationsAsync();
      
      if (pushToken) {
        this.isInitialized = true;
        console.log('Advanced notifications initialized with token:', pushToken);
      }
      
      return pushToken;
    } catch (error) {
      console.error('Failed to initialize advanced notifications:', error);
      return null;
    }
  }

  private async setupNotificationCategories() {
    await Notifications.setNotificationCategoryAsync('workout_reminder', [
      { identifier: 'start_workout', title: 'Comenzar ahora', options: { opensAppToForeground: true } },
      { identifier: 'snooze_15', title: 'Recordar en 15 min', options: { opensAppToForeground: false } },
      { identifier: 'skip_today', title: 'Omitir hoy', options: { opensAppToForeground: false } },
    ]);

    await Notifications.setNotificationCategoryAsync('streak_alert', [
      { identifier: 'quick_workout', title: 'Entrenamiento rápido', options: { opensAppToForeground: true } },
      { identifier: 'view_progress', title: 'Ver progreso', options: { opensAppToForeground: true } },
    ]);

    await Notifications.setNotificationCategoryAsync('achievement', [
      { identifier: 'share_achievement', title: 'Compartir', options: { opensAppToForeground: true } },
      { identifier: 'view_rewards', title: 'Ver recompensas', options: { opensAppToForeground: true } },
    ]);
  }

  private async registerForPushNotificationsAsync(): Promise<string | null> {
    let token: string | null = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('workout', {
        name: 'Entrenamientos',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
      });

      await Notifications.setNotificationChannelAsync('achievements', {
        name: 'Logros',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500, 200, 500],
        lightColor: '#FFD700',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('social', {
        name: 'Social',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4ECDC4',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        alert('¡Permitir notificaciones para recibir recordatorios personalizados!');
        return null;
      }
      
      try {
        const expoPushToken = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });
        token = expoPushToken.data;
      } catch (error) {
        console.error('Error getting push token:', error);
        return null;
      }
    } else {
      alert('Las notificaciones push requieren un dispositivo físico');
    }

    return token;
  }

  async createUserProfile(userData: Partial<UserNotificationProfile>): Promise<void> {
    if (!userData.userId || !userData.pushToken) {
      throw new Error('userId and pushToken are required');
    }

    const profile: UserNotificationProfile = {
      userId: userData.userId,
      pushToken: userData.pushToken,
      preferences: {
        workoutReminders: true,
        streakAlerts: true,
        achievements: true,
        social: true,
        premium: false,
        quietHours: { start: '22:00', end: '07:00' },
        frequency: 'medium',
        ...userData.preferences,
      },
      timezone: userData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      bestWorkoutTimes: userData.bestWorkoutTimes || ['08:00', '18:00'],
      personalData: {
        name: 'Usuario',
        streakDays: 0,
        level: 1,
        preferredExercises: [],
        ...userData.personalData,
      },
    };

    this.userProfiles.set(userData.userId, profile);
  }

  private personalizeNotification(template: NotificationTemplate, userData: any): PushNotificationData {
    let title = template.title;
    let body = template.body;

    // Replace placeholders with actual data
    const replacements = {
      '{name}': userData.name || 'Atleta',
      '{streakDays}': userData.streakDays?.toString() || '0',
      '{level}': userData.level?.toString() || '1',
      '{achievementName}': userData.lastAchievement || 'Logro especial',
      '{points}': userData.pointsEarned?.toString() || '100',
      '{workouts}': userData.weeklyWorkouts?.toString() || '0',
      '{calories}': userData.weeklyCalories?.toString() || '0',
      '{streak}': userData.currentStreak?.toString() || '0',
      '{friendName}': userData.challengingFriend || 'Tu amigo',
      '{challengeGoal}': userData.challengeGoal || 'tu récord personal',
      '{featureName}': userData.suggestedFeature || 'características exclusivas',
    };

    Object.entries(replacements).forEach(([placeholder, value]) => {
      title = title.replace(placeholder, value);
      body = body.replace(placeholder, value);
    });

    return {
      userId: userData.userId,
      type: template.type as any,
      title,
      body,
      priority: template.type === 'streak_alert' ? 'high' : 'default',
      category: template.type,
      data: { templateId: template.id },
    };
  }

  async sendSmartWorkoutReminder(userId: string, userData: any): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (!profile || !profile.preferences.workoutReminders) return;

    // Check if it's quiet hours
    if (this.isQuietHours(profile)) return;

    // Determine best template based on user context
    let templateId = 'perfect_time';
    
    if (userData.streakDays > 7 && userData.lastWorkoutDaysAgo > 0) {
      templateId = 'streak_danger';
    } else if (userData.mood && userData.mood === 'low') {
      templateId = 'mood_based';
    }

    const template = NOTIFICATION_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const notification = this.personalizeNotification(template, userData);
    
    await this.sendNotification(profile.pushToken, {
      ...notification,
      sound: 'default',
      vibrate: true,
    });
  }

  async sendAchievementNotification(userId: string, achievement: any): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (!profile || !profile.preferences.achievements) return;

    const template = NOTIFICATION_TEMPLATES.find(t => t.id === 'achievement_unlock');
    if (!template) return;

    const notification = this.personalizeNotification(template, {
      userId,
      achievementName: achievement.name,
      pointsEarned: achievement.points,
    });

    await this.sendNotification(profile.pushToken, {
      ...notification,
      priority: 'high',
      sound: 'achievement_sound',
    });
  }

  async sendWeeklySummary(userId: string, weeklyStats: any): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    const template = NOTIFICATION_TEMPLATES.find(t => t.id === 'weekly_summary');
    if (!template) return;

    const notification = this.personalizeNotification(template, {
      userId,
      weeklyWorkouts: weeklyStats.workouts,
      weeklyCalories: weeklyStats.calories,
      currentStreak: weeklyStats.streak,
    });

    await this.sendNotification(profile.pushToken, notification);
  }

  async sendSocialNotification(userId: string, socialData: any): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (!profile || !profile.preferences.social) return;

    const template = NOTIFICATION_TEMPLATES.find(t => t.id === 'friend_challenge');
    if (!template) return;

    const notification = this.personalizeNotification(template, socialData);
    
    await this.sendNotification(profile.pushToken, notification);
  }

  private async sendNotification(pushToken: string, notification: PushNotificationData): Promise<void> {
    try {
      const message = {
        to: pushToken,
        sound: notification.sound || 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        priority: notification.priority || 'default',
        channelId: this.getChannelForType(notification.type),
        categoryId: notification.category,
      };

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      console.log('Advanced notification sent:', notification.title);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  private getChannelForType(type: string): string {
    switch (type) {
      case 'workout_reminder':
      case 'streak_alert':
        return 'workout';
      case 'achievement':
        return 'achievements';
      case 'social':
        return 'social';
      default:
        return 'default';
    }
  }

  private isQuietHours(profile: UserNotificationProfile): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    const quietStart = this.parseTime(profile.preferences.quietHours.start);
    const quietEnd = this.parseTime(profile.preferences.quietHours.end);
    
    if (quietStart > quietEnd) {
      // Quiet hours span midnight
      return currentTime >= quietStart || currentTime <= quietEnd;
    } else {
      return currentTime >= quietStart && currentTime <= quietEnd;
    }
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 100 + minutes;
  }

  private async shouldShowNotification(notification: Notifications.Notification): Promise<boolean> {
    // Implement smart filtering logic
    const userId = notification.request.content.data?.userId;
    const profile = userId ? this.userProfiles.get(userId) : null;
    
    if (!profile) return true; // Show if no profile
    
    // Check quiet hours
    if (this.isQuietHours(profile)) return false;
    
    // Check frequency preference
    if (profile.preferences.frequency === 'low') {
      const lastNotification = await this.getLastNotificationTime(userId);
      const hoursSinceLastNotification = (Date.now() - lastNotification) / (1000 * 60 * 60);
      return hoursSinceLastNotification >= 6; // Max 4 notifications per day
    }
    
    return true;
  }

  private async getLastNotificationTime(userId: string): Promise<number> {
    // In a real app, you'd store this in AsyncStorage or your database
    return Date.now() - (2 * 60 * 60 * 1000); // Mock: 2 hours ago
  }

  // Schedule intelligent workout reminders
  async scheduleIntelligentReminders(userId: string, userData: any): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    // Cancel existing reminders
    await this.cancelUserNotifications(userId);

    // Schedule based on user's best workout times
    for (const timeStr of profile.bestWorkoutTimes) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💪 Momento de entrenar',
          body: `${userData.name}, es tu horario optimizado para entrenar. ¡Tu cuerpo está preparado!`,
          data: { userId, type: 'workout_reminder' },
          categoryId: 'workout_reminder',
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
        identifier: `workout_${userId}_${timeStr}`,
      });
    }
  }

  async cancelUserNotifications(userId: string): Promise<void> {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const userNotificationIds = scheduledNotifications
      .filter(notification => 
        notification.content.data?.userId === userId ||
        notification.identifier.includes(userId)
      )
      .map(notification => notification.identifier);

    if (userNotificationIds.length > 0) {
      await Notifications.cancelScheduledNotificationsAsync(userNotificationIds);
    }
  }

  updateUserPreferences(userId: string, preferences: Partial<UserNotificationProfile['preferences']>): void {
    const profile = this.userProfiles.get(userId);
    if (profile) {
      profile.preferences = { ...profile.preferences, ...preferences };
      this.userProfiles.set(userId, profile);
    }
  }

  getUserProfile(userId: string): UserNotificationProfile | undefined {
    return this.userProfiles.get(userId);
  }
}

export const advancedNotificationService = new AdvancedNotificationService();