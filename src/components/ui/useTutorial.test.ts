// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTutorial } from './useTutorial';

describe('useTutorial', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('não abre o tutorial automaticamente ao carregar a aplicação', () => {
        const { result } = renderHook(() => useTutorial());

        act(() => {
            vi.advanceTimersByTime(1500);
        });

        expect(result.current.showTutorial).toBe(false);
    });

    it('continua permitindo abrir e concluir o tutorial manualmente', () => {
        const { result } = renderHook(() => useTutorial());

        act(() => {
            result.current.setShowTutorial(true);
        });

        expect(result.current.showTutorial).toBe(true);

        act(() => {
            result.current.completeTutorial();
        });

        expect(result.current.showTutorial).toBe(false);
        expect(localStorage.getItem('lfa-tutorial-completed')).toBe('true');
    });
});
