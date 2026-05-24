// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SimulationControls } from './SimulationControls';

const renderControls = (onSpeedChange = vi.fn()) => {
    render(
        <SimulationControls
            isPlaying={false}
            canPlay
            canStepBack={false}
            canStep
            speed={1000}
            onPlay={vi.fn()}
            onPause={vi.fn()}
            onStep={vi.fn()}
            onStepBack={vi.fn()}
            onReset={vi.fn()}
            onSpeedChange={onSpeedChange}
        />
    );
};

describe('SimulationControls', () => {
    it('usa três presets de velocidade em vez de slider contínuo', () => {
        const onSpeedChange = vi.fn();
        renderControls(onSpeedChange);

        expect(screen.queryByRole('slider', { name: 'Velocidade da simulação' })).not.toBeInTheDocument();
        expect(screen.getByRole('group', { name: 'Velocidade da simulação' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Rápido' })).toHaveAttribute('aria-pressed', 'false');
        expect(screen.getByRole('button', { name: 'Normal' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: 'Lento' })).toHaveAttribute('aria-pressed', 'false');
        expect(
            screen.getByRole('button', { name: 'Lento' }).compareDocumentPosition(screen.getByRole('button', { name: 'Rápido' }))
            & Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy();
        expect(screen.queryByText('Rápido')).not.toBeInTheDocument();
        expect(screen.queryByText('Normal')).not.toBeInTheDocument();
        expect(screen.queryByText('Lento')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Lento' }));

        expect(onSpeedChange).toHaveBeenCalledWith(1800);
    });
});
