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

interface ExerciseSupportPanelProps {
    exercise: Exercicio | null;
    onSimulateAnswer?: (data: AutomatoData) => void;
    onOpenTheory?: (moduleId: string, lessonId: string) => void;
}

const recommendationLabel = {
    required: 'Obrigatório',
    recommended: 'Recomendado',
    challenge: 'Desafio'
} as const;

export const ExerciseSupportPanel: React.FC<ExerciseSupportPanelProps> = ({
    exercise,
    onSimulateAnswer,
    onOpenTheory
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
            {exercise.metadata && (
                <div className="rounded-2xl border border-default bg-surface-2 p-4">
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
                <div className="rounded-2xl border border-status-warning bg-status-warning-soft/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-status-warning">
                            <Lightbulb size={16} />
                            <p className="ui-kicker">Pistas graduais</p>
                        </div>
                        <div className="flex gap-2">
                            {revealedHintCount < normalizedHints.length && (
                                <button
                                    type="button"
                                    onClick={() => setRevealedHintCount((current) => Math.min(current + 1, normalizedHints.length))}
                                    className="rounded-full border border-status-warning/30 bg-white/70 px-3 py-1 text-xs font-bold text-status-warning transition-colors hover:bg-white dark:bg-black/10"
                                >
                                    {revealedHintCount === 0 ? 'Mostrar pista' : 'Próxima pista'}
                                </button>
                            )}
                            {revealedHintCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setRevealedHintCount(0)}
                                    className="rounded-full border border-status-warning/30 px-3 py-1 text-xs font-bold text-status-warning transition-colors hover:bg-white/50"
                                >
                                    Reiniciar
                                </button>
                            )}
                        </div>
                    </div>

                    {revealedHintCount > 0 && (
                        <div className="mt-4 space-y-3">
                            {normalizedHints.slice(0, revealedHintCount).map((hint) => (
                                <div key={hint.id} className="rounded-2xl border border-status-warning/20 bg-white/60 p-3 dark:bg-black/10">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-status-warning">
                                        Pista {hint.level}
                                    </p>
                                    <p className="mt-2 text-sm leading-relaxed text-primary">{hint.text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {exercise.estrategia && (
                <div className="rounded-2xl border border-default bg-surface-2 p-4">
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
                <div className="rounded-2xl border border-default bg-surface-2 p-4">
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
                                <div key={step.id} className="rounded-2xl border border-default bg-white/70 p-4 dark:bg-black/10">
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
                <div className="rounded-2xl border border-status-danger bg-status-danger-soft/50 p-4">
                    <div className="flex items-center gap-2 text-status-danger">
                        <AlertTriangle size={16} />
                        <p className="ui-kicker">Erros comuns</p>
                    </div>
                    <div className="mt-4 space-y-3">
                        {exercise.commonMistakes.map((mistake) => (
                            <div key={mistake.id} className="rounded-2xl border border-status-danger/20 bg-white/70 p-4 dark:bg-black/10">
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
                <div className="rounded-2xl border border-default bg-surface-2 p-4">
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
                                <div className="rounded-2xl border border-default bg-white/70 p-4 dark:bg-black/10">
                                    <p className="whitespace-pre-line text-sm font-mono leading-relaxed text-primary">
                                        {exercise.respostaTexto}
                                    </p>
                                </div>
                            )}

                            {exercise.respostaAutomato && (
                                <div className="rounded-2xl border border-default bg-white/70 p-4 dark:bg-black/10">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <p className="text-sm font-semibold text-primary">Gabarito visual</p>
                                        {onSimulateAnswer && (
                                            <button
                                                type="button"
                                                onClick={() => onSimulateAnswer(exercise.respostaAutomato!)}
                                                className="flex items-center gap-2 rounded-full bg-status-info-soft px-3 py-1.5 text-xs font-bold text-status-info transition-colors hover:bg-ios-blue hover:text-white"
                                            >
                                                <Play size={12} fill="currentColor" />
                                                Simular
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
