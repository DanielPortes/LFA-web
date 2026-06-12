import React from 'react';
import { BookOpen, ChevronRight, Clock, ListFilter, Quote, Tag } from 'lucide-react';
import type { LessonObjective, LessonReference, LessonStatusType } from '../../types';

interface LessonHeaderProps {
    moduleIndex: number;
    moduleTitle: string;
    lessonTitle: string;
    lessonDescription: string;
    objectives?: LessonObjective[];
    prerequisites?: string[];
    keywords?: string[];
    estimatedMinutes?: number;
    references?: LessonReference[];
    status?: LessonStatusType;
    isSidebarOpen: boolean;
    sidebarId: string;
    onOpenSidebar: () => void;
}

const statusLabel: Record<LessonStatusType, string> = {
    draft: 'Rascunho',
    reviewed: 'Revisado',
    canonical: 'Canônico'
};

const getModuleDisplayLabel = (moduleTitle: string, moduleIndex: number): string => {
    const canonicalMatch = moduleTitle.match(/^Módulo\s+(\d+)/i);
    return canonicalMatch ? `Módulo ${canonicalMatch[1]}` : `Módulo ${moduleIndex}`;
};

const getModuleTrailLabel = (moduleTitle: string): string => (
    moduleTitle.replace(/^Módulo\s+\d+\s*:\s*/i, '').trim() || moduleTitle
);

export const LessonHeader: React.FC<LessonHeaderProps> = ({
    moduleIndex,
    moduleTitle,
    lessonTitle,
    lessonDescription,
    objectives = [],
    prerequisites = [],
    keywords = [],
    estimatedMinutes,
    references = [],
    status,
    isSidebarOpen,
    sidebarId,
    onOpenSidebar
}) => {
    const hasPedagogicalHeader = objectives.length > 0 || prerequisites.length > 0 || references.length > 0;
    const moduleDisplayLabel = getModuleDisplayLabel(moduleTitle, moduleIndex);
    const moduleTrailLabel = getModuleTrailLabel(moduleTitle);

    return (
        <header className="lesson-book-header mb-8 animate-fade-in p-5 md:p-6">
            <div className="mb-4 flex justify-end md:hidden">
                <button
                    onClick={onOpenSidebar}
                    className="rounded-xl border border-default bg-surface-2 p-2 text-secondary transition-all hover:border-ios-blue/40 hover:text-ios-blue"
                    aria-expanded={isSidebarOpen}
                    aria-controls={sidebarId}
                    aria-label="Abrir menu de conteúdo"
                >
                    <ListFilter size={18} />
                </button>
            </div>
            <div className="ui-kicker mb-4 flex flex-wrap items-center gap-2 text-secondary">
                <span className="surface-chip rounded-md border-default px-2 py-1 text-secondary">{moduleDisplayLabel}</span>
                <ChevronRight size={10} />
                <span className="text-ios-blue">{moduleTrailLabel}</span>
            </div>

            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <h1 className="ui-title-1 text-primary">
                    {lessonTitle}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                    {typeof estimatedMinutes === 'number' && (
                        <span className="badge gap-2 border-default bg-surface-muted text-secondary">
                            <Clock size={12} />
                            {estimatedMinutes} min
                        </span>
                    )}
                    {status && (
                        <span className="badge border-status-info bg-status-info-soft text-status-info">
                            {statusLabel[status]}
                        </span>
                    )}
                </div>
            </div>

            <div className="lesson-book-quote flex items-start gap-3 rounded-r-xl border-l-4 border-ios-blue/30 p-3 py-2 pl-5 text-base font-medium italic leading-relaxed text-secondary">
                <Quote className="mt-0.5 flex-shrink-0 text-muted" size={20} />
                {lessonDescription}
            </div>

            {keywords.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                    {keywords.map((keyword) => (
                        <span key={keyword} className="badge gap-2 border-default bg-surface-muted text-secondary">
                            <Tag size={12} />
                            {keyword}
                        </span>
                    ))}
                </div>
            )}

            {hasPedagogicalHeader && (
                <details className="mt-5 rounded-2xl border border-default bg-surface-muted/60 p-1">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-surface-hover">
                        <span>Objetivos, pré-requisitos e bibliografia</span>
                        <span className="rounded-full border border-default bg-surface-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-secondary">
                            apoio
                        </span>
                    </summary>
                    <div className="grid gap-4 border-t border-default px-4 py-4 xl:grid-cols-[minmax(0,1.2fr),minmax(0,1fr)]">
                        {objectives.length > 0 && (
                            <section className="lesson-header-panel rounded-2xl border border-default bg-surface-1/70 p-4">
                                <p className="ui-kicker text-ios-blue">Nesta lição você vai</p>
                                <ul className="mt-3 space-y-2 text-sm text-primary">
                                    {objectives.map((objective) => (
                                        <li key={objective.id} className="flex gap-2 leading-relaxed">
                                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ios-blue" />
                                            <span>{objective.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        <div className="space-y-4">
                            {prerequisites.length > 0 && (
                                <section className="lesson-header-panel rounded-2xl border border-default bg-surface-1/70 p-4">
                                    <p className="ui-kicker text-secondary">Pré-requisitos</p>
                                    <ul className="mt-3 space-y-2 text-sm text-primary">
                                        {prerequisites.map((prerequisite) => (
                                            <li key={prerequisite} className="flex gap-2 leading-relaxed">
                                                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ios-green" />
                                                <span>{prerequisite}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {references.length > 0 && (
                                <section className="lesson-header-panel rounded-2xl border border-default bg-surface-1/70 p-4">
                                    <div className="flex items-center gap-2 text-ios-indigo">
                                        <BookOpen size={16} />
                                        <p className="ui-kicker">Base bibliográfica</p>
                                    </div>
                                    <ul className="mt-3 space-y-3 text-sm text-primary">
                                        {references.map((reference) => (
                                            <li key={`${reference.id}-${reference.locator ?? reference.label}`}>
                                                <p className="font-semibold text-primary">{reference.label}</p>
                                                <p className="text-secondary">{reference.citation}</p>
                                                {reference.locator && (
                                                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-ios-indigo">
                                                        {reference.locator}
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                        </div>
                    </div>
                </details>
            )}
        </header>
    );
};
