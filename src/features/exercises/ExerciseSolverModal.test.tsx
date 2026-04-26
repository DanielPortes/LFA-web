// @vitest-environment jsdom

import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UiSettingsProvider } from '../../hooks/UiSettingsContext';
import { ExerciseSolverModal } from './ExerciseSolverModal';
import type { AutomatoData, Exercicio } from '../../types';

const { automatonEditorMock } = vi.hoisted(() => ({
    automatonEditorMock: vi.fn(),
}));

vi.mock('../../components/automaton/AutomatonEditor', () => ({
    AutomatonEditor: (props: Record<string, unknown>) => {
        automatonEditorMock(props);
        return <div data-testid="solver-editor">Editor do exercício</div>;
    },
}));

vi.mock('../../components/automaton/AutomatonPreview', () => ({
    AutomatonPreview: () => <div data-testid="answer-automaton-preview">Preview do gabarito</div>,
}));

const automaton: AutomatoData = {
    tipo: 'AFD',
    estados: [],
    transicoes: [],
};

const studentAttemptAutomaton: AutomatoData = {
    tipo: 'AFD',
    estados: [
        { id: 's0', label: 's0', x: 80, y: 80, isInicial: true, isFinal: false },
    ],
    transicoes: [],
};

const answerAutomaton: AutomatoData = {
    tipo: 'AFD',
    estados: [
        { id: 'q0', label: 'q0', x: 120, y: 120, isInicial: true, isFinal: false },
        { id: 'q1', label: 'q1', x: 320, y: 120, isInicial: false, isFinal: true },
    ],
    transicoes: [
        { id: 't0', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
        { id: 't1', de: 'q1', para: 'q1', simbolo: 'a', curvatura: 0.35 },
    ],
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

const SolverAutomatonHarness = () => {
    const [currentAutomaton, setCurrentAutomaton] = useState<AutomatoData>(studentAttemptAutomaton);
    const [savedAttempt, setSavedAttempt] = useState<AutomatoData | null>(null);
    const [isViewingAnswerAutomaton, setIsViewingAnswerAutomaton] = useState(false);

    const cloneAutomaton = (data: AutomatoData): AutomatoData => JSON.parse(JSON.stringify(data)) as AutomatoData;

    const handleLoadAnswerAutomaton = (data: AutomatoData) => {
        setSavedAttempt((currentSavedAttempt) => currentSavedAttempt ?? cloneAutomaton(currentAutomaton));
        setCurrentAutomaton(cloneAutomaton(data));
        setIsViewingAnswerAutomaton(true);
    };

    const handleRestoreAttempt = () => {
        if (!savedAttempt) return;
        setCurrentAutomaton(cloneAutomaton(savedAttempt));
        setSavedAttempt(null);
        setIsViewingAnswerAutomaton(false);
    };

    return (
        <UiSettingsProvider>
            <ExerciseSolverModal
                {...baseProps}
                solverMode="automaton"
                exercise={{
                    ...exercise,
                    respostaAutomato: answerAutomaton,
                }}
                userAutomaton={currentAutomaton}
                onAutomatonChange={setCurrentAutomaton}
                onLoadAnswerAutomaton={handleLoadAnswerAutomaton}
                onRestoreAttempt={handleRestoreAttempt}
                hasSavedAttempt={savedAttempt !== null}
                isViewingAnswerAutomaton={isViewingAnswerAutomaton}
            />
        </UiSettingsProvider>
    );
};

describe('ExerciseSolverModal', () => {
    beforeEach(() => {
        automatonEditorMock.mockClear();
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
        expect(screen.getByTestId('exercise-solver-workspace')).toBeInTheDocument();
        expect(screen.getByTestId('exercise-verification-rail')).toBeInTheDocument();
        expect(screen.getByTestId('solver-editor')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Verificar solução' })).toBeInTheDocument();
        expect(screen.getAllByText('Construa um AFD para cadeias terminadas em a.')).toHaveLength(1);

        const lastProps = automatonEditorMock.mock.calls.at(-1)?.[0] as {
            compact?: boolean;
            compactVariant?: string;
        } | undefined;

        expect(lastProps?.compact).toBe(true);
        expect(lastProps?.compactVariant).toBe('workspace');
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
        expect(screen.getByText('Última árvore gerada (falha)')).toBeInTheDocument();
    });

    it('recentraliza o editor ao carregar o gabarito no canvas', async () => {
        render(<SolverAutomatonHarness />);

        fireEvent.click(screen.getByRole('button', { name: 'Gabarito final' }));
        fireEvent.click(await screen.findByRole('button', { name: 'Carregar no canvas' }));

        await waitFor(() => {
            const lastProps = automatonEditorMock.mock.calls.at(-1)?.[0] as {
                data?: AutomatoData;
                fitRequestToken?: number;
            } | undefined;

            expect(lastProps?.data).toMatchObject(answerAutomaton);
            expect(lastProps?.fitRequestToken).toBe(1);
        });
    });

    it('preserva a tentativa atual ao alternar para o gabarito e permite restaurá-la', async () => {
        render(<SolverAutomatonHarness />);

        fireEvent.click(screen.getByRole('button', { name: 'Gabarito final' }));
        fireEvent.click(await screen.findByRole('button', { name: 'Carregar no canvas' }));

        await waitFor(() => {
            const lastProps = automatonEditorMock.mock.calls.at(-1)?.[0] as {
                data?: AutomatoData;
            } | undefined;

            expect(lastProps?.data).toMatchObject(answerAutomaton);
        });

        fireEvent.click(screen.getByRole('button', { name: 'Voltar à tentativa salva' }));

        await waitFor(() => {
            const lastProps = automatonEditorMock.mock.calls.at(-1)?.[0] as {
                data?: AutomatoData;
                fitRequestToken?: number;
            } | undefined;

            expect(lastProps?.data).toMatchObject(studentAttemptAutomaton);
            expect(lastProps?.fitRequestToken).toBe(2);
        });
    });
});
