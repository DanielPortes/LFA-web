import React, { useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle,
    ArrowRight,
    BookOpen,
    Brain,
    CheckCircle2,
    ChevronDown,
    Lightbulb,
    Play,
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

interface SupportSectionProps {
    title: string;
    subtitle: string;
    badge?: string;
    icon: React.ReactNode;
    iconClassName: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

const recommendationLabel = {
    required: 'Obrigatório',
    recommended: 'Recomendado',
    challenge: 'Desafio',
} as const;

const patternLabel: Record<string, string> = {
    construction: 'Construção',
};

const sectionBodyClassName = 'border-t border-default/60 px-3 py-3';

const SupportSection: React.FC<SupportSectionProps> = ({
    title,
    subtitle,
    badge,
    icon,
    iconClassName,
    isOpen,
    onToggle,
    children,
}) => (
    <section className="border-t border-default/60 first:border-t-0">
        <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-label={title}
            title={subtitle}
            className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-hover/60"
        >
            <div className="flex min-w-0 items-center gap-2.5">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}>
                    {icon}
                </div>
                <p className="min-w-0 truncate text-sm font-semibold text-primary">{title}</p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                {badge && (
                    <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-secondary">
                        {badge}
                    </span>
                )}
                <ChevronDown
                    size={16}
                    className={`text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </div>
        </button>

        {isOpen && (
            <div className={sectionBodyClassName}>
                {children}
            </div>
        )}
    </section>
);

export const ExerciseSupportPanel: React.FC<ExerciseSupportPanelProps> = ({
    exercise,
    onLoadAnswerAutomaton,
    onOpenTheory,
    lastFailure = null,
    equivalenceStatus = null,
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
                text: exercise.dica,
            }];
        }
        return [];
    }, [exercise]);

    const relatedTheory = useMemo(
        () => resolveTheoryRefs(exercise?.metadata?.theoryRefs),
        [exercise?.metadata?.theoryRefs]
    );

    const [revealedHintCount, setRevealedHintCount] = useState(0);
    const [showHints, setShowHints] = useState(false);
    const [showStrategy, setShowStrategy] = useState(false);
    const [showContext, setShowContext] = useState(false);
    const [showMistakes, setShowMistakes] = useState(false);
    const [showGuidedSolution, setShowGuidedSolution] = useState(false);
    const [showFinalAnswer, setShowFinalAnswer] = useState(false);

    const highlightedMistakeId = useMemo(() => {
        if (!lastFailure || !exercise?.commonMistakes || exercise.commonMistakes.length === 0) {
            return null;
        }

        const diagnosticText = [
            lastFailure.input,
            lastFailure.expected,
            lastFailure.received,
            lastFailure.reason ?? '',
        ].join(' ').toLowerCase();

        const matchedMistake = exercise.commonMistakes.find((mistake) => (
            diagnosticText.includes(mistake.title.toLowerCase())
            || diagnosticText.includes(mistake.symptom.toLowerCase())
            || diagnosticText.includes(mistake.correction.toLowerCase())
        ));

        return matchedMistake?.id ?? null;
    }, [exercise?.commonMistakes, lastFailure]);

    const supportSummary = useMemo(() => {
        if (lastFailure) {
            return {
                title: 'Ajuda para o erro atual',
                description: 'O primeiro erro já foi destacado na verificação. Se precisar destravar, abra as dicas ou revise os erros comuns abaixo.',
                className: 'border-status-danger/25 bg-status-danger-soft/45 text-status-danger',
            };
        }

        if (equivalenceStatus === 'fail') {
            return {
                title: 'Revise a estrutura',
                description: 'Abra estratégia, teoria ou erros comuns para comparar a estrutura do modelo.',
                className: 'border-status-warning/25 bg-status-warning-soft/45 text-status-warning',
            };
        }

        if (revealedHintCount > 0) {
            return {
                title: 'Pista ativa',
                description: `Você já abriu ${revealedHintCount} pista(s). Tente aplicar a dica atual antes de revelar a próxima.`,
                className: 'border-status-info/25 bg-status-info-soft/45 text-status-info',
            };
        }

        return null;
    }, [equivalenceStatus, lastFailure, revealedHintCount]);

    const nextHint = normalizedHints[revealedHintCount] ?? null;
    const metadataBadges = useMemo(() => {
        if (!exercise?.metadata) return [];

        const badges = [patternLabel[exercise.metadata.pattern] ?? exercise.metadata.pattern];
        if (exercise.metadata.recommendation) {
            badges.push(recommendationLabel[exercise.metadata.recommendation]);
        }
        return badges;
    }, [exercise?.metadata]);

    useEffect(() => {
        setRevealedHintCount(0);
        setShowHints(false);
        setShowStrategy(false);
        setShowContext(false);
        setShowMistakes(false);
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
        <section data-testid="exercise-support-panel" className="border-y border-default bg-transparent">
            <div className="px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2 text-secondary">
                        <BookOpen size={15} className="shrink-0 text-ios-indigo" />
                        <div className="min-w-0 text-[11px] font-black uppercase tracking-[0.13em]">
                            Apoio de estudo
                        </div>
                    </div>
                    {normalizedHints.length > 0 && (
                        <span className="shrink-0 rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-secondary">
                            {revealedHintCount}/{normalizedHints.length} pistas
                        </span>
                    )}
                </div>

                {supportSummary && (
                    <div className={`mt-2 rounded-xl border px-3 py-2 ${supportSummary.className}`}>
                        <p className="text-[11px] font-black uppercase tracking-[0.12em]">{supportSummary.title}</p>
                        <p className="mt-1 text-xs leading-relaxed">{supportSummary.description}</p>
                    </div>
                )}
            </div>

            {normalizedHints.length > 0 && (
                <SupportSection
                    title="Dicas"
                    subtitle="Libere uma pista por vez."
                    badge={`${revealedHintCount}/${normalizedHints.length}`}
                    icon={<Lightbulb size={16} />}
                    iconClassName="text-status-warning"
                    isOpen={showHints}
                    onToggle={() => setShowHints((current) => !current)}
                >
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {nextHint && (
                                <button
                                    type="button"
                                    onClick={() => setRevealedHintCount((current) => Math.min(current + 1, normalizedHints.length))}
                                    className="rounded-full bg-ios-blue px-3 py-1.5 text-xs font-bold text-white transition-colors hover:opacity-90"
                                >
                                    Liberar pista {nextHint.level}
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
                        </div>

                        {revealedHintCount === 0 ? (
                            <p className="text-sm leading-relaxed text-secondary">
                                Nenhuma pista aberta ainda. Tente verificar sua solução antes de pedir ajuda.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {normalizedHints.slice(0, revealedHintCount).map((hint) => (
                                    <div key={hint.id} className="rounded-[18px] border border-status-warning/20 bg-status-warning-soft/35 px-3 py-3">
                                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-status-warning">
                                            Pista {hint.level}
                                        </p>
                                        <p className="mt-2 text-sm leading-relaxed text-primary">{hint.text}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {nextHint && (
                            <p className="text-xs leading-relaxed text-secondary">
                                Próxima pista disponível: {nextHint.level}.
                            </p>
                        )}
                    </div>
                </SupportSection>
            )}

            {exercise.estrategia && (
                <SupportSection
                    title="Estratégia"
                    subtitle="Resumo curto do caminho recomendado."
                    icon={<Brain size={16} />}
                    iconClassName="text-ios-blue"
                    isOpen={showStrategy}
                    onToggle={() => setShowStrategy((current) => !current)}
                >
                    <p className="text-sm leading-relaxed text-primary">{exercise.estrategia}</p>
                </SupportSection>
            )}

            {exercise.metadata && (
                <SupportSection
                    title="Contexto e teoria"
                    subtitle="Objetivo, pré-requisitos e trilha relacionada."
                    badge={relatedTheory.length > 0 ? `${relatedTheory.length} links` : undefined}
                    icon={<BookOpen size={16} />}
                    iconClassName="text-ios-indigo"
                    isOpen={showContext}
                    onToggle={() => setShowContext((current) => !current)}
                >
                    <div className="space-y-4">
                        {metadataBadges.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {metadataBadges.map((badge) => (
                                    <span key={badge} className="badge border-default bg-surface-muted text-secondary">
                                        {badge}
                                    </span>
                                ))}
                            </div>
                        )}

                        {exercise.metadata?.learningGoal && (
                            <div>
                                <p className="ui-kicker text-secondary">Objetivo</p>
                                <p className="mt-1 text-sm leading-relaxed text-primary">
                                    {exercise.metadata.learningGoal}
                                </p>
                            </div>
                        )}

                        {exercise.metadata?.prerequisites && exercise.metadata.prerequisites.length > 0 && (
                            <div>
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

                        {exercise.metadata?.theoryRefs && exercise.metadata.theoryRefs.length > 0 && (
                            <div>
                                <p className="ui-kicker text-secondary">Trilha associada</p>
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
                                                {resolvedReference?.label ?? reference}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </SupportSection>
            )}

            {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
                <SupportSection
                    title="Erros comuns"
                    subtitle="Pontos para revisar quando algo falhar."
                    badge={highlightedMistakeId ? 'Revisar' : undefined}
                    icon={<AlertTriangle size={16} />}
                    iconClassName="text-status-danger"
                    isOpen={showMistakes}
                    onToggle={() => setShowMistakes((current) => !current)}
                >
                    <div className="space-y-3">
                        {exercise.commonMistakes.map((mistake) => (
                            <div
                                key={mistake.id}
                                className={`rounded-[18px] border px-3 py-3 ${
                                    highlightedMistakeId === mistake.id
                                        ? 'border-status-danger/30 bg-status-danger-soft/45'
                                        : 'border-default/70 bg-surface-1/65'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <p className="text-sm font-semibold text-primary">{mistake.title}</p>
                                    {highlightedMistakeId === mistake.id && (
                                        <span className="surface-chip rounded-full border border-status-danger/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-status-danger dark:bg-black/10">
                                            Revise primeiro
                                        </span>
                                    )}
                                </div>
                                <p className="mt-2 text-sm leading-relaxed text-secondary">{mistake.symptom}</p>
                                <p className="mt-3 text-sm leading-relaxed text-primary">
                                    Como corrigir: {mistake.correction}
                                </p>
                            </div>
                        ))}
                    </div>
                </SupportSection>
            )}

            {exercise.guidedSolution && exercise.guidedSolution.length > 0 && (
                <SupportSection
                    title="Solução guiada"
                    subtitle="Etapas comentadas para comparar com a sua linha de raciocínio."
                    badge={`${exercise.guidedSolution.length} etapas`}
                    icon={<ArrowRight size={16} />}
                    iconClassName="text-ios-green"
                    isOpen={showGuidedSolution}
                    onToggle={() => setShowGuidedSolution((current) => !current)}
                >
                    <div className="space-y-3">
                        {exercise.guidedSolution.map((step, index) => (
                            <div key={step.id} className="rounded-[18px] border border-default/70 bg-surface-1/65 px-3 py-3">
                                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-ios-green">
                                    Etapa {index + 1}
                                </p>
                                <h3 className="mt-2 text-sm font-semibold text-primary">{step.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-secondary">{step.explanation}</p>
                                {step.expectedStudentAction && (
                                    <p className="mt-3 text-sm leading-relaxed text-primary">
                                        Ação esperada: {step.expectedStudentAction}
                                    </p>
                                )}
                                {step.checkpointQuestion && (
                                    <p className="mt-3 text-sm leading-relaxed text-ios-blue">
                                        Checkpoint: {step.checkpointQuestion}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </SupportSection>
            )}

            {(exercise.respostaTexto || exercise.respostaAutomato) && (
                <SupportSection
                    title="Gabarito final"
                    subtitle="Abra apenas para comparar com a sua solução."
                    icon={<CheckCircle2 size={16} />}
                    iconClassName="text-ios-indigo"
                    isOpen={showFinalAnswer}
                    onToggle={() => setShowFinalAnswer((current) => !current)}
                >
                    <div className="space-y-4">
                        {exercise.respostaTexto && (
                            <div className="rounded-[18px] border border-default/70 bg-surface-1/65 px-3 py-3">
                                <p className="whitespace-pre-line text-sm font-mono leading-relaxed text-primary">
                                    {exercise.respostaTexto}
                                </p>
                            </div>
                        )}

                        {exercise.respostaAutomato && (
                            <div className="rounded-[18px] border border-default/70 bg-surface-1/65 px-3 py-3">
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
                </SupportSection>
            )}
        </section>
    );
};
