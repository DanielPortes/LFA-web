import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { simplePDA } from '../../../test/fixtures';
import { EditorPropertiesCard } from './EditorPropertiesCard';

const baseProps: Parameters<typeof EditorPropertiesCard>[0] = {
    data: { ...simplePDA, pdaAcceptance: 'empty' },
    pdaProps: {
        alfabetoPilha: ['Z', 'A'],
        simboloInicialPilha: 'Z',
        pdaAcceptance: 'empty',
    },
    showProps: true,
    alphabetInput: 'a, b',
    stackAlphabetInput: 'Z, A',
    stackStartSymbol: 'Z',
    onToggleProps: vi.fn(),
    onTypeChange: vi.fn(),
    onAutoAlphabet: vi.fn(),
    onAlphabetInputChange: vi.fn(),
    onAlphabetFocus: vi.fn(),
    onAlphabetCommit: vi.fn(),
    onStackAlphabetInputChange: vi.fn(),
    onStackAlphabetFocus: vi.fn(),
    onStackAlphabetCommit: vi.fn(),
    onStackStartChange: vi.fn(),
    onStackStartFocus: vi.fn(),
    onStackStartCommit: vi.fn(),
};

describe('EditorPropertiesCard', () => {
    beforeEach(() => {
        Element.prototype.getBoundingClientRect = vi.fn(() => ({
            x: 100,
            y: 100,
            left: 100,
            top: 100,
            right: 320,
            bottom: 136,
            width: 220,
            height: 36,
            toJSON: () => ({}),
        } as DOMRect));
    });

    it('mostra o modo de aceitação de AP em linguagem didática', () => {
        render(<EditorPropertiesCard {...baseProps} />);

        expect(screen.getByText('pilha vazia')).toBeInTheDocument();
        expect(screen.queryByText('empty')).not.toBeInTheDocument();
    });

    it('explica o papel prático da família de máquina selecionada', () => {
        render(<EditorPropertiesCard {...baseProps} />);

        expect(screen.getByText('Família de máquina')).toBeInTheDocument();
        expect(screen.getByText(/Define quais regras o simulador usa/)).toBeInTheDocument();
        expect(screen.getByText(/Usa uma pilha como memória auxiliar/)).toBeInTheDocument();
    });

    it('avisa que AFD e AFN podem ser inferidos automaticamente pela estrutura', () => {
        render(
            <EditorPropertiesCard
                {...baseProps}
                data={{ ...baseProps.data, tipo: 'AFD' }}
                pdaProps={{}}
            />
        );

        expect(screen.getByText(/Se você criar não determinismo/)).toBeInTheDocument();
    });

    it('usa lista própria legível para trocar a família de máquina', () => {
        const onTypeChange = vi.fn();

        render(<EditorPropertiesCard {...baseProps} onTypeChange={onTypeChange} />);

        fireEvent.click(screen.getByRole('button', { name: 'Selecionar família de máquina' }));

        expect(screen.getByRole('listbox', { name: 'Famílias de máquina' })).toBeInTheDocument();
        expect(screen.getByRole('listbox', { name: 'Famílias de máquina' }).parentElement).toBe(document.body);
        expect(screen.getByRole('option', { name: /Máquina de TuringMT/i })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('option', { name: /Máquina de TuringMT/i }));

        expect(onTypeChange).toHaveBeenCalledWith('MT');
        expect(screen.queryByRole('listbox', { name: 'Famílias de máquina' })).not.toBeInTheDocument();
    });
});
