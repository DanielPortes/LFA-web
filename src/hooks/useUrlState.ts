import { useCallback, useEffect, useMemo, useState } from 'react';
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

const TAB_VALUES: Tab[] = ['home', 'conteudo', 'exercicios', 'simulador'];

const isTab = (value: string | null): value is Tab =>
    value !== null && TAB_VALUES.includes(value as Tab);

const readUrlState = () => {
    const params = new URLSearchParams(window.location.search);
    const tab = isTab(params.get('tab')) ? (params.get('tab') as Tab) : undefined;
    const moduleId = params.get('module') || undefined;
    const lessonId = params.get('lesson') || undefined;
    const categoryId = params.get('cat') || undefined;
    const exerciseIdParam = params.get('ex');
    const exerciseId = exerciseIdParam ? Number(exerciseIdParam) : null;
    return {
        tab,
        moduleId,
        lessonId,
        categoryId,
        exerciseId: Number.isNaN(exerciseId) ? null : exerciseId
    };
};

export const useUrlState = () => {
    const initialState = useMemo(() => readUrlState(), []);
    const [activeTab, setActiveTab] = useState<Tab>(initialState.tab ?? 'home');
    const [contentSelection, setContentSelection] = useState<ContentSelection>({
        moduleId: initialState.moduleId,
        lessonId: initialState.lessonId
    });
    const [exerciseSelection, setExerciseSelection] = useState<ExerciseSelection>({
        categoryId: initialState.categoryId,
        exerciseId: initialState.exerciseId
    });

    const updateUrl = useCallback((updates: UrlUpdates, replace = false) => {
        const params = new URLSearchParams(window.location.search);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }
        });
        const query = params.toString();
        const hash = window.location.hash || '';
        const nextUrl = query ? `${window.location.pathname}?${query}${hash}` : `${window.location.pathname}${hash}`;
        const currentUrl = `${window.location.pathname}${window.location.search}${hash}`;
        if (nextUrl === currentUrl) return;
        if (replace) {
            window.history.replaceState({}, document.title, nextUrl);
        } else {
            window.history.pushState({}, document.title, nextUrl);
        }
    }, []);

    const applyUrlState = useCallback(() => {
        const { tab, moduleId, lessonId, categoryId, exerciseId } = readUrlState();
        if (tab) {
            setActiveTab(prev => (prev === tab ? prev : tab));
        }
        setContentSelection(prev => (
            prev.moduleId === moduleId && prev.lessonId === lessonId
                ? prev
                : { moduleId, lessonId }
        ));
        setExerciseSelection(prev => (
            prev.categoryId === categoryId && prev.exerciseId === exerciseId
                ? prev
                : { categoryId, exerciseId }
        ));
    }, []);

    useEffect(() => {
        applyUrlState();
        const handlePop = () => applyUrlState();
        window.addEventListener('popstate', handlePop);
        return () => window.removeEventListener('popstate', handlePop);
    }, [applyUrlState]);

    return {
        activeTab,
        setActiveTab,
        contentSelection,
        setContentSelection,
        exerciseSelection,
        setExerciseSelection,
        updateUrl
    };
};
