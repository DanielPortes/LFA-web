import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
    ArrowRightLeft,
    Brain,
    FileText,
    Pencil,
    Play,
    RotateCcw,
    Trophy,
    Undo2,
    X,
    XCircle,
    Braces
} from 'lucide-react';
import { AutomatonEditor } from '../../components/automaton/AutomatonEditor';
import { DerivationTreeVisualizer, Modal } from '../../components/ui';
import type { AutomatoData, Exercicio, GrammarTree, TestCase } from '../../types';
import type { SimulationTraceStep } from '../../utils/exerciseSimulation';
import type { SolverMode } from './types';
import { ExerciseVerificationPanel } from './ExerciseVerificationPanel';

interface ExerciseSolverModalProps {
    isOpen: boolean;
    exercise: Exercicio | null;
    exerciseId: number | null;
    question: string | null;
    onOpenTheory?: (moduleId: string, lessonId: string) => void;
    solverMode: SolverMode;
    userAutomaton: AutomatoData | null;
    onAutomatonChange: (data: AutomatoData) => void;
    onLoadAnswerAutomaton?: (data: AutomatoData) => void;
    onRestoreAttempt?: () => void;
    hasSavedAttempt?: boolean;
    isViewingAnswerAutomaton?: boolean;
    editorSessionKey?: number;
    onSimulate: (data: AutomatoData) => void;
    userRegex: string;
    onRegexChange: (value: string) => void;
    regexError: string | null;
    userGrammar: string;
    onGrammarChange: (value: string) => void;
    grammarError: string | null;
    grammarWarnings: string[];
    grammarTree: GrammarTree | null;
    userText: string;
    onTextChange: (value: string) => void;
    answeredLabel: boolean;
    onMarkCompleted: () => void;
    onOpenConverter: () => void;
    onResetAutomaton: () => void;
    onClose: () => void;
    hasTests: boolean;
    tests: TestCase[];
    showExpected: boolean;
    onToggleShowExpected: () => void;
    fastVerify: boolean;
    onToggleFastVerify: () => void;
    testResults: Record<string, 'pass' | 'fail' | 'running'>;
    verifyDisabledReason: string | null;
    isVerifying: boolean;
    onVerify: () => void;
    lastFailure: { input: string; expected: string; received: string; reason?: string } | null;
    equivalenceStatus: 'pass' | 'fail' | null;
    lastTrace: SimulationTraceStep[] | null;
    formatStateList: (ids: string[]) => string;
}

const solverModeLabel: Record<SolverMode, string> = {
    automaton: 'Autômato',
    regex: 'Expressão regular',
    grammar: 'Gramática',
    text: 'Resposta aberta'
};

const exerciseLevelLabel = {
    facil: 'Fácil',
    medio: 'Médio',
    dificil: 'Desafio'
} as const;

const floatingActionClassName = 'rounded-[18px] p-2.5 text-secondary transition-colors hover:bg-surface-hover hover:text-primary';
const stageFieldClassName = 'w-full rounded-[24px] border border-default bg-surface-1/92 px-4 py-3 text-primary shadow-inner outline-none ring-ios-blue/40 focus:ring-2';

export const ExerciseSolverModal: React.FC<ExerciseSolverModalProps> = ({
    isOpen,
    exercise,
    exerciseId,
    question,
    onOpenTheory,
    solverMode,
    userAutomaton,
    onAutomatonChange,
    onLoadAnswerAutomaton,
    onRestoreAttempt,
    hasSavedAttempt = false,
    isViewingAnswerAutomaton = false,
    editorSessionKey = 0,
    onSimulate,
    userRegex,
    onRegexChange,
    regexError,
    userGrammar,
    onGrammarChange,
    grammarError,
    grammarWarnings,
    grammarTree,
    userText,
    onTextChange,
    answeredLabel,
    onMarkCompleted,
    onOpenConverter,
    onResetAutomaton,
    onClose,
    hasTests,
    tests,
    showExpected,
    onToggleShowExpected,
    fastVerify,
    onToggleFastVerify,
    testResults,
    verifyDisabledReason,
    isVerifying,
    onVerify,
    lastFailure,
    equivalenceStatus,
    lastTrace,
    formatStateList
}) => {
    const titleId = useId();
    const descriptionId = useId();
    const regexErrorId = useId();
    const grammarErrorId = useId();
    const [fitRequestToken, setFitRequestToken] = useState<number | undefined>(undefined);
    const pendingAnswerFitRef = useRef(false);
    const titleText = `Exercício ${exerciseId}`;
    const isAutomatonMode = solverMode === 'automaton';
    const stageMetrics = solverMode === 'automaton' && userAutomaton
        ? `${userAutomaton.estados.length} estados • ${userAutomaton.transicoes.length} transições`
        : solverMode === 'regex'
            ? 'Expressão em edição'
            : solverMode === 'grammar'
                ? 'Gramática em edição'
                : 'Resposta em elaboração';
    const statusChromeClassName = isAutomatonMode
        ? 'pointer-events-none absolute left-4 top-4 z-30 flex max-w-[calc(100%-6.5rem)] flex-col gap-2 sm:max-w-[calc(100%-7rem)] min-[1180px]:max-w-[460px]'
        : 'pointer-events-none absolute left-4 top-4 z-30 flex max-w-[calc(100%-7rem)] flex-col gap-2 sm:max-w-[calc(100%-7.5rem)] min-[1180px]:max-w-[420px]';
    const actionChromeClassName = isAutomatonMode
        ? 'pointer-events-none absolute right-4 top-[4.75rem] z-30 sm:top-20'
        : 'pointer-events-none absolute right-4 top-4 z-30';

    const handleLoadAnswerAutomaton = useCallback((data: AutomatoData) => {
        if (!onLoadAnswerAutomaton) return;
        pendingAnswerFitRef.current = true;
        onLoadAnswerAutomaton(data);
    }, [onLoadAnswerAutomaton]);

    const handleRestoreAttempt = useCallback(() => {
        if (!onRestoreAttempt || !hasSavedAttempt) return;
        pendingAnswerFitRef.current = true;
        onRestoreAttempt();
    }, [hasSavedAttempt, onRestoreAttempt]);

    useEffect(() => {
        if (!pendingAnswerFitRef.current || !isAutomatonMode || !userAutomaton) {
            return;
        }

        pendingAnswerFitRef.current = false;
        setFitRequestToken((current) => (current ?? 0) + 1);
    }, [isAutomatonMode, userAutomaton]);

    if (!exerciseId || !question) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            labelledById={titleId}
            describedById={descriptionId}
            hideHeader={true}
            bodyClassName="overflow-hidden p-0"
            overlayClassName="p-2 sm:p-4 lg:p-6"
            className="h-[min(92dvh,1024px)] min-h-[88dvh] w-[min(96vw,1440px)] max-w-none overflow-hidden rounded-[32px]"
        >
            <div className="flex h-full min-h-0 flex-col bg-app/30 p-3 sm:p-4 lg:p-5">
                <div
                    data-testid="exercise-solver-workspace"
                    className="relative h-full min-h-0 overflow-hidden rounded-[28px] border border-default bg-canvas shadow-apple-xl"
                >
                    <div className="sr-only">
                        <h3 id={titleId}>{titleText}</h3>
                        <p id={descriptionId}>{question}</p>
                    </div>

                    <div data-testid="exercise-solver-status-chrome" className={statusChromeClassName}>
                        <div className="pointer-events-auto glass-panel flex items-center gap-2 rounded-2xl border border-default bg-surface-1/95 px-3 py-2 shadow-apple-md">
                            <div className="rounded-xl bg-ios-green/10 p-2 text-ios-green">
                                <Pencil size={16} />
                            </div>
                            <span className="badge border-status-info bg-status-info-soft text-status-info">
                                {titleText}
                            </span>
                            <span className="badge border-default bg-surface-muted text-secondary">
                                {solverModeLabel[solverMode]}
                            </span>
                            <span className="badge border-default bg-surface-muted text-secondary">
                                {exercise ? exerciseLevelLabel[exercise.nivel] : 'Exercício'}
                            </span>
                            <span className="hidden text-[11px] font-bold text-secondary sm:inline">
                                {stageMetrics}
                            </span>
                        </div>
                    </div>

                    <div data-testid="exercise-solver-action-chrome" className={actionChromeClassName}>
                        <div className="pointer-events-auto glass-panel flex items-center gap-1 rounded-[24px] border-default/80 bg-surface-1/92 p-2 shadow-apple-xl">
                            <button
                                onClick={onOpenConverter}
                                className={floatingActionClassName}
                                title="Conversor de modelos"
                                aria-label="Abrir conversor de modelos"
                            >
                                <ArrowRightLeft size={18} />
                            </button>
                            {solverMode === 'automaton' && userAutomaton && userAutomaton.estados.length > 0 && (
                                <button
                                    onClick={() => onSimulate(userAutomaton)}
                                    className={`${floatingActionClassName} text-ios-blue hover:text-ios-blue`}
                                    title="Abrir no simulador"
                                    aria-label="Abrir autômato atual no simulador"
                                >
                                    <Play size={18} />
                                </button>
                            )}
                            {solverMode === 'automaton' && isViewingAnswerAutomaton && hasSavedAttempt && (
                                <button
                                    onClick={handleRestoreAttempt}
                                    className={floatingActionClassName}
                                    title="Voltar à tentativa"
                                    aria-label="Voltar à tentativa salva"
                                >
                                    <Undo2 size={18} />
                                </button>
                            )}
                            {solverMode === 'automaton' && (
                                <button
                                    onClick={onResetAutomaton}
                                    className={floatingActionClassName}
                                    title="Resetar"
                                    aria-label="Resetar autômato"
                                >
                                    <RotateCcw size={18} />
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className={`${floatingActionClassName} text-status-danger hover:text-status-danger`}
                                title="Fechar"
                                aria-label="Fechar exercício"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr),auto] min-[1180px]:grid-cols-[minmax(0,1fr),360px] min-[1180px]:grid-rows-1">
                        <section
                            role="region"
                            aria-label="Área de resolução do exercício"
                            className="relative min-h-[52vh] min-w-0 overflow-hidden min-[1180px]:min-h-0"
                        >
                            {solverMode === 'automaton' && userAutomaton && (
                                <div className="absolute inset-0 min-h-0">
                                    <AutomatonEditor
                                        key={`exercise-editor-${exerciseId}-${editorSessionKey}`}
                                        data={userAutomaton}
                                        onChange={onAutomatonChange}
                                        readOnly={false}
                                        compact={true}
                                        compactVariant="solver"
                                        fitRequestToken={fitRequestToken}
                                        sessionKey={editorSessionKey}
                                    />
                                </div>
                            )}

                            {solverMode === 'regex' && (
                                <div className="h-full overflow-y-auto px-4 pb-6 pt-28 custom-scrollbar sm:px-6 sm:pt-32 lg:px-8 lg:pb-8">
                                    <div className="mx-auto flex max-w-3xl flex-col gap-4">
                                        <div className="rounded-[24px] border border-default bg-surface-1/92 p-5 shadow-apple-sm">
                                            <div className="flex items-center gap-2 ui-kicker text-secondary">
                                                <Braces size={14} />
                                                Expressão regular
                                            </div>
                                            <input
                                                type="text"
                                                value={userRegex}
                                                onChange={(e) => onRegexChange(e.target.value)}
                                                placeholder="Ex: (a+b)*abb"
                                                aria-invalid={!!regexError}
                                                aria-describedby={regexError ? regexErrorId : undefined}
                                                className={`${stageFieldClassName} mt-4 text-lg font-mono`}
                                            />
                                            {regexError && (
                                                <p id={regexErrorId} role="status" className="mt-3 flex items-center gap-2 text-sm text-status-danger">
                                                    <XCircle size={14} /> {regexError}
                                                </p>
                                            )}
                                        </div>

                                        <div className="rounded-[24px] border border-default bg-surface-1/85 p-5">
                                            <div className="flex items-center gap-2 ui-kicker text-secondary">
                                                <Brain size={14} />
                                                Sintaxe aceita
                                            </div>
                                            <p className="mt-3 text-sm leading-relaxed text-secondary">
                                                Use <code className="font-mono">+</code> para união, <code className="font-mono">*</code> para fecho,
                                                <code className="font-mono">?</code> para opcional e <code className="font-mono">eps</code> para vazio.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {solverMode === 'grammar' && (
                                <div className="h-full overflow-y-auto px-4 pb-6 pt-28 custom-scrollbar sm:px-6 sm:pt-32 lg:px-8 lg:pb-8">
                                    <div className="mx-auto flex max-w-4xl flex-col gap-4">
                                        <div className="rounded-[24px] border border-default bg-surface-1/92 p-5 shadow-apple-sm">
                                            <div className="flex items-center gap-2 ui-kicker text-secondary">
                                                <FileText size={14} />
                                                Gramática
                                            </div>
                                            <textarea
                                                value={userGrammar}
                                                onChange={(e) => onGrammarChange(e.target.value)}
                                                placeholder="S -> a S b | eps"
                                                aria-invalid={!!grammarError}
                                                aria-describedby={grammarError ? grammarErrorId : undefined}
                                                className={`${stageFieldClassName} mt-4 h-[240px] font-mono text-sm md:h-[280px] min-[1180px]:h-[320px]`}
                                            />
                                            {grammarError && (
                                                <p id={grammarErrorId} role="status" className="mt-3 flex items-center gap-2 text-sm text-status-danger">
                                                    <XCircle size={14} /> {grammarError}
                                                </p>
                                            )}
                                            {grammarWarnings.length > 0 && (
                                                <div className="mt-3 rounded-[18px] border border-status-warning/25 bg-status-warning-soft/50 px-4 py-3 text-xs text-status-warning">
                                                    {grammarWarnings.map((warn, idx) => (
                                                        <div key={`${warn}-${idx}`}>- {warn}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="rounded-[24px] border border-default bg-surface-1/85 p-5">
                                            <div className="flex items-center gap-2 ui-kicker text-secondary">
                                                <Brain size={14} />
                                                Formato esperado
                                            </div>
                                            <p className="mt-3 text-sm leading-relaxed text-secondary">
                                                Use <code className="font-mono">S -&gt; a S b | eps</code>. Separe símbolos multi-caractere com espaços.
                                            </p>
                                        </div>

                                        {grammarTree && (
                                            <div className="rounded-[24px] border border-default bg-surface-1/92 p-5 shadow-apple-sm">
                                                <div className="mb-4 ui-kicker text-secondary">
                                                    Última árvore gerada (falha)
                                                </div>
                                                <div className="h-[240px] overflow-hidden rounded-[22px] border border-default bg-surface-muted md:h-[280px]">
                                                    <DerivationTreeVisualizer tree={grammarTree} autoPlay={true} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {solverMode === 'text' && (
                                <div className="h-full overflow-y-auto px-4 pb-6 pt-28 custom-scrollbar sm:px-6 sm:pt-32 lg:px-8 lg:pb-8">
                                    <div className="mx-auto flex max-w-3xl flex-col gap-4">
                                        <div className="rounded-[24px] border border-default bg-surface-1/92 p-5 shadow-apple-sm">
                                            <div className="flex items-center gap-2 ui-kicker text-secondary">
                                                <FileText size={14} />
                                                Resposta aberta
                                            </div>
                                            <textarea
                                                value={userText}
                                                onChange={(e) => onTextChange(e.target.value)}
                                                placeholder="Escreva sua solução aqui..."
                                                className={`${stageFieldClassName} mt-4 min-h-[240px] text-sm`}
                                            />
                                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                                <button
                                                    onClick={onMarkCompleted}
                                                    className="rounded-[18px] bg-ios-green px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-green-600"
                                                >
                                                    Marcar como concluído
                                                </button>
                                                {answeredLabel && (
                                                    <span className="flex items-center gap-2 text-xs font-bold text-ios-green">
                                                        <Trophy size={14} /> Concluído
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        <ExerciseVerificationPanel
                            exercise={exercise}
                            onLoadAnswerAutomaton={solverMode === 'automaton'
                                ? handleLoadAnswerAutomaton
                                : undefined}
                            onOpenTheory={onOpenTheory}
                            solverMode={solverMode}
                            hasTests={hasTests}
                            tests={tests}
                            showExpected={showExpected}
                            onToggleShowExpected={onToggleShowExpected}
                            fastVerify={fastVerify}
                            onToggleFastVerify={onToggleFastVerify}
                            testResults={testResults}
                            verifyDisabledReason={verifyDisabledReason}
                            isVerifying={isVerifying}
                            onVerify={onVerify}
                            lastFailure={lastFailure}
                            equivalenceStatus={equivalenceStatus}
                            lastTrace={lastTrace}
                            formatStateList={formatStateList}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
};
