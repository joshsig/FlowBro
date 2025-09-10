import { Colors } from '@/constants/Colors';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';
import { NotificationService } from '../../services/notificationService';
import { StorageService } from '../../services/storage';
import { AppSettings, PartnerNotificationSettings } from '../../types/period';
import { ThemedText } from '../layout/ThemedText';
import { ThemedView } from '../layout/ThemedView';

interface PartnerSettingsProps {
    saveTrigger?: number;
}

export function PartnerSettings({ saveTrigger }: PartnerSettingsProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { showToast } = useToast();

    const [settings, setSettings] = useState<PartnerNotificationSettings>({
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
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        if (saveTrigger && saveTrigger > 0) {
            saveSettings();
        }
    }, [saveTrigger]);

    const loadSettings = async () => {
        try {
            const appSettings = await StorageService.getAppSettings();
            if (appSettings?.partnerNotifications) {
                setSettings(appSettings.partnerNotifications);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveSettings = async () => {
        try {
            const appSettings = await StorageService.getAppSettings();
            const updatedSettings: AppSettings = {
                cycleLength: appSettings?.cycleLength || 28,
                periodLength: appSettings?.periodLength || 5,
                lastPeriodStart: appSettings?.lastPeriodStart,
                notificationsEnabled: true, // Always enabled
                partnerNotifications: { ...settings, enabled: true }, // Always enabled
            };

            await StorageService.saveAppSettings(updatedSettings);

            // Always schedule notifications
            await NotificationService.schedulePartnerNotifications();

            showToast('Partner settings saved successfully!', 'success');
        } catch (error) {
            showToast('Failed to save settings', 'error');
            console.error('Error saving settings:', error);
        }
    };

    const toggleReminderDay = (day: number) => {
        setSettings(prev => ({
            ...prev,
            reminderDays: prev.reminderDays.includes(day)
                ? prev.reminderDays.filter(d => d !== day)
                : [...prev.reminderDays, day].sort((a, b) => b - a)
        }));
    };

    const testNotification = async () => {
        try {
            await NotificationService.testNotification();
            showToast('A test notification will appear in 5 seconds!', 'info');
        } catch (error) {
            showToast('Failed to send test notification', 'error');
        }
    };

    if (isLoading) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>Loading settings...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >

                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Partner Name
                    </ThemedText>
                    <TextInput
                        style={[styles.textInput, {
                            backgroundColor: colors.background,
                            borderColor: colors.icon,
                            color: colors.text
                        }]}
                        value={settings.partnerName}
                        onChangeText={(text) => setSettings(prev => ({ ...prev, partnerName: text }))}
                        placeholder="Enter partner's name"
                        placeholderTextColor={colors.icon}
                    />
                </View>

                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Pronouns
                    </ThemedText>
                    <View style={styles.pronounContainer}>
                        {[
                            { value: 'they/them', label: 'They/Them' },
                            { value: 'she/her', label: 'She/Her' },
                            { value: 'he/him', label: 'He/Him' },
                            { value: 'custom', label: 'Custom' }
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.pronounButton,
                                    settings.pronouns === option.value && styles.pronounButtonSelected
                                ]}
                                onPress={() => setSettings(prev => ({ ...prev, pronouns: option.value as 'they/them' | 'she/her' | 'he/him' | 'custom' }))}
                            >
                                <ThemedText style={[
                                    styles.pronounText,
                                    settings.pronouns === option.value && styles.pronounTextSelected
                                ]}>
                                    {option.label}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {settings.pronouns === 'custom' && (
                        <TextInput
                            style={[styles.textInput, {
                                backgroundColor: colors.background,
                                borderColor: colors.icon,
                                color: colors.text,
                                marginTop: 12
                            }]}
                            value={settings.customPronouns || ''}
                            onChangeText={(text) => setSettings(prev => ({ ...prev, customPronouns: text }))}
                            placeholder="Enter custom pronouns (e.g., xe/xem, ze/zir)"
                            placeholderTextColor={colors.icon}
                        />
                    )}
                </View>

                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Reminder Days Before Period
                    </ThemedText>
                    <View style={styles.reminderDaysContainer}>
                        {[7, 5, 3, 2, 1].map((day) => (
                            <TouchableOpacity
                                key={day}
                                style={[
                                    styles.reminderDayButton,
                                    settings.reminderDays.includes(day) && styles.reminderDayButtonSelected
                                ]}
                                onPress={() => toggleReminderDay(day)}
                            >
                                <ThemedText style={[
                                    styles.reminderDayText,
                                    settings.reminderDays.includes(day) && styles.reminderDayTextSelected
                                ]}>
                                    {day} day{day > 1 ? 's' : ''}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Notification Types
                    </ThemedText>

                    <View style={styles.notificationTypeContainer}>
                        <View style={styles.settingRow}>
                            <ThemedText>Period Start</ThemedText>
                            <Switch
                                value={settings.notificationTypes.periodStart}
                                onValueChange={(value) => setSettings(prev => ({
                                    ...prev,
                                    notificationTypes: { ...prev.notificationTypes, periodStart: value }
                                }))}
                                trackColor={{ false: '#767577', true: '#FF6B9D' }}
                                thumbColor={settings.notificationTypes.periodStart ? '#fff' : '#f4f3f4'}
                            />
                        </View>
                        {settings.notificationTypes.periodStart && (
                            <View style={styles.messageSection}>
                                <ThemedText style={styles.messageLabel}>Custom Period Start Message</ThemedText>
                                <TextInput
                                    style={[styles.messageInput, {
                                        backgroundColor: colors.background,
                                        borderColor: colors.icon,
                                        color: colors.text
                                    }]}
                                    value={settings.customMessages.periodStart}
                                    onChangeText={(text) => setSettings(prev => ({
                                        ...prev,
                                        customMessages: { ...prev.customMessages, periodStart: text }
                                    }))}
                                    placeholder="Leave empty for default message"
                                    placeholderTextColor={colors.icon}
                                    multiline
                                />
                            </View>
                        )}
                    </View>

                    <View style={styles.notificationTypeContainer}>
                        <View style={styles.settingRow}>
                            <ThemedText>Period End</ThemedText>
                            <Switch
                                value={settings.notificationTypes.periodEnd}
                                onValueChange={(value) => setSettings(prev => ({
                                    ...prev,
                                    notificationTypes: { ...prev.notificationTypes, periodEnd: value }
                                }))}
                                trackColor={{ false: '#767577', true: '#FF6B9D' }}
                                thumbColor={settings.notificationTypes.periodEnd ? '#fff' : '#f4f3f4'}
                            />
                        </View>
                        {settings.notificationTypes.periodEnd && (
                            <View style={styles.messageSection}>
                                <ThemedText style={styles.messageLabel}>Custom Period End Message</ThemedText>
                                <TextInput
                                    style={[styles.messageInput, {
                                        backgroundColor: colors.background,
                                        borderColor: colors.icon,
                                        color: colors.text
                                    }]}
                                    value={settings.customMessages.periodEnd}
                                    onChangeText={(text) => setSettings(prev => ({
                                        ...prev,
                                        customMessages: { ...prev.customMessages, periodEnd: text }
                                    }))}
                                    placeholder="Leave empty for default message"
                                    placeholderTextColor={colors.icon}
                                    multiline
                                />
                            </View>
                        )}
                    </View>

                    <View style={styles.notificationTypeContainer}>
                        <View style={styles.settingRow}>
                            <ThemedText>Ovulation</ThemedText>
                            <Switch
                                value={settings.notificationTypes.ovulation}
                                onValueChange={(value) => setSettings(prev => ({
                                    ...prev,
                                    notificationTypes: { ...prev.notificationTypes, ovulation: value }
                                }))}
                                trackColor={{ false: '#767577', true: '#FF6B9D' }}
                                thumbColor={settings.notificationTypes.ovulation ? '#fff' : '#f4f3f4'}
                            />
                        </View>
                        {settings.notificationTypes.ovulation && (
                            <View style={styles.messageSection}>
                                <ThemedText style={styles.messageLabel}>Custom Ovulation Message</ThemedText>
                                <TextInput
                                    style={[styles.messageInput, {
                                        backgroundColor: colors.background,
                                        borderColor: colors.icon,
                                        color: colors.text
                                    }]}
                                    value={settings.customMessages.ovulation}
                                    onChangeText={(text) => setSettings(prev => ({
                                        ...prev,
                                        customMessages: { ...prev.customMessages, ovulation: text }
                                    }))}
                                    placeholder="Leave empty for default message"
                                    placeholderTextColor={colors.icon}
                                    multiline
                                />
                            </View>
                        )}
                    </View>

                    <View style={styles.notificationTypeContainer}>
                        <View style={styles.settingRow}>
                            <ThemedText>PMS</ThemedText>
                            <Switch
                                value={settings.notificationTypes.pms}
                                onValueChange={(value) => setSettings(prev => ({
                                    ...prev,
                                    notificationTypes: { ...prev.notificationTypes, pms: value }
                                }))}
                                trackColor={{ false: '#767577', true: '#FF6B9D' }}
                                thumbColor={settings.notificationTypes.pms ? '#fff' : '#f4f3f4'}
                            />
                        </View>
                        {settings.notificationTypes.pms && (
                            <View style={styles.messageSection}>
                                <ThemedText style={styles.messageLabel}>Custom PMS Message</ThemedText>
                                <TextInput
                                    style={[styles.messageInput, {
                                        backgroundColor: colors.background,
                                        borderColor: colors.icon,
                                        color: colors.text
                                    }]}
                                    value={settings.customMessages.pms}
                                    onChangeText={(text) => setSettings(prev => ({
                                        ...prev,
                                        customMessages: { ...prev.customMessages, pms: text }
                                    }))}
                                    placeholder="Leave empty for default message"
                                    placeholderTextColor={colors.icon}
                                    multiline
                                />
                            </View>
                        )}
                    </View>
                </View>


                <View style={styles.section}>
                    <TouchableOpacity style={styles.testButton} onPress={testNotification}>
                        <ThemedText style={styles.testButtonText}>Send Test Notification</ThemedText>
                    </TouchableOpacity>
                </View>

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
        padding: 16,
    },
    title: {
        textAlign: 'center',
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 12,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    notificationTypeContainer: {
        marginBottom: 16,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    reminderDaysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    reminderDayButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        margin: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    reminderDayButtonSelected: {
        backgroundColor: '#FF6B9D',
        borderColor: '#FF6B9D',
    },
    reminderDayText: {
        fontSize: 14,
    },
    reminderDayTextSelected: {
        color: 'white',
    },
    pronounContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    pronounButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        margin: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    pronounButtonSelected: {
        backgroundColor: '#FF6B9D',
        borderColor: '#FF6B9D',
    },
    pronounText: {
        fontSize: 14,
    },
    pronounTextSelected: {
        color: 'white',
    },
    messageSection: {
        marginBottom: 16,
    },
    messageLabel: {
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    messageInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 60,
        textAlignVertical: 'top',
    },
    testButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    testButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
});
