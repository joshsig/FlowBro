import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PeriodEntry } from '@/types/period';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PeriodEntryForm } from '../forms/PeriodEntryForm';
import { ThemedText } from '../layout/ThemedText';

interface PeriodEntryModalProps {
    visible: boolean;
    onClose: () => void;
    onEntryAdded: () => void;
    initialStartDate?: Date;
    initialEndDate?: Date;
    editingEntry?: PeriodEntry;
}

export function PeriodEntryModal({
    visible,
    onClose,
    onEntryAdded,
    initialStartDate,
    initialEndDate,
    editingEntry
}: PeriodEntryModalProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const handleEntryAdded = () => {
        onEntryAdded();
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { borderBottomColor: colors.icon }]}>
                    <TouchableOpacity
                        style={[styles.closeButton, { borderColor: colors.icon }]}
                        onPress={onClose}
                    >
                        <ThemedText style={[styles.closeButtonText, { color: colors.text }]}>
                            ✕
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                <PeriodEntryForm
                    onEntryAdded={handleEntryAdded}
                    onCancel={handleCancel}
                    initialStartDate={initialStartDate}
                    initialEndDate={initialEndDate}
                    editingEntry={editingEntry}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 18,
        fontWeight: '600',
    },
});
