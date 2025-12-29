/**
 * DFA equivalence checking and language properties
 * @module conversions/equivalence
 */

import type { AutomatoData } from '../../types';
import { getEpsilonClosure } from '../automatonLogic';
import { matchesSymbol } from '../symbols';
import { getAlphabet } from './alphabet';
import { buildDfaTransitionMap, DEAD_STATE } from './helpers';
import { nfaToDfa } from './nfaToDfa';
import type { DfaEquivalenceResult, LanguageCheckResult } from './types';

/**
 * Ensure an automaton is a DFA (convert if necessary)
 */
function ensureDfa(automaton: AutomatoData): AutomatoData {
    if (automaton.tipo === 'AFD') return automaton;
    if (automaton.tipo === 'AFN') return nfaToDfa(automaton);
    throw new Error('Operacao suportada apenas para AFD/AFN.');
}

/**
 * Check if two DFAs are equivalent (recognize the same language)
 */
export function areDfaEquivalent(a: AutomatoData, b: AutomatoData): DfaEquivalenceResult {
    if (a.tipo !== 'AFD' || b.tipo !== 'AFD') {
        return { equivalent: false, reason: 'Somente AFD e suportado.' };
    }

    const alphabet = Array.from(new Set([...getAlphabet(a), ...getAlphabet(b)])).sort();
    const initialA = a.estados.find(s => s.isInicial)?.id;
    const initialB = b.estados.find(s => s.isInicial)?.id;

    if (!initialA || !initialB) {
        return { equivalent: false, reason: 'Estado inicial ausente.' };
    }

    const finalA = new Set(a.estados.filter(s => s.isFinal).map(s => s.id));
    const finalB = new Set(b.estados.filter(s => s.isFinal).map(s => s.id));

    const mapA = buildDfaTransitionMap(a, alphabet);
    const mapB = buildDfaTransitionMap(b, alphabet);

    const queue: Array<{ aState: string; bState: string; path: string[] }> = [{
        aState: initialA,
        bState: initialB,
        path: []
    }];
    const visited = new Set<string>();

    const isFinal = (state: string, finals: Set<string>) => finals.has(state);

    while (queue.length > 0) {
        const { aState, bState, path } = queue.shift()!;
        const key = `${aState}::${bState}`;
        if (visited.has(key)) continue;
        visited.add(key);

        if (isFinal(aState, finalA) !== isFinal(bState, finalB)) {
            return { equivalent: false, witness: path };
        }

        for (const symbol of alphabet) {
            const nextA = mapA.get(aState)?.get(symbol) ?? DEAD_STATE;
            const nextB = mapB.get(bState)?.get(symbol) ?? DEAD_STATE;
            queue.push({ aState: nextA, bState: nextB, path: [...path, symbol] });
        }
    }

    return { equivalent: true };
}

/**
 * Check if the language of an automaton is empty
 */
export function checkEmptiness(automaton: AutomatoData): LanguageCheckResult {
    if (automaton.tipo !== 'AFD' && automaton.tipo !== 'AFN') {
        return { ok: false, reason: 'Somente AFD/AFN suportados.' };
    }

    const alphabet = getAlphabet(automaton);
    const initialStates = automaton.estados.filter(s => s.isInicial).map(s => s.id);
    const finals = new Set(automaton.estados.filter(s => s.isFinal).map(s => s.id));

    const closure = automaton.tipo === 'AFN'
        ? getEpsilonClosure(initialStates, automaton.transicoes)
        : initialStates;

    // Check if initial state is final
    if (closure.some(id => finals.has(id))) {
        return { ok: false, witness: [] };
    }

    // BFS to find accepting path
    const queue: Array<{ states: string[]; word: string[] }> = [{ states: closure, word: [] }];
    const visited = new Set<string>([closure.slice().sort().join(',')]);

    while (queue.length > 0) {
        const { states, word } = queue.shift()!;

        for (const symbol of alphabet) {
            const reachable = new Set<string>();
            states.forEach(stateId => {
                automaton.transicoes
                    .filter(t => t.de === stateId && matchesSymbol(t.simbolo, symbol))
                    .forEach(t => reachable.add(t.para));
            });

            if (reachable.size === 0) continue;

            const nextStates = automaton.tipo === 'AFN'
                ? getEpsilonClosure(Array.from(reachable), automaton.transicoes)
                : Array.from(reachable);

            const key = nextStates.slice().sort().join(',');
            if (visited.has(key)) continue;
            visited.add(key);

            const nextWord = [...word, symbol];
            if (nextStates.some(id => finals.has(id))) {
                return { ok: false, witness: nextWord };
            }
            queue.push({ states: nextStates, word: nextWord });
        }
    }

    return { ok: true };
}

/**
 * Check if L(a) is a subset of L(b)
 */
export function checkInclusion(a: AutomatoData, b: AutomatoData): LanguageCheckResult {
    const dfaA = ensureDfa(a);
    const dfaB = ensureDfa(b);
    const alphabet = Array.from(new Set([...getAlphabet(dfaA), ...getAlphabet(dfaB)])).sort();

    const mapA = buildDfaTransitionMap(dfaA, alphabet);
    const mapB = buildDfaTransitionMap(dfaB, alphabet);

    const initialA = dfaA.estados.find(s => s.isInicial)?.id;
    const initialB = dfaB.estados.find(s => s.isInicial)?.id;

    if (!initialA || !initialB) {
        return { ok: false, reason: 'Estado inicial ausente.' };
    }

    const finalA = new Set(dfaA.estados.filter(s => s.isFinal).map(s => s.id));
    const finalB = new Set(dfaB.estados.filter(s => s.isFinal).map(s => s.id));

    const queue: Array<{ aId: string; bId: string; word: string[] }> = [
        { aId: initialA, bId: initialB, word: [] }
    ];
    const visited = new Set<string>();

    while (queue.length > 0) {
        const { aId, bId, word } = queue.shift()!;
        const key = `${aId}::${bId}`;
        if (visited.has(key)) continue;
        visited.add(key);

        // Found a word in L(a) but not in L(b)
        if (finalA.has(aId) && !finalB.has(bId)) {
            return { ok: false, witness: word };
        }

        for (const symbol of alphabet) {
            const nextA = mapA.get(aId)?.get(symbol) ?? DEAD_STATE;
            const nextB = mapB.get(bId)?.get(symbol) ?? DEAD_STATE;
            queue.push({ aId: nextA, bId: nextB, word: [...word, symbol] });
        }
    }

    return { ok: true };
}

/**
 * Check if two automata are equivalent (L(a) = L(b))
 */
export function checkEquivalence(a: AutomatoData, b: AutomatoData): LanguageCheckResult {
    const dfaA = ensureDfa(a);
    const dfaB = ensureDfa(b);
    const result = areDfaEquivalent(dfaA, dfaB);

    if (result.equivalent) return { ok: true };
    return { ok: false, witness: result.witness, reason: result.reason };
}
