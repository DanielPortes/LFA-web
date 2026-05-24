import { describe, expect, it } from 'vitest';
import type { AutomatoData } from '../types';
import { inferAutomatonKind } from './automatonKind';

const baseAutomaton: AutomatoData = {
    tipo: 'AFD',
    estados: [
        { id: 'q0', label: 'q0', x: 0, y: 0, isInicial: true, isFinal: false },
        { id: 'q1', label: 'q1', x: 100, y: 0, isInicial: false, isFinal: true },
    ],
    transicoes: [],
};

describe('inferAutomatonKind', () => {
    it('mantém AFD quando cada estado tem no máximo uma transição por símbolo', () => {
        const result = inferAutomatonKind({
            ...baseAutomaton,
            transicoes: [
                { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
                { id: 't2', de: 'q0', para: 'q0', simbolo: 'b', curvatura: 0 },
            ],
        });

        expect(result.runtimeType).toBe('AFD');
        expect(result.displayType).toBe('AFD');
    });

    it('mantém AFD para um autômato vazio ainda em construção', () => {
        const result = inferAutomatonKind({
            tipo: 'AFD',
            estados: [],
            transicoes: [],
        });

        expect(result.runtimeType).toBe('AFD');
        expect(result.displayType).toBe('AFD');
    });

    it('infere AFN quando há não determinismo em um mesmo símbolo', () => {
        const result = inferAutomatonKind({
            ...baseAutomaton,
            transicoes: [
                { id: 't1', de: 'q0', para: 'q0', simbolo: 'a', curvatura: 0 },
                { id: 't2', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
            ],
        });

        expect(result.runtimeType).toBe('AFN');
        expect(result.displayType).toBe('AFN');
    });

    it('infere AFN-ε para autômatos finitos com transições epsilon', () => {
        const result = inferAutomatonKind({
            ...baseAutomaton,
            transicoes: [
                { id: 't1', de: 'q0', para: 'q1', simbolo: 'ε', curvatura: 0 },
            ],
        });

        expect(result.runtimeType).toBe('AFN');
        expect(result.displayType).toBe('AFN-ε');
    });

    it('não reclassifica modelos que não são autômatos finitos simples', () => {
        const result = inferAutomatonKind({
            ...baseAutomaton,
            tipo: 'AP',
            simboloInicialPilha: 'Z',
            alfabetoPilha: ['Z'],
            pdaAcceptance: 'final',
        });

        expect(result.runtimeType).toBe('AP');
        expect(result.displayType).toBe('AP');
    });
});
