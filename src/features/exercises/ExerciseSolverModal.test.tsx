import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UiSettingsProvider } from '../../hooks/UiSettingsContext';
import { ExerciseSolverModal } from './ExerciseSolverModal';
import type { AutomatoData, Exercicio } from '../../types';

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
    isOpen: true,
    exercise,
    exerciseId: 7,
    question: 'Construa um AFD para cadeias terminadas em a.',
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
    onClose: vi.fn(),
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

describe('ExerciseSolverModal', () => {
    beforeEach(() => {
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
            callback(0);
            return 1;
        });
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

    it('renderiza o workspace compacto do editor no modo autômato', () => {
        render(
            <UiSettingsProvider>
                <ExerciseSolverModal
                    {...baseProps}
                    solverMode="automaton"
                />
            </UiSettingsProvider>
        );

        expect(screen.getByRole('dialog', { name: 'Exercício 7' })).toBeInTheDocument();
        expect(screen.getByTestId('solver-editor')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Verificar solução' })).toBeInTheDocument();
    });

    it('mostra textarea e árvore no modo gramática', () => {
        render(
            <UiSettingsProvider>
                <ExerciseSolverModal
                    {...baseProps}
                    solverMode="grammar"
                    grammarTree={{ symbol: 'S', children: [] }}
                />
            </UiSettingsProvider>
        );

        expect(screen.getByLabelText('Fechar exercício')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('S -> a S b | eps')).toBeInTheDocument();
        expect(screen.getByText('Última Árvore Gerada (Falha)')).toBeInTheDocument();
    });
});
