import { describe, it, expect } from 'vitest';
import {
    automatonToTuple,
    automatonToTransitionTable,
    automatonToGrammar,
    automatonToRegex,
    automatonToDot,
} from './representations';
import {
    simpleDFA,
    nfaWithEpsilon,
    nfaWithoutEpsilon,
    complexNFA,
    emptyAutomaton,
    emptyStringDFA,
    starDFA,
    plusDFA,
    abbDFA,
    simplePDA,
    noFinalStatesDFA,
    noInitialStatesDFA,
} from '../../test/fixtures';

describe('automatonToTuple', () => {
    describe('basic conversion', () => {
        it('should convert simple DFA to 5-tuple notation', () => {
            const result = automatonToTuple(simpleDFA);

            expect(result).toContain('M = (Q, Sigma, delta, q0, F)');
            expect(result).toContain('Q = {');
            expect(result).toContain('Sigma = {');
            expect(result).toContain('q0 = q0');
            expect(result).toContain('F = {');
            expect(result).toContain('delta:');
        });

        it('should include all states', () => {
            const result = automatonToTuple(simpleDFA);

            expect(result).toContain('q0');
            expect(result).toContain('q1');
        });

        it('should include all transitions', () => {
            const result = automatonToTuple(simpleDFA);

            expect(result).toContain('delta(q0, a) = q0');
            expect(result).toContain('delta(q0, b) = q1');
        });

        it('should handle NFA with epsilon', () => {
            const result = automatonToTuple(nfaWithEpsilon);

            expect(result).toContain('M = (Q, Sigma, delta, q0, F)');
            expect(result).toContain('q0');
            expect(result).toContain('q1');
            expect(result).toContain('q2');
        });

        it('should mark final states correctly', () => {
            const result = automatonToTuple(simpleDFA);

            expect(result).toContain('F = {q1}');
        });
    });

    describe('idempotency', () => {
        it('should produce same result on multiple calls', () => {
            const result1 = automatonToTuple(simpleDFA);
            const result2 = automatonToTuple(simpleDFA);
            const result3 = automatonToTuple(simpleDFA);

            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
        });

        it('should be stable with rapid successive calls', () => {
            const results: string[] = [];

            for (let i = 0; i < 10; i++) {
                results.push(automatonToTuple(simpleDFA));
            }

            expect(new Set(results).size).toBe(1);
        });
    });

    describe('edge cases', () => {
        it('should handle empty automaton', () => {
            const result = automatonToTuple(emptyAutomaton);

            expect(result).toContain('Q = {}');
            expect(result).toContain('F = {}');
        });

        it('should handle single-state DFA', () => {
            const result = automatonToTuple(emptyStringDFA);

            expect(result).toContain('q0');
            expect(result).toContain('F = {q0}');
        });

        it('should throw for PDA', () => {
            expect(() => automatonToTuple(simplePDA)).toThrow('AP');
        });
    });
});

describe('automatonToTransitionTable', () => {
    describe('basic conversion', () => {
        it('should produce CSV format', () => {
            const result = automatonToTransitionTable(simpleDFA);

            expect(result).toContain('from,symbol,to');
            expect(result.split('\n').length).toBeGreaterThan(1);
        });

        it('should include all transitions', () => {
            const result = automatonToTransitionTable(simpleDFA);

            expect(result).toContain('q0,a,q0');
            expect(result).toContain('q0,b,q1');
            expect(result).toContain('q1,a,q0');
            expect(result).toContain('q1,b,q1');
        });

        it('should handle NFA with multiple symbols per transition', () => {
            const result = automatonToTransitionTable(nfaWithoutEpsilon);

            // nfaWithoutEpsilon has 'a,b' transitions that should be expanded
            expect(result).toContain('q0');
        });
    });

    describe('idempotency', () => {
        it('should produce same result on multiple calls', () => {
            const result1 = automatonToTransitionTable(simpleDFA);
            const result2 = automatonToTransitionTable(simpleDFA);

            expect(result1).toBe(result2);
        });

        it('should handle rapid successive calls', () => {
            const results: string[] = [];

            for (let i = 0; i < 10; i++) {
                results.push(automatonToTransitionTable(abbDFA));
            }

            expect(new Set(results).size).toBe(1);
        });
    });

    describe('edge cases', () => {
        it('should handle empty automaton', () => {
            const result = automatonToTransitionTable(emptyAutomaton);

            expect(result).toBe('from,symbol,to');
        });

        it('should throw for PDA', () => {
            expect(() => automatonToTransitionTable(simplePDA)).toThrow('AP');
        });
    });
});

describe('automatonToGrammar', () => {
    describe('basic conversion', () => {
        it('should produce regular grammar format', () => {
            const result = automatonToGrammar(simpleDFA);

            expect(result).toContain('G = (V, Sigma, P, S)');
            expect(result).toContain('V = {');
            expect(result).toContain('Sigma = {');
            expect(result).toContain('P:');
            expect(result).toContain('S =');
        });

        it('should include epsilon for final states', () => {
            const result = automatonToGrammar(simpleDFA);

            // Final state should have epsilon production (may be 'ε' or 'eps')
            const hasEpsilon = result.includes('ε') || result.includes('eps');
            expect(hasEpsilon).toBe(true);
        });

        it('should use S as start symbol for single initial state', () => {
            const result = automatonToGrammar(simpleDFA);

            expect(result).toContain('S =');
        });
    });

    describe('idempotency', () => {
        it('should produce same result on multiple calls', () => {
            const result1 = automatonToGrammar(simpleDFA);
            const result2 = automatonToGrammar(simpleDFA);
            const result3 = automatonToGrammar(simpleDFA);

            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
        });

        it('should handle rapid successive calls', () => {
            const results: string[] = [];

            for (let i = 0; i < 10; i++) {
                results.push(automatonToGrammar(nfaWithoutEpsilon));
            }

            expect(new Set(results).size).toBe(1);
        });
    });

    describe('edge cases', () => {
        it('should handle empty automaton', () => {
            const result = automatonToGrammar(emptyAutomaton);

            expect(result).toContain('G = (V, Sigma, P, S)');
        });

        it('should handle NFA with epsilon transitions', () => {
            const result = automatonToGrammar(nfaWithEpsilon);

            expect(result).toContain('G = (V, Sigma, P, S)');
        });

        it('should throw for PDA', () => {
            expect(() => automatonToGrammar(simplePDA)).toThrow('AP');
        });
    });
});

describe('automatonToRegex', () => {
    describe('basic conversion', () => {
        it('should produce non-empty regex for valid automaton', () => {
            const result = automatonToRegex(simpleDFA);

            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
            expect(result).not.toBe('empty');
        });

        it('should handle star DFA (a*)', () => {
            const result = automatonToRegex(starDFA);

            expect(result).toBeDefined();
            // Should contain 'a' and possibly '*'
            expect(result).toContain('a');
        });

        it('should handle plus DFA (a+)', () => {
            const result = automatonToRegex(plusDFA);

            expect(result).toBeDefined();
            expect(result).toContain('a');
        });

        it('should handle NFA with epsilon', () => {
            const result = automatonToRegex(nfaWithEpsilon);

            expect(result).toBeDefined();
            expect(result).not.toBe('empty');
        });
    });

    describe('idempotency', () => {
        it('should produce same result on multiple calls', () => {
            const result1 = automatonToRegex(simpleDFA);
            const result2 = automatonToRegex(simpleDFA);
            const result3 = automatonToRegex(simpleDFA);

            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
        });

        it('should handle rapid successive calls', () => {
            const results: string[] = [];

            for (let i = 0; i < 10; i++) {
                results.push(automatonToRegex(plusDFA));
            }

            expect(new Set(results).size).toBe(1);
        });

        it('should be consistent with complex automaton', () => {
            const results: string[] = [];

            for (let i = 0; i < 5; i++) {
                results.push(automatonToRegex(abbDFA));
            }

            expect(new Set(results).size).toBe(1);
        });
    });

    describe('edge cases', () => {
        it('should return empty for empty automaton', () => {
            const result = automatonToRegex(emptyAutomaton);

            expect(result).toBe('empty');
        });

        it('should return empty for automaton without final states', () => {
            const result = automatonToRegex(noFinalStatesDFA);

            expect(result).toBe('empty');
        });

        it('should return empty for automaton without initial states', () => {
            const result = automatonToRegex(noInitialStatesDFA);

            expect(result).toBe('empty');
        });

        it('should handle single-state final DFA', () => {
            const result = automatonToRegex(emptyStringDFA);

            expect(result).toBeDefined();
            // Should accept empty string
        });

        it('should throw for PDA', () => {
            expect(() => automatonToRegex(simplePDA)).toThrow('AP');
        });
    });
});

describe('automatonToDot', () => {
    describe('basic conversion', () => {
        it('should produce valid DOT format', () => {
            const result = automatonToDot(simpleDFA);

            expect(result).toContain('digraph Automaton {');
            expect(result).toContain('}');
            expect(result).toContain('rankdir=LR');
        });

        it('should include start pointer', () => {
            const result = automatonToDot(simpleDFA);

            expect(result).toContain('__start__');
            expect(result).toContain('shape=point');
        });

        it('should mark final states with double circle', () => {
            const result = automatonToDot(simpleDFA);

            expect(result).toContain('shape=doublecircle');
        });

        it('should include all transitions', () => {
            const result = automatonToDot(simpleDFA);

            expect(result).toContain('->');
            expect(result).toContain('label=');
        });
    });

    describe('idempotency', () => {
        it('should produce same result on multiple calls', () => {
            const result1 = automatonToDot(simpleDFA);
            const result2 = automatonToDot(simpleDFA);

            expect(result1).toBe(result2);
        });

        it('should handle rapid successive calls', () => {
            const results: string[] = [];

            for (let i = 0; i < 10; i++) {
                results.push(automatonToDot(abbDFA));
            }

            expect(new Set(results).size).toBe(1);
        });
    });

    describe('different automaton types', () => {
        it('should handle NFA with epsilon', () => {
            const result = automatonToDot(nfaWithEpsilon);

            expect(result).toContain('digraph Automaton {');
            expect(result).toContain('ε');
        });

        it('should handle complex NFA', () => {
            const result = automatonToDot(complexNFA);

            expect(result).toContain('digraph Automaton {');
            expect(result).toContain('q0');
        });

        it('should handle PDA (DOT format works for all types)', () => {
            const result = automatonToDot(simplePDA);

            expect(result).toContain('digraph Automaton {');
        });
    });

    describe('edge cases', () => {
        it('should handle empty automaton', () => {
            const result = automatonToDot(emptyAutomaton);

            expect(result).toContain('digraph Automaton {');
            expect(result).toContain('}');
        });

        it('should handle automaton without final states', () => {
            const result = automatonToDot(noFinalStatesDFA);

            expect(result).toContain('digraph Automaton {');
            expect(result).not.toContain('shape=doublecircle');
        });
    });
});
