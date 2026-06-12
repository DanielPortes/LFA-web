import React from 'react';
import {
    Brain,
    Lightbulb,
    Eye,
    EyeOff,
    ListFilter,
    Pencil,
    Trophy,
    ArrowRightLeft,
    BookOpen
} from 'lucide-react';
import type { Exercicio } from '../../types';
import type { ResolvedTheoryLink } from '../../data/learningConnections';
import type { ConverterData, ExerciseSolverStartOptions } from './types';
import { ExerciseSupportPanel } from './ExerciseSupportPanel';
import { EmptyMotionState } from '../../components/ui';

const exercisePatternLabels: Record<string, string> = {
    construction: 'Construção',
    proof: 'Prova',
    conversion: 'Conversão',
    simulation: 'Simulação',
    analysis: 'Análise',
    design: 'Projeto'
};

const getExercisePatternLabel = (pattern: string) => exercisePatternLabels[pattern] ?? pattern;

interface ExerciseListProps {
    activeCategory: string;
    activeCategoryLabel: string;
    exercises: Exercicio[];
    filteredExercises: Exercicio[];
    completedInActiveCategory: number;
    revealedHintCounts: Record<number, number>;
    revealedAnswers: Record<number, boolean>;
    isExerciseCompleted: (categoryId: string, exerciseId: number) => boolean;
    onToggleHint: (exerciseId: number) => void;
    onRevealNextHint: (exerciseId: number) => void;
    onToggleAnswer: (exerciseId: number) => void;
    onStartSolving: (exerciseId: number, options?: ExerciseSolverStartOptions) => void;
    onOpenSidebar: () => void;
    onOpenConverter: (data: ConverterData) => void;
    theoryLinks?: ResolvedTheoryLink[];
    onOpenTheory?: (moduleId: string, lessonId: string) => void;
    returnToLessonLabel?: string | null;
    onReturnToLesson?: () => void;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({
    activeCategory,
    activeCategoryLabel,
    exercises,
    filteredExercises,
    completedInActiveCategory,
    revealedHintCounts,
    revealedAnswers,
    isExerciseCompleted,
    onToggleHint,
    onRevealNextHint,
    onToggleAnswer,
    onStartSolving,
    onOpenSidebar,
    onOpenConverter,
    theoryLinks = [],
    onOpenTheory,
    returnToLessonLabel = null,
    onReturnToLesson,
}) => (
    <div className="render-lite-shell flex-1 min-w-0 space-y-5 pb-10">
        <div className="glass-card px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="truncate text-2xl font-black tracking-tight text-primary">{activeCategoryLabel}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={onOpenSidebar}
                        className="md:hidden p-2 rounded-xl bg-surface-2 border border-default text-secondary hover:text-ios-blue hover:border-ios-blue/40 transition-all"
                        title="Abrir sumário"
                        aria-label="Abrir sumário de exercícios"
                    >
                        <ListFilter size={18} />
                    </button>
                    <span className="rounded-full border border-default bg-surface-muted px-2.5 py-1 text-[10px] font-black text-secondary">
                        {completedInActiveCategory}/{exercises.length} concluídos
                    </span>
                    <span className="rounded-full border border-default bg-surface-muted px-2.5 py-1 text-[10px] font-black text-secondary">
                        {filteredExercises.length}/{exercises.length} questões
                    </span>
                    <button
                        onClick={() => onOpenConverter({})}
                        className="p-2 rounded-xl bg-surface-2 border border-default text-secondary hover:text-ios-blue hover:border-ios-blue/40 transition-all"
                        title="Abrir conversor"
                        aria-label="Abrir conversor de modelos"
                    >
                        <ArrowRightLeft size={18} />
                    </button>
                    {returnToLessonLabel && onReturnToLesson && (
                        <button
                            type="button"
                            onClick={onReturnToLesson}
                            className="btn-icon rounded-xl border border-default bg-surface-2 px-3 py-2 text-sm font-bold text-secondary transition-all hover:border-ios-blue/40 hover:text-ios-blue"
                            aria-label={`Voltar à aula ${returnToLessonLabel}`}
                        >
                            <BookOpen size={16} />
                            Voltar à aula
                        </button>
                    )}
                </div>
            </div>
            {theoryLinks.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-default/60 pt-3">
                    <span className="ui-kicker-xs text-secondary">Estude antes</span>
                    {theoryLinks.map((link) => (
                        onOpenTheory ? (
                            <button
                                key={link.ref}
                                type="button"
                                onClick={() => onOpenTheory(link.moduleId, link.lessonId)}
                                className="rounded-full border border-status-info/25 bg-status-info-soft px-3 py-1.5 text-xs font-bold text-status-info transition-colors hover:bg-ios-blue hover:text-white"
                            >
                                {link.label}
                            </button>
                        ) : (
                            <span
                                key={link.ref}
                                className="rounded-full border border-default bg-surface-muted px-3 py-1.5 text-xs font-bold text-secondary"
                            >
                                {link.label}
                            </span>
                        )
                    ))}
                    <span className="rounded-full border border-status-warning/25 bg-status-warning-soft px-3 py-1.5 text-xs font-bold text-status-warning">
                        Revise erros frequentes no apoio de cada exercício
                    </span>
                </div>
            )}
        </div>

        {filteredExercises.map((exercise, index) => {
            const completed = isExerciseCompleted(activeCategory, exercise.id);
            const hintCount = exercise.dicas?.length ?? (exercise.dica ? 1 : 0);
            const hints = exercise.dicas && exercise.dicas.length > 0
                ? [...exercise.dicas].sort((a, b) => a.level - b.level)
                : exercise.dica
                    ? [{
                        id: `exercise-${exercise.id}-legacy-hint`,
                        level: 1,
                        text: exercise.dica
                    }]
                    : [];
            const revealedHintCount = Math.min(revealedHintCounts[exercise.id] ?? 0, hintCount);
            const nextHintAvailable = revealedHintCount < hintCount;

            return (
                <div
                    key={exercise.id}
                    data-deferred-render="card"
                    className="glass-card motion-panel-enter overflow-hidden group hover:shadow-apple-md"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                >
                    <div className="p-5 sm:p-6 lg:p-8">
                        <div className="flex gap-4 sm:gap-5 items-start">
                            <span className="surface-chip flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-default font-mono text-lg font-bold text-secondary">
                                {exercise.id}
                            </span>
                            <h3 className="text-lg font-medium text-primary leading-relaxed pt-1">{exercise.pergunta}</h3>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-bold text-secondary sm:ml-14">
                            {exercise.metadata && (
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-45" />
                                    {getExercisePatternLabel(exercise.metadata.pattern)}
                                </span>
                            )}
                            {exercise.estrategia && (
                                <span className="inline-flex items-center gap-1.5 text-status-info">
                                    <Brain size={12} />
                                    Estratégia
                                </span>
                            )}
                            {exercise.guidedSolution && exercise.guidedSolution.length > 0 && (
                                <span className="inline-flex items-center gap-1.5 text-status-success">
                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                    Solução guiada
                                </span>
                            )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-3 sm:ml-14">
                            <button
                                onClick={() => onStartSolving(exercise.id)}
                                className={`btn-icon px-4 py-2.5 rounded-xl text-[13px] font-bold gap-2 border transition-all
                                    ${completed
                                        ? 'bg-status-success-soft text-status-success border-status-success'
                                        : 'bg-status-success-soft text-status-success border-status-success shadow-apple-sm hover:bg-ios-green hover:text-white hover:shadow-apple-md hover:scale-[1.01] active:scale-[0.99]'
                                    }`}
                            >
                                {completed ? (
                                    <>
                                        <Trophy size={14} />
                                        Resolvido!
                                    </>
                                ) : (
                                    <>
                                        <Pencil size={14} />
                                        Tentar resolver
                                    </>
                                )}
                            </button>

                            {hintCount > 0 && (
                                <button
                                    onClick={() => onToggleHint(exercise.id)}
                                    className={`btn-icon px-4 rounded-xl text-sm font-bold gap-2 border shadow-apple-sm ${
                                        revealedHintCount > 0
                                            ? 'bg-status-warning-soft text-status-warning border-status-warning'
                                            : 'bg-surface-soft text-primary border-default hover:bg-surface-strong dark:text-secondary'
                                    }`}
                                >
                                    <Lightbulb size={14} className={revealedHintCount > 0 ? 'fill-current' : ''} />
                                    {revealedHintCount > 0
                                        ? 'Esconder pistas'
                                        : hintCount > 1 ? `Pistas (${hintCount})` : 'Dica'}
                                </button>
                            )}

                            <button
                                onClick={() => onToggleAnswer(exercise.id)}
                                className={`btn-icon px-4 rounded-xl text-sm font-bold gap-2 border shadow-apple-sm ${
                                    revealedAnswers[exercise.id]
                                        ? 'bg-status-info-soft text-status-info border-status-info'
                                        : 'bg-surface-soft text-primary border-default hover:bg-surface-strong dark:text-secondary'
                                }`}
                            >
                                {revealedAnswers[exercise.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                {revealedAnswers[exercise.id] ? 'Esconder apoio' : 'Apoio e gabarito'}
                            </button>
                        </div>
                    </div>

                    {revealedHintCount > 0 && (
                        <div className="mx-4 sm:mx-8 mb-6 sm:ml-20 p-4 bg-status-warning-soft border border-status-warning rounded-2xl text-status-warning text-sm animate-scale-in">
                            <span className="font-bold mr-2 block mb-3 uppercase tracking-wide text-xs">
                                {hintCount > 1 ? `${revealedHintCount}/${hintCount} pistas abertas` : 'Pista'}
                            </span>
                            <div className="space-y-3">
                                {hints.slice(0, revealedHintCount).map((hint) => (
                                    <div key={hint.id} className="surface-soft-panel rounded-2xl border border-status-warning/20 p-3 text-primary dark:bg-black/10">
                                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-status-warning">
                                            Pista {hint.level}
                                        </p>
                                        <p className="mt-2 text-sm leading-relaxed">{hint.text}</p>
                                    </div>
                                ))}
                                {nextHintAvailable && (
                                    <button
                                        type="button"
                                        onClick={() => onRevealNextHint(exercise.id)}
                                        className="rounded-full bg-ios-blue px-3 py-1.5 text-xs font-bold text-white transition-colors hover:opacity-90"
                                    >
                                        Liberar próxima pista
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {revealedAnswers[exercise.id] && (
                        <div className="border-t border-default bg-surface-2/80 p-5 sm:p-8 animate-fade-in dark:bg-black/20">
                            <div className="sm:ml-14">
                                <ExerciseSupportPanel
                                    exercise={exercise}
                                    onLoadAnswerAutomaton={(data) => onStartSolving(exercise.id, {
                                        initialAutomaton: data,
                                    })}
                                />
                            </div>
                        </div>
                    )}
                </div>
            );
        })}

        {filteredExercises.length === 0 && (
            <EmptyMotionState
                title="Nenhum exercício encontrado para esta busca."
                description="Ajuste a busca ou selecione outra categoria para continuar praticando."
            />
        )}
    </div>
);
