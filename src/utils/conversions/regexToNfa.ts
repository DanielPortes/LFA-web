/**
 * Regular expression to NFA conversion using Thompson's construction
 * @module conversions/regexToNfa
 */

import type { AutomatoData, Estado, Transicao } from '../../types';
import { EPSILON_SYMBOL, isEpsilonToken } from '../symbols';
import { generateId, applyLayeredLayout } from './helpers';

interface NfaFragment {
    start: string;
    end: string;
    states: Estado[];
    transitions: Transicao[];
}

/**
 * Parse a regular expression and convert to NFA using Thompson's construction
 */
export function regexToNfa(regex: string): AutomatoData {
    try {
        let stateCounter = 0;
        const newState = (): string => `q${stateCounter++}`;

        const createBasic = (symbol: string): NfaFragment => {
            const start = newState();
            const end = newState();
            return {
                start,
                end,
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
            return {
                start: a.start,
                end: b.end,
                states: [...a.states, ...b.states],
                transitions: [
                    ...a.transitions,
                    ...b.transitions,
                    { id: generateId('t'), de: a.end, para: b.start, simbolo: EPSILON_SYMBOL, curvatura: 0 }
                ]
            };
        };

        const union = (a: NfaFragment, b: NfaFragment): NfaFragment => {
            const start = newState();
            const end = newState();
            return {
                start,
                end,
                states: [
                    { id: start, label: start, x: 0, y: 0, isFinal: false, isInicial: false },
                    { id: end, label: end, x: 0, y: 0, isFinal: false, isInicial: false },
                    ...a.states,
                    ...b.states
                ],
                transitions: [
                    ...a.transitions,
                    ...b.transitions,
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
                start,
                end,
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

        const optional = (a: NfaFragment): NfaFragment => {
            const start = newState();
            const end = newState();
            return {
                start,
                end,
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
                tokens.push(regex[i + 1]); // Literal escape
                i += 2;
            } else if ('()+*?|'.includes(char)) {
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
            if (')*+?|'.includes(token)) return null;
            pos++;
            return createBasic(isEpsilonToken(token) ? EPSILON_SYMBOL : token);
        };

        const parseFactor = (): NfaFragment | null => {
            let atom = parseAtom();
            if (!atom) return null;
            while (pos < tokens.length) {
                const op = tokens[pos];
                if (op === '*') {
                    pos++;
                    atom = kleeneStar(atom);
                } else if (op === '?') {
                    pos++;
                    atom = optional(atom);
                } else if (op === '+' && tokens[pos] !== '+') {
                    // Check if it's the + unary operator (one or more)
                    // Actually in standard regex, + means one or more, | means union
                    // Let's handle + as Kleene plus if it follows an atom
                    break; // + is union operator in our syntax
                } else {
                    break;
                }
            }
            return atom;
        };

        const parseConcat = (): NfaFragment | null => {
            let left = parseFactor();
            if (!left) return null;
            while (pos < tokens.length && tokens[pos] !== '+' && tokens[pos] !== '|' && tokens[pos] !== ')') {
                const right = parseFactor();
                if (!right) break;
                left = concatenate(left, right);
            }
            return left;
        };

        const parseUnion = (): NfaFragment | null => {
            let left = parseConcat();
            if (!left) return null;
            while (pos < tokens.length && (tokens[pos] === '+' || tokens[pos] === '|')) {
                pos++;
                const right = parseConcat();
                if (right) left = union(left, right);
            }
            return left;
        };

        const result = parseUnion();
        if (!result) throw new Error('Invalid Regex');

        // Set initial and final states
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
        console.error('Regex parsing error', e);
        return {
            tipo: 'AFN',
            estados: [{ id: generateId('q'), label: 'Erro', x: 200, y: 200, isFinal: false, isInicial: true }],
            transicoes: [],
            descricao: 'Erro no Regex'
        };
    }
}
