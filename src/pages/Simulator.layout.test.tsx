import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../components/ui';
import { UiSettingsProvider } from '../hooks/UiSettingsContext';
import { mockAnimationFrames, mockResizeObserver, mockViewport } from '../test/browserMocks';
import { SimulatorPage } from './Simulator';

const viewportMatrix = [
    { label: '390x844', width: 390, height: 844 },
    { label: '768x1024', width: 768, height: 1024 },
    { label: '1280x800', width: 1280, height: 800 },
    { label: '1440x900', width: 1440, height: 900 },
];

describe('SimulatorPage layout', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
    });

    viewportMatrix.forEach(({ label, width, height }) => {
        it(`mantém o canvas dominante e o inspetor acessível em ${label}`, async () => {
            mockAnimationFrames();
            mockResizeObserver();
            mockViewport({ width, height });

            await act(async () => {
                render(
                    <UiSettingsProvider>
                        <ToastProvider>
                            <SimulatorPage />
                        </ToastProvider>
                    </UiSettingsProvider>
                );
                await Promise.resolve();
                await Promise.resolve();
            });

            expect(screen.queryByText('Simulador de autômatos')).not.toBeInTheDocument();
            expect(screen.getByRole('region', { name: 'Canvas do autômato AFD' })).toBeInTheDocument();

            fireEvent.change(screen.getByPlaceholderText('Digite a entrada para o autômato...'), {
                target: { value: 'a' },
            });
            fireEvent.click(screen.getByRole('button', { name: 'Abrir painel de diagnóstico da simulação' }));

            expect(screen.getByText('Simulação e diagnóstico')).toBeInTheDocument();
            expect(screen.getByText(/Defina o alfabeto de entrada no autômato/)).toBeInTheDocument();
        });
    });

    it('mantém retorno claro quando o simulador foi aberto a partir de um exercício', async () => {
        mockAnimationFrames();
        mockResizeObserver();
        mockViewport({ width: 1280, height: 800 });
        const onReturnToExercise = vi.fn();

        await act(async () => {
            render(
                <UiSettingsProvider>
                    <ToastProvider>
                        <SimulatorPage
                            returnToExerciseLabel="Exercício 1 · Autômato de Pilha"
                            onReturnToExercise={onReturnToExercise}
                        />
                    </ToastProvider>
                </UiSettingsProvider>
            );
            await Promise.resolve();
            await Promise.resolve();
        });

        fireEvent.click(screen.getByRole('button', { name: /Voltar · Exercício 1 · Autômato de Pilha/ }));
        expect(onReturnToExercise).toHaveBeenCalledTimes(1);
    });
});
