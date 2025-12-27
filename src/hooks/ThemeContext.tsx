/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'lfa-theme';

const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    toggleTheme: () => { }
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            // First check localStorage
            try {
                const saved = localStorage.getItem(THEME_STORAGE_KEY);
                if (saved === 'dark' || saved === 'light') {
                    return saved;
                }
            } catch {
                // ignore
            }
            // Fall back to system preference
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        // Save to localStorage
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch {
            // ignore
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);