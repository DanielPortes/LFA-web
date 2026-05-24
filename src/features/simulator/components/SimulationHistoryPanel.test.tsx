import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
});
