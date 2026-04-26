import React from 'react';
import {
    CheckCircle2,
    Loader2,
    Play,
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
}) => {
    const passedCount = Object.values(testResults).filter((result) => result === 'pass').length;
    const failedCount = Object.values(testResults).filter((result) => result === 'fail').length;
    const hasAnyTestResult = Object.keys(testResults).length > 0;
    const verificationSummary = hasTests
        ? hasAnyTestResult
            ? failedCount > 0
                ? `${failedCount} falha(s) na última rodada.`
                : `${passedCount} teste(s) aprovados na última rodada.`
            : 'Pronto para validar sua solução.'
        : 'Sem verificação automática.';

    return (
        <aside
            data-testid="exercise-verification-rail"
            aria-label="Painel de verificação do exercício"
            className="flex min-h-[32vh] max-h-[40vh] w-full min-w-0 flex-col overflow-hidden border-t border-default/80 bg-surface-1/95 backdrop-blur-2xl min-[1180px]:min-h-0 min-[1180px]:max-h-none min-[1180px]:w-[360px] min-[1180px]:border-l min-[1180px]:border-t-0"
        >
            <div className="border-b border-default/70 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="ui-kicker-xs text-secondary">Verificação da solução</div>
                        <h4 className="mt-1 text-sm font-bold text-primary">Bateria de testes</h4>
                        <p className="mt-1 text-xs leading-relaxed text-secondary">
                            {hasTests
                                ? `${tests.length} entrada(s) configurada(s). ${verificationSummary}`
                                : 'Este exercício é conceitual. Compare sua solução com o gabarito ao terminar.'}
                        </p>
                    </div>

                    {hasTests && (
                        <span className="surface-chip rounded-full border border-default px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-secondary dark:bg-black/10">
                            {passedCount}/{tests.length} OK
                        </span>
                    )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    {hasTests && (
                        <button
                            type="button"
                            onClick={onToggleShowExpected}
                            className="rounded-full border border-default px-3 py-1.5 text-xs font-bold text-secondary transition-colors hover:text-primary"
                        >
                            {showExpected ? 'Ocultar esperado' : 'Mostrar esperado'}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onToggleFastVerify}
                        className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                            fastVerify
                                ? 'border-ios-green/25 bg-ios-green/10 text-ios-green'
                                : 'border-default text-secondary hover:text-primary'
                        }`}
                        title={fastVerify ? 'Execução rápida' : 'Execução com animação'}
                    >
                        {fastVerify ? 'Modo rápido' : 'Modo animado'}
                    </button>
                    <span className="rounded-full border border-default bg-surface-2/75 px-3 py-1.5 text-xs text-secondary">
                        {solverMode === 'automaton'
                            ? 'Canvas interativo'
                            : solverMode === 'regex'
                                ? 'Editor de regex'
                                : solverMode === 'grammar'
                                    ? 'Editor de gramática'
                                    : 'Resposta em texto'}
                    </span>
                </div>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-surface-1/80 p-4 custom-scrollbar">
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
                        {hasTests ? (
                            <div className="max-h-[15rem] space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                                {tests.map((testCase, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-3 rounded-[18px] border px-3 py-3 transition-all ${
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

                {lastFailure && (
                    <section className="rounded-[22px] border border-ios-red/20 bg-ios-red/10 p-4">
                        <div className="ui-kicker text-ios-red">Primeiro erro</div>
                        <div className="mt-2 text-xs leading-relaxed text-ios-red/80">
                            Entrada: <code className="rounded bg-ios-red/10 px-1 font-mono">{lastFailure.input}</code> · Esperado: {lastFailure.expected} · Obtido: {lastFailure.received}
                        </div>
                        {lastFailure.reason && (
                            <div className="mt-2 text-xs leading-relaxed text-ios-red/70">{lastFailure.reason}</div>
                        )}
                    </section>
                )}

                {equivalenceStatus && (
                    <section className={`rounded-[22px] border p-4 ${equivalenceStatus === 'pass' ? 'border-ios-green/20 bg-ios-green/10' : 'border-ios-red/20 bg-ios-red/10'}`}>
                        <div className={`ui-kicker ${equivalenceStatus === 'pass' ? 'text-ios-green' : 'text-ios-red'}`}>
                            Equivalência DFA
                        </div>
                        <div className={`mt-2 text-xs leading-relaxed ${equivalenceStatus === 'pass' ? 'text-ios-green/80' : 'text-ios-red/80'}`}>
                            {equivalenceStatus === 'pass'
                                ? 'Autômato equivalente ao gabarito.'
                                : 'Autômato diferente do gabarito.'}
                        </div>
                    </section>
                )}

                {lastTrace && lastTrace.length > 0 && (
                    <section className="rounded-[22px] border border-default/70 bg-surface-2/75 p-4">
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
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <ExerciseSupportPanel
                    exercise={exercise}
                    onLoadAnswerAutomaton={solverMode === 'automaton'
                        ? onLoadAnswerAutomaton
                        : undefined}
                    onOpenTheory={onOpenTheory}
                    lastFailure={lastFailure}
                    equivalenceStatus={equivalenceStatus}
                />
            </div>

            <div className="border-t border-default/70 bg-surface-1/95 p-4">
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
            </div>
        </aside>
    );
};
