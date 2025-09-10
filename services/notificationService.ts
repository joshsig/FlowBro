import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { addDays, format, isAfter, isBefore } from 'date-fns';
import { NotificationData, PartnerNotificationSettings } from '../types/period';
import { StorageService } from './storage';
import { PeriodTrackingService } from './periodTracking';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return false;
    }
    
    return true;
  }

  static async schedulePartnerNotifications(): Promise<void> {
    const settings = await StorageService.getAppSettings();
    if (!settings?.partnerNotifications.enabled) return;

    const partnerSettings = settings.partnerNotifications;
    const nextPeriod = await PeriodTrackingService.getNextPeriodDate();
    const ovulationDate = await PeriodTrackingService.getOvulationDate();
    const pmsStartDate = await PeriodTrackingService.getPMSStartDate();

    if (!nextPeriod) return;

    // Clear existing notifications
    await this.clearAllNotifications();

    // Schedule period start notifications
    if (partnerSettings.notificationTypes.periodStart) {
      for (const daysBefore of partnerSettings.reminderDays) {
        const notificationDate = addDays(nextPeriod, -daysBefore);
        if (isAfter(notificationDate, new Date())) {
          await this.scheduleNotification({
            type: 'period_start',
            title: `Period Reminder - ${daysBefore} day${daysBefore > 1 ? 's' : ''} to go`,
            message: partnerSettings.customMessages.periodStart || this.getDefaultPeriodStartMessage(daysBefore),
            scheduledDate: notificationDate,
          });
        }
      }
    }

    // Schedule ovulation notification
    if (partnerSettings.notificationTypes.ovulation && ovulationDate && isAfter(ovulationDate, new Date())) {
      await this.scheduleNotification({
        type: 'ovulation',
        title: 'Ovulation Period',
        message: partnerSettings.customMessages.ovulation || 'Your partner is in their ovulation period. Time to be extra supportive! 💕',
        scheduledDate: ovulationDate,
      });
    }

    // Schedule PMS notification
    if (partnerSettings.notificationTypes.pms && pmsStartDate && isAfter(pmsStartDate, new Date())) {
      await this.scheduleNotification({
        type: 'pms',
        title: 'PMS Period Starting',
        message: partnerSettings.customMessages.pms || 'PMS period is starting. Time for extra patience and understanding! 🌸',
        scheduledDate: pmsStartDate,
      });
    }
  }

  static async scheduleNotification(notificationData: Omit<NotificationData, 'id' | 'isSent' | 'createdAt'>): Promise<void> {
    const notification: NotificationData = {
      ...notificationData,
      id: `notification_${notificationData.scheduledDate.getTime()}_${notificationData.type}`,
      isSent: false,
      createdAt: new Date(),
    };

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.message,
          sound: true,
        },
        trigger: {
          date: notification.scheduledDate,
        },
      });

      // Store notification data
      await StorageService.saveNotification(notification);
      
      console.log(`Scheduled notification: ${notification.title} for ${format(notification.scheduledDate, 'MMM dd, yyyy')}`);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  static async clearAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const notifications = await StorageService.getNotifications();
    for (const notification of notifications) {
      await StorageService.deleteNotification(notification.id);
    }
  }

  static getDefaultPeriodStartMessage(daysBefore: number): string {
    const messages = {
      3: "Period starts in 3 days! Time to stock up on comfort foods and plan some relaxing activities. 🍫",
      2: "Period starts in 2 days! Consider getting some flowers or planning a cozy night in. 🌹",
      1: "Period starts tomorrow! Time to be extra supportive and understanding. 💕",
      0: "Period starts today! Be extra patient and caring. 💖"
    };
    
    return messages[daysBefore as keyof typeof messages] || "Period reminder - time to be supportive! 💕";
  }

  static async getUpcomingNotifications(): Promise<NotificationData[]> {
    const notifications = await StorageService.getNotifications();
    const today = new Date();
    
    return notifications
      .filter(notification => isAfter(notification.scheduledDate, today))
      .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
  }

  static async markNotificationAsSent(id: string): Promise<void> {
    const notifications = await StorageService.getNotifications();
    const notification = notifications.find(n => n.id === id);
    
    if (notification) {
      notification.isSent = true;
      await StorageService.saveNotification(notification);
    }
  }

  static async testNotification(): Promise<void> {
    await this.scheduleNotification({
      type: 'custom',
      title: 'Test Notification',
      message: 'This is a test notification from FlowBro! 🔔',
      scheduledDate: new Date(Date.now() + 5000), // 5 seconds from now
    });
  }
}
