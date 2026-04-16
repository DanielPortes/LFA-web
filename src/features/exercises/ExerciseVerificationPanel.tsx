import React from 'react';
import {
    CheckCircle2,
    Loader2,
    Play,
    Trophy,
    XCircle,
} from 'lucide-react';
import type { AutomatoData, Exercicio, TestCase } from '../../types';
import { EPSILON_SYMBOL } from '../../utils/symbols';
import type { SimulationTraceStep } from '../../utils/exerciseSimulation';
import type {
    ExerciseEquivalenceStatus,
    ExerciseFailure,
    ExerciseTestStatus,
} from './types';
import { ExerciseSupportPanel } from './ExerciseSupportPanel';

interface ExerciseVerificationPanelProps {
    exercise: Exercicio | null;
    onSimulateAnswer?: (data: AutomatoData) => void;
    onOpenTheory?: (moduleId: string, lessonId: string) => void;
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
    onSimulateAnswer,
    onOpenTheory,
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
}) => (
    <div className="flex min-h-[32vh] max-h-[40vh] w-full flex-col border-t border-default bg-surface-1 backdrop-blur-xl xl:min-h-0 xl:max-h-none xl:w-[360px] xl:border-l xl:border-t-0">
        <div className="border-b border-default p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h4 className="mb-1 text-sm font-bold text-primary">Casos de teste</h4>
                    <p className="text-xs text-secondary">
                        {hasTests ? 'Seu resultado será verificado com estas entradas' : 'Sem verificação automática'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {hasTests && (
                        <button
                            onClick={onToggleShowExpected}
                            className="text-xs font-bold text-ios-blue transition-colors hover:opacity-80"
                        >
                            {showExpected ? 'Ocultar' : 'Mostrar'} esperado
                        </button>
                    )}
                    <button
                        onClick={onToggleFastVerify}
                        className={`text-xs font-bold transition-colors ${fastVerify ? 'text-ios-green' : 'text-secondary hover:text-ios-blue'}`}
                        title={fastVerify ? 'Execução rápida' : 'Execução com animação'}
                    >
                        {fastVerify ? 'Rápido' : 'Normal'}
                    </button>
                </div>
            </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-surface-1 p-4 custom-scrollbar">
            <ExerciseSupportPanel
                exercise={exercise}
                onSimulateAnswer={onSimulateAnswer}
                onOpenTheory={onOpenTheory}
            />

            <section className="space-y-3">
                {hasTests ? tests.map((testCase, index) => (
                    <div
                        key={index}
                        className={`flex items-center gap-3 rounded-2xl border p-3 transition-all
                            ${testResults[`${index}`] === 'pass'
                                ? 'border-ios-green/30 bg-ios-green/10'
                                : testResults[`${index}`] === 'fail'
                                    ? 'border-ios-red/30 bg-ios-red/10'
                                    : 'border-default bg-surface-2'
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
                                ? (testCase.expected === 'accept' ? 'border-ios-green/20 bg-ios-green/15 text-ios-green' : 'border-ios-red/20 bg-ios-red/15 text-ios-red')
                                : 'border-default bg-surface-2 text-secondary'
                        }`}>
                            {showExpected ? (testCase.expected === 'accept' ? 'Aceita' : 'Rejeita') : 'Oculto'}
                        </span>
                    </div>
                )) : (
                    <div className="rounded-2xl border border-dashed border-default p-4 text-sm text-secondary">
                        Este exercício é conceitual. Compare sua solução com o gabarito quando terminar.
                    </div>
                )}
            </section>

            {lastFailure && (
                <div className="rounded-2xl border border-ios-red/20 bg-ios-red/10 p-4">
                    <div className="mb-2 ui-kicker text-ios-red">Primeiro erro</div>
                    <div className="text-xs text-ios-red/80">
                        Entrada: <code className="rounded bg-ios-red/10 px-1 font-mono">{lastFailure.input}</code> · Esperado: {lastFailure.expected} · Obtido: {lastFailure.received}
                    </div>
                    {lastFailure.reason && (
                        <div className="mt-2 text-xs text-ios-red/70">{lastFailure.reason}</div>
                    )}
                </div>
            )}

            {equivalenceStatus && (
                <div className={`rounded-2xl border p-4 ${equivalenceStatus === 'pass' ? 'border-ios-green/20 bg-ios-green/10' : 'border-ios-red/20 bg-ios-red/10'}`}>
                    <div className={`mb-2 ui-kicker ${equivalenceStatus === 'pass' ? 'text-ios-green' : 'text-ios-red'}`}>
                        Equivalência DFA
                    </div>
                    <div className={`text-xs ${equivalenceStatus === 'pass' ? 'text-ios-green/80' : 'text-ios-red/80'}`}>
                        {equivalenceStatus === 'pass'
                            ? 'Autômato equivalente ao gabarito.'
                            : 'Autômato diferente do gabarito.'}
                    </div>
                </div>
            )}

            {lastTrace && lastTrace.length > 0 && (
                <div className="rounded-2xl border border-default bg-surface-2 p-4">
                    <div className="mb-2 ui-kicker text-secondary">Traço de execução</div>
                    <div className="max-h-40 space-y-2 overflow-y-auto custom-scrollbar">
                        {lastTrace.map((step, index) => (
                            <div key={`${index}-${step.symbol}`} className="text-xs text-secondary">
                                <span className="font-bold">Passo {index + 1}</span> — símbolo <code className="font-mono">{step.symbol}</code>
                                <div>De: {formatStateList(step.fromStates)}</div>
                                {step.directTargets.length > 0 && (
                                    <div>Alvo direto: {formatStateList(step.directTargets)}</div>
                                )}
                                <div>Para: {formatStateList(step.toStates)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {Object.keys(testResults).length > 0 && (
                <div className="rounded-2xl border border-default bg-surface-2 p-4">
                    {Object.values(testResults).every((result) => result === 'pass') && equivalenceStatus !== 'fail' ? (
                        <div className="flex items-center gap-3 text-ios-green">
                            <Trophy size={24} />
                            <div>
                                <p className="font-bold">Parabéns!</p>
                                <p className="text-xs opacity-80">Todos os testes passaram</p>
                            </div>
                        </div>
                    ) : Object.values(testResults).some((result) => result === 'fail') || equivalenceStatus === 'fail' ? (
                        <div className="flex items-center gap-3 text-ios-red">
                            <XCircle size={24} />
                            <div>
                                <p className="font-bold">Tente novamente</p>
                                <p className="text-xs opacity-80">
                                    {Object.values(testResults).filter((result) => result === 'fail').length} teste(s) falharam
                                </p>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </div>

        <div className="border-t border-default bg-surface-1 p-4">
            {verifyDisabledReason ? (
                <p className="mb-3 rounded-xl border border-status-warning bg-status-warning-soft px-3 py-2 text-xs text-status-warning">
                    {verifyDisabledReason}
                </p>
            ) : (
                <p className="mb-3 text-xs text-secondary">
                    Dica: use <span className="font-mono">Ctrl + Enter</span> para verificar mais rápido.
                </p>
            )}
            <button
                onClick={onVerify}
                disabled={isVerifying || !!verifyDisabledReason}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ios-blue py-3 text-sm font-bold text-white shadow-lg shadow-ios-blue/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
    </div>
);
