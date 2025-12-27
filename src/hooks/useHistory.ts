import { useState, useCallback, useRef } from 'react';

interface HistoryState<T> {
    past: T[];
    present: T;
    future: T[];
}

interface UseHistoryResult<T> {
    state: T;
    set: (newState: T, recordHistory?: boolean) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    clear: () => void;
    history: HistoryState<T>;
}

export function useHistory<T>(initialState: T, maxHistory = 50): UseHistoryResult<T> {
    const [history, setHistory] = useState<HistoryState<T>>({
        past: [],
        present: initialState,
        future: []
    });

    // Debounce timer for grouping rapid changes
    const debounceTimer = useRef<number | null>(null);
    const pendingState = useRef<T | null>(null);
    // Track the last committed state to avoid unnecessary updates
    const lastCommittedRef = useRef<T>(initialState);

    const set = useCallback((newState: T, recordHistory = true) => {
        // Skip update if state hasn't changed (shallow comparison)
        if (newState === lastCommittedRef.current) {
            return;
        }

        if (!recordHistory) {
            setHistory(prev => {
                if (prev.present === newState) return prev;
                return { ...prev, present: newState };
            });
            lastCommittedRef.current = newState;
            return;
        }

        // Clear any pending debounced update
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        pendingState.current = newState;

        // Debounce history recording to group rapid changes
        debounceTimer.current = window.setTimeout(() => {
            setHistory(prev => {
                if (pendingState.current === null) return prev;
                const newPast = [...prev.past, prev.present].slice(-maxHistory);
                return {
                    past: newPast,
                    present: pendingState.current!,
                    future: []
                };
            });
            pendingState.current = null;
        }, 300);

        // Immediately update the present state for responsive UI
        setHistory(prev => {
            if (prev.present === newState) return prev;
            return { ...prev, present: newState };
        });
        lastCommittedRef.current = newState;
    }, [maxHistory]);

    const undo = useCallback(() => {
        setHistory(prev => {
            if (prev.past.length === 0) return prev;

            const previous = prev.past[prev.past.length - 1];
            const newPast = prev.past.slice(0, -1);

            return {
                past: newPast,
                present: previous,
                future: [prev.present, ...prev.future]
            };
        });
    }, []);

    const redo = useCallback(() => {
        setHistory(prev => {
            if (prev.future.length === 0) return prev;

            const next = prev.future[0];
            const newFuture = prev.future.slice(1);

            return {
                past: [...prev.past, prev.present],
                present: next,
                future: newFuture
            };
        });
    }, []);

    const clear = useCallback(() => {
        setHistory(prev => ({
            past: [],
            present: prev.present,
            future: []
        }));
    }, []);

    return {
        state: history.present,
        set,
        undo,
        redo,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
        clear,
        history
    };
}
