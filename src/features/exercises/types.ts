import type { AutomatoData, Exercicio } from '../../types';

export type SolverMode = 'automaton' | 'regex' | 'text' | 'grammar';
export type ExerciseTestStatus = 'pass' | 'fail' | 'running';
export type ExerciseEquivalenceStatus = 'pass' | 'fail' | null;

export interface ExerciseSolverStartOptions {
    initialAutomaton?: AutomatoData;
}

export interface CategoryConfig {
    id: string;
    label: string;
    tipo?: AutomatoData['tipo'];
    mode: SolverMode;
}

export interface ConverterData {
    automaton?: AutomatoData | null;
    grammar?: string;
    regex?: string;
}

export interface ExerciseFailure {
    input: string;
    expected: string;
    received: string;
    reason?: string;
}

export type ExerciseDatabase = Record<string, Exercicio[]>;
