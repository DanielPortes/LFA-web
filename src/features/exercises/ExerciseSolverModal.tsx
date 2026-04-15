import React, { useId } from 'react';
import {
    ArrowRightLeft,
    FileText,
    Pencil,
    Play,
    RotateCcw,
    Trophy,
    X,
    XCircle,
    Braces
} from 'lucide-react';
import { AutomatonEditor } from '../../components/automaton/AutomatonEditor';
import { DerivationTreeVisualizer, Modal } from '../../components/ui';
import type { AutomatoData, GrammarTree, TestCase } from '../../types';
import type { SimulationTraceStep } from '../../utils/exerciseSimulation';
import type { SolverMode } from './types';
import { ExerciseVerificationPanel } from './ExerciseVerificationPanel';

interface ExerciseSolverModalProps {
    isOpen: boolean;
    exerciseId: number | null;
    question: string | null;
    solverMode: SolverMode;
    userAutomaton: AutomatoData | null;
    onAutomatonChange: (data: AutomatoData) => void;
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

export const ExerciseSolverModal: React.FC<ExerciseSolverModalProps> = ({
    isOpen,
    exerciseId,
    question,
    solverMode,
    userAutomaton,
    onAutomatonChange,
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

    if (!exerciseId || !question) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            labelledById={titleId}
            describedById={descriptionId}
            header={(
                <div className="flex items-center justify-between border-b border-default bg-surface-1 px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-ios-green/10 p-2 text-ios-green">
                            <Pencil size={20} />
                        </div>
                        <div>
                            <h3 id={titleId} className="text-lg font-bold text-primary">
                                Exercício {exerciseId}
                            </h3>
                            <p id={descriptionId} className="max-w-lg truncate text-sm text-secondary">
                                {question}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        {solverMode === 'automaton' && userAutomaton && userAutomaton.estados.length > 0 && (
                            <button
                                onClick={() => onSimulate(userAutomaton)}
                                className="rounded-lg p-2 text-ios-blue transition-colors hover:bg-ios-blue/10"
                                title="Abrir no simulador"
                                aria-label="Abrir autômato atual no simulador"
                            >
                                <Play size={18} />
                            </button>
                        )}
                        <button
                            onClick={onOpenConverter}
                            className="rounded-lg p-2 text-secondary transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                            title="Conversor de modelos"
                            aria-label="Abrir conversor de modelos"
                        >
                            <ArrowRightLeft size={18} />
                        </button>
                        {solverMode === 'automaton' && (
                            <button
                                onClick={onResetAutomaton}
                                className="rounded-lg p-2 text-secondary transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                                title="Resetar"
                                aria-label="Resetar autômato"
                            >
                                <RotateCcw size={18} />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 text-status-danger transition-colors status-hover-danger"
                            title="Fechar"
                            aria-label="Fechar exercício"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}
            bodyClassName="overflow-hidden p-0"
            className="h-[90vh] max-h-[90vh] w-[96vw] max-w-[1200px] sm:h-[84vh] sm:max-h-[84vh] sm:w-[92vw]"
        >
            <div className="flex h-full flex-col overflow-hidden xl:flex-row">
                <div className="relative min-h-[320px] flex-1 overflow-hidden xl:min-h-0">
                    {solverMode === 'automaton' && userAutomaton && (
                        <AutomatonEditor
                            data={userAutomaton}
                            onChange={onAutomatonChange}
                            readOnly={false}
                            compact={true}
                        />
                    )}

                    {solverMode === 'regex' && (
                        <div className="h-full overflow-y-auto p-6 md:p-8">
                            <div className="mb-4 flex items-center gap-2 ui-kicker text-secondary">
                                <Braces size={14} />
                                Expressão Regular
                            </div>
                            <input
                                type="text"
                                value={userRegex}
                                onChange={(e) => onRegexChange(e.target.value)}
                                placeholder="Ex: (a+b)*abb"
                                aria-invalid={!!regexError}
                                aria-describedby={regexError ? regexErrorId : undefined}
                                className="w-full rounded-2xl border border-default bg-surface-2 px-4 py-3 text-lg font-mono text-primary shadow-inner outline-none ring-ios-blue/40 focus:ring-2"
                            />
                            {regexError && (
                                <p id={regexErrorId} role="status" className="mt-3 flex items-center gap-2 text-sm text-status-danger">
                                    <XCircle size={14} /> {regexError}
                                </p>
                            )}
                            <div className="mt-6 rounded-2xl border border-default bg-black/5 p-4 text-sm leading-relaxed text-secondary dark:bg-white/5">
                                Use <code className="font-mono">+</code> para união, <code className="font-mono">*</code> para fecho, <code className="font-mono">?</code> para opcional, e <code className="font-mono">eps</code> para vazio.
                            </div>
                        </div>
                    )}

                    {solverMode === 'grammar' && (
                        <div className="h-full overflow-y-auto p-6 md:p-8">
                            <div className="mb-4 flex items-center gap-2 ui-kicker text-secondary">
                                <FileText size={14} />
                                Gramática
                            </div>
                            <textarea
                                value={userGrammar}
                                onChange={(e) => onGrammarChange(e.target.value)}
                                placeholder="S -> a S b | eps"
                                aria-invalid={!!grammarError}
                                aria-describedby={grammarError ? grammarErrorId : undefined}
                                className="h-64 w-full rounded-2xl border border-default bg-surface-2 px-4 py-3 text-sm font-mono text-primary shadow-inner outline-none ring-ios-blue/40 focus:ring-2"
                            />
                            {grammarError && (
                                <p id={grammarErrorId} role="status" className="mt-3 flex items-center gap-2 text-sm text-status-danger">
                                    <XCircle size={14} /> {grammarError}
                                </p>
                            )}
                            {grammarWarnings.length > 0 && (
                                <div className="mt-3 text-xs text-yellow-700">
                                    {grammarWarnings.map((warn, idx) => (
                                        <div key={`${warn}-${idx}`}>- {warn}</div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-4 rounded-2xl border border-default bg-black/5 p-4 text-sm leading-relaxed text-secondary dark:bg-white/5">
                                Formato: <code className="font-mono">S -&gt; a S b | eps</code>. Use espaços para símbolos multi-caractere.
                            </div>
                            {grammarTree && (
                                <div className="mt-6 border-t border-default pt-6">
                                    <div className="mb-4 ui-kicker text-secondary">
                                        Última Árvore Gerada (Falha)
                                    </div>
                                    <div className="h-64 overflow-hidden rounded-xl border border-default bg-surface-muted">
                                        <DerivationTreeVisualizer tree={grammarTree} autoPlay={true} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {solverMode === 'text' && (
                        <div className="h-full overflow-y-auto p-6 md:p-8">
                            <div className="mb-4 flex items-center gap-2 ui-kicker text-secondary">
                                <FileText size={14} />
                                Resposta aberta
                            </div>
                            <textarea
                                value={userText}
                                onChange={(e) => onTextChange(e.target.value)}
                                placeholder="Escreva sua solução aqui..."
                                className="h-64 w-full rounded-2xl border border-default bg-surface-2 px-4 py-3 text-sm text-primary shadow-inner outline-none ring-ios-blue/40 focus:ring-2"
                            />
                            <div className="mt-4 flex items-center gap-3">
                                <button
                                    onClick={onMarkCompleted}
                                    className="rounded-xl bg-ios-green px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-green-600"
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
                    )}
                </div>

                <ExerciseVerificationPanel
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
        </Modal>
    );
};
