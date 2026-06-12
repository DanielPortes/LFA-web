import React from 'react';
import type { AutomatoData, Estado } from '../../../types';
import type { CanvasSelection } from './types';

interface CanvasStateLayerProps {
    data: AutomatoData;
    selection: CanvasSelection | null;
    selectedStateIds: string[];
    activeStates: string[];
    getRenderState: (state: Estado) => Estado;
    onStateMouseDown: (event: React.MouseEvent | React.TouchEvent, stateId: string) => void;
}

export const CanvasStateLayer: React.FC<CanvasStateLayerProps> = ({
    data,
    selection,
    selectedStateIds,
    activeStates,
    getRenderState,
    onStateMouseDown,
}) => (
    <>
        {data.estados.map((state) => {
            const renderState = getRenderState(state);
            const isSelected = (selection?.type === 'state' && selection.id === state.id)
                || selectedStateIds.includes(state.id);
            const isActive = activeStates.includes(state.id);

            return (
                <g
                    key={state.id}
                    id={`group-${state.id}`}
                    transform={`translate(${renderState.x}, ${renderState.y})`}
                    onMouseDown={(event) => onStateMouseDown(event, state.id)}
                    className="cursor-grab active:cursor-grabbing hover:brightness-110"
                >
                    {state.isInicial && (
                        <path
                            d="M -50 0 L -32 0"
                            stroke="currentColor"
                            strokeWidth="2"
                            markerEnd="url(#arrow)"
                            className="text-stroke-idle opacity-70"
                        />
                    )}
                    <circle r="28" className="fill-transparent" />
                    {isActive && (
                        <circle
                            r="31"
                            className="motion-state-halo pointer-events-none fill-ios-green/25 stroke-ios-green/40"
                            strokeWidth="2"
                        />
                    )}
                    <circle
                        r={isSelected || isActive ? 28 : 26}
                        className={`${
                            isActive
                                ? 'fill-ios-green stroke-ios-green shadow-[0_0_20px_rgba(52,199,89,0.6)]'
                                : isSelected
                                    ? 'fill-ios-blue stroke-ios-blue shadow-[0_0_15px_rgba(0,122,255,0.4)]'
                                    : 'fill-[var(--canvas-surface)] stroke-[var(--stroke-idle)]'
                        }`}
                        strokeWidth={isSelected || isActive ? 2.5 : 2}
                    />
                    {state.isFinal && (
                        <circle
                            r="22"
                            fill="none"
                            className={`pointer-events-none ${
                                isActive || isSelected ? 'stroke-white' : 'stroke-[var(--stroke-idle)]'
                            }`}
                            strokeWidth="1.5"
                        />
                    )}
                    <text
                        dy="5"
                        textAnchor="middle"
                        className={`text-[13px] font-bold select-none pointer-events-none font-mono ${
                            isActive || isSelected ? 'fill-white' : 'fill-[var(--text-primary)]'
                        }`}
                    >
                        {state.label}
                    </text>
                    {data.tipo === 'Moore' && state.output && (
                        <g transform="translate(0, -36)">
                            <rect
                                x="-10"
                                y="-8"
                                width="20"
                                height="16"
                                rx="4"
                                className="fill-[var(--surface-muted)] stroke-[var(--border-color)]"
                                strokeWidth="1"
                            />
                            <text
                                dy="3"
                                textAnchor="middle"
                                className="text-[10px] font-bold fill-[var(--text-secondary)] font-mono"
                            >
                                {state.output}
                            </text>
                        </g>
                    )}
                </g>
            );
        })}
    </>
);
