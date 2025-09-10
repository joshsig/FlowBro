import React, { useEffect, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { PartnerSettings } from '@/components/forms/PartnerSettings';
import { ThemedText } from '@/components/layout/ThemedText';
import { ThemedView } from '@/components/layout/ThemedView';
import { Colors } from '@/constants/Colors';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StorageService } from '@/services/storage';
import { AppSettings } from '@/types/period';

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { showToast } = useToast();

    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saveTrigger, setSaveTrigger] = useState(0);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const appSettings = await StorageService.getAppSettings();
            if (appSettings) {
                setSettings(appSettings);
            } else {
                // Create default settings
                const defaultSettings: AppSettings = {
                    cycleLength: 28,
                    periodLength: 5,
                    notificationsEnabled: true,
                    partnerNotifications: {
                        enabled: true,
                        reminderDays: [3, 1],
                        notificationTypes: {
                            periodStart: true,
                            periodEnd: false,
                            ovulation: true,
                            pms: true,
                        },
                        customMessages: {
                            periodStart: '',
                            periodEnd: '',
                            ovulation: '',
                            pms: '',
                        },
                        partnerName: '',
                        pronouns: 'they/them',
                        customPronouns: '',
                    },
                };
                setSettings(defaultSettings);
                await StorageService.saveAppSettings(defaultSettings);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSettings = async (newSettings: Partial<AppSettings>) => {
        if (!settings) return;

        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);

        try {
            await StorageService.saveAppSettings(updatedSettings);
        } catch (error) {
            console.error('Error saving settings:', error);
            showToast('Failed to save settings', 'error');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadSettings();
        setRefreshing(false);
    };

    if (isLoading) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>Loading settings...</ThemedText>
            </ThemedView>
        );
    }

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
                    <ThemedText type="title" style={styles.title}>Settings</ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Configure your period tracking and partner notifications
                    </ThemedText>
                </ThemedView>

                {settings && (
                    <PartnerSettings saveTrigger={saveTrigger} />
                )}
            </ScrollView>

            <TouchableOpacity style={styles.floatingSaveButton} onPress={() => setSaveTrigger(prev => prev + 1)}>
                <ThemedText style={styles.floatingSaveButtonText}>✓</ThemedText>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: Platform.OS === 'ios' ? 80 : 40, // Add top padding to avoid floating button
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
    floatingSaveButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FF6B9D',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        zIndex: 1000, // Ensure it stays on top
    },
    floatingSaveButtonText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
});
