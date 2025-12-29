/**
 * Moore and Mealy machine conversions
 * @module conversions/transducers
 */

import type { AutomatoData, Estado, Transicao } from '../../types';
import { generateId, applyLayeredLayout } from './helpers';

/**
 * Convert Moore machine to Mealy machine
 */
export function mooreToMealy(moore: AutomatoData): AutomatoData {
    if (moore.tipo !== 'Moore') {
        throw new Error('Entrada deve ser uma Maquina de Moore.');
    }

    const outputMap = new Map<string, string>();
    moore.estados.forEach(s => {
        outputMap.set(s.id, s.output || '');
    });

    const mealyTransitions: Transicao[] = moore.transicoes.map(t => {
        const targetOutput = outputMap.get(t.para) || '';
        return {
            ...t,
            id: generateId('t'),
            output: targetOutput,
            simbolo: t.simbolo // Keep input symbol, add output
        };
    });

    const mealyStates: Estado[] = moore.estados.map(s => ({
        ...s,
        output: undefined // Mealy machines don't have state outputs
    }));

    return {
        tipo: 'Mealy',
        estados: mealyStates,
        transicoes: mealyTransitions,
        descricao: `Mealy convertido de Moore`
    };
}

/**
 * Convert Mealy machine to Moore machine
 * This may create additional states due to the conversion
 */
export function mealyToMoore(mealy: AutomatoData): AutomatoData {
    if (mealy.tipo !== 'Mealy') {
        throw new Error('Entrada deve ser uma Maquina de Mealy.');
    }

    // Group transitions by target state and output
    const transitionsByTarget = new Map<string, Map<string, Transicao[]>>();

    mealy.transicoes.forEach(t => {
        const output = t.output || '';
        if (!transitionsByTarget.has(t.para)) {
            transitionsByTarget.set(t.para, new Map());
        }
        const outputMap = transitionsByTarget.get(t.para)!;
        if (!outputMap.has(output)) {
            outputMap.set(output, []);
        }
        outputMap.get(output)!.push(t);
    });

    const mooreStates: Estado[] = [];
    const mooreTransitions: Transicao[] = [];
    const stateMapping = new Map<string, Map<string, string>>(); // originalId -> output -> newId

    let stateCounter = 0;

    // Create states for each (original state, output) pair
    mealy.estados.forEach(originalState => {
        const outputGroups = transitionsByTarget.get(originalState.id);

        if (!outputGroups || outputGroups.size === 0) {
            // No incoming transitions - keep state with empty output
            const newId = `q${stateCounter++}`;
            if (!stateMapping.has(originalState.id)) {
                stateMapping.set(originalState.id, new Map());
            }
            stateMapping.get(originalState.id)!.set('', newId);

            mooreStates.push({
                id: newId,
                label: originalState.label || originalState.id,
                x: 0,
                y: 0,
                isInicial: originalState.isInicial,
                isFinal: originalState.isFinal,
                output: ''
            });
        } else if (outputGroups.size === 1) {
            // All incoming transitions have same output - one state
            const output = Array.from(outputGroups.keys())[0];
            const newId = `q${stateCounter++}`;

            if (!stateMapping.has(originalState.id)) {
                stateMapping.set(originalState.id, new Map());
            }
            stateMapping.get(originalState.id)!.set(output, newId);

            mooreStates.push({
                id: newId,
                label: originalState.label || originalState.id,
                x: 0,
                y: 0,
                isInicial: originalState.isInicial,
                isFinal: originalState.isFinal,
                output
            });
        } else {
            // Multiple outputs - split state
            let first = true;
            outputGroups.forEach((_, output) => {
                const newId = `q${stateCounter++}`;

                if (!stateMapping.has(originalState.id)) {
                    stateMapping.set(originalState.id, new Map());
                }
                stateMapping.get(originalState.id)!.set(output, newId);

                mooreStates.push({
                    id: newId,
                    label: `${originalState.label || originalState.id}${first ? '' : `'`}`,
                    x: 0,
                    y: 0,
                    isInicial: first && originalState.isInicial,
                    isFinal: originalState.isFinal,
                    output
                });
                first = false;
            });
        }
    });

    // Create transitions
    mealy.transicoes.forEach(t => {
        const output = t.output || '';
        const sourceMapping = stateMapping.get(t.de);
        const targetMapping = stateMapping.get(t.para);

        if (!sourceMapping || !targetMapping) return;

        // Source can be any variant of the original state
        const sourceIds = Array.from(sourceMapping.values());
        const targetId = targetMapping.get(output);

        if (!targetId) return;

        sourceIds.forEach(sourceId => {
            mooreTransitions.push({
                id: generateId('t'),
                de: sourceId,
                para: targetId,
                simbolo: t.simbolo,
                curvatura: 0
            });
        });
    });

    const initialState = mooreStates.find(s => s.isInicial);
    applyLayeredLayout(mooreStates, mooreTransitions, initialState?.id);

    return {
        tipo: 'Moore',
        estados: mooreStates,
        transicoes: mooreTransitions,
        descricao: `Moore convertido de Mealy`
    };
}

/**
 * Verify that a transducer (Moore or Mealy) is deterministic
 */
export function verifyTransducerDeterminism(automaton: AutomatoData): boolean {
    if (automaton.tipo !== 'Moore' && automaton.tipo !== 'Mealy') {
        return false;
    }

    const transitionMap = new Map<string, Set<string>>();

    for (const t of automaton.transicoes) {
        const key = `${t.de}::${t.simbolo}`;
        if (!transitionMap.has(key)) {
            transitionMap.set(key, new Set());
        }
        transitionMap.get(key)!.add(t.para);
    }

    for (const targets of transitionMap.values()) {
        if (targets.size > 1) return false;
    }

    return true;
}
