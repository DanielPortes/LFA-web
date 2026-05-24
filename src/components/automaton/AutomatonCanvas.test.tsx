import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AutomatonCanvas } from './AutomatonCanvas';
import type { AutomatoData } from '../../types';

const automaton: AutomatoData = {
    tipo: 'AFD',
    estados: [
        { id: 'q0', label: 'q0', x: 100, y: 100, isInicial: true, isFinal: false },
    ],
    transicoes: [],
};

const renderCanvas = (onChange = vi.fn()) => {
    const result = render(
        <div style={{ width: 500, height: 400 }}>
            <AutomatonCanvas
                data={automaton}
                tool="pointer"
                onChange={onChange}
                zoom={1}
                pan={{ x: 0, y: 0 }}
            />
        </div>
    );

    const stateGroup = result.container.querySelector('#group-q0');
    const svg = result.container.querySelector('svg');

    if (!stateGroup || !svg) {
        throw new Error('Canvas test setup failed.');
    }

    return { ...result, stateGroup, svg, onChange };
};

describe('AutomatonCanvas', () => {
    beforeEach(() => {
        Object.defineProperty(SVGElement.prototype, 'getScreenCTM', {
            configurable: true,
            value: () => ({ a: 1, d: 1, e: 0, f: 0 }),
        });
    });

    it('abre a edição do estado ao clicar sem arrastar', async () => {
        const { stateGroup, svg } = renderCanvas();

        fireEvent.mouseDown(stateGroup, { clientX: 100, clientY: 100 });
        fireEvent.mouseUp(svg, { clientX: 100, clientY: 100 });

        expect(await screen.findByText('Nome')).toBeInTheDocument();
    });

    it('move o estado sem abrir edição quando há arraste real', async () => {
        const onChange = vi.fn();
        const { stateGroup, svg } = renderCanvas(onChange);

        fireEvent.mouseDown(stateGroup, { clientX: 100, clientY: 100 });
        fireEvent.mouseMove(svg, { clientX: 132, clientY: 100 });
        fireEvent.mouseUp(svg, { clientX: 132, clientY: 100 });

        await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
        expect(onChange.mock.calls[0][0].estados[0]).toMatchObject({ id: 'q0', x: 132, y: 100 });
        expect(screen.queryByText('Nome')).not.toBeInTheDocument();
    });
});
