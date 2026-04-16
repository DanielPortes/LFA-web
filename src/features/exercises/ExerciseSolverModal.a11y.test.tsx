import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UiSettingsProvider } from '../../hooks/UiSettingsContext';
import { runAxe } from '../../test/axe';
import { mockViewport } from '../../test/browserMocks';
import type { AutomatoData, Exercicio } from '../../types';
import { ExerciseSolverModal } from './ExerciseSolverModal';

vi.mock('../../components/automaton/AutomatonEditor', () => ({
    AutomatonEditor: () => <div data-testid="solver-editor">Editor do exercício</div>,
}));

const automaton: AutomatoData = {
    tipo: 'AFD',
    estados: [],
    transicoes: [],
};

const exercise: Exercicio = {
    id: 7,
    pergunta: 'Construa um AFD para cadeias terminadas em a.',
    nivel: 'facil',
    metadata: {
        learningGoal: 'Relacionar sufixo e memória de estado.',
        pattern: 'construction'
    }
};

const baseProps = {
    exercise,
    exerciseId: 7,
    question: 'Construa um AFD para cadeias terminadas em a.',
    solverMode: 'automaton' as const,
    userAutomaton: automaton,
    onAutomatonChange: vi.fn(),
    onSimulate: vi.fn(),
    userRegex: '',
    onRegexChange: vi.fn(),
    regexError: null,
    userGrammar: 'S -> a S b | eps',
    onGrammarChange: vi.fn(),
    grammarError: null,
    grammarWarnings: [],
    grammarTree: null,
    userText: '',
    onTextChange: vi.fn(),
    answeredLabel: false,
    onMarkCompleted: vi.fn(),
    onOpenConverter: vi.fn(),
    onResetAutomaton: vi.fn(),
    hasTests: true,
    tests: [{ input: 'a', expected: 'accept' as const }],
    showExpected: false,
    onToggleShowExpected: vi.fn(),
    fastVerify: false,
    onToggleFastVerify: vi.fn(),
    testResults: {},
    verifyDisabledReason: null,
    isVerifying: false,
    onVerify: vi.fn(),
    lastFailure: null,
    equivalenceStatus: null as 'pass' | 'fail' | null,
    lastTrace: null,
    formatStateList: (ids: string[]) => ids.join(', '),
};

const SolverHarness = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <UiSettingsProvider>
            <div>
                <button type="button" onClick={() => setIsOpen(true)}>
                    Abrir exercício
                </button>
                <ExerciseSolverModal
                    {...baseProps}
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                />
            </div>
        </UiSettingsProvider>
    );
};

describe('ExerciseSolverModal accessibility', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('mantém diálogo nomeado, foco inicial consistente e retorno de foco ao fechar', async () => {
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) =>
            window.setTimeout(() => callback(0), 0)
        );
        mockViewport({ width: 1280, height: 800, reduceMotion: true });

        const { container } = render(<SolverHarness />);
        const opener = screen.getByRole('button', { name: 'Abrir exercício' });

        opener.focus();
        fireEvent.click(opener);

        await waitFor(() => {
            expect(screen.getByRole('dialog', { name: 'Exercício 7' })).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Abrir conversor de modelos' })).toHaveFocus();
        });
        expect(screen.getByRole('button', { name: 'Verificar solução' })).toBeInTheDocument();
        expect(await runAxe(container)).toHaveNoViolations();

        fireEvent.click(screen.getByRole('button', { name: 'Fechar exercício' }));

        await waitFor(() => {
            expect(opener).toHaveFocus();
        });
    }, 15000);
});
