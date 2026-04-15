import { useCallback, useEffect, useRef, useState } from 'react';
import type { AutomatoData } from '../../../types';
import type { CanvasSelection } from './types';

interface UseCanvasViewportOptions {
    data: AutomatoData;
    zoom: number;
    externalPan?: { x: number; y: number };
    onPanChange?: (pan: { x: number; y: number }) => void;
    onZoomChange?: (zoom: number) => void;
    onTransformChange?: (zoom: number, pan: { x: number; y: number }) => void;
    onFitToContent?: () => void;
    focusStateId?: string | null;
    onFocusHandled?: () => void;
    svgRef: React.RefObject<SVGSVGElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onFocusState: (selection: CanvasSelection) => void;
}

export const useCanvasViewport = ({
    data,
    zoom,
    externalPan,
    onPanChange,
    onZoomChange,
    onTransformChange,
    onFitToContent,
    focusStateId,
    onFocusHandled,
    svgRef,
    containerRef,
    onFocusState,
}: UseCanvasViewportOptions) => {
    const [pan, setPanInternal] = useState({ x: 0, y: 0 });
    const currentPan = externalPan ?? pan;

    const onPanChangeRef = useRef(onPanChange);
    const onZoomChangeRef = useRef(onZoomChange);
    const onTransformChangeRef = useRef(onTransformChange);
    const onFitToContentRef = useRef(onFitToContent);
    const onFocusHandledRef = useRef(onFocusHandled);
    const zoomRef = useRef(zoom);
    const panRef = useRef(currentPan);

    useEffect(() => { onPanChangeRef.current = onPanChange; }, [onPanChange]);
    useEffect(() => { onZoomChangeRef.current = onZoomChange; }, [onZoomChange]);
    useEffect(() => { onTransformChangeRef.current = onTransformChange; }, [onTransformChange]);
    useEffect(() => { onFitToContentRef.current = onFitToContent; }, [onFitToContent]);
    useEffect(() => { onFocusHandledRef.current = onFocusHandled; }, [onFocusHandled]);
    useEffect(() => { zoomRef.current = zoom; }, [zoom]);
    useEffect(() => { panRef.current = currentPan; }, [currentPan]);

    const setPan = useCallback((nextPan: { x: number; y: number }) => {
        if (onPanChangeRef.current) {
            onPanChangeRef.current(nextPan);
            return;
        }
        setPanInternal(nextPan);
    }, []);

    const resetViewport = useCallback(() => {
        if (onFitToContentRef.current) {
            onFitToContentRef.current();
            return;
        }
        onZoomChangeRef.current?.(1);
        setPan({ x: 0, y: 0 });
    }, [setPan]);

    const hasAutoFitRef = useRef(false);
    const stateCountRef = useRef(0);
    const stateIdsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const previousCount = stateCountRef.current;
        const currentCount = data.estados.length;
        const previousIds = stateIdsRef.current;
        const currentIds = new Set(data.estados.map((state) => state.id));
        const overlapCount = [...currentIds].filter((id) => previousIds.has(id)).length;
        const overlapRatio = previousCount > 0
            ? overlapCount / Math.max(previousCount, currentCount || 1)
            : 0;
        const replacedMostStates = previousCount > 0 && currentCount > 0 && overlapRatio < 0.35;

        stateCountRef.current = currentCount;
        stateIdsRef.current = currentIds;

        if (currentCount === 0) {
            hasAutoFitRef.current = false;
            return;
        }

        if (!svgRef.current) return;

        const isInitialLoad = previousCount === 0 && currentCount > 0;
        const isDefaultView = Math.abs(currentPan.x) < 0.5
            && Math.abs(currentPan.y) < 0.5
            && Math.abs(zoom - 1) < 0.001;

        if (replacedMostStates) {
            hasAutoFitRef.current = false;
        }

        if (!hasAutoFitRef.current && isDefaultView && (isInitialLoad || replacedMostStates)) {
            hasAutoFitRef.current = true;
            onFitToContentRef.current?.();
        }
    }, [currentPan.x, currentPan.y, data.estados, svgRef, zoom]);

    const focusHandledRef = useRef<string | null>(null);

    useEffect(() => {
        if (!focusStateId) {
            focusHandledRef.current = null;
            return;
        }

        if (focusHandledRef.current === focusStateId) return;

        const target = data.estados.find((state) => state.id === focusStateId);
        if (!target) return;

        focusHandledRef.current = focusStateId;
        onFocusState({ type: 'state', id: target.id });

        if (svgRef.current) {
            const rect = svgRef.current.getBoundingClientRect();
            const nextPan = {
                x: rect.width / 2 - target.x * zoom,
                y: rect.height / 2 - target.y * zoom,
            };
            const currentPanValue = panRef.current;
            const panDelta = Math.abs(currentPanValue.x - nextPan.x) + Math.abs(currentPanValue.y - nextPan.y);

            if (panDelta > 1) {
                setPan(nextPan);
            }
        }

        onFocusHandledRef.current?.();
    }, [data.estados, focusStateId, onFocusState, setPan, svgRef, zoom]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return undefined;

        const handleWheel = (event: WheelEvent) => {
            event.preventDefault();
            event.stopPropagation();

            const rect = container.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            const currentZoom = zoomRef.current;
            const currentPanValue = panRef.current;
            const worldX = (mouseX - currentPanValue.x) / currentZoom;
            const worldY = (mouseY - currentPanValue.y) / currentZoom;
            const scaleFactor = Math.exp(-event.deltaY * 0.002);

            let nextZoom = currentZoom * scaleFactor;
            nextZoom = Math.max(0.25, Math.min(4, nextZoom));

            if (Math.abs(nextZoom - currentZoom) < 0.001) return;

            const nextPan = {
                x: mouseX - worldX * nextZoom,
                y: mouseY - worldY * nextZoom,
            };

            if (onTransformChangeRef.current) {
                onTransformChangeRef.current(nextZoom, nextPan);
                return;
            }

            onZoomChangeRef.current?.(nextZoom);
            setPan(nextPan);
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [containerRef, setPan]);

    return {
        currentPan,
        onFitToContentRef,
        onZoomChangeRef,
        panRef,
        resetViewport,
        setPan,
        zoomRef,
    };
};
