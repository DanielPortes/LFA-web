import { useCallback, useState } from 'react';

const resolveInitialValue = <T>(value: T | (() => T)) =>
    typeof value === 'function' ? (value as () => T)() : value;

export const useLocalStorageState = <T>(
    key: string,
    initialValue: T | (() => T),
    options: { readOnInit?: boolean } = {}
) => {
    const { readOnInit = true } = options;
    const [state, setState] = useState<T>(() => {
        if (typeof window === 'undefined') return resolveInitialValue(initialValue);
        if (readOnInit) {
            try {
                const stored = localStorage.getItem(key);
                if (stored !== null) {
                    return JSON.parse(stored) as T;
                }
            } catch {
                // ignore storage errors
            }
        }
        return resolveInitialValue(initialValue);
    });

    const setValue = useCallback((value: T | ((prev: T) => T)) => {
        setState(prev => {
            const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
            try {
                localStorage.setItem(key, JSON.stringify(next));
            } catch {
                // ignore storage errors
            }
            return next;
        });
    }, [key]);

    return [state, setValue] as const;
};
