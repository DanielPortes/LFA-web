import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SimulationTapePanel } from './SimulationTapePanel';
import type { AutomatoData, SimulationStep } from '../../../types';

const automaton: AutomatoData = {
    tipo: 'AP',
    estados: [
        { id: 'q0', label: 'q0', x: 0, y: 0, isInicial: true, isFinal: false },
        { id: 'q1', label: 'q1', x: 100, y: 0, isInicial: false, isFinal: true },
    ],
    transicoes: [],
};

const pdaStep: SimulationStep = {
    activeStates: ['q0'],
    processedInput: [],
    remainingInput: ['a', 'b'],
    status: 'running',
    activeConfigs: [
        {
            stateId: 'q0',
            stack: ['Z', 'A'],
        },
    ],
};

describe('SimulationTapePanel', () => {
    it('separa a fita preenchida e a pilha do AP como elementos nativos apos iniciar', () => {
        render(
            <SimulationTapePanel
                data={automaton}
                inputTokens={['a', 'b']}
                history={[pdaStep]}
                simulationState={pdaStep}
                simulationStatus="running"
                isTuring={false}
                isAll={false}
                isMoore={false}
                isMealy={false}
                isPda={true}
                stepCount={0}
                totalSteps={2}
            />
        );

        expect(screen.queryByText('Pilha e entrada')).not.toBeInTheDocument();
        expect(screen.queryByText(/AP:/)).not.toBeInTheDocument();

        const inputRail = screen.getByTestId('pda-input-rail');
        const stackWidget = screen.getByTestId('pda-stack-widget');

        expect(inputRail).toHaveClass('overflow-x-auto');
        expect(stackWidget).toHaveClass('bg-transparent');
        expect(stackWidget).not.toHaveClass('border');
        expect(within(inputRail).getByText('a')).toBeInTheDocument();
        expect(within(stackWidget).getByText('Topo')).toBeInTheDocument();
        expect(within(stackWidget).getByText('A')).toBeInTheDocument();
    });

    it('nao mostra trilho de entrada vazio antes nem depois de iniciar o AP', () => {
        const { rerender } = render(
            <SimulationTapePanel
                data={automaton}
                inputTokens={[]}
                history={[]}
                simulationState={null}
                simulationStatus="idle"
                isTuring={false}
                isAll={false}
                isMoore={false}
                isMealy={false}
                isPda={true}
                stepCount={0}
                totalSteps={0}
            />
        );

        expect(screen.queryByTestId('pda-input-rail')).not.toBeInTheDocument();
        expect(screen.queryByTestId('pda-stack-widget')).not.toBeInTheDocument();

        rerender(
            <SimulationTapePanel
                data={automaton}
                inputTokens={[]}
                history={[pdaStep]}
                simulationState={pdaStep}
                simulationStatus="running"
                isTuring={false}
                isAll={false}
                isMoore={false}
                isMealy={false}
                isPda={true}
                stepCount={0}
                totalSteps={0}
            />
        );

        expect(screen.queryByTestId('pda-input-rail')).not.toBeInTheDocument();
        expect(screen.queryByText(/Entrada vazia/)).not.toBeInTheDocument();
        expect(screen.getByTestId('pda-stack-widget')).toBeInTheDocument();
    });
});
