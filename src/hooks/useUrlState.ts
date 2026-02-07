import { useCallback, useMemo } from 'react';
import { useRouteState } from '../features/navigation';
import type { Tab } from '../types';

type UrlUpdates = Record<string, string | number | null | undefined>;

export interface ContentSelection {
    moduleId?: string;
    lessonId?: string;
}

export interface ExerciseSelection {
    categoryId?: string;
    exerciseId: number | null;
}

export const useUrlState = () => {
    const { route, updateRoute } = useRouteState();

    const setActiveTab = useCallback((tab: Tab) => {
        updateRoute({ tab });
    }, [updateRoute]);

    const contentSelection = useMemo<ContentSelection>(() => ({
        moduleId: route.moduleId,
        lessonId: route.lessonId
    }), [route.moduleId, route.lessonId]);

    const setContentSelection = useCallback((selection: ContentSelection) => {
        updateRoute({
            tab: 'conteudo',
            moduleId: selection.moduleId ?? null,
            lessonId: selection.lessonId ?? null
        });
    }, [updateRoute]);

    const exerciseSelection = useMemo<ExerciseSelection>(() => ({
        categoryId: route.categoryId,
        exerciseId: route.exerciseId
    }), [route.categoryId, route.exerciseId]);

    const setExerciseSelection = useCallback((selection: ExerciseSelection) => {
        updateRoute({
            tab: 'exercicios',
            categoryId: selection.categoryId ?? null,
            exerciseId: selection.exerciseId
        });
    }, [updateRoute]);

    const updateUrl = useCallback((updates: UrlUpdates, replace = false) => {
        updateRoute({
            tab: updates.tab as Tab | undefined,
            moduleId: updates.module === undefined ? undefined : updates.module as string | null,
            lessonId: updates.lesson === undefined ? undefined : updates.lesson as string | null,
            categoryId: updates.cat === undefined ? undefined : updates.cat as string | null,
            exerciseId: updates.ex === undefined ? undefined : (updates.ex as number | null),
            layout: updates.layout === undefined ? undefined : updates.layout as 'bottom' | 'side' | 'top_side' | null
        }, { replace });
    }, [updateRoute]);

    return {
        activeTab: route.tab,
        setActiveTab,
        contentSelection,
        setContentSelection,
        exerciseSelection,
        setExerciseSelection,
        updateUrl
    };
};
