import React, { useMemo } from 'react';
import type { AutomatoData } from '../../types';
import { calculatePath, getLabelPosition } from '../../utils/geometry';

interface AutomatonPreviewProps {
    data: AutomatoData;
    className?: string;
}

export const AutomatonPreview: React.FC<AutomatonPreviewProps> = ({ data, className = '' }) => {
    const bounds = useMemo(() => {
        if (data.estados.length === 0) {
            return { minX: 0, minY: 0, maxX: 400, maxY: 240 };
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        data.estados.forEach(s => {
            minX = Math.min(minX, s.x);
            minY = Math.min(minY, s.y);
            maxX = Math.max(maxX, s.x);
            maxY = Math.max(maxY, s.y);
        });

        return { minX, minY, maxX, maxY };
    }, [data.estados]);

    const padding = 60;
    const width = Math.max(1, bounds.maxX - bounds.minX + padding * 2);
    const height = Math.max(1, bounds.maxY - bounds.minY + padding * 2);
    const viewBox = `${bounds.minX - padding} ${bounds.minY - padding} ${width} ${height}`;

    return (
        <svg
            viewBox={viewBox}
            className={`w-full h-full ${className}`}
            role="img"
            aria-label="Pré-visualização do autômato"
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

                const pathD = calculatePath(source, target, t.curvatura, t.controlPoint);
                const labelPos = getLabelPosition(source, target, t.curvatura, t.controlPoint);
                const label = t.simbolo.trim() || '?';

                return (
                    <g key={t.id}>
                        <path d={pathD} className="stroke-[var(--stroke-idle)] stroke-2 fill-none" markerEnd="url(#preview-arrow)" />
                        <g transform={`translate(${labelPos.x}, ${labelPos.y})`}>
                            <rect
                                x="-14" y="-12" width="28" height="24" rx="8"
                                className="fill-[var(--bg-card)] stroke-[var(--border-color)] stroke-1"
                            />
                            <text
                                dy="5" textAnchor="middle"
                                className="text-[11px] font-mono font-bold select-none pointer-events-none fill-[var(--text-primary)]"
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
                        <path d="M -50 0 L -32 0" stroke="currentColor" strokeWidth="2" markerEnd="url(#preview-arrow)" className="text-[var(--stroke-idle)] opacity-70" />
                    )}

                    <circle r="26" className="fill-[var(--bg-card)] stroke-[var(--stroke-idle)] stroke-2" />

                    {s.isFinal && (
                        <circle r="22" fill="none" className="stroke-[var(--stroke-idle)]" strokeWidth="1.5" />
                    )}

                    <text dy="5" textAnchor="middle" className="text-xs font-bold select-none pointer-events-none font-mono fill-[var(--text-primary)]">
                        {s.label}
                    </text>
                </g>
            ))}
        </svg>
    );
};
