import { differenceInDays, format } from 'date-fns';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/layout/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { NotificationService } from '@/services/notificationService';
import { PeriodTrackingService } from '@/services/periodTracking';
import { StorageService } from '@/services/storage';
import { AppSettings } from '@/types/period';
import { getPronouns } from '@/utils/pronouns';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [isPeriodActive, setIsPeriodActive] = useState(false);
  const [daysUntilNextPeriod, setDaysUntilNextPeriod] = useState<number | null>(null);
  const [daysSinceLastPeriod, setDaysSinceLastPeriod] = useState<number | null>(null);
  const [nextPeriodDate, setNextPeriodDate] = useState<Date | null>(null);
  const [ovulationDate, setOvulationDate] = useState<Date | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPeriodData();
    requestNotificationPermissions();
  }, []);

  // Refresh data when home tab is focused
  useFocusEffect(
    useCallback(() => {
      loadPeriodData();
    }, [])
  );

  const loadPeriodData = async () => {
    try {
      const active = await PeriodTrackingService.isPeriodActive();
      const daysUntil = await PeriodTrackingService.getDaysUntilNextPeriod();
      const daysSince = await PeriodTrackingService.getDaysSinceLastPeriod();
      const nextPeriod = await PeriodTrackingService.getNextPeriodDate();
      const ovulation = await PeriodTrackingService.getOvulationDate();
      const settings = await StorageService.getAppSettings();

      setIsPeriodActive(active);
      setDaysUntilNextPeriod(daysUntil);
      setDaysSinceLastPeriod(daysSince);
      setNextPeriodDate(nextPeriod);
      setOvulationDate(ovulation);
      setPartnerName(settings?.partnerNotifications?.partnerName || '');
      setAppSettings(settings);
    } catch (error) {
      console.error('Error loading period data:', error);
    }
  };

  const requestNotificationPermissions = async () => {
    await NotificationService.requestPermissions();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPeriodData();
    setRefreshing(false);
  };

  const getStatusMessage = () => {
    const partner = partnerName || "Your partner";
    const pronouns = appSettings?.partnerNotifications ? getPronouns(appSettings.partnerNotifications) : { subject: 'they', object: 'them', possessive: 'their', reflexive: 'themselves' };

    if (isPeriodActive) {
      return {
        title: "Period Active",
        message: `${partner}'s period is currently active. Take care of ${pronouns.object}! 💕`,
        color: "#FF6B9D"
      };
    }

    if (daysUntilNextPeriod !== null && daysUntilNextPeriod <= 3) {
      return {
        title: "Period Coming Soon",
        message: `${partner}'s period is expected in ${daysUntilNextPeriod} day${daysUntilNextPeriod !== 1 ? 's' : ''}.`,
        color: "#FFA500"
      };
    }

    if (ovulationDate && differenceInDays(ovulationDate, new Date()) <= 2 && differenceInDays(ovulationDate, new Date()) >= -2) {
      return {
        title: "Ovulation Period",
        message: `${partner} is in ${pronouns.possessive} ovulation window. Time to be extra supportive! 🌸`,
        color: "#FFD700"
      };
    }

    return {
      title: "All Good",
      message: `${partner} is in a comfortable phase of ${pronouns.possessive} cycle.`,
      color: "#4CAF50"
    };
  };

  const status = getStatusMessage();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
      >
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
          />
          <ThemedText type="title" style={styles.title}>FlowBro</ThemedText>
          <ThemedText style={styles.subtitle}>
            {partnerName ? `Supporting ${partnerName}` : 'Period Tracking & Partner Support'}
          </ThemedText>
        </View>

        <View style={[styles.statusCard, { borderLeftColor: status.color, backgroundColor: colors.background }]}>
          <ThemedText type="subtitle" style={styles.statusTitle}>
            {status.title}
          </ThemedText>
          <ThemedText style={styles.statusMessage}>
            {status.message}
          </ThemedText>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.background }]}>
            <ThemedText type="subtitle" style={styles.statNumber}>
              {daysUntilNextPeriod !== null ? daysUntilNextPeriod : '--'}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Days Until Period</ThemedText>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.background }]}>
            <ThemedText type="subtitle" style={styles.statNumber}>
              {daysSinceLastPeriod !== null ? daysSinceLastPeriod : '--'}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Days Since Last</ThemedText>
          </View>
        </View>

        {nextPeriodDate && (
          <View style={[styles.infoCard, { backgroundColor: colors.background }]}>
            <ThemedText type="subtitle" style={styles.infoTitle}>
              Next Period Expected
            </ThemedText>
            <ThemedText style={styles.infoDate}>
              {format(nextPeriodDate, 'EEEE, MMMM dd, yyyy')}
            </ThemedText>
          </View>
        )}

        {ovulationDate && (
          <View style={[styles.infoCard, { backgroundColor: colors.background }]}>
            <ThemedText type="subtitle" style={styles.infoTitle}>
              Ovulation Window
            </ThemedText>
            <ThemedText style={styles.infoDate}>
              {format(ovulationDate, 'EEEE, MMMM dd, yyyy')}
            </ThemedText>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoDate: {
    fontSize: 14,
    opacity: 0.8,
  },
});
