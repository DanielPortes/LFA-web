import React, { useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle,
    ArrowRight,
    BookOpen,
    Brain,
    CheckCircle2,
    ChevronDown,
    Lightbulb,
    Play
} from 'lucide-react';
import { resolveTheoryRefs } from '../../data/learningConnections';
import { AutomatonPreview } from '../../components/automaton/AutomatonPreview';
import type { AutomatoData, Exercicio, ExerciseHint } from '../../types';
import type { ExerciseEquivalenceStatus, ExerciseFailure } from './types';

interface ExerciseSupportPanelProps {
    exercise: Exercicio | null;
    onLoadAnswerAutomaton?: (data: AutomatoData) => void;
    onOpenTheory?: (moduleId: string, lessonId: string) => void;
    lastFailure?: ExerciseFailure | null;
    equivalenceStatus?: ExerciseEquivalenceStatus;
}

const recommendationLabel = {
    required: 'Obrigatório',
    recommended: 'Recomendado',
    challenge: 'Desafio'
} as const;

export const ExerciseSupportPanel: React.FC<ExerciseSupportPanelProps> = ({
    exercise,
    onLoadAnswerAutomaton,
    onOpenTheory,
    lastFailure = null,
    equivalenceStatus = null
}) => {
    const normalizedHints = useMemo<ExerciseHint[]>(() => {
        if (!exercise) return [];
        if (exercise.dicas && exercise.dicas.length > 0) {
            return [...exercise.dicas].sort((a, b) => a.level - b.level);
        }
        if (exercise.dica) {
            return [{
                id: `exercise-${exercise.id}-legacy-hint`,
                level: 1,
                text: exercise.dica
            }];
        }
        return [];
    }, [exercise]);

    const [revealedHintCount, setRevealedHintCount] = useState(0);
    const [showStrategy, setShowStrategy] = useState(false);
    const [showGuidedSolution, setShowGuidedSolution] = useState(false);
    const [showFinalAnswer, setShowFinalAnswer] = useState(false);
    const relatedTheory = useMemo(
        () => resolveTheoryRefs(exercise?.metadata?.theoryRefs),
        [exercise?.metadata?.theoryRefs]
    );
    const hasFailureContext = Boolean(lastFailure) || equivalenceStatus === 'fail';
    const nextHint = normalizedHints[revealedHintCount] ?? null;
    const hintProgressLabel = normalizedHints.length > 0
        ? `${revealedHintCount}/${normalizedHints.length} pistas abertas`
        : 'Sem pistas graduais';
    const highlightedMistakeId = useMemo(() => {
        if (!lastFailure || !exercise?.commonMistakes || exercise.commonMistakes.length === 0) {
            return null;
        }

        const diagnosticText = [
            lastFailure.input,
            lastFailure.expected,
            lastFailure.received,
            lastFailure.reason ?? ''
        ].join(' ').toLowerCase();

        const matchedMistake = exercise.commonMistakes.find((mistake) => (
            diagnosticText.includes(mistake.title.toLowerCase())
            || diagnosticText.includes(mistake.symptom.toLowerCase())
            || diagnosticText.includes(mistake.correction.toLowerCase())
        ));

        return matchedMistake?.id ?? null;
    }, [exercise?.commonMistakes, lastFailure]);
    const currentGuidance = useMemo(() => {
        if (lastFailure) {
            return {
                kicker: 'Foco de correção',
                title: 'Ajuste a partir da última verificação',
                description: lastFailure.reason
                    ?? `Na entrada "${lastFailure.input}", sua solução retornou ${lastFailure.received}, mas o esperado era ${lastFailure.expected}.`,
                accentClassName: 'text-status-danger',
                panelClassName: 'border-status-danger/30 bg-status-danger-soft/55'
            };
        }

        if (equivalenceStatus === 'fail') {
            return {
                kicker: 'Refinamento estrutural',
                title: 'Os testes podem passar e o modelo ainda divergir',
                description: 'Revise os estados e a cobertura de transições. A estrutura geral ainda difere do gabarito esperado.',
                accentClassName: 'text-status-warning',
                panelClassName: 'border-status-warning/30 bg-status-warning-soft/55'
            };
        }

        if (revealedHintCount > 0) {
            return {
                kicker: 'Próximo passo',
                title: `Pista ${revealedHintCount} revelada`,
                description: nextHint
                    ? `A próxima ajuda disponível é a pista ${nextHint.level}. Tente aplicar a pista atual antes de liberar a seguinte.`
                    : 'Você já abriu todas as pistas graduais. Se ainda estiver travado, avance para a estratégia ou para a solução guiada.',
                accentClassName: 'text-ios-blue',
                panelClassName: 'border-status-info/30 bg-status-info-soft/55'
            };
        }

        return {
            kicker: 'Rota recomendada',
            title: 'Valide primeiro, peça ajuda depois',
            description: normalizedHints.length > 0
                ? 'Monte uma primeira tentativa, rode a verificação e use a próxima pista apenas se precisar destravar o raciocínio.'
                : 'Comece pela sua tentativa e use a estratégia ou o gabarito apenas como apoio final.',
            accentClassName: 'text-secondary',
            panelClassName: 'border-default bg-surface-2/95'
        };
    }, [equivalenceStatus, lastFailure, nextHint, normalizedHints.length, revealedHintCount]);

    useEffect(() => {
        setRevealedHintCount(0);
        setShowStrategy(false);
        setShowGuidedSolution(false);
        setShowFinalAnswer(false);
    }, [exercise?.id]);

    if (!exercise) {
        return null;
    }

    const hasPedagogicalContent = normalizedHints.length > 0
        || !!exercise.estrategia
        || !!exercise.guidedSolution?.length
        || !!exercise.commonMistakes?.length
        || !!exercise.metadata
        || !!exercise.respostaTexto
        || !!exercise.respostaAutomato;

    if (!hasPedagogicalContent) {
        return null;
    }

    return (
        <section className="space-y-4">
            <div className={`rounded-[24px] border p-4 ${currentGuidance.panelClassName}`}>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className={`ui-kicker ${currentGuidance.accentClassName}`}>{currentGuidance.kicker}</div>
                        <h3 className="mt-2 text-sm font-bold text-primary">{currentGuidance.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-secondary">{currentGuidance.description}</p>
                    </div>
                    <div className={`surface-chip rounded-2xl border px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] ${
                        hasFailureContext
                            ? 'border-status-danger/20 text-status-danger dark:bg-black/10'
                            : 'border-default text-secondary dark:bg-black/10'
                    }`}>
                        {hintProgressLabel}
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    {nextHint && (
                        <button
                            type="button"
                            onClick={() => setRevealedHintCount((current) => Math.min(current + 1, normalizedHints.length))}
                            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                                hasFailureContext
                                    ? 'bg-status-danger text-white hover:opacity-90'
                                    : 'bg-ios-blue text-white hover:opacity-90'
                            }`}
                        >
                            {revealedHintCount === 0 ? `Liberar pista ${nextHint.level}` : `Liberar pista ${nextHint.level}`}
                        </button>
                    )}
                    {revealedHintCount > 0 && (
                        <button
                            type="button"
                            onClick={() => setRevealedHintCount(0)}
                            className="surface-chip rounded-full border border-default px-3 py-1.5 text-xs font-bold text-secondary transition-colors hover:text-primary dark:bg-black/10"
                        >
                            Recolher pistas
                        </button>
                    )}
                    {exercise.estrategia && !showStrategy && (
                        <button
                            type="button"
                            onClick={() => setShowStrategy(true)}
                            className="surface-chip rounded-full border border-default px-3 py-1.5 text-xs font-bold text-secondary transition-colors hover:text-primary dark:bg-black/10"
                        >
                            Abrir estratégia
                        </button>
                    )}
                </div>
            </div>

            {exercise.metadata && (
                <div className="rounded-[24px] border border-default bg-surface-2/95 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="badge border-status-info bg-status-info-soft text-status-info">
                            {exercise.metadata.pattern}
                        </span>
                        {exercise.metadata.recommendation && (
                            <span className="badge border-default bg-surface-muted text-secondary">
                                {recommendationLabel[exercise.metadata.recommendation]}
                            </span>
                        )}
                    </div>

                    <p className="mt-3 text-sm font-semibold text-primary">
                        Objetivo: {exercise.metadata.learningGoal}
                    </p>

                    {exercise.metadata.prerequisites && exercise.metadata.prerequisites.length > 0 && (
                        <div className="mt-3">
                            <p className="ui-kicker text-secondary">Pré-requisitos</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {exercise.metadata.prerequisites.map((prerequisite) => (
                                    <span key={prerequisite} className="badge border-default bg-surface-muted text-secondary">
                                        {prerequisite}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {exercise.metadata.theoryRefs && exercise.metadata.theoryRefs.length > 0 && (
                        <div className="mt-3">
                            <div className="flex items-center gap-2 text-ios-indigo">
                                <BookOpen size={14} />
                                <p className="ui-kicker">Trilha associada</p>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {exercise.metadata.theoryRefs.map((reference) => {
                                    const resolvedReference = relatedTheory.find((item) => item.ref === reference);

                                    if (resolvedReference && onOpenTheory) {
                                        return (
                                            <button
                                                key={reference}
                                                type="button"
                                                onClick={() => onOpenTheory(resolvedReference.moduleId, resolvedReference.lessonId)}
                                                className="badge border-status-info bg-status-info-soft text-status-info transition-colors hover:bg-ios-blue hover:text-white"
                                            >
                                                {resolvedReference.label}
                                            </button>
                                        );
                                    }

                                    return (
                                        <span key={reference} className="badge border-default bg-surface-muted text-secondary">
                                            {reference}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {normalizedHints.length > 0 && (
                <div className="rounded-[24px] border border-status-warning/35 bg-status-warning-soft/55 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 text-status-warning">
                            <Lightbulb size={16} />
                            <p className="ui-kicker">Pistas graduais</p>
                        </div>
                        <div className="surface-chip rounded-full border border-status-warning/25 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-status-warning dark:bg-black/10">
                            {hasFailureContext && nextHint ? `Priorize a pista ${nextHint.level}` : hintProgressLabel}
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        {normalizedHints.map((hint, index) => {
                            const isRevealed = index < revealedHintCount;
                            const isNext = index === revealedHintCount && revealedHintCount < normalizedHints.length;

                            return (
                                <div
                                    key={hint.id}
                                    className={`rounded-[22px] border p-4 transition-colors ${
                                        isRevealed
                                            ? 'surface-soft-panel border-status-warning/25 dark:bg-black/10'
                                            : isNext
                                                ? 'border-status-warning/20 bg-status-warning-soft/40'
                                                : 'surface-soft-panel border-status-warning/10 opacity-80 dark:bg-black/5'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full border text-[11px] font-black ${
                                            isRevealed
                                                ? 'border-status-warning/40 bg-status-warning-soft text-status-warning'
                                                : isNext
                                                    ? 'surface-chip border-status-warning/25 text-status-warning dark:bg-black/10'
                                                    : 'border-status-warning/15 bg-transparent text-status-warning/70'
                                        }`}>
                                            {hint.level}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-status-warning">
                                                    Pista {hint.level}
                                                </p>
                                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] ${
                                                    isRevealed
                                                        ? 'bg-status-warning-soft text-status-warning'
                                                        : isNext
                                                            ? 'surface-chip text-status-warning dark:bg-black/10'
                                                            : 'bg-transparent text-status-warning/70'
                                                }`}>
                                                    {isRevealed ? 'Revelada' : isNext ? (hasFailureContext ? 'Recomendada agora' : 'Disponível') : 'Bloqueada'}
                                                </span>
                                            </div>

                                            {isRevealed ? (
                                                <p className="mt-2 text-sm leading-relaxed text-primary">{hint.text}</p>
                                            ) : isNext ? (
                                                <p className="mt-2 text-sm leading-relaxed text-secondary">
                                                    {hasFailureContext
                                                        ? 'A última falha já aponta que esta é a próxima pista mais útil para ajustar sua solução.'
                                                        : 'Libere esta pista somente se a tentativa atual já estiver no limite do que você consegue inferir sozinho.'}
                                                </p>
                                            ) : (
                                                <p className="mt-2 text-sm leading-relaxed text-secondary">
                                                    Mantenha esta pista bloqueada por enquanto para preservar a progressão do exercício.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {exercise.estrategia && (
                <div className="rounded-[24px] border border-default bg-surface-2/95 p-4">
                    <button
                        type="button"
                        onClick={() => setShowStrategy((current) => !current)}
                        className="flex w-full items-center justify-between gap-3 text-left"
                    >
                        <div className="flex items-center gap-2 text-ios-blue">
                            <Brain size={16} />
                            <p className="ui-kicker">Estratégia</p>
                        </div>
                        <ChevronDown
                            size={16}
                            className={`text-secondary transition-transform ${showStrategy ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {showStrategy && (
                        <p className="mt-3 text-sm leading-relaxed text-primary">{exercise.estrategia}</p>
                    )}
                </div>
            )}

            {exercise.guidedSolution && exercise.guidedSolution.length > 0 && (
                <div className="rounded-[24px] border border-default bg-surface-2/95 p-4">
                    <button
                        type="button"
                        onClick={() => setShowGuidedSolution((current) => !current)}
                        className="flex w-full items-center justify-between gap-3 text-left"
                    >
                        <div className="flex items-center gap-2 text-ios-green">
                            <ArrowRight size={16} />
                            <p className="ui-kicker">Solução guiada</p>
                        </div>
                        <ChevronDown
                            size={16}
                            className={`text-secondary transition-transform ${showGuidedSolution ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {showGuidedSolution && (
                        <div className="mt-4 space-y-3">
                            {exercise.guidedSolution.map((step, index) => (
                                <div key={step.id} className="surface-soft-panel rounded-[22px] border border-default p-4 dark:bg-black/10">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ios-green">
                                        Etapa {index + 1}
                                    </p>
                                    <h3 className="mt-2 text-sm font-bold text-primary">{step.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-secondary">{step.explanation}</p>
                                    {step.expectedStudentAction && (
                                        <p className="mt-3 text-sm font-medium leading-relaxed text-primary">
                                            Ação esperada: {step.expectedStudentAction}
                                        </p>
                                    )}
                                    {step.checkpointQuestion && (
                                        <p className="mt-3 text-sm font-medium leading-relaxed text-ios-blue">
                                            Checkpoint: {step.checkpointQuestion}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
                <div className="rounded-[24px] border border-status-danger/35 bg-status-danger-soft/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 text-status-danger">
                            <AlertTriangle size={16} />
                            <p className="ui-kicker">Erros comuns</p>
                        </div>
                        {highlightedMistakeId && (
                            <div className="surface-chip rounded-full border border-status-danger/20 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-status-danger dark:bg-black/10">
                                Revise primeiro
                            </div>
                        )}
                    </div>
                    <div className="mt-4 space-y-3">
                        {exercise.commonMistakes.map((mistake) => (
                            <div
                                key={mistake.id}
                                className={`surface-soft-panel rounded-[22px] border p-4 dark:bg-black/10 ${
                                    highlightedMistakeId === mistake.id
                                        ? 'border-status-danger/35 shadow-[0_0_0_1px_rgba(255,59,48,0.12)]'
                                        : 'border-status-danger/20'
                                }`}
                            >
                                <h3 className="text-sm font-bold text-primary">{mistake.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-secondary">{mistake.symptom}</p>
                                <p className="mt-3 text-sm font-medium leading-relaxed text-primary">
                                    Como corrigir: {mistake.correction}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {(exercise.respostaTexto || exercise.respostaAutomato) && (
                <div className="rounded-[24px] border border-default bg-surface-2/95 p-4">
                    <button
                        type="button"
                        onClick={() => setShowFinalAnswer((current) => !current)}
                        className="flex w-full items-center justify-between gap-3 text-left"
                    >
                        <div className="flex items-center gap-2 text-ios-indigo">
                            <CheckCircle2 size={16} />
                            <p className="ui-kicker">Gabarito final</p>
                        </div>
                        <ChevronDown
                            size={16}
                            className={`text-secondary transition-transform ${showFinalAnswer ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {showFinalAnswer && (
                        <div className="mt-4 space-y-4">
                            {exercise.respostaTexto && (
                                <div className="surface-soft-panel rounded-[22px] border border-default p-4 dark:bg-black/10">
                                    <p className="whitespace-pre-line text-sm font-mono leading-relaxed text-primary">
                                        {exercise.respostaTexto}
                                    </p>
                                </div>
                            )}

                            {exercise.respostaAutomato && (
                                <div className="surface-soft-panel rounded-[22px] border border-default p-4 dark:bg-black/10">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <p className="text-sm font-semibold text-primary">Gabarito visual</p>
                                        {onLoadAnswerAutomaton && (
                                            <button
                                                type="button"
                                                onClick={() => onLoadAnswerAutomaton(exercise.respostaAutomato!)}
                                                className="flex items-center gap-2 rounded-full bg-status-info-soft px-3 py-1.5 text-xs font-bold text-status-info transition-colors hover:bg-ios-blue hover:text-white"
                                            >
                                                <Play size={12} fill="currentColor" />
                                                Carregar no canvas
                                            </button>
                                        )}
                                    </div>
                                    <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-default bg-canvas shadow-inner">
                                        <AutomatonPreview
                                            data={exercise.respostaAutomato}
                                            ariaLabel={`Gabarito visual do exercício ${exercise.id}`}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};
