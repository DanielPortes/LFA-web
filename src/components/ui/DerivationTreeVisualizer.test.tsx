import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UiSettingsProvider } from '../../hooks/UiSettingsContext';
import { DerivationTreeVisualizer } from './DerivationTreeVisualizer';

const tree = {
    symbol: 'S',
    children: [
        { symbol: 'a', children: [] },
        { symbol: 'S', children: [{ symbol: 'b', children: [] }] },
    ],
};

describe('DerivationTreeVisualizer', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(() => ({
                matches: false,
                media: '',
                onchange: null,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                addListener: vi.fn(),
                removeListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });
    });

    it('abre o modo expandido e mantém controles manuais', () => {
        render(
            <UiSettingsProvider>
                <DerivationTreeVisualizer tree={tree} steps={['S', 'aS', 'ab']} autoPlay={false} />
            </UiSettingsProvider>
        );

        expect(screen.getByText(/nós/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Expandir árvore de derivação' }));

        expect(screen.getByRole('dialog', { name: 'Árvore de derivação' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Aumentar zoom da árvore' })).toBeInTheDocument();
    });
});
