import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { simpleDFA } from '../../../test/fixtures';
import { EditorConversionModal } from './EditorConversionModal';

describe('EditorConversionModal', () => {
    it('explica o impacto da conversão antes de substituir o autômato atual', () => {
        const onApplyAutomaton = vi.fn();

        render(
            <EditorConversionModal
                modal={{
                    title: 'Determinizar (AFN → AFD)',
                    steps: [{ title: 'Subconjuntos', detail: 'criados' }],
                    automaton: simpleDFA,
                }}
                onClose={vi.fn()}
                onApplyAutomaton={onApplyAutomaton}
            />
        );

        expect(screen.getByText('Resultado gerado')).toBeInTheDocument();
        expect(screen.getByText('AFD')).toBeInTheDocument();
        expect(screen.getByText(/Substitui o autômato atual/)).toBeInTheDocument();
        expect(screen.getByText(/Ctrl\+Z/)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Aplicar conversão' }));
        expect(onApplyAutomaton).toHaveBeenCalledWith(simpleDFA);
    });
});
