/**
 * Simulation Strategy Types
 *
 * Defines the interface and types for the Strategy Pattern implementation
 * of automaton simulation logic.
 */

import type {
    AutomatoData,
    SimulationStep,
    Transicao,
} from '../types';

// ============================================================================
// Configuration Types
// ============================================================================

export interface SimulationConfig {
    /** Maximum steps for Turing Machine before halting */
    turingMaxSteps: number;
    /** Whether to detect infinite loops in Turing Machine */
    turingDetectLoops: boolean;
}

export interface TokenizationConfig {
    mode: 'auto' | 'char' | 'separator';
    separator: string;
}

// ============================================================================
// Strategy Interface
// ============================================================================

/**
 * Interface for simulation strategies.
 * Each automaton type implements this interface to provide
 * type-specific simulation logic.
 */
export interface SimulationStrategy {
    /**
     * Creates the initial simulation state for the automaton
     */
    createInitialState(
        automaton: AutomatoData,
        inputTokens: string[]
    ): SimulationStep;

    /**
     * Performs a single simulation step
     * @returns The next simulation step
     */
    step(
        currentState: SimulationStep,
        automaton: AutomatoData,
        context: SimulationContext
    ): SimulationStepResult;

    /**
     * Checks if the simulation can accept (input exhausted + acceptance condition)
     */
    checkAcceptance(
        currentState: SimulationStep,
        automaton: AutomatoData
    ): AcceptanceResult;
}

// ============================================================================
// Context and Result Types
// ============================================================================

export interface SimulationContext {
    config: SimulationConfig;
    historyLength: number;
    seenConfigs?: Set<string>;
}

export interface SimulationStepResult {
    nextState: SimulationStep;
    usedTransitions: string[];
    finished: boolean;
    accepted?: boolean;
}

export interface AcceptanceResult {
    finished: boolean;
    accepted: boolean;
    reason?: string;
}

// ============================================================================
// Helper Types
// ============================================================================

export interface StateLabelMap {
    get(id: string): string | undefined;
}

export interface TransitionMap {
    get(id: string): Transicao | undefined;
}

/** Result of finding active transitions */
export interface ActiveTransitionsResult {
    transitionIds: string[];
    directTargets: Set<string>;
}

// ============================================================================
// Strategy Registry Type
// ============================================================================

export type StrategyRegistry = {
    [K in AutomatoData['tipo']]?: SimulationStrategy;
};
