import { describe, it, expect } from 'vitest';
import {
    getStrategy,
    createInitialState,
    performStep,
    checkAcceptance,
    DEFAULT_SIMULATION_CONFIG,
} from './SimulationEngine';
import type { SimulationContext } from './types';
import {
    simpleDFA,
    nfaWithEpsilon,
    nfaWithoutEpsilon,
    complexNFA,
    emptyStringDFA,
    starDFA,
    plusDFA,
    abbDFA,
} from '../test/fixtures';

const createContext = (): SimulationContext => ({
    config: DEFAULT_SIMULATION_CONFIG,
    historyLength: 0,
    seenConfigs: new Set(),
});

describe('getStrategy', () => {
    describe('strategy selection', () => {
        it('should return strategy for AFD', () => {
            const strategy = getStrategy('AFD');
            expect(strategy).toBeDefined();
        });

        it('should return strategy for AFN', () => {
            const strategy = getStrategy('AFN');
            expect(strategy).toBeDefined();
        });

        it('should return strategy for AP (PDA)', () => {
            const strategy = getStrategy('AP');
            expect(strategy).toBeDefined();
        });

        it('should return strategy for MT (Turing)', () => {
            const strategy = getStrategy('MT');
            expect(strategy).toBeDefined();
        });

        it('should return strategy for Moore', () => {
            const strategy = getStrategy('Moore');
            expect(strategy).toBeDefined();
        });

        it('should return strategy for Mealy', () => {
            const strategy = getStrategy('Mealy');
            expect(strategy).toBeDefined();
        });
    });

    describe('idempotency', () => {
        it('should return same strategy instance on multiple calls', () => {
            const strategy1 = getStrategy('AFD');
            const strategy2 = getStrategy('AFD');
            const strategy3 = getStrategy('AFD');

            expect(strategy1).toBe(strategy2);
            expect(strategy2).toBe(strategy3);
        });
    });
});

describe('createInitialState', () => {
    describe('DFA initial state', () => {
        it('should create initial state for simple DFA', () => {
            const state = createInitialState(simpleDFA, ['a', 'b']);

            expect(state).toBeDefined();
            expect(state!.activeStates).toContain('q0');
            expect(state!.remainingInput).toEqual(['a', 'b']);
            expect(state!.processedInput).toEqual([]);
            expect(state!.status).toBe('running');
        });

        it('should handle empty input', () => {
            const state = createInitialState(simpleDFA, []);

            expect(state).toBeDefined();
            expect(state!.remainingInput).toEqual([]);
        });

        it('should handle long input', () => {
            const input = Array(100).fill('a');
            const state = createInitialState(simpleDFA, input);

            expect(state).toBeDefined();
            expect(state!.remainingInput.length).toBe(100);
        });
    });

    describe('NFA initial state', () => {
        it('should create initial state with epsilon closure', () => {
            const state = createInitialState(nfaWithEpsilon, ['a']);

            expect(state).toBeDefined();
            // q0 has epsilon to q1, q1 has epsilon to q2
            expect(state!.activeStates).toContain('q0');
            expect(state!.activeStates.length).toBeGreaterThanOrEqual(1);
        });

        it('should handle complex NFA with multiple epsilon paths', () => {
            const state = createInitialState(complexNFA, ['a']);

            expect(state).toBeDefined();
            expect(state!.activeStates.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('idempotency', () => {
        it('should produce same result on multiple calls', () => {
            const state1 = createInitialState(simpleDFA, ['a', 'b']);
            const state2 = createInitialState(simpleDFA, ['a', 'b']);
            const state3 = createInitialState(simpleDFA, ['a', 'b']);

            expect(state1).toEqual(state2);
            expect(state2).toEqual(state3);
        });

        it('should handle rapid successive calls', () => {
            const results = [];

            for (let i = 0; i < 10; i++) {
                results.push(createInitialState(nfaWithEpsilon, ['a', 'b']));
            }

            const first = results[0];
            results.forEach(result => {
                expect(result).toEqual(first);
            });
        });
    });
});

describe('performStep', () => {
    describe('DFA steps', () => {
        it('should perform step and consume input', () => {
            const initial = createInitialState(simpleDFA, ['a', 'b'])!;
            const result = performStep(initial, simpleDFA, createContext());

            expect(result.nextState.remainingInput.length).toBe(1);
            expect(result.nextState.processedInput).toContain('a');
            expect(result.finished).toBe(false);
        });

        it('should transition to correct state', () => {
            const initial = createInitialState(simpleDFA, ['b'])!;
            const result = performStep(initial, simpleDFA, createContext());

            // 'b' from q0 goes to q1
            expect(result.nextState.activeStates).toContain('q1');
        });

        it('should reject on invalid symbol', () => {
            const initial = createInitialState(simpleDFA, ['c'])!;
            const result = performStep(initial, simpleDFA, createContext());

            // No transition for 'c'
            expect(result.finished).toBe(true);
            expect(result.accepted).toBe(false);
            expect(result.nextState.status).toBe('rejected');
        });
    });

    describe('NFA steps', () => {
        it('should handle non-deterministic transitions', () => {
            const initial = createInitialState(nfaWithoutEpsilon, ['a'])!;
            const result = performStep(initial, nfaWithoutEpsilon, createContext());

            // 'a' from q0 can go to q0 or q1
            expect(result.nextState.activeStates.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('idempotency', () => {
        it('should produce same result on multiple calls with same input', () => {
            const initial = createInitialState(simpleDFA, ['a', 'b'])!;
            const context = createContext();

            const result1 = performStep(initial, simpleDFA, context);
            const result2 = performStep(initial, simpleDFA, context);
            const result3 = performStep(initial, simpleDFA, context);

            expect(result1.nextState).toEqual(result2.nextState);
            expect(result2.nextState).toEqual(result3.nextState);
        });

        it('should handle rapid successive calls', () => {
            const initial = createInitialState(abbDFA, ['a', 'b', 'b'])!;
            const context = createContext();
            const results = [];

            for (let i = 0; i < 10; i++) {
                results.push(performStep(initial, abbDFA, context));
            }

            const first = results[0];
            results.forEach(result => {
                expect(result.nextState).toEqual(first.nextState);
                expect(result.finished).toBe(first.finished);
            });
        });
    });
});

describe('checkAcceptance', () => {
    describe('DFA acceptance', () => {
        it('should accept when in final state with empty input', () => {
            const state = {
                activeStates: ['q1'],
                remainingInput: [] as string[],
                processedInput: ['b'],
                status: 'running' as const,
            };

            const result = checkAcceptance(state, simpleDFA);

            expect(result.finished).toBe(true);
            expect(result.accepted).toBe(true);
        });

        it('should reject when not in final state', () => {
            const state = {
                activeStates: ['q0'],
                remainingInput: [] as string[],
                processedInput: ['a'],
                status: 'running' as const,
            };

            const result = checkAcceptance(state, simpleDFA);

            expect(result.finished).toBe(true);
            expect(result.accepted).toBe(false);
        });

        it('should not be finished if input remains', () => {
            const state = {
                activeStates: ['q1'],
                remainingInput: ['a'],
                processedInput: ['b'],
                status: 'running' as const,
            };

            const result = checkAcceptance(state, simpleDFA);

            expect(result.finished).toBe(false);
        });
    });

    describe('empty string acceptance', () => {
        it('should accept empty string for DFA with initial=final', () => {
            const state = createInitialState(emptyStringDFA, [])!;
            const result = checkAcceptance(state, emptyStringDFA);

            expect(result.finished).toBe(true);
            expect(result.accepted).toBe(true);
        });

        it('should accept empty string for star DFA (a*)', () => {
            const state = createInitialState(starDFA, [])!;
            const result = checkAcceptance(state, starDFA);

            expect(result.finished).toBe(true);
            expect(result.accepted).toBe(true);
        });

        it('should reject empty string for plus DFA (a+)', () => {
            const state = createInitialState(plusDFA, [])!;
            const result = checkAcceptance(state, plusDFA);

            expect(result.finished).toBe(true);
            expect(result.accepted).toBe(false);
        });
    });

    describe('idempotency', () => {
        it('should produce same result on multiple calls', () => {
            const state = {
                activeStates: ['q1'],
                remainingInput: [] as string[],
                processedInput: ['b'],
                status: 'running' as const,
            };

            const result1 = checkAcceptance(state, simpleDFA);
            const result2 = checkAcceptance(state, simpleDFA);
            const result3 = checkAcceptance(state, simpleDFA);

            expect(result1).toEqual(result2);
            expect(result2).toEqual(result3);
        });

        it('should handle rapid successive calls', () => {
            const state = createInitialState(starDFA, [])!;
            const results = [];

            for (let i = 0; i < 10; i++) {
                results.push(checkAcceptance(state, starDFA));
            }

            const first = results[0];
            results.forEach(result => {
                expect(result).toEqual(first);
            });
        });
    });
});

describe('full simulation scenarios', () => {
    describe('DFA accepting strings ending with b', () => {
        it('should accept "b"', () => {
            let state = createInitialState(simpleDFA, ['b'])!;
            const context = createContext();

            while (state.remainingInput.length > 0) {
                const result = performStep(state, simpleDFA, context);
                state = result.nextState;
                if (result.finished) break;
            }

            const acceptance = checkAcceptance(state, simpleDFA);
            expect(acceptance.accepted).toBe(true);
        });

        it('should accept "ab"', () => {
            let state = createInitialState(simpleDFA, ['a', 'b'])!;
            const context = createContext();

            while (state.remainingInput.length > 0 && state.status === 'running') {
                const result = performStep(state, simpleDFA, context);
                state = result.nextState;
                if (result.finished) break;
            }

            const acceptance = checkAcceptance(state, simpleDFA);
            expect(acceptance.accepted).toBe(true);
        });

        it('should accept "aaabbb"', () => {
            let state = createInitialState(simpleDFA, ['a', 'a', 'a', 'b', 'b', 'b'])!;
            const context = createContext();

            while (state.remainingInput.length > 0 && state.status === 'running') {
                const result = performStep(state, simpleDFA, context);
                state = result.nextState;
                if (result.finished) break;
            }

            const acceptance = checkAcceptance(state, simpleDFA);
            expect(acceptance.accepted).toBe(true);
        });

        it('should reject "a"', () => {
            let state = createInitialState(simpleDFA, ['a'])!;
            const context = createContext();

            while (state.remainingInput.length > 0 && state.status === 'running') {
                const result = performStep(state, simpleDFA, context);
                state = result.nextState;
                if (result.finished) break;
            }

            const acceptance = checkAcceptance(state, simpleDFA);
            expect(acceptance.accepted).toBe(false);
        });

        it('should reject "ba"', () => {
            let state = createInitialState(simpleDFA, ['b', 'a'])!;
            const context = createContext();

            while (state.remainingInput.length > 0 && state.status === 'running') {
                const result = performStep(state, simpleDFA, context);
                state = result.nextState;
                if (result.finished) break;
            }

            const acceptance = checkAcceptance(state, simpleDFA);
            expect(acceptance.accepted).toBe(false);
        });
    });

    describe('DFA accepting (a|b)*abb', () => {
        it('should accept "abb"', () => {
            let state = createInitialState(abbDFA, ['a', 'b', 'b'])!;
            const context = createContext();

            while (state.remainingInput.length > 0 && state.status === 'running') {
                const result = performStep(state, abbDFA, context);
                state = result.nextState;
                if (result.finished) break;
            }

            const acceptance = checkAcceptance(state, abbDFA);
            expect(acceptance.accepted).toBe(true);
        });

        it('should accept "aabb"', () => {
            let state = createInitialState(abbDFA, ['a', 'a', 'b', 'b'])!;
            const context = createContext();

            while (state.remainingInput.length > 0 && state.status === 'running') {
                const result = performStep(state, abbDFA, context);
                state = result.nextState;
                if (result.finished) break;
            }

            const acceptance = checkAcceptance(state, abbDFA);
            expect(acceptance.accepted).toBe(true);
        });

        it('should accept "babb"', () => {
            let state = createInitialState(abbDFA, ['b', 'a', 'b', 'b'])!;
            const context = createContext();

            while (state.remainingInput.length > 0 && state.status === 'running') {
                const result = performStep(state, abbDFA, context);
                state = result.nextState;
                if (result.finished) break;
            }

            const acceptance = checkAcceptance(state, abbDFA);
            expect(acceptance.accepted).toBe(true);
        });

        it('should reject "ab"', () => {
            let state = createInitialState(abbDFA, ['a', 'b'])!;
            const context = createContext();

            while (state.remainingInput.length > 0 && state.status === 'running') {
                const result = performStep(state, abbDFA, context);
                state = result.nextState;
                if (result.finished) break;
            }

            const acceptance = checkAcceptance(state, abbDFA);
            expect(acceptance.accepted).toBe(false);
        });

        it('should reject empty string', () => {
            const state = createInitialState(abbDFA, [])!;
            const acceptance = checkAcceptance(state, abbDFA);
            expect(acceptance.accepted).toBe(false);
        });
    });

    describe('idempotency of full simulation', () => {
        it('should produce same result on multiple full simulations', () => {
            const runSimulation = () => {
                let state = createInitialState(abbDFA, ['a', 'a', 'b', 'b'])!;
                const context = createContext();

                while (state.remainingInput.length > 0 && state.status === 'running') {
                    const result = performStep(state, abbDFA, context);
                    state = result.nextState;
                    if (result.finished) break;
                }

                return checkAcceptance(state, abbDFA);
            };

            const results = [];
            for (let i = 0; i < 10; i++) {
                results.push(runSimulation());
            }

            const first = results[0];
            results.forEach(result => {
                expect(result.accepted).toBe(first.accepted);
                expect(result.finished).toBe(first.finished);
            });
        });
    });
});
