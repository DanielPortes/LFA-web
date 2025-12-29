/**
 * Epsilon transition elimination
 * @module conversions/epsilon
 */

import type { AutomatoData, Transicao } from '../../types';
import { getEpsilonClosure } from '../automatonLogic';
import { matchesSymbol } from '../symbols';
import { getAlphabet } from './alphabet';
import { generateId, mergeTransitions, formatStateSet } from './helpers';
import type { ConversionStep, ConversionWithSteps } from './types';

const MAX_STEPS = 200;

function pushStep(steps: ConversionStep[], title: string, detail: string): void {
    if (steps.length >= MAX_STEPS) return;
    steps.push({ title, detail });
}

/**
 * Eliminate epsilon transitions from an NFA
 */
export function eliminateEpsilonTransitions(nfa: AutomatoData): ConversionWithSteps {
    const steps: ConversionStep[] = [];
    const alphabet = getAlphabet(nfa);
    const labelMap = new Map(nfa.estados.map(s => [s.id, s.label || s.id]));
    const newTransitions: Transicao[] = [];

    pushStep(steps, 'Alfabeto', alphabet.join(', ') || 'vazio');

    nfa.estados.forEach(state => {
        const closure = getEpsilonClosure([state.id], nfa.transicoes);
        pushStep(
            steps,
            'Fecho-epsilon',
            `${labelMap.get(state.id) ?? state.id}: ${formatStateSet(closure, labelMap)}`
        );

        for (const symbol of alphabet) {
            const reachable = new Set<string>();
            closure.forEach(sourceId => {
                nfa.transicoes
                    .filter(t => t.de === sourceId && matchesSymbol(t.simbolo, symbol))
                    .forEach(t => reachable.add(t.para));
            });

            if (reachable.size === 0) continue;

            const targetClosure = getEpsilonClosure(Array.from(reachable), nfa.transicoes);
            targetClosure.forEach(targetId => {
                newTransitions.push({
                    id: generateId('t'),
                    de: state.id,
                    para: targetId,
                    simbolo: symbol,
                    curvatura: 0
                });
            });
        }
    });

    // Update final states
    const finalStates = new Set(nfa.estados.filter(s => s.isFinal).map(s => s.id));
    const newStates = nfa.estados.map(state => {
        const closure = getEpsilonClosure([state.id], nfa.transicoes);
        const isFinal = closure.some(id => finalStates.has(id));
        return { ...state, isFinal };
    });

    pushStep(steps, 'Finais atualizados', 'Estados com fecho-epsilon contendo finais foram marcados.');

    return {
        automaton: {
            ...nfa,
            tipo: 'AFN',
            estados: newStates,
            transicoes: mergeTransitions(newTransitions),
            descricao: `AFN sem eps de ${nfa.descricao || 'AFN'}`
        },
        steps
    };
}
