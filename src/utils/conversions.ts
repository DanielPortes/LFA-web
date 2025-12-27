import type { AutomatoData, Estado, Transicao } from '../types';
import { getEpsilonClosure } from './automatonLogic';
import { EPSILON_SYMBOL, expandRangeToken, isEpsilonToken, matchesSymbol, splitSymbolTokens } from './symbols';

// Safe ID Generator
const generateId = (prefix: string = 'id') => `${prefix}_${crypto.randomUUID().slice(0, 8)}`;

/**
 * Helper to apply a basic layered layout (hierarchical) to the states
 * to avoid the "diagonal line" mess.
 */
function applyLayeredLayout(states: Estado[], transitions: Transicao[], startStateId?: string) {
    if (states.length === 0) return;

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

        // Find neighbors
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
            // Add orphans to a new layer
            // If there are many, we might distribute them, but putting them at the end is safe
            if (!layers[maxDepth + 1]) layers[maxDepth + 1] = [];
            if (layers[maxDepth + 1].length < 5) { // Max 5 per orphan column
                layers[maxDepth + 1].push(s.id);
            } else {
                maxDepth++;
                layers[maxDepth + 1] = [s.id];
            }
            visited.add(s.id);
        }
    });

    // Apply coordinates
    const SPACING_X = 180;
    const SPACING_Y = 120;

    Object.entries(layers).forEach(([depthStr, ids]) => {
        const depth = parseInt(depthStr);
        const count = ids.length;
        ids.forEach((id, index) => {
            const state = states.find(s => s.id === id);
            if (state) {
                state.x = 100 + depth * SPACING_X;
                // Center vertically based on how many nodes in this layer
                state.y = 300 + (index - (count - 1) / 2) * SPACING_Y;
            }
        });
    });
}


/**
 * Converts an NFA to a DFA using subset construction with improved layout.
 */
export function nfaToDfa(nfa: AutomatoData): AutomatoData {
    const alphabet = getAlphabet(nfa);
    const initialStates = nfa.estados.filter(e => e.isInicial).map(e => e.id);
    const initialClosure = getEpsilonClosure(initialStates, nfa.transicoes);

    const stateSetToId = new Map<string, string>();
    const dfaStates: Estado[] = [];
    const dfaTransitions: Transicao[] = [];

    const queue: string[][] = [initialClosure];
    let stateCounter = 0;

    const getSetKey = (states: string[]) => [...states].sort().join(',');
    const initialKey = getSetKey(initialClosure);
    const initialDfaId = `q0`;
    stateSetToId.set(initialKey, initialDfaId);

    const hasFinal = (states: string[]) =>
        states.some(id => nfa.estados.find(e => e.id === id)?.isFinal);

    // Initial State
    dfaStates.push({
        id: initialDfaId,
        label: `{${initialClosure.map(id => nfa.estados.find(e => e.id === id)?.label || id).join(',')}}`,
        x: 0, y: 0, // Will be fixed by layout
        isFinal: hasFinal(initialClosure),
        isInicial: true
    });
    stateCounter++;

    const processed = new Set<string>();

    while (queue.length > 0) {
        const currentSet = queue.shift()!;
        const currentKey = getSetKey(currentSet);

        if (processed.has(currentKey)) continue;
        processed.add(currentKey);

        const currentDfaStateId = stateSetToId.get(currentKey)!;

        for (const symbol of alphabet) {
            const reachable = new Set<string>();

            for (const stateId of currentSet) {
                const transitions = nfa.transicoes.filter(t =>
                    t.de === stateId && matchesSymbol(t.simbolo, symbol)
                );
                for (const t of transitions) reachable.add(t.para);
            }

            if (reachable.size === 0) continue;

            const targetSet = getEpsilonClosure(Array.from(reachable), nfa.transicoes);
            const targetKey = getSetKey(targetSet);

            if (!stateSetToId.has(targetKey)) {
                const newId = `q${stateCounter}`;
                stateSetToId.set(targetKey, newId);

                dfaStates.push({
                    id: newId,
                    label: `{${targetSet.map(id => nfa.estados.find(e => e.id === id)?.label || id).join(',')}}`,
                    x: 0, y: 0,
                    isFinal: hasFinal(targetSet),
                    isInicial: false
                });
                stateCounter++;
                queue.push(targetSet);
            }

            dfaTransitions.push({
                id: generateId('t'),
                de: currentDfaStateId,
                para: stateSetToId.get(targetKey)!,
                simbolo: symbol,
                curvatura: 0
            });
        }
    }

    applyLayeredLayout(dfaStates, dfaTransitions, initialDfaId);

    return {
        tipo: 'AFD',
        estados: dfaStates,
        transicoes: mergeTransitions(dfaTransitions),
        descricao: `AFD convertido de ${nfa.descricao || 'AFN'}`
    };
}

/**
 * Parses regex to NFA with robust error handling and improved layout.
 */
export function regexToNfa(regex: string): AutomatoData {
    try {
        let stateCounter = 0;
        const newState = (): string => `q${stateCounter++}`;

        interface NfaFragment {
            start: string;
            end: string;
            states: Estado[];
            transitions: Transicao[];
        }

        const createBasic = (symbol: string): NfaFragment => {
            const start = newState();
            const end = newState();
            return {
                start, end,
                states: [
                    { id: start, label: start, x: 0, y: 0, isFinal: false, isInicial: false },
                    { id: end, label: end, x: 0, y: 0, isFinal: false, isInicial: false }
                ],
                transitions: [
                    { id: generateId('t'), de: start, para: end, simbolo: symbol, curvatura: 0 }
                ]
            };
        };

        const concatenate = (a: NfaFragment, b: NfaFragment): NfaFragment => {
             /* 
            const transitions = [
                ...a.transitions,
                ...b.transitions.map(t => ({
                    ...t,
                    de: t.de === b.start ? a.end : t.de,
                    para: t.para === b.start ? a.end : t.para
                }))
            ];
            */

            // Only add epsilon if we didn't merge nodes (Thompson construction usually merges or adds epsilon)
            // Here we merged b.start into a.end logic above, so explicit epsilon might not be needed
            // depending on exact implementation. The previous implementation merged logic:
            // "Merge end of a with start of b" AND added epsilon? That seems like double linking.
            // Let's stick to standard Thompson: Add Epsilon from A.end to B.start.
            // BUT the previous code actually REMOVED b.start.
            // Let's be safer: Link A.end -> B.start with Epsilon.
            
            // Reverting to the safer non-destructive approach for better visualization
            // actually, let's keep the previous logic but with unique IDs to be safe.
            // The previous logic was: merge B.transitions to point from A.end instead of B.start.
            // Then add epsilon A.end -> B.start ?? No, that's redundant if we remapped.
            
            // Let's implement Standard Thompson (Epsilon Link) for clarity in visualization
            const result: NfaFragment = {
                start: a.start,
                end: b.end,
                states: [...a.states, ...b.states],
                transitions: [
                    ...a.transitions,
                    ...b.transitions,
                    { id: generateId('t'), de: a.end, para: b.start, simbolo: EPSILON_SYMBOL, curvatura: 0 }
                ]
            };
            return result;
        };

        const union = (a: NfaFragment, b: NfaFragment): NfaFragment => {
            const start = newState();
            const end = newState();
            return {
                start, end,
                states: [
                    { id: start, label: start, x: 0, y: 0, isFinal: false, isInicial: false },
                    { id: end, label: end, x: 0, y: 0, isFinal: false, isInicial: false },
                    ...a.states, ...b.states
                ],
                transitions: [
                    ...a.transitions, ...b.transitions,
                    { id: generateId('t'), de: start, para: a.start, simbolo: EPSILON_SYMBOL, curvatura: 0 },
                    { id: generateId('t'), de: start, para: b.start, simbolo: EPSILON_SYMBOL, curvatura: 0 },
                    { id: generateId('t'), de: a.end, para: end, simbolo: EPSILON_SYMBOL, curvatura: 0 },
                    { id: generateId('t'), de: b.end, para: end, simbolo: EPSILON_SYMBOL, curvatura: 0 }
                ]
            };
        };

        const kleeneStar = (a: NfaFragment): NfaFragment => {
            const start = newState();
            const end = newState();
            return {
                start, end,
                states: [
                    { id: start, label: start, x: 0, y: 0, isFinal: false, isInicial: false },
                    { id: end, label: end, x: 0, y: 0, isFinal: false, isInicial: false },
                    ...a.states
                ],
                transitions: [
                    ...a.transitions,
                    { id: generateId('t'), de: start, para: a.start, simbolo: EPSILON_SYMBOL, curvatura: 0 },
                    { id: generateId('t'), de: start, para: end, simbolo: EPSILON_SYMBOL, curvatura: 0 },
                    { id: generateId('t'), de: a.end, para: end, simbolo: EPSILON_SYMBOL, curvatura: 0 },
                    { id: generateId('t'), de: a.end, para: a.start, simbolo: EPSILON_SYMBOL, curvatura: 0 }
                ]
            };
        };

        const plusOperator = (a: NfaFragment): NfaFragment => {
             const start = newState();
             const end = newState();
             return {
                 start, end,
                 states: [
                     { id: start, label: start, x: 0, y: 0, isFinal: false, isInicial: false },
                     { id: end, label: end, x: 0, y: 0, isFinal: false, isInicial: false },
                     ...a.states
                 ],
                 transitions: [
                     ...a.transitions,
                     { id: generateId('t'), de: start, para: a.start, simbolo: EPSILON_SYMBOL, curvatura: 0 },
                     { id: generateId('t'), de: a.end, para: end, simbolo: EPSILON_SYMBOL, curvatura: 0 },
                     { id: generateId('t'), de: a.end, para: a.start, simbolo: EPSILON_SYMBOL, curvatura: 0 }
                 ]
             };
        };
        
        const optional = (a: NfaFragment): NfaFragment => {
            const start = newState();
            const end = newState();
            return {
                start, end,
                states: [
                    { id: start, label: start, x: 0, y: 0, isFinal: false, isInicial: false },
                    { id: end, label: end, x: 0, y: 0, isFinal: false, isInicial: false },
                    ...a.states
                ],
                transitions: [
                    ...a.transitions,
                    { id: generateId('t'), de: start, para: a.start, simbolo: EPSILON_SYMBOL, curvatura: 0 },
                    { id: generateId('t'), de: start, para: end, simbolo: EPSILON_SYMBOL, curvatura: 0 },
                    { id: generateId('t'), de: a.end, para: end, simbolo: EPSILON_SYMBOL, curvatura: 0 }
                ]
            };
        };

        // Tokenizer
        const tokens: string[] = [];
        let i = 0;
        while (i < regex.length) {
            const char = regex[i];
            if (char === '\\' && i + 1 < regex.length) {
                tokens.push(regex[i + 1]); // Literal
                i += 2;
            } else if ('()|*+?'.includes(char)) {
                tokens.push(char);
                i++;
            } else if (char === ' ') {
                i++; // Ignore spaces
            } else {
                tokens.push(char);
                i++;
            }
        }

        let pos = 0;
        const parseAtom = (): NfaFragment | null => {
            if (pos >= tokens.length) return null;
            const token = tokens[pos];
            if (token === '(') {
                pos++;
                const expr = parseUnion();
                if (pos < tokens.length && tokens[pos] === ')') pos++;
                return expr;
            }
            if (')|*+?'.includes(token)) return null;
            pos++;
            return createBasic(isEpsilonToken(token) ? EPSILON_SYMBOL : token);
        };

        const parseFactor = (): NfaFragment | null => {
            let atom = parseAtom();
            if (!atom) return null;
            while (pos < tokens.length) {
                const op = tokens[pos];
                if (op === '*') { pos++; atom = kleeneStar(atom); }
                else if (op === '+') { pos++; atom = plusOperator(atom); }
                else if (op === '?') { pos++; atom = optional(atom); }
                else break;
            }
            return atom;
        };

        const parseConcat = (): NfaFragment | null => {
            let left = parseFactor();
            if (!left) return null;
            while (pos < tokens.length && tokens[pos] !== '|' && tokens[pos] !== ')') {
                const right = parseFactor();
                if (!right) break;
                left = concatenate(left, right);
            }
            return left;
        };

        const parseUnion = (): NfaFragment | null => {
            let left = parseConcat();
            if (!left) return null;
            while (pos < tokens.length && tokens[pos] === '|') {
                pos++;
                const right = parseConcat();
                if (right) left = union(left, right);
            }
            return left;
        };

        const result = parseUnion();
        if (!result) throw new Error("Invalid Regex");

        // Set initial and final
        const startState = result.states.find(s => s.id === result.start);
        const endState = result.states.find(s => s.id === result.end);
        if (startState) startState.isInicial = true;
        if (endState) endState.isFinal = true;

        applyLayeredLayout(result.states, result.transitions, result.start);

        return {
            tipo: 'AFN',
            estados: result.states,
            transicoes: result.transitions,
            descricao: `AFN para: ${regex}`
        };

    } catch (e) {
        console.error("Regex parsing error", e);
        // Fallback for error
        return {
            tipo: 'AFN',
            estados: [{ id: generateId('q'), label: 'Erro', x: 200, y: 200, isFinal: false, isInicial: true }],
            transicoes: [],
            descricao: 'Erro no Regex'
        };
    }
}

export function getAlphabet(automaton: AutomatoData): string[] {
    if (!automaton || !automaton.transicoes) return [];
    const symbols = new Set<string>();
    for (const t of automaton.transicoes) {
        const tokens = splitSymbolTokens(t.simbolo);
        for (const token of tokens) {
            if (isEpsilonToken(token)) continue;
            if (token.includes('..')) {
                expandRangeToken(token).forEach((sym) => symbols.add(sym));
            } else {
                symbols.add(token);
            }
        }
    }
    return Array.from(symbols).sort();
}

function mergeTransitions(transitions: Transicao[]): Transicao[] {
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

export interface ValidationIssue {
    type: 'error' | 'warning' | 'info';
    message: string;
    stateId?: string;
    transitionId?: string;
}

export function validateAutomaton(automaton: AutomatoData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const initialStates = automaton.estados.filter(e => e.isInicial);
    
    if (initialStates.length === 0) issues.push({ type: 'error', message: 'Nenhum estado inicial definido' });
    else if (initialStates.length > 1 && automaton.tipo === 'AFD') issues.push({ type: 'error', message: 'AFD deve ter exatamente um estado inicial' });

    const finalStates = automaton.estados.filter(e => e.isFinal);
    if (finalStates.length === 0) issues.push({ type: 'warning', message: 'Nenhum estado final definido' });

    // Validate symbols
    automaton.transicoes.forEach(t => {
        if (!t.simbolo.trim()) issues.push({ type: 'error', message: 'Transição vazia', transitionId: t.id });
    });

    return issues;
}