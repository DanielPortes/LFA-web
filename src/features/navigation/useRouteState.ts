import { useCallback, useEffect, useRef, useState } from 'react';
import {
    areRouteStatesEqual,
    mergeRouteState,
    parseRouteState,
    serializeRouteState,
    type RoutePatch,
    type RouteState
} from './routeState';

interface UpdateRouteOptions {
    replace?: boolean;
    stripAutomaton?: boolean;
}

const buildUrl = (search: string) => {
    const query = search ? `?${search}` : '';
    const hash = window.location.hash || '';
    return `${window.location.pathname}${query}${hash}`;
};

export const useRouteState = () => {
    const [route, setRoute] = useState<RouteState>(() => parseRouteState(window.location.search));
    const routeRef = useRef(route);

    useEffect(() => {
        routeRef.current = route;
    }, [route]);

    const applyRoute = useCallback((next: RouteState, options: UpdateRouteOptions = {}) => {
        const nextSearch = serializeRouteState(next, { stripAutomaton: options.stripAutomaton });
        const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash || ''}`;
        const nextUrl = buildUrl(nextSearch);

        if (nextUrl !== currentUrl) {
            const method = options.replace ? 'replaceState' : 'pushState';
            window.history[method]({}, document.title, nextUrl);
        }

        setRoute(prev => (areRouteStatesEqual(prev, next) ? prev : next));
    }, []);

    const updateRoute = useCallback((patch: RoutePatch, options: UpdateRouteOptions = {}) => {
        const next = mergeRouteState(routeRef.current, patch);
        applyRoute(next, options);
    }, [applyRoute]);

    const setRouteState = useCallback((next: RouteState, options: UpdateRouteOptions = {}) => {
        applyRoute(next, options);
    }, [applyRoute]);

    useEffect(() => {
        const handlePop = () => {
            const parsed = parseRouteState(window.location.search);
            setRoute(prev => (areRouteStatesEqual(prev, parsed) ? prev : parsed));
        };

        window.addEventListener('popstate', handlePop);
        return () => window.removeEventListener('popstate', handlePop);
    }, []);

    return {
        route,
        updateRoute,
        setRouteState
    };
};
