import React from 'react';
import { Circle, CircleCheck, GraduationCap, RotateCcw } from 'lucide-react';
import type { CourseModule, Lesson } from '../../types';

interface LastVisitedLesson {
    moduleId: string;
    lesson: Lesson;
}

interface ContentSidebarProps {
    sidebarId: string;
    isSidebarOpen: boolean;
    progressPercent: number;
    onResetProgress: () => void;
    lastVisitedLesson: LastVisitedLesson | null;
    activeLessonId: string;
    onContinue: (moduleId: string, lessonId: string) => void;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    filteredModules: CourseModule[];
    isLessonCompleted: (lessonId: string) => boolean;
    onNavigate: (moduleId: string, lessonId: string) => void;
}

export const ContentSidebar: React.FC<ContentSidebarProps> = ({
    sidebarId,
    isSidebarOpen,
    progressPercent,
    onResetProgress,
    lastVisitedLesson,
    activeLessonId,
    onContinue,
    searchQuery,
    onSearchChange,
    filteredModules,
    isLessonCompleted,
    onNavigate
}) => (
    <aside
        id={sidebarId}
        className={`
            fixed md:relative top-[5.5rem] bottom-0 md:top-auto md:bottom-auto left-0 z-40 w-[88vw] max-w-[22rem]
            md:w-[22rem] md:max-w-[22rem] md:min-w-[22rem]
            ${isSidebarOpen ? 'bg-surface-1-95 backdrop-blur-2xl' : 'bg-transparent'}
            md:bg-transparent md:backdrop-blur-none
            border-r border-default md:border-r-0
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            flex flex-col md:self-start
        `}
    >
        <div className="render-lite-panel render-lite-shell glass-panel rounded-3xl min-w-0 flex flex-col overflow-hidden shadow-apple-md md:sticky md:top-0">
            <div className="sticky top-0 z-20 rounded-t-3xl border-b border-default bg-surface-1/80 p-6 backdrop-blur-md">
                <div className="mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-ios-green" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-secondary">Plataforma LFA</h2>
                </div>
                <div className="flex items-center gap-3 text-2xl font-bold text-primary">
                    <GraduationCap size={28} className="text-ios-blue" />
                    Trilha de LFA
                </div>

                <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="font-medium text-secondary">Progresso</span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-ios-green">{progressPercent}%</span>
                            <button
                                onClick={onResetProgress}
                                className="p-1 text-secondary transition-colors hover:text-ios-red"
                                title="Resetar progresso"
                                aria-label="Resetar progresso"
                            >
                                <RotateCcw size={12} />
                            </button>
                        </div>
                    </div>
                    <div className="surface-track h-2.5 overflow-hidden rounded-full border border-black/5 shadow-inner dark:border-white/5">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-ios-green via-emerald-500 to-ios-teal transition-all duration-500 shadow-[0_0_10px_rgba(52,199,89,0.4)]"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {lastVisitedLesson && lastVisitedLesson.lesson.id !== activeLessonId && (
                    <button
                        onClick={() => onContinue(lastVisitedLesson.moduleId, lastVisitedLesson.lesson.id)}
                        className="mt-4 w-full rounded-xl border border-status-info bg-status-info-soft py-2 text-xs font-bold text-status-info transition-colors hover:bg-ios-blue hover:text-white"
                    >
                        Continuar de onde parei
                    </button>
                )}

                <div className="mt-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Buscar conceito, teorema, algoritmo ou símbolo formal..."
                        aria-label="Buscar conceito na trilha"
                        className="w-full rounded-xl border border-default bg-surface-2 px-3 py-2 text-sm font-medium text-primary shadow-inner outline-none ring-ios-blue/40 focus:ring-2"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 pb-6 custom-scrollbar md:overflow-visible">
                {filteredModules.map((module, modIdx) => (
                    <div key={module.id} className="mb-6 last:mb-0">
                        <div className="sticky top-0 z-10 flex items-center gap-3 rounded-lg border-b border-transparent bg-surface-1/90 px-4 py-3 backdrop-blur">
                            <span className="surface-chip flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border-default font-mono text-xs font-bold text-secondary">
                                {modIdx + 1}
                            </span>
                            <h3 className="text-sm font-bold leading-tight text-primary">
                                {module.title.replace(/^Módulo \d+: /, '')}
                            </h3>
                        </div>

                        <div className="relative mt-1 space-y-1 px-2">
                            <div className="absolute left-7 top-2 bottom-2 -z-10 w-px bg-border"></div>

                            {module.lessons.map((lesson) => {
                                const isActive = lesson.id === activeLessonId;
                                const completed = isLessonCompleted(lesson.id);

                                return (
                                    <button
                                        key={lesson.id}
                                        onClick={() => onNavigate(module.id, lesson.id)}
                                        className={`group relative flex w-full items-start gap-2 overflow-hidden rounded-xl pl-10 pr-4 py-3 text-left text-sm font-medium transition-all duration-200
                                            ${isActive
                                                ? 'bg-status-info-soft font-bold text-status-info shadow-sm'
                                                : 'text-secondary hover:bg-surface-hover hover:text-primary'
                                            }`}
                                    >
                                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-ios-blue"></div>}
                                        <span className="flex-1 py-0.5 leading-snug">{lesson.title}</span>
                                        {completed ? (
                                            <CircleCheck size={14} strokeWidth={3} className="mt-1 flex-shrink-0 text-ios-green" />
                                        ) : (
                                            <Circle size={14} className="mt-1 flex-shrink-0 text-secondary opacity-0 transition-opacity group-hover:opacity-100" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {filteredModules.length === 0 && (
                    <div className="px-4 py-6 text-xs text-muted">
                        Nenhuma lição encontrada para essa busca.
                    </div>
                )}
            </div>
        </div>
    </aside>
);
