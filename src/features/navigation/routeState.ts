import type { Tab } from '../../types';
import type { SimulatorLayout } from '../simulator/types';

export interface RouteState {
    tab: Tab;
    moduleId?: string;
    lessonId?: string;
    categoryId?: string;
    exerciseId: number | null;
    layout?: SimulatorLayout;
}

export interface RoutePatch {
    tab?: Tab | null;
    moduleId?: string | null;
    lessonId?: string | null;
    categoryId?: string | null;
    exerciseId?: number | null;
    layout?: SimulatorLayout | null;
}

const VALID_TABS: Tab[] = ['home', 'conteudo', 'exercicios', 'simulador'];
const VALID_LAYOUTS: SimulatorLayout[] = ['bottom', 'side', 'top_side'];

const isTab = (value: string | null): value is Tab =>
    value !== null && VALID_TABS.includes(value as Tab);

const isLayout = (value: string | null): value is SimulatorLayout =>
    value !== null && VALID_LAYOUTS.includes(value as SimulatorLayout);

const parseExerciseId = (value: string | null): number | null => {
    if (value === null) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

export const normalizeRouteState = (route: Partial<RouteState>): RouteState => {
    const normalized: RouteState = {
        tab: route.tab ?? 'home',
        moduleId: route.moduleId,
        lessonId: route.lessonId,
        categoryId: route.categoryId,
        exerciseId: route.exerciseId ?? null,
        layout: route.layout
    };

    if (normalized.tab !== 'conteudo') {
        normalized.moduleId = undefined;
        normalized.lessonId = undefined;
    }

    if (normalized.tab !== 'exercicios') {
        normalized.categoryId = undefined;
        normalized.exerciseId = null;
    }

    return normalized;
};

export const parseRouteState = (search: string): RouteState => {
    const params = new URLSearchParams(search);
    const hasSharedAutomaton = params.has('automaton');

    const parsedTab = isTab(params.get('tab')) ? (params.get('tab') as Tab) : undefined;
    const tab = hasSharedAutomaton ? 'simulador' : (parsedTab ?? 'home');

    return normalizeRouteState({
        tab,
        moduleId: params.get('module') || undefined,
        lessonId: params.get('lesson') || undefined,
        categoryId: params.get('cat') || undefined,
        exerciseId: parseExerciseId(params.get('ex')),
        layout: isLayout(params.get('layout')) ? (params.get('layout') as SimulatorLayout) : undefined
    });
};

export const serializeRouteState = (
    route: RouteState,
    options: { stripAutomaton?: boolean } = {}
): string => {
    const params = new URLSearchParams();
    const normalized = normalizeRouteState(route);

    params.set('tab', normalized.tab);

    if (normalized.moduleId) params.set('module', normalized.moduleId);
    if (normalized.lessonId) params.set('lesson', normalized.lessonId);
    if (normalized.categoryId) params.set('cat', normalized.categoryId);
    if (typeof normalized.exerciseId === 'number') params.set('ex', String(normalized.exerciseId));
    if (normalized.layout) params.set('layout', normalized.layout);

    if (options.stripAutomaton) {
        params.delete('automaton');
    }

    return params.toString();
};

export const mergeRouteState = (current: RouteState, patch: RoutePatch): RouteState => {
    const merged: Partial<RouteState> = {
        ...current,
        tab: patch.tab === null ? undefined : patch.tab ?? current.tab,
        moduleId: patch.moduleId === null ? undefined : patch.moduleId ?? current.moduleId,
        lessonId: patch.lessonId === null ? undefined : patch.lessonId ?? current.lessonId,
        categoryId: patch.categoryId === null ? undefined : patch.categoryId ?? current.categoryId,
        exerciseId: patch.exerciseId === undefined ? current.exerciseId : patch.exerciseId,
        layout: patch.layout === null ? undefined : patch.layout ?? current.layout
    };

    return normalizeRouteState(merged);
};

export const areRouteStatesEqual = (a: RouteState, b: RouteState): boolean =>
    a.tab === b.tab
    && a.moduleId === b.moduleId
    && a.lessonId === b.lessonId
    && a.categoryId === b.categoryId
    && a.exerciseId === b.exerciseId
    && a.layout === b.layout;
