import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SimulationStep } from '../../../types';
import { SimulationHistoryPanel } from './SimulationHistoryPanel';

describe('SimulationHistoryPanel', () => {
    it('usa rótulos didáticos em português no histórico de passos', () => {
        const history: SimulationStep[] = [
            {
                activeStates: ['q0'],
                remainingInput: ['a'],
                processedInput: [],
                status: 'running',
            },
        ];

        render(
            <SimulationHistoryPanel
                showDetails
                history={history}
                alphabet={['a']}
                formatStateList={(ids) => ids?.join(', ') ?? 'vazio'}
            />
        );

        expect(screen.getByText('Início')).toBeInTheDocument();
        expect(screen.getByText('Rodando')).toBeInTheDocument();
        expect(screen.queryByText('START')).not.toBeInTheDocument();
        expect(screen.queryByText('running')).not.toBeInTheDocument();
    });

    it('permite clicar em uma linha compacta para voltar ao passo escolhido', () => {
        const history: SimulationStep[] = [
            {
                activeStates: ['q0'],
                remainingInput: ['a', 'b'],
                processedInput: [],
                status: 'running',
            },
            {
                activeStates: ['q1'],
                remainingInput: ['b'],
                processedInput: ['a'],
                status: 'running',
                symbol: 'a',
            },
            {
                activeStates: ['q2'],
                remainingInput: [],
                processedInput: ['a', 'b'],
                status: 'accepted',
                symbol: 'b',
            },
        ];
        const onSelectStep = vi.fn();

        render(
            <SimulationHistoryPanel
                showDetails
                history={history}
                currentStepIndex={1}
                alphabet={['a', 'b']}
                formatStateList={(ids) => ids?.join(', ') ?? 'vazio'}
                onSelectStep={onSelectStep}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Voltar para o passo 1' }));

        expect(onSelectStep).toHaveBeenCalledWith(1);
        expect(screen.queryByText('Símbolo lido')).not.toBeInTheDocument();
        expect(screen.getByText('q1')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Voltar para o passo 1' })).toHaveAttribute('aria-current', 'step');
        expect(screen.getByRole('button', { name: 'Voltar para o passo 2' })).toBeInTheDocument();
    });
});
