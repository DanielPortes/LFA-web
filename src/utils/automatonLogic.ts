import type { Transicao } from '../types';

/**
 * Calculates the epsilon closure for a set of states.
 * The epsilon closure includes the states themselves and any state reachable
 * via one or more epsilon (λ) transitions.
 */
export const getEpsilonClosure = (
    startStateIds: string[],
    transitions: Transicao[]
): string[] => {
    const closure = new Set<string>(startStateIds);
    const stack = [...startStateIds];

    while (stack.length > 0) {
        const currentId = stack.pop()!;

        // Find all states reachable from currentId via epsilon
        const epsilonTransitions = transitions.filter(t =>
            t.de === currentId &&
            (t.simbolo === 'λ' || t.simbolo === '')
        );

        for (const t of epsilonTransitions) {
            if (!closure.has(t.para)) {
                closure.add(t.para);
                stack.push(t.para);
            }
        }
    }

    return Array.from(closure);
};

/**
 * Performs a single simulation step for a given input symbol.
 * 1. Finds all direct targets from current states using the symbol.
 * 2. Computes the epsilon closure of those targets.
 */
export const performStep = (
    currentActiveStates: string[],
    symbol: string,
    transitions: Transicao[]
): string[] => {
    const directTargets = new Set<string>();

    for (const stateId of currentActiveStates) {
        const relevantTransitions = transitions.filter(t => t.de === stateId);

        for (const t of relevantTransitions) {
            const symbols = t.simbolo.split(',').map(s => s.trim());

            const matches = symbols.some(s => {
                if (s === 'λ' || s === '') return false; // Epsilon handled separately
                if (s === symbol) return true;
                if (s.includes('..')) {
                    const [min, max] = s.split('..');
                    return symbol >= min && symbol <= max;
                }
                return false;
            });

            if (matches) {
                directTargets.add(t.para);
            }
        }
    }

    // The next state set is the epsilon closure of all direct targets
    return getEpsilonClosure(Array.from(directTargets), transitions);
};
