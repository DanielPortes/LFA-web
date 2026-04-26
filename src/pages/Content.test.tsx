import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CourseModule } from '../types';
import { ConteudoSection } from './Content';

vi.mock('../components/automaton/AutomatonPreview', () => ({
    AutomatonPreview: () => <div data-testid="automaton-preview">preview</div>
}));

vi.mock('../features/simulator', () => ({
    AutomatonSimulationWorkspace: () => (
        <div data-testid="content-simulator-workspace">Simulador embutido</div>
    )
}));

const automaton = {
    tipo: 'AFD' as const,
    estados: [],
    transicoes: [],
    descricao: 'Exemplo'
};

const modules: CourseModule[] = [
    {
        id: 'mod-1',
        title: 'Fundamentos',
        lessons: [
            {
                id: 'lesson-1',
                title: 'Primeiros passos',
                description: 'Introdução à modelagem.',
                content: [
                    {
                        type: 'example',
                        title: 'Exemplo guiado',
                        content: 'Monte e simule o autômato abaixo.',
                        automatoRef: automaton
                    }
                ]
            }
        ]
    }
];

vi.mock('../features/content/useCourseModulesData', () => ({
    useCourseModulesData: () => ({
        modules,
        isLoading: false,
        error: null
    })
}));

describe('ConteudoSection', () => {
    beforeEach(() => {
        window.scrollTo = vi.fn();
        HTMLElement.prototype.scrollTo = vi.fn();
        Object.defineProperty(window, 'matchMedia', {
            configurable: true,
            writable: true,
            value: vi.fn().mockImplementation(() => ({
                matches: true,
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

    it('abre o simulador em modal ao clicar em simular sem encaminhar direto para a aba principal', async () => {
        const onOpenFullSimulator = vi.fn();

        render(<ConteudoSection onOpenFullSimulator={onOpenFullSimulator} />);

        fireEvent.click(screen.getByRole('button', { name: 'SIMULAR' }));

        await waitFor(() => {
            expect(screen.getByRole('dialog', { name: 'Simule sem sair da trilha' })).toBeInTheDocument();
        });

        expect(screen.getByTestId('content-simulator-workspace')).toBeInTheDocument();
        expect(onOpenFullSimulator).not.toHaveBeenCalled();
    });

    it('permite sair do preview para o simulador interativo da trilha', async () => {
        const onOpenFullSimulator = vi.fn();

        render(<ConteudoSection onOpenFullSimulator={onOpenFullSimulator} />);

        fireEvent.click(screen.getByRole('button', { name: 'Expandir visualização do autômato' }));

        await waitFor(() => {
            expect(screen.getByRole('dialog', { name: 'Visualização AFD' })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: 'Abrir autômato no laboratório interativo' }));

        await waitFor(() => {
            expect(screen.getByRole('dialog', { name: 'Simule sem sair da trilha' })).toBeInTheDocument();
        });

        expect(screen.getByTestId('content-simulator-workspace')).toBeInTheDocument();
        expect(onOpenFullSimulator).not.toHaveBeenCalled();
    });
});
