import { createContext } from 'react';
import type { SimulatorLayout } from '../features/simulator/types';

export type UiSettings = {
    focusMode: boolean;
    cursorEnabled: boolean;
    reduceMotion: boolean;
    effectiveReduceMotion: boolean;
    snapToGrid: boolean;
    simulatorLayout: SimulatorLayout;
    inputTokenization: 'auto' | 'char' | 'separator';
    inputSeparator: string;
    setFocusMode: (value: boolean) => void;
    setCursorEnabled: (value: boolean) => void;
    setReduceMotion: (value: boolean) => void;
    setSnapToGrid: (value: boolean) => void;
    setSimulatorLayout: (value: SimulatorLayout) => void;
    setInputTokenization: (value: 'auto' | 'char' | 'separator') => void;
    setInputSeparator: (value: string) => void;
};

export const UI_SETTINGS_STORAGE_KEY = 'lfa-ui-settings';

export const UiSettingsContext = createContext<UiSettings | null>(null);
