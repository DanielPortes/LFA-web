import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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
    it('mostra o modo de aceitação de AP em linguagem didática', () => {
        render(<EditorPropertiesCard {...baseProps} />);

        expect(screen.getByText('pilha vazia')).toBeInTheDocument();
        expect(screen.queryByText('empty')).not.toBeInTheDocument();
    });
});
