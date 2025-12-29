/**
 * NFA to DFA conversion using subset construction
 * @module conversions/nfaToDfa
 */

import type { AutomatoData, Estado, Transicao } from '../../types';
import { getEpsilonClosure } from '../automatonLogic';
import { matchesSymbol } from '../symbols';
import { getAlphabet } from './alphabet';
import {
    generateId,
    applyLayeredLayout,
    mergeTransitions,
    formatStateSet
} from './helpers';
import type { ConversionStep, ConversionWithSteps } from './types';

const MAX_STEPS = 200;

function pushStep(steps: ConversionStep[], title: string, detail: string): void {
    if (steps.length >= MAX_STEPS) return;
    steps.push({ title, detail });
}

/**
 * Convert NFA to DFA using subset construction
 */
export function nfaToDfa(nfa: AutomatoData): AutomatoData {
    const alphabet = getAlphabet(nfa);
    const initialStates = nfa.estados.filter(e => e.isInicial).map(e => e.id);
    const initialClosure = getEpsilonClosure(initialStates, nfa.transicoes);

    const stateSetToId = new Map<string, string>();
    const dfaStates: Estado[] = [];
    const dfaTransitions: Transicao[] = [];

    const queue: string[][] = [initialClosure];
    let stateCounter = 0;

    const getSetKey = (states: string[]) => [...states].sort().join(',');
    const initialKey = getSetKey(initialClosure);
    const initialDfaId = `q0`;
    stateSetToId.set(initialKey, initialDfaId);

    const hasFinal = (states: string[]) =>
        states.some(id => nfa.estados.find(e => e.id === id)?.isFinal);

    // Initial State
    dfaStates.push({
        id: initialDfaId,
        label: `{${initialClosure.map(id => nfa.estados.find(e => e.id === id)?.label || id).join(',')}}`,
        x: 0,
        y: 0,
        isFinal: hasFinal(initialClosure),
        isInicial: true
    });
    stateCounter++;

    const processed = new Set<string>();

    while (queue.length > 0) {
        const currentSet = queue.shift()!;
        const currentKey = getSetKey(currentSet);

        if (processed.has(currentKey)) continue;
        processed.add(currentKey);

        const currentDfaStateId = stateSetToId.get(currentKey)!;

        for (const symbol of alphabet) {
            const reachable = new Set<string>();

            for (const stateId of currentSet) {
                const transitions = nfa.transicoes.filter(t =>
                    t.de === stateId && matchesSymbol(t.simbolo, symbol)
                );
                for (const t of transitions) reachable.add(t.para);
            }

            if (reachable.size === 0) continue;

            const targetSet = getEpsilonClosure(Array.from(reachable), nfa.transicoes);
            const targetKey = getSetKey(targetSet);

            if (!stateSetToId.has(targetKey)) {
                const newId = `q${stateCounter}`;
                stateSetToId.set(targetKey, newId);

                dfaStates.push({
                    id: newId,
                    label: `{${targetSet.map(id => nfa.estados.find(e => e.id === id)?.label || id).join(',')}}`,
                    x: 0,
                    y: 0,
                    isFinal: hasFinal(targetSet),
                    isInicial: false
                });
                stateCounter++;
                queue.push(targetSet);
            }

            dfaTransitions.push({
                id: generateId('t'),
                de: currentDfaStateId,
                para: stateSetToId.get(targetKey)!,
                simbolo: symbol,
                curvatura: 0
            });
        }
    }

    applyLayeredLayout(dfaStates, dfaTransitions, initialDfaId);

    return {
        tipo: 'AFD',
        estados: dfaStates,
        transicoes: mergeTransitions(dfaTransitions),
        descricao: `AFD convertido de ${nfa.descricao || 'AFN'}`
    };
}

/**
 * Convert NFA to DFA with step-by-step explanation
 */
export function nfaToDfaWithSteps(nfa: AutomatoData): ConversionWithSteps {
    const steps: ConversionStep[] = [];
    const alphabet = getAlphabet(nfa);
    const labelMap = new Map(nfa.estados.map(s => [s.id, s.label || s.id]));

    pushStep(steps, 'Alfabeto', alphabet.join(', ') || 'vazio');

    const initialStates = nfa.estados.filter(e => e.isInicial).map(e => e.id);
    const initialClosure = getEpsilonClosure(initialStates, nfa.transicoes);
    pushStep(steps, 'Fecho-epsilon inicial', formatStateSet(initialClosure, labelMap));

    const stateSetToId = new Map<string, string>();
    const dfaStates: Estado[] = [];
    const dfaTransitions: Transicao[] = [];
    const queue: string[][] = [initialClosure];
    let stateCounter = 0;

    const getSetKey = (states: string[]) => [...states].sort().join(',');
    const initialKey = getSetKey(initialClosure);
    const initialDfaId = `q0`;
    stateSetToId.set(initialKey, initialDfaId);

    const hasFinal = (states: string[]) =>
        states.some(id => nfa.estados.find(e => e.id === id)?.isFinal);

    dfaStates.push({
        id: initialDfaId,
        label: formatStateSet(initialClosure, labelMap),
        x: 0,
        y: 0,
        isFinal: hasFinal(initialClosure),
        isInicial: true
    });
    stateCounter += 1;

    const processed = new Set<string>();
    while (queue.length > 0) {
        const currentSet = queue.shift()!;
        const currentKey = getSetKey(currentSet);
        if (processed.has(currentKey)) continue;
        processed.add(currentKey);

        const currentDfaStateId = stateSetToId.get(currentKey)!;
        for (const symbol of alphabet) {
            const reachable = new Set<string>();
            for (const stateId of currentSet) {
                const transitions = nfa.transicoes.filter(t =>
                    t.de === stateId && matchesSymbol(t.simbolo, symbol)
                );
                for (const t of transitions) reachable.add(t.para);
            }

            if (reachable.size === 0) continue;
            const targetSet = getEpsilonClosure(Array.from(reachable), nfa.transicoes);
            const targetKey = getSetKey(targetSet);

            pushStep(
                steps,
                `Transicao por ${symbol}`,
                `${formatStateSet(currentSet, labelMap)} -> ${formatStateSet(targetSet, labelMap)}`
            );

            if (!stateSetToId.has(targetKey)) {
                const newId = `q${stateCounter}`;
                stateSetToId.set(targetKey, newId);
                dfaStates.push({
                    id: newId,
                    label: formatStateSet(targetSet, labelMap),
                    x: 0,
                    y: 0,
                    isFinal: hasFinal(targetSet),
                    isInicial: false
                });
                stateCounter += 1;
                queue.push(targetSet);
                pushStep(steps, 'Novo estado', formatStateSet(targetSet, labelMap));
            }

            dfaTransitions.push({
                id: generateId('t'),
                de: currentDfaStateId,
                para: stateSetToId.get(targetKey)!,
                simbolo: symbol,
                curvatura: 0
            });
        }
    }

    applyLayeredLayout(dfaStates, dfaTransitions, initialDfaId);

    return {
        automaton: {
            tipo: 'AFD',
            estados: dfaStates,
            transicoes: mergeTransitions(dfaTransitions),
            descricao: `AFD convertido de ${nfa.descricao || 'AFN'}`
        },
        steps
    };
}
