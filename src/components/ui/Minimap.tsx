import React, { useMemo } from 'react';
import type { AutomatoData } from '../../types';

interface MinimapProps {
    data: AutomatoData;
    viewport: { x: number; y: number; width: number; height: number };
    zoom: number;
    pan: { x: number; y: number };
    onPanChange: (pan: { x: number; y: number }) => void;
    activeStates?: string[];
}

export const Minimap: React.FC<MinimapProps> = ({
    data,
    viewport,
    zoom,
    pan,
    onPanChange,
    activeStates = []
}) => {
    const MINIMAP_WIDTH = 150;
    const MINIMAP_HEIGHT = 100;
    const PADDING = 20;

    const bounds = useMemo(() => {
        if (data.estados.length === 0) {
            return { minX: 0, minY: 0, maxX: 500, maxY: 300 };
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        data.estados.forEach(s => {
            minX = Math.min(minX, s.x - 30);
            minY = Math.min(minY, s.y - 30);
            maxX = Math.max(maxX, s.x + 30);
            maxY = Math.max(maxY, s.y + 30);
        });

        return { minX, minY, maxX, maxY };
    }, [data.estados]);

    const contentWidth = bounds.maxX - bounds.minX + PADDING * 2;
    const contentHeight = bounds.maxY - bounds.minY + PADDING * 2;

    const scale = Math.min(
        MINIMAP_WIDTH / contentWidth,
        MINIMAP_HEIGHT / contentHeight
    );

    const offsetX = PADDING - bounds.minX;
    const offsetY = PADDING - bounds.minY;

    // Calculate viewport rectangle in minimap coordinates
    const viewportRect = useMemo(() => {
        const vx = (-pan.x / zoom + offsetX) * scale;
        const vy = (-pan.y / zoom + offsetY) * scale;
        const vw = (viewport.width / zoom) * scale;
        const vh = (viewport.height / zoom) * scale;
        return { x: vx, y: vy, width: vw, height: vh };
    }, [pan, zoom, viewport, offsetX, offsetY, scale]);

    const handleMinimapClick = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Convert click to content coordinates
        const contentX = clickX / scale - offsetX;
        const contentY = clickY / scale - offsetY;

        // Calculate new pan to center viewport on clicked point
        const newPanX = -(contentX * zoom - viewport.width / 2);
        const newPanY = -(contentY * zoom - viewport.height / 2);

        onPanChange({ x: newPanX, y: newPanY });
    };

    if (data.estados.length === 0) return null;

    return (
        <div className="absolute bottom-6 left-6 z-20 glass-panel rounded-xl overflow-hidden shadow-apple-lg">
            <svg
                width={MINIMAP_WIDTH}
                height={MINIMAP_HEIGHT}
                className="cursor-crosshair"
                onClick={handleMinimapClick}
            >
                {/* Background */}
                <rect
                    width={MINIMAP_WIDTH}
                    height={MINIMAP_HEIGHT}
                    className="fill-[var(--bg-card)]"
                />

                {/* Transitions */}
                {data.transicoes.map(t => {
                    const from = data.estados.find(s => s.id === t.de);
                    const to = data.estados.find(s => s.id === t.para);
                    if (!from || !to) return null;

                    const x1 = (from.x + offsetX) * scale;
                    const y1 = (from.y + offsetY) * scale;
                    const x2 = (to.x + offsetX) * scale;
                    const y2 = (to.y + offsetY) * scale;

                    return (
                        <line
                            key={t.id}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            className="stroke-gray-400 dark:stroke-gray-600"
                            strokeWidth="1"
                            opacity="0.5"
                        />
                    );
                })}

                {/* States */}
                {data.estados.map(s => {
                    const x = (s.x + offsetX) * scale;
                    const y = (s.y + offsetY) * scale;
                    const isActive = activeStates.includes(s.id);

                    return (
                        <circle
                            key={s.id}
                            cx={x}
                            cy={y}
                            r={4}
                            className={`
                                ${isActive
                                    ? 'fill-ios-green'
                                    : s.isFinal
                                        ? 'fill-ios-purple'
                                        : s.isInicial
                                            ? 'fill-ios-blue'
                                            : 'fill-gray-400 dark:fill-gray-500'}
                            `}
                        />
                    );
                })}

                {/* Viewport indicator */}
                <rect
                    x={viewportRect.x}
                    y={viewportRect.y}
                    width={viewportRect.width}
                    height={viewportRect.height}
                    fill="rgba(0, 122, 255, 0.1)"
                    stroke="rgba(0, 122, 255, 0.8)"
                    strokeWidth="1.5"
                    rx="2"
                />
            </svg>
        </div>
    );
};
