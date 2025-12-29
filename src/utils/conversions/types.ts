/**
 * Type definitions for automaton conversions
 * @module conversions/types
 */

import type { AutomatoData } from '../../types';

/** Validation issue types */
export interface ValidationIssue {
    type: 'error' | 'warning' | 'info';
    message: string;
    stateId?: string;
    transitionId?: string;
}

/** DFA equivalence check result */
export interface DfaEquivalenceResult {
    equivalent: boolean;
    witness?: string[];
    reason?: string;
}

/** Step in a conversion process (for educational display) */
export interface ConversionStep {
    title: string;
    detail: string;
}

/** Result of a conversion with step-by-step explanation */
export interface ConversionWithSteps {
    automaton: AutomatoData;
    steps: ConversionStep[];
    warnings?: string[];
}

/** Result of a language property check */
export interface LanguageCheckResult {
    ok: boolean;
    witness?: string[];
    reason?: string;
}

/** Result of grammar-based conversion */
export interface GrammarConversionResult {
    automaton?: AutomatoData;
    warnings?: string[];
    error?: string;
}

/** Result of PDA to CFG conversion */
export interface PdaToCfgResult {
    grammar?: string;
    warnings?: string[];
    error?: string;
}
