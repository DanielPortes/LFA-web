import React, { useEffect, useMemo, useState } from 'react';
import { UI_SETTINGS_STORAGE_KEY, UiSettingsContext } from './uiSettingsStore';
import { isSimulatorLayout } from '../features/simulator/types';

export const UiSettingsProvider = ({ children }: { children: React.ReactNode }) => {
    // Lazy initialization to prevent overwriting storage with defaults on mount
    const [settings, setSettings] = useState(() => {
        try {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem(UI_SETTINGS_STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    return {
                        focusMode: !!parsed.focusMode,
                        reduceMotion: !!parsed.reduceMotion,
                        snapToGrid: !!parsed.snapToGrid,
                        simulatorLayout: isSimulatorLayout(parsed.simulatorLayout) ? parsed.simulatorLayout : 'side',
                        inputTokenization: parsed.inputTokenization || 'auto',
                        inputSeparator: typeof parsed.inputSeparator === 'string' ? parsed.inputSeparator : ' '
                    };
                }
            }
        } catch {
            // ignore
        }
        return {
            focusMode: false,
            reduceMotion: false,
            snapToGrid: false,
            simulatorLayout: 'side',
            inputTokenization: 'auto',
            inputSeparator: ' '
        };
    });

    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // Individual state setters for compatibility
    const setFocusMode = (val: boolean) => setSettings(s => ({ ...s, focusMode: val }));
    const setReduceMotion = (val: boolean) => setSettings(s => ({ ...s, reduceMotion: val }));
    const setSnapToGrid = (val: boolean) => setSettings(s => ({ ...s, snapToGrid: val }));
    const setSimulatorLayout = (val: 'bottom' | 'side' | 'top_side') => setSettings(s => ({ ...s, simulatorLayout: val }));
    const setInputTokenization = (val: 'auto' | 'char' | 'separator') => setSettings(s => ({ ...s, inputTokenization: val }));
    const setInputSeparator = (val: string) => setSettings(s => ({ ...s, inputSeparator: val }));

    const { focusMode, reduceMotion, snapToGrid, simulatorLayout, inputTokenization, inputSeparator } = settings;

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(media.matches);
        const handler = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
        media.addEventListener('change', handler);
        return () => media.removeEventListener('change', handler);
    }, []);

    // Save changes
    useEffect(() => {
        try {
            localStorage.setItem(UI_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        } catch {
            // ignore
        }
    }, [settings]);

    const effectiveReduceMotion = reduceMotion || prefersReducedMotion;

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('focus-mode', focusMode);
        root.classList.toggle('reduce-motion', effectiveReduceMotion);
    }, [focusMode, effectiveReduceMotion]);

    const value = useMemo(() => ({
        focusMode,
        reduceMotion,
        effectiveReduceMotion,
        snapToGrid,
        simulatorLayout,
        inputTokenization,
        inputSeparator,
        setFocusMode,
        setReduceMotion,
        setSnapToGrid,
        setSimulatorLayout,
        setInputTokenization,
        setInputSeparator
    }), [focusMode, reduceMotion, effectiveReduceMotion, snapToGrid, simulatorLayout, inputTokenization, inputSeparator]);

    return (
        <UiSettingsContext.Provider value={value}>
            {children}
        </UiSettingsContext.Provider>
    );
};
