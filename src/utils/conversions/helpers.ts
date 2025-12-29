/**
 * Common helpers and utilities for automaton conversions
 * @module conversions/helpers
 */

import type { Estado, Transicao, AutomatoData } from '../../types';
import { EPSILON_SYMBOL, isEpsilonToken, expandRangeToken, splitSymbolTokens } from '../symbols';

// Safe ID Generator
export const generateId = (prefix: string = 'id') => `${prefix}_${crypto.randomUUID().slice(0, 8)}`;

// Dead state constant for DFA operations
export const DEAD_STATE = 'd';

/**
 * Apply a basic layered layout (hierarchical) to states
 * Avoids the "diagonal line" mess by organizing states by BFS depth
 */
export function applyLayeredLayout(
    states: Estado[],
    transitions: Transicao[],
    startStateId?: string
): void {
    if (states.length === 0) return;

    const SPACING_X = 180;
    const SPACING_Y = 120;

    const startId = startStateId || states[0].id;
    const visited = new Set<string>();
    const queue: { id: string; depth: number }[] = [{ id: startId, depth: 0 }];
    const layers: Record<number, string[]> = {};

    // BFS to assign depths
    visited.add(startId);
    while (queue.length > 0) {
        const { id, depth } = queue.shift()!;
        if (!layers[depth]) layers[depth] = [];
        layers[depth].push(id);

        const neighbors = transitions
            .filter(t => t.de === id)
            .map(t => t.para);

        for (const nid of neighbors) {
            if (!visited.has(nid)) {
                visited.add(nid);
                queue.push({ id: nid, depth: depth + 1 });
            }
        }
    }

    // Handle disconnected components (orphans)
    let maxDepth = Math.max(...Object.keys(layers).map(Number));
    states.forEach(s => {
        if (!visited.has(s.id)) {
            if (!layers[maxDepth + 1]) layers[maxDepth + 1] = [];
            if (layers[maxDepth + 1].length < 5) {
                layers[maxDepth + 1].push(s.id);
            } else {
                maxDepth++;
                layers[maxDepth + 1] = [s.id];
            }
            visited.add(s.id);
        }
    });

    // Apply coordinates
    Object.entries(layers).forEach(([depthStr, ids]) => {
        const depth = parseInt(depthStr);
        const count = ids.length;
        ids.forEach((id, index) => {
            const state = states.find(s => s.id === id);
            if (state) {
                state.x = 100 + depth * SPACING_X;
                state.y = 300 + (index - (count - 1) / 2) * SPACING_Y;
            }
        });
    });
}

/**
 * Merge transitions with the same source and target into one
 */
export function mergeTransitions(transitions: Transicao[]): Transicao[] {
    const merged = new Map<string, Transicao>();

    for (const t of transitions) {
        const key = `${t.de}-${t.para}`;
        if (merged.has(key)) {
            const existing = merged.get(key)!;
            const symbols = new Set([
                ...existing.simbolo.split(',').map(s => s.trim()),
                ...t.simbolo.split(',').map(s => s.trim())
            ]);
            existing.simbolo = Array.from(symbols).sort().join(',');
        } else {
            merged.set(key, { ...t });
        }
    }

    return Array.from(merged.values());
}

/**
 * Build a transition map for DFA operations
 * Maps state ID -> symbol -> target state ID
 */
export function buildDfaTransitionMap(
    automaton: AutomatoData,
    alphabet: string[]
): Map<string, Map<string, string>> {
    const map = new Map<string, Map<string, string>>();

    automaton.estados.forEach(state => {
        map.set(state.id, new Map());
    });

    automaton.transicoes.forEach(t => {
        const symbols = splitSymbolTokens(t.simbolo);
        for (const token of symbols) {
            if (isEpsilonToken(token)) continue;
            const expanded = token.includes('..') ? expandRangeToken(token) : [token];
            expanded.forEach(sym => {
                const stateMap = map.get(t.de);
                if (stateMap) {
                    stateMap.set(sym, t.para);
                }
            });
        }
    });

    // Add dead state transitions
    if (!map.has(DEAD_STATE)) {
        map.set(DEAD_STATE, new Map());
    }
    for (const symbol of alphabet) {
        map.get(DEAD_STATE)?.set(symbol, DEAD_STATE);
    }

    return map;
}

/**
 * Format a set of state IDs as a readable string
 */
export function formatStateSet(states: string[], labelMap: Map<string, string>): string {
    if (states.length === 0) return '{}';
    const labels = states.map(id => labelMap.get(id) ?? id);
    return `{${labels.join(', ')}}`;
}

// Regex helpers
export const wrapRegex = (regex: string): string => {
    if (regex === EPSILON_SYMBOL) return regex;
    if (regex.length <= 1) return regex;
    if (regex.startsWith('(') && regex.endsWith(')')) return regex;
    return `(${regex})`;
};

export const unionRegex = (a?: string | null, b?: string | null): string | null => {
    if (!a) return b || null;
    if (!b) return a;
    if (a === b) return a;
    return `${a}+${b}`;
};

export const concatRegex = (...parts: Array<string | null | undefined>): string | null => {
    const filtered: string[] = [];
    for (const part of parts) {
        if (!part) return null;
        if (part === EPSILON_SYMBOL) continue;
        filtered.push(wrapRegex(part));
    }
    if (filtered.length === 0) return EPSILON_SYMBOL;
    return filtered.join('');
};

export const starRegex = (value?: string | null): string => {
    if (!value || value === EPSILON_SYMBOL) return EPSILON_SYMBOL;
    return `${wrapRegex(value)}*`;
};
