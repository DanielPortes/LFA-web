// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useHistory } from './useHistory';

describe('useHistory', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('agrupa mudanças rápidas preservando o snapshot anterior para undo', () => {
        const { result } = renderHook(() => useHistory('A'));

        act(() => {
            result.current.set('B');
            result.current.set('C');
        });

        expect(result.current.state).toBe('C');
        expect(result.current.canUndo).toBe(false);

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current.history.past).toEqual(['A']);
        expect(result.current.state).toBe('C');
        expect(result.current.canUndo).toBe(true);

        act(() => {
            result.current.undo();
        });

        expect(result.current.state).toBe('A');
        expect(result.current.canRedo).toBe(true);
    });

    it('cancela commits pendentes quando a atualização não deve entrar no histórico', () => {
        const { result } = renderHook(() => useHistory('A'));

        act(() => {
            result.current.set('B');
            result.current.set('C', false);
        });

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current.state).toBe('C');
        expect(result.current.history.past).toEqual([]);
        expect(result.current.canUndo).toBe(false);
    });
});
