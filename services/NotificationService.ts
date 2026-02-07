import { advancedNotificationService } from './AdvancedNotificationService';

// Legacy compatibility layer - redirect to advanced service
export const notificationService = {
  async initialize() {
    return await advancedNotificationService.initialize();
  },

  async scheduleWorkoutReminder(workoutTime: 'morning' | 'afternoon' | 'evening', userData?: any) {
    if (userData?.userId) {
      // Use the new intelligent scheduling
      await advancedNotificationService.scheduleIntelligentReminders(userData.userId, userData);
    } else {
      // Fallback to simple scheduling (for backward compatibility)
      console.log('Using legacy notification scheduling');
    }
  },

  async scheduleStreakReminder() {
    // This will be handled by the smart workout reminders in the advanced service
    console.log('Streak reminders are now handled by intelligent scheduling');
  },

  async scheduleCelebration(achievement: string, userData?: any) {
    if (userData?.userId) {
      await advancedNotificationService.sendAchievementNotification(userData.userId, {
        name: achievement,
        points: 100,
      });
    }
  },

  // Add other legacy methods as needed...
  async cancelNotificationsByTag(tag: string) {
    console.log('Legacy method - use advancedNotificationService.cancelUserNotifications instead');
  },

  async cancelAllNotifications() {
    console.log('Legacy method - use advancedNotificationService.cancelUserNotifications instead');
  },
};

// Export the advanced service for new features
export { advancedNotificationService };

  async scheduleWorkoutReminder(workoutTime: 'morning' | 'afternoon' | 'evening') {
    await this.cancelNotificationsByTag('workout_reminder');

    const timeMap = {
      morning: { hour: 8, minute: 0 },
      afternoon: { hour: 15, minute: 0 },
      evening: { hour: 19, minute: 0 },
    };

    const time = timeMap[workoutTime];

    const reminderMessages = [
      '💪 ¡Es hora de entrenar! Tu cuerpo te lo agradecerá',
      '🔥 ¡No rompas tu racha! El entrenamiento de hoy te espera',
      '⚡ ¡Momento de ser imparable! Tu sesión de hoy está lista',
      '🏆 ¡Campeón! Es tiempo de demostrar de qué estás hecho',
      '🚀 ¡Vamos! Tu yo futuro te lo agradecerá',
    ];

    const randomMessage = reminderMessages[Math.floor(Math.random() * reminderMessages.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Iron Assistant 🤖',
        body: randomMessage,
        data: { type: 'workout_reminder' },
      },
      trigger: {
        hour: time.hour,
        minute: time.minute,
        repeats: true,
      },
      identifier: 'workout_reminder',
    });
  }

  async scheduleStreakReminder() {
    await this.cancelNotificationsByTag('streak_reminder');

    const streakMessages = [
      '🔥 ¡Tu racha está en riesgo! No la pierdas ahora',
      '⚠️ ¡Faltan pocas horas! Mantén viva tu racha',
      '💎 Tu racha es valiosa, ¡no la dejes escapar!',
      '🚨 ¡Última oportunidad! Salva tu racha hoy',
    ];

    const randomMessage = streakMessages[Math.floor(Math.random() * streakMessages.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Iron Assistant 🔥',
        body: randomMessage,
        data: { type: 'streak_reminder' },
      },
      trigger: {
        hour: 21,
        minute: 0,
        repeats: true,
      },
      identifier: 'streak_reminder',
    });
  }

  async scheduleCelebration(achievement: string) {
    const celebrationMessages = {
      streak_7: '🎉 ¡7 días consecutivos! ¡Eres increíble!',
      streak_30: '🏆 ¡30 días! ¡Eres una leyenda del fitness!',
      workout_10: '💪 ¡10 entrenamientos completados! ¡Imparable!',
      workout_50: '⭐ ¡50 entrenamientos! ¡Eres una máquina!',
    };

    const message = celebrationMessages[achievement] || '🎉 ¡Nuevo logro desbloqueado!';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎊 ¡LOGRO DESBLOQUEADO! 🎊',
        body: message,
        data: { type: 'achievement', achievement },
      },
      trigger: null, // Send immediately
    });
  }

  async scheduleMotivationalQuote() {
    await this.cancelNotificationsByTag('daily_motivation');

    const quotes = [
      '💡 "La disciplina es elegir entre lo que quieres ahora y lo que quieres más"',
      '🌟 "No se trata de ser perfecto, se trata de ser mejor que ayer"',
      '💫 "Tu único límite eres tú mismo"',
      '⚡ "El dolor es temporal, el orgullo es para siempre"',
      '🔥 "Cada entrenamiento cuenta, cada día importa"',
      '💪 "La fuerza no viene del físico, viene de la voluntad"',
      '🎯 "Los objetivos se logran con constancia, no con perfección"',
      '🌈 "Hoy es una nueva oportunidad para ser mejor"',
    ];

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Motivación Diaria 💭',
        body: randomQuote,
        data: { type: 'daily_motivation' },
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
      identifier: 'daily_motivation',
    });
  }

  async scheduleWeeklyRecap(stats: { workouts: number; streak: number }) {
    const { workouts, streak } = stats;
    
    let message = '';
    if (workouts === 0) {
      message = '🤔 Esta semana no entrenaste. ¡La próxima puede ser tu semana!';
    } else if (workouts < 3) {
      message = `💪 ${workouts} entrenamientos esta semana. ¡Puedes dar más la próxima!`;
    } else if (workouts < 5) {
      message = `🔥 ¡${workouts} entrenamientos! Buen ritmo, mantente así`;
    } else {
      message = `🏆 ¡${workouts} entrenamientos! ¡Semana perfecta!`;
    }

    if (streak > 7) {
      message += ` | Racha de ${streak} días 🔥`;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Resumen Semanal 📊',
        body: message,
        data: { type: 'weekly_recap', workouts, streak },
      },
      trigger: {
        weekday: 1, // Monday
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
  }

  async cancelNotificationsByTag(tag: string) {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const toCancel = scheduledNotifications
      .filter(notification => notification.identifier === tag)
      .map(notification => notification.identifier);

    if (toCancel.length > 0) {
      await Notifications.cancelScheduledNotificationsAsync(toCancel);
    }
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Handle notification received while app is running
  addNotificationReceivedListener(listener: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  // Handle notification tapped
  addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }
}

export const notificationService = new NotificationService();