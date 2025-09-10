import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { addDays, format, isAfter, isBefore, isSameDay } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { PeriodTrackingService } from '../../services/periodTracking';
import { StorageService } from '../../services/storage';
import { CycleData, PeriodEntry } from '../../types/period';
import { ThemedView } from '../layout/ThemedView';

interface PeriodCalendarProps {
    onDateSelect?: (date: Date) => void;
    selectedDate?: Date;
    refreshTrigger?: number; // Add refresh trigger prop
}

export function PeriodCalendar({ onDateSelect, selectedDate, refreshTrigger }: PeriodCalendarProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [periodEntries, setPeriodEntries] = useState<PeriodEntry[]>([]);
    const [currentCycle, setCurrentCycle] = useState<CycleData | null>(null);
    const [markedDates, setMarkedDates] = useState<Record<string, any>>({});

    useEffect(() => {
        loadData();
    }, [refreshTrigger]); // Add refreshTrigger to dependency array

    const loadData = async () => {
        const entries = await StorageService.getPeriodEntries();
        const cycle = await PeriodTrackingService.getCurrentCycle();
        setPeriodEntries(entries);
        setCurrentCycle(cycle);
        updateMarkedDates(entries, cycle);
    };

    const updateMarkedDates = (entries: PeriodEntry[], cycle: CycleData | null) => {
        const marked: Record<string, any> = {};
        const today = new Date();

        // Mark period entries
        entries.forEach(entry => {
            const startDate = format(entry.startDate, 'yyyy-MM-dd');
            const endDate = format(entry.endDate, 'yyyy-MM-dd');

            // Mark period start
            marked[startDate] = {
                startingDay: true,
                color: '#FF6B9D',
                textColor: 'white',
                customStyles: {
                    container: {
                        backgroundColor: '#FF6B9D',
                        borderRadius: 8,
                    },
                },
            };

            // Mark period days
            let currentDate = addDays(entry.startDate, 1);
            while (isBefore(currentDate, entry.endDate)) {
                const dateStr = format(currentDate, 'yyyy-MM-dd');
                marked[dateStr] = {
                    color: '#FF6B9D',
                    textColor: 'white',
                    customStyles: {
                        container: {
                            backgroundColor: '#FF6B9D',
                        },
                    },
                };
                currentDate = addDays(currentDate, 1);
            }

            // Mark period end
            if (!isSameDay(entry.startDate, entry.endDate)) {
                marked[endDate] = {
                    endingDay: true,
                    color: '#FF6B9D',
                    textColor: 'white',
                    customStyles: {
                        container: {
                            backgroundColor: '#FF6B9D',
                            borderRadius: 8,
                        },
                    },
                };
            }
        });

        // Mark predicted next period
        if (cycle) {
            const nextPeriodStart = format(cycle.endDate, 'yyyy-MM-dd');
            if (isAfter(cycle.endDate, today)) {
                marked[nextPeriodStart] = {
                    ...marked[nextPeriodStart],
                    startingDay: true,
                    color: '#FFB3D1',
                    textColor: '#FF6B9D',
                    customStyles: {
                        container: {
                            backgroundColor: '#FFB3D1',
                            borderRadius: 8,
                            borderWidth: 2,
                            borderColor: '#FF6B9D',
                            borderStyle: 'dashed',
                        },
                    },
                };
            }
        }

        // Mark ovulation (if cycle exists)
        if (cycle) {
            const ovulationDate = addDays(cycle.endDate, -14);
            if (isAfter(ovulationDate, today)) {
                const ovulationStr = format(ovulationDate, 'yyyy-MM-dd');
                marked[ovulationStr] = {
                    ...marked[ovulationStr],
                    marked: true,
                    dotColor: '#FFD700',
                    customStyles: {
                        container: {
                            borderWidth: 2,
                            borderColor: '#FFD700',
                            borderRadius: 15,
                        },
                    },
                };
            }
        }

        // Mark PMS period
        if (cycle) {
            const pmsStart = addDays(cycle.endDate, -5);
            const pmsEnd = addDays(cycle.endDate, -1);
            let currentDate = pmsStart;

            while (isBefore(currentDate, pmsEnd) || isSameDay(currentDate, pmsEnd)) {
                if (isAfter(currentDate, today)) {
                    const dateStr = format(currentDate, 'yyyy-MM-dd');
                    marked[dateStr] = {
                        ...marked[dateStr],
                        marked: true,
                        dotColor: '#FFA500',
                        customStyles: {
                            container: {
                                borderWidth: 1,
                                borderColor: '#FFA500',
                                borderRadius: 4,
                            },
                        },
                    };
                }
                currentDate = addDays(currentDate, 1);
            }
        }

        // Mark selected date
        if (selectedDate) {
            const selectedStr = format(selectedDate, 'yyyy-MM-dd');
            marked[selectedStr] = {
                ...marked[selectedStr],
                selected: true,
                selectedColor: '#007AFF',
            };
        }

        setMarkedDates(marked);
    };

    const handleDayPress = (day: DateData) => {
        const selectedDate = new Date(day.dateString);
        onDateSelect?.(selectedDate);
    };

    return (
        <ThemedView style={styles.container}>
            <Calendar
                style={styles.calendar}
                theme={{
                    backgroundColor: 'transparent',
                    calendarBackground: 'transparent',
                    textSectionTitleColor: colors.tint,
                    selectedDayBackgroundColor: colors.tint,
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: colors.tint,
                    dayTextColor: colors.text,
                    textDisabledColor: colors.icon,
                    dotColor: colors.tint,
                    selectedDotColor: '#ffffff',
                    arrowColor: colors.tint,
                    disabledArrowColor: colors.icon,
                    monthTextColor: colors.text,
                    indicatorColor: colors.tint,
                    textDayFontWeight: '300',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '300',
                    textDayFontSize: 16,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 13,
                }}
                markedDates={markedDates}
                onDayPress={handleDayPress}
                markingType="custom"
            />

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#FF6B9D' }]} />
                    <Text style={[styles.legendText, { color: colors.text }]}>Period</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#FFB3D1', borderWidth: 2, borderColor: '#FF6B9D', borderStyle: 'dashed' }]} />
                    <Text style={[styles.legendText, { color: colors.text }]}>Predicted</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { borderWidth: 2, borderColor: '#FFD700' }]} />
                    <Text style={[styles.legendText, { color: colors.text }]}>Ovulation</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { borderWidth: 1, borderColor: '#FFA500' }]} />
                    <Text style={[styles.legendText, { color: colors.text }]}>PMS</Text>
                </View>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    calendar: {
        borderRadius: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
        flexWrap: 'wrap',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 8,
    },
    legendText: {
        fontSize: 12,
    },
});
