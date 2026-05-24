import React from 'react';
import { ChevronDown, ChevronRight, ChevronUp, ListFilter, RotateCcw } from 'lucide-react';
import type { ExerciseSearchResultPreview } from './useExerciseSelection';

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
    onSearchSubmit: () => void;
    onMoveSearchResult: (delta: number) => void;
    firstSearchResult: ExerciseSearchResultPreview | null;
    activeSearchResult: ExerciseSearchResultPreview | null;
    searchResultPosition: { current: number; total: number } | null;
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
    onSearchSubmit,
    onMoveSearchResult,
    firstSearchResult,
    activeSearchResult,
    searchResultPosition,
    progressPercent,
    completedExercisesCount,
    totalExercisesCount,
    onResetExercises,
    items,
    activeCategory,
    onSelectCategory
}) => {
    const trimmedSearch = searchQuery.trim();
    const visibleSearchResult = activeSearchResult ?? firstSearchResult;
    const canMoveSearchResult = (searchResultPosition?.total ?? 0) > 1;
    const resultCountLabel = searchResultPosition
        ? `${searchResultPosition.current}/${searchResultPosition.total}`
        : '0';
    const searchTargetKey = visibleSearchResult
        ? `${visibleSearchResult.categoryId}-${visibleSearchResult.exerciseId ?? 'categoria'}-${searchResultPosition?.current ?? 0}`
        : `empty-${trimmedSearch}`;
    const searchTargetLabel = visibleSearchResult
        ? visibleSearchResult.exerciseId === null
            ? `filtra: ${visibleSearchResult.categoryLabel}`
            : `filtra: Exercício ${visibleSearchResult.exerciseId} · ${visibleSearchResult.categoryLabel}`
        : 'Sem resultado para filtrar';

    return (
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
                                type="button"
                                onClick={onResetExercises}
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-surface-hover hover:text-ios-red"
                                title="Resetar progresso de exercícios"
                                aria-label="Resetar progresso de exercícios"
                            >
                                <RotateCcw size={15} />
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
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                onSearchSubmit();
                                return;
                            }
                            if (event.key === 'ArrowDown') {
                                event.preventDefault();
                                onMoveSearchResult(1);
                                return;
                            }
                            if (event.key === 'ArrowUp') {
                                event.preventDefault();
                                onMoveSearchResult(-1);
                            }
                        }}
                        placeholder="Buscar exercício..."
                        aria-label="Buscar exercício"
                        className="w-full rounded-xl border border-default bg-surface-2 px-3 py-2 text-sm font-medium text-primary shadow-inner outline-none ring-ios-blue/40 focus:ring-2"
                    />
                    {trimmedSearch && (
                        <div
                            key={searchTargetKey}
                            className={`search-target-shell mt-2 flex min-w-0 items-center gap-1.5 rounded-xl border px-2 py-1.5 text-xs shadow-inner ${
                                visibleSearchResult
                                    ? 'border-ios-blue/20 bg-ios-blue/10'
                                    : 'border-default bg-surface-2'
                            }`}
                            aria-live="polite"
                        >
                            <span className="flex h-6 flex-shrink-0 items-center rounded-lg border border-ios-blue/25 bg-surface-1 px-2 font-black uppercase text-ios-blue">
                                Enter
                            </span>
                            <span className="search-target-copy min-w-0 flex-1 truncate font-medium text-secondary">
                                {searchTargetLabel}
                            </span>
                            <span className="search-target-count flex h-6 flex-shrink-0 items-center rounded-lg border border-default bg-surface-1 px-2 font-mono font-bold text-secondary">
                                {resultCountLabel}
                            </span>
                            <button
                                type="button"
                                onClick={() => onMoveSearchResult(-1)}
                                disabled={!canMoveSearchResult}
                                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-surface-hover hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
                                title="Resultado anterior"
                                aria-label="Resultado anterior da busca"
                            >
                                <ChevronUp size={14} />
                            </button>
                            <button
                                type="button"
                                onClick={() => onMoveSearchResult(1)}
                                disabled={!canMoveSearchResult}
                                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-surface-hover hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
                                title="Próximo resultado"
                                aria-label="Próximo resultado da busca"
                            >
                                <ChevronDown size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 pb-6 custom-scrollbar md:overflow-visible">
                {items.map((item) => {
                    const isActive = activeCategory === item.id;
                    const isEnterTarget = visibleSearchResult?.categoryId === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onSelectCategory(item.id)}
                            className={`group relative mb-1 flex w-full items-center gap-3 overflow-hidden rounded-xl pl-3 pr-3 py-3 text-left text-sm font-medium transition-all duration-200
                                ${isActive
                                    ? 'border border-status-info bg-status-info-soft text-status-info shadow-sm'
                                    : isEnterTarget
                                        ? 'search-target-row border border-transparent text-primary'
                                    : 'border border-transparent text-secondary hover:bg-surface-hover hover:text-primary'
                                }`}
                        >
                            <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold
                                ${isActive ? 'bg-ios-blue text-white' : 'surface-chip border border-default text-secondary'}`}>
                                {item.index + 1}
                            </span>
                            <span className="flex-1 truncate">{item.label}</span>
                            {isEnterTarget && (
                                <span className="search-target-badge flex-shrink-0 rounded-full border border-ios-blue/25 bg-ios-blue/10 px-2 py-0.5 text-[0.65rem] font-black uppercase text-ios-blue">
                                    alvo
                                </span>
                            )}
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
                        Nenhuma categoria encontrada para esta busca.
                    </div>
                )}
            </div>
        </div>
    </aside>
    );
};
