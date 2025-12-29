/**
 * Simulation-specific type definitions
 *
 * @module types/simulation
 */

import type { SimulationStep } from '../types';

/** Supported automaton types for simulation */
export type SimulatableType = 'AFD' | 'AFN' | 'AP' | 'MT' | 'ALL' | 'Moore' | 'Mealy';

/** Tokenization mode for input strings */
export type TokenizationMode = 'auto' | 'char' | 'separator';

/** PDA acceptance mode */
export type PdaAcceptanceMode = 'final' | 'empty' | 'both';

/** Simulation status */
export type SimulationStatus = 'idle' | 'running' | 'paused' | 'finished';

/** PDA configuration (state + stack) */
export interface PdaConfig {
    stateId: string;
    stack: string[];
}

/** Turing machine configuration */
export interface TuringConfig {
    stateId: string;
    tape: Record<number, string>;
    headPos: number;
}

/** Tokenization configuration */
export interface TokenizationConfig {
    mode: TokenizationMode;
    separator: string;
}

/** Simulation configuration */
export interface SimulationConfig {
    speed: number;
    turingMaxSteps: number;
    turingDetectLoops: boolean;
    grammarMaxSteps: number;
    grammarMaxQueue: number;
    grammarMaxSymbols: number;
}

/** Default simulation configuration */
export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
    speed: 1000,
    turingMaxSteps: 500,
    turingDetectLoops: true,
    grammarMaxSteps: 20,
    grammarMaxQueue: 2000,
    grammarMaxSymbols: 20
};

/** Simulation result */
export interface SimulationResult {
    accepted: boolean;
    steps: SimulationStep[];
    finalState?: string;
    output?: string[];
    reason?: string;
}

/** Batch test result */
export interface BatchTestResult {
    input: string;
    expected: 'accept' | 'reject';
    actual: 'accept' | 'reject';
    passed: boolean;
}

/** View state for canvas */
export interface ViewState {
    zoom: number;
    pan: { x: number; y: number };
}
