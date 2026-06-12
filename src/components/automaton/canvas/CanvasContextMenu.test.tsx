import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AutomatoData } from '../../../types';
import { CanvasContextMenu } from './CanvasContextMenu';

const data: AutomatoData = {
    tipo: 'AFD',
    estados: [
        { id: 'q0', label: 'q0', x: 100, y: 100, isInicial: true, isFinal: false },
    ],
    transicoes: [],
};

describe('CanvasContextMenu', () => {
    it('abre o menu de estado deslocado do ponto clicado para não cobrir o alvo', () => {
        render(
            <CanvasContextMenu
                contextMenu={{ x: 100, y: 100, type: 'state', targetId: 'q0' }}
                data={data}
                svgRef={{ current: null }}
                currentPan={{ x: 0, y: 0 }}
                zoom={1}
                onClose={vi.fn()}
                onChange={vi.fn()}
                onDeleteState={vi.fn()}
                onDeleteTransition={vi.fn()}
                onCreateStateAtLogical={vi.fn()}
                onResetView={vi.fn()}
            />
        );

        const menu = screen.getByRole('button', { name: 'Inicial' }).closest('[data-context-menu]');

        expect(menu).toHaveStyle({ left: '148px', top: '112px' });
    });
});
