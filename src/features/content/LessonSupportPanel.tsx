import React from 'react';
import { AlertTriangle, BookOpen, Pencil } from 'lucide-react';
import type { ResolvedExerciseLink } from '../../data/learningConnections';
import type { CommonMistake, LessonSummaryPoint } from '../../types';

interface LessonSupportPanelProps {
    summary?: LessonSummaryPoint[];
    commonMistakes?: CommonMistake[];
    relatedExercises?: ResolvedExerciseLink[];
    onOpenExercise?: (categoryId: string, exerciseId: number) => void;
}

export const LessonSupportPanel: React.FC<LessonSupportPanelProps> = ({
    summary = [],
    commonMistakes = [],
    relatedExercises = [],
    onOpenExercise
}) => {
    if (summary.length === 0 && commonMistakes.length === 0 && relatedExercises.length === 0) {
        return null;
    }

    return (
        <section className="mt-10 space-y-4">
            {relatedExercises.length > 0 && (
                <div className="rounded-3xl border border-status-info/20 bg-status-info-soft/60 p-6">
                    <div className="flex items-center gap-3 text-status-info">
                        <Pencil size={18} />
                        <h2 className="ui-kicker">Prática associada</h2>
                    </div>
                    <div className="mt-4 grid gap-4 xl:grid-cols-2">
                        {relatedExercises.map((exercise) => (
                            <article
                                key={exercise.ref}
                                className="surface-soft-panel rounded-2xl border border-status-info/20 p-4 dark:bg-black/10"
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="badge border-default bg-surface-muted text-secondary">
                                        {exercise.categoryLabel}
                                    </span>
                                    <span className="badge border-default bg-surface-muted text-secondary">
                                        {exercise.level}
                                    </span>
                                </div>
                                <h3 className="mt-3 text-sm font-bold text-primary">
                                    Exercício {exercise.exerciseId}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-secondary">
                                    {exercise.question}
                                </p>
                                {onOpenExercise && (
                                    <button
                                        type="button"
                                        onClick={() => onOpenExercise(exercise.categoryId, exercise.exerciseId)}
                                        className="mt-4 rounded-full bg-ios-blue px-4 py-2 text-xs font-bold text-white transition-colors hover:opacity-90"
                                    >
                                        Tentar resolver
                                    </button>
                                )}
                            </article>
                        ))}
                    </div>
                </div>
            )}

            {summary.length > 0 && (
                <div className="rounded-3xl border border-default bg-surface-muted/70 p-6">
                    <div className="flex items-center gap-3 text-ios-green">
                        <BookOpen size={18} />
                        <h2 className="ui-kicker">Resumo para revisão</h2>
                    </div>
                    <ul className="mt-4 space-y-3 text-sm text-primary">
                        {summary.map((point) => (
                            <li key={point.id} className="flex gap-3 leading-relaxed">
                                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ios-green" />
                                <span>{point.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {commonMistakes.length > 0 && (
                <div className="rounded-3xl border border-status-warning bg-status-warning-soft/70 p-6">
                    <div className="flex items-center gap-3 text-status-warning">
                        <AlertTriangle size={18} />
                        <h2 className="ui-kicker">Erros comuns</h2>
                    </div>
                    <div className="mt-4 grid gap-4 xl:grid-cols-2">
                        {commonMistakes.map((mistake) => (
                            <article
                                key={mistake.title}
                                className="surface-soft-panel rounded-2xl border border-status-warning/30 p-4 dark:bg-black/10"
                            >
                                <h3 className="text-sm font-bold text-primary">{mistake.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-secondary">{mistake.explanation}</p>
                                <p className="mt-3 text-sm font-medium leading-relaxed text-primary">
                                    Como corrigir: {mistake.correction}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};
