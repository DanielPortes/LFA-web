import { useCallback, useEffect, useRef, useState } from 'react';

const resolveInitialValue = <T>(value: T | (() => T)) =>
    typeof value === 'function' ? (value as () => T)() : value;

interface UseLocalStorageStateOptions {
    readOnInit?: boolean;
    writeDelayMs?: number;
}

export const useLocalStorageState = <T>(
    key: string,
    initialValue: T | (() => T),
    options: UseLocalStorageStateOptions = {}
) => {
    const { readOnInit = true, writeDelayMs = 0 } = options;
    const [initialSnapshot] = useState(() => {
        if (typeof window === 'undefined') {
            return {
                value: resolveInitialValue(initialValue),
                persisted: null
            };
        }
        if (readOnInit) {
            try {
                const stored = localStorage.getItem(key);
                if (stored !== null) {
                    return {
                        value: JSON.parse(stored) as T,
                        persisted: { key, serialized: stored }
                    };
                }
            } catch {
                // ignore storage errors
            }
        }

        const resolved = resolveInitialValue(initialValue);
        try {
            const serialized = JSON.stringify(resolved);
            if (localStorage.getItem(key) === serialized) {
                return {
                    value: resolved,
                    persisted: { key, serialized }
                };
            }
        } catch {
            // ignore storage errors
        }
        return {
            value: resolved,
            persisted: null
        };
    });
    const lastPersistedRef = useRef<{ key: string; serialized: string } | null>(initialSnapshot.persisted);
    const [state, setState] = useState<T>(initialSnapshot.value);
    const pendingWriteRef = useRef<{ key: string; snapshot: T } | null>(null);

    const persistSnapshot = useCallback((targetKey: string, snapshot: T) => {
        try {
            const serialized = JSON.stringify(snapshot);
            if (
                lastPersistedRef.current?.key === targetKey
                && lastPersistedRef.current.serialized === serialized
            ) {
                return;
            }

            localStorage.setItem(targetKey, serialized);
            lastPersistedRef.current = { key: targetKey, serialized };
        } catch {
            // ignore storage errors
        }
    }, []);

    const flushPendingWrite = useCallback(() => {
        if (!pendingWriteRef.current) return;

        const pendingWrite = pendingWriteRef.current;
        pendingWriteRef.current = null;
        persistSnapshot(pendingWrite.key, pendingWrite.snapshot);
    }, [persistSnapshot]);

    const setValue = useCallback((value: T | ((prev: T) => T)) => {
        setState((prev) => {
            const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
            if (writeDelayMs > 0) {
                pendingWriteRef.current = { key, snapshot: next };
            } else {
                pendingWriteRef.current = null;
            }
            return next;
        });
    }, [key, writeDelayMs]);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        if (writeDelayMs <= 0) {
            pendingWriteRef.current = null;
            persistSnapshot(key, state);
            return undefined;
        }

        pendingWriteRef.current = { key, snapshot: state };
        const timeout = window.setTimeout(() => {
            flushPendingWrite();
        }, writeDelayMs);
        return () => window.clearTimeout(timeout);
    }, [flushPendingWrite, key, persistSnapshot, state, writeDelayMs]);

    useEffect(() => {
        if (typeof window === 'undefined' || writeDelayMs <= 0) return undefined;

        const handlePageExit = () => {
            flushPendingWrite();
        };

        window.addEventListener('pagehide', handlePageExit);
        window.addEventListener('beforeunload', handlePageExit);

        return () => {
            window.removeEventListener('pagehide', handlePageExit);
            window.removeEventListener('beforeunload', handlePageExit);
            flushPendingWrite();
        };
    }, [flushPendingWrite, writeDelayMs]);

    return [state, setValue] as const;
};
