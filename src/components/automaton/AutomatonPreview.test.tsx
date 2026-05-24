import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AutomatonPreview } from './AutomatonPreview';
import type { AutomatoData } from '../../types';

const emptyAutomaton: AutomatoData = {
    tipo: 'AFD',
    estados: [],
    transicoes: [],
};

describe('AutomatonPreview', () => {
    it('expõe aria-label contextual e estado vazio legível', () => {
        render(
            <div className="h-80 w-full">
                <AutomatonPreview data={emptyAutomaton} ariaLabel="Preview vazio do exercício" />
            </div>
        );

        expect(screen.getByRole('img', { name: 'Preview vazio do exercício' })).toBeInTheDocument();
        expect(screen.getByText('Autômato vazio')).toBeInTheDocument();
    });

    it('inclui rótulos longos de transição no viewBox para evitar corte visual', () => {
        const automatonWithLongLabel: AutomatoData = {
            tipo: 'AP',
            estados: [
                { id: 'q0', label: 'q0', x: 0, y: 0, isInicial: true, isFinal: false },
                { id: 'q1', label: 'q1', x: 100, y: 0, isInicial: false, isFinal: true },
            ],
            transicoes: [
                { id: 't0', de: 'q0', para: 'q1', simbolo: 'a, Z -> AAAAAAAAAAAZ', curvatura: 0 },
            ],
            alfabetoPilha: ['Z', 'A'],
            simboloInicialPilha: 'Z',
        };

        render(<AutomatonPreview data={automatonWithLongLabel} />);

        const svg = screen.getByRole('img');
        const [minX, , width] = svg.getAttribute('viewBox')!.split(' ').map(Number);

        expect(minX).toBeLessThan(-64);
        expect(width).toBeGreaterThan(228);
    });

    it('curva a prévia quando uma transição atravessaria um estado intermediário', () => {
        const automatonWithBlockedEdge: AutomatoData = {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: 'q0', x: 0, y: 0, isInicial: true, isFinal: false },
                { id: 'q1', label: 'q1', x: 100, y: 0, isInicial: false, isFinal: false },
                { id: 'q2', label: 'q2', x: 200, y: 0, isInicial: false, isFinal: true },
            ],
            transicoes: [
                { id: 't0', de: 'q0', para: 'q2', simbolo: 'a', curvatura: 0 },
            ],
        };

        render(<AutomatonPreview data={automatonWithBlockedEdge} />);

        const svg = screen.getByRole('img');
        const transitionPath = [...svg.querySelectorAll('path')]
            .map((path) => path.getAttribute('d') ?? '')
            .find((pathData) => pathData.includes(' Q '));

        const controlY = Number(transitionPath?.match(/ Q [-\d.]+ ([-\d.]+) /)?.[1]);

        expect(Math.abs(controlY)).toBeGreaterThan(20);
    });
});
