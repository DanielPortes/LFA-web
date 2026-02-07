import React, { useRef, useState, useMemo, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { Estado, Transicao, AutomatoData, Tool } from '../../types';
import { calculatePath, getMousePos, calculateControlPoint, calculateControlOffsetFromPoint, getQuadraticXY } from '../../utils/geometry';
import { calculateOptimalCurvatures, calculateSmartLabelPositions, calculateLabelWidth } from '../../utils/layout';
import { EPSILON_SYMBOL } from '../../utils/symbols';
import { parseTuringTransition } from '../../utils/turingLogic';
import { ContextMenu } from '../ui/ContextMenu';
import { Trash2, Plus, RotateCcw, Check, Flag } from 'lucide-react';

interface CanvasProps {
    data: AutomatoData;
    tool: Tool;
    onChange: (data: AutomatoData) => void;
    activeStates?: string[];
    activeTransitions?: string[];
    readOnly?: boolean;
    zoom?: number;
    onZoomChange?: (newZoom: number) => void;
    pan?: { x: number; y: number };
    onPanChange?: (pan: { x: number; y: number }) => void;
    onTransformChange?: (zoom: number, pan: { x: number; y: number }) => void;
    snapToGrid?: boolean;
    onInteract?: () => void;
    focusStateId?: string | null;
    onFocusHandled?: () => void;
    onFitToContent?: () => void;
}

const GRID_SIZE = 40;
const STATE_RADIUS = 28;
const MIN_STATE_SPACING = 96;
const TRANSITION_HINT_STORAGE_KEY = 'lfa-transition-control-hint-dismissed';

// Safe ID Generator
const generateId = (prefix: string = 'id') => `${prefix}_${crypto.randomUUID().slice(0, 8)}`;

const getNextStateLabel = (states: Estado[]): string => {
    let idx = 0;
    const labels = new Set(states.map(s => s.label));
    while (labels.has(`q${idx}`)) idx += 1;
    return `q${idx}`;
};

export const AutomatonCanvas = forwardRef<SVGSVGElement, CanvasProps>(({
    data,
    tool,
    onChange,
    activeStates = [],
    activeTransitions = [],
    readOnly = false,
    zoom = 1,
    onZoomChange,
    pan: externalPan,
    onPanChange,
    snapToGrid = false,
    onInteract,
    focusStateId,
    onFocusHandled,
    onFitToContent,
    onTransformChange
}, ref) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => svgRef.current!, []);

    // Internal State
    const [selection, setSelection] = useState<{ type: 'state' | 'transition', id: string } | null>(null);
    const [selectedStateIds, setSelectedStateIds] = useState<string[]>([]);
    const [selectedTransitionIds, setSelectedTransitionIds] = useState<string[]>([]);

    // Drag state - using refs to avoid re-renders during drag
    const isDraggingRef = useRef(false);
    const dragTypeRef = useRef<'state' | 'pan' | 'controlPoint'>('pan');
    const dragTargetRef = useRef<string | null>(null);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const dragInitialPanRef = useRef({ x: 0, y: 0 });
    const dragInitialStatesRef = useRef<Map<string, { x: number, y: number }>>(new Map());

    // Use refs for drag positions to avoid re-renders
    const dragPositionsRef = useRef<Record<string, { x: number; y: number }>>({});
    const [renderTick, setRenderTick] = useState(0);
    const rafRef = useRef<number | null>(null);
    const controlPointDraftRef = useRef<{ transitionId: string; controlPoint: { x: number; y: number } } | null>(null);
    const [showTransitionHint, setShowTransitionHint] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(TRANSITION_HINT_STORAGE_KEY) !== '1';
    });

    const scheduleRender = useCallback(() => {
        if (rafRef.current !== null) return;
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            setRenderTick((n) => n + 1);
        });
    }, []);

    const dismissTransitionHint = useCallback(() => {
        setShowTransitionHint(false);
        if (typeof window !== 'undefined') {
            localStorage.setItem(TRANSITION_HINT_STORAGE_KEY, '1');
        }
    }, []);

    // Get rendered position of a state (with drag offset applied)
    const getRenderState = useCallback((state: Estado): Estado => {
        const override = dragPositionsRef.current[state.id];
        if (override) {
            return { ...state, x: override.x, y: override.y };
        }
        return state;
    }, []);


    const [creatingTransition, setCreatingTransition] = useState<{ from: string, toPoint: { x: number, y: number } } | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, type: 'canvas' | 'state' | 'transition', targetId?: string } | null>(null);

    // Internal Pan state if not controlled
    const [pan, setPanInternal] = useState({ x: 0, y: 0 });
    const currentPan = externalPan ?? pan;

    // Store callbacks in refs to avoid dependency issues
    const onPanChangeRef = useRef(onPanChange);
    const onZoomChangeRef = useRef(onZoomChange);
    const onTransformChangeRef = useRef(onTransformChange);
    const onFitToContentRef = useRef(onFitToContent);
    const onFocusHandledRef = useRef(onFocusHandled);

    useEffect(() => { onPanChangeRef.current = onPanChange; }, [onPanChange]);
    useEffect(() => { onZoomChangeRef.current = onZoomChange; }, [onZoomChange]);
    useEffect(() => { onTransformChangeRef.current = onTransformChange; }, [onTransformChange]);
    useEffect(() => { onFitToContentRef.current = onFitToContent; }, [onFitToContent]);
    useEffect(() => { onFocusHandledRef.current = onFocusHandled; }, [onFocusHandled]);

    // Stable setPan function
    const setPan = useCallback((newPan: { x: number; y: number }) => {
        if (onPanChangeRef.current) {
            onPanChangeRef.current(newPan);
        } else {
            setPanInternal(newPan);
        }
    }, []);

    // Selection Box
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
    const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });

    // Initial Center - run once when states appear
    const hasAutoFitRef = useRef(false);
    // Start from empty history to ensure first mount with preloaded states triggers centering.
    const stateCountRef = useRef(0);
    const stateIdsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const prevCount = stateCountRef.current;
        const currentCount = data.estados.length;
        const prevIds = stateIdsRef.current;
        const currentIds = new Set(data.estados.map((s) => s.id));
        const overlapCount = [...currentIds].filter((id) => prevIds.has(id)).length;
        const overlapRatio = prevCount > 0
            ? overlapCount / Math.max(prevCount, currentCount || 1)
            : 0;
        const replacedMostStates = prevCount > 0 && currentCount > 0 && overlapRatio < 0.35;

        stateCountRef.current = currentCount;
        stateIdsRef.current = currentIds;

        if (currentCount === 0) {
            hasAutoFitRef.current = false;
            return;
        }
        if (!svgRef.current) return;

        const isInitialLoad = prevCount === 0 && currentCount > 0;
        const shouldRefitForReplacement = replacedMostStates;
        const isDefaultView = Math.abs(currentPan.x) < 0.5
            && Math.abs(currentPan.y) < 0.5
            && Math.abs(zoom - 1) < 0.001;

        if (shouldRefitForReplacement) {
            hasAutoFitRef.current = false;
        }

        if (!hasAutoFitRef.current && isDefaultView && (isInitialLoad || shouldRefitForReplacement)) {
            hasAutoFitRef.current = true;
            onFitToContentRef.current?.();
        }
    }, [data.estados, currentPan.x, currentPan.y, zoom]);

    // Handle External Focus - use ref to avoid callback dependency loops
    const focusHandledRef = useRef<string | null>(null);

    useEffect(() => {
        // Reset when focusStateId is cleared
        if (!focusStateId) {
            focusHandledRef.current = null;
            return;
        }
        // Prevent handling the same focus twice
        if (focusHandledRef.current === focusStateId) return;

        const target = data.estados.find(s => s.id === focusStateId);
        if (!target) return;

        focusHandledRef.current = focusStateId;
        setSelection({ type: 'state', id: target.id });
        setSelectedStateIds([target.id]);

        if (svgRef.current) {
            const rect = svgRef.current.getBoundingClientRect();
            const newPan = {
                x: rect.width / 2 - target.x * zoom,
                y: rect.height / 2 - target.y * zoom
            };

            const currentPanVal = panRef.current;
            const panDelta = Math.abs(currentPanVal.x - newPan.x) + Math.abs(currentPanVal.y - newPan.y);

            if (panDelta > 1) {
                setPan(newPan);
            }
        }
        onFocusHandledRef.current?.();
    }, [focusStateId, data.estados, zoom, setPan]);

    // Space key for panning
    const isSpacePressed = useRef(false);
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !e.repeat && !readOnly) {
                isSpacePressed.current = true;
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                isSpacePressed.current = false;
            }
        };
        // Reset modifier on window blur (prevents stuck keys)
        const handleBlur = () => {
            isSpacePressed.current = false;
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('blur', handleBlur);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('blur', handleBlur);
        };
    }, [readOnly]);

    const deleteState = useCallback((id: string) => {
        onChange({
            ...data,
            estados: data.estados.filter(e => e.id !== id),
            transicoes: data.transicoes.filter(t => t.de !== id && t.para !== id)
        });
        setSelection(null);
    }, [data, onChange]);

    const deleteTransition = useCallback((id: string) => {
        onChange({ ...data, transicoes: data.transicoes.filter(t => t.id !== id) });
        setSelection(null);
    }, [data, onChange]);

    const commitControlPointDraft = useCallback(() => {
        const draft = controlPointDraftRef.current;
        if (!draft) return;

        const currentTransition = data.transicoes.find((t) => t.id === draft.transitionId);
        controlPointDraftRef.current = null;

        if (!currentTransition) return;

        const previous = currentTransition.controlPoint;
        const next = draft.controlPoint;
        const changed = !previous
            || Math.abs(previous.x - next.x) > 0.01
            || Math.abs(previous.y - next.y) > 0.01;

        if (!changed) return;

        onChange({
            ...data,
            transicoes: data.transicoes.map((t) =>
                t.id === draft.transitionId ? { ...t, controlPoint: next } : t
            )
        });
    }, [data, onChange]);

    // Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (readOnly) return;
            if (e.target instanceof HTMLInputElement) return;

            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selection?.type === 'state') deleteState(selection.id);
                else if (selection?.type === 'transition') deleteTransition(selection.id);
                else if (selectedStateIds.length > 0) {
                    const newEstados = data.estados.filter(e => !selectedStateIds.includes(e.id));
                    const newTransicoes = data.transicoes.filter(t => !selectedStateIds.includes(t.de) && !selectedStateIds.includes(t.para));
                    onChange({ ...data, estados: newEstados, transicoes: newTransicoes });
                    setSelectedStateIds([]);
                    setSelectedTransitionIds([]);
                    setSelection(null);
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                setSelectedStateIds(data.estados.map(s => s.id));
                setSelectedTransitionIds(data.transicoes.map(t => t.id));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selection, selectedStateIds, data, readOnly, deleteState, deleteTransition, onChange]);

    useEffect(() => {
        const closeMenu = () => setContextMenu(null);
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);

    // Global mouseup handler to commit drag even if mouse leaves window
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDraggingRef.current && dragTypeRef.current === 'state') {
                // Commit drag positions to data
                const newEstados = data.estados.map(s => {
                    const override = dragPositionsRef.current[s.id];
                    if (override) {
                        return { ...s, x: override.x, y: override.y };
                    }
                    return s;
                });

                if (Object.keys(dragPositionsRef.current).length > 0) {
                    onChange({ ...data, estados: newEstados });
                }
                dragPositionsRef.current = {};
            }
            if (isDraggingRef.current && dragTypeRef.current === 'controlPoint') {
                commitControlPointDraft();
            }
            isDraggingRef.current = false;
            dragTypeRef.current = 'pan';
            dragTargetRef.current = null;
            setCreatingTransition(null);
            setIsSelecting(false);
            scheduleRender();
        };

        window.addEventListener('mouseup', handleGlobalMouseUp);
        window.addEventListener('blur', handleGlobalMouseUp);
        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp);
            window.removeEventListener('blur', handleGlobalMouseUp);
        };
    }, [data, onChange, commitControlPointDraft, scheduleRender]);

    const snapToGridValue = useCallback((value: number) => (
        snapToGrid ? Math.round(value / GRID_SIZE) * GRID_SIZE : value
    ), [snapToGrid]);

    // Refs for zoom handler to avoid stale closure values
    const zoomRef = useRef(zoom);
    const panRef = useRef(currentPan);
    useEffect(() => { zoomRef.current = zoom; }, [zoom]);
    useEffect(() => { panRef.current = currentPan; }, [currentPan]);

    // Zoom with Scroll Wheel - use native event listener for non-passive
    // Attach wheel event with passive: false to enable preventDefault
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const rect = container.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Use refs for current values (avoid stale closures)
            const currentZoom = zoomRef.current;
            const currentPanVal = panRef.current;

            // World position under mouse cursor
            const worldX = (mouseX - currentPanVal.x) / currentZoom;
            const worldY = (mouseY - currentPanVal.y) / currentZoom;

            // Calculate zoom delta
            const ZOOM_SENSITIVITY = 0.002;
            const delta = -e.deltaY;
            const scaleFactor = Math.exp(delta * ZOOM_SENSITIVITY);

            let newZoom = currentZoom * scaleFactor;
            newZoom = Math.max(0.25, Math.min(4, newZoom));

            // Skip tiny changes
            if (Math.abs(newZoom - currentZoom) < 0.001) return;

            // Calculate new pan to keep world point under mouse
            const newPanX = mouseX - worldX * newZoom;
            const newPanY = mouseY - worldY * newZoom;

            // Update zoom and pan atomically if possible - use refs for callbacks
            if (onTransformChangeRef.current) {
                onTransformChangeRef.current(newZoom, { x: newPanX, y: newPanY });
            } else {
                if (onZoomChangeRef.current) onZoomChangeRef.current(newZoom);
                if (onPanChangeRef.current) {
                    onPanChangeRef.current({ x: newPanX, y: newPanY });
                } else {
                    setPanInternal({ x: newPanX, y: newPanY });
                }
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, []); // Empty deps - callbacks are accessed via refs

    // Smart position finding using golden angle spiral
    const findFreeSpot = useCallback((x: number, y: number): { x: number, y: number } => {
        const hasCollision = (tx: number, ty: number) => {
            return data.estados.some(s => {
                const dx = s.x - tx;
                const dy = s.y - ty;
                return Math.sqrt(dx * dx + dy * dy) < MIN_STATE_SPACING;
            });
        };

        if (!hasCollision(x, y)) return { x, y };

        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        let angle = 0;

        for (let i = 1; i <= 60; i++) {
            const radius = 30 * Math.sqrt(i);
            angle += goldenAngle;

            let testX = x + Math.cos(angle) * radius;
            let testY = y + Math.sin(angle) * radius;

            if (snapToGrid) {
                testX = Math.round(testX / GRID_SIZE) * GRID_SIZE;
                testY = Math.round(testY / GRID_SIZE) * GRID_SIZE;
            }

            if (!hasCollision(testX, testY)) {
                return { x: testX, y: testY };
            }
        }

        return { x: x + MIN_STATE_SPACING + 20, y };
    }, [data.estados, snapToGrid]);

    const createStateAtLogical = useCallback((rawX: number, rawY: number) => {
        if (readOnly) return;

        const targetX = snapToGridValue(rawX);
        const targetY = snapToGridValue(rawY);
        const freeSpot = findFreeSpot(targetX, targetY);

        const newState: Estado = {
            id: generateId('q'),
            label: getNextStateLabel(data.estados),
            x: freeSpot.x,
            y: freeSpot.y,
            isFinal: false,
            isInicial: data.estados.length === 0
        };

        onChange({ ...data, estados: [...data.estados, newState] });
    }, [data, findFreeSpot, onChange, readOnly, snapToGridValue]);

    // Track Ctrl key for cursor
    const [isCtrlPressed, setIsCtrlPressed] = useState(false);
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Control') setIsCtrlPressed(true);
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Control') setIsCtrlPressed(false);
        };
        // Reset on window blur (prevents stuck modifier)
        const handleBlur = () => {
            setIsCtrlPressed(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('blur', handleBlur);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('blur', handleBlur);
        };
    }, []);

    // --- Interaction Handlers ---

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        containerRef.current?.focus({ preventScroll: true });
        if (onInteract) onInteract();
        const pos = getMousePos(e.nativeEvent as any, svgRef.current);
        const isTouch = 'touches' in e;
        const isSpace = isSpacePressed.current && !isTouch && (e as React.MouseEvent).button === 0;
        const isMiddle = !isTouch && ((e as React.MouseEvent).button === 1 || ((e as React.MouseEvent).button === 0 && (e as React.MouseEvent).ctrlKey));

        if (isMiddle || isSpace) {
            const clientX = isTouch ? (e as unknown as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
            const clientY = isTouch ? (e as unknown as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;

            isDraggingRef.current = true;
            dragTypeRef.current = 'pan';
            dragStartRef.current = { x: clientX, y: clientY };
            dragInitialPanRef.current = { x: currentPan.x, y: currentPan.y };
            return;
        }

        // Canvas Click
        if ((e.target as Element).tagName === 'svg') {
            if (tool === 'state' && !readOnly) {
                const rawX = (pos.x - currentPan.x) / zoom;
                const rawY = (pos.y - currentPan.y) / zoom;
                createStateAtLogical(rawX, rawY);
            } else if (tool === 'pointer') {
                // Start Selection Box
                if (!(e as React.MouseEvent).shiftKey) {
                    setSelection(null);
                    setSelectedStateIds([]);
                    setSelectedTransitionIds([]);
                }
                const logicalPos = { x: (pos.x - currentPan.x) / zoom, y: (pos.y - currentPan.y) / zoom };
                setIsSelecting(true);
                setSelectionStart(logicalPos);
                setSelectionEnd(logicalPos);
            } else {
                setSelection(null);
            }
        }
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (readOnly) return;
        if (tool !== 'pointer') return;
        if ((e.target as Element).tagName !== 'svg') return;

        const pos = getMousePos(e.nativeEvent, svgRef.current);
        const logicalX = (pos.x - currentPan.x) / zoom;
        const logicalY = (pos.y - currentPan.y) / zoom;
        createStateAtLogical(logicalX, logicalY);
    };

    const handleStateMouseDown = (e: React.MouseEvent | React.TouchEvent, stateId: string) => {
        e.stopPropagation();
        containerRef.current?.focus({ preventScroll: true });
        if (readOnly) return;
        if (onInteract) onInteract();

        const pos = getMousePos(e.nativeEvent as any, svgRef.current);

        if (tool === 'delete') {
            deleteState(stateId);
            return;
        }

        if (tool === 'transition') {
            const logicalPos = { x: (pos.x - currentPan.x) / zoom, y: (pos.y - currentPan.y) / zoom };
            setCreatingTransition({ from: stateId, toPoint: logicalPos });
            return;
        }

        // Pointer Tool: Selection + Dragging
        const isMultiSelect = (e as React.MouseEvent).shiftKey || (e as React.MouseEvent).ctrlKey || (e as React.MouseEvent).metaKey;

        let newSelectedIds = [...selectedStateIds];
        if (isMultiSelect) {
            if (!newSelectedIds.includes(stateId)) {
                newSelectedIds.push(stateId);
            }
        } else {
            if (!newSelectedIds.includes(stateId)) {
                newSelectedIds = [stateId];
            }
        }

        setSelectedStateIds(newSelectedIds);
        setSelection({ type: 'state', id: stateId });

        // Setup Dragging
        isDraggingRef.current = true;
        dragTypeRef.current = 'state';
        dragTargetRef.current = stateId;
        dragStartRef.current = { x: pos.x, y: pos.y };

        const initialPositions = new Map<string, { x: number, y: number }>();
        data.estados.forEach(s => {
            if (newSelectedIds.includes(s.id)) {
                initialPositions.set(s.id, { x: s.x, y: s.y });
            }
        });
        dragInitialStatesRef.current = initialPositions;
        dragPositionsRef.current = {};
    };

    const handleControlPointMouseDown = useCallback((e: React.MouseEvent, transId: string) => {
        e.stopPropagation();
        e.preventDefault();
        containerRef.current?.focus({ preventScroll: true });
        if (readOnly) return;

        const pos = getMousePos(e.nativeEvent, svgRef.current);

        isDraggingRef.current = true;
        dragTypeRef.current = 'controlPoint';
        dragTargetRef.current = transId;
        dragStartRef.current = { x: pos.x, y: pos.y };

        const currentTransition = data.transicoes.find((t) => t.id === transId);
        if (currentTransition?.controlPoint) {
            controlPointDraftRef.current = { transitionId: transId, controlPoint: { ...currentTransition.controlPoint } };
        } else {
            controlPointDraftRef.current = null;
        }

        setSelection({ type: 'transition', id: transId });
        scheduleRender();
    }, [readOnly, data.transicoes, scheduleRender]);

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        const pos = getMousePos(e.nativeEvent as any, svgRef.current);

        if (isDraggingRef.current) {
            if (dragTypeRef.current === 'pan') {
                const isTouch = 'touches' in e;
                const clientX = isTouch ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
                const clientY = isTouch ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;

                const rawDx = clientX - dragStartRef.current.x;
                const rawDy = clientY - dragStartRef.current.y;

                setPan({
                    x: dragInitialPanRef.current.x + rawDx,
                    y: dragInitialPanRef.current.y + rawDy
                });
                return;
            }

            if (dragTypeRef.current === 'state') {
                const dx = (pos.x - dragStartRef.current.x) / zoom;
                const dy = (pos.y - dragStartRef.current.y) / zoom;

                dragInitialStatesRef.current.forEach((initialPos, id) => {
                    let newX = initialPos.x + dx;
                    let newY = initialPos.y + dy;
                    if (snapToGrid) {
                        newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
                        newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
                    }
                    dragPositionsRef.current[id] = { x: newX, y: newY };
                });
                scheduleRender();
            }

            if (dragTypeRef.current === 'controlPoint') {
                const transId = dragTargetRef.current!;
                const trans = data.transicoes.find(t => t.id === transId);
                const source = data.estados.find(s => s.id === trans?.de);
                const target = data.estados.find(s => s.id === trans?.para);

                if (source && target && trans) {
                    const logicalMouse = {
                        x: (pos.x - currentPan.x) / zoom,
                        y: (pos.y - currentPan.y) / zoom
                    };

                    const newControlPoint = calculateControlOffsetFromPoint(source, target, logicalMouse);
                    controlPointDraftRef.current = { transitionId: transId, controlPoint: newControlPoint };
                    scheduleRender();
                }
            }
        } else if (creatingTransition) {
            const logicalPos = { x: (pos.x - currentPan.x) / zoom, y: (pos.y - currentPan.y) / zoom };
            setCreatingTransition({ ...creatingTransition, toPoint: logicalPos });
        } else if (isSelecting) {
            const logicalPos = { x: (pos.x - currentPan.x) / zoom, y: (pos.y - currentPan.y) / zoom };
            setSelectionEnd(logicalPos);
        }
    };

    const handleMouseUp = () => {
        if (isDraggingRef.current) {
            if (dragTypeRef.current === 'state') {
                // Commit drag positions to data
                const newEstados = data.estados.map(s => {
                    const override = dragPositionsRef.current[s.id];
                    if (override) {
                        return { ...s, x: override.x, y: override.y };
                    }
                    return s;
                });

                // Only update if there were actual changes
                if (Object.keys(dragPositionsRef.current).length > 0) {
                    onChange({ ...data, estados: newEstados });
                }
                dragPositionsRef.current = {};
            }
            if (dragTypeRef.current === 'controlPoint') {
                commitControlPointDraft();
            }

            isDraggingRef.current = false;
            dragTypeRef.current = 'pan';
            dragTargetRef.current = null;
            scheduleRender();
        } else if (creatingTransition) {
            const targetState = [...data.estados].reverse().find(s => {
                const logicalMouse = creatingTransition.toPoint;
                const dist = Math.sqrt(Math.pow(s.x - logicalMouse.x, 2) + Math.pow(s.y - logicalMouse.y, 2));
                return dist <= STATE_RADIUS;
            });

            if (targetState) {
                // Check if this exact transition already exists
                const existing = data.transicoes.find(t =>
                    t.de === creatingTransition.from &&
                    t.para === targetState.id &&
                    t.simbolo === ''
                );

                if (!existing) {
                    const newTrans: Transicao = {
                        id: generateId('t'),
                        de: creatingTransition.from,
                        para: targetState.id,
                        simbolo: '',
                        curvatura: 0
                    };
                    onChange({ ...data, transicoes: [...data.transicoes, newTrans] });
                    setSelection({ type: 'transition', id: newTrans.id });
                }
            }
            setCreatingTransition(null);
        } else if (isSelecting) {
            // Calculate selection bounds
            const x1 = Math.min(selectionStart.x, selectionEnd.x);
            const x2 = Math.max(selectionStart.x, selectionEnd.x);
            const y1 = Math.min(selectionStart.y, selectionEnd.y);
            const y2 = Math.max(selectionStart.y, selectionEnd.y);

            // Select states in bounds
            const selectedStates = data.estados.filter(s =>
                s.x >= x1 && s.x <= x2 && s.y >= y1 && s.y <= y2
            ).map(s => s.id);

            // Also select transitions whose both endpoints are in the selection
            const selectedTrans = data.transicoes.filter(t =>
                selectedStates.includes(t.de) && selectedStates.includes(t.para)
            ).map(t => t.id);

            setSelectedStateIds(selectedStates);
            setSelectedTransitionIds(selectedTrans);

            if (selectedStates.length === 1) {
                setSelection({ type: 'state', id: selectedStates[0] });
            } else if (selectedStates.length > 0) {
                setSelection(null);
            }

            setIsSelecting(false);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        if (readOnly) return;
        const pos = getMousePos(e.nativeEvent as any, svgRef.current);
        const logicalPos = { x: (pos.x - currentPan.x) / zoom, y: (pos.y - currentPan.y) / zoom };

        const clickedState = [...data.estados].reverse().find(s => {
            const dx = s.x - logicalPos.x;
            const dy = s.y - logicalPos.y;
            return dx * dx + dy * dy <= STATE_RADIUS * STATE_RADIUS;
        });

        if (clickedState) {
            setContextMenu({ x: e.clientX, y: e.clientY, type: 'state', targetId: clickedState.id });
        } else {
            setContextMenu({ x: e.clientX, y: e.clientY, type: 'canvas' });
        }
    };

    // Pre-calculate curvatures and label positions
    const { curvatures, labelPositions, labelTexts } = useMemo(() => {
        // Used as an explicit recompute signal while dragging refs mutate outside React state.
        void renderTick;
        const renderedStates = data.estados.map(s => getRenderState(s));

        // Calculate curvatures
        const curvatures = calculateOptimalCurvatures(data.transicoes, renderedStates);

        // Build label texts map
        const labelTexts = new Map<string, string>();
        for (const t of data.transicoes) {
            let text = t.simbolo === '' ? '?' : t.simbolo;
            if (data.tipo === 'MT' || data.tipo === 'ALL') {
                if (t.simbolo.includes('->')) {
                    text = t.simbolo;
                } else if (t.write && t.direction) {
                    text = `${t.simbolo} -> ${t.write}, ${t.direction}`;
                } else if (t.write || t.direction) {
                    text = `${t.simbolo} -> ${t.write ?? t.simbolo}, ${t.direction ?? 'R'}`;
                }
            } else if (data.tipo === 'Mealy' && t.output) {
                text = `${t.simbolo} / ${t.output}`;
            }
            labelTexts.set(t.id, text);
        }

        // Calculate label positions
        const labelPositions = calculateSmartLabelPositions(
            data.transicoes,
            renderedStates,
            curvatures,
            labelTexts
        );

        return { curvatures, labelPositions, labelTexts };
    }, [data, getRenderState, renderTick]);

    const selectionDockStyle = useMemo(() => {
        if (!selection || readOnly) return undefined;
        const container = containerRef.current;
        if (!container) return undefined;

        let target: { x: number; y: number } | null = null;
        if (selection.type === 'state') {
            const state = data.estados.find(e => e.id === selection.id);
            if (state) {
                const renderState = getRenderState(state);
                target = { x: renderState.x, y: renderState.y };
            }
        } else {
            const labelPos = labelPositions.get(selection.id);
            if (labelPos) target = labelPos;
        }
        if (!target) return undefined;

        const x = currentPan.x + target.x * zoom;
        const y = currentPan.y + target.y * zoom;

        // Dock dimensions (approximate)
        const dockWidth = 320;
        const dockHeight = 60;
        const padding = 16;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Calculate clamped X position considering dock width
        const minX = dockWidth / 2 + padding;
        const maxX = containerWidth - dockWidth / 2 - padding;
        const clampedX = Math.min(Math.max(x, minX), maxX);

        // Determine if dock should appear above or below target
        const spaceAbove = y - dockHeight - 40;
        const spaceBelow = containerHeight - y - dockHeight - 40;
        const shouldFlip = spaceAbove < padding && spaceBelow > spaceAbove;

        // Calculate Y position
        const targetY = shouldFlip ? y + 50 : y - 50;
        const minY = padding + (shouldFlip ? 0 : dockHeight);
        const maxY = containerHeight - padding - (shouldFlip ? dockHeight : 0);
        const clampedY = Math.min(Math.max(targetY, minY), maxY);

        return {
            left: `${clampedX}px`,
            top: `${clampedY}px`,
            transform: `translate(-50%, ${shouldFlip ? '0' : '-100%'})`,
            maxWidth: `${containerWidth - padding * 2}px`
        };
    }, [selection, readOnly, data.estados, labelPositions, currentPan, zoom, getRenderState]);

    const selectedTransition = selection?.type === 'transition'
        ? data.transicoes.find(t => t.id === selection.id) ?? null
        : null;
    const isTuringMachine = data.tipo === 'MT' || data.tipo === 'ALL';
    const parsedTuring = selectedTransition && isTuringMachine
        ? parseTuringTransition(selectedTransition.simbolo)
        : null;
    const turingRead = parsedTuring?.read ?? selectedTransition?.simbolo ?? '';
    const turingWrite = parsedTuring?.write ?? selectedTransition?.write ?? '';
    const turingDir = parsedTuring?.direction ?? selectedTransition?.direction ?? 'R';

    const updateTuringTransition = (updates: { read?: string; write?: string; direction?: 'L' | 'R' | 'S' }) => {
        if (!selectedTransition) return;
        const read = updates.read ?? turingRead;
        const write = updates.write ?? turingWrite;
        const direction = updates.direction ?? turingDir;
        const symbol = `${read} -> ${write}, ${direction}`;
        onChange({
            ...data,
            transicoes: data.transicoes.map(t =>
                t.id === selectedTransition.id
                    ? { ...t, simbolo: symbol, write, direction }
                    : t
            )
        });
    };

    // Render Transitions
    const renderTransitions = useMemo(() => {
        const elements: React.ReactElement[] = [];

        for (const t of data.transicoes) {
            const sourceBase = data.estados.find(e => e.id === t.de);
            const targetBase = data.estados.find(e => e.id === t.para);
            if (!sourceBase || !targetBase) continue;

            const source = getRenderState(sourceBase);
            const target = getRenderState(targetBase);

            const curvature = curvatures.get(t.id) || 0;
            const controlPointDraft = controlPointDraftRef.current?.transitionId === t.id
                ? controlPointDraftRef.current.controlPoint
                : null;
            const controlPointOffset = controlPointDraft ?? t.controlPoint ?? null;

            const pathD = calculatePath(source, target, curvature, controlPointOffset);

            const isSelected = (selection?.type === 'transition' && selection.id === t.id) ||
                              selectedTransitionIds.includes(t.id);
            const isActive = activeTransitions.includes(t.id);

            const controlPoint = calculateControlPoint(source, target, curvature, controlPointOffset);

            const labelText = labelTexts.get(t.id) || '?';
            const labelWidth = calculateLabelWidth(labelText);
            const labelAnchor = source.id === target.id
                ? { x: source.x, y: source.y - (52 + Math.abs(curvature) * 0.5) }
                : getQuadraticXY(0.5, source.x, source.y, controlPoint.x, controlPoint.y, target.x, target.y);
            const labelPos = controlPointDraft
                ? labelAnchor
                : (labelPositions.get(t.id) || labelAnchor);
            const connectorDx = labelPos.x - labelAnchor.x;
            const connectorDy = labelPos.y - labelAnchor.y;
            const shouldRenderConnector = Math.sqrt(connectorDx * connectorDx + connectorDy * connectorDy) > 14;

            elements.push(
                <g
                    key={t.id}
                    className="group/trans"
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelection({ type: 'transition', id: t.id });
                        if (!(e.shiftKey || e.ctrlKey || e.metaKey)) {
                            setSelectedTransitionIds([t.id]);
                        } else {
                            setSelectedTransitionIds(prev =>
                                prev.includes(t.id) ? prev : [...prev, t.id]
                            );
                        }
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setContextMenu({ x: e.clientX, y: e.clientY, type: 'transition', targetId: t.id });
                    }}
                >
                    {/* Invisible Wide Hit Area */}
                    <path d={pathD} stroke="transparent" strokeWidth="20" fill="none" className="cursor-pointer" />

                    {/* Visible Line */}
                    <path
                        d={pathD}
                        className={`fill-none pointer-events-none
                            ${isSelected ? 'stroke-ios-blue stroke-[3px] filter drop-shadow-md' :
                                isActive ? 'stroke-ios-green stroke-[3px] animate-pulse' :
                                    'stroke-[var(--stroke-idle)] stroke-2 group-hover/trans:stroke-[var(--stroke-hover)]'
                            }`}
                        markerEnd={`url(#${isSelected ? 'arrow-selected' : (isActive ? 'arrow-active' : 'arrow')})`}
                    />

                    {/* Label with smart positioning */}
                    <g transform={`translate(${labelPos.x}, ${labelPos.y})`}>
                        {shouldRenderConnector && (
                            <line
                                x1={labelAnchor.x - labelPos.x}
                                y1={labelAnchor.y - labelPos.y}
                                x2={0}
                                y2={0}
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeDasharray="3,3"
                                className="text-muted pointer-events-none opacity-80"
                            />
                        )}
                        <rect
                            x={-labelWidth / 2}
                            y="-12"
                            width={labelWidth}
                            height="24"
                            rx="8"
                            strokeWidth="1.5"
                            className={`cursor-pointer drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]
                                ${isSelected ? 'fill-ios-blue stroke-ios-blue shadow-lg' :
                                    isActive ? 'fill-ios-green stroke-ios-green' :
                                        t.simbolo === '' ? 'fill-red-50 dark:fill-red-900/30 stroke-ios-red/50' :
                                            'fill-[var(--canvas-surface)] stroke-[var(--stroke-idle)]'
                                }`}
                        />
                        <text
                            dy="5"
                            textAnchor="middle"
                            className={`text-[13px] font-mono font-bold select-none pointer-events-none
                                ${isSelected || isActive ? 'fill-white' :
                                    t.simbolo === '' ? 'fill-ios-red' :
                                        'fill-[var(--text-primary)]'
                                }`}
                        >
                            {labelText}
                        </text>
                    </g>

                    {/* Control Handle (Only when selected) */}
                    {isSelected && !readOnly && (
                        <g
                            onMouseDown={(e) => handleControlPointMouseDown(e, t.id)}
                            style={{ cursor: 'grab' }}
                        >
                            {/* Larger invisible hit area for easier grabbing */}
                            <circle
                                cx={controlPoint.x}
                                cy={controlPoint.y}
                                r={14}
                                fill="transparent"
                                className="pointer-events-auto"
                            />
                            {/* Visible handle */}
                            <circle
                                cx={controlPoint.x}
                                cy={controlPoint.y}
                                r={7}
                                className="fill-white stroke-ios-blue stroke-2 pointer-events-none"
                                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}
                            />
                        </g>
                    )}
                </g>
            );
        }

        return elements;
    }, [data, selection, selectedTransitionIds, activeTransitions, readOnly, curvatures, labelPositions, labelTexts, getRenderState, handleControlPointMouseDown]);

    const creatingFromState = creatingTransition
        ? data.estados.find(e => e.id === creatingTransition.from)
        : null;
    const creatingFromRender = creatingFromState ? getRenderState(creatingFromState) : null;

    const getCursorClass = () => {
        if (dragTypeRef.current === 'pan' && isDraggingRef.current) return 'cursor-grabbing';
        if (isCtrlPressed || isSpacePressed.current) return 'cursor-grab';
        if (tool === 'state') return 'cursor-crosshair';
        if (tool === 'delete') return 'cursor-default';
        return '';
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative overflow-hidden select-none bg-canvas focus:outline-none"
            tabIndex={0}
            data-automaton-editor="true"
            aria-label="Canvas do autômato"
        >
            <div className={`absolute inset-0 bg-grid-pattern pointer-events-none ${snapToGrid ? 'grid-active' : 'opacity-60'}`} />

            <svg
                ref={svgRef}
                className={`w-full h-full touch-none outline-none ${getCursorClass()} ${tool === 'state' && !getCursorClass() ? 'cursor-crosshair' : ''}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDoubleClick={handleDoubleClick}
                onContextMenu={handleContextMenu}
            >
                <defs>
                    <marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="userSpaceOnUse">
                        <path d="M2,2 L10,6 L2,10 L4,6 Z" className="fill-[var(--stroke-idle)]" />
                    </marker>
                    <marker id="arrow-selected" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="userSpaceOnUse">
                        <path d="M2,2 L10,6 L2,10 L4,6 Z" className="fill-ios-blue" />
                    </marker>
                    <marker id="arrow-active" markerWidth="14" markerHeight="14" refX="10" refY="6" orient="auto" markerUnits="userSpaceOnUse">
                        <path d="M2,2 L10,6 L2,10 L4,6 Z" className="fill-ios-green" />
                    </marker>
                </defs>

                <g transform={`translate(${currentPan.x}, ${currentPan.y}) scale(${zoom})`}>
                    {renderTransitions}

                    {creatingTransition && creatingFromRender && (
                        <line
                            x1={creatingFromRender.x}
                            y1={creatingFromRender.y}
                            x2={creatingTransition.toPoint.x}
                            y2={creatingTransition.toPoint.y}
                            stroke="#007AFF" strokeWidth="2" strokeDasharray="6,4"
                            className="pointer-events-none opacity-60"
                        />
                    )}

                    {isSelecting && (
                        <rect
                            x={Math.min(selectionStart.x, selectionEnd.x)}
                            y={Math.min(selectionStart.y, selectionEnd.y)}
                            width={Math.abs(selectionEnd.x - selectionStart.x)}
                            height={Math.abs(selectionEnd.y - selectionStart.y)}
                            fill="rgba(0, 122, 255, 0.1)"
                            stroke="rgba(0, 122, 255, 0.5)"
                            strokeWidth="1"
                            rx="4"
                        />
                    )}

                    {data.estados.map(s => {
                        const renderState = getRenderState(s);
                        const isSelected = (selection?.type === 'state' && selection.id === s.id) || selectedStateIds.includes(s.id);
                        const isActive = activeStates.includes(s.id);
                        return (
                            <g
                                key={s.id}
                                id={`group-${s.id}`}
                                transform={`translate(${renderState.x}, ${renderState.y})`}
                                onMouseDown={(e) => handleStateMouseDown(e, s.id)}
                                className="cursor-grab active:cursor-grabbing hover:brightness-110"
                            >
                                {s.isInicial && (
                                    <path d="M -50 0 L -32 0" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrow)" className="text-stroke-idle opacity-70" />
                                )}
                                <circle r="28" className="fill-transparent" />
                                <circle
                                    r={isSelected || isActive ? 28 : 26}
                                    className={`
                                        ${isActive ? 'fill-ios-green stroke-ios-green shadow-[0_0_20px_rgba(52,199,89,0.6)]' :
                                            (isSelected ? 'fill-ios-blue stroke-ios-blue shadow-[0_0_15px_rgba(0,122,255,0.4)]' :
                                                'fill-[var(--canvas-surface)] stroke-[var(--stroke-idle)]')}`}
                                    strokeWidth={isSelected || isActive ? 2.5 : 2}
                                />
                                {s.isFinal && (
                                    <circle r="22" fill="none" className={`pointer-events-none ${isActive || isSelected ? 'stroke-white' : 'stroke-[var(--stroke-idle)]'}`} strokeWidth="1.5" />
                                )}
                                <text dy="5" textAnchor="middle" className={`text-[13px] font-bold select-none pointer-events-none font-mono ${isActive || isSelected ? 'fill-white' : 'fill-[var(--text-primary)]'}`}>
                                    {s.label}
                                </text>
                                {data.tipo === 'Moore' && s.output && (
                                    <g transform="translate(0, -36)">
                                        <rect x="-10" y="-8" width="20" height="16" rx="4" className="fill-[var(--surface-muted)] stroke-[var(--border-color)]" strokeWidth="1" />
                                        <text dy="3" textAnchor="middle" className="text-[10px] font-bold fill-[var(--text-secondary)] font-mono">
                                            {s.output}
                                        </text>
                                    </g>
                                )}
                            </g>
                        );
                    })}
                </g>
            </svg>

            {/* Context Menu */}
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    options={
                        contextMenu.type === 'state' ? [
                            {
                                label: 'Inicial',
                                icon: <Flag size={14} />,
                                action: () => {
                                    if (contextMenu.targetId) {
                                        onChange({ ...data, estados: data.estados.map(s => s.id === contextMenu.targetId ? { ...s, isInicial: !s.isInicial } : s) });
                                    }
                                }
                            },
                            {
                                label: 'Final',
                                icon: <Check size={14} />,
                                action: () => {
                                    if (contextMenu.targetId) {
                                        onChange({ ...data, estados: data.estados.map(s => s.id === contextMenu.targetId ? { ...s, isFinal: !s.isFinal } : s) });
                                    }
                                }
                            },
                            { separator: true, label: '', action: () => { } },
                            {
                                label: 'Excluir',
                                icon: <Trash2 size={14} />,
                                danger: true,
                                action: () => {
                                    if (contextMenu.targetId) deleteState(contextMenu.targetId);
                                }
                            }
                        ] : contextMenu.type === 'transition' ? [
                            {
                                label: 'Resetar Curvatura',
                                icon: <RotateCcw size={14} />,
                                action: () => {
                                    if (contextMenu.targetId) {
                                        onChange({ ...data, transicoes: data.transicoes.map(t => t.id === contextMenu.targetId ? { ...t, curvatura: 0, controlPoint: null } : t) });
                                    }
                                }
                            },
                            {
                                label: 'Excluir',
                                icon: <Trash2 size={14} />,
                                danger: true,
                                action: () => {
                                    if (contextMenu.targetId) deleteTransition(contextMenu.targetId);
                                }
                            }
                        ] : [
                            {
                                label: 'Novo Estado',
                                icon: <Plus size={14} />,
                                action: () => {
                                    const rect = svgRef.current?.getBoundingClientRect();
                                    if (rect) {
                                        const mouseX = contextMenu.x - rect.left;
                                        const mouseY = contextMenu.y - rect.top;
                                        const x = (mouseX - currentPan.x) / zoom;
                                        const y = (mouseY - currentPan.y) / zoom;
                                        createStateAtLogical(x, y);
                                    }
                                }
                            },
                            {
                                label: 'Resetar View',
                                icon: <RotateCcw size={14} />,
                                action: () => {
                                    if (onFitToContentRef.current) onFitToContentRef.current();
                                    else {
                                        if (onZoomChangeRef.current) onZoomChangeRef.current(1);
                                        setPan({ x: 0, y: 0 });
                                    }
                                }
                            }
                        ]
                    }
                />
            )}

            {/* Selection Dock */}
            {!readOnly && selection && !contextMenu && !isDraggingRef.current && (
                <div
                    className="absolute glass-dock px-6 py-3 rounded-2xl flex items-center gap-5 animate-scale-in z-50"
                    style={selectionDockStyle ?? { left: '50%', top: '5rem', transform: 'translateX(-50%)' }}
                >
                    {selection.type === 'state' ? (
                        <>
                            <div className="flex flex-col gap-1">
                                <span className="ui-kicker-2xs text-muted">Nome</span>
                                <input
                                    value={data.estados.find(e => e.id === selection.id)?.label || ''}
                                    onChange={(e) => onChange({ ...data, estados: data.estados.map(s => s.id === selection.id ? { ...s, label: e.target.value } : s) })}
                                    className="w-16 bg-transparent border-b border-default px-1 py-0.5 text-center font-bold text-sm outline-none focus:border-ios-blue text-primary"
                                />
                            </div>
                            {data.tipo === 'Moore' && (
                                <>
                                    <div className="h-6 w-px bg-border"></div>
                                    <div className="flex flex-col gap-1">
                                        <span className="ui-kicker-2xs text-muted">Saída</span>
                                        <input
                                            value={data.estados.find(e => e.id === selection.id)?.output ?? ''}
                                            onChange={(e) => onChange({
                                                ...data,
                                                estados: data.estados.map(s => s.id === selection.id ? { ...s, output: e.target.value } : s)
                                            })}
                                            className="w-16 bg-transparent border-b border-default px-1 py-0.5 text-center font-mono font-bold text-sm outline-none focus:border-ios-blue text-primary"
                                            placeholder="ex: 0"
                                        />
                                    </div>
                                </>
                            )}
                            <div className="h-6 w-px bg-border"></div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onChange({ ...data, estados: data.estados.map(s => s.id === selection.id ? { ...s, isInicial: !s.isInicial } : s) })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${data.estados.find(e => e.id === selection.id)?.isInicial ? 'bg-ios-blue border-ios-blue text-white' : 'bg-transparent border-default text-secondary hover:bg-surface-muted'}`}
                                >
                                    Inicial
                                </button>
                                <button
                                    onClick={() => onChange({ ...data, estados: data.estados.map(s => s.id === selection.id ? { ...s, isFinal: !s.isFinal } : s) })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${data.estados.find(e => e.id === selection.id)?.isFinal ? 'bg-ios-purple border-ios-purple text-white' : 'bg-transparent border-default text-secondary hover:bg-surface-muted'}`}
                                >
                                    Final
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <span className="ui-kicker-2xs text-muted">
                                {isTuringMachine ? 'Leitura/Escrita' : (data.tipo === 'AP' ? 'Rótulo' : 'Símbolo(s)')}
                            </span>
                            {isTuringMachine ? (
                                <div className="flex gap-2 items-center">
                                    <input
                                        value={turingRead}
                                        onChange={(e) => updateTuringTransition({ read: e.target.value })}
                                        className="w-20 bg-surface-muted rounded-md px-3 py-1.5 text-center font-mono font-bold text-sm outline-none focus:ring-2 ring-ios-blue/50 text-primary"
                                        placeholder="leitura"
                                        autoFocus
                                    />
                                    <span className="text-xs text-muted">-&gt;</span>
                                    <input
                                        value={turingWrite}
                                        onChange={(e) => updateTuringTransition({ write: e.target.value })}
                                        className="w-20 bg-surface-muted rounded-md px-3 py-1.5 text-center font-mono font-bold text-sm outline-none focus:ring-2 ring-ios-blue/50 text-primary"
                                        placeholder="escrita"
                                    />
                                    <select
                                        value={turingDir}
                                        onChange={(e) => updateTuringTransition({ direction: e.target.value as 'L' | 'R' | 'S' })}
                                        className="bg-surface-muted rounded-md px-2 py-1.5 text-xs font-bold text-primary outline-none"
                                    >
                                        <option value="L">L</option>
                                        <option value="R">R</option>
                                        <option value="S">S</option>
                                    </select>
                                </div>
                            ) : (
                                <div className="flex gap-2 items-center">
                                    <input
                                        value={data.transicoes.find(t => t.id === selection.id)?.simbolo || ''}
                                        onChange={(e) => onChange({
                                            ...data,
                                            transicoes: data.transicoes.map(t => t.id === selection.id ? { ...t, simbolo: e.target.value } : t)
                                        })}
                                        className={`w-32 bg-surface-muted rounded-md px-3 py-1.5 text-center font-mono font-bold text-sm outline-none focus:ring-2 ring-ios-blue/50 text-primary`}
                                        placeholder={data.tipo === 'AP' ? 'ex: a, Z -> AZ' : 'ex: a,b'}
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => onChange({
                                            ...data,
                                            transicoes: data.transicoes.map(t => t.id === selection.id ? { ...t, simbolo: EPSILON_SYMBOL } : t)
                                        })}
                                        className="px-2 py-1.5 rounded-md text-xs font-bold text-status-info bg-status-info-soft border border-status-info status-hover-info transition-colors"
                                        title={`Inserir ${EPSILON_SYMBOL}`}
                                    >
                                        {EPSILON_SYMBOL}
                                    </button>
                                    {data.tipo === 'Mealy' && (
                                        <input
                                            value={data.transicoes.find(t => t.id === selection.id)?.output ?? ''}
                                            onChange={(e) => onChange({
                                                ...data,
                                                transicoes: data.transicoes.map(t => t.id === selection.id ? { ...t, output: e.target.value } : t)
                                            })}
                                            className="w-16 bg-surface-muted rounded-md px-3 py-1.5 text-center font-mono font-bold text-sm outline-none focus:ring-2 ring-ios-blue/50 text-primary"
                                            placeholder="saída"
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {!readOnly && showTransitionHint && selection?.type === 'transition' && !contextMenu && (
                <div className="absolute left-1/2 top-6 -translate-x-1/2 z-[60] glass-panel px-4 py-3 rounded-2xl max-w-md">
                    <div className="text-xs font-semibold text-primary">
                        Dica rápida: arraste o ponto azul para curvar a transição.
                    </div>
                    <div className="text-xs text-secondary mt-1">
                        O rótulo acompanha a curva e uma linha auxiliar aparece quando ele precisa se afastar.
                    </div>
                    <div className="mt-2 flex justify-end">
                        <button
                            onClick={dismissTransitionHint}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-ios-blue hover:bg-status-info-soft transition-colors"
                        >
                            Entendi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

AutomatonCanvas.displayName = 'AutomatonCanvas';

