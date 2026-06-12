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
        expect(screen.getByLabelText('Fonte da gramática')).toHaveValue('S -> aA | b');
        expect(screen.getByText(/Converter substitui o autômato atual/)).toBeInTheDocument();
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

    it('descarta curvas manuais antigas ao organizar o autômato', async () => {
        const onChange = vi.fn();
        const automaton: AutomatoData = {
            tipo: 'AP',
            estados: [
                { id: 'q0', label: 'q0', x: 120, y: 120, isInicial: true, isFinal: false },
                { id: 'q1', label: 'q1', x: 140, y: 130, isInicial: false, isFinal: false },
                { id: 'qf', label: 'qf', x: 150, y: 140, isInicial: false, isFinal: true },
            ],
            transicoes: [
                {
                    id: 't1',
                    de: 'q0',
                    para: 'q1',
                    simbolo: 'a, Z -> AZ',
                    curvatura: 80,
                    controlPoint: { x: 360, y: -160 },
                },
                {
                    id: 't2',
                    de: 'q0',
                    para: 'q1',
                    simbolo: 'a, A -> AA',
                    curvatura: 0,
                },
            ],
        };

        await renderEditor({
            data: automaton,
            onChange,
            compact: true,
            compactVariant: 'workspace',
        });

        fireEvent.click(screen.getByRole('button', { name: 'Abrir inspetor do editor' }));
        fireEvent.click(screen.getByRole('button', { name: 'Organizar' }));

        expect(onChange).toHaveBeenCalled();
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
            transicoes: [
                expect.objectContaining({
                    id: 't1',
                    curvatura: expect.any(Number),
                    controlPoint: null,
                }),
                expect.objectContaining({
                    id: 't2',
                    curvatura: expect.any(Number),
                    controlPoint: null,
                }),
            ],
        }));
        const organized = onChange.mock.calls.at(-1)?.[0] as AutomatoData;
        expect(organized.transicoes[0].curvatura).not.toBe(80);
        expect(organized.transicoes[0].curvatura).not.toBe(0);
        expect(organized.transicoes[1].curvatura).not.toBe(0);
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
