import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../../components/ui';
import { UiSettingsProvider } from '../../hooks/UiSettingsContext';
import { mockAnimationFrames, mockResizeObserver, mockViewport } from '../../test/browserMocks';
import type { AutomatoData, Exercicio } from '../../types';
import { ExerciseSolverModal } from './ExerciseSolverModal';

const automaton: AutomatoData = {
    tipo: 'AFD',
    estados: [],
    transicoes: [],
    descricao: 'Exercício de interação'
};

const exercise: Exercicio = {
    id: 1,
    pergunta: 'Construa um AFD para palavras terminadas em a.',
    nivel: 'facil',
    metadata: {
        learningGoal: 'Relacionar memória de estado com sufixo.',
        pattern: 'construction'
    }
};

const baseProps = {
    isOpen: true,
    exercise,
    exerciseId: 1,
    question: exercise.pergunta,
    solverMode: 'automaton' as const,
    onSimulate: vi.fn(),
    userRegex: '',
    onRegexChange: vi.fn(),
    regexError: null,
    userGrammar: '',
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

const InteractionHarness = () => {
    const [currentAutomaton, setCurrentAutomaton] = useState<AutomatoData>(automaton);

    return (
        <UiSettingsProvider>
            <ToastProvider>
                <ExerciseSolverModal
                    {...baseProps}
                    userAutomaton={currentAutomaton}
                    onAutomatonChange={(data) => setCurrentAutomaton(data)}
                />
            </ToastProvider>
        </UiSettingsProvider>
    );
};

describe('ExerciseSolverModal interactions', () => {
    beforeEach(() => {
        mockAnimationFrames();
        mockResizeObserver();
        mockViewport({ width: 1280, height: 800 });

        Object.defineProperty(SVGSVGElement.prototype, 'getScreenCTM', {
            configurable: true,
            value: vi.fn(() => ({
                a: 1,
                d: 1,
                e: 0,
                f: 0,
            })),
        });

        Object.defineProperty(SVGSVGElement.prototype, 'getBoundingClientRect', {
            configurable: true,
            value: vi.fn(() => ({
                x: 0,
                y: 0,
                left: 0,
                top: 0,
                right: 960,
                bottom: 640,
                width: 960,
                height: 640,
                toJSON: () => ({})
            })),
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
    });

    it('permite criar estado por duplo clique e abrir menu de contexto no canvas', async () => {
        render(<InteractionHarness />);

        const svg = document.querySelector('[data-automaton-editor="true"] svg');
        expect(svg).not.toBeNull();

        fireEvent.doubleClick(svg!, { clientX: 240, clientY: 220 });

        await waitFor(() => {
            expect(screen.getByText('q0')).toBeInTheDocument();
        });

        fireEvent.contextMenu(svg!, { clientX: 320, clientY: 260 });

        expect(await screen.findByText('Novo Estado')).toBeInTheDocument();
    });
});
