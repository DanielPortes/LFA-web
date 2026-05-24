import { describe, expect, it } from 'vitest';
import type { AutomatoData } from '../../../types';
import { normalizeAutomatonForType } from './editorUtils';

const apAutomaton: AutomatoData = {
    tipo: 'AP',
    alfabeto: ['a', 'b'],
    alfabetoPilha: ['Z', 'A'],
    simboloInicialPilha: 'Z',
    pdaAcceptance: 'empty',
    estados: [
        { id: 'q0', label: 'q0', x: 100, y: 100, isInicial: true, isFinal: false },
        { id: 'q1', label: 'q1', x: 240, y: 100, isInicial: false, isFinal: true },
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q1', simbolo: 'b, A -> eps', curvatura: 0 },
    ],
};

describe('normalizeAutomatonForType', () => {
    it('não reaproveita rótulos de AP como leitura de Máquina de Turing', () => {
        const converted = normalizeAutomatonForType(apAutomaton, 'MT');

        expect(converted.tipo).toBe('MT');
        expect(converted.transicoes[0]).toMatchObject({
            simbolo: 'b -> b, R',
            write: 'b',
            direction: 'R',
        });
        expect(converted.transicoes[0].simbolo).not.toContain('A -> eps');
    });

    it('remove metadados de transdutor e MT ao voltar para autômato finito', () => {
        const source: AutomatoData = {
            tipo: 'Mealy',
            estados: apAutomaton.estados,
            transicoes: [
                { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', output: 'x', write: 'a', direction: 'R', curvatura: 0 },
            ],
        };

        const converted = normalizeAutomatonForType(source, 'AFN');

        expect(converted.tipo).toBe('AFN');
        expect(converted.transicoes[0]).toEqual({
            id: 't1',
            de: 'q0',
            para: 'q1',
            simbolo: 'a',
            curvatura: 0,
            controlPoint: undefined,
        });
    });
});
