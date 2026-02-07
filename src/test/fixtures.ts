/**
 * Test fixtures - Automata for testing
 */

import type { AFDData, AFNData, APData } from '../types';

// Simple DFA that accepts strings ending with 'b'
export const simpleDFA: AFDData = {
    tipo: 'AFD',
    estados: [
        { id: 'q0', label: 'q0', x: 100, y: 200, isInicial: true, isFinal: false },
        { id: 'q1', label: 'q1', x: 300, y: 200, isInicial: false, isFinal: true },
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q0', simbolo: 'a', curvatura: 0 },
        { id: 't2', de: 'q0', para: 'q1', simbolo: 'b', curvatura: 0 },
        { id: 't3', de: 'q1', para: 'q0', simbolo: 'a', curvatura: 0 },
        { id: 't4', de: 'q1', para: 'q1', simbolo: 'b', curvatura: 0 },
    ],
};

// NFA with epsilon transitions (accepts a*b*)
export const nfaWithEpsilon: AFNData = {
    tipo: 'AFN',
    estados: [
        { id: 'q0', label: 'q0', x: 100, y: 200, isInicial: true, isFinal: false },
        { id: 'q1', label: 'q1', x: 250, y: 200, isInicial: false, isFinal: false },
        { id: 'q2', label: 'q2', x: 400, y: 200, isInicial: false, isFinal: true },
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q0', simbolo: 'a', curvatura: 0 },
        { id: 't2', de: 'q0', para: 'q1', simbolo: 'ε', curvatura: 0 },
        { id: 't3', de: 'q1', para: 'q1', simbolo: 'b', curvatura: 0 },
        { id: 't4', de: 'q1', para: 'q2', simbolo: 'ε', curvatura: 0 },
    ],
};

// NFA without epsilon (accepts strings with 'ab' substring)
export const nfaWithoutEpsilon: AFNData = {
    tipo: 'AFN',
    estados: [
        { id: 'q0', label: 'q0', x: 100, y: 200, isInicial: true, isFinal: false },
        { id: 'q1', label: 'q1', x: 250, y: 200, isInicial: false, isFinal: false },
        { id: 'q2', label: 'q2', x: 400, y: 200, isInicial: false, isFinal: true },
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q0', simbolo: 'a,b', curvatura: 0 },
        { id: 't2', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
        { id: 't3', de: 'q1', para: 'q2', simbolo: 'b', curvatura: 0 },
        { id: 't4', de: 'q2', para: 'q2', simbolo: 'a,b', curvatura: 0 },
    ],
};

// DFA with redundant states (for minimization testing)
export const redundantDFA: AFDData = {
    tipo: 'AFD',
    estados: [
        { id: 'q0', label: 'q0', x: 100, y: 200, isInicial: true, isFinal: false },
        { id: 'q1', label: 'q1', x: 250, y: 100, isInicial: false, isFinal: true },
        { id: 'q2', label: 'q2', x: 250, y: 300, isInicial: false, isFinal: true }, // Equivalent to q1
        { id: 'q3', label: 'q3', x: 400, y: 200, isInicial: false, isFinal: false },
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
        { id: 't2', de: 'q0', para: 'q2', simbolo: 'b', curvatura: 0 },
        { id: 't3', de: 'q1', para: 'q3', simbolo: 'a', curvatura: 0 },
        { id: 't4', de: 'q1', para: 'q3', simbolo: 'b', curvatura: 0 },
        { id: 't5', de: 'q2', para: 'q3', simbolo: 'a', curvatura: 0 },
        { id: 't6', de: 'q2', para: 'q3', simbolo: 'b', curvatura: 0 },
        { id: 't7', de: 'q3', para: 'q3', simbolo: 'a', curvatura: 0 },
        { id: 't8', de: 'q3', para: 'q3', simbolo: 'b', curvatura: 0 },
    ],
};

// Simple DFA accepting empty string only
export const emptyStringDFA: AFDData = {
    tipo: 'AFD',
    estados: [
        { id: 'q0', label: 'q0', x: 100, y: 200, isInicial: true, isFinal: true },
    ],
    transicoes: [],
};

// DFA accepting 'a' only
export const singleSymbolDFA: AFDData = {
    tipo: 'AFD',
    estados: [
        { id: 'q0', label: 'q0', x: 100, y: 200, isInicial: true, isFinal: false },
        { id: 'q1', label: 'q1', x: 300, y: 200, isInicial: false, isFinal: true },
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
    ],
};

// DFA accepting a+ (one or more 'a')
export const plusDFA: AFDData = {
    tipo: 'AFD',
    estados: [
        { id: 'q0', label: 'q0', x: 100, y: 200, isInicial: true, isFinal: false },
        { id: 'q1', label: 'q1', x: 300, y: 200, isInicial: false, isFinal: true },
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
        { id: 't2', de: 'q1', para: 'q1', simbolo: 'a', curvatura: 0 },
    ],
};

// DFA accepting a* (zero or more 'a')
export const starDFA: AFDData = {
    tipo: 'AFD',
    estados: [
        { id: 'q0', label: 'q0', x: 100, y: 200, isInicial: true, isFinal: true },
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q0', simbolo: 'a', curvatura: 0 },
    ],
};

// Complex NFA with multiple initial states (via epsilon from start)
export const complexNFA: AFNData = {
    tipo: 'AFN',
    estados: [
        { id: 'q0', label: 'q0', x: 100, y: 200, isInicial: true, isFinal: false },
        { id: 'q1', label: 'q1', x: 250, y: 100, isInicial: false, isFinal: false },
        { id: 'q2', label: 'q2', x: 250, y: 300, isInicial: false, isFinal: false },
        { id: 'q3', label: 'q3', x: 400, y: 100, isInicial: false, isFinal: true },
        { id: 'q4', label: 'q4', x: 400, y: 300, isInicial: false, isFinal: true },
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q1', simbolo: 'ε', curvatura: 0 },
        { id: 't2', de: 'q0', para: 'q2', simbolo: 'ε', curvatura: 0 },
        { id: 't3', de: 'q1', para: 'q1', simbolo: 'a', curvatura: 0 },
        { id: 't4', de: 'q1', para: 'q3', simbolo: 'a', curvatura: 0 },
        { id: 't5', de: 'q2', para: 'q2', simbolo: 'b', curvatura: 0 },
        { id: 't6', de: 'q2', para: 'q4', simbolo: 'b', curvatura: 0 },
    ],
};

// Empty automaton
export const emptyAutomaton: AFDData = {
    tipo: 'AFD',
    estados: [],
    transicoes: [],
};

// Automaton with no final states
export const noFinalStatesDFA: AFDData = {
    tipo: 'AFD',
    estados: [
        { id: 'q0', label: 'q0', x: 100, y: 200, isInicial: true, isFinal: false },
        { id: 'q1', label: 'q1', x: 300, y: 200, isInicial: false, isFinal: false },
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
    ],
};

// Automaton with no initial states
export const noInitialStatesDFA: AFDData = {
    tipo: 'AFD',
    estados: [
        { id: 'q0', label: 'q0', x: 100, y: 200, isInicial: false, isFinal: false },
        { id: 'q1', label: 'q1', x: 300, y: 200, isInicial: false, isFinal: true },
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
    ],
};

// PDA for testing (accepts a^n b^n)
export const simplePDA: APData = {
    tipo: 'AP',
    estados: [
        { id: 'q0', label: 'q0', x: 100, y: 200, isInicial: true, isFinal: false },
        { id: 'q1', label: 'q1', x: 250, y: 200, isInicial: false, isFinal: false },
        { id: 'q2', label: 'q2', x: 400, y: 200, isInicial: false, isFinal: true },
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q0', simbolo: 'a, Z -> AZ', curvatura: 0 },
        { id: 't2', de: 'q0', para: 'q0', simbolo: 'a, A -> AA', curvatura: 0 },
        { id: 't3', de: 'q0', para: 'q1', simbolo: 'b, A -> ε', curvatura: 0 },
        { id: 't4', de: 'q1', para: 'q1', simbolo: 'b, A -> ε', curvatura: 0 },
        { id: 't5', de: 'q1', para: 'q2', simbolo: 'ε, Z -> Z', curvatura: 0 },
    ],
    simboloInicialPilha: 'Z',
    alfabetoPilha: ['Z', 'A'],
    pdaAcceptance: 'final',
};

// DFA with self-loops (for regex testing)
export const selfLoopDFA: AFDData = {
    tipo: 'AFD',
    estados: [
        { id: 'q0', label: 'q0', x: 100, y: 200, isInicial: true, isFinal: true },
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q0', simbolo: 'a', curvatura: 0 },
        { id: 't2', de: 'q0', para: 'q0', simbolo: 'b', curvatura: 0 },
    ],
};

// DFA accepting (a|b)*abb
export const abbDFA: AFDData = {
    tipo: 'AFD',
    estados: [
        { id: 'q0', label: 'q0', x: 100, y: 200, isInicial: true, isFinal: false },
        { id: 'q1', label: 'q1', x: 250, y: 200, isInicial: false, isFinal: false },
        { id: 'q2', label: 'q2', x: 400, y: 200, isInicial: false, isFinal: false },
        { id: 'q3', label: 'q3', x: 550, y: 200, isInicial: false, isFinal: true },
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
        { id: 't2', de: 'q0', para: 'q0', simbolo: 'b', curvatura: 0 },
        { id: 't3', de: 'q1', para: 'q1', simbolo: 'a', curvatura: 0 },
        { id: 't4', de: 'q1', para: 'q2', simbolo: 'b', curvatura: 0 },
        { id: 't5', de: 'q2', para: 'q1', simbolo: 'a', curvatura: 0 },
        { id: 't6', de: 'q2', para: 'q3', simbolo: 'b', curvatura: 0 },
        { id: 't7', de: 'q3', para: 'q1', simbolo: 'a', curvatura: 0 },
        { id: 't8', de: 'q3', para: 'q0', simbolo: 'b', curvatura: 0 },
    ],
};
