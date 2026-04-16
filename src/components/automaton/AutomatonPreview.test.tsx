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
});
