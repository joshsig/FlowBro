import { Colors } from '@/constants/Colors';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PeriodEntry } from '@/types/period';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { PeriodTrackingService } from '../../services/periodTracking';
import { ThemedText } from '../layout/ThemedText';

interface PeriodEntryFormProps {
    onEntryAdded: () => void;
    onCancel?: () => void;
    initialStartDate?: Date;
    initialEndDate?: Date;
    editingEntry?: PeriodEntry;
}

export function PeriodEntryForm({ onEntryAdded, onCancel, initialStartDate, initialEndDate, editingEntry }: PeriodEntryFormProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { showToast } = useToast();

    const [startDate, setStartDate] = useState<Date>(initialStartDate || new Date());
    const [endDate, setEndDate] = useState<Date>(initialEndDate || new Date());
    const [flowIntensity, setFlowIntensity] = useState<'light' | 'medium' | 'heavy'>('medium');
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [tempStartDate, setTempStartDate] = useState<Date>(startDate);
    const [tempEndDate, setTempEndDate] = useState<Date>(endDate);

    // Populate form when editing an entry
    useEffect(() => {
        if (editingEntry) {
            setStartDate(editingEntry.startDate);
            setEndDate(editingEntry.endDate);
            setFlowIntensity(editingEntry.flowIntensity);
            setSymptoms(editingEntry.symptoms);
            setNotes(editingEntry.notes || '');
        }
    }, [editingEntry]);

    const symptomOptions = [
        'Cramps', 'Bloating', 'Headache', 'Mood swings', 'Fatigue',
        'Back pain', 'Breast tenderness', 'Nausea', 'Acne', 'Food cravings'
    ];

    const toggleSymptom = (symptom: string) => {
        setSymptoms(prev =>
            prev.includes(symptom)
                ? prev.filter(s => s !== symptom)
                : [...prev, symptom]
        );
    };

    const handleStartDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setTempStartDate(selectedDate);
        }
    };

    const handleEndDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setTempEndDate(selectedDate);
        }
    };

    const confirmStartDate = () => {
        setStartDate(tempStartDate);
        setShowStartDatePicker(false);
    };

    const confirmEndDate = () => {
        setEndDate(tempEndDate);
        setShowEndDatePicker(false);
    };

    const cancelStartDate = () => {
        setTempStartDate(startDate);
        setShowStartDatePicker(false);
    };

    const cancelEndDate = () => {
        setTempEndDate(endDate);
        setShowEndDatePicker(false);
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        if (endDate < startDate) {
            showToast('End date cannot be before start date', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            if (editingEntry) {
                // Update existing entry
                await PeriodTrackingService.updatePeriodEntry(editingEntry.id, {
                    startDate,
                    endDate,
                    flowIntensity,
                    symptoms,
                    notes: notes.trim() || undefined
                });
                showToast('Period entry updated successfully!', 'success');
            } else {
                // Add new entry
                await PeriodTrackingService.addPeriodEntry(
                    startDate,
                    endDate,
                    flowIntensity,
                    symptoms,
                    notes.trim() || undefined
                );
                showToast('Period entry added successfully!', 'success');
            }
            onEntryAdded();
        } catch (error) {
            showToast(editingEntry ? 'Failed to update period entry' : 'Failed to add period entry', 'error');
            console.error('Error with period entry:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                <View style={styles.headerContainer}>
                    <ThemedText type="title" style={styles.title}>
                        {editingEntry ? 'Edit Period Entry' : 'Add Period Entry'}
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Dates
                    </ThemedText>

                    <View style={styles.dateRow}>
                        <View style={styles.dateInput}>
                            <ThemedText style={styles.label}>Start Date</ThemedText>
                            <TouchableOpacity
                                style={[styles.dateText, {
                                    backgroundColor: colors.background,
                                    borderColor: colors.icon,
                                }]}
                                onPress={() => {
                                    setTempStartDate(startDate);
                                    setShowStartDatePicker(true);
                                }}
                            >
                                <ThemedText style={[styles.dateTextContent, { color: colors.text }]}>
                                    {format(startDate, 'MMM dd, yyyy')}
                                </ThemedText>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dateInput}>
                            <ThemedText style={styles.label}>End Date</ThemedText>
                            <TouchableOpacity
                                style={[styles.dateText, {
                                    backgroundColor: colors.background,
                                    borderColor: colors.icon,
                                }]}
                                onPress={() => {
                                    setTempEndDate(endDate);
                                    setShowEndDatePicker(true);
                                }}
                            >
                                <ThemedText style={[styles.dateTextContent, { color: colors.text }]}>
                                    {format(endDate, 'MMM dd, yyyy')}
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Flow Intensity
                    </ThemedText>

                    <View style={styles.intensityContainer}>
                        {(['light', 'medium', 'heavy'] as const).map((intensity) => (
                            <TouchableOpacity
                                key={intensity}
                                style={[
                                    styles.intensityButton,
                                    flowIntensity === intensity && styles.intensityButtonSelected
                                ]}
                                onPress={() => setFlowIntensity(intensity)}
                            >
                                <ThemedText style={[
                                    styles.intensityText,
                                    flowIntensity === intensity && styles.intensityTextSelected
                                ]}>
                                    {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Symptoms
                    </ThemedText>

                    <View style={styles.symptomsContainer}>
                        {symptomOptions.map((symptom) => (
                            <TouchableOpacity
                                key={symptom}
                                style={[
                                    styles.symptomButton,
                                    symptoms.includes(symptom) && styles.symptomButtonSelected
                                ]}
                                onPress={() => toggleSymptom(symptom)}
                            >
                                <ThemedText style={[
                                    styles.symptomText,
                                    symptoms.includes(symptom) && styles.symptomTextSelected
                                ]}>
                                    {symptom}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Notes (Optional)
                    </ThemedText>

                    <TextInput
                        style={[styles.notesInput, {
                            backgroundColor: colors.background,
                            borderColor: colors.icon,
                            color: colors.text
                        }]}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Add any additional notes..."
                        placeholderTextColor={colors.icon}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    <ThemedText style={styles.submitButtonText}>
                        {isSubmitting
                            ? (editingEntry ? 'Updating...' : 'Adding...')
                            : (editingEntry ? 'Update Entry' : 'Add Entry')
                        }
                    </ThemedText>
                </TouchableOpacity>

                {/* Start Date Picker Modal */}
                <Modal
                    visible={showStartDatePicker}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={cancelStartDate}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                            <ThemedText type="subtitle" style={styles.modalTitle}>
                                Select Start Date
                            </ThemedText>

                            <DateTimePicker
                                value={tempStartDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={handleStartDateChange}
                                style={styles.datePicker}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelModalButton]}
                                    onPress={cancelStartDate}
                                >
                                    <ThemedText style={styles.cancelModalButtonText}>Cancel</ThemedText>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmModalButton]}
                                    onPress={confirmStartDate}
                                >
                                    <ThemedText style={styles.confirmModalButtonText}>Confirm</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* End Date Picker Modal */}
                <Modal
                    visible={showEndDatePicker}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={cancelEndDate}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                            <ThemedText type="subtitle" style={styles.modalTitle}>
                                Select End Date
                            </ThemedText>

                            <DateTimePicker
                                value={tempEndDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={handleEndDateChange}
                                style={styles.datePicker}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelModalButton]}
                                    onPress={cancelEndDate}
                                >
                                    <ThemedText style={styles.cancelModalButtonText}>Cancel</ThemedText>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmModalButton]}
                                    onPress={confirmEndDate}
                                >
                                    <ThemedText style={styles.confirmModalButtonText}>Confirm</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
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
        paddingBottom: 100, // Add extra padding to avoid nav bar
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        flex: 1,
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 12,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dateInput: {
        flex: 1,
        marginHorizontal: 4,
    },
    label: {
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    dateText: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        justifyContent: 'center',
    },
    dateTextContent: {
        fontSize: 16,
    },
    intensityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    intensityButton: {
        flex: 1,
        padding: 12,
        marginHorizontal: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    intensityButtonSelected: {
        backgroundColor: '#FF6B9D',
        borderColor: '#FF6B9D',
    },
    intensityText: {
        fontSize: 14,
        fontWeight: '500',
    },
    intensityTextSelected: {
        color: 'white',
    },
    symptomsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    symptomButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        margin: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    symptomButtonSelected: {
        backgroundColor: '#FF6B9D',
        borderColor: '#FF6B9D',
    },
    symptomText: {
        fontSize: 12,
    },
    symptomTextSelected: {
        color: 'white',
    },
    notesInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#FF6B9D',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        margin: 20,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        minWidth: 300,
    },
    modalTitle: {
        marginBottom: 20,
        textAlign: 'center',
    },
    datePicker: {
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelModalButton: {
        borderWidth: 1,
        borderColor: '#ccc',
    },
    confirmModalButton: {
        backgroundColor: '#FF6B9D',
    },
    cancelModalButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    confirmModalButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});
