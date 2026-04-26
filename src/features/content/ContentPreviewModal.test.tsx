import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContentPreviewModal } from './ContentPreviewModal';
import type { AutomatoData } from '../../types';

const automaton: AutomatoData = {
    tipo: 'AFD',
    estados: [{ id: 'q0', label: 'q0', x: 120, y: 120, isInicial: true, isFinal: false }],
    transicoes: [],
};

describe('ContentPreviewModal', () => {
    beforeEach(() => {
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
            callback(0);
            return 1;
        });
    });

    it('usa o viewer somente leitura e encaminha abertura para o simulador', () => {
        const onSimulate = vi.fn();

        render(
            <ContentPreviewModal
                automaton={automaton}
                onClose={vi.fn()}
                onSimulate={onSimulate}
            />
        );

        expect(screen.getByRole('dialog', { name: 'Visualização AFD' })).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'Visualização ampliada do autômato AFD' })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Abrir autômato no laboratório interativo' }));

        expect(onSimulate).toHaveBeenCalledWith(automaton);
    });
});
