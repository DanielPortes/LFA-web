import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../components/ui';
import { UiSettingsProvider } from '../hooks/UiSettingsContext';
import { mockAnimationFrames, mockResizeObserver, mockViewport } from '../test/browserMocks';
import { simplePDA } from '../test/fixtures';
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

    it('não anuncia execução em andamento antes do aluno iniciar ou avançar', async () => {
        mockAnimationFrames();
        mockResizeObserver();
        mockViewport({ width: 1280, height: 800 });

        await act(async () => {
            render(
                <UiSettingsProvider>
                    <ToastProvider>
                        <SimulatorPage initialData={simplePDA} />
                    </ToastProvider>
                </UiSettingsProvider>
            );
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(screen.getByText(/Simulação pronta/)).toBeInTheDocument();
        expect(screen.queryByText(/Simulação running/)).not.toBeInTheDocument();
        expect(screen.getByText('Pronto')).toBeInTheDocument();
    });

    it('não mantém estados ativos visíveis enquanto a simulação ainda está pronta', async () => {
        mockAnimationFrames();
        mockResizeObserver();
        mockViewport({ width: 1280, height: 800 });

        await act(async () => {
            render(
                <UiSettingsProvider>
                    <ToastProvider>
                        <SimulatorPage initialData={simplePDA} />
                    </ToastProvider>
                </UiSettingsProvider>
            );
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(screen.getByText(/Simulação pronta/)).toHaveTextContent('Nenhum estado ativo.');
    });

    it('remove o inspetor compacto do editor enquanto o painel lateral de simulação ocupa a área', async () => {
        mockAnimationFrames();
        mockResizeObserver();
        mockViewport({ width: 1280, height: 800 });

        await act(async () => {
            render(
                <UiSettingsProvider>
                    <ToastProvider>
                        <SimulatorPage initialData={simplePDA} />
                    </ToastProvider>
                </UiSettingsProvider>
            );
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(screen.getByText('Simulação e diagnóstico')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Abrir inspetor do editor' })).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Fechar painel lateral de diagnóstico' }));

        expect(screen.getByRole('button', { name: 'Abrir inspetor do editor' })).toBeInTheDocument();
    });
});
