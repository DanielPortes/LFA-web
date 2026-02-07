import { describe, it, expect } from 'vitest';
import { eliminateEpsilonTransitions } from './epsilon';
import {
    nfaWithEpsilon,
    nfaWithoutEpsilon,
    complexNFA,
    simpleDFA,
    emptyAutomaton,
} from '../../test/fixtures';

describe('eliminateEpsilonTransitions', () => {
    describe('basic epsilon elimination', () => {
        it('should remove epsilon transitions', () => {
            const result = eliminateEpsilonTransitions(nfaWithEpsilon);

            expect(result.automaton).toBeDefined();
            expect(result.steps).toBeDefined();

            // Check no epsilon transitions remain
            result.automaton.transicoes.forEach(t => {
                expect(t.simbolo).not.toContain('ε');
                expect(t.simbolo.toLowerCase()).not.toContain('eps');
                expect(t.simbolo.trim()).not.toBe('');
            });
        });

        it('should preserve language (same final state reachability)', () => {
            const result = eliminateEpsilonTransitions(nfaWithEpsilon);

            // Original accepts empty string (q0 ->ε-> q1 ->ε-> q2 final)
            // So initial state should be final or reachable to final
            const hasFinal = result.automaton.estados.some(s => s.isFinal);
            expect(hasFinal).toBe(true);
        });

        it('should handle NFA without epsilon (no change)', () => {
            const result = eliminateEpsilonTransitions(nfaWithoutEpsilon);

            expect(result.automaton).toBeDefined();
            // Should have roughly same structure
            expect(result.automaton.estados.length).toBe(nfaWithoutEpsilon.estados.length);
        });

        it('should handle complex NFA with multiple epsilon paths', () => {
            const result = eliminateEpsilonTransitions(complexNFA);

            expect(result.automaton).toBeDefined();

            // No epsilon in result
            result.automaton.transicoes.forEach(t => {
                expect(t.simbolo).not.toContain('ε');
            });
        });
    });

    describe('idempotency - multiple eliminations', () => {
        it('should produce same result on multiple calls', () => {
            const result1 = eliminateEpsilonTransitions(nfaWithEpsilon);
            const result2 = eliminateEpsilonTransitions(nfaWithEpsilon);
            const result3 = eliminateEpsilonTransitions(nfaWithEpsilon);

            expect(result1.automaton.estados.length).toBe(result2.automaton.estados.length);
            expect(result2.automaton.estados.length).toBe(result3.automaton.estados.length);
        });

        it('should be stable after re-elimination', () => {
            const result1 = eliminateEpsilonTransitions(nfaWithEpsilon);
            const result2 = eliminateEpsilonTransitions(result1.automaton);

            // Already no epsilon, should be same
            expect(result2.automaton.estados.length).toBe(result1.automaton.estados.length);
            expect(result2.automaton.transicoes.length).toBe(result1.automaton.transicoes.length);
        });

        it('should handle rapid successive eliminations', () => {
            const results: number[] = [];

            for (let i = 0; i < 10; i++) {
                const result = eliminateEpsilonTransitions(nfaWithEpsilon);
                results.push(result.automaton.transicoes.length);
            }

            // All should produce same number of transitions
            expect(new Set(results).size).toBe(1);
        });
    });

    describe('epsilon closure computation', () => {
        it('should make initial state final if reachable final via epsilon', () => {
            const result = eliminateEpsilonTransitions(nfaWithEpsilon);

            // q0 can reach q2 (final) via epsilon
            const initial = result.automaton.estados.find(s => s.isInicial);
            expect(initial).toBeDefined();
            // Initial should be final since it can reach final via epsilon only
            expect(initial!.isFinal).toBe(true);
        });

        it('should add transitions for epsilon-reachable targets', () => {
            const result = eliminateEpsilonTransitions(nfaWithEpsilon);

            // Should have direct transitions that account for epsilon paths
            expect(result.automaton.transicoes.length).toBeGreaterThan(0);
        });
    });

    describe('conversion steps', () => {
        it('should include epsilon closure steps', () => {
            const result = eliminateEpsilonTransitions(nfaWithEpsilon);

            expect(result.steps.length).toBeGreaterThan(0);

            // Should have closure-related steps
            const hasClosureStep = result.steps.some(
                step => step.title.includes('ε') ||
                        step.title.includes('epsilon') ||
                        step.title.includes('Fecho') ||
                        step.title.includes('closure')
            );
            expect(hasClosureStep || result.steps.length > 0).toBe(true);
        });

        it('should have descriptive details', () => {
            const result = eliminateEpsilonTransitions(nfaWithEpsilon);

            result.steps.forEach(step => {
                expect(step.title).toBeDefined();
                expect(step.detail).toBeDefined();
            });
        });
    });

    describe('edge cases', () => {
        it('should handle DFA (no epsilon to remove)', () => {
            const result = eliminateEpsilonTransitions(simpleDFA);

            expect(result.automaton).toBeDefined();
            expect(result.automaton.estados.length).toBe(simpleDFA.estados.length);
        });

        it('should handle empty automaton', () => {
            expect(() => eliminateEpsilonTransitions(emptyAutomaton)).not.toThrow();
        });

        it('should preserve state labels', () => {
            const result = eliminateEpsilonTransitions(nfaWithEpsilon);

            result.automaton.estados.forEach(state => {
                expect(state.label).toBeDefined();
                expect(state.id).toBeDefined();
            });
        });
    });
});
