/**
 * Simulation Strategy for Transducers (Moore and Mealy Machines)
 */

import type {
    AutomatoData,
    SimulationStep,
    Transicao,
} from '../../types';
import { isMoore, isMealy } from '../../types';
import type {
    SimulationStrategy,
    SimulationContext,
    SimulationStepResult,
    AcceptanceResult,
} from '../types';
import { getEpsilonClosure } from '../../utils/automatonLogic';
import { matchesSymbol } from '../../utils/symbols';

export class TransducerStrategy implements SimulationStrategy {
    createInitialState(
        automaton: AutomatoData,
        inputTokens: string[]
    ): SimulationStep {
        const initialStates = automaton.estados
            .filter((e) => e.isInicial)
            .map((e) => e.id);

        const activeStates = getEpsilonClosure(initialStates, automaton.transicoes);

        // For Moore machines, output is associated with the initial state
        let output: string[] | undefined;
        let outputStatus: 'ok' | 'ambiguous' = 'ok';

        if (isMoore(automaton)) {
            if (activeStates.length === 1) {
                const stateOutput = automaton.estados.find(
                    (s) => s.id === activeStates[0]
                )?.output;
                if (stateOutput !== undefined && stateOutput !== '') {
                    output = [stateOutput];
                }
            } else if (activeStates.length > 1) {
                outputStatus = 'ambiguous';
                output = [];
            }
        } else if (isMealy(automaton)) {
            output = [];
        }

        return {
            activeStates,
            remainingInput: inputTokens,
            processedInput: [],
            status: 'running',
            output,
            outputStatus,
        };
    }

    step(
        currentState: SimulationStep,
        automaton: AutomatoData,
        context: SimulationContext
    ): SimulationStepResult {
        void context;
        const currentSymbol = currentState.remainingInput[0];

        const { transitionIds, directTargets } = this.findActiveTransitions(
            currentState.activeStates,
            currentSymbol,
            automaton.transicoes
        );

        if (directTargets.size === 0) {
            return {
                nextState: { ...currentState, status: 'rejected' },
                usedTransitions: [],
                finished: true,
                accepted: false,
            };
        }

        const nextActiveStates = getEpsilonClosure(
            Array.from(directTargets),
            automaton.transicoes
        );

        // Calculate output
        const { nextOutput, nextOutputStatus } = this.calculateOutput(
            currentState,
            nextActiveStates,
            transitionIds,
            automaton
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
            output: nextOutput,
            outputStatus: nextOutputStatus,
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
        if (currentState.remainingInput.length > 0) {
            return { finished: false, accepted: false };
        }

        const hasFinal = currentState.activeStates.some((id) =>
            automaton.estados.find((e) => e.id === id)?.isFinal
        );

        return {
            finished: true,
            accepted: hasFinal,
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

    private calculateOutput(
        currentState: SimulationStep,
        nextActiveStates: string[],
        usedTransitions: string[],
        automaton: AutomatoData
    ): { nextOutput: string[] | undefined; nextOutputStatus: 'ok' | 'ambiguous' } {
        let nextOutput = currentState.output ? [...currentState.output] : undefined;
        let nextOutputStatus = currentState.outputStatus ?? 'ok';

        if (isMoore(automaton) && nextActiveStates.length > 0) {
            if (nextActiveStates.length === 1) {
                const stateOutput = automaton.estados.find(
                    (s) => s.id === nextActiveStates[0]
                )?.output;
                if (stateOutput !== undefined && stateOutput !== '') {
                    nextOutput = [...(nextOutput ?? []), stateOutput];
                }
            } else {
                nextOutputStatus = 'ambiguous';
            }
        } else if (isMealy(automaton) && usedTransitions.length > 0) {
            if (usedTransitions.length === 1) {
                const output = this.getMealyOutput(usedTransitions[0], automaton.transicoes);
                if (output) {
                    nextOutput = [...(nextOutput ?? []), output];
                }
            } else {
                nextOutputStatus = 'ambiguous';
            }
        }

        return { nextOutput, nextOutputStatus };
    }

    private getMealyOutput(transitionId: string, transitions: Transicao[]): string {
        const transition = transitions.find((t) => t.id === transitionId);
        if (!transition) return '';

        if (transition.output !== undefined && transition.output !== '') {
            return transition.output;
        }

        const parts = transition.simbolo.split('/');
        if (parts.length >= 2) {
            return parts.slice(1).join('/').trim();
        }

        return '';
    }
}
