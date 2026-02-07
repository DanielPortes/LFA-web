/**
 * Simulation Engine
 *
 * Central engine that orchestrates simulation using the Strategy Pattern.
 * Delegates type-specific logic to the appropriate strategy implementation.
 */

import type { AutomatoData, AutomatoTipo, SimulationStep } from '../types';
import { AutomatoTipos } from '../types';
import type {
    SimulationStrategy,
    SimulationConfig,
    SimulationContext,
    SimulationStepResult,
    StrategyRegistry,
} from './types';
import {
    FiniteAutomatonStrategy,
    TransducerStrategy,
    PDAStrategy,
    TuringStrategy,
} from './strategies';

// ============================================================================
// Strategy Registry
// ============================================================================

const finiteAutomatonStrategy = new FiniteAutomatonStrategy();
const transducerStrategy = new TransducerStrategy();
const pdaStrategy = new PDAStrategy();
const turingStrategy = new TuringStrategy();

const strategyRegistry: StrategyRegistry = {
    [AutomatoTipos.AFD]: finiteAutomatonStrategy,
    [AutomatoTipos.AFN]: finiteAutomatonStrategy,
    [AutomatoTipos.AP]: pdaStrategy,
    [AutomatoTipos.MT]: turingStrategy,
    [AutomatoTipos.ALL]: turingStrategy,
    [AutomatoTipos.Moore]: transducerStrategy,
    [AutomatoTipos.Mealy]: transducerStrategy,
};

// ============================================================================
// Engine Functions
// ============================================================================

/**
 * Gets the appropriate simulation strategy for an automaton type
 */
export function getStrategy(tipo: AutomatoTipo): SimulationStrategy | undefined {
    return strategyRegistry[tipo];
}

/**
 * Creates the initial simulation state for an automaton
 */
export function createInitialState(
    automaton: AutomatoData,
    inputTokens: string[]
): SimulationStep | null {
    const strategy = getStrategy(automaton.tipo);
    if (!strategy) {
        console.warn(`No strategy found for automaton type: ${automaton.tipo}`);
        return null;
    }

    return strategy.createInitialState(automaton, inputTokens);
}

/**
 * Performs a single simulation step
 */
export function performStep(
    currentState: SimulationStep,
    automaton: AutomatoData,
    context: SimulationContext
): SimulationStepResult {
    const strategy = getStrategy(automaton.tipo);
    if (!strategy) {
        return {
            nextState: { ...currentState, status: 'rejected' },
            usedTransitions: [],
            finished: true,
            accepted: false,
        };
    }

    // Check acceptance first if input is exhausted (for non-Turing machines)
    if (!isTuringType(automaton.tipo) && currentState.remainingInput.length === 0) {
        const acceptance = strategy.checkAcceptance(currentState, automaton);
        if (acceptance.finished) {
            return {
                nextState: {
                    ...currentState,
                    status: acceptance.accepted ? 'accepted' : 'rejected',
                },
                usedTransitions: [],
                finished: true,
                accepted: acceptance.accepted,
            };
        }
    }

    return strategy.step(currentState, automaton, context);
}

/**
 * Checks if the current state represents acceptance
 */
export function checkAcceptance(
    currentState: SimulationStep,
    automaton: AutomatoData
): { finished: boolean; accepted: boolean } {
    const strategy = getStrategy(automaton.tipo);
    if (!strategy) {
        return { finished: true, accepted: false };
    }

    return strategy.checkAcceptance(currentState, automaton);
}

// ============================================================================
// Helper Functions
// ============================================================================

function isTuringType(tipo: AutomatoTipo): boolean {
    return tipo === AutomatoTipos.MT || tipo === AutomatoTipos.ALL;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
    turingMaxSteps: 400,
    turingDetectLoops: true,
};
