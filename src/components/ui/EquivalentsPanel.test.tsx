// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AutomatoData } from '../../types';
import { EquivalentsPanel } from './EquivalentsPanel';

const dfa: AutomatoData = {
    tipo: 'AFD',
    estados: [
        { id: 'q0', label: 'q0', x: 80, y: 80, isInicial: true, isFinal: true }
    ],
    transicoes: [
        { id: 't0', de: 'q0', para: 'q0', simbolo: 'a', curvatura: 0 }
    ]
};

const turingMachine: AutomatoData = {
    tipo: 'MT',
    estados: [
        { id: 'q0', label: 'q0', x: 80, y: 80, isInicial: true, isFinal: false },
        { id: 'qf', label: 'qf', x: 200, y: 80, isInicial: false, isFinal: true }
    ],
    transicoes: [
        { id: 't0', de: 'q0', para: 'qf', simbolo: 'a -> a, R', curvatura: 0 }
    ]
};

describe('EquivalentsPanel', () => {
    it('oculta conversões indisponíveis em vez de mostrar cards N/A', () => {
        render(<EquivalentsPanel data={turingMachine} />);

        fireEvent.click(screen.getByRole('button', { name: /Conversões/i }));

        expect(screen.queryByText('AFN → AFD')).not.toBeInTheDocument();
        expect(screen.queryByText('AFD Minimizado')).not.toBeInTheDocument();
        expect(screen.queryByText('Sem ε-transições')).not.toBeInTheDocument();
        expect(screen.queryByText('N/A')).not.toBeInTheDocument();
        expect(screen.getByText('Nenhuma conversão aplicável para este tipo de autômato.')).toBeInTheDocument();
    });

    it('mantém conversões possíveis visíveis', () => {
        render(<EquivalentsPanel data={dfa} />);

        fireEvent.click(screen.getByRole('button', { name: /Conversões/i }));

        expect(screen.getByText('AFD Minimizado')).toBeInTheDocument();
        expect(screen.queryByText('AFN → AFD')).not.toBeInTheDocument();
        expect(screen.queryByText('N/A')).not.toBeInTheDocument();
    });

    it('mostra indisponibilidade como aviso neutro, não como erro vermelho', () => {
        render(<EquivalentsPanel data={turingMachine} />);

        fireEvent.click(screen.getByRole('button', { name: /Expressão Regular/i }));

        const notice = screen.getByText('Não suportado para este tipo de autômato').closest('div');
        expect(notice).toHaveClass('text-secondary');
        expect(notice).not.toHaveClass('text-ios-red');
    });
});
