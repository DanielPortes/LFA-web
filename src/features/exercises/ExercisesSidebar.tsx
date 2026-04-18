import React from 'react';
import { ListFilter, RotateCcw, ChevronRight } from 'lucide-react';

interface ExercisesSidebarItem {
    id: string;
    label: string;
    index: number;
    total: number;
    completed: number;
}

interface ExercisesSidebarProps {
    sidebarId: string;
    isSidebarOpen: boolean;
    searchInputId: string;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    progressPercent: number;
    completedExercisesCount: number;
    totalExercisesCount: number;
    onResetExercises: () => void;
    items: ExercisesSidebarItem[];
    activeCategory: string;
    onSelectCategory: (categoryId: string) => void;
}

export const ExercisesSidebar: React.FC<ExercisesSidebarProps> = ({
    sidebarId,
    isSidebarOpen,
    searchInputId,
    searchQuery,
    onSearchChange,
    progressPercent,
    completedExercisesCount,
    totalExercisesCount,
    onResetExercises,
    items,
    activeCategory,
    onSelectCategory
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
        <div className="render-lite-panel glass-panel min-w-0 rounded-3xl flex flex-col overflow-hidden shadow-apple-md md:sticky md:top-0">
            <div className="sticky top-0 z-10 rounded-t-3xl border-b border-default bg-surface-1 p-6 backdrop-blur-md">
                <div className="mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-ios-green" />
                    <span className="ui-kicker-xs text-secondary">DCC063 • Prática</span>
                </div>
                <div className="flex items-center gap-3 text-2xl font-bold text-primary">
                    <ListFilter size={24} className="text-ios-blue" />
                    Sumário
                </div>

                <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="font-medium text-secondary">Progresso</span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-ios-green">{progressPercent}%</span>
                            <button
                                onClick={onResetExercises}
                                className="p-1 text-secondary transition-colors hover:text-ios-red"
                                title="Resetar progresso de exercícios"
                                aria-label="Resetar progresso de exercícios"
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
                    <div className="mt-2 text-xs text-secondary">
                        {completedExercisesCount}/{totalExercisesCount} exercícios concluídos
                    </div>
                </div>

                <div className="mt-4">
                    <label className="sr-only" htmlFor={searchInputId}>Buscar exercício</label>
                    <input
                        id={searchInputId}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Buscar exercício..."
                        aria-label="Buscar exercício"
                        className="w-full rounded-xl border border-default bg-surface-2 px-3 py-2 text-sm font-medium text-primary shadow-inner outline-none ring-ios-blue/40 focus:ring-2"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 pb-6 custom-scrollbar md:overflow-visible">
                {items.map((item) => {
                    const isActive = activeCategory === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onSelectCategory(item.id)}
                            className={`group relative mb-1 flex w-full items-center gap-3 overflow-hidden rounded-xl pl-3 pr-3 py-3 text-left text-sm font-medium transition-all duration-200
                                ${isActive
                                    ? 'border border-status-info bg-status-info-soft text-status-info shadow-sm'
                                    : 'border border-transparent text-secondary hover:bg-surface-hover hover:text-primary'
                                }`}
                        >
                            <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold
                                ${isActive ? 'bg-ios-blue text-white' : 'surface-chip border border-default text-secondary'}`}>
                                {item.index + 1}
                            </span>
                            <span className="flex-1 truncate">{item.label}</span>
                            <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${
                                isActive
                                    ? 'border-ios-blue/30 bg-ios-blue/10 text-ios-blue'
                                    : 'border-default bg-surface-2 text-secondary'
                            }`}>
                                {item.completed}/{item.total}
                            </span>
                            {isActive && <ChevronRight size={14} className="opacity-80" />}
                        </button>
                    );
                })}

                {items.length === 0 && (
                    <div className="p-4 text-center text-xs italic text-secondary">
                        Nenhuma categoria encontrada
                    </div>
                )}
            </div>
        </div>
    </aside>
);
