/**
 * Set operations on automata (union, intersection, complement)
 * @module conversions/operations
 */

import type { AutomatoData, Estado, Transicao } from '../../types';
import { EPSILON_SYMBOL } from '../symbols';
import { getAlphabet } from './alphabet';
import { generateId, applyLayeredLayout, mergeTransitions, buildDfaTransitionMap, DEAD_STATE } from './helpers';
import { nfaToDfa } from './nfaToDfa';

/**
 * Create the union of two automata: L(a) ∪ L(b)
 */
export function unionAutomata(a: AutomatoData, b: AutomatoData): AutomatoData {
    // Create new initial state with epsilon transitions to both automata
    const prefixA = 'a_';
    const prefixB = 'b_';

    const statesA = a.estados.map(s => ({
        ...s,
        id: `${prefixA}${s.id}`,
        label: `${s.label || s.id}`,
        isInicial: false
    }));

    const statesB = b.estados.map(s => ({
        ...s,
        id: `${prefixB}${s.id}`,
        label: `${s.label || s.id}'`,
        isInicial: false
    }));

    const transitionsA = a.transicoes.map(t => ({
        ...t,
        id: generateId('t'),
        de: `${prefixA}${t.de}`,
        para: `${prefixA}${t.para}`
    }));

    const transitionsB = b.transicoes.map(t => ({
        ...t,
        id: generateId('t'),
        de: `${prefixB}${t.de}`,
        para: `${prefixB}${t.para}`
    }));

    const newInitial: Estado = {
        id: generateId('q'),
        label: 'q0',
        x: 0,
        y: 0,
        isInicial: true,
        isFinal: false
    };

    const initialA = a.estados.find(s => s.isInicial);
    const initialB = b.estados.find(s => s.isInicial);

    const epsilonTransitions: Transicao[] = [];
    if (initialA) {
        epsilonTransitions.push({
            id: generateId('t'),
            de: newInitial.id,
            para: `${prefixA}${initialA.id}`,
            simbolo: EPSILON_SYMBOL,
            curvatura: 0
        });
    }
    if (initialB) {
        epsilonTransitions.push({
            id: generateId('t'),
            de: newInitial.id,
            para: `${prefixB}${initialB.id}`,
            simbolo: EPSILON_SYMBOL,
            curvatura: 0
        });
    }

    const allStates = [newInitial, ...statesA, ...statesB];
    const allTransitions = [...transitionsA, ...transitionsB, ...epsilonTransitions];

    applyLayeredLayout(allStates, allTransitions, newInitial.id);

    return {
        tipo: 'AFN',
        estados: allStates,
        transicoes: allTransitions,
        descricao: `Uniao de ${a.descricao || 'A'} e ${b.descricao || 'B'}`
    };
}

/**
 * Create the concatenation of two automata: L(a)L(b)
 */
export function concatenateAutomata(a: AutomatoData, b: AutomatoData): AutomatoData {
    const prefixA = 'a_';
    const prefixB = 'b_';

    const statesA = a.estados.map(s => ({
        ...s,
        id: `${prefixA}${s.id}`,
        label: s.label || s.id,
        isFinal: false // Remove final status from A's states
    }));

    const statesB = b.estados.map(s => ({
        ...s,
        id: `${prefixB}${s.id}`,
        label: `${s.label || s.id}'`,
        isInicial: false // Remove initial status from B's states
    }));

    const transitionsA = a.transicoes.map(t => ({
        ...t,
        id: generateId('t'),
        de: `${prefixA}${t.de}`,
        para: `${prefixA}${t.para}`
    }));

    const transitionsB = b.transicoes.map(t => ({
        ...t,
        id: generateId('t'),
        de: `${prefixB}${t.de}`,
        para: `${prefixB}${t.para}`
    }));

    // Epsilon transitions from A's final states to B's initial state
    const finalsA = a.estados.filter(s => s.isFinal);
    const initialB = b.estados.find(s => s.isInicial);
    const epsilonTransitions: Transicao[] = [];

    if (initialB) {
        finalsA.forEach(final => {
            epsilonTransitions.push({
                id: generateId('t'),
                de: `${prefixA}${final.id}`,
                para: `${prefixB}${initialB.id}`,
                simbolo: EPSILON_SYMBOL,
                curvatura: 0
            });
        });
    }

    const allStates = [...statesA, ...statesB];
    const allTransitions = [...transitionsA, ...transitionsB, ...epsilonTransitions];

    const initialState = allStates.find(s => s.isInicial);
    applyLayeredLayout(allStates, allTransitions, initialState?.id);

    return {
        tipo: 'AFN',
        estados: allStates,
        transicoes: allTransitions,
        descricao: `Concatenacao de ${a.descricao || 'A'} e ${b.descricao || 'B'}`
    };
}

/**
 * Create the Kleene star of an automaton: L(a)*
 */
export function kleeneStarAutomaton(a: AutomatoData): AutomatoData {
    const prefix = 'a_';

    const states = a.estados.map(s => ({
        ...s,
        id: `${prefix}${s.id}`,
        label: s.label || s.id,
        isInicial: false,
        isFinal: false
    }));

    const transitions = a.transicoes.map(t => ({
        ...t,
        id: generateId('t'),
        de: `${prefix}${t.de}`,
        para: `${prefix}${t.para}`
    }));

    // New initial and final state
    const newState: Estado = {
        id: generateId('q'),
        label: 'q0',
        x: 0,
        y: 0,
        isInicial: true,
        isFinal: true
    };

    const initialA = a.estados.find(s => s.isInicial);
    const finalsA = a.estados.filter(s => s.isFinal);

    const epsilonTransitions: Transicao[] = [];

    // New initial to old initial
    if (initialA) {
        epsilonTransitions.push({
            id: generateId('t'),
            de: newState.id,
            para: `${prefix}${initialA.id}`,
            simbolo: EPSILON_SYMBOL,
            curvatura: 0
        });
    }

    // Old finals back to old initial
    finalsA.forEach(final => {
        epsilonTransitions.push({
            id: generateId('t'),
            de: `${prefix}${final.id}`,
            para: newState.id,
            simbolo: EPSILON_SYMBOL,
            curvatura: 0
        });
    });

    const allStates = [newState, ...states];
    const allTransitions = [...transitions, ...epsilonTransitions];

    applyLayeredLayout(allStates, allTransitions, newState.id);

    return {
        tipo: 'AFN',
        estados: allStates,
        transicoes: allTransitions,
        descricao: `Fecho de Kleene de ${a.descricao || 'A'}`
    };
}

/**
 * Create the complement of a DFA: Σ* - L(a)
 */
export function complementAutomaton(automaton: AutomatoData): AutomatoData {
    // Must be a DFA or convert to DFA
    let dfa = automaton;
    if (automaton.tipo !== 'AFD') {
        dfa = nfaToDfa(automaton);
    }

    const alphabet = getAlphabet(dfa);
    const initial = dfa.estados.find(s => s.isInicial);
    if (!initial) {
        throw new Error('Automato sem estado inicial.');
    }

    // Build complete DFA with dead state if needed
    const transitionMap = buildDfaTransitionMap(dfa, alphabet);
    const needsDeadState = dfa.estados.some(state =>
        alphabet.some(symbol => !transitionMap.get(state.id)?.has(symbol))
    );

    const states: Estado[] = dfa.estados.map(s => ({
        ...s,
        isFinal: !s.isFinal // Swap final status
    }));

    if (needsDeadState) {
        states.push({
            id: DEAD_STATE,
            label: 'd',
            x: 0,
            y: 0,
            isInicial: false,
            isFinal: true // Dead state becomes accepting in complement
        });
    }

    const transitions: Transicao[] = [];

    states.forEach(state => {
        alphabet.forEach(symbol => {
            const target = transitionMap.get(state.id)?.get(symbol) ?? DEAD_STATE;
            transitions.push({
                id: generateId('t'),
                de: state.id,
                para: target,
                simbolo: symbol,
                curvatura: 0
            });
        });
    });

    applyLayeredLayout(states, transitions, initial.id);

    return {
        tipo: 'AFD',
        estados: states,
        transicoes: mergeTransitions(transitions),
        descricao: `Complemento de ${automaton.descricao || 'A'}`
    };
}

/**
 * Create the intersection of two DFAs: L(a) ∩ L(b)
 * Uses product construction
 */
export function intersectionAutomata(a: AutomatoData, b: AutomatoData): AutomatoData {
    // Convert to DFA if needed
    let dfaA = a;
    let dfaB = b;
    if (a.tipo !== 'AFD') dfaA = nfaToDfa(a);
    if (b.tipo !== 'AFD') dfaB = nfaToDfa(b);

    const alphabet = Array.from(new Set([...getAlphabet(dfaA), ...getAlphabet(dfaB)])).sort();
    const initialA = dfaA.estados.find(s => s.isInicial);
    const initialB = dfaB.estados.find(s => s.isInicial);

    if (!initialA || !initialB) {
        throw new Error('Ambos automatos devem ter estado inicial.');
    }

    const mapA = buildDfaTransitionMap(dfaA, alphabet);
    const mapB = buildDfaTransitionMap(dfaB, alphabet);

    const finalsA = new Set(dfaA.estados.filter(s => s.isFinal).map(s => s.id));
    const finalsB = new Set(dfaB.estados.filter(s => s.isFinal).map(s => s.id));

    const productStates: Estado[] = [];
    const productTransitions: Transicao[] = [];
    const stateMap = new Map<string, string>();

    const queue: Array<{ aId: string; bId: string }> = [{ aId: initialA.id, bId: initialB.id }];
    let counter = 0;

    while (queue.length > 0) {
        const { aId, bId } = queue.shift()!;
        const key = `${aId}::${bId}`;
        if (stateMap.has(key)) continue;

        const newId = `q${counter++}`;
        stateMap.set(key, newId);

        const labelA = dfaA.estados.find(s => s.id === aId)?.label || aId;
        const labelB = dfaB.estados.find(s => s.id === bId)?.label || bId;

        productStates.push({
            id: newId,
            label: `(${labelA},${labelB})`,
            x: 0,
            y: 0,
            isInicial: aId === initialA.id && bId === initialB.id,
            isFinal: finalsA.has(aId) && finalsB.has(bId)
        });

        for (const symbol of alphabet) {
            const nextA = mapA.get(aId)?.get(symbol) ?? DEAD_STATE;
            const nextB = mapB.get(bId)?.get(symbol) ?? DEAD_STATE;
            const nextKey = `${nextA}::${nextB}`;

            if (!stateMap.has(nextKey)) {
                queue.push({ aId: nextA, bId: nextB });
            }

            productTransitions.push({
                id: generateId('t'),
                de: newId,
                para: stateMap.get(nextKey) || newId, // Temporary, will be fixed later
                simbolo: symbol,
                curvatura: 0
            });
        }
    }

    // Fix transition targets
    productTransitions.forEach(t => {
        // Find the original keys and resolve
        productStates.forEach((s) => {
            if (t.de === s.id) {
                const originalPair = Array.from(stateMap.entries()).find(([_, v]) => v === s.id)?.[0];
                if (originalPair) {
                    const [aId, bId] = originalPair.split('::');
                    const nextA = mapA.get(aId)?.get(t.simbolo) ?? DEAD_STATE;
                    const nextB = mapB.get(bId)?.get(t.simbolo) ?? DEAD_STATE;
                    const targetKey = `${nextA}::${nextB}`;
                    t.para = stateMap.get(targetKey) || t.para;
                }
            }
        });
    });

    const initialState = productStates.find(s => s.isInicial);
    applyLayeredLayout(productStates, productTransitions, initialState?.id);

    return {
        tipo: 'AFD',
        estados: productStates,
        transicoes: mergeTransitions(productTransitions),
        descricao: `Intersecao de ${a.descricao || 'A'} e ${b.descricao || 'B'}`
    };
}
