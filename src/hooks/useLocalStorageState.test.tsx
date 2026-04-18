// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLocalStorageState } from './useLocalStorageState';

describe('useLocalStorageState', () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        window.localStorage.clear();
    });

    it('adianta a atualização em memória e atrasa a persistência quando configurado', () => {
        const { result } = renderHook(() => useLocalStorageState('simulator', 'inicial', {
            writeDelayMs: 200
        }));

        act(() => {
            result.current[1]('novo');
        });

        expect(result.current[0]).toBe('novo');
        expect(window.localStorage.getItem('simulator')).toBeNull();

        act(() => {
            vi.advanceTimersByTime(199);
        });

        expect(window.localStorage.getItem('simulator')).toBeNull();

        act(() => {
            vi.advanceTimersByTime(1);
        });

        expect(window.localStorage.getItem('simulator')).toBe('"novo"');
    });

    it('faz flush da escrita pendente ao desmontar o hook', () => {
        const { result, unmount } = renderHook(() => useLocalStorageState('simulator', 'inicial', {
            writeDelayMs: 200
        }));

        act(() => {
            result.current[1]('rascunho');
        });

        expect(window.localStorage.getItem('simulator')).toBeNull();

        unmount();

        expect(window.localStorage.getItem('simulator')).toBe('"rascunho"');
    });

    it('faz flush da escrita pendente em pagehide', () => {
        const { result } = renderHook(() => useLocalStorageState('simulator', 'inicial', {
            writeDelayMs: 200
        }));

        act(() => {
            result.current[1]('rascunho');
        });

        act(() => {
            window.dispatchEvent(new Event('pagehide'));
        });

        expect(window.localStorage.getItem('simulator')).toBe('"rascunho"');
    });
});
