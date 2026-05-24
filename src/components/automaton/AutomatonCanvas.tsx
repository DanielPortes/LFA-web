import React, { useRef, useState, useMemo, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { Estado, Transicao, AutomatoData, Tool } from '../../types';
import { getMousePos, calculateControlOffsetFromPoint } from '../../utils/geometry';
import { calculateOptimalCurvatures, calculateSmartLabelPositions, resolveDraggedStateCollisions } from '../../utils/layout';
import { parseTuringTransition } from '../../utils/turingLogic';
import {
    CanvasContextMenu,
    CanvasSelectionDock,
    CanvasStateLayer,
    CanvasTransitionLayer,
    useCanvasKeyboard,
    useCanvasViewport
} from './canvas';

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
const STATE_DRAG_THRESHOLD_PX = 4;
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
    const stateDragMovedRef = useRef(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragMode, setDragMode] = useState<'state' | 'pan' | 'controlPoint'>('pan');

    // Use refs for drag positions to avoid re-renders
    const dragPositionsRef = useRef<Record<string, { x: number; y: number }>>({});
    const [dragPreviewPositions, setDragPreviewPositions] = useState<Record<string, { x: number; y: number }>>({});
    const [renderTick, setRenderTick] = useState(0);
    const rafRef = useRef<number | null>(null);
    const controlPointDraftRef = useRef<{ transitionId: string; controlPoint: { x: number; y: number } } | null>(null);
    const [controlPointDraft, setControlPointDraft] = useState<{ transitionId: string; controlPoint: { x: number; y: number } } | null>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [showTransitionHint, setShowTransitionHint] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(TRANSITION_HINT_STORAGE_KEY) !== '1';
    });

    const scheduleRender = useCallback(() => {
        if (rafRef.current !== null) return;
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            setDragPreviewPositions({ ...dragPositionsRef.current });
            setControlPointDraft(controlPointDraftRef.current ? { ...controlPointDraftRef.current, controlPoint: { ...controlPointDraftRef.current.controlPoint } } : null);
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
        const override = dragPreviewPositions[state.id];
        if (override) {
            return { ...state, x: override.x, y: override.y };
        }
        return state;
    }, [dragPreviewPositions]);


    const [creatingTransition, setCreatingTransition] = useState<{ from: string, toPoint: { x: number, y: number } } | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, type: 'canvas' | 'state' | 'transition', targetId?: string } | null>(null);

    // Selection Box
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
    const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });

    const {
        currentPan,
        resetViewport,
        setPan,
    } = useCanvasViewport({
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
        onFocusState: useCallback((focusedSelection) => {
            setSelection(focusedSelection);
            setSelectedStateIds([focusedSelection.id]);
        }, []),
    });

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
        setControlPointDraft(null);

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

    const commitDraggedStatePositions = useCallback(() => {
        const draggedIds = Object.keys(dragPositionsRef.current);
        if (draggedIds.length === 0) return;

        const draggedIdSet = new Set(draggedIds);
        const newEstados = data.estados.map(s => {
            const override = dragPositionsRef.current[s.id];
            if (override) {
                return { ...s, x: override.x, y: override.y };
            }
            return s;
        });

        const resolvedEstados = resolveDraggedStateCollisions(newEstados, draggedIdSet, MIN_STATE_SPACING);
        onChange({ ...data, estados: resolvedEstados });
        dragPositionsRef.current = {};
        setDragPreviewPositions({});
    }, [data, onChange]);

    const { isCtrlPressed, isSpacePressed } = useCanvasKeyboard({
        data,
        readOnly,
        selection,
        selectedStateIds,
        deleteState,
        deleteTransition,
        onChange,
        onClearSelection: () => {
            setSelectedStateIds([]);
            setSelectedTransitionIds([]);
            setSelection(null);
        },
        onSelectAll: (stateIds, transitionIds) => {
            setSelectedStateIds(stateIds);
            setSelectedTransitionIds(transitionIds);
        }
    });

    useEffect(() => {
        const closeMenu = () => setContextMenu(null);
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateSize = () => {
            setContainerSize({
                width: container.clientWidth,
                height: container.clientHeight
            });
        };

        updateSize();

        window.addEventListener('resize', updateSize);

        const resizeObserver = typeof ResizeObserver !== 'undefined'
            ? new ResizeObserver(updateSize)
            : null;
        resizeObserver?.observe(container);

        return () => {
            resizeObserver?.disconnect();
            window.removeEventListener('resize', updateSize);
        };
    }, []);

    // Global mouseup handler to commit drag even if mouse leaves window
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDraggingRef.current && dragTypeRef.current === 'state') {
                if (stateDragMovedRef.current) {
                    commitDraggedStatePositions();
                    setSelection(null);
                }
            }
            if (isDraggingRef.current && dragTypeRef.current === 'controlPoint') {
                commitControlPointDraft();
            }
            isDraggingRef.current = false;
            setIsDragging(false);
            dragTypeRef.current = 'pan';
            setDragMode('pan');
            dragTargetRef.current = null;
            stateDragMovedRef.current = false;
            setIsSelecting(false);
            scheduleRender();
        };

        window.addEventListener('mouseup', handleGlobalMouseUp);
        window.addEventListener('blur', handleGlobalMouseUp);
        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp);
            window.removeEventListener('blur', handleGlobalMouseUp);
        };
    }, [commitControlPointDraft, commitDraggedStatePositions, scheduleRender]);

    const snapToGridValue = useCallback((value: number) => (
        snapToGrid ? Math.round(value / GRID_SIZE) * GRID_SIZE : value
    ), [snapToGrid]);

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

    // --- Interaction Handlers ---

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        containerRef.current?.focus({ preventScroll: true });
        if (onInteract) onInteract();
        const pos = getMousePos(e.nativeEvent as any, svgRef.current);
        const isTouch = 'touches' in e;
        const isSpace = isSpacePressed && !isTouch && (e as React.MouseEvent).button === 0;
        const isMiddle = !isTouch && ((e as React.MouseEvent).button === 1 || ((e as React.MouseEvent).button === 0 && (e as React.MouseEvent).ctrlKey));

        if (isMiddle || isSpace) {
            const clientX = isTouch ? (e as unknown as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
            const clientY = isTouch ? (e as unknown as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;

            isDraggingRef.current = true;
            setIsDragging(true);
            dragTypeRef.current = 'pan';
            setDragMode('pan');
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
        setIsDragging(true);
        dragTypeRef.current = 'state';
        setDragMode('state');
        dragTargetRef.current = stateId;
        dragStartRef.current = { x: pos.x, y: pos.y };
        stateDragMovedRef.current = false;

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
        setIsDragging(true);
        dragTypeRef.current = 'controlPoint';
        setDragMode('controlPoint');
        dragTargetRef.current = transId;
        dragStartRef.current = { x: pos.x, y: pos.y };

        const currentTransition = data.transicoes.find((t) => t.id === transId);
        if (currentTransition?.controlPoint) {
            controlPointDraftRef.current = { transitionId: transId, controlPoint: { ...currentTransition.controlPoint } };
            setControlPointDraft({ transitionId: transId, controlPoint: { ...currentTransition.controlPoint } });
        } else {
            controlPointDraftRef.current = null;
            setControlPointDraft(null);
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
                const screenDx = pos.x - dragStartRef.current.x;
                const screenDy = pos.y - dragStartRef.current.y;
                const hasMovedPastClickThreshold = Math.hypot(screenDx, screenDy) >= STATE_DRAG_THRESHOLD_PX;

                if (!stateDragMovedRef.current && !hasMovedPastClickThreshold) {
                    return;
                }

                stateDragMovedRef.current = true;

                const dx = screenDx / zoom;
                const dy = screenDy / zoom;

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
                if (stateDragMovedRef.current) {
                    commitDraggedStatePositions();
                    setSelection(null);
                }
            }
            if (dragTypeRef.current === 'controlPoint') {
                commitControlPointDraft();
            }

            isDraggingRef.current = false;
            setIsDragging(false);
            dragTypeRef.current = 'pan';
            setDragMode('pan');
            dragTargetRef.current = null;
            stateDragMovedRef.current = false;
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
        if (containerSize.width === 0 || containerSize.height === 0) return undefined;

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
        const containerWidth = containerSize.width;
        const containerHeight = containerSize.height;

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
    }, [selection, readOnly, data.estados, labelPositions, currentPan, zoom, getRenderState, containerSize]);

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

    const handleSelectTransition = useCallback((transitionId: string, multi: boolean) => {
        setSelection({ type: 'transition', id: transitionId });
        if (!multi) {
            setSelectedTransitionIds([transitionId]);
            return;
        }
        setSelectedTransitionIds((previous) => (
            previous.includes(transitionId) ? previous : [...previous, transitionId]
        ));
    }, []);

    const creatingFromState = creatingTransition
        ? data.estados.find(e => e.id === creatingTransition.from)
        : null;
    const creatingFromRender = creatingFromState ? getRenderState(creatingFromState) : null;

    const getCursorClass = () => {
        if (dragMode === 'pan' && isDragging) return 'cursor-grabbing';
        if (isCtrlPressed || isSpacePressed) return 'cursor-grab';
        if (tool === 'state') return 'cursor-crosshair';
        if (tool === 'delete') return 'cursor-default';
        return '';
    };

    const canvasSummary = `${data.tipo} com ${data.estados.length} estados, ${data.transicoes.length} transições e ${
        activeStates.length
    } estados ativos. Ferramenta atual: ${readOnly ? 'somente leitura' : tool}.`;

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative overflow-hidden select-none bg-canvas focus:outline-none"
            tabIndex={0}
            data-automaton-editor="true"
            role="region"
            aria-label={`Canvas do autômato ${data.tipo}`}
        >
            <div className="sr-only" aria-live="polite">
                {canvasSummary}
            </div>
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: [
                        'linear-gradient(to right, color-mix(in srgb, var(--color-grid) 48%, transparent) 1px, transparent 1px)',
                        'linear-gradient(to bottom, color-mix(in srgb, var(--color-grid) 48%, transparent) 1px, transparent 1px)',
                    ].join(','),
                    backgroundSize: '24px 24px',
                    opacity: snapToGrid ? 0.5 : 0.22,
                }}
            />
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: [
                        'linear-gradient(to right, color-mix(in srgb, var(--color-grid-active) 70%, transparent) 1px, transparent 1px)',
                        'linear-gradient(to bottom, color-mix(in srgb, var(--color-grid-active) 70%, transparent) 1px, transparent 1px)',
                    ].join(','),
                    backgroundSize: '96px 96px',
                    opacity: snapToGrid ? 0.32 : 0.14,
                }}
            />

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
                    <CanvasTransitionLayer
                        data={data}
                        selection={selection}
                        selectedTransitionIds={selectedTransitionIds}
                        activeTransitions={activeTransitions}
                        readOnly={readOnly}
                        curvatures={curvatures}
                        labelPositions={labelPositions}
                        labelTexts={labelTexts}
                        getRenderState={getRenderState}
                        handleControlPointMouseDown={handleControlPointMouseDown}
                        controlPointDraft={controlPointDraft}
                        onSelectTransition={handleSelectTransition}
                        onOpenContextMenu={setContextMenu}
                    />

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

                    <CanvasStateLayer
                        data={data}
                        selection={selection}
                        selectedStateIds={selectedStateIds}
                        activeStates={activeStates}
                        getRenderState={getRenderState}
                        onStateMouseDown={handleStateMouseDown}
                    />
                </g>
            </svg>

            <CanvasContextMenu
                contextMenu={contextMenu}
                data={data}
                svgRef={svgRef}
                currentPan={currentPan}
                zoom={zoom}
                onClose={() => setContextMenu(null)}
                onChange={onChange}
                onDeleteState={deleteState}
                onDeleteTransition={deleteTransition}
                onCreateStateAtLogical={createStateAtLogical}
                onResetView={resetViewport}
            />

            <CanvasSelectionDock
                data={data}
                selection={selection}
                readOnly={readOnly}
                contextMenuOpen={!!contextMenu}
                isDragging={isDragging}
                selectionDockStyle={selectionDockStyle}
                onChange={onChange}
                isTuringMachine={isTuringMachine}
                turingRead={turingRead}
                turingWrite={turingWrite}
                turingDir={turingDir}
                onUpdateTuringTransition={updateTuringTransition}
            />

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

