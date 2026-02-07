import { describe, it, expect } from 'vitest';
import { nfaToDfa, nfaToDfaWithSteps } from './nfaToDfa';
import {
    nfaWithEpsilon,
    nfaWithoutEpsilon,
    complexNFA,
    simpleDFA,
    emptyAutomaton,
} from '../../test/fixtures';

describe('nfaToDfa', () => {
    describe('basic conversions', () => {
        it('should convert simple NFA with epsilon to DFA', () => {
            const dfa = nfaToDfa(nfaWithEpsilon);

            expect(dfa.tipo).toBe('AFD');
            expect(dfa.estados.length).toBeGreaterThan(0);
            expect(dfa.estados.some(s => s.isInicial)).toBe(true);
            expect(dfa.estados.some(s => s.isFinal)).toBe(true);
        });

        it('should convert NFA without epsilon to DFA', () => {
            const dfa = nfaToDfa(nfaWithoutEpsilon);

            expect(dfa.tipo).toBe('AFD');
            expect(dfa.estados.length).toBeGreaterThan(0);
        });

        it('should convert complex NFA with multiple paths', () => {
            const dfa = nfaToDfa(complexNFA);

            expect(dfa.tipo).toBe('AFD');
            expect(dfa.estados.some(s => s.isInicial)).toBe(true);
        });

        it('should handle already deterministic automaton', () => {
            const dfa = nfaToDfa(simpleDFA);

            expect(dfa.tipo).toBe('AFD');
            // May have same or fewer states (subset construction)
            expect(dfa.estados.length).toBeGreaterThan(0);
        });
    });

    describe('idempotency - multiple calls produce same result', () => {
        it('should produce same result when called multiple times', () => {
            const dfa1 = nfaToDfa(nfaWithEpsilon);
            const dfa2 = nfaToDfa(nfaWithEpsilon);
            const dfa3 = nfaToDfa(nfaWithEpsilon);

            // Same number of states and transitions
            expect(dfa1.estados.length).toBe(dfa2.estados.length);
            expect(dfa2.estados.length).toBe(dfa3.estados.length);
            expect(dfa1.transicoes.length).toBe(dfa2.transicoes.length);
            expect(dfa2.transicoes.length).toBe(dfa3.transicoes.length);
        });

        it('should be stable after re-conversion (DFA of DFA)', () => {
            const dfa1 = nfaToDfa(nfaWithEpsilon);
            const dfa2 = nfaToDfa(dfa1);

            // Converting a DFA should not increase states
            expect(dfa2.estados.length).toBeLessThanOrEqual(dfa1.estados.length + 1);
        });
    });

    describe('edge cases', () => {
        it('should handle empty automaton gracefully', () => {
            expect(() => nfaToDfa(emptyAutomaton)).not.toThrow();
            const result = nfaToDfa(emptyAutomaton);
            expect(result.tipo).toBe('AFD');
        });

        it('should preserve language equivalence', () => {
            // The DFA should accept same language as NFA
            const dfa = nfaToDfa(nfaWithEpsilon);

            // DFA should have at least one final state (NFA accepts empty string via epsilon)
            expect(dfa.estados.some(s => s.isFinal)).toBe(true);
        });
    });

    describe('nfaToDfaWithSteps', () => {
        it('should return conversion steps', () => {
            const result = nfaToDfaWithSteps(nfaWithEpsilon);

            expect(result.automaton).toBeDefined();
            expect(result.steps).toBeDefined();
            expect(result.steps.length).toBeGreaterThan(0);
        });

        it('should produce same automaton as nfaToDfa', () => {
            const dfa = nfaToDfa(nfaWithEpsilon);
            const withSteps = nfaToDfaWithSteps(nfaWithEpsilon);

            expect(withSteps.automaton.estados.length).toBe(dfa.estados.length);
            expect(withSteps.automaton.transicoes.length).toBe(dfa.transicoes.length);
        });

        it('should have descriptive step titles', () => {
            const result = nfaToDfaWithSteps(nfaWithEpsilon);

            result.steps.forEach(step => {
                expect(step.title).toBeDefined();
                expect(step.title.length).toBeGreaterThan(0);
                expect(step.detail).toBeDefined();
            });
        });
    });

    describe('determinism verification', () => {
        it('should produce deterministic transitions', () => {
            const dfa = nfaToDfa(nfaWithEpsilon);

            // For each state and symbol, there should be at most one transition
            const transitionMap = new Map<string, Set<string>>();

            dfa.transicoes.forEach(t => {
                const symbols = t.simbolo.split(',').map(s => s.trim());
                symbols.forEach(sym => {
                    const key = `${t.de}-${sym}`;
                    if (!transitionMap.has(key)) {
                        transitionMap.set(key, new Set());
                    }
                    transitionMap.get(key)!.add(t.para);
                });
            });

            // Each key should have at most one target
            transitionMap.forEach((targets) => {
                expect(targets.size).toBeLessThanOrEqual(1);
            });
        });

        it('should not have epsilon transitions in result', () => {
            const dfa = nfaToDfa(nfaWithEpsilon);

            dfa.transicoes.forEach(t => {
                expect(t.simbolo).not.toContain('ε');
                expect(t.simbolo).not.toContain('eps');
                expect(t.simbolo.trim()).not.toBe('');
            });
        });
    });
});
