/**
 * Simulation Module
 *
 * Exports the simulation engine and all related types and strategies.
 */

// Types
export type {
    SimulationStrategy,
    SimulationConfig,
    SimulationContext,
    SimulationStepResult,
    AcceptanceResult,
    TokenizationConfig,
    StrategyRegistry,
} from './types';

// Engine
export {
    getStrategy,
    createInitialState,
    performStep,
    checkAcceptance,
    DEFAULT_SIMULATION_CONFIG,
} from './SimulationEngine';

// Strategies (for testing and extension)
export {
    FiniteAutomatonStrategy,
    TransducerStrategy,
    PDAStrategy,
    TuringStrategy,
} from './strategies';
