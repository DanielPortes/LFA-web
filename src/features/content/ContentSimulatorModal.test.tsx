import { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../../components/ui';
import { UiSettingsProvider } from '../../hooks/UiSettingsContext';
import { mockAnimationFrames, mockResizeObserver, mockViewport } from '../../test/browserMocks';
import type { AutomatoData } from '../../types';
import { ContentSimulatorModal } from './ContentSimulatorModal';

const emptyAutomaton: AutomatoData = {
    tipo: 'AFD',
    estados: [],
    transicoes: [],
    descricao: 'Autômato de teste'
};

const Harness = ({ onOpenFullSimulator = vi.fn() }: { onOpenFullSimulator?: (data: AutomatoData) => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <UiSettingsProvider>
            <ToastProvider>
                <button type="button" onClick={() => setIsOpen(true)}>
                    Abrir simulador
                </button>
                <ContentSimulatorModal
                    automaton={isOpen ? emptyAutomaton : null}
                    onClose={() => setIsOpen(false)}
                    onOpenFullSimulator={onOpenFullSimulator}
                />
            </ToastProvider>
        </UiSettingsProvider>
    );
};

describe('ContentSimulatorModal', () => {
    beforeEach(() => {
        mockAnimationFrames();
        mockResizeObserver();
        mockViewport({ width: 1280, height: 800 });

        Object.defineProperty(SVGSVGElement.prototype, 'getScreenCTM', {
            configurable: true,
            value: vi.fn(() => ({
                a: 1,
                d: 1,
                e: 0,
                f: 0,
            })),
        });

        Object.defineProperty(SVGSVGElement.prototype, 'getBoundingClientRect', {
            configurable: true,
            value: vi.fn(() => ({
                x: 0,
                y: 0,
                left: 0,
                top: 0,
                right: 960,
                bottom: 640,
                width: 960,
                height: 640,
                toJSON: () => ({})
            })),
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
    });

    it('abre o workspace interativo, cria estado no duplo clique e descarta alterações ao fechar', async () => {
        render(<Harness />);
        const opener = screen.getByRole('button', { name: 'Abrir simulador' });

        opener.focus();
        fireEvent.click(opener);

        await waitFor(() => {
            expect(screen.getByRole('dialog', { name: 'Simule sem sair da trilha' })).toBeInTheDocument();
        });

        const svg = document.querySelector('[data-automaton-editor="true"] svg');
        expect(svg).not.toBeNull();

        fireEvent.doubleClick(svg!, { clientX: 240, clientY: 220 });

        await waitFor(() => {
            expect(screen.getByText('q0')).toBeInTheDocument();
        });

        fireEvent.contextMenu(svg!, { clientX: 320, clientY: 260 });

        expect(await screen.findByText('Novo Estado')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Fechar simulador da trilha' }));

        await waitFor(() => {
            expect(opener).toHaveFocus();
        });

        fireEvent.click(opener);

        await waitFor(() => {
            expect(screen.getByRole('dialog', { name: 'Simule sem sair da trilha' })).toBeInTheDocument();
        });

        expect(screen.queryByText('q0')).not.toBeInTheDocument();
    });

    it('encaminha o estado atual ao simulador principal quando solicitado', async () => {
        const onOpenFullSimulator = vi.fn();
        render(<Harness onOpenFullSimulator={onOpenFullSimulator} />);

        fireEvent.click(screen.getByRole('button', { name: 'Abrir simulador' }));

        await waitFor(() => {
            expect(screen.getByRole('dialog', { name: 'Simule sem sair da trilha' })).toBeInTheDocument();
        });

        const svg = document.querySelector('[data-automaton-editor="true"] svg');
        expect(svg).not.toBeNull();

        fireEvent.doubleClick(svg!, { clientX: 240, clientY: 220 });

        await waitFor(() => {
            expect(screen.getByText('q0')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: 'Abrir autômato atual no simulador principal' }));

        expect(onOpenFullSimulator).toHaveBeenCalledWith(expect.objectContaining({
            estados: [expect.objectContaining({ label: 'q0' })]
        }));
    });

    it('não intercepta Space nos botões do cabeçalho do modal', async () => {
        render(<Harness />);

        fireEvent.click(screen.getByRole('button', { name: 'Abrir simulador' }));

        await waitFor(() => {
            expect(screen.getByRole('dialog', { name: 'Simule sem sair da trilha' })).toBeInTheDocument();
        });

        const headerButton = screen.getByRole('button', { name: 'Abrir autômato atual no simulador principal' });
        const event = new KeyboardEvent('keydown', {
            key: ' ',
            code: 'Space',
            bubbles: true,
            cancelable: true,
        });

        act(() => {
            headerButton.dispatchEvent(event);
        });

        expect(event.defaultPrevented).toBe(false);
    });
});
