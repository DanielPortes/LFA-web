/**
 * Simulation Strategy for Pushdown Automata (AP)
 */

import type {
    AutomatoData,
    SimulationStep,
    PdaConfiguration,
} from '../../types';
import { isAP } from '../../types';
import type {
    SimulationStrategy,
    SimulationContext,
    SimulationStepResult,
    AcceptanceResult,
} from '../types';
import { getPdaEpsilonClosure, performPdaStep } from '../../utils/pda';

export class PDAStrategy implements SimulationStrategy {
    createInitialState(
        automaton: AutomatoData,
        inputTokens: string[]
    ): SimulationStep {
        if (!isAP(automaton)) {
            throw new Error('PDAStrategy requires AP automaton type');
        }

        const initialStates = automaton.estados
            .filter((e) => e.isInicial)
            .map((e) => e.id);

        const baseStack = automaton.simboloInicialPilha
            ? [automaton.simboloInicialPilha]
            : [];

        const initialConfigs: PdaConfiguration[] = initialStates.map((id) => ({
            stateId: id,
            stack: [...baseStack],
        }));

        const configs = getPdaEpsilonClosure(initialConfigs, automaton.transicoes);
        const activeStates = Array.from(
            new Set(configs.map((c) => c.stateId))
        );

        return {
            activeStates,
            remainingInput: inputTokens,
            processedInput: [],
            status: 'running',
            activeConfigs: configs,
        };
    }

    step(
        currentState: SimulationStep,
        automaton: AutomatoData,
        context: SimulationContext
    ): SimulationStepResult {
        void context;
        const currentConfigs = currentState.activeConfigs ?? [];
        const currentSymbol = currentState.remainingInput[0];

        const result = performPdaStep(
            currentConfigs,
            currentSymbol,
            automaton.transicoes
        );

        if (result.configs.length === 0) {
            return {
                nextState: { ...currentState, status: 'rejected' },
                usedTransitions: [],
                finished: true,
                accepted: false,
            };
        }

        const nextState: SimulationStep = {
            activeStates: Array.from(
                new Set(result.configs.map((c) => c.stateId))
            ),
            remainingInput: currentState.remainingInput.slice(1),
            processedInput: [...currentState.processedInput, currentSymbol],
            status: 'running',
            activeConfigs: result.configs,
            pdaEdges: result.edges,
        };

        return {
            nextState,
            usedTransitions: result.usedTransitions,
            finished: false,
        };
    }

    checkAcceptance(
        currentState: SimulationStep,
        automaton: AutomatoData
    ): AcceptanceResult {
        if (currentState.remainingInput.length > 0) {
            return { finished: false, accepted: false };
        }

        if (!isAP(automaton)) {
            return { finished: true, accepted: false };
        }

        const configs = currentState.activeConfigs ?? [];
        const acceptance = automaton.pdaAcceptance ?? 'final';

        const hasFinal = configs.some((cfg) =>
            automaton.estados.find((e) => e.id === cfg.stateId)?.isFinal
        );

        const hasEmpty = configs.some((cfg) => cfg.stack.length === 0);

        let accepted = false;
        switch (acceptance) {
            case 'final':
                accepted = hasFinal;
                break;
            case 'empty':
                accepted = hasEmpty;
                break;
            case 'both':
                accepted = hasFinal || hasEmpty;
                break;
        }

        return {
            finished: true,
            accepted,
            reason: accepted
                ? undefined
                : 'Nenhuma configuracao final ou pilha vazia',
        };
    }
}
