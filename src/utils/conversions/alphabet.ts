/**
 * Alphabet extraction and manipulation
 * @module conversions/alphabet
 */

import type { AutomatoData } from '../../types';
import { getPdaInputAlphabet } from '../pda';
import { isEpsilonToken, expandRangeToken, splitSymbolTokens } from '../symbols';

/**
 * Extract the input alphabet from an automaton
 * Handles different automaton types appropriately
 */
export function getAlphabet(automaton: AutomatoData): string[] {
    if (!automaton) return [];

    // Use explicitly defined alphabet if available
    if (automaton.alfabeto && automaton.alfabeto.length > 0) {
        return Array.from(
            new Set(automaton.alfabeto.map(s => s.trim()).filter(Boolean))
        ).sort();
    }

    // For PDA, use specialized extraction
    if (automaton.tipo === 'AP') {
        return getPdaInputAlphabet(automaton.transicoes ?? []);
    }

    if (!automaton.transicoes) return [];

    // Extract from transitions
    const symbols = new Set<string>();
    for (const t of automaton.transicoes) {
        const tokens = splitSymbolTokens(t.simbolo);
        for (const token of tokens) {
            if (isEpsilonToken(token)) continue;
            if (token.includes('..')) {
                expandRangeToken(token).forEach(sym => symbols.add(sym));
            } else {
                symbols.add(token);
            }
        }
    }

    return Array.from(symbols).sort();
}
