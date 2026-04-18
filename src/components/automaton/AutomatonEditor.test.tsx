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

    it('recolhe chrome persistente no modo compacto e abre overlays sob demanda', async () => {
        await renderEditor({ compact: true });

        expect(screen.queryByRole('button', { name: 'Templates' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Abrir ferramentas do editor' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Abrir painel do editor' })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Abrir ferramentas do editor' }));
        expect(screen.getByRole('button', { name: 'Templates' })).toBeInTheDocument();
    });

    it('mantém o rail de ferramentas visível no modo workspace compacto', async () => {
        await renderEditor({ compact: true, compactVariant: 'workspace' });

        expect(screen.getByRole('button', { name: 'Templates' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Abrir inspetor do editor' })).toBeInTheDocument();
    });

    it('usa rail reduzido no preset de solver', async () => {
        await renderEditor({ compact: true, compactVariant: 'solver' });

        expect(screen.getByRole('button', { name: 'Mover' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Estado' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Transição' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Apagar' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Desfazer' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Refazer' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Templates' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Mais' })).not.toBeInTheDocument();
    });
});
