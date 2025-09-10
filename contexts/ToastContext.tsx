import React, { createContext, ReactNode, useContext, useState } from 'react';

interface ToastContextType {
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
    hideToast: () => void;
    toast: {
        visible: boolean;
        message: string;
        type: 'success' | 'error' | 'info';
    };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState({
        visible: false,
        message: '',
        type: 'info' as 'success' | 'error' | 'info',
    });

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({
            visible: true,
            message,
            type,
        });
    };

    const hideToast = () => {
        setToast(prev => ({
            ...prev,
            visible: false,
        }));
    };

    return (
        <ToastContext.Provider value={{ showToast, hideToast, toast }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
