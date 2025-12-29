/**
 * Automaton representations (tuple, table, grammar, regex, DOT)
 * @module conversions/representations
 */

import type { AutomatoData } from '../../types';
import { EPSILON_SYMBOL, isEpsilonToken, expandRangeToken, splitSymbolTokens } from '../symbols';
import { getAlphabet } from './alphabet';
import { unionRegex, concatRegex, starRegex } from './helpers';

/**
 * Convert automaton to formal 5-tuple notation
 */
export function automatonToTuple(automaton: AutomatoData): string {
    if (automaton.tipo === 'AP') {
        throw new Error('Conversao para 5-tupla nao suportada para AP.');
    }

    const stateLabel = (id: string) => automaton.estados.find(s => s.id === id)?.label || id;
    const states = automaton.estados.map(s => s.label || s.id).join(', ');
    const alphabet = getAlphabet(automaton).join(', ');
    const initial = automaton.estados.find(s => s.isInicial);
    const finals = automaton.estados.filter(s => s.isFinal).map(s => s.label || s.id).join(', ');

    const transitions: string[] = [];
    automaton.transicoes.forEach(t => {
        const tokens = splitSymbolTokens(t.simbolo);
        const from = stateLabel(t.de);
        const to = stateLabel(t.para);
        if (tokens.length === 0) return;
        tokens.forEach(token => {
            const normalized = isEpsilonToken(token) ? EPSILON_SYMBOL : token;
            const expanded = normalized.includes('..') ? expandRangeToken(normalized) : [normalized];
            expanded.forEach(sym => {
                transitions.push(`delta(${from}, ${sym}) = ${to}`);
            });
        });
    });

    return [
        `M = (Q, Sigma, delta, q0, F)`,
        `Q = {${states}}`,
        `Sigma = {${alphabet}}`,
        `q0 = ${initial ? (initial.label || initial.id) : 'empty'}`,
        `F = {${finals}}`,
        `delta:`,
        transitions.length > 0 ? transitions.map(t => `  ${t}`).join('\n') : '  (sem transicoes)'
    ].join('\n');
}

/**
 * Convert automaton to transition table (CSV format)
 */
export function automatonToTransitionTable(automaton: AutomatoData): string {
    if (automaton.tipo === 'AP') {
        throw new Error('Tabela de transicoes nao suportada para AP.');
    }

    const stateLabel = (id: string) => automaton.estados.find(s => s.id === id)?.label || id;
    const rows = ['from,symbol,to'];

    automaton.transicoes.forEach(t => {
        const tokens = splitSymbolTokens(t.simbolo);
        const from = stateLabel(t.de);
        const to = stateLabel(t.para);
        if (tokens.length === 0) return;
        tokens.forEach(token => {
            const normalized = isEpsilonToken(token) ? EPSILON_SYMBOL : token;
            const expanded = normalized.includes('..') ? expandRangeToken(normalized) : [normalized];
            expanded.forEach(sym => {
                rows.push(`${from},${sym},${to}`);
            });
        });
    });

    return rows.join('\n');
}

/**
 * Convert automaton to regular grammar
 */
export function automatonToGrammar(automaton: AutomatoData): string {
    if (automaton.tipo === 'AP') {
        throw new Error('Gramatica regular nao suportada para AP.');
    }

    const alphabet = getAlphabet(automaton);
    const initialStates = automaton.estados.filter(s => s.isInicial);
    const nonTerminalMap = new Map<string, string>();
    let counter = 0;

    automaton.estados.forEach(state => {
        if (state.isInicial && initialStates.length === 1) {
            nonTerminalMap.set(state.id, 'S');
        } else {
            nonTerminalMap.set(state.id, `A${counter++}`);
        }
    });

    const startSymbol = 'S';
    const productions = new Map<string, Set<string>>();

    const addProduction = (from: string, rhs: string) => {
        if (!productions.has(from)) {
            productions.set(from, new Set());
        }
        productions.get(from)?.add(rhs);
    };

    automaton.transicoes.forEach(t => {
        const from = nonTerminalMap.get(t.de) || startSymbol;
        const to = nonTerminalMap.get(t.para) || startSymbol;
        const tokens = splitSymbolTokens(t.simbolo);
        tokens.forEach(token => {
            if (isEpsilonToken(token)) {
                addProduction(from, to);
            } else {
                addProduction(from, `${token}${to}`);
            }
        });
    });

    automaton.estados.filter(s => s.isFinal).forEach(state => {
        const from = nonTerminalMap.get(state.id) || startSymbol;
        addProduction(from, EPSILON_SYMBOL);
    });

    if (initialStates.length > 1) {
        initialStates.forEach(state => {
            const to = nonTerminalMap.get(state.id) || startSymbol;
            addProduction(startSymbol, to);
        });
    }

    const variables = Array.from(new Set([startSymbol, ...nonTerminalMap.values()]));
    const productionsText = Array.from(productions.entries())
        .map(([from, rhsSet]) => `${from} -> ${Array.from(rhsSet).join(' | ')}`)
        .join('\n');

    return [
        `G = (V, Sigma, P, S)`,
        `V = {${variables.join(', ')}}`,
        `Sigma = {${alphabet.join(', ')}}`,
        `P:`,
        productionsText || '(sem producoes)',
        `S = ${startSymbol}`
    ].join('\n');
}

/**
 * Convert automaton to regular expression using state elimination
 */
export function automatonToRegex(automaton: AutomatoData): string {
    if (automaton.tipo === 'AP') {
        throw new Error('Regex nao suportado para AP.');
    }

    if (automaton.estados.length === 0) return 'empty';

    const initialStates = automaton.estados.filter(s => s.isInicial).map(s => s.id);
    const finalStates = automaton.estados.filter(s => s.isFinal).map(s => s.id);
    if (initialStates.length === 0 || finalStates.length === 0) return 'empty';

    const start = '__start__';
    const accept = '__accept__';
    const states = [start, ...automaton.estados.map(s => s.id), accept];

    const transitions = new Map<string, Map<string, string | null>>();
    const ensure = (from: string, to: string) => {
        if (!transitions.has(from)) transitions.set(from, new Map());
        if (!transitions.get(from)?.has(to)) transitions.get(from)?.set(to, null);
    };

    states.forEach(from => states.forEach(to => ensure(from, to)));

    automaton.transicoes.forEach(t => {
        const tokens = splitSymbolTokens(t.simbolo);
        tokens.forEach(token => {
            const sym = isEpsilonToken(token) ? EPSILON_SYMBOL : token;
            const expanded = sym.includes('..') ? expandRangeToken(sym) : [sym];
            expanded.forEach(expandedSym => {
                const current = transitions.get(t.de)?.get(t.para) ?? null;
                transitions.get(t.de)?.set(t.para, unionRegex(current, expandedSym));
            });
        });
    });

    initialStates.forEach(id => {
        const current = transitions.get(start)?.get(id) ?? null;
        transitions.get(start)?.set(id, unionRegex(current, EPSILON_SYMBOL));
    });

    finalStates.forEach(id => {
        const current = transitions.get(id)?.get(accept) ?? null;
        transitions.get(id)?.set(accept, unionRegex(current, EPSILON_SYMBOL));
    });

    // State elimination
    const eliminable = automaton.estados.map(s => s.id);
    for (const k of eliminable) {
        for (const i of states) {
            if (i === k) continue;
            for (const j of states) {
                if (j === k) continue;
                const rik = transitions.get(i)?.get(k) ?? null;
                const rkk = transitions.get(k)?.get(k) ?? null;
                const rkj = transitions.get(k)?.get(j) ?? null;
                const rij = transitions.get(i)?.get(j) ?? null;
                const candidate = concatRegex(rik, starRegex(rkk), rkj);
                const updated = unionRegex(rij, candidate);
                transitions.get(i)?.set(j, updated);
            }
        }
        states.forEach(from => transitions.get(from)?.delete(k));
        transitions.delete(k);
    }

    return transitions.get(start)?.get(accept) ?? 'empty';
}

/**
 * Convert automaton to Graphviz DOT format
 */
export function automatonToDot(automaton: AutomatoData): string {
    const lines: string[] = [];
    lines.push('digraph Automaton {');
    lines.push('  rankdir=LR;');
    lines.push('  node [shape=circle];');

    const finals = automaton.estados.filter(s => s.isFinal).map(s => `"${s.id}"`);
    if (finals.length > 0) {
        lines.push(`  node [shape=doublecircle]; ${finals.join(' ')};`);
        lines.push('  node [shape=circle];');
    }

    const initialStates = automaton.estados.filter(s => s.isInicial);
    if (initialStates.length > 0) {
        lines.push('  __start__ [shape=point];');
        initialStates.forEach(s => {
            lines.push(`  __start__ -> "${s.id}";`);
        });
    }

    automaton.estados.forEach(state => {
        const label = state.label ? state.label.replace(/"/g, '\\"') : state.id;
        lines.push(`  "${state.id}" [label="${label}"];`);
    });

    automaton.transicoes.forEach(t => {
        const label = t.simbolo?.trim() ? t.simbolo.replace(/"/g, '\\"') : '?';
        lines.push(`  "${t.de}" -> "${t.para}" [label="${label}"];`);
    });

    lines.push('}');
    return lines.join('\n');
}
