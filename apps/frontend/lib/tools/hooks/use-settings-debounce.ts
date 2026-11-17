'use client';

import { useCallback, useState, useEffect } from 'react';

export interface UseSettingsDebounceOptions<T> {
    /** Initial settings value */
    initialSettings: T;
    /** Debounce delay in milliseconds */
    debounceMs?: number;
}

export interface UseSettingsDebounceReturn<T> {
    /** Current settings (immediate) */
    settings: T;
    /** Debounced settings (delayed) */
    debouncedSettings: T;
    /** Update settings */
    setSettings: React.Dispatch<React.SetStateAction<T>>;
    /** Update a single setting */
    updateSetting: <K extends keyof T>(key: K, value: T[K]) => void;
    /** Reset to initial settings */
    resetSettings: () => void;
}

/**
 * Hook for managing settings with debounce
 * Useful for preventing too many re-renders during rapid adjustments
 */
export function useSettingsDebounce<T>({
    initialSettings,
    debounceMs = 500,
}: UseSettingsDebounceOptions<T>): UseSettingsDebounceReturn<T> {
    const [settings, setSettings] = useState<T>(initialSettings);
    const [debouncedSettings, setDebouncedSettings] = useState<T>(initialSettings);

    // Debounce settings updates
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSettings(settings);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [settings, debounceMs]);

    // Update a single setting
    const updateSetting = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
        setSettings(prev => ({
            ...prev,
            [key]: value,
        }));
    }, []);

    // Reset to initial
    const resetSettings = useCallback(() => {
        setSettings(initialSettings);
        setDebouncedSettings(initialSettings);
    }, [initialSettings]);

    return {
        settings,
        debouncedSettings,
        setSettings,
        updateSetting,
        resetSettings,
    };
}
