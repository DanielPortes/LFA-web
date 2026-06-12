// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { Circle } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { ToolbarButton } from './ToolbarButton';

describe('ToolbarButton', () => {
    it('renderiza o tooltip fora de containers com overflow para evitar corte visual', () => {
        render(
            <div data-testid="clipper" className="overflow-hidden">
                <ToolbarButton
                    icon={Circle}
                    label="Organizar"
                    onClick={vi.fn()}
                    side="left"
                />
            </div>
        );

        const button = screen.getByRole('button', { name: 'Organizar' });

        fireEvent.mouseEnter(button);

        const tooltipText = screen.getByText('Organizar');
        const tooltip = tooltipText.closest('.fixed');
        expect(tooltipText.closest('[data-testid="clipper"]')).toBeNull();
        expect(tooltip).not.toBeNull();

        fireEvent.mouseLeave(button);

        expect(screen.queryByText('Organizar')).not.toBeInTheDocument();
    });
});
