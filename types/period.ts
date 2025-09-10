export interface PeriodEntry {
  id: string;
  startDate: Date;
  endDate: Date;
  flowIntensity: 'light' | 'medium' | 'heavy';
  symptoms: string[];
  notes?: string;
  createdAt: Date;
}

export interface CycleData {
  id: string;
  startDate: Date;
  endDate: Date;
  length: number; // in days
  averageLength: number;
  isPredicted: boolean;
}

export interface PartnerNotificationSettings {
  enabled: boolean;
  reminderDays: number[]; // days before period starts (e.g., [3, 1] for 3 days and 1 day before)
  notificationTypes: {
    periodStart: boolean;
    periodEnd: boolean;
    ovulation: boolean;
    pms: boolean;
  };
  customMessages: {
    periodStart: string;
    periodEnd: string;
    ovulation: string;
    pms: string;
  };
  partnerName: string;
  pronouns: 'they/them' | 'she/her' | 'he/him' | 'custom';
  customPronouns?: string;
}

export interface AppSettings {
  cycleLength: number; // average cycle length in days
  periodLength: number; // average period length in days
  lastPeriodStart?: Date;
  partnerNotifications: PartnerNotificationSettings;
  notificationsEnabled: boolean;
}

export interface NotificationData {
  id: string;
  type: 'period_start' | 'period_end' | 'ovulation' | 'pms' | 'custom';
  title: string;
  message: string;
  scheduledDate: Date;
  isSent: boolean;
  createdAt: Date;
}
