import { addDays, differenceInDays, isAfter, isBefore, subDays } from 'date-fns';
import { AppSettings, CycleData, PeriodEntry } from '../types/period';
import { StorageService } from './storage';

export class PeriodTrackingService {
  static async getCurrentCycle(): Promise<CycleData | null> {
    const entries = await StorageService.getPeriodEntries();
    const settings = await StorageService.getAppSettings();

    if (entries.length === 0) return null;

    // Sort entries by start date
    const sortedEntries = entries.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    const lastEntry = sortedEntries[sortedEntries.length - 1];

    // Calculate cycle length
    const cycleLength = settings?.cycleLength || 28;
    const nextPeriodStart = addDays(lastEntry.startDate, cycleLength);

    return {
      id: `cycle_${lastEntry.startDate.getTime()}`,
      startDate: lastEntry.startDate,
      endDate: nextPeriodStart,
      length: cycleLength,
      averageLength: this.calculateAverageCycleLength(entries),
      isPredicted: true,
    };
  }

  static async getNextPeriodDate(): Promise<Date | null> {
    const entries = await StorageService.getPeriodEntries();
    const settings = await StorageService.getAppSettings();

    if (entries.length === 0) return null;

    const sortedEntries = entries.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    const lastEntry = sortedEntries[sortedEntries.length - 1];
    const cycleLength = settings?.cycleLength || 28;

    return addDays(lastEntry.startDate, cycleLength);
  }

  static async getOvulationDate(): Promise<Date | null> {
    const nextPeriod = await this.getNextPeriodDate();
    if (!nextPeriod) return null;

    // Ovulation typically occurs 14 days before the next period
    return subDays(nextPeriod, 14);
  }

  static async getPMSStartDate(): Promise<Date | null> {
    const nextPeriod = await this.getNextPeriodDate();
    if (!nextPeriod) return null;

    // PMS typically starts 5-7 days before period
    return subDays(nextPeriod, 5);
  }

  static calculateAverageCycleLength(entries: PeriodEntry[]): number {
    if (entries.length < 2) return 28;

    const sortedEntries = entries.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    let totalDays = 0;
    let cycleCount = 0;

    for (let i = 1; i < sortedEntries.length; i++) {
      const cycleLength = differenceInDays(
        sortedEntries[i].startDate,
        sortedEntries[i - 1].startDate
      );
      totalDays += cycleLength;
      cycleCount++;
    }

    return Math.round(totalDays / cycleCount);
  }

  static async getCycleHistory(): Promise<CycleData[]> {
    const entries = await StorageService.getPeriodEntries();
    if (entries.length < 2) return [];

    const sortedEntries = entries.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    const cycles: CycleData[] = [];

    for (let i = 1; i < sortedEntries.length; i++) {
      const cycleLength = differenceInDays(
        sortedEntries[i].startDate,
        sortedEntries[i - 1].startDate
      );

      cycles.push({
        id: `cycle_${sortedEntries[i - 1].startDate.getTime()}`,
        startDate: sortedEntries[i - 1].startDate,
        endDate: sortedEntries[i].startDate,
        length: cycleLength,
        averageLength: this.calculateAverageCycleLength(entries),
        isPredicted: false,
      });
    }

    return cycles;
  }

  static async isPeriodActive(): Promise<boolean> {
    const entries = await StorageService.getPeriodEntries();
    if (entries.length === 0) return false;

    const today = new Date();
    const sortedEntries = entries.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    const lastEntry = sortedEntries[sortedEntries.length - 1];

    return isAfter(today, lastEntry.startDate) && isBefore(today, lastEntry.endDate);
  }

  static async getDaysUntilNextPeriod(): Promise<number | null> {
    const nextPeriod = await this.getNextPeriodDate();
    if (!nextPeriod) return null;

    const today = new Date();
    const daysUntil = differenceInDays(nextPeriod, today);

    return daysUntil > 0 ? daysUntil : 0;
  }

  static async getDaysSinceLastPeriod(): Promise<number | null> {
    const entries = await StorageService.getPeriodEntries();
    if (entries.length === 0) return null;

    const today = new Date();
    const sortedEntries = entries.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    const lastEntry = sortedEntries[sortedEntries.length - 1];

    return differenceInDays(today, lastEntry.startDate);
  }

  static async addPeriodEntry(startDate: Date, endDate: Date, flowIntensity: 'light' | 'medium' | 'heavy', symptoms: string[], notes?: string): Promise<void> {
    const entry: PeriodEntry = {
      id: `period_${startDate.getTime()}`,
      startDate,
      endDate,
      flowIntensity,
      symptoms,
      notes,
      createdAt: new Date(),
    };

    await StorageService.savePeriodEntry(entry);
  }

  static async updatePeriodEntry(id: string, updates: Partial<Omit<PeriodEntry, 'id' | 'createdAt'>>): Promise<void> {
    const entries = await StorageService.getPeriodEntries();
    const entryIndex = entries.findIndex(entry => entry.id === id);

    if (entryIndex === -1) {
      throw new Error('Period entry not found');
    }

    const updatedEntry = {
      ...entries[entryIndex],
      ...updates,
    };

    entries[entryIndex] = updatedEntry;
    await StorageService.savePeriodEntries(entries);
  }

  static async deletePeriodEntry(id: string): Promise<void> {
    const entries = await StorageService.getPeriodEntries();
    const filteredEntries = entries.filter(entry => entry.id !== id);

    if (filteredEntries.length === entries.length) {
      throw new Error('Period entry not found');
    }

    await StorageService.savePeriodEntries(filteredEntries);
  }

  static async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    const currentSettings = await StorageService.getAppSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    await StorageService.saveAppSettings(updatedSettings as AppSettings);
  }
}
