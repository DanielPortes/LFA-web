/**
 * DFA minimization using Hopcroft's algorithm
 * @module conversions/minimize
 */

import type { AutomatoData, Estado, Transicao } from '../../types';
import { getAlphabet } from './alphabet';
import {
    generateId,
    applyLayeredLayout,
    mergeTransitions,
    buildDfaTransitionMap,
    DEAD_STATE
} from './helpers';
import type { ConversionStep, ConversionWithSteps } from './types';

const MAX_STEPS = 200;

function pushStep(steps: ConversionStep[], title: string, detail: string): void {
    if (steps.length >= MAX_STEPS) return;
    steps.push({ title, detail });
}

/**
 * Minimize a DFA using Hopcroft's algorithm
 */
export function minimizeDfa(dfa: AutomatoData): AutomatoData {
    if (dfa.tipo !== 'AFD') {
        throw new Error('Somente AFD pode ser minimizado.');
    }

    const alphabet = getAlphabet(dfa);
    const initial = dfa.estados.find(s => s.isInicial);
    if (!initial) {
        throw new Error('AFD sem estado inicial.');
    }

    const transitionMap = buildDfaTransitionMap(dfa, alphabet);

    // Find reachable states
    const reachable = new Set<string>();
    const queue = [initial.id];
    while (queue.length > 0) {
        const stateId = queue.shift()!;
        if (reachable.has(stateId)) continue;
        reachable.add(stateId);
        for (const symbol of alphabet) {
            const next = transitionMap.get(stateId)?.get(symbol) ?? DEAD_STATE;
            if (!reachable.has(next)) {
                queue.push(next);
            }
        }
    }

    // Include dead state if needed
    if (!reachable.has(DEAD_STATE) && alphabet.length > 0) {
        const hasMissing = dfa.estados.some(state =>
            alphabet.some(symbol => !transitionMap.get(state.id)?.has(symbol))
        );
        if (hasMissing) {
            reachable.add(DEAD_STATE);
        }
    }

    // Initial partitions: final vs non-final
    const finals = new Set(dfa.estados.filter(s => s.isFinal).map(s => s.id));
    const nonFinals = new Set(Array.from(reachable).filter(id => !finals.has(id)));

    const partitions: Set<string>[] = [];
    if (finals.size > 0) partitions.push(new Set(Array.from(reachable).filter(id => finals.has(id))));
    if (nonFinals.size > 0) partitions.push(nonFinals);

    const worklist: Set<string>[] = partitions.map(p => new Set(p));

    // Hopcroft refinement
    while (worklist.length > 0) {
        const a = worklist.pop()!;
        for (const symbol of alphabet) {
            const pre = new Set<string>();
            for (const stateId of reachable) {
                const next = transitionMap.get(stateId)?.get(symbol) ?? DEAD_STATE;
                if (a.has(next)) pre.add(stateId);
            }
            for (let i = 0; i < partitions.length; i++) {
                const p = partitions[i];
                const intersection = new Set<string>();
                const difference = new Set<string>();
                p.forEach(stateId => {
                    if (pre.has(stateId)) intersection.add(stateId);
                    else difference.add(stateId);
                });
                if (intersection.size > 0 && difference.size > 0) {
                    partitions[i] = intersection;
                    partitions.splice(i + 1, 0, difference);
                    const workIndex = worklist.findIndex(w => w === p);
                    if (workIndex >= 0) {
                        worklist.splice(workIndex, 1, intersection, difference);
                    } else {
                        worklist.push(intersection.size <= difference.size ? intersection : difference);
                    }
                }
            }
        }
    }

    // Build minimized automaton
    const stateLabelMap = new Map(dfa.estados.map(s => [s.id, s.label || s.id]));
    const partitionIds = new Map<string, string>();
    const partitionRepresentatives = new Map<string, string>();

    const minimizedStates: Estado[] = partitions.map((group, idx) => {
        const ids = Array.from(group);
        const id = `q${idx}`;
        ids.forEach(oldId => partitionIds.set(oldId, id));
        partitionRepresentatives.set(id, ids[0]);
        const label = `{${ids.map(oldId => stateLabelMap.get(oldId) || oldId).join(',')}}`;
        return {
            id,
            label,
            x: 0,
            y: 0,
            isInicial: ids.includes(initial.id),
            isFinal: ids.some(oldId => finals.has(oldId))
        };
    });

    const minimizedTransitions: Transicao[] = [];
    minimizedStates.forEach(minState => {
        const representative = partitionRepresentatives.get(minState.id) ?? minState.id;
        for (const symbol of alphabet) {
            const next = transitionMap.get(representative)?.get(symbol) ?? DEAD_STATE;
            const target = partitionIds.get(next);
            if (!target) continue;
            minimizedTransitions.push({
                id: generateId('t'),
                de: minState.id,
                para: target,
                simbolo: symbol,
                curvatura: 0
            });
        }
    });

    applyLayeredLayout(minimizedStates, minimizedTransitions, minimizedStates.find(s => s.isInicial)?.id);

    return {
        tipo: 'AFD',
        estados: minimizedStates,
        transicoes: mergeTransitions(minimizedTransitions),
        descricao: `AFD minimizado de ${dfa.descricao || 'AFD'}`
    };
}

/**
 * Minimize DFA with step-by-step explanation
 */
export function minimizeDfaWithSteps(dfa: AutomatoData): ConversionWithSteps {
    if (dfa.tipo !== 'AFD') {
        throw new Error('Somente AFD pode ser minimizado.');
    }

    const steps: ConversionStep[] = [];
    const alphabet = getAlphabet(dfa);
    const initial = dfa.estados.find(s => s.isInicial);
    if (!initial) {
        throw new Error('AFD sem estado inicial.');
    }

    const transitionMap = buildDfaTransitionMap(dfa, alphabet);

    // Find reachable states
    const reachable = new Set<string>();
    const queue = [initial.id];
    while (queue.length > 0) {
        const stateId = queue.shift()!;
        if (reachable.has(stateId)) continue;
        reachable.add(stateId);
        for (const symbol of alphabet) {
            const next = transitionMap.get(stateId)?.get(symbol) ?? DEAD_STATE;
            if (!reachable.has(next)) {
                queue.push(next);
            }
        }
    }

    const removed = dfa.estados.filter(s => !reachable.has(s.id)).map(s => s.label || s.id);
    if (removed.length > 0) {
        pushStep(steps, 'Inalcancaveis removidos', removed.join(', '));
    }

    if (!reachable.has(DEAD_STATE) && alphabet.length > 0) {
        const hasMissing = dfa.estados.some(state =>
            alphabet.some(symbol => !transitionMap.get(state.id)?.has(symbol))
        );
        if (hasMissing) {
            reachable.add(DEAD_STATE);
        }
    }

    const finals = new Set(dfa.estados.filter(s => s.isFinal).map(s => s.id));
    const nonFinals = new Set(Array.from(reachable).filter(id => !finals.has(id)));

    const partitions: Set<string>[] = [];
    if (finals.size > 0) partitions.push(new Set(Array.from(reachable).filter(id => finals.has(id))));
    if (nonFinals.size > 0) partitions.push(nonFinals);

    pushStep(steps, 'Particoes iniciais', `${finals.size} finais, ${nonFinals.size} nao-finais`);

    const worklist: Set<string>[] = partitions.map(p => new Set(p));

    while (worklist.length > 0) {
        const a = worklist.pop()!;
        for (const symbol of alphabet) {
            const pre = new Set<string>();
            for (const stateId of reachable) {
                const next = transitionMap.get(stateId)?.get(symbol) ?? DEAD_STATE;
                if (a.has(next)) pre.add(stateId);
            }
            for (let i = 0; i < partitions.length; i++) {
                const p = partitions[i];
                const intersection = new Set<string>();
                const difference = new Set<string>();
                p.forEach(stateId => {
                    if (pre.has(stateId)) intersection.add(stateId);
                    else difference.add(stateId);
                });
                if (intersection.size > 0 && difference.size > 0) {
                    partitions[i] = intersection;
                    partitions.splice(i + 1, 0, difference);
                    pushStep(
                        steps,
                        `Divisao por ${symbol}`,
                        `{${Array.from(p).join(', ')}} -> {${Array.from(intersection).join(', ')}} | {${Array.from(difference).join(', ')}}`
                    );
                    const workIndex = worklist.findIndex(w => w === p);
                    if (workIndex >= 0) {
                        worklist.splice(workIndex, 1, intersection, difference);
                    } else {
                        worklist.push(intersection.size <= difference.size ? intersection : difference);
                    }
                }
            }
        }
    }

    const stateLabelMap = new Map(dfa.estados.map(s => [s.id, s.label || s.id]));
    const partitionIds = new Map<string, string>();
    const partitionRepresentatives = new Map<string, string>();

    const minimizedStates: Estado[] = partitions.map((group, idx) => {
        const ids = Array.from(group);
        const id = `q${idx}`;
        ids.forEach(oldId => partitionIds.set(oldId, id));
        partitionRepresentatives.set(id, ids[0]);
        const label = `{${ids.map(oldId => stateLabelMap.get(oldId) || oldId).join(',')}}`;
        return {
            id,
            label,
            x: 0,
            y: 0,
            isInicial: ids.includes(initial.id),
            isFinal: ids.some(oldId => finals.has(oldId))
        };
    });

    const minimizedTransitions: Transicao[] = [];
    minimizedStates.forEach(minState => {
        const representative = partitionRepresentatives.get(minState.id) ?? minState.id;
        for (const symbol of alphabet) {
            const next = transitionMap.get(representative)?.get(symbol) ?? DEAD_STATE;
            const target = partitionIds.get(next);
            if (!target) continue;
            minimizedTransitions.push({
                id: generateId('t'),
                de: minState.id,
                para: target,
                simbolo: symbol,
                curvatura: 0
            });
        }
    });

    applyLayeredLayout(minimizedStates, minimizedTransitions, minimizedStates.find(s => s.isInicial)?.id);

    return {
        automaton: {
            tipo: 'AFD',
            estados: minimizedStates,
            transicoes: mergeTransitions(minimizedTransitions),
            descricao: `AFD minimizado de ${dfa.descricao || 'AFD'}`
        },
        steps
    };
}
