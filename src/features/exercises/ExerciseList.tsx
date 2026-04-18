import React from 'react';
import {
    Brain,
    Lightbulb,
    Eye,
    EyeOff,
    CheckCircle2,
    ListFilter,
    Pencil,
    Trophy,
    ArrowRightLeft
} from 'lucide-react';
import { AutomatonPreview } from '../../components/automaton/AutomatonPreview';
import type { Exercicio } from '../../types';
import type { ConverterData, ExerciseSolverStartOptions } from './types';

interface ExerciseListProps {
    activeCategory: string;
    activeCategoryLabel: string;
    exercises: Exercicio[];
    filteredExercises: Exercicio[];
    completedInActiveCategory: number;
    revealedHints: Record<number, boolean>;
    revealedAnswers: Record<number, boolean>;
    isExerciseCompleted: (categoryId: string, exerciseId: number) => boolean;
    onToggleHint: (exerciseId: number) => void;
    onToggleAnswer: (exerciseId: number) => void;
    onStartSolving: (exerciseId: number, options?: ExerciseSolverStartOptions) => void;
    onOpenSidebar: () => void;
    onOpenConverter: (data: ConverterData) => void;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({
    activeCategory,
    activeCategoryLabel,
    exercises,
    filteredExercises,
    completedInActiveCategory,
    revealedHints,
    revealedAnswers,
    isExerciseCompleted,
    onToggleHint,
    onToggleAnswer,
    onStartSolving,
    onOpenSidebar,
    onOpenConverter,
}) => (
    <div className="render-lite-shell flex-1 min-w-0 space-y-6 pb-10">
        <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 className="ui-title-2 text-primary mb-1">{activeCategoryLabel}</h2>
                    <p className="ui-body-sm text-secondary">Lista de exercícios práticos</p>
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
                    <span className="badge bg-surface-muted text-secondary border-default">
                        {completedInActiveCategory}/{exercises.length} concluídos
                    </span>
                    <span className="badge bg-surface-muted text-secondary border-default">
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
                </div>
            </div>
        </div>

        {filteredExercises.map((exercise, index) => {
            const completed = isExerciseCompleted(activeCategory, exercise.id);
            const hintCount = exercise.dicas?.length ?? (exercise.dica ? 1 : 0);

            return (
                <div
                    key={exercise.id}
                    data-deferred-render="card"
                    className="glass-card overflow-hidden group hover:shadow-apple-md animate-slide-in-up opacity-0"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                >
                    <div className="p-5 sm:p-6 lg:p-8">
                        <div className="flex gap-4 sm:gap-5 items-start">
                            <span className="surface-chip flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-default font-mono text-lg font-bold text-secondary">
                                {exercise.id}
                            </span>
                            <h3 className="text-lg font-medium text-primary leading-relaxed pt-1">{exercise.pergunta}</h3>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-6 sm:mt-8 ml-0 sm:ml-14">
                            {exercise.metadata && (
                                <span className="badge border-default bg-surface-muted text-secondary">
                                    {exercise.metadata.pattern}
                                </span>
                            )}
                            {exercise.estrategia && (
                                <span className="badge gap-2 border-status-info bg-status-info-soft text-status-info">
                                    <Brain size={12} />
                                    Estratégia
                                </span>
                            )}
                            {exercise.guidedSolution && exercise.guidedSolution.length > 0 && (
                                <span className="badge border-status-success bg-status-success-soft text-status-success">
                                    Solução guiada
                                </span>
                            )}
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
                                        Tentar Resolver
                                    </>
                                )}
                            </button>

                            {hintCount > 0 && (
                                <button
                                    onClick={() => onToggleHint(exercise.id)}
                                    className={`btn-icon px-4 rounded-xl text-sm font-bold gap-2 border shadow-apple-sm ${
                                        revealedHints[exercise.id]
                                            ? 'bg-status-warning-soft text-status-warning border-status-warning'
                                            : 'bg-surface-soft text-primary border-default hover:bg-surface-strong dark:text-secondary'
                                    }`}
                                >
                                    <Lightbulb size={14} className={revealedHints[exercise.id] ? 'fill-current' : ''} />
                                    {revealedHints[exercise.id]
                                        ? 'Esconder'
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
                                {revealedAnswers[exercise.id] ? 'Esconder' : 'Ver Resposta'}
                            </button>
                        </div>
                    </div>

                    {revealedHints[exercise.id] && hintCount > 0 && (
                        <div className="mx-4 sm:mx-8 mb-6 sm:ml-20 p-4 bg-status-warning-soft border border-status-warning rounded-2xl text-status-warning text-sm animate-scale-in">
                            <span className="font-bold mr-2 block mb-3 uppercase tracking-wide text-xs">
                                {hintCount > 1 ? 'Pistas iniciais' : 'Pista'}
                            </span>
                            <div className="space-y-3">
                                {(exercise.dicas && exercise.dicas.length > 0 ? exercise.dicas : exercise.dica ? [{
                                    id: `exercise-${exercise.id}-legacy-hint`,
                                    level: 1,
                                    text: exercise.dica
                                }] : []).map((hint) => (
                                    <div key={hint.id} className="surface-soft-panel rounded-2xl border border-status-warning/20 p-3 text-primary dark:bg-black/10">
                                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-status-warning">
                                            Pista {hint.level}
                                        </p>
                                        <p className="mt-2 text-sm leading-relaxed">{hint.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {revealedAnswers[exercise.id] && (
                        <div className="border-t border-default bg-surface-2/80 p-5 sm:p-8 animate-fade-in dark:bg-black/20">
                            <div className="sm:ml-14">
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle2 size={16} strokeWidth={3} className="text-ios-green" />
                                    <span className="ui-kicker text-secondary">Solução</span>
                                </div>

                                {exercise.respostaTexto && (
                                    <p className="surface-soft-panel whitespace-pre-line rounded-2xl border border-default p-6 font-mono text-sm leading-relaxed text-primary shadow-sm dark:bg-white/5">
                                        {exercise.respostaTexto}
                                    </p>
                                )}

                                {exercise.respostaAutomato && (
                                    <div className="mt-8 pt-6 border-t border-default">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-ios-green"></div>
                                                <span className="ui-kicker text-secondary">Gabarito Visual</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <button
                                                    onClick={() => onOpenConverter({ automaton: exercise.respostaAutomato })}
                                                    className="group flex items-center gap-2 px-4 py-2 rounded-full bg-status-accent-soft text-status-accent hover:bg-ios-purple hover:text-white text-xs font-bold transition-all duration-300"
                                                >
                                                    <ArrowRightLeft size={12} />
                                                    Converter
                                                </button>
                                                <button
                                                    onClick={() => onStartSolving(exercise.id, {
                                                        initialAutomaton: exercise.respostaAutomato,
                                                    })}
                                                    className="group flex items-center gap-2 px-4 py-2 rounded-full bg-status-info-soft text-status-info hover:bg-ios-blue hover:text-white text-xs font-bold transition-all duration-300"
                                                >
                                                    <Pencil size={12} />
                                                    Verificar solução
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relative aspect-[16/10] min-h-[224px] w-full overflow-hidden rounded-3xl border border-default bg-canvas shadow-inner md:min-h-[260px] lg:min-h-[320px]">
                                            <AutomatonPreview
                                                data={exercise.respostaAutomato}
                                                ariaLabel={`Gabarito visual do exercício ${exercise.id}`}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            );
        })}

        {filteredExercises.length === 0 && (
            <div className="p-6 rounded-2xl border border-dashed border-default text-sm text-secondary">
                Nenhum exercício encontrado para esta busca.
            </div>
        )}
    </div>
);
