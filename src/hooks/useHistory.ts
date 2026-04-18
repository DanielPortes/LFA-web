import { useState, useCallback, useEffect, useRef } from 'react';

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
    const historyRef = useRef(history);

    // Debounce timer for grouping rapid changes
    const debounceTimer = useRef<number | null>(null);
    const pendingState = useRef<{ value: T } | null>(null);
    const groupBaseState = useRef<{ value: T } | null>(null);

    const updateHistory = useCallback((updater: (previous: HistoryState<T>) => HistoryState<T>) => {
        setHistory((previous) => {
            const next = updater(previous);
            historyRef.current = next;
            return next;
        });
    }, []);

    const clearPendingCommit = useCallback(() => {
        if (debounceTimer.current !== null) {
            window.clearTimeout(debounceTimer.current);
            debounceTimer.current = null;
        }
        pendingState.current = null;
        groupBaseState.current = null;
    }, []);

    useEffect(() => {
        historyRef.current = history;
    }, [history]);

    useEffect(() => clearPendingCommit, [clearPendingCommit]);

    const set = useCallback((newState: T, recordHistory = true) => {
        if (newState === historyRef.current.present) {
            return;
        }

        if (!recordHistory) {
            clearPendingCommit();
            updateHistory((previous) => {
                if (previous.present === newState) return previous;
                return { ...previous, present: newState };
            });
            return;
        }

        if (groupBaseState.current === null) {
            groupBaseState.current = { value: historyRef.current.present };
        }
        pendingState.current = { value: newState };
        if (debounceTimer.current !== null) {
            window.clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = window.setTimeout(() => {
            const pending = pendingState.current;
            const base = groupBaseState.current;
            clearPendingCommit();
            if (!pending || !base || pending.value === base.value) {
                return;
            }

            updateHistory((previous) => {
                const nextPast = [...previous.past, base.value].slice(-maxHistory);
                return {
                    past: nextPast,
                    present: pending.value,
                    future: []
                };
            });
        }, 300);

        updateHistory((previous) => {
            if (previous.present === newState) return previous;
            return { ...previous, present: newState };
        });
    }, [clearPendingCommit, maxHistory, updateHistory]);

    const undo = useCallback(() => {
        clearPendingCommit();
        updateHistory((previous) => {
            if (previous.past.length === 0) return previous;

            const nextPresent = previous.past[previous.past.length - 1];
            const nextPast = previous.past.slice(0, -1);

            return {
                past: nextPast,
                present: nextPresent,
                future: [previous.present, ...previous.future]
            };
        });
    }, [clearPendingCommit, updateHistory]);

    const redo = useCallback(() => {
        clearPendingCommit();
        updateHistory((previous) => {
            if (previous.future.length === 0) return previous;

            const nextPresent = previous.future[0];
            const nextFuture = previous.future.slice(1);

            return {
                past: [...previous.past, previous.present],
                present: nextPresent,
                future: nextFuture
            };
        });
    }, [clearPendingCommit, updateHistory]);

    const clear = useCallback(() => {
        clearPendingCommit();
        updateHistory((previous) => ({
            past: [],
            present: previous.present,
            future: []
        }));
    }, [clearPendingCommit, updateHistory]);

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
