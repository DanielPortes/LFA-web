import React, { useRef, useState, useMemo, useEffect } from 'react';
import type { Estado, Transicao, AutomatoData, Tool } from '../../types';
import { calculatePath, getLabelPosition, getMousePos } from '../../utils/geometry';
import { ContextMenu } from '../ui/ContextMenu';
import { Trash2, Edit, Plus, RotateCcw, Check, Flag } from 'lucide-react';

interface CanvasProps {
    data: AutomatoData;
    tool: Tool;
    onChange: (data: AutomatoData) => void;
    activeStates?: string[];
    readOnly?: boolean;
    zoom?: number;
    onZoomChange?: (newZoom: number) => void;
    onInteract?: () => void;
}

export const AutomatonCanvas: React.FC<CanvasProps> = ({
    data,
    tool,
    onChange,
    activeStates = [],
    readOnly = false,
    zoom = 1,
    onZoomChange,
    onInteract
}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    // Interaction State
    const [selection, setSelection] = useState<{ type: 'state' | 'transition', id: string } | null>(null);
    const [draggingStateId, setDraggingStateId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const [creatingTransition, setCreatingTransition] = useState<{ from: string, toPoint: { x: number, y: number } } | null>(null);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    // Area Selection State
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
    const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
    const [selectedStateIds, setSelectedStateIds] = useState<string[]>([]);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, type: 'canvas' | 'state' | 'transition', targetId?: string } | null>(null);

    // Auto-center on load
    useEffect(() => {
        if (data.estados.length > 0 && svgRef.current) {
            const minX = Math.min(...data.estados.map(s => s.x));
            const maxX = Math.max(...data.estados.map(s => s.x));
            const minY = Math.min(...data.estados.map(s => s.y));
            const maxY = Math.max(...data.estados.map(s => s.y));

            // Simple centering logic if needed
            if (pan.x === 0 && pan.y === 0) {
                // Placeholder for auto-center logic
            }
        }
    }, []);

    // Shortcuts for Delete and Select All
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (readOnly) return;

            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selection?.type === 'state') {
                    deleteState(selection.id);
                } else if (selection?.type === 'transition') {
                    deleteTransition(selection.id);
                } else if (selectedStateIds.length > 0) {
                    const newEstados = data.estados.filter(e => !selectedStateIds.includes(e.id));
                    const newTransicoes = data.transicoes.filter(t => !selectedStateIds.includes(t.de) && !selectedStateIds.includes(t.para));
                    onChange({ ...data, estados: newEstados, transicoes: newTransicoes });
                    setSelectedStateIds([]);
                    setSelection(null);
                }
            }

            // Select All (Ctrl+A)
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                setSelectedStateIds(data.estados.map(s => s.id));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selection, selectedStateIds, data, readOnly]);

    // Close menu on interaction
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

    // Helper to get mouse position adjusted for zoom and pan
    const getAdjustedMousePos = (e: React.MouseEvent) => {
        const pos = getMousePos(e, svgRef.current);
        return {
            x: (pos.x - pan.x) / zoom,
            y: (pos.y - pan.y) / zoom
        };
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (onZoomChange) {
            const newZoom = Math.max(0.1, Math.min(2, zoom - e.deltaY * 0.001));
            onZoomChange(newZoom);
        }
    };

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

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (readOnly) return;
        if (e.target === svgRef.current) {
            const pos = getAdjustedMousePos(e);
            const newState: Estado = {
                id: `q${Date.now()}`,
                label: `q${data.estados.length}`,
                x: pos.x,
                y: pos.y,
                isFinal: false,
                isInicial: data.estados.length === 0
            };
            onChange({ ...data, estados: [...data.estados, newState] });
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (onInteract) onInteract();

        // Middle mouse or Space+Click for panning
        if (e.button === 1 || (e.button === 0 && isSpacePressed.current)) {
            setIsPanning(true);
            setLastMousePos({ x: e.clientX, y: e.clientY });
            e.preventDefault();
            return;
        }

        if (readOnly) return;

        if (e.target === svgRef.current) {
            if (tool === 'state') {
                const pos = getAdjustedMousePos(e);
                const newState: Estado = {
                    id: `q${Date.now()}`,
                    label: `q${data.estados.length}`,
                    x: pos.x,
                    y: pos.y,
                    isFinal: false,
                    isInicial: data.estados.length === 0
                };
                onChange({ ...data, estados: [...data.estados, newState] });
            } else if (tool === 'pointer') {
                // If clicking on empty space without Shift/Ctrl, clear selection
                if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
                    setSelection(null);
                    setSelectedStateIds([]);
                }

                const pos = getAdjustedMousePos(e);
                setIsSelecting(true);
                setSelectionStart(pos);
                setSelectionEnd(pos);
            } else {
                setSelection(null);
            }
        }
    };

    const handleStateMouseDown = (e: React.MouseEvent, stateId: string) => {
        if (onInteract) onInteract();
        if (readOnly) return;
        e.stopPropagation();

        if (tool === 'delete') {
            deleteState(stateId);
            return;
        }

        const pos = getAdjustedMousePos(e);
        const currentState = data.estados.find(s => s.id === stateId);

        if (tool === 'transition') {
            setCreatingTransition({ from: stateId, toPoint: { x: pos.x, y: pos.y } });
        } else {
            // Multi-selection logic
            if (e.shiftKey || e.ctrlKey || e.metaKey) {
                if (selectedStateIds.includes(stateId)) {
                    setSelectedStateIds(selectedStateIds.filter(id => id !== stateId));
                    if (selection?.id === stateId) setSelection(null);
                } else {
                    setSelectedStateIds([...selectedStateIds, stateId]);
                    setSelection({ type: 'state', id: stateId });
                }
            } else {
                // If clicking an unselected state without modifiers, select only it
                if (!selectedStateIds.includes(stateId)) {
                    setSelection({ type: 'state', id: stateId });
                    setSelectedStateIds([stateId]);
                }
                // If clicking a selected state, keep selection (for dragging)
            }

            if (currentState) {
                setDraggingStateId(stateId);
                setDragOffset({
                    x: pos.x - currentState.x,
                    y: pos.y - currentState.y
                });
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            const dx = e.clientX - lastMousePos.x;
            const dy = e.clientY - lastMousePos.y;
            setPan(p => ({ x: p.x + dx, y: p.y + dy }));
            setLastMousePos({ x: e.clientX, y: e.clientY });
            return;
        }

        const pos = getAdjustedMousePos(e);

        if (readOnly) return;

        if (isSelecting) {
            setSelectionEnd(pos);
            return;
        }

        if (draggingStateId) {
            const draggedState = data.estados.find(s => s.id === draggingStateId);
            if (!draggedState) return;

            // Calculate delta movement
            const newX = pos.x - dragOffset.x;
            const newY = pos.y - dragOffset.y;
            const dx = newX - draggedState.x;
            const dy = newY - draggedState.y;

            if (selectedStateIds.includes(draggingStateId)) {
                // Move all selected states
                onChange({
                    ...data,
                    estados: data.estados.map(st =>
                        selectedStateIds.includes(st.id)
                            ? { ...st, x: st.x + dx, y: st.y + dy }
                            : st
                    )
                });
            } else {
                // Move only the dragged state (shouldn't happen often with logic above, but safe fallback)
                onChange({
                    ...data,
                    estados: data.estados.map(st =>
                        st.id === draggingStateId
                            ? { ...st, x: newX, y: newY }
                            : st
                    )
                });
            }
        } else if (creatingTransition) {
            setCreatingTransition({ ...creatingTransition, toPoint: { x: pos.x, y: pos.y } });
        }
    };

    const handleMouseUp = () => {
        if (isSelecting) {
            const x1 = Math.min(selectionStart.x, selectionEnd.x);
            const y1 = Math.min(selectionStart.y, selectionEnd.y);
            const x2 = Math.max(selectionStart.x, selectionEnd.x);
            const y2 = Math.max(selectionStart.y, selectionEnd.y);

            const selected = data.estados.filter(s =>
                s.x >= x1 && s.x <= x2 && s.y >= y1 && s.y <= y2
            ).map(s => s.id);

            setSelectedStateIds(selected);
            if (selected.length === 1) {
                setSelection({ type: 'state', id: selected[0] });
            } else if (selected.length > 0) {
                setSelection(null); // Multiple selected, no single primary selection for properties yet
            }
            setIsSelecting(false);
        }

        setIsPanning(false);
        setDraggingStateId(null);
        if (creatingTransition) setCreatingTransition(null);
    };

    const handleStateMouseUp = (e: React.MouseEvent, targetId: string) => {
        if (creatingTransition) {
            e.stopPropagation();
            const fromId = creatingTransition.from;
            const existing = data.transicoes.find(t => t.de === fromId && t.para === targetId && t.simbolo === 'λ');

            if (!existing) {
                const newTrans: Transicao = {
                    id: `t${Date.now()}`,
                    de: fromId,
                    para: targetId,
                    simbolo: 'λ',
                    curvatura: 0
                };
                onChange({ ...data, transicoes: [...data.transicoes, newTrans] });
                setSelection({ type: 'transition', id: newTrans.id });
            }
            setCreatingTransition(null);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        if (readOnly) return;

        const pos = getAdjustedMousePos(e);

        // Check if clicked on state
        const clickedState = [...data.estados].reverse().find(s => {
            const dx = s.x - pos.x;
            const dy = s.y - pos.y;
            return dx * dx + dy * dy <= 28 * 28; // 28 is radius
        });

        if (clickedState) {
            setContextMenu({ x: e.clientX, y: e.clientY, type: 'state', targetId: clickedState.id });
            return;
        }

        setContextMenu({ x: e.clientX, y: e.clientY, type: 'canvas' });
    };

    const handleStateContextMenu = (e: React.MouseEvent, stateId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (readOnly) return;
        setContextMenu({ x: e.clientX, y: e.clientY, type: 'state', targetId: stateId });
    };

    const handleTransitionContextMenu = (e: React.MouseEvent, transId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (readOnly) return;
        setContextMenu({ x: e.clientX, y: e.clientY, type: 'transition', targetId: transId });
    };

    const renderTransitions = useMemo(() => {
        const groups: Record<string, Transicao[]> = {};

        data.transicoes.forEach(t => {
            const key = t.de < t.para ? `${t.de}-${t.para}` : `${t.para}-${t.de}`;
            const groupKey = t.de === t.para ? `loop-${t.de}` : key;
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(t);
        });

        const elements: React.ReactElement[] = [];

        Object.values(groups).forEach(group => {
            const count = group.length;
            const isLoop = group[0].de === group[0].para;

            group.forEach((t, index) => {
                const source = data.estados.find(e => e.id === t.de);
                const target = data.estados.find(e => e.id === t.para);
                if (!source || !target) return;

                let curve = 0;

                if (isLoop) {
                    curve = -50 + (index * 25);
                } else {
                    const direction = t.de < t.para ? 1 : -1;
                    if (count === 1) {
                        curve = 0;
                    } else {
                        const spread = 50;
                        const centerOffset = (count - 1) * spread / 2;
                        const rawOffset = (index * spread) - centerOffset;
                        curve = rawOffset * direction;
                        if (Math.abs(curve) < 10 && count > 1) curve = 30 * direction;
                    }
                }

                const pathD = calculatePath(source, target, curve);
                const labelPos = getLabelPosition(source, target, curve);
                const isSelected = selection?.type === 'transition' && selection.id === t.id;
                const isActive = activeStates.includes(t.de) && activeStates.includes(t.para);

                elements.push(
                    <g
                        key={t.id}
                        onClick={(e) => { e.stopPropagation(); setSelection({ type: 'transition', id: t.id }); }}
                        onContextMenu={(e) => handleTransitionContextMenu(e, t.id)}
                        className="group/trans cursor-pointer"
                    >
                        <path d={pathD} stroke="transparent" strokeWidth="20" fill="none" />
                        <path
                            d={pathD}
                            className={`transition-colors duration-300 fill-none 
                                ${isSelected ? 'stroke-ios-blue stroke-[2.5px] filter drop-shadow-md' :
                                    isActive ? 'stroke-ios-green stroke-[2.5px]' :
                                        'stroke-[var(--stroke-idle)] stroke-2 group-hover/trans:stroke-[var(--stroke-hover)]'
                                }`}
                            markerEnd={`url(#${isSelected ? 'arrow-selected' : (isActive ? 'arrow-active' : 'arrow')})`}
                        />
                        <g transform={`translate(${labelPos.x}, ${labelPos.y})`}>
                            <rect
                                x="-14" y="-12" width="28" height="24" rx="8"
                                className={`transition-all duration-200 ${isSelected ? 'fill-ios-blue shadow-lg' :
                                    'fill-[var(--bg-card)] stroke-[var(--border-color)] stroke-1'
                                    }`}
                            />
                            <text
                                dy="5" textAnchor="middle"
                                className={`text-[11px] font-mono font-bold select-none pointer-events-none ${isSelected ? 'fill-white' : 'fill-[var(--text-primary)]'
                                    }`}
                            >
                                {t.simbolo}
                            </text>
                        </g>
                    </g>
                );
            });
        });
        return elements;
    }, [data, selection, activeStates]);

    return (
        <div className="w-full h-full relative overflow-hidden select-none bg-[var(--canvas-bg)] transition-colors duration-500">
            <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />

            <svg
                ref={svgRef}
                className={`w-full h-full touch-none outline-none ${tool === 'state' ? 'cursor-crosshair' : (isPanning ? 'cursor-grabbing' : 'cursor-default')}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
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
                    <marker id="arrow-active" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="userSpaceOnUse">
                        <path d="M2,2 L10,6 L2,10 L4,6 Z" className="fill-ios-green" />
                    </marker>
                </defs>

                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
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

                    {/* Selection Box */}
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
                                transform={`translate(${s.x}, ${s.y})`}
                                onMouseDown={(e) => handleStateMouseDown(e, s.id)}
                                onMouseUp={(e) => handleStateMouseUp(e, s.id)}
                                onContextMenu={(e) => handleStateContextMenu(e, s.id)}
                                className={`${draggingStateId === s.id ? 'cursor-grabbing' : 'cursor-grab'}`}
                            >
                                {s.isInicial && (
                                    <path d="M -50 0 L -32 0" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrow)" className="text-[var(--stroke-idle)] opacity-70" />
                                )}

                                <circle r="28" className="fill-transparent" />

                                <circle
                                    r={isSelected || isActive ? 28 : 26}
                                    className={`transition-all duration-200
                                        ${isActive ? 'fill-ios-green stroke-ios-green shadow-[0_0_15px_rgba(52,199,89,0.5)]' :
                                            (isSelected ? 'fill-ios-blue stroke-ios-blue shadow-[0_0_15px_rgba(0,122,255,0.4)]' :
                                                'fill-[var(--bg-card)] stroke-[var(--stroke-idle)] hover:stroke-[var(--stroke-hover)]')}`}
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
                                        // Calculate position relative to canvas, adjusted for pan/zoom
                                        const mouseX = contextMenu.x - rect.left;
                                        const mouseY = contextMenu.y - rect.top;
                                        const x = (mouseX - pan.x) / zoom;
                                        const y = (mouseY - pan.y) / zoom;

                                        const newState: Estado = {
                                            id: `q${Date.now()}`,
                                            label: `q${data.estados.length}`,
                                            x, y,
                                            isFinal: false,
                                            isInicial: data.estados.length === 0
                                        };
                                        onChange({ ...data, estados: [...data.estados, newState] });
                                    }
                                }
                            },
                            {
                                label: 'Resetar Zoom',
                                icon: <RotateCcw size={14} />,
                                action: () => {
                                    if (onZoomChange) onZoomChange(1);
                                    setPan({ x: 0, y: 0 });
                                }
                            }
                        ]
                    }
                />
            )}

            {!readOnly && selection && !contextMenu && (
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
                            <div className="flex gap-2">
                                <input
                                    value={data.transicoes.find(t => t.id === selection.id)?.simbolo || ''}
                                    onChange={(e) => onChange({ ...data, transicoes: data.transicoes.map(t => t.id === selection.id ? { ...t, simbolo: e.target.value } : t) })}
                                    className="w-32 bg-gray-100 dark:bg-white/10 rounded-md px-3 py-1.5 text-center font-mono font-bold text-sm outline-none focus:ring-2 ring-ios-blue/50 text-[var(--text-primary)]"
                                    placeholder="ex: a,b"
                                    autoFocus
                                />
                                <button onClick={() => deleteTransition(selection.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};