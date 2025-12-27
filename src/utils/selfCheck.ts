import type { AutomatoData } from '../types';
import { getEpsilonClosure, performStep } from './automatonLogic';
import { nfaToDfa, regexToNfa } from './conversions';
import { EPSILON_SYMBOL } from './symbols';

export interface SelfCheckResult {
    name: string;
    ok: boolean;
    details?: string;
}

export const runSelfCheck = (): SelfCheckResult[] => {
    const results: SelfCheckResult[] = [];

    try {
        const automaton: AutomatoData = {
            tipo: 'AFN',
            estados: [
                { id: 'q0', label: 'q0', x: 0, y: 0, isFinal: false, isInicial: true },
                { id: 'q1', label: 'q1', x: 0, y: 0, isFinal: true, isInicial: false }
            ],
            transicoes: [
                { id: 't0', de: 'q0', para: 'q1', simbolo: EPSILON_SYMBOL, curvatura: 0 }
            ]
        };
        const closure = getEpsilonClosure(['q0'], automaton.transicoes);
        results.push({
            name: 'ε-fecho básico',
            ok: closure.includes('q1'),
            details: closure.join(',')
        });
    } catch (e) {
        results.push({ name: 'ε-fecho básico', ok: false, details: String(e) });
    }

    try {
        const automaton: AutomatoData = {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: 'q0', x: 0, y: 0, isFinal: false, isInicial: true },
                { id: 'q1', label: 'q1', x: 0, y: 0, isFinal: true, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 }
            ]
        };
        const step = performStep(['q0'], 'a', automaton.transicoes);
        results.push({
            name: 'Transição simples',
            ok: step.length === 1 && step[0] === 'q1',
            details: step.join(',')
        });
    } catch (e) {
        results.push({ name: 'Transição simples', ok: false, details: String(e) });
    }

    try {
        const nfa = regexToNfa('a');
        const dfa = nfaToDfa(nfa);
        results.push({
            name: 'Regex → NFA → DFA',
            ok: dfa.estados.length > 0 && dfa.tipo === 'AFD'
        });
    } catch (e) {
        results.push({ name: 'Regex → NFA → DFA', ok: false, details: String(e) });
    }

    return results;
};
