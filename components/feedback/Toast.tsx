import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface ToastProps {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
    onHide: () => void;
    duration?: number;
}

export function Toast({ visible, message, type, onHide, duration = 3000 }: ToastProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        if (visible) {
            // Show toast
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            // Auto hide after duration
            const timer = setTimeout(() => {
                hideToast();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hideToast = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            onHide();
        });
    };

    if (!visible) return null;

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return '#4CAF50';
            case 'error':
                return '#F44336';
            case 'info':
                return '#2196F3';
            default:
                return colors.background;
        }
    };

    return (
        <Animated.View
            style={[
                styles.toast,
                {
                    backgroundColor: getBackgroundColor(),
                    opacity: fadeAnim,
                },
            ]}
        >
            <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    toast: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        padding: 16,
        borderRadius: 8,
        zIndex: 9999,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    toastText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
});
