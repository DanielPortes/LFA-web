import React from 'react';
import type { AutomatoData, Estado } from '../../../types';
import { calculateControlPoint, calculatePath, getQuadraticXY } from '../../../utils/geometry';
import { calculateLabelWidth } from '../../../utils/layout';
import type { CanvasContextMenuState, CanvasSelection } from './types';

interface CanvasTransitionLayerProps {
    data: AutomatoData;
    selection: CanvasSelection | null;
    selectedTransitionIds: string[];
    activeTransitions: string[];
    readOnly: boolean;
    curvatures: Map<string, number>;
    labelPositions: Map<string, { x: number; y: number }>;
    labelTexts: Map<string, string>;
    getRenderState: (state: Estado) => Estado;
    handleControlPointMouseDown: (event: React.MouseEvent, transitionId: string) => void;
    controlPointDraft: { transitionId: string; controlPoint: { x: number; y: number } } | null;
    onSelectTransition: (transitionId: string, multi: boolean) => void;
    onOpenContextMenu: (menu: CanvasContextMenuState) => void;
}

export const CanvasTransitionLayer: React.FC<CanvasTransitionLayerProps> = ({
    data,
    selection,
    selectedTransitionIds,
    activeTransitions,
    readOnly,
    curvatures,
    labelPositions,
    labelTexts,
    getRenderState,
    handleControlPointMouseDown,
    controlPointDraft,
    onSelectTransition,
    onOpenContextMenu,
}) => (
    <>
        {data.transicoes.map((transition) => {
            const sourceBase = data.estados.find((state) => state.id === transition.de);
            const targetBase = data.estados.find((state) => state.id === transition.para);
            if (!sourceBase || !targetBase) return null;

            const source = getRenderState(sourceBase);
            const target = getRenderState(targetBase);
            const curvature = curvatures.get(transition.id) || 0;
            const draftControlPoint = controlPointDraft?.transitionId === transition.id
                ? controlPointDraft.controlPoint
                : null;
            const controlPointOffset = draftControlPoint ?? transition.controlPoint ?? null;
            const pathD = calculatePath(source, target, curvature, controlPointOffset);
            const isSelected = (selection?.type === 'transition' && selection.id === transition.id)
                || selectedTransitionIds.includes(transition.id);
            const isActive = activeTransitions.includes(transition.id);
            const controlPoint = calculateControlPoint(source, target, curvature, controlPointOffset);
            const labelText = labelTexts.get(transition.id) || '?';
            const labelWidth = calculateLabelWidth(labelText);
            const labelAnchor = source.id === target.id
                ? { x: source.x, y: source.y - (52 + Math.abs(curvature) * 0.5) }
                : getQuadraticXY(0.5, source.x, source.y, controlPoint.x, controlPoint.y, target.x, target.y);
            const labelPos = draftControlPoint
                ? labelAnchor
                : (labelPositions.get(transition.id) || labelAnchor);
            const connectorDx = labelPos.x - labelAnchor.x;
            const connectorDy = labelPos.y - labelAnchor.y;
            const shouldRenderConnector = Math.sqrt(connectorDx * connectorDx + connectorDy * connectorDy) > 14;

            return (
                <g
                    key={transition.id}
                    className="group/trans"
                    onClick={(event) => {
                        event.stopPropagation();
                        onSelectTransition(transition.id, event.shiftKey || event.ctrlKey || event.metaKey);
                    }}
                    onContextMenu={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onOpenContextMenu({
                            x: event.clientX,
                            y: event.clientY,
                            type: 'transition',
                            targetId: transition.id,
                        });
                    }}
                >
                    <path d={pathD} stroke="transparent" strokeWidth="20" fill="none" className="cursor-pointer" />
                    <path
                        d={pathD}
                        className={`fill-none pointer-events-none ${
                            isSelected
                                ? 'stroke-ios-blue stroke-[3px] filter drop-shadow-md'
                                : isActive
                                    ? 'stroke-ios-green stroke-[3px] animate-pulse'
                                    : 'stroke-[var(--stroke-idle)] stroke-2 group-hover/trans:stroke-[var(--stroke-hover)]'
                        }`}
                        markerEnd={`url(#${isSelected ? 'arrow-selected' : (isActive ? 'arrow-active' : 'arrow')})`}
                    />
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
                            className={`cursor-pointer drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] ${
                                isSelected
                                    ? 'fill-ios-blue stroke-ios-blue shadow-lg'
                                    : isActive
                                        ? 'fill-ios-green stroke-ios-green'
                                        : transition.simbolo === ''
                                            ? 'fill-red-50 dark:fill-red-900/30 stroke-ios-red/50'
                                            : 'fill-[var(--canvas-surface)] stroke-[var(--stroke-idle)]'
                            }`}
                        />
                        <text
                            dy="5"
                            textAnchor="middle"
                            className={`text-[13px] font-mono font-bold select-none pointer-events-none ${
                                isSelected || isActive
                                    ? 'fill-white'
                                    : transition.simbolo === ''
                                        ? 'fill-ios-red'
                                        : 'fill-[var(--text-primary)]'
                            }`}
                        >
                            {labelText}
                        </text>
                    </g>
                    {isSelected && !readOnly && (
                        <g
                            onMouseDown={(event) => handleControlPointMouseDown(event, transition.id)}
                            style={{ cursor: 'grab' }}
                        >
                            <circle cx={controlPoint.x} cy={controlPoint.y} r={14} fill="transparent" className="pointer-events-auto" />
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
        })}
    </>
);
