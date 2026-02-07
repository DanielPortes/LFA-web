/**
 * Automaton validation
 * @module conversions/validation
 */

import type { AutomatoData, APData } from '../../types';
import { isAP } from '../../types';
import { isEpsilonToken, matchesSymbol } from '../symbols';
import { getPdaStackAlphabet, parsePdaTransition } from '../pda';
import { getAlphabet } from './alphabet';
import type { ValidationIssue } from './types';

/**
 * Validate an automaton and return any issues found
 */
export function validateAutomaton(automaton: AutomatoData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const initialStates = automaton.estados.filter(e => e.isInicial);

    // Check initial states
    if (initialStates.length === 0) {
        issues.push({ type: 'error', message: 'Nenhum estado inicial definido' });
    } else if (initialStates.length > 1 && automaton.tipo === 'AFD') {
        issues.push({ type: 'error', message: 'AFD deve ter exatamente um estado inicial' });
    }

    // Check final states
    const finalStates = automaton.estados.filter(e => e.isFinal);
    if (finalStates.length === 0) {
        issues.push({ type: 'warning', message: 'Nenhum estado final definido' });
    }

    const alphabet = getAlphabet(automaton);

    // Validate empty transitions
    automaton.transicoes.forEach(t => {
        if (!t.simbolo.trim()) {
            issues.push({ type: 'error', message: 'Transicao vazia', transitionId: t.id });
        }
    });

    // Type-specific validations
    if (isAP(automaton)) {
        validatePda(automaton, issues);
    } else if (automaton.tipo === 'MT' || automaton.tipo === 'ALL') {
        validateTuringMachine(automaton, issues);
    } else if (automaton.tipo === 'Moore') {
        validateMoore(automaton, issues);
    } else if (automaton.tipo === 'AFD') {
        validateDfa(automaton, alphabet, issues);
    }

    // Reachability check
    if (initialStates.length > 0) {
        validateReachability(automaton, initialStates, issues);
    }

    return issues;
}

function validatePda(automaton: APData, issues: ValidationIssue[]): void {
    const stackAlphabet = automaton.alfabetoPilha && automaton.alfabetoPilha.length > 0
        ? automaton.alfabetoPilha
        : getPdaStackAlphabet(automaton.transicoes);

    if (!automaton.simboloInicialPilha) {
        issues.push({
            type: 'warning',
            message: 'Defina o simbolo inicial da pilha (ex: Z0).'
        });
    }

    automaton.transicoes.forEach(t => {
        const parsed = parsePdaTransition(t.simbolo);
        if (!parsed) {
            issues.push({
                type: 'error',
                message: 'Transicao de AP invalida (formato esperado: a, Z -> AZ)',
                transitionId: t.id
            });
            return;
        }

        if (parsed.pop && stackAlphabet.length > 0 && !stackAlphabet.includes(parsed.pop)) {
            issues.push({
                type: 'warning',
                message: `Simbolo de pilha "${parsed.pop}" fora do Alfabeto Auxiliar V`,
                transitionId: t.id
            });
        }

        parsed.push.forEach(symbol => {
            if (stackAlphabet.length > 0 && !stackAlphabet.includes(symbol)) {
                issues.push({
                    type: 'warning',
                    message: `Simbolo de pilha "${symbol}" fora do Alfabeto Auxiliar V`,
                    transitionId: t.id
                });
            }
        });
    });
}

function validateTuringMachine(automaton: AutomatoData, issues: ValidationIssue[]): void {
    automaton.transicoes.forEach(t => {
        if (!t.simbolo.includes('->') && !t.write) {
            issues.push({
                type: 'warning',
                message: 'Transicao de MT/ALL deve ter formato "leitura -> escrita, direcao"',
                transitionId: t.id
            });
        }
    });
}

function validateMoore(automaton: AutomatoData, issues: ValidationIssue[]): void {
    automaton.estados.forEach(s => {
        if (s.output === undefined || s.output === '') {
            issues.push({
                type: 'info',
                message: `Estado ${s.label} sem saida definida`,
                stateId: s.id
            });
        }
    });
}

function validateDfa(automaton: AutomatoData, alphabet: string[], issues: ValidationIssue[]): void {
    // Check for epsilon transitions
    if (automaton.transicoes.some(t => isEpsilonToken(t.simbolo))) {
        issues.push({ type: 'error', message: 'AFD nao pode ter transicoes epsilon' });
    }

    // Check determinism and completeness
    if (alphabet.length > 0) {
        automaton.estados.forEach(state => {
            alphabet.forEach(symbol => {
                const matches = automaton.transicoes.filter(t =>
                    t.de === state.id && matchesSymbol(t.simbolo, symbol)
                );

                if (matches.length === 0) {
                    issues.push({
                        type: 'warning',
                        message: `Transicao ausente para "${symbol}" em ${state.label || state.id}`,
                        stateId: state.id
                    });
                } else if (matches.length > 1) {
                    issues.push({
                        type: 'error',
                        message: `Transicao nao deterministica para "${symbol}" em ${state.label || state.id}`,
                        stateId: state.id
                    });
                }
            });
        });
    }
}

function validateReachability(
    automaton: AutomatoData,
    initialStates: typeof automaton.estados,
    issues: ValidationIssue[]
): void {
    const reachable = new Set<string>();
    const stack = initialStates.map(s => s.id);

    while (stack.length > 0) {
        const current = stack.pop()!;
        if (reachable.has(current)) continue;
        reachable.add(current);
        automaton.transicoes
            .filter(t => t.de === current)
            .forEach(t => {
                if (!reachable.has(t.para)) stack.push(t.para);
            });
    }

    automaton.estados.forEach(state => {
        if (!reachable.has(state.id)) {
            issues.push({
                type: 'warning',
                message: `Estado inalcancavel: ${state.label || state.id}`,
                stateId: state.id
            });
        }
    });
}
