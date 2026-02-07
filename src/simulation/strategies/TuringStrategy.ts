/**
 * Simulation Strategy for Turing Machines (MT and ALL)
 */

import type {
    AutomatoData,
    SimulationStep,
} from '../../types';
import { isALL } from '../../types';
import type {
    SimulationStrategy,
    SimulationContext,
    SimulationStepResult,
    AcceptanceResult,
} from '../types';
import {
    START_MARKER,
    END_MARKER,
    performTuringStep,
    performALLStep,
    buildTuringConfigKey,
} from '../../utils/turingLogic';

export class TuringStrategy implements SimulationStrategy {
    createInitialState(
        automaton: AutomatoData,
        inputTokens: string[]
    ): SimulationStep {
        const initialStates = automaton.estados
            .filter((e) => e.isInicial)
            .map((e) => e.id);

        const isLinearBounded = isALL(automaton);

        // Build initial tape
        const tape: Record<number, string> = {};
        tape[0] = START_MARKER;
        inputTokens.forEach((token, i) => {
            tape[i + 1] = token;
        });

        if (isLinearBounded) {
            tape[inputTokens.length + 1] = END_MARKER;
        }

        return {
            activeStates: initialStates,
            remainingInput: [],
            processedInput: [],
            status: 'running',
            tape,
            headPos: 0,
        };
    }

    step(
        currentState: SimulationStep,
        automaton: AutomatoData,
        context: SimulationContext
    ): SimulationStepResult {
        const { config, historyLength, seenConfigs } = context;
        const isLinearBounded = isALL(automaton);

        // Check max steps limit
        if (config.turingMaxSteps > 0 && historyLength >= config.turingMaxSteps) {
            return {
                nextState: { ...currentState, status: 'rejected' },
                usedTransitions: [],
                finished: true,
                accepted: false,
            };
        }

        const stateId = currentState.activeStates[0];
        const tape = currentState.tape ?? {};
        const headPos = currentState.headPos ?? 0;

        // Calculate tape boundaries for ALL
        const tapeKeys = Object.keys(tape).map(Number);
        const minIndex = tapeKeys.length > 0 ? Math.min(...tapeKeys) : 0;
        const maxIndex = tapeKeys.length > 0 ? Math.max(...tapeKeys) : 0;

        // Perform the step
        const stepResult = isLinearBounded
            ? performALLStep(stateId, tape, headPos, automaton.transicoes, minIndex, maxIndex)
            : performTuringStep(stateId, tape, headPos, automaton.transicoes);

        // No valid transition - check if current state is final
        if (stepResult.status === 'rejected') {
            const hasFinal = automaton.estados.find((e) => e.id === stateId)?.isFinal;
            return {
                nextState: {
                    ...currentState,
                    status: hasFinal ? 'accepted' : 'rejected',
                },
                usedTransitions: stepResult.usedTransition ? [stepResult.usedTransition] : [],
                finished: true,
                accepted: hasFinal ?? false,
            };
        }

        // Check for loops (infinite loop detection)
        if (config.turingDetectLoops && seenConfigs) {
            const configKey = buildTuringConfigKey(
                stepResult.stateId,
                stepResult.tape,
                stepResult.headPos
            );

            if (seenConfigs.has(configKey)) {
                return {
                    nextState: { ...currentState, status: 'rejected' },
                    usedTransitions: [],
                    finished: true,
                    accepted: false,
                };
            }

            seenConfigs.add(configKey);
        }

        const nextState: SimulationStep = {
            activeStates: [stepResult.stateId],
            remainingInput: [],
            processedInput: [...currentState.processedInput, 'tm-step'],
            status: 'running',
            tape: stepResult.tape,
            headPos: stepResult.headPos,
            usedTransitions: stepResult.usedTransition ? [stepResult.usedTransition] : [],
        };

        return {
            nextState,
            usedTransitions: stepResult.usedTransition ? [stepResult.usedTransition] : [],
            finished: false,
        };
    }

    checkAcceptance(
        currentState: SimulationStep,
        automaton: AutomatoData
    ): AcceptanceResult {
        // For Turing machines, acceptance is checked within the step function
        // when no transition is found or final state is reached
        const stateId = currentState.activeStates[0];
        const hasFinal = automaton.estados.find((e) => e.id === stateId)?.isFinal;

        return {
            finished: hasFinal ?? false,
            accepted: hasFinal ?? false,
        };
    }
}
