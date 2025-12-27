import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type UiSettings = {
    focusMode: boolean;
    cursorEnabled: boolean;
    reduceMotion: boolean;
    effectiveReduceMotion: boolean;
    snapToGrid: boolean;
    setFocusMode: (value: boolean) => void;
    setCursorEnabled: (value: boolean) => void;
    setReduceMotion: (value: boolean) => void;
    setSnapToGrid: (value: boolean) => void;
};

const STORAGE_KEY = 'lfa-ui-settings';

const UiSettingsContext = createContext<UiSettings | null>(null);

export const UiSettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [focusMode, setFocusMode] = useState(false);
    const [cursorEnabled, setCursorEnabled] = useState(true);
    const [reduceMotion, setReduceMotion] = useState(false);
    const [snapToGrid, setSnapToGrid] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(media.matches);
        const handler = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
        media.addEventListener('change', handler);
        return () => media.removeEventListener('change', handler);
    }, []);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved) as {
                    focusMode?: boolean;
                    cursorEnabled?: boolean;
                    reduceMotion?: boolean;
                    snapToGrid?: boolean;
                };
                setFocusMode(!!parsed.focusMode);
                setCursorEnabled(parsed.cursorEnabled !== false);
                setReduceMotion(!!parsed.reduceMotion);
                setSnapToGrid(!!parsed.snapToGrid);
            }
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                focusMode,
                cursorEnabled,
                reduceMotion,
                snapToGrid
            }));
        } catch {
            // ignore
        }
    }, [focusMode, cursorEnabled, reduceMotion, snapToGrid]);

    const effectiveReduceMotion = reduceMotion || prefersReducedMotion;

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('focus-mode', focusMode);
        root.classList.toggle('reduce-motion', effectiveReduceMotion);
    }, [focusMode, effectiveReduceMotion]);

    const value = useMemo(() => ({
        focusMode,
        cursorEnabled,
        reduceMotion,
        effectiveReduceMotion,
        snapToGrid,
        setFocusMode,
        setCursorEnabled,
        setReduceMotion,
        setSnapToGrid
    }), [focusMode, cursorEnabled, reduceMotion, effectiveReduceMotion, snapToGrid]);

    return (
        <UiSettingsContext.Provider value={value}>
            {children}
        </UiSettingsContext.Provider>
    );
};

export const useUiSettings = () => {
    const context = useContext(UiSettingsContext);
    if (!context) throw new Error('useUiSettings must be used within UiSettingsProvider');
    return context;
};
