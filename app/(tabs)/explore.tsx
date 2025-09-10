import React, { useEffect, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/layout/ThemedText';
import { ThemedView } from '@/components/layout/ThemedView';
import { EntryListModal } from '@/components/modals/EntryListModal';
import { PeriodEntryModal } from '@/components/modals/PeriodEntryModal';
import { PeriodCalendar } from '@/components/period/PeriodCalendar';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StorageService } from '@/services/storage';
import { PeriodEntry } from '@/types/period';

export default function TabTwoScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [entries, setEntries] = useState<PeriodEntry[]>([]);
  const [showEntryListModal, setShowEntryListModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowEntryModal(true);
  };

  const handleEntryAdded = () => {
    setShowEntryModal(false);
    setSelectedDate(undefined);
    setRefreshTrigger(prev => prev + 1); // Trigger calendar refresh
  };

  const handleCancelEntry = () => {
    setShowEntryModal(false);
    setSelectedDate(undefined);
  };

  const loadEntries = async () => {
    try {
      const periodEntries = await StorageService.getPeriodEntries();
      setEntries(periodEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const handleEntryUpdated = () => {
    loadEntries();
    setRefreshTrigger(prev => prev + 1); // Trigger calendar refresh
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshTrigger(prev => prev + 1);
    setRefreshing(false);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  return (
    <View style={styles.container}>
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
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>Period Tracking</ThemedText>
          <ThemedText style={styles.subtitle}>
            Track your cycle and manage partner notifications
          </ThemedText>
        </ThemedView>

        <PeriodCalendar
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
          refreshTrigger={refreshTrigger}
        />

        <ThemedView style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowEntryModal(true)}
          >
            <ThemedText style={styles.addButtonText}>+ Add Period Entry</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewEntriesButton}
            onPress={() => setShowEntryListModal(true)}
          >
            <ThemedText style={styles.viewEntriesButtonText}>
              View Entries ({entries.length})
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>

      <EntryListModal
        visible={showEntryListModal}
        onClose={() => setShowEntryListModal(false)}
        entries={entries}
        onEntryUpdated={handleEntryUpdated}
      />

      <PeriodEntryModal
        visible={showEntryModal}
        onClose={handleCancelEntry}
        onEntryAdded={handleEntryAdded}
        initialStartDate={selectedDate}
        initialEndDate={selectedDate}
      />
    </View>
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
    paddingBottom: 100, // Add extra padding to avoid nav bar
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 16,
    marginTop: 16,
  },
  addButton: {
    backgroundColor: '#FF6B9D',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  viewEntriesButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewEntriesButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
