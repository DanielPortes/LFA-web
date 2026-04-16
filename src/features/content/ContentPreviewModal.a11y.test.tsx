import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AutomatoData } from '../../types';
import { runAxe } from '../../test/axe';
import { ContentPreviewModal } from './ContentPreviewModal';

const automaton: AutomatoData = {
    tipo: 'AFD',
    estados: [{ id: 'q0', label: 'q0', x: 120, y: 120, isInicial: true, isFinal: false }],
    transicoes: [],
};

const PreviewHarness = () => {
    const [selectedAutomaton, setSelectedAutomaton] = useState<AutomatoData | null>(null);

    return (
        <div>
            <button type="button" onClick={() => setSelectedAutomaton(automaton)}>
                Abrir preview
            </button>
            <ContentPreviewModal
                automaton={selectedAutomaton}
                onClose={() => setSelectedAutomaton(null)}
                onSimulate={vi.fn()}
            />
        </div>
    );
};

describe('ContentPreviewModal accessibility', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('nomeia o diálogo, foca o primeiro controle e devolve foco ao gatilho', async () => {
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) =>
            window.setTimeout(() => callback(0), 0)
        );

        const { container } = render(<PreviewHarness />);
        const opener = screen.getByRole('button', { name: 'Abrir preview' });

        opener.focus();
        fireEvent.click(opener);

        await waitFor(() => {
            expect(screen.getByRole('dialog', { name: 'Visualização AFD' })).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus();
        });
        expect(await runAxe(container)).toHaveNoViolations();

        fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));

        await waitFor(() => {
            expect(opener).toHaveFocus();
        });
    });
});
