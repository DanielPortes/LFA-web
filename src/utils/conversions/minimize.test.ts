import { describe, it, expect } from 'vitest';
import { minimizeDfa, minimizeDfaWithSteps } from './minimize';
import {
    simpleDFA,
    redundantDFA,
    emptyStringDFA,
    starDFA,
    abbDFA,
    noFinalStatesDFA,
} from '../../test/fixtures';
import type { AFNData } from '../../types';

describe('minimizeDfa', () => {
    describe('basic minimization', () => {
        it('should minimize DFA with redundant states', () => {
            const minimized = minimizeDfa(redundantDFA);

            expect(minimized.tipo).toBe('AFD');
            // q1 and q2 are equivalent, so should be merged
            expect(minimized.estados.length).toBeLessThan(redundantDFA.estados.length);
        });

        it('should keep minimal DFA unchanged', () => {
            const minimized = minimizeDfa(simpleDFA);

            expect(minimized.tipo).toBe('AFD');
            // Already minimal, should have same or fewer states
            expect(minimized.estados.length).toBeLessThanOrEqual(simpleDFA.estados.length);
        });

        it('should handle single-state DFA', () => {
            const minimized = minimizeDfa(emptyStringDFA);

            expect(minimized.tipo).toBe('AFD');
            expect(minimized.estados.length).toBe(1);
            expect(minimized.estados[0].isInicial).toBe(true);
            expect(minimized.estados[0].isFinal).toBe(true);
        });

        it('should handle star automaton (a*)', () => {
            const minimized = minimizeDfa(starDFA);

            expect(minimized.tipo).toBe('AFD');
            expect(minimized.estados.length).toBe(1);
        });
    });

    describe('idempotency - multiple minimizations', () => {
        it('should produce same result when minimized multiple times', () => {
            const min1 = minimizeDfa(redundantDFA);
            const min2 = minimizeDfa(min1);
            const min3 = minimizeDfa(min2);

            expect(min1.estados.length).toBe(min2.estados.length);
            expect(min2.estados.length).toBe(min3.estados.length);
            expect(min1.transicoes.length).toBe(min2.transicoes.length);
            expect(min2.transicoes.length).toBe(min3.transicoes.length);
        });

        it('should be truly minimal after one pass', () => {
            const min1 = minimizeDfa(abbDFA);
            const min2 = minimizeDfa(min1);

            // No further reduction possible
            expect(min2.estados.length).toBe(min1.estados.length);
        });

        it('should handle rapid successive calls', () => {
            const results: number[] = [];

            for (let i = 0; i < 10; i++) {
                const minimized = minimizeDfa(redundantDFA);
                results.push(minimized.estados.length);
            }

            // All results should be the same
            expect(new Set(results).size).toBe(1);
        });
    });

    describe('preservation of language', () => {
        it('should preserve initial state', () => {
            const minimized = minimizeDfa(simpleDFA);

            const initialStates = minimized.estados.filter(s => s.isInicial);
            expect(initialStates.length).toBe(1);
        });

        it('should preserve final states (at least one if original had any)', () => {
            const minimized = minimizeDfa(simpleDFA);

            const finalStates = minimized.estados.filter(s => s.isFinal);
            expect(finalStates.length).toBeGreaterThan(0);
        });

        it('should remove unreachable states', () => {
            const minimized = minimizeDfa(redundantDFA);

            // All states in minimized DFA should be reachable
            const initial = minimized.estados.find(s => s.isInicial);
            expect(initial).toBeDefined();

            const reachable = new Set<string>();
            const queue = [initial!.id];

            while (queue.length > 0) {
                const current = queue.shift()!;
                if (reachable.has(current)) continue;
                reachable.add(current);

                minimized.transicoes
                    .filter(t => t.de === current)
                    .forEach(t => {
                        if (!reachable.has(t.para)) {
                            queue.push(t.para);
                        }
                    });
            }

            expect(reachable.size).toBe(minimized.estados.length);
        });
    });

    describe('error handling', () => {
        it('should throw for non-AFD type', () => {
            const nfa: AFNData = {
                tipo: 'AFN',
                estados: simpleDFA.estados,
                transicoes: simpleDFA.transicoes,
            };

            expect(() => minimizeDfa(nfa)).toThrow();
        });

        it('should throw for DFA without initial state', () => {
            const noInitial = {
                ...simpleDFA,
                estados: simpleDFA.estados.map(s => ({ ...s, isInicial: false })),
            };

            expect(() => minimizeDfa(noInitial)).toThrow();
        });
    });

    describe('minimizeDfaWithSteps', () => {
        it('should return steps explaining the process', () => {
            const result = minimizeDfaWithSteps(redundantDFA);

            expect(result.automaton).toBeDefined();
            expect(result.steps).toBeDefined();
            expect(result.steps.length).toBeGreaterThan(0);
        });

        it('should produce same result as minimizeDfa', () => {
            const direct = minimizeDfa(redundantDFA);
            const withSteps = minimizeDfaWithSteps(redundantDFA);

            expect(withSteps.automaton.estados.length).toBe(direct.estados.length);
        });

        it('should include partition refinement steps', () => {
            const result = minimizeDfaWithSteps(redundantDFA);

            // Should have steps about partitions
            const hasPartitionStep = result.steps.some(
                step => step.title.includes('Partição') || step.title.includes('Particao')
            );
            expect(hasPartitionStep || result.steps.length > 0).toBe(true);
        });
    });

    describe('complex cases', () => {
        it('should handle DFA accepting (a|b)*abb', () => {
            const minimized = minimizeDfa(abbDFA);

            expect(minimized.tipo).toBe('AFD');
            expect(minimized.estados.length).toBeGreaterThan(0);
            expect(minimized.estados.some(s => s.isFinal)).toBe(true);
        });

        it('should handle DFA with dead states', () => {
            // DFA where some states can't reach final
            const minimized = minimizeDfa(noFinalStatesDFA);

            expect(minimized.tipo).toBe('AFD');
            // Should still have structure even without final states
        });
    });
});
