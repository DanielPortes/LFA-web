import type { ComponentProps } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { ToastProvider } from '../ui';
import { UiSettingsProvider } from '../../hooks/UiSettingsContext';
import { AutomatonEditor } from './AutomatonEditor';
import type { AutomatoData } from '../../types';

const emptyAutomaton: AutomatoData = {
    tipo: 'AFD',
    estados: [],
    transicoes: [],
};

const renderEditor = async (props?: Partial<ComponentProps<typeof AutomatonEditor>>) => {
    await act(async () => {
        render(
            <UiSettingsProvider>
                <ToastProvider>
                    <AutomatonEditor
                        data={emptyAutomaton}
                        onChange={vi.fn()}
                        {...props}
                    />
                </ToastProvider>
            </UiSettingsProvider>
        );
        await Promise.resolve();
    });
};

describe('AutomatonEditor', () => {
    beforeEach(() => {
        localStorage.clear();
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

    it('abre o fluxo de importação de gramática pela barra de utilidades', async () => {
        await renderEditor();

        fireEvent.click(screen.getByRole('button', { name: 'Mais' }));
        fireEvent.click(screen.getByRole('button', { name: 'Importar gramática' }));

        expect(screen.getByRole('heading', { name: 'Importar Gramática' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Converter' })).toBeInTheDocument();
    });

    it('oculta a toolbar principal em modo somente leitura', async () => {
        await renderEditor({ readOnly: true });

        expect(screen.queryByRole('button', { name: 'Templates' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Mais' })).not.toBeInTheDocument();
    });
});
