import { Colors } from '@/constants/Colors';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PeriodEntry } from '@/types/period';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PeriodTrackingService } from '../../services/periodTracking';
import { PeriodEntryForm } from '../forms/PeriodEntryForm';
import { ThemedText } from '../layout/ThemedText';

interface PeriodEntryListProps {
    entries: PeriodEntry[];
    onEntryUpdated: () => void;
}

export function PeriodEntryList({ entries, onEntryUpdated }: PeriodEntryListProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { showToast } = useToast();
    const [editingEntry, setEditingEntry] = useState<PeriodEntry | null>(null);

    const handleEditEntry = (entry: PeriodEntry) => {
        setEditingEntry(entry);
    };

    const handleDeleteEntry = async (entry: PeriodEntry) => {
        Alert.alert(
            'Delete Entry',
            'Are you sure you want to delete this period entry?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await PeriodTrackingService.deletePeriodEntry(entry.id);
                            onEntryUpdated();
                            showToast('Period entry deleted successfully!', 'success');
                        } catch (error) {
                            showToast('Failed to delete period entry', 'error');
                            console.error('Error deleting period entry:', error);
                        }
                    }
                }
            ]
        );
    };

    const handleEntryUpdated = () => {
        setEditingEntry(null);
        onEntryUpdated();
    };

    const handleCancelEdit = () => {
        setEditingEntry(null);
    };

    const renderEntry = ({ item }: { item: PeriodEntry }) => (
        <View style={[styles.entryCard, { backgroundColor: colors.background, borderColor: colors.icon }]}>
            <View style={styles.entryHeader}>
                <View style={styles.entryDates}>
                    <ThemedText style={styles.entryDateText}>
                        {format(item.startDate, 'MMM dd')} - {format(item.endDate, 'MMM dd, yyyy')}
                    </ThemedText>
                    <ThemedText style={[styles.entryDuration, { color: colors.icon }]}>
                        {Math.ceil((item.endDate.getTime() - item.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                    </ThemedText>
                </View>
                <View style={styles.entryActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => handleEditEntry(item)}
                    >
                        <ThemedText style={styles.editButtonText}>Edit</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteEntry(item)}
                    >
                        <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.entryDetails}>
                <View style={styles.entryRow}>
                    <ThemedText style={[styles.entryLabel, { color: colors.icon }]}>Flow:</ThemedText>
                    <ThemedText style={[styles.entryValue, {
                        color: item.flowIntensity === 'heavy' ? '#e74c3c' :
                            item.flowIntensity === 'medium' ? '#f39c12' : '#27ae60'
                    }]}>
                        {item.flowIntensity.charAt(0).toUpperCase() + item.flowIntensity.slice(1)}
                    </ThemedText>
                </View>

                {item.symptoms.length > 0 && (
                    <View style={styles.entryRow}>
                        <ThemedText style={[styles.entryLabel, { color: colors.icon }]}>Symptoms:</ThemedText>
                        <ThemedText style={styles.entryValue}>
                            {item.symptoms.join(', ')}
                        </ThemedText>
                    </View>
                )}

                {item.notes && (
                    <View style={styles.entryRow}>
                        <ThemedText style={[styles.entryLabel, { color: colors.icon }]}>Notes:</ThemedText>
                        <ThemedText style={styles.entryValue}>{item.notes}</ThemedText>
                    </View>
                )}
            </View>
        </View>
    );

    if (editingEntry) {
        return (
            <PeriodEntryForm
                onEntryAdded={handleEntryUpdated}
                onCancel={handleCancelEdit}
                initialStartDate={editingEntry.startDate}
                initialEndDate={editingEntry.endDate}
                editingEntry={editingEntry}
            />
        );
    }

    if (entries.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <ThemedText style={[styles.emptyText, { color: colors.icon }]}>
                    No period entries yet. Add your first entry to start tracking!
                </ThemedText>
            </View>
        );
    }

    return (
        <FlatList
            data={entries}
            renderItem={renderEntry}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
        />
    );
}

const styles = StyleSheet.create({
    list: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 100, // Add extra padding to avoid nav bar
    },
    entryCard: {
        margin: 16,
        marginBottom: 8,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    entryDates: {
        flex: 1,
    },
    entryDateText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    entryDuration: {
        fontSize: 14,
    },
    entryActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    editButton: {
        backgroundColor: '#3498db',
    },
    editButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: '#e74c3c',
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    entryDetails: {
        gap: 8,
    },
    entryRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    entryLabel: {
        fontSize: 14,
        fontWeight: '500',
        width: 80,
        marginRight: 8,
    },
    entryValue: {
        fontSize: 14,
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
});
