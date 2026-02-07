import { useContext } from 'react';
import { UiSettingsContext } from './uiSettingsStore';

export const useUiSettings = () => {
    const context = useContext(UiSettingsContext);
    if (!context) throw new Error('useUiSettings must be used within UiSettingsProvider');
    return context;
};
