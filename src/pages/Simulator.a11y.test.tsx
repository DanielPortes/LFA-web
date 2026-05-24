import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../components/ui';
import { UiSettingsProvider } from '../hooks/UiSettingsContext';
import { runAxe } from '../test/axe';
import { mockAnimationFrames, mockResizeObserver, mockViewport } from '../test/browserMocks';
import { SimulatorPage } from './Simulator';

describe('SimulatorPage accessibility', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
    });

    it('não introduz violações críticas com o inspetor aberto', async () => {
        mockAnimationFrames();
        mockResizeObserver();
        mockViewport({ width: 1280, height: 800, reduceMotion: true });

        const { container } = render(
            <UiSettingsProvider>
                <ToastProvider>
                    <SimulatorPage />
                </ToastProvider>
            </UiSettingsProvider>
        );

        await act(async () => {
            await Promise.resolve();
            await Promise.resolve();
        });

        fireEvent.click(screen.getByRole('button', { name: 'Abrir painel de diagnóstico da simulação' }));

        await waitFor(() => {
            expect(screen.getByText('Simulação e diagnóstico')).toBeInTheDocument();
        });

        expect(screen.getByRole('button', { name: 'Fechar painel de diagnóstico da simulação' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Fechar painel lateral de diagnóstico' })).toBeInTheDocument();
        expect(screen.getByRole('region', { name: 'Canvas do autômato AFD' })).toBeInTheDocument();
        expect(await runAxe(container)).toHaveNoViolations();
    });
});
