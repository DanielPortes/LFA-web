import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../components/ui';
import { UiSettingsProvider } from '../hooks/UiSettingsContext';
import { mockAnimationFrames, mockResizeObserver, mockViewport } from '../test/browserMocks';
import { emptyStringDFA, simpleDFA, simplePDA } from '../test/fixtures';
import type { AutomatoData } from '../types';
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
        expect(screen.queryByText('Pronto')).not.toBeInTheDocument();
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

    it('abre o diagnóstico quando o aluno inicia pelo Enter no campo de entrada', async () => {
        mockAnimationFrames();
        mockResizeObserver();
        mockViewport({ width: 1280, height: 800 });

        await act(async () => {
            render(
                <UiSettingsProvider>
                    <ToastProvider>
                        <SimulatorPage initialData={simpleDFA} />
                    </ToastProvider>
                </UiSettingsProvider>
            );
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(screen.queryByText('Simulação e diagnóstico')).not.toBeInTheDocument();

        const input = screen.getByPlaceholderText('Digite a entrada para o autômato...');
        fireEvent.change(input, { target: { value: 'ab' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        expect(screen.queryByText('Simulação e diagnóstico')).not.toBeInTheDocument();
        expect(screen.getByTestId('native-simulation-readout')).toBeInTheDocument();
        expect(screen.getByText('Visualização')).toBeInTheDocument();
    });

    it('mostra a visualização da entrada vazia quando o aluno testa sem símbolos', async () => {
        mockAnimationFrames();
        mockResizeObserver();
        mockViewport({ width: 1280, height: 800 });

        await act(async () => {
            render(
                <UiSettingsProvider>
                    <ToastProvider>
                        <SimulatorPage initialData={emptyStringDFA} />
                    </ToastProvider>
                </UiSettingsProvider>
            );
            await Promise.resolve();
            await Promise.resolve();
        });

        fireEvent.click(screen.getByRole('button', { name: 'Iniciar simulação' }));

        expect(screen.queryByText('Simulação e diagnóstico')).not.toBeInTheDocument();
        expect(screen.getByTestId('native-simulation-readout')).toBeInTheDocument();
        const emptyInputNotice = screen.getByText(/Entrada vazia/);
        expect(emptyInputNotice).toBeVisible();
        expect(emptyInputNotice.closest('.opacity-0')).toBeNull();
    });

    it('mantém a pilha visível no inspetor quando o aluno testa um AP', async () => {
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

        fireEvent.click(screen.getByRole('button', { name: 'Iniciar simulação' }));

        const stackWidget = screen.getByTestId('pda-stack-widget');
        expect(stackWidget).toBeVisible();
        expect(stackWidget).toHaveClass('bg-transparent');
        expect(stackWidget).not.toHaveClass('border');
        expect(stackWidget.closest('.opacity-0')).toBeNull();
        expect(screen.queryByRole('button', { name: 'Alertas' })).not.toBeInTheDocument();
        expect(screen.queryByText(/AP:/)).not.toBeInTheDocument();
        expect(screen.queryByTestId('pda-input-rail')).not.toBeInTheDocument();
    });

    it('reflete no canvas e no status o tipo inferido do autômato finito em edição', async () => {
        mockAnimationFrames();
        mockResizeObserver();
        mockViewport({ width: 1280, height: 800 });

        const structurallyNfa: AutomatoData = {
            ...simpleDFA,
            tipo: 'AFD',
            transicoes: [
                { id: 't1', de: 'q0', para: 'q0', simbolo: 'a', curvatura: 0 },
                { id: 't2', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
            ],
        };

        await act(async () => {
            render(
                <UiSettingsProvider>
                    <ToastProvider>
                        <SimulatorPage initialData={structurallyNfa} />
                    </ToastProvider>
                </UiSettingsProvider>
            );
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(screen.getByRole('region', { name: 'Canvas do autômato AFN' })).toBeInTheDocument();
        expect(screen.getByText('AFN')).toBeInTheDocument();
    });

    it('mantém o inspetor compacto do editor quando só há visualização nativa de simulação', async () => {
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

        expect(screen.queryByText('Simulação e diagnóstico')).not.toBeInTheDocument();
        expect(screen.queryByTestId('pda-player-row')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Abrir inspetor do editor' })).toBeInTheDocument();
    });
});
