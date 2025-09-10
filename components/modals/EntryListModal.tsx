import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PeriodEntry } from '@/types/period';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../layout/ThemedText';
import { SimpleEntryList } from '../period/SimpleEntryList';

interface EntryListModalProps {
    visible: boolean;
    onClose: () => void;
    entries: PeriodEntry[];
    onEntryUpdated: () => void;
}

export function EntryListModal({
    visible,
    onClose,
    entries,
    onEntryUpdated,
}: EntryListModalProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                    <View style={styles.modalHeader}>
                        <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
                            Period Entries ({entries.length})
                        </ThemedText>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <ThemedText style={[styles.closeButtonText, { color: colors.text }]}>✕</ThemedText>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalBody}>
                        <SimpleEntryList
                            entries={entries}
                            onEntryUpdated={onEntryUpdated}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '100%',
        height: '85%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalBody: {
        flex: 1,
        paddingHorizontal: 16,
    },
});
