import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, NotificationData, PeriodEntry } from '../types/period';

const STORAGE_KEYS = {
  PERIOD_ENTRIES: 'period_entries',
  APP_SETTINGS: 'app_settings',
  NOTIFICATIONS: 'notifications',
} as const;

export class StorageService {
  // Period Entries
  static async getPeriodEntries(): Promise<PeriodEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PERIOD_ENTRIES);
      if (data) {
        const entries = JSON.parse(data);
        return entries.map((entry: any) => ({
          ...entry,
          startDate: new Date(entry.startDate),
          endDate: new Date(entry.endDate),
          createdAt: new Date(entry.createdAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting period entries:', error);
      return [];
    }
  }

  static async savePeriodEntry(entry: PeriodEntry): Promise<void> {
    try {
      const entries = await this.getPeriodEntries();
      const existingIndex = entries.findIndex(e => e.id === entry.id);

      if (existingIndex >= 0) {
        entries[existingIndex] = entry;
      } else {
        entries.push(entry);
      }

      // Sort by start date
      entries.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

      await AsyncStorage.setItem(STORAGE_KEYS.PERIOD_ENTRIES, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving period entry:', error);
    }
  }

  static async savePeriodEntries(entries: PeriodEntry[]): Promise<void> {
    try {
      // Sort by start date
      const sortedEntries = entries.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      await AsyncStorage.setItem(STORAGE_KEYS.PERIOD_ENTRIES, JSON.stringify(sortedEntries));
    } catch (error) {
      console.error('Error saving period entries:', error);
    }
  }

  static async deletePeriodEntry(id: string): Promise<void> {
    try {
      const entries = await this.getPeriodEntries();
      const filteredEntries = entries.filter(entry => entry.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.PERIOD_ENTRIES, JSON.stringify(filteredEntries));
    } catch (error) {
      console.error('Error deleting period entry:', error);
    }
  }

  // App Settings
  static async getAppSettings(): Promise<AppSettings | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      if (data) {
        const settings = JSON.parse(data);
        return {
          ...settings,
          lastPeriodStart: settings.lastPeriodStart ? new Date(settings.lastPeriodStart) : undefined,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting app settings:', error);
      return null;
    }
  }

  static async saveAppSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving app settings:', error);
    }
  }

  // Notifications
  static async getNotifications(): Promise<NotificationData[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (data) {
        const notifications = JSON.parse(data);
        return notifications.map((notification: any) => ({
          ...notification,
          scheduledDate: new Date(notification.scheduledDate),
          createdAt: new Date(notification.createdAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  static async saveNotification(notification: NotificationData): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const existingIndex = notifications.findIndex(n => n.id === notification.id);

      if (existingIndex >= 0) {
        notifications[existingIndex] = notification;
      } else {
        notifications.push(notification);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  }

  static async deleteNotification(id: string): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const filteredNotifications = notifications.filter(notification => notification.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(filteredNotifications));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }
}
