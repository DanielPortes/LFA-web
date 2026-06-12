import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AutomatoData } from '../types';
import { useAutomatonSimulation } from './useAutomatonSimulation';

const replayableTuringMachine: AutomatoData = {
    tipo: 'MT',
    estados: [
        { id: 'q0', label: 'q0', x: 120, y: 120, isInicial: true, isFinal: false },
        { id: 'q1', label: 'q1', x: 260, y: 120, isInicial: false, isFinal: false },
        { id: 'q2', label: 'q2', x: 400, y: 120, isInicial: false, isFinal: false }
    ],
    transicoes: [
        { id: 't-start', de: 'q0', para: 'q1', simbolo: 'START -> START, R', curvatura: 0 },
        { id: 't-blank', de: 'q1', para: 'q2', simbolo: 'BLANK -> BLANK, R', curvatura: 0 }
    ]
};

const tokenization = { mode: 'auto' as const, separator: ' ' };
const basicAutomaton: AutomatoData = {
    tipo: 'AFD',
    estados: [
        { id: 'q0', label: 'q0', x: 120, y: 120, isInicial: true, isFinal: true }
    ],
    transicoes: []
};

describe('useAutomatonSimulation (Turing history controls)', () => {
    it('does not reject replayed path after stepBack', () => {
        const { result } = renderHook(() =>
            useAutomatonSimulation(
                replayableTuringMachine,
                '',
                tokenization,
                { turingMaxSteps: 32, turingDetectLoops: true }
            )
        );

        act(() => {
            result.current.resetSimulation();
        });
        act(() => {
            result.current.step();
        });
        act(() => {
            result.current.step();
        });

        expect(result.current.simulationState?.activeStates).toEqual(['q2']);
        expect(result.current.simulationState?.status).toBe('running');

        act(() => {
            result.current.stepBack();
        });

        expect(result.current.simulationState?.activeStates).toEqual(['q1']);
        expect(result.current.simulationState?.status).toBe('running');

        let replayResult: { finished: boolean; accepted?: boolean } | undefined;
        act(() => {
            replayResult = result.current.step();
        });

        expect(replayResult?.finished).toBe(false);
        expect(result.current.simulationState?.activeStates).toEqual(['q2']);
        expect(result.current.simulationState?.status).toBe('running');
    });

    it('does not reject replayed path after goToStart', () => {
        const { result } = renderHook(() =>
            useAutomatonSimulation(
                replayableTuringMachine,
                '',
                tokenization,
                { turingMaxSteps: 32, turingDetectLoops: true }
            )
        );

        act(() => {
            result.current.resetSimulation();
        });
        act(() => {
            result.current.step();
        });
        act(() => {
            result.current.step();
        });

        expect(result.current.simulationState?.activeStates).toEqual(['q2']);

        act(() => {
            result.current.goToStart();
        });

        expect(result.current.simulationState?.activeStates).toEqual(['q0']);
        expect(result.current.history).toHaveLength(3);
        expect(result.current.currentHistoryIndex).toBe(0);

        let replayResult: { finished: boolean; accepted?: boolean } | undefined;
        act(() => {
            replayResult = result.current.step();
        });

        expect(replayResult?.finished).toBe(false);
        expect(result.current.simulationState?.activeStates).toEqual(['q1']);
        expect(result.current.simulationState?.status).toBe('running');
    });

    it('jumps directly to a history step and keeps the replay path valid', () => {
        const { result } = renderHook(() =>
            useAutomatonSimulation(
                replayableTuringMachine,
                '',
                tokenization,
                { turingMaxSteps: 32, turingDetectLoops: true }
            )
        );

        act(() => {
            result.current.resetSimulation();
        });
        act(() => {
            result.current.step();
        });
        act(() => {
            result.current.step();
        });

        expect(result.current.simulationState?.activeStates).toEqual(['q2']);
        expect(result.current.history).toHaveLength(3);

        act(() => {
            result.current.goToHistoryStep(1);
        });

        expect(result.current.simulationState?.activeStates).toEqual(['q1']);
        expect(result.current.history).toHaveLength(3);
        expect(result.current.currentHistoryIndex).toBe(1);

        let replayResult: { finished: boolean; accepted?: boolean } | undefined;
        act(() => {
            replayResult = result.current.step();
        });

        expect(replayResult?.finished).toBe(false);
        expect(result.current.simulationState?.activeStates).toEqual(['q2']);
        expect(result.current.simulationState?.status).toBe('running');
        expect(result.current.history).toHaveLength(3);
        expect(result.current.currentHistoryIndex).toBe(2);
    });
});

describe('useAutomatonSimulation (tokenization stability)', () => {
    it('keeps inputTokens reference stable when config values are unchanged', () => {
        const { result, rerender } = renderHook(
            ({ config }) => useAutomatonSimulation(basicAutomaton, 'a b', config),
            {
                initialProps: {
                    config: { mode: 'separator' as const, separator: ' ' }
                }
            }
        );

        const firstTokens = result.current.inputTokens;

        rerender({
            config: { mode: 'separator' as const, separator: ' ' }
        });

        expect(result.current.inputTokens).toBe(firstTokens);
    });
});
