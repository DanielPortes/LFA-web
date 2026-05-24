import type { AutomatoData } from '../types';
import { getAlphabet } from './conversions/alphabet';
import { hasEpsilonToken, matchesSymbol } from './symbols';

export type InferredAutomatonDisplayType = AutomatoData['tipo'] | 'AFN-ε';

export interface InferredAutomatonKind {
    runtimeType: AutomatoData['tipo'];
    displayType: InferredAutomatonDisplayType;
}

const isFiniteEditableType = (type: AutomatoData['tipo']) => type === 'AFD' || type === 'AFN';

const hasMultipleInitialStates = (automaton: AutomatoData): boolean =>
    automaton.estados.filter((state) => state.isInicial).length > 1;

const hasNondeterministicTransition = (automaton: AutomatoData): boolean => {
    const alphabet = getAlphabet(automaton);
    if (alphabet.length === 0) return false;

    return automaton.estados.some((state) => alphabet.some((symbol) => {
        const matches = automaton.transicoes.filter((transition) =>
            transition.de === state.id && matchesSymbol(transition.simbolo, symbol)
        );

        return matches.length > 1;
    }));
};

export const inferAutomatonKind = (automaton: AutomatoData): InferredAutomatonKind => {
    if (!isFiniteEditableType(automaton.tipo)) {
        return {
            runtimeType: automaton.tipo,
            displayType: automaton.tipo,
        };
    }

    const hasEpsilon = automaton.transicoes.some((transition) => hasEpsilonToken(transition.simbolo));
    const isNondeterministic = hasEpsilon || hasMultipleInitialStates(automaton) || hasNondeterministicTransition(automaton);

    if (!isNondeterministic) {
        return {
            runtimeType: 'AFD',
            displayType: 'AFD',
        };
    }

    return {
        runtimeType: 'AFN',
        displayType: hasEpsilon ? 'AFN-ε' : 'AFN',
    };
};
