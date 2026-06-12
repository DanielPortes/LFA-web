import { useState, useRef, useEffect, useCallback } from 'react';
import type { RefObject } from 'react';
import type { Estado } from '../../../types';
import type { EditorViewState, EditorViewport } from './types';

interface UseEditorViewportOptions {
    canvasRef: RefObject<SVGSVGElement | null>;
    states: Estado[];
    viewState?: EditorViewState;
    onViewStateChange?: (zoom: number, pan: { x: number; y: number }) => void;
    fitRequestToken?: number;
}

const DEFAULT_VIEWPORT: EditorViewport = { x: 0, y: 0, width: 800, height: 600 };
const DEFAULT_PAN = { x: 0, y: 0 };
const FIT_STATE_RADIUS = 56;

export const useEditorViewport = ({
    canvasRef,
    states,
    viewState,
    onViewStateChange,
    fitRequestToken,
}: UseEditorViewportOptions) => {
    const [internalZoom, setInternalZoom] = useState(1);
    const [internalPan, setInternalPan] = useState(DEFAULT_PAN);
    const [viewport, setViewport] = useState<EditorViewport>(DEFAULT_VIEWPORT);

    const zoom = viewState?.zoom ?? internalZoom;
    const pan = viewState?.pan ?? internalPan;

    const zoomRef = useRef(zoom);
    const panRef = useRef(pan);
    const statesRef = useRef(states);
    const viewportRef = useRef(viewport);
    const onViewStateChangeRef = useRef(onViewStateChange);
    const lastFitRequestRef = useRef<number | undefined>(undefined);
    const lastFitTransformRef = useRef<{ zoom: number; pan: { x: number; y: number } } | null>(null);

    useEffect(() => {
        zoomRef.current = zoom;
    }, [zoom]);

    useEffect(() => {
        panRef.current = pan;
    }, [pan]);

    useEffect(() => {
        statesRef.current = states;
    }, [states]);

    useEffect(() => {
        viewportRef.current = viewport;
    }, [viewport]);

    useEffect(() => {
        onViewStateChangeRef.current = onViewStateChange;
    }, [onViewStateChange]);

    const handleZoomChange = useCallback((newZoom: number | ((prev: number) => number)) => {
        const currentZoom = zoomRef.current;
        const currentPan = panRef.current;
        const nextZoom = typeof newZoom === 'function' ? newZoom(currentZoom) : newZoom;

        if (Math.abs(nextZoom - currentZoom) < 0.001) return;

        if (onViewStateChangeRef.current) {
            onViewStateChangeRef.current(nextZoom, currentPan);
            return;
        }

        setInternalZoom(nextZoom);
    }, []);

    const handlePanChange = useCallback((newPan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => {
        const currentZoom = zoomRef.current;
        const currentPan = panRef.current;
        const nextPan = typeof newPan === 'function' ? newPan(currentPan) : newPan;
        const panDelta = Math.abs(nextPan.x - currentPan.x) + Math.abs(nextPan.y - currentPan.y);

        if (panDelta < 0.5) return;

        if (onViewStateChangeRef.current) {
            onViewStateChangeRef.current(currentZoom, nextPan);
            return;
        }

        setInternalPan(nextPan);
    }, []);

    const handleTransformChange = useCallback((newZoom: number, newPan: { x: number; y: number }) => {
        if (onViewStateChangeRef.current) {
            onViewStateChangeRef.current(newZoom, newPan);
            return;
        }

        setInternalZoom(newZoom);
        setInternalPan(newPan);
    }, []);

    const calculateFitTransform = useCallback((inputStates: Estado[]) => {
        if (inputStates.length === 0) {
            return { zoom: 1, pan: DEFAULT_PAN };
        }

        const rect = canvasRef.current?.getBoundingClientRect();
        const currentViewport = viewportRef.current;
        const viewWidth = Math.max(rect?.width || currentViewport.width || 800, 320);
        const viewHeight = Math.max(rect?.height || currentViewport.height || 600, 240);

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        inputStates.forEach((state) => {
            minX = Math.min(minX, state.x - FIT_STATE_RADIUS);
            minY = Math.min(minY, state.y - FIT_STATE_RADIUS);
            maxX = Math.max(maxX, state.x + FIT_STATE_RADIUS);
            maxY = Math.max(maxY, state.y + FIT_STATE_RADIUS);
        });

        const padding = Math.min(160, Math.max(96, Math.min(viewWidth, viewHeight) * 0.18));
        const rawContentWidth = maxX - minX;
        const rawContentHeight = maxY - minY;
        const contentWidth = Math.max(rawContentWidth, 220) + padding * 2;
        const contentHeight = Math.max(rawContentHeight, 220) + padding * 2;
        const zoomX = viewWidth / contentWidth;
        const zoomY = viewHeight / contentHeight;
        const nextZoom = Math.max(0.22, Math.min(1.6, Math.min(zoomX, zoomY)));
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        return {
            zoom: nextZoom,
            pan: {
                x: viewWidth / 2 - centerX * nextZoom,
                y: viewHeight / 2 - centerY * nextZoom,
            }
        };
    }, [canvasRef]);

    const fitToContent = useCallback(() => {
        const currentStates = statesRef.current;
        if (!canvasRef.current || currentStates.length === 0) {
            lastFitTransformRef.current = { zoom: 1, pan: DEFAULT_PAN };
            handleTransformChange(1, DEFAULT_PAN);
            return;
        }

        const { zoom: nextZoom, pan: nextPan } = calculateFitTransform(currentStates);
        lastFitTransformRef.current = { zoom: nextZoom, pan: nextPan };
        handleTransformChange(nextZoom, nextPan);
    }, [calculateFitTransform, canvasRef, handleTransformChange]);

    useEffect(() => {
        if (fitRequestToken === undefined) return;
        if (lastFitRequestRef.current === fitRequestToken) return;

        lastFitRequestRef.current = fitRequestToken;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                fitToContent();
            });
        });
    }, [fitRequestToken, fitToContent]);

    useEffect(() => {
        const updateViewport = () => {
            if (!canvasRef.current) return;

            const rect = canvasRef.current.getBoundingClientRect();
            const nextViewport = { x: 0, y: 0, width: rect.width, height: rect.height };
            viewportRef.current = nextViewport;
            setViewport(nextViewport);

            const lastFit = lastFitTransformRef.current;
            if (!lastFit || states.length === 0) return;

            const currentZoom = zoomRef.current;
            const currentPan = panRef.current;
            const panDelta = Math.abs(currentPan.x - lastFit.pan.x) + Math.abs(currentPan.y - lastFit.pan.y);
            const zoomDelta = Math.abs(currentZoom - lastFit.zoom);

            if (zoomDelta < 0.02 && panDelta < 2) {
                requestAnimationFrame(() => fitToContent());
            }
        };

        updateViewport();
        window.addEventListener('resize', updateViewport);

        return () => window.removeEventListener('resize', updateViewport);
    }, [canvasRef, fitToContent, states.length]);

    return {
        zoom,
        pan,
        viewport,
        handleZoomChange,
        handlePanChange,
        handleTransformChange,
        fitToContent,
    };
};
