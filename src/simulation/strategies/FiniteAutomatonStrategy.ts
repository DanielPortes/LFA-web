/**
 * Simulation Strategy for Finite Automata (AFD and AFN)
 */

import type {
    AutomatoData,
    SimulationStep,
    Transicao,
} from '../../types';
import type {
    SimulationStrategy,
    SimulationContext,
    SimulationStepResult,
    AcceptanceResult,
} from '../types';
import { getEpsilonClosure } from '../../utils/automatonLogic';
import { matchesSymbol } from '../../utils/symbols';

export class FiniteAutomatonStrategy implements SimulationStrategy {
    createInitialState(
        automaton: AutomatoData,
        inputTokens: string[]
    ): SimulationStep {
        const initialStates = automaton.estados
            .filter((e) => e.isInicial)
            .map((e) => e.id);

        const activeStates = getEpsilonClosure(initialStates, automaton.transicoes);

        return {
            activeStates,
            remainingInput: inputTokens,
            processedInput: [],
            status: 'running',
        };
    }

    step(
        currentState: SimulationStep,
        automaton: AutomatoData,
        context: SimulationContext
    ): SimulationStepResult {
        void context;
        const currentSymbol = currentState.remainingInput[0];

        // Find active transitions for the current symbol
        const { transitionIds, directTargets } = this.findActiveTransitions(
            currentState.activeStates,
            currentSymbol,
            automaton.transicoes
        );

        // No valid transitions - reject
        if (directTargets.size === 0) {
            return {
                nextState: { ...currentState, status: 'rejected' },
                usedTransitions: [],
                finished: true,
                accepted: false,
            };
        }

        // Compute epsilon closure of direct targets
        const nextActiveStates = getEpsilonClosure(
            Array.from(directTargets),
            automaton.transicoes
        );

        const nextState: SimulationStep = {
            activeStates: nextActiveStates,
            remainingInput: currentState.remainingInput.slice(1),
            processedInput: [...currentState.processedInput, currentSymbol],
            status: 'running',
            symbol: currentSymbol,
            fromStates: currentState.activeStates,
            usedTransitions: transitionIds,
            directTargets: Array.from(directTargets),
        };

        return {
            nextState,
            usedTransitions: transitionIds,
            finished: false,
        };
    }

    checkAcceptance(
        currentState: SimulationStep,
        automaton: AutomatoData
    ): AcceptanceResult {
        // Input not exhausted - continue simulation
        if (currentState.remainingInput.length > 0) {
            return { finished: false, accepted: false };
        }

        // Check if any active state is final
        const hasFinal = currentState.activeStates.some((id) =>
            automaton.estados.find((e) => e.id === id)?.isFinal
        );

        return {
            finished: true,
            accepted: hasFinal,
            reason: hasFinal ? undefined : 'Nenhum estado final foi alcancado',
        };
    }

    private findActiveTransitions(
        fromStates: string[],
        symbol: string,
        transitions: Transicao[]
    ): { transitionIds: string[]; directTargets: Set<string> } {
        const transitionIds: string[] = [];
        const directTargets = new Set<string>();

        if (!symbol) {
            return { transitionIds, directTargets };
        }

        for (const t of transitions) {
            if (fromStates.includes(t.de) && matchesSymbol(t.simbolo, symbol)) {
                transitionIds.push(t.id);
                directTargets.add(t.para);
            }
        }

        return { transitionIds, directTargets };
    }
}
