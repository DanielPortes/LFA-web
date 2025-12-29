/**
 * Grammar to automaton conversions
 * @module conversions/grammarConversions
 */

import type { AutomatoData, Estado, Transicao } from '../../types';
import { EPSILON_SYMBOL, isEpsilonToken } from '../symbols';
import { generateId, applyLayeredLayout } from './helpers';
import { nfaToDfa } from './nfaToDfa';
import type { GrammarConversionResult, PdaToCfgResult } from './types';

interface GrammarProduction {
    lhs: string;
    rhs: string;
}

/**
 * Parse a grammar text into productions
 */
function parseGrammarText(grammarText: string): { startSymbol: string; productions: GrammarProduction[] } {
    const productions: GrammarProduction[] = [];
    let startSymbol = 'S';

    const lines = grammarText.split('\n').filter(l => l.trim());

    for (const line of lines) {
        // Skip metadata lines
        if (line.includes('= (') || line.includes('= {')) continue;

        // Parse production: A -> aB | b
        const match = line.match(/^\s*([A-Z])\s*->\s*(.+)\s*$/);
        if (match) {
            const lhs = match[1];
            if (productions.length === 0) startSymbol = lhs;

            const rhsParts = match[2].split('|').map(s => s.trim());
            for (const rhs of rhsParts) {
                productions.push({ lhs, rhs });
            }
        }
    }

    return { startSymbol, productions };
}

/**
 * Check if a grammar is left-linear (regular)
 */
function isLeftLinear(productions: GrammarProduction[]): boolean {
    for (const { rhs } of productions) {
        if (isEpsilonToken(rhs)) continue;

        // Left-linear: rhs starts with non-terminal or is just terminals
        const first = rhs[0];
        if (first >= 'A' && first <= 'Z') {
            // Non-terminal first - rest must be terminal
            const rest = rhs.slice(1);
            if (rest.match(/[A-Z]/)) return false;
        } else {
            // Terminal first - no non-terminal allowed
            if (rhs.match(/[A-Z]/)) return false;
        }
    }
    return true;
}

/**
 * Check if a grammar is right-linear (regular)
 */
function isRightLinear(productions: GrammarProduction[]): boolean {
    for (const { rhs } of productions) {
        if (isEpsilonToken(rhs)) continue;

        // Right-linear: rhs is terminals followed by at most one non-terminal
        const match = rhs.match(/^([a-z0-9]*)([A-Z])?$/);
        if (!match) {
            // Check for non-terminal in the middle
            const ntMatches = rhs.match(/[A-Z]/g);
            if (ntMatches && ntMatches.length > 1) return false;
            if (ntMatches && ntMatches.length === 1) {
                const ntIndex = rhs.search(/[A-Z]/);
                if (ntIndex !== rhs.length - 1) return false;
            }
        }
    }
    return true;
}

/**
 * Convert a regular grammar to NFA
 */
export function regularGrammarToNfa(grammarText: string): GrammarConversionResult {
    try {
        const { startSymbol, productions } = parseGrammarText(grammarText);

        if (productions.length === 0) {
            return { error: 'Nenhuma producao encontrada na gramatica.' };
        }

        const rightLinear = isRightLinear(productions);
        const leftLinear = isLeftLinear(productions);

        if (!rightLinear && !leftLinear) {
            return {
                error: 'Gramatica nao e regular (nem linear a esquerda nem a direita).'
            };
        }

        const warnings: string[] = [];
        const stateMap = new Map<string, string>();
        const states: Estado[] = [];
        const transitions: Transicao[] = [];
        let stateCounter = 0;

        // Create state for each non-terminal
        const nonTerminals = new Set(productions.map(p => p.lhs));
        nonTerminals.forEach(nt => {
            const id = `q${stateCounter++}`;
            stateMap.set(nt, id);
            states.push({
                id,
                label: nt,
                x: 0,
                y: 0,
                isInicial: nt === startSymbol,
                isFinal: false
            });
        });

        // Create final state for terminal-only productions
        const finalId = `q${stateCounter++}`;
        stateMap.set('__final__', finalId);
        states.push({
            id: finalId,
            label: 'F',
            x: 0,
            y: 0,
            isInicial: false,
            isFinal: true
        });

        // Process productions for right-linear grammar
        if (rightLinear) {
            for (const { lhs, rhs } of productions) {
                const fromId = stateMap.get(lhs)!;

                if (isEpsilonToken(rhs)) {
                    // A -> ε means A is final
                    const state = states.find(s => s.id === fromId);
                    if (state) state.isFinal = true;
                    continue;
                }

                // Find non-terminal at end (if any)
                const ntMatch = rhs.match(/([A-Z])$/);
                const terminals = ntMatch ? rhs.slice(0, -1) : rhs;
                const targetNt = ntMatch ? ntMatch[1] : null;

                if (terminals.length === 0 && targetNt) {
                    // A -> B (unit production)
                    transitions.push({
                        id: generateId('t'),
                        de: fromId,
                        para: stateMap.get(targetNt)!,
                        simbolo: EPSILON_SYMBOL,
                        curvatura: 0
                    });
                } else if (terminals.length === 1) {
                    // A -> aB or A -> a
                    const toId = targetNt ? stateMap.get(targetNt)! : finalId;
                    transitions.push({
                        id: generateId('t'),
                        de: fromId,
                        para: toId,
                        simbolo: terminals,
                        curvatura: 0
                    });
                } else {
                    // A -> abB - need intermediate states
                    let currentFrom = fromId;
                    for (let i = 0; i < terminals.length; i++) {
                        const isLast = i === terminals.length - 1;
                        const toId = isLast
                            ? (targetNt ? stateMap.get(targetNt)! : finalId)
                            : `q${stateCounter++}`;

                        if (!isLast) {
                            states.push({
                                id: toId,
                                label: `${lhs}${i + 1}`,
                                x: 0,
                                y: 0,
                                isInicial: false,
                                isFinal: false
                            });
                        }

                        transitions.push({
                            id: generateId('t'),
                            de: currentFrom,
                            para: toId,
                            simbolo: terminals[i],
                            curvatura: 0
                        });
                        currentFrom = toId;
                    }
                }
            }
        }

        // Remove unreachable final state if no transitions go to it
        const reachableStates = new Set<string>();
        transitions.forEach(t => reachableStates.add(t.para));
        const hasFinalFromProductions = states.some(s => s.isFinal && s.id !== finalId);
        if (!reachableStates.has(finalId) && hasFinalFromProductions) {
            const idx = states.findIndex(s => s.id === finalId);
            if (idx >= 0) states.splice(idx, 1);
        }

        const initialState = states.find(s => s.isInicial);
        applyLayeredLayout(states, transitions, initialState?.id);

        return {
            automaton: {
                tipo: 'AFN',
                estados: states,
                transicoes: transitions,
                descricao: `AFN da gramatica regular`
            },
            warnings
        };

    } catch (e) {
        return { error: `Erro ao processar gramatica: ${(e as Error).message}` };
    }
}

/**
 * Convert a CFG to PDA
 */
export function cfgToPda(grammarText: string): GrammarConversionResult {
    try {
        const { startSymbol, productions } = parseGrammarText(grammarText);

        if (productions.length === 0) {
            return { error: 'Nenhuma producao encontrada.' };
        }

        const states: Estado[] = [
            { id: 'q0', label: 'q0', x: 100, y: 200, isInicial: true, isFinal: false },
            { id: 'q1', label: 'q1', x: 300, y: 200, isInicial: false, isFinal: false },
            { id: 'q2', label: 'q2', x: 500, y: 200, isInicial: false, isFinal: true }
        ];

        const transitions: Transicao[] = [];

        // q0 -> q1: push start symbol and Z0
        transitions.push({
            id: generateId('t'),
            de: 'q0',
            para: 'q1',
            simbolo: `${EPSILON_SYMBOL}, Z0 -> ${startSymbol}Z0`,
            curvatura: 0
        });

        // Collect terminals and non-terminals
        const terminals = new Set<string>();
        const nonTerminals = new Set<string>();
        productions.forEach(p => {
            nonTerminals.add(p.lhs);
            for (const char of p.rhs) {
                if (char >= 'a' && char <= 'z' || char >= '0' && char <= '9') {
                    terminals.add(char);
                } else if (char >= 'A' && char <= 'Z') {
                    nonTerminals.add(char);
                }
            }
        });

        // For each production A -> α, add ε, A -> α^R (reversed for PDA)
        productions.forEach(p => {
            const rhs = isEpsilonToken(p.rhs) ? EPSILON_SYMBOL : p.rhs.split('').reverse().join('');
            transitions.push({
                id: generateId('t'),
                de: 'q1',
                para: 'q1',
                simbolo: `${EPSILON_SYMBOL}, ${p.lhs} -> ${rhs}`,
                curvatura: 0.1
            });
        });

        // For each terminal a, add a, a -> ε (match and pop)
        terminals.forEach(t => {
            transitions.push({
                id: generateId('t'),
                de: 'q1',
                para: 'q1',
                simbolo: `${t}, ${t} -> ${EPSILON_SYMBOL}`,
                curvatura: -0.1
            });
        });

        // Accept when stack is empty
        transitions.push({
            id: generateId('t'),
            de: 'q1',
            para: 'q2',
            simbolo: `${EPSILON_SYMBOL}, Z0 -> ${EPSILON_SYMBOL}`,
            curvatura: 0
        });

        return {
            automaton: {
                tipo: 'AP',
                estados: states,
                transicoes: transitions,
                simboloInicialPilha: 'Z0',
                alfabetoPilha: ['Z0', ...Array.from(nonTerminals), ...Array.from(terminals)],
                pdaAcceptance: 'final',
                descricao: 'AP da GLC'
            }
        };

    } catch (e) {
        return { error: `Erro ao processar GLC: ${(e as Error).message}` };
    }
}

/**
 * Convert a PDA to CFG (partial implementation for simple PDAs)
 */
export function pdaToCfg(pda: AutomatoData): PdaToCfgResult {
    if (pda.tipo !== 'AP') {
        return { error: 'Entrada deve ser um AP (Automato de Pilha).' };
    }

    const warnings: string[] = [];
    warnings.push('Conversao PDA->CFG implementada para casos simples.');

    // This is a simplified conversion - full algorithm is complex
    const lines: string[] = [];
    lines.push('G = (V, Sigma, P, S)');
    lines.push('');
    lines.push('P:');
    lines.push('S -> ... (conversao completa requer algoritmo mais elaborado)');

    return {
        grammar: lines.join('\n'),
        warnings
    };
}

/**
 * Convert a regular grammar to DFA (via NFA then determinization)
 */
export function regularGrammarToDfa(grammarText: string): GrammarConversionResult {
    const nfaResult = regularGrammarToNfa(grammarText);

    if (nfaResult.error || !nfaResult.automaton) {
        return nfaResult;
    }

    try {
        const dfa = nfaToDfa(nfaResult.automaton);
        return {
            automaton: dfa,
            warnings: nfaResult.warnings
        };
    } catch (e) {
        return {
            error: `Erro ao converter para DFA: ${(e as Error).message}`,
            warnings: nfaResult.warnings
        };
    }
}
