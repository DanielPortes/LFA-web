import React from 'react';
import {
    CheckCircle2,
    Eye,
    EyeOff,
    Loader2,
    Play,
    Timer,
    Zap,
    XCircle,
} from 'lucide-react';
import type { AutomatoData, Exercicio, TestCase } from '../../types';
import { EPSILON_SYMBOL } from '../../utils/symbols';
import type { SimulationTraceStep } from '../../utils/exerciseSimulation';
import type {
    ExerciseEquivalenceStatus,
    ExerciseFailure,
    ExerciseTestStatus,
    SolverMode,
} from './types';
import { ExerciseSupportPanel } from './ExerciseSupportPanel';

interface ExerciseVerificationPanelProps {
    exercise: Exercicio | null;
    onLoadAnswerAutomaton?: (data: AutomatoData) => void;
    onOpenTheory?: (moduleId: string, lessonId: string) => void;
    solverMode: SolverMode;
    hasTests: boolean;
    tests: TestCase[];
    showExpected: boolean;
    onToggleShowExpected: () => void;
    fastVerify: boolean;
    onToggleFastVerify: () => void;
    testResults: Record<string, ExerciseTestStatus>;
    verifyDisabledReason: string | null;
    isVerifying: boolean;
    onVerify: () => void;
    lastFailure: ExerciseFailure | null;
    equivalenceStatus: ExerciseEquivalenceStatus;
    lastTrace: SimulationTraceStep[] | null;
    formatStateList: (ids: string[]) => string;
    focusMode?: 'feedback' | 'help' | 'answer';
    className?: string;
    ariaHidden?: boolean;
}

export const ExerciseVerificationPanel: React.FC<ExerciseVerificationPanelProps> = ({
    exercise,
    onLoadAnswerAutomaton,
    onOpenTheory,
    solverMode,
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
    formatStateList,
    focusMode,
    className = '',
    ariaHidden = false,
}) => {
    const passedCount = Object.values(testResults).filter((result) => result === 'pass').length;
    const showFeedbackSections = focusMode !== 'help' && focusMode !== 'answer';
    const showSupportSections = focusMode !== 'feedback';
    const supportDefaultOpen = focusMode === 'help'
        ? 'hints'
        : focusMode === 'answer'
            ? 'answer'
            : undefined;
    const isConceptualExercise = solverMode === 'text' && !hasTests;

    const formatStackList = (stacks?: string[][]) => {
        if (!stacks || stacks.length === 0) return 'vazia';
        return stacks
            .map((stack) => stack.length > 0 ? stack.join(' ') : 'vazia')
            .map((label, index) => (
                <React.Fragment key={`${label}-${index}`}>
                    {index > 0 && <span className="mx-1 text-muted">|</span>}
                    <code className="rounded bg-surface-1 px-1.5 py-0.5 font-mono text-primary">{label}</code>
                </React.Fragment>
            ));
    };

    return (
        <aside
            data-testid="exercise-verification-rail"
            aria-label="Painel de verificação do exercício"
            aria-hidden={ariaHidden || undefined}
            className={`flex min-h-[32vh] max-h-[40vh] w-full min-w-0 flex-col overflow-hidden border-t border-default/80 bg-surface-1/95 backdrop-blur-2xl min-[1180px]:min-h-0 min-[1180px]:max-h-none min-[1180px]:w-[420px] min-[1180px]:border-r min-[1180px]:border-t-0 ${className}`}
        >
            <div className="border-b border-default/70 px-4 py-3">
                <div className="flex items-start justify-end gap-3">
                    {!hasTests && (
                        <p className="mr-auto text-xs leading-relaxed text-secondary">
                            Este exercício é conceitual. Compare sua solução com o gabarito ao terminar.
                        </p>
                    )}

                    {hasTests && (
                        <span
                            aria-label={`${passedCount} de ${tests.length} testes aprovados`}
                            className="surface-chip inline-flex min-w-[4.25rem] flex-shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-default px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-secondary dark:bg-black/10"
                        >
                            {passedCount}/{tests.length} OK
                        </span>
                    )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                    {hasTests && (
                        <button
                            type="button"
                            onClick={onToggleShowExpected}
                            aria-label={showExpected ? 'Ocultar resultados esperados' : 'Mostrar resultados esperados'}
                            title={showExpected ? 'Ocultar esperado' : 'Mostrar esperado'}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-default text-secondary transition-colors hover:text-primary"
                        >
                            {showExpected ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onToggleFastVerify}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                            fastVerify
                                ? 'border-ios-green/25 bg-ios-green/10 text-ios-green'
                                : 'border-default text-secondary hover:text-primary'
                        }`}
                        aria-label={fastVerify ? 'Usar modo animado' : 'Usar modo rápido'}
                        title={fastVerify ? 'Modo rápido' : 'Modo animado'}
                    >
                        {fastVerify ? <Zap size={15} /> : <Timer size={15} />}
                    </button>
                </div>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-surface-1/80 p-4 custom-scrollbar">
                {showFeedbackSections && lastFailure && (
                    <section className="motion-panel-enter sticky top-0 z-10 rounded-[22px] border border-ios-red/25 bg-ios-red/12 p-4 shadow-apple-sm backdrop-blur">
                        <div className="flex items-center justify-between gap-3">
                            <div className="ui-kicker text-ios-red">Primeiro erro</div>
                            <span className="rounded-full border border-ios-red/25 bg-surface-1/70 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-ios-red">
                                revise primeiro
                            </span>
                        </div>
                        <div className="mt-3 grid gap-2 text-xs leading-relaxed text-ios-red/85">
                            <div>
                                Entrada: <code className="rounded bg-ios-red/10 px-1 font-mono">{lastFailure.input || EPSILON_SYMBOL}</code>
                            </div>
                            <div>Esperado: {lastFailure.expected}</div>
                            <div>Obtido: {lastFailure.received}</div>
                            {lastFailure.reason && <div>Motivo: {lastFailure.reason}</div>}
                        </div>
                        <p className="mt-3 rounded-xl border border-ios-red/15 bg-surface-1/65 px-3 py-2 text-xs leading-relaxed text-primary">
                            Ação recomendada: ajuste a transição ou estado responsável por essa entrada, abra uma pista em Ajuda e verifique novamente.
                        </p>
                    </section>
                )}

                {showFeedbackSections && equivalenceStatus && (
                    <section className={`motion-panel-enter rounded-[22px] border p-4 ${equivalenceStatus === 'pass' ? 'border-ios-green/20 bg-ios-green/10' : 'border-ios-red/20 bg-ios-red/10'}`}>
                        <div className={`ui-kicker ${equivalenceStatus === 'pass' ? 'text-ios-green' : 'text-ios-red'}`}>
                            Equivalência DFA
                        </div>
                        <div className={`mt-2 text-xs leading-relaxed ${equivalenceStatus === 'pass' ? 'text-ios-green/80' : 'text-ios-red/80'}`}>
                            {equivalenceStatus === 'pass'
                                ? 'Autômato equivalente ao gabarito.'
                                : 'Autômato diferente do gabarito. Compare estados finais, cobertura de transições e casos de borda.'}
                        </div>
                    </section>
                )}

                {showFeedbackSections && lastTrace && lastTrace.length > 0 && (
                    <section className="motion-panel-enter rounded-[22px] border border-default/70 bg-surface-2/75 p-4">
                        <div className="ui-kicker text-secondary">Traço de execução</div>
                        <div className="mt-3 max-h-40 space-y-2 overflow-y-auto custom-scrollbar">
                            {lastTrace.map((step, index) => (
                                <div key={`${index}-${step.symbol}`} className="rounded-[16px] border border-default/60 bg-surface-1/60 px-3 py-2 text-xs text-secondary">
                                    <span className="font-bold">Passo {index + 1}</span> · símbolo <code className="font-mono">{step.symbol}</code>
                                    <div className="mt-1">De: {formatStateList(step.fromStates)}</div>
                                    {step.directTargets.length > 0 && (
                                        <div>Alvo direto: {formatStateList(step.directTargets)}</div>
                                    )}
                                    <div>Para: {formatStateList(step.toStates)}</div>
                                    {(step.fromStacks || step.toStacks) && (
                                        <div className="mt-2 rounded-xl border border-default/50 bg-surface-2/70 px-2.5 py-2">
                                            <div className="font-bold text-primary">Pilha</div>
                                            <div>Antes: {formatStackList(step.fromStacks)}</div>
                                            <div>Depois: {formatStackList(step.toStacks)}</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {showFeedbackSections && (
                    <section className="rounded-[22px] border border-default/70 bg-surface-2/75 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="ui-kicker text-secondary">Entradas</div>
                            <p className="mt-1 text-sm font-semibold text-primary">
                                {hasTests ? `${tests.length} caso(s) preparados` : 'Exercício conceitual'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4">
                        {isVerifying && (
                            <div className="motion-shimmer mb-3 h-1.5 rounded-full bg-surface-muted" aria-label="Analisando testes" aria-busy="true" />
                        )}
                        {hasTests ? (
                            <div className="max-h-[15rem] space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                                {tests.map((testCase, index) => (
                                    <div
                                        key={index}
                                        className={`motion-panel-enter flex items-center gap-3 rounded-[18px] border px-3 py-3 transition-all ${
                                            testResults[`${index}`] === 'pass'
                                                ? 'border-ios-green/25 bg-ios-green/10'
                                                : testResults[`${index}`] === 'fail'
                                                    ? 'border-ios-red/25 bg-ios-red/10'
                                                    : 'border-default/70 bg-surface-1/70'
                                        }`}
                                    >
                                        <div className="flex h-6 w-6 items-center justify-center">
                                            {testResults[`${index}`] === 'running' ? (
                                                <Loader2 size={16} className="animate-spin text-ios-blue" />
                                            ) : testResults[`${index}`] === 'pass' ? (
                                                <CheckCircle2 size={16} strokeWidth={3} className="text-ios-green" />
                                            ) : testResults[`${index}`] === 'fail' ? (
                                                <XCircle size={16} className="text-ios-red" />
                                            ) : (
                                                <div className="h-2 w-2 rounded-full bg-text-secondary-30" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <code className="block truncate text-sm font-mono text-primary">
                                                "{testCase.input || EPSILON_SYMBOL}"
                                            </code>
                                        </div>
                                        <span className={`rounded-xl border px-2 py-1 text-xs font-bold ${
                                            showExpected
                                                ? (testCase.expected === 'accept'
                                                    ? 'border-ios-green/20 bg-ios-green/15 text-ios-green'
                                                    : 'border-ios-red/20 bg-ios-red/15 text-ios-red')
                                                : 'border-default bg-surface-2 text-secondary'
                                        }`}>
                                            {showExpected ? (testCase.expected === 'accept' ? 'Aceita' : 'Rejeita') : 'Oculto'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-[18px] border border-dashed border-default bg-surface-1/60 p-4 text-sm text-secondary">
                                Este exercício é conceitual. Compare sua solução com o gabarito quando terminar.
                            </div>
                        )}
                    </div>
                    </section>
                )}

                {showSupportSections && (
                    <ExerciseSupportPanel
                        exercise={exercise}
                        onLoadAnswerAutomaton={solverMode === 'automaton'
                            ? onLoadAnswerAutomaton
                            : undefined}
                        onOpenTheory={onOpenTheory}
                        lastFailure={lastFailure}
                        equivalenceStatus={equivalenceStatus}
                        defaultOpen={supportDefaultOpen}
                    />
                )}
            </div>

            <div className="border-t border-default/70 bg-surface-1/95 p-4">
                {isConceptualExercise ? (
                    <div className="rounded-xl border border-status-info/25 bg-status-info-soft px-3 py-2 text-xs leading-relaxed text-status-info">
                        <p className="font-bold">Compare com roteiro, critérios e gabarito.</p>
                        <p className="mt-1">{verifyDisabledReason ?? 'Este exercício não possui validação automática.'}</p>
                    </div>
                ) : (
                    <>
                        {verifyDisabledReason ? (
                            <p className="mb-3 rounded-xl border border-status-warning bg-status-warning-soft px-3 py-2 text-xs text-status-warning">
                                {verifyDisabledReason}
                            </p>
                        ) : (
                            <p className="mb-3 text-xs text-secondary">
                                Atalho: <span className="font-mono">Ctrl + Enter</span> para verificar.
                            </p>
                        )}
                        <button
                            onClick={onVerify}
                            disabled={isVerifying || !!verifyDisabledReason}
                            className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-ios-blue py-3 text-sm font-bold text-white shadow-lg shadow-ios-blue/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isVerifying ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    <Play size={18} fill="currentColor" />
                                    Verificar solução
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>
        </aside>
    );
};
