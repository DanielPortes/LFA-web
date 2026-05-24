import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UiSettingsProvider } from '../../hooks/UiSettingsContext';
import { mockAnimationFrames, mockViewport } from '../../test/browserMocks';
import { ExerciseSolverModal } from './ExerciseSolverModal';
import type { AutomatoData, Exercicio } from '../../types';

vi.mock('../../components/automaton/AutomatonEditor', () => ({
    AutomatonEditor: () => <div data-testid="solver-editor">Editor do exercício</div>,
}));

const viewportMatrix = [
    { label: '390x844', width: 390, height: 844 },
    { label: '768x1024', width: 768, height: 1024 },
    { label: '1280x800', width: 1280, height: 800 },
    { label: '1440x900', width: 1440, height: 900 },
];

const automaton: AutomatoData = {
    tipo: 'AFD',
    estados: [],
    transicoes: [],
};

const exercise: Exercicio = {
    id: 7,
    pergunta: 'Construa um AFD para cadeias terminadas em a.',
    nivel: 'facil',
};

const baseProps = {
    isOpen: true,
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
    onClose: vi.fn(),
    hasTests: true,
    tests: [
        { input: 'a', expected: 'accept' as const },
        { input: '', expected: 'reject' as const },
    ],
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

describe('ExerciseSolverModal layout', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    viewportMatrix.forEach(({ label, width, height }) => {
        it(`mantém stage principal, rail e CTA acessíveis em ${label}`, () => {
            mockAnimationFrames();
            mockViewport({ width, height });

            render(
                <UiSettingsProvider>
                    <ExerciseSolverModal {...baseProps} />
                </UiSettingsProvider>
            );

            expect(screen.getByTestId('exercise-solver-workspace')).toBeInTheDocument();
            expect(screen.getByTestId('exercise-verification-rail')).toBeInTheDocument();
            expect(screen.getByTestId('solver-editor')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Verificar solução' })).toBeInTheDocument();
        });
    });

    it('permite recolher o painel de verificação sem desmontar o stage principal', () => {
        mockAnimationFrames();
        mockViewport({ width: 390, height: 844 });

        render(
            <UiSettingsProvider>
                <ExerciseSolverModal {...baseProps} />
            </UiSettingsProvider>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Ocultar painel de verificação' }));

        expect(screen.queryByTestId('exercise-verification-rail')).not.toBeInTheDocument();
        expect(screen.getByTestId('solver-editor')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Abrir painel de verificação' })).toBeInTheDocument();
    });

    it('reserva uma coluna propria para o painel de verificação em desktop', () => {
        mockAnimationFrames();
        mockViewport({ width: 1440, height: 900 });

        render(
            <UiSettingsProvider>
                <ExerciseSolverModal {...baseProps} />
            </UiSettingsProvider>
        );

        const layout = screen.getByTestId('exercise-solver-layout');
        const rail = screen.getByTestId('exercise-verification-rail');
        const stage = screen.getByTestId('exercise-solver-stage');

        expect(layout).toHaveAttribute('data-verification-panel', 'open');
        expect(Array.from(layout.children)).toEqual([rail, stage]);
        expect(stage).toHaveClass('min-[1180px]:min-w-0');
    });

    it('usa chrome externo compacto sem moldura interna duplicada', () => {
        mockAnimationFrames();
        mockViewport({ width: 1440, height: 900 });

        render(
            <UiSettingsProvider>
                <ExerciseSolverModal {...baseProps} />
            </UiSettingsProvider>
        );

        const chrome = screen.getByTestId('exercise-solver-chrome');
        const workspace = screen.getByTestId('exercise-solver-workspace');
        const dialog = screen.getByRole('dialog');

        expect(dialog).toHaveClass('exercise-solver-dialog');
        expect(dialog).toHaveClass('rounded-[20px]');
        expect(dialog).not.toHaveClass('rounded-[32px]');
        expect(chrome).toHaveClass('p-0');
        expect(chrome).not.toHaveClass('p-3');
        expect(chrome).not.toHaveClass('lg:p-5');
        expect(workspace).toHaveClass('rounded-none');
        expect(workspace).not.toHaveClass('rounded-[28px]');
        expect(workspace).not.toHaveClass('shadow-apple-xl');
    });

    it('mostra uma ação explícita para voltar à aula quando o exercício vem do conteúdo', () => {
        mockAnimationFrames();
        mockViewport({ width: 1280, height: 800 });
        const onReturnToLesson = vi.fn();

        render(
            <UiSettingsProvider>
                <ExerciseSolverModal
                    {...baseProps}
                    returnToLessonLabel="Projeto de AFDs"
                    onReturnToLesson={onReturnToLesson}
                />
            </UiSettingsProvider>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Voltar à aula Projeto de AFDs' }));

        expect(onReturnToLesson).toHaveBeenCalledTimes(1);
    });
});
