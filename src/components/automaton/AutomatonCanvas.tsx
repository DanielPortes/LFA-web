import React, { useRef, useState, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { Estado, Transicao, AutomatoData, Tool } from '../../types';
import { calculatePath, getLabelPosition, getMousePos, calculateControlPoint, calculateControlOffsetFromPoint } from '../../utils/geometry';
import { EPSILON_SYMBOL } from '../../utils/symbols';
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
    snapToGrid?: boolean;
    onInteract?: () => void;
    focusStateId?: string | null;
    onFocusHandled?: () => void;
    onFitToContent?: () => void;
}

const GRID_SIZE = 40;
const STATE_RADIUS = 28;

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
    onFitToContent
}, ref) => {
    const svgRef = useRef<SVGSVGElement>(null);
    useImperativeHandle(ref, () => svgRef.current!, []);

    // Internal State
    const [selection, setSelection] = useState<{ type: 'state' | 'transition', id: string } | null>(null);
    const [selectedStateIds, setSelectedStateIds] = useState<string[]>([]);
    
    // Performance Optimization: Direct DOM Manipulation Refs
    // Instead of re-rendering React on every mouse move, we update these refs and transform DOM directly
    const dragRef = useRef<{
        isDragging: boolean;
        type: 'state' | 'pan' | 'controlPoint';
        targetId: string | null; // state ID or transition ID (for curve)
        startX: number;
        startY: number;
        initialObjPos: { x: number, y: number } | null; // For single state or control point
        initialStatesPos: Map<string, { x: number, y: number }>; // For multi-selection
    }>({
        isDragging: false,
        type: 'pan',
        targetId: null,
        startX: 0,
        startY: 0,
        initialObjPos: null,
        initialStatesPos: new Map()
    });

    const [creatingTransition, setCreatingTransition] = useState<{ from: string, toPoint: { x: number, y: number } } | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, type: 'canvas' | 'state' | 'transition', targetId?: string } | null>(null);
    
    // Internal Pan state if not controlled
    const [pan, setPanInternal] = useState({ x: 0, y: 0 });
    const currentPan = externalPan ?? pan;
    const setPan = onPanChange ?? setPanInternal;

    // Selection Box
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
    const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });

    // Initial Center
    useEffect(() => {
        if (data.estados.length > 0 && svgRef.current && currentPan.x === 0 && currentPan.y === 0) {
            // Logic to center... (omitted for brevity, assume works or done by parent 'fitToContent')
        }
    }, [data.estados.length]);

    // Handle External Focus
    useEffect(() => {
        if (!focusStateId) return;
        const target = data.estados.find(s => s.id === focusStateId);
        if (!target) return;
        setSelection({ type: 'state', id: target.id });
        setSelectedStateIds([target.id]);
        if (svgRef.current) {
            const rect = svgRef.current.getBoundingClientRect();
            setPan({
                x: rect.width / 2 - target.x * zoom,
                y: rect.height / 2 - target.y * zoom
            });
        }
        onFocusHandled?.();
    }, [focusStateId, data.estados, zoom, onFocusHandled, setPan]);

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
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [readOnly]);

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
                    setSelection(null);
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                setSelectedStateIds(data.estados.map(s => s.id));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selection, selectedStateIds, data, readOnly]);

    useEffect(() => {
        const closeMenu = () => setContextMenu(null);
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);

    const deleteState = (id: string) => {
        onChange({
            ...data,
            estados: data.estados.filter(e => e.id !== id),
            transicoes: data.transicoes.filter(t => t.de !== id && t.para !== id)
        });
        setSelection(null);
    };

    const deleteTransition = (id: string) => {
        onChange({ ...data, transicoes: data.transicoes.filter(t => t.id !== id) });
        setSelection(null);
    };

    const snapToGridValue = (value: number) => snapToGrid ? Math.round(value / GRID_SIZE) * GRID_SIZE : value;

    // --- Interaction Handlers ---

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (onInteract) onInteract();
        const pos = getMousePos(e.nativeEvent as any, svgRef.current);
        const isTouch = 'touches' in e;
        const isSpace = isSpacePressed.current && !isTouch && (e as React.MouseEvent).button === 0;
        const isMiddle = !isTouch && (e as React.MouseEvent).button === 1;

        if (isMiddle || isSpace) {
             const clientX = isTouch ? (e as unknown as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
             const clientY = isTouch ? (e as unknown as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;

             dragRef.current = {
                isDragging: true,
                type: 'pan',
                targetId: null,
                startX: clientX,
                startY: clientY,
                initialObjPos: { x: currentPan.x, y: currentPan.y },
                initialStatesPos: new Map()
             };
             return;
        }
        
        // Canvas Click
        if ((e.target as Element).tagName === 'svg') {
             if (tool === 'state' && !readOnly) {
                 const x = (pos.x - currentPan.x) / zoom;
                 const y = (pos.y - currentPan.y) / zoom;
                 const newState: Estado = {
                     id: generateId('q'),
                     label: getNextStateLabel(data.estados),
                     x: snapToGridValue(x),
                     y: snapToGridValue(y),
                     isFinal: false,
                     isInicial: data.estados.length === 0
                 };
                 onChange({ ...data, estados: [...data.estados, newState] });
             } else if (tool === 'pointer') {
                 // Start Selection Box
                 if (!(e as React.MouseEvent).shiftKey) {
                     setSelection(null);
                     setSelectedStateIds([]);
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

    const handleStateMouseDown = (e: React.MouseEvent | React.TouchEvent, stateId: string) => {
        e.stopPropagation();
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

        // Pointer Tool: Logic for Selection + Dragging
        // Handle Multi-selection modifiers
        const isMultiSelect = (e as React.MouseEvent).shiftKey || (e as React.MouseEvent).ctrlKey || (e as React.MouseEvent).metaKey;
        
        let newSelectedIds = [...selectedStateIds];
        if (isMultiSelect) {
            if (newSelectedIds.includes(stateId)) {
                // If clicking an already selected item with shift, usually we don't deselect immediately on mousedown if dragging
                // but for simplicity, let's keep it selected
            } else {
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
        const initialStatesPos = new Map<string, {x:number, y:number}>();
        data.estados.forEach(s => {
            if (newSelectedIds.includes(s.id)) {
                initialStatesPos.set(s.id, { x: s.x, y: s.y });
            }
        });

        dragRef.current = {
            isDragging: true,
            type: 'state',
            targetId: stateId, // Main dragged item
            startX: pos.x,
            startY: pos.y,
            initialObjPos: null,
            initialStatesPos
        };
    };

    const handleControlPointMouseDown = (e: React.MouseEvent, transId: string) => {
        e.stopPropagation();
        e.preventDefault();
        if (readOnly) return;
        
        const pos = getMousePos(e.nativeEvent, svgRef.current);
        const trans = data.transicoes.find(t => t.id === transId);
        
        if (trans) {
            setSelection({ type: 'transition', id: transId });
            dragRef.current = {
                isDragging: true,
                type: 'controlPoint',
                targetId: transId,
                startX: pos.x,
                startY: pos.y,
                initialObjPos: { x: trans.curvatura, y: 0 }, // Store initial curvature in X
                initialStatesPos: new Map()
            };
        }
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        const pos = getMousePos(e.nativeEvent as any, svgRef.current);
        
        if (dragRef.current.isDragging) {
            const dx = (pos.x - dragRef.current.startX) / zoom;
            const dy = (pos.y - dragRef.current.startY) / zoom;
            
            if (dragRef.current.type === 'pan') {
                 // Pan Logic
                 const isTouch = 'touches' in e;
                 const clientX = isTouch ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
                 const clientY = isTouch ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
                 
                 const rawDx = clientX - dragRef.current.startX;
                 const rawDy = clientY - dragRef.current.startY;
                 
                 setPan({
                     x: dragRef.current.initialObjPos!.x + rawDx,
                     y: dragRef.current.initialObjPos!.y + rawDy
                 });
                 return;
            }

            if (dragRef.current.type === 'state') {
                // VISUAL UPDATE ONLY (No React Render)
                dragRef.current.initialStatesPos.forEach((initialPos, id) => {
                    const el = document.getElementById(`group-${id}`);
                    if (el) {
                        let newX = initialPos.x + dx;
                        let newY = initialPos.y + dy;
                        if (snapToGrid) {
                            newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
                            newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
                        }
                        el.setAttribute('transform', `translate(${newX}, ${newY})`);
                        
                        // Also update connected transitions visually? 
                        // Too complex for simple DOM manip, we might let them lag or try to update paths.
                        // For high performance, we typically hide transitions or let them look broken until MouseUp.
                        // Or we force a React render if frames drop.
                        // For this implementation, let's keep it simple: Only moving states update smoothly,
                        // lines will snap at end. 
                    }
                });
            }

            if (dragRef.current.type === 'controlPoint') {
                const transId = dragRef.current.targetId!;
                const trans = data.transicoes.find(t => t.id === transId);
                const source = data.estados.find(s => s.id === trans?.de);
                const target = data.estados.find(s => s.id === trans?.para);
                
                if (source && target) {
                    // Calculate new curvature based on mouse position
                    // We need logical mouse pos (unzoomed relative to canvas 0,0)
                    const logicalMouse = {
                        x: (pos.x - currentPan.x) / zoom,
                        y: (pos.y - currentPan.y) / zoom
                    };
                    
                    const newControlPoint = calculateControlOffsetFromPoint(source, target, logicalMouse);
                    
                    // Directly update the transition path in DOM if possible, or trigger fast render?
                    // React render is safer for paths because of complex calc.
                    // For single item drag, React is usually fast enough.
                    // Let's force update local state only for this transition to avoid full redraw?
                    // No, let's just commit to React state for curvature drag, it's rare operation.
                    
                    // Actually, we should try to avoid full app rerender.
                    // Let's just update the data. It might be smooth enough for single curve.
                    onChange({
                         ...data,
                         transicoes: data.transicoes.map(t => t.id === transId ? { ...t, controlPoint: newControlPoint } : t)
                    });
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

    const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
        if (dragRef.current.isDragging) {
            if (dragRef.current.type === 'state') {
                // Commit changes
                const pos = getMousePos(e.nativeEvent as any, svgRef.current);
                const dx = (pos.x - dragRef.current.startX) / zoom;
                const dy = (pos.y - dragRef.current.startY) / zoom;

                const newEstados = data.estados.map(s => {
                    if (dragRef.current.initialStatesPos.has(s.id)) {
                        const init = dragRef.current.initialStatesPos.get(s.id)!;
                        let newX = init.x + dx;
                        let newY = init.y + dy;
                        if (snapToGrid) {
                            newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
                            newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
                        }
                        return { ...s, x: newX, y: newY };
                    }
                    return s;
                });
                onChange({ ...data, estados: newEstados });
            }
            dragRef.current.isDragging = false;
        } else if (creatingTransition) {
             const targetState = [...data.estados].reverse().find(s => {
                 const logicalMouse = creatingTransition.toPoint;
                 const dist = Math.sqrt(Math.pow(s.x - logicalMouse.x, 2) + Math.pow(s.y - logicalMouse.y, 2));
                 return dist <= STATE_RADIUS;
             });

             if (targetState) {
                 const existing = data.transicoes.find(t => t.de === creatingTransition.from && t.para === targetState.id && t.simbolo === '');
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
             // Calculate selection
             const x1 = Math.min(selectionStart.x, selectionEnd.x);
             const x2 = Math.max(selectionStart.x, selectionEnd.x);
             const y1 = Math.min(selectionStart.y, selectionEnd.y);
             const y2 = Math.max(selectionStart.y, selectionEnd.y);
             
             const selected = data.estados.filter(s => s.x >= x1 && s.x <= x2 && s.y >= y1 && s.y <= y2).map(s => s.id);
             setSelectedStateIds(selected);
             if (selected.length === 1) setSelection({ type: 'state', id: selected[0] });
             else if (selected.length > 0) setSelection(null);
             
             setIsSelecting(false);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        if (readOnly) return;
        const pos = getMousePos(e.nativeEvent as any, svgRef.current);
        const logicalPos = { x: (pos.x - currentPan.x) / zoom, y: (pos.y - currentPan.y) / zoom };
        
        // Find state under mouse
        const clickedState = [...data.estados].reverse().find(s => {
             const dx = s.x - logicalPos.x;
             const dy = s.y - logicalPos.y;
             return dx * dx + dy * dy <= STATE_RADIUS * STATE_RADIUS;
        });

        if (clickedState) {
            setContextMenu({ x: e.clientX, y: e.clientY, type: 'state', targetId: clickedState.id });
        } else {
            // Check transitions? Too hard to click exact line, context menu on canvas is fine
            setContextMenu({ x: e.clientX, y: e.clientY, type: 'canvas' });
        }
    };

    // Render Transitions
    const renderTransitions = useMemo(() => {
        // Group transitions to handle multiple edges between same states
        // Actually, we now support manual curvature, so automatic grouping might fight with manual setting.
        // Let's respect manual curvature if non-zero, else auto-layout.
        
        const groups: Record<string, Transicao[]> = {};
        data.transicoes.forEach(t => {
            const pair = [t.de, t.para].sort().join('-');
            if (!groups[pair]) groups[pair] = [];
            groups[pair].push(t);
        });

        const elements: React.ReactElement[] = [];
        
        // We iterate flat list to keep React keys stable and simple, 
        // but we need to know index in group for default curvature
        
        data.transicoes.forEach(t => {
            const source = data.estados.find(e => e.id === t.de);
            const target = data.estados.find(e => e.id === t.para);
            if (!source || !target) return;

            const controlPointOffset = t.controlPoint ?? null;
            const hasManualControl = controlPointOffset !== null && controlPointOffset !== undefined;
            let curve = t.curvatura;
            
            // Auto-layout only if curve is exactly 0 and there are multiple edges
            // Or if it's a loop
            if (curve === 0 && !hasManualControl) {
                 const isLoop = t.de === t.para;
                 if (isLoop) {
                     // Find loop index
                     const loops = data.transicoes.filter(tr => tr.de === t.de && tr.para === t.para);
                     const idx = loops.indexOf(t);
                     curve = -50 + (idx * 25);
                 } else {
                     // Find parallel edges
                     // Only auto-curve if strictly 0. If user set to 0.1, we respect it.
                     const pair = [t.de, t.para].sort().join('-');
                     const group = groups[pair] || [];
                     if (group.length > 1) {
                         const idx = group.indexOf(t);
                         const direction = t.de < t.para ? 1 : -1;
                         const spread = 50;
                         const centerOffset = (group.length - 1) * spread / 2;
                         curve = ((idx * spread) - centerOffset) * direction;
                         if (Math.abs(curve) < 10) curve = 30 * direction;
                     }
                 }
            }

            const pathD = calculatePath(source, target, curve, controlPointOffset);
            const labelPos = getLabelPosition(source, target, curve, controlPointOffset);
            const isSelected = selection?.type === 'transition' && selection.id === t.id;
            const isActive = activeTransitions.includes(t.id);
            
            // Control Point for Bezier (Midpoint of curve)
            const controlPoint = calculateControlPoint(source, target, curve, controlPointOffset);

            elements.push(
                <g
                    key={t.id}
                    className="group/trans"
                    onClick={(e) => { e.stopPropagation(); setSelection({ type: 'transition', id: t.id }); }}
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
                        className={`transition-colors duration-300 fill-none pointer-events-none
                            ${isSelected ? 'stroke-ios-blue stroke-[2.5px] filter drop-shadow-md' :
                                isActive ? 'stroke-ios-green stroke-[3px] animate-pulse' :
                                    'stroke-[var(--stroke-idle)] stroke-2 group-hover/trans:stroke-[var(--stroke-hover)]'
                            }`}
                        markerEnd={`url(#${isSelected ? 'arrow-selected' : (isActive ? 'arrow-active' : 'arrow')})`}
                    />
                    
                    {/* Label */}
                    <g transform={`translate(${labelPos.x}, ${labelPos.y})`}>
                        <rect
                            x="-14" y="-12" width="28" height="24" rx="8"
                            className={`transition-colors duration-200 cursor-pointer ${isSelected ? 'fill-ios-blue shadow-lg' :
                                isActive ? 'fill-ios-green' :
                                    t.simbolo === '' ? 'fill-red-50 dark:fill-red-900/20 stroke-ios-red/40' :
                                        'fill-white stroke-[var(--border-color)]'
                                }`}
                        />
                        <text
                            dy="5" textAnchor="middle"
                            className={`text-[11px] font-mono font-bold select-none pointer-events-none ${isSelected || isActive ? 'fill-white' :
                                t.simbolo === '' ? 'fill-ios-red' : 'fill-[var(--text-primary)]'
                                }`}
                        >
                            {t.simbolo === '' ? '?' : t.simbolo}
                        </text>
                    </g>
                    
                    {/* Control Handle (Only when selected) */}
                    {isSelected && !readOnly && (
                        <circle
                            cx={controlPoint.x}
                            cy={controlPoint.y}
                            r={6}
                            className="fill-white stroke-ios-blue stroke-2 cursor-grab active:cursor-grabbing hover:scale-125 transition-transform shadow-sm"
                            onMouseDown={(e) => handleControlPointMouseDown(e, t.id)}
                        />
                    )}
                </g>
            );
        });
        return elements;
    }, [data, selection, activeStates, activeTransitions, readOnly]);

    return (
        <div className="w-full h-full relative overflow-hidden select-none bg-[var(--canvas-bg)]">
            <div className={`absolute inset-0 bg-grid-pattern pointer-events-none ${snapToGrid ? 'grid-active' : 'opacity-60'}`} />

            <svg
                ref={svgRef}
                className={`w-full h-full touch-none outline-none ${tool === 'state' ? 'cursor-crosshair' : ''}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
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

                    {creatingTransition && (
                        <line
                            x1={data.estados.find(e => e.id === creatingTransition.from)?.x}
                            y1={data.estados.find(e => e.id === creatingTransition.from)?.y}
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
                        const isSelected = (selection?.type === 'state' && selection.id === s.id) || selectedStateIds.includes(s.id);
                        const isActive = activeStates.includes(s.id);
                        return (
                            <g
                                key={s.id}
                                id={`group-${s.id}`}
                                transform={`translate(${s.x}, ${s.y})`}
                                onMouseDown={(e) => handleStateMouseDown(e, s.id)}
                                className="cursor-grab active:cursor-grabbing hover:brightness-110"
                            >
                                {s.isInicial && (
                                    <path d="M -50 0 L -32 0" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrow)" className="text-[var(--stroke-idle)] opacity-70" />
                                )}
                                <circle r="28" className="fill-transparent" />
                                <circle
                                    r={isSelected || isActive ? 28 : 26}
                                    className={`transition-colors duration-200
                                        ${isActive ? 'fill-ios-green stroke-ios-green shadow-[0_0_20px_rgba(52,199,89,0.6)]' :
                                            (isSelected ? 'fill-ios-blue stroke-ios-blue shadow-[0_0_15px_rgba(0,122,255,0.4)]' :
                                                'fill-white stroke-[var(--stroke-idle)]')}`}
                                    strokeWidth={isSelected || isActive ? 2.5 : 2}
                                />
                                {s.isFinal && (
                                    <circle r="22" fill="none" className={`pointer-events-none ${isActive || isSelected ? 'stroke-white' : 'stroke-[var(--stroke-idle)]'}`} strokeWidth="1.5" />
                                )}
                                <text dy="5" textAnchor="middle" className={`text-xs font-bold select-none pointer-events-none font-mono ${isActive || isSelected ? 'fill-white' : 'fill-[var(--text-primary)]'}`}>
                                    {s.label}
                                </text>
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
                                        let x = (mouseX - currentPan.x) / zoom;
                                        let y = (mouseY - currentPan.y) / zoom;
                                        if (snapToGrid) {
                                            x = Math.round(x / GRID_SIZE) * GRID_SIZE;
                                            y = Math.round(y / GRID_SIZE) * GRID_SIZE;
                                        }
                                        const newState: Estado = {
                                            id: generateId('q'),
                                            label: getNextStateLabel(data.estados),
                                            x, y,
                                            isFinal: false,
                                            isInicial: data.estados.length === 0
                                        };
                                        onChange({ ...data, estados: [...data.estados, newState] });
                                    }
                                }
                            },
                            {
                                label: 'Resetar View',
                                icon: <RotateCcw size={14} />,
                                action: () => {
                                    if (onFitToContent) onFitToContent();
                                    else {
                                        if (onZoomChange) onZoomChange(1);
                                        setPan({ x: 0, y: 0 });
                                    }
                                }
                            }
                        ]
                    }
                />
            )}

            {/* Selection Dock */}
            {!readOnly && selection && !contextMenu && !dragRef.current.isDragging && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 glass-dock px-6 py-3 rounded-2xl flex items-center gap-5 animate-scale-in z-50">
                    {selection.type === 'state' ? (
                        <>
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Nome</span>
                                <input
                                    value={data.estados.find(e => e.id === selection.id)?.label || ''}
                                    onChange={(e) => onChange({ ...data, estados: data.estados.map(s => s.id === selection.id ? { ...s, label: e.target.value } : s) })}
                                    className="w-16 bg-transparent border-b border-gray-300 dark:border-gray-600 px-1 py-0.5 text-center font-bold text-sm outline-none focus:border-ios-blue text-[var(--text-primary)]"
                                />
                            </div>
                            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onChange({ ...data, estados: data.estados.map(s => s.id === selection.id ? { ...s, isInicial: !s.isInicial } : s) })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${data.estados.find(e => e.id === selection.id)?.isInicial ? 'bg-ios-blue border-ios-blue text-white' : 'bg-transparent border-gray-300 dark:border-gray-600 text-[var(--text-secondary)] hover:bg-gray-200 dark:hover:bg-white/10'}`}
                                >
                                    Inicial
                                </button>
                                <button
                                    onClick={() => onChange({ ...data, estados: data.estados.map(s => s.id === selection.id ? { ...s, isFinal: !s.isFinal } : s) })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${data.estados.find(e => e.id === selection.id)?.isFinal ? 'bg-ios-purple border-ios-purple text-white' : 'bg-transparent border-gray-300 dark:border-gray-600 text-[var(--text-secondary)] hover:bg-gray-200 dark:hover:bg-white/10'}`}
                                >
                                    Final
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Símbolo(s)</span>
                            <div className="flex gap-2 items-center">
                                <input
                                    value={data.transicoes.find(t => t.id === selection.id)?.simbolo || ''}
                                    onChange={(e) => onChange({
                                        ...data,
                                        transicoes: data.transicoes.map(t => t.id === selection.id ? { ...t, simbolo: e.target.value } : t)
                                    })}
                                    className={`w-32 bg-gray-100 dark:bg-white/10 rounded-md px-3 py-1.5 text-center font-mono font-bold text-sm outline-none focus:ring-2 ring-ios-blue/50 text-[var(--text-primary)]`}
                                    placeholder="ex: a,b"
                                    autoFocus
                                />
                                <button
                                    onClick={() => onChange({
                                        ...data,
                                        transicoes: data.transicoes.map(t => t.id === selection.id ? { ...t, simbolo: EPSILON_SYMBOL } : t)
                                    })}
                                    className="px-2 py-1.5 rounded-md text-xs font-bold text-ios-blue bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                    title="Inserir ε"
                                >
                                    ε
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

AutomatonCanvas.displayName = 'AutomatonCanvas';
