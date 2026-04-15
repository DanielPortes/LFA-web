import React from 'react';
import { ChevronRight, ListFilter, Quote } from 'lucide-react';

interface LessonHeaderProps {
    moduleIndex: number;
    moduleTitle: string;
    lessonTitle: string;
    lessonDescription: string;
    isSidebarOpen: boolean;
    sidebarId: string;
    onOpenSidebar: () => void;
}

export const LessonHeader: React.FC<LessonHeaderProps> = ({
    moduleIndex,
    moduleTitle,
    lessonTitle,
    lessonDescription,
    isSidebarOpen,
    sidebarId,
    onOpenSidebar
}) => (
    <header className="mb-12 animate-fade-in glass-card p-6 md:p-8">
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
        <div className="ui-kicker mb-6 flex flex-wrap items-center gap-2 text-secondary">
            <span className="rounded-md bg-black/5 px-2 py-1 dark:bg-white/10">Módulo {moduleIndex}</span>
            <ChevronRight size={10} />
            <span className="text-ios-blue">{moduleTitle}</span>
        </div>

        <h1 className="ui-title-1 mb-6 text-primary">
            {lessonTitle}
        </h1>

        <div className="glass-card flex items-start gap-4 rounded-r-xl border-l-4 border-ios-blue/30 p-4 py-2 pl-6 ui-body-lg font-medium italic text-secondary">
            <Quote className="flex-shrink-0 text-muted" size={24} />
            {lessonDescription}
        </div>
    </header>
);
