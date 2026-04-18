import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
            callback(0);
            return 1;
        });
        document.body.style.overflow = '';
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('trava o scroll do body enquanto está aberto e libera ao fechar', () => {
        const onClose = vi.fn();
        const { rerender } = render(
            <Modal isOpen={true} onClose={onClose} title="Preferências">
                Conteúdo
            </Modal>
        );

        expect(document.body.style.overflow).toBe('hidden');
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        rerender(
            <Modal isOpen={false} onClose={onClose} title="Preferências">
                Conteúdo
            </Modal>
        );

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(document.body.style.overflow).toBe('unset');
    });

    it('fecha pelo backdrop e respeita cabeçalho customizado', () => {
        const onClose = vi.fn();

        render(
            <Modal
                isOpen={true}
                onClose={onClose}
                hideHeader={false}
                header={<div>Topo customizado</div>}
            >
                Corpo
            </Modal>
        );

        expect(screen.getByText('Topo customizado')).toBeInTheDocument();

        const backdrop = screen.getByRole('dialog').parentElement?.querySelector('div.absolute');
        expect(backdrop).not.toBeNull();

        fireEvent.click(backdrop!);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('renderiza em portal para não ficar preso a contêiner com transform', () => {
        const onClose = vi.fn();

        render(
            <div data-testid="transform-parent" style={{ transform: 'translateY(10px)' }}>
                <Modal isOpen={true} onClose={onClose} title="Preferências">
                    Conteúdo
                </Modal>
            </div>
        );

        const dialog = screen.getByRole('dialog', { name: 'Preferências' });
        const transformedParent = screen.getByTestId('transform-parent');

        expect(transformedParent.contains(dialog)).toBe(false);
        expect(dialog.parentElement?.parentElement).toBe(document.body);
    });
});
