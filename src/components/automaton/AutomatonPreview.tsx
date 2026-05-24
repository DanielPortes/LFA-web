import React, { useMemo } from 'react';
import type { AutomatoData } from '../../types';
import { calculateControlPoint, calculatePath, getLabelPosition } from '../../utils/geometry';
import { calculateOptimalCurvatures, calculateSmartLabelPositions } from '../../utils/layout';

interface AutomatonPreviewProps {
    data: AutomatoData;
    className?: string;
    ariaLabel?: string;
}

const STATE_RADIUS = 28;
const INITIAL_ARROW_EXTENT = 46;

const getTransitionLabel = (data: AutomatoData, symbol: string, output?: string): string => {
    const label = symbol.trim() || '?';
    if (data.tipo !== 'Mealy') {
        return label;
    }

    const [inputRaw, ...rest] = label.split('/');
    const input = inputRaw.trim();
    const resolvedOutput = output ?? (rest.length > 0 ? rest.join('/').trim() : '');
    return resolvedOutput ? `${input}/${resolvedOutput}` : input;
};

export const AutomatonPreview: React.FC<AutomatonPreviewProps> = ({
    data,
    className = '',
    ariaLabel = `Pré-visualização do autômato ${data.tipo}`
}) => {
    const previewLayout = useMemo(() => {
        const curvatures = calculateOptimalCurvatures(data.transicoes, data.estados);
        const labelTexts = new Map(
            data.transicoes.map((transition) => [
                transition.id,
                getTransitionLabel(data, transition.simbolo, transition.output)
            ])
        );
        const labelPositions = calculateSmartLabelPositions(
            data.transicoes,
            data.estados,
            curvatures,
            labelTexts
        );

        return { curvatures, labelPositions };
    }, [data]);

    const bounds = useMemo(() => {
        if (data.estados.length === 0) {
            return { minX: 0, minY: 0, maxX: 400, maxY: 240 };
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        const includeBox = (x: number, y: number, radiusX: number, radiusY = radiusX) => {
            minX = Math.min(minX, x - radiusX);
            minY = Math.min(minY, y - radiusY);
            maxX = Math.max(maxX, x + radiusX);
            maxY = Math.max(maxY, y + radiusY);
        };

        const stateMap = new Map(data.estados.map((state) => [state.id, state]));

        data.estados.forEach(s => {
            const stateLabel = data.tipo === 'Moore' && s.output ? `${s.label}/${s.output}` : s.label;
            const stateLabelRadius = Math.max(STATE_RADIUS, stateLabel.length * 4 + 10);
            includeBox(s.x, s.y, stateLabelRadius, STATE_RADIUS);

            if (s.isInicial) {
                includeBox(s.x - INITIAL_ARROW_EXTENT, s.y, 6, 6);
            }
        });

        data.transicoes.forEach((transition) => {
            const source = stateMap.get(transition.de);
            const target = stateMap.get(transition.para);
            if (!source || !target) return;

            const curvature = previewLayout.curvatures.get(transition.id) ?? transition.curvatura ?? 0;
            const label = getTransitionLabel(data, transition.simbolo, transition.output);
            const labelWidth = Math.max(32, label.length * 7 + 14);
            const labelPos = previewLayout.labelPositions.get(transition.id)
                ?? getLabelPosition(source, target, curvature, transition.controlPoint);

            includeBox(labelPos.x, labelPos.y, labelWidth / 2 + 8, 18);

            if (source.id === target.id) {
                const loopRadius = 56 + Math.abs(curvature) * 0.5;
                includeBox(source.x, source.y - loopRadius, loopRadius + 8, loopRadius * 0.8);
                return;
            }

            const controlPoint = calculateControlPoint(source, target, curvature, transition.controlPoint);
            includeBox(controlPoint.x, controlPoint.y, 8, 8);
        });

        return { minX, minY, maxX, maxY };
    }, [data, previewLayout]);

    const padding = 64;
    const width = Math.max(1, bounds.maxX - bounds.minX + padding * 2);
    const height = Math.max(1, bounds.maxY - bounds.minY + padding * 2);
    const viewBox = `${bounds.minX - padding} ${bounds.minY - padding} ${width} ${height}`;

    return (
        <svg
            viewBox={viewBox}
            className={`w-full h-full ${className}`}
            role="img"
            aria-label={ariaLabel}
        >
            <defs>
                <marker id="preview-arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="userSpaceOnUse">
                    <path d="M2,2 L10,6 L2,10 L4,6 Z" className="fill-[var(--stroke-idle)]" />
                </marker>
            </defs>

            {data.transicoes.map(t => {
                const source = data.estados.find(e => e.id === t.de);
                const target = data.estados.find(e => e.id === t.para);
                if (!source || !target) return null;

                const curvature = previewLayout.curvatures.get(t.id) ?? t.curvatura ?? 0;
                const pathD = calculatePath(source, target, curvature, t.controlPoint);
                const labelPos = previewLayout.labelPositions.get(t.id)
                    ?? getLabelPosition(source, target, curvature, t.controlPoint);
                const label = getTransitionLabel(data, t.simbolo, t.output);
                const labelWidth = Math.max(32, label.length * 7 + 14);

                return (
                    <g key={t.id}>
                        <path d={pathD} className="stroke-[var(--stroke-idle)] stroke-2 fill-none" markerEnd="url(#preview-arrow)" />
                        <g transform={`translate(${labelPos.x}, ${labelPos.y})`}>
                            <rect
                                x={-labelWidth / 2} y="-12" width={labelWidth} height="24" rx="8"
                                className="fill-[var(--canvas-surface)] stroke-[var(--stroke-idle)] stroke-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
                            />
                            <text
                                dy="5" textAnchor="middle"
                                className="text-[12px] font-mono font-bold select-none pointer-events-none fill-[var(--text-primary)]"
                            >
                                {label}
                            </text>
                        </g>
                    </g>
                );
            })}

            {data.estados.map(s => (
                <g key={s.id} transform={`translate(${s.x}, ${s.y})`}>
                    {s.isInicial && (
                        <path d="M -46 0 L -28 0" stroke="currentColor" strokeWidth="2" markerEnd="url(#preview-arrow)" className="text-stroke-idle opacity-70" />
                    )}

                    <circle r="28" className="fill-[var(--canvas-surface)] stroke-[var(--stroke-idle)] stroke-2" />

                    {s.isFinal && (
                        <circle r="24" fill="none" className="stroke-[var(--stroke-idle)]" strokeWidth="1.5" />
                    )}

                    <text dy="5" textAnchor="middle" className="text-[12px] font-bold select-none pointer-events-none font-mono fill-[var(--text-primary)]">
                        {data.tipo === 'Moore' && s.output ? `${s.label}/${s.output}` : s.label}
                    </text>
                </g>
            ))}

            {data.estados.length === 0 && (
                <g transform={`translate(${bounds.minX + (bounds.maxX - bounds.minX + padding * 2) / 2}, ${bounds.minY + (bounds.maxY - bounds.minY + padding * 2) / 2})`}>
                    <rect
                        x="-92"
                        y="-32"
                        width="184"
                        height="64"
                        rx="20"
                        className="fill-[var(--canvas-surface)] stroke-[var(--stroke-idle)]"
                        opacity="0.85"
                    />
                    <text
                        textAnchor="middle"
                        className="fill-[var(--text-secondary)] font-bold text-[12px]"
                    >
                        Autômato vazio
                    </text>
                    <text
                        dy="18"
                        textAnchor="middle"
                        className="fill-[var(--text-muted)] font-medium text-[10px]"
                    >
                        Nenhum estado foi definido.
                    </text>
                </g>
            )}
        </svg>
    );
};

