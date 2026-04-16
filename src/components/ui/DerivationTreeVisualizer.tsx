import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Pause, Play, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import type { GrammarTree } from '../../types';
import { useUiSettings } from '../../hooks/useUiSettings';
import { ZoomModal } from './ZoomModal';

interface DerivationTreeVisualizerProps {
    tree: GrammarTree;
    steps?: string[];
    autoPlay?: boolean;
}

interface TreeNodeLayout {
    id: string;
    symbol: string;
    x: number;
    y: number;
    width: number;
    depth: number;
    children: TreeNodeLayout[];
}

const NODE_RADIUS = 20;
const LEVEL_HEIGHT = 92;
const NODE_GAP = 28;

export const DerivationTreeVisualizer: React.FC<DerivationTreeVisualizerProps> = ({
    tree,
    steps,
    autoPlay = false,
}) => {
    const { effectiveReduceMotion } = useUiSettings();
    const [playbackState, setPlaybackState] = useState<'playing' | 'paused' | 'stopped'>('stopped');
    const [visibleNodeCount, setVisibleNodeCount] = useState(1);
    const [isZoomed, setIsZoomed] = useState(false);
    const [expandedZoom, setExpandedZoom] = useState(1);

    const { root, totalNodeCount, maxDepth } = useMemo(() => {
        let idCounter = 0;

        const measure = (node: GrammarTree, depth: number): TreeNodeLayout => {
            const id = `grammar-node-${idCounter++}`;
            const measuredChildren = (node.children ?? []).map((child) => measure(child, depth + 1));
            const childrenWidth = measuredChildren.reduce((sum, child) => sum + child.width, 0);

            return {
                id,
                symbol: node.symbol,
                x: 0,
                y: depth * LEVEL_HEIGHT,
                width: Math.max(childrenWidth, NODE_RADIUS * 2 + NODE_GAP),
                depth,
                children: measuredChildren,
            };
        };

        const assignPositions = (node: TreeNodeLayout, startX: number) => {
            node.x = startX + node.width / 2;

            const childrenWidth = node.children.reduce((sum, child) => sum + child.width, 0);
            let cursor = startX + Math.max(0, (node.width - childrenWidth) / 2);

            node.children.forEach((child) => {
                assignPositions(child, cursor);
                cursor += child.width;
            });
        };

        const flatten = (node: TreeNodeLayout): TreeNodeLayout[] => [
            node,
            ...node.children.flatMap((child) => flatten(child)),
        ];

        const measuredRoot = measure(tree, 0);
        assignPositions(measuredRoot, 0);
        const flattened = flatten(measuredRoot);

        return {
            root: measuredRoot,
            totalNodeCount: flattened.length,
            maxDepth: flattened.reduce((max, node) => Math.max(max, node.depth), 0),
        };
    }, [tree]);

    const flatNodes = useMemo(() => {
        const list: TreeNodeLayout[] = [];
        const walk = (node: TreeNodeLayout) => {
            list.push(node);
            node.children.forEach(walk);
        };
        walk(root);
        return list;
    }, [root]);

    useEffect(() => {
        const shouldAutoplay = autoPlay && !effectiveReduceMotion;
        setVisibleNodeCount(shouldAutoplay ? 1 : totalNodeCount);
        setPlaybackState(shouldAutoplay ? 'playing' : 'stopped');
        setExpandedZoom(1);
    }, [autoPlay, effectiveReduceMotion, totalNodeCount, tree]);

    useEffect(() => {
        if (playbackState !== 'playing') return undefined;

        const timer = window.setInterval(() => {
            setVisibleNodeCount((previous) => {
                if (previous >= totalNodeCount) {
                    setPlaybackState('paused');
                    return previous;
                }
                return previous + 1;
            });
        }, 800);

        return () => window.clearInterval(timer);
    }, [playbackState, totalNodeCount]);

    const handleStepBack = () => {
        setPlaybackState('paused');
        setVisibleNodeCount((previous) => Math.max(previous - 1, 1));
    };

    const handleStepForward = () => {
        setPlaybackState('paused');
        setVisibleNodeCount((previous) => Math.min(previous + 1, totalNodeCount));
    };

    const handleReset = () => {
        setPlaybackState('stopped');
        setVisibleNodeCount(1);
    };

    const togglePlay = () => {
        if (playbackState === 'playing') {
            setPlaybackState('paused');
            return;
        }

        if (visibleNodeCount >= totalNodeCount) {
            setVisibleNodeCount(1);
        }
        setPlaybackState('playing');
    };

    const visibleNodes = flatNodes.slice(0, visibleNodeCount);
    const visibleIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes]);
    const lastNode = visibleNodes[visibleNodes.length - 1];
    const currentStepIndex = totalNodeCount > 0
        ? Math.floor((visibleNodeCount / totalNodeCount) * ((steps?.length ?? 1) - 1))
        : 0;
    const currentStepLabel = steps?.[Math.max(0, currentStepIndex)] ?? null;

    const svgWidth = root.width + 96;
    const svgHeight = (maxDepth + 1) * LEVEL_HEIGHT + 96;

    const renderLinks = (node: TreeNodeLayout): React.ReactNode[] => {
        if (!visibleIds.has(node.id)) return [];

        return node.children.flatMap((child) => {
            if (!visibleIds.has(child.id)) return [];

            return [
                <path
                    key={`edge-${node.id}-${child.id}`}
                    d={`M${node.x},${node.y + NODE_RADIUS} C${node.x},${node.y + LEVEL_HEIGHT / 2} ${child.x},${node.y + LEVEL_HEIGHT / 2} ${child.x},${child.y - NODE_RADIUS}`}
                    fill="none"
                    stroke="var(--color-border-strong)"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    opacity="0.9"
                />,
                ...renderLinks(child),
            ];
        });
    };

    const renderNodes = (node: TreeNodeLayout): React.ReactNode[] => {
        if (!visibleIds.has(node.id)) return [];

        const isCurrent = node.id === lastNode?.id;

        return [
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                {isCurrent && (
                    <circle
                        r={NODE_RADIUS + 7}
                        fill="none"
                        stroke="var(--color-info)"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                    />
                )}
                <circle
                    r={NODE_RADIUS}
                    fill={isCurrent ? 'var(--color-info)' : 'var(--color-canvas-surface)'}
                    stroke={isCurrent ? 'var(--color-info)' : 'var(--color-border-strong)'}
                    strokeWidth={isCurrent ? 2.5 : 2}
                />
                <text
                    dy=".35em"
                    textAnchor="middle"
                    className={`font-mono text-xs font-bold ${isCurrent ? 'fill-white' : 'fill-[var(--text-primary)]'}`}
                >
                    {node.symbol === 'epsilon' || node.symbol === 'ε' ? 'ε' : node.symbol}
                </text>
            </g>,
            ...node.children.flatMap((child) => renderNodes(child)),
        ];
    };

    const renderCanvas = (expanded: boolean) => (
        <div className={`relative flex-1 overflow-auto bg-canvas ${expanded ? 'rounded-[24px]' : 'rounded-[20px]'}`}>
            {currentStepLabel && (
                <div className="pointer-events-none absolute left-4 top-4 z-10">
                    <div className="rounded-2xl border border-default bg-surface-1/95 px-4 py-3 shadow-apple-md">
                        <div className="ui-kicker-xs text-secondary">Forma sentencial</div>
                        <div className="mt-1 font-mono text-sm font-bold text-primary">{currentStepLabel}</div>
                    </div>
                </div>
            )}

            <div className="flex min-h-full min-w-full items-center justify-center p-6 md:p-8">
                <div
                    className="transition-transform duration-200 ease-out"
                    style={{
                        transform: expanded ? `scale(${expandedZoom})` : 'scale(1)',
                        transformOrigin: 'center center',
                    }}
                >
                    <svg
                        width={svgWidth}
                        height={svgHeight}
                        role="img"
                        aria-label="Árvore de derivação"
                    >
                        <g transform="translate(48, 48)">
                            {renderLinks(root)}
                            {renderNodes(root)}
                        </g>
                    </svg>
                </div>
            </div>
        </div>
    );

    const toolbar = (expanded: boolean) => (
        <div className={`flex items-center justify-between gap-3 border-b border-default/60 bg-surface-1/95 px-3 py-2 ${expanded ? 'rounded-[24px] border' : ''}`}>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-xl p-2 text-secondary transition-colors hover:bg-surface-hover hover:text-primary"
                    aria-label="Reiniciar árvore"
                >
                    <RotateCcw size={16} />
                </button>
                <button
                    type="button"
                    onClick={handleStepBack}
                    disabled={visibleNodeCount <= 1}
                    className="rounded-xl p-2 text-secondary transition-colors hover:bg-surface-hover hover:text-primary disabled:opacity-40"
                    aria-label="Voltar um passo na árvore"
                >
                    <ChevronLeft size={16} />
                </button>
                <button
                    type="button"
                    onClick={togglePlay}
                    className="rounded-xl p-2 text-ios-blue transition-colors hover:bg-ios-blue/10"
                    aria-label={playbackState === 'playing' ? 'Pausar árvore' : 'Reproduzir árvore'}
                    aria-pressed={playbackState === 'playing'}
                >
                    {playbackState === 'playing' ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                </button>
                <button
                    type="button"
                    onClick={handleStepForward}
                    disabled={visibleNodeCount >= totalNodeCount}
                    className="rounded-xl p-2 text-secondary transition-colors hover:bg-surface-hover hover:text-primary disabled:opacity-40"
                    aria-label="Avançar um passo na árvore"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            <div className="flex items-center gap-2">
                <span className="rounded-full border border-default bg-surface-muted px-3 py-1 text-[11px] font-black text-secondary">
                    {visibleNodeCount} / {totalNodeCount} nós
                </span>
                {expanded && (
                    <>
                        <button
                            type="button"
                            onClick={() => setExpandedZoom((value) => Math.max(0.7, Number((value - 0.15).toFixed(2))))}
                            className="rounded-xl p-2 text-secondary transition-colors hover:bg-surface-hover hover:text-primary"
                            aria-label="Reduzir zoom da árvore"
                        >
                            <ZoomOut size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setExpandedZoom((value) => Math.min(2.8, Number((value + 0.15).toFixed(2))))}
                            className="rounded-xl p-2 text-secondary transition-colors hover:bg-surface-hover hover:text-primary"
                            aria-label="Aumentar zoom da árvore"
                        >
                            <ZoomIn size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setExpandedZoom(1)}
                            className="rounded-xl p-2 text-secondary transition-colors hover:bg-surface-hover hover:text-primary"
                            aria-label="Ajustar árvore ao tamanho original"
                        >
                            <RotateCcw size={16} />
                        </button>
                    </>
                )}
                {!expanded && (
                    <button
                        type="button"
                        onClick={() => setIsZoomed(true)}
                        className="rounded-xl p-2 text-secondary transition-colors hover:bg-surface-hover hover:text-primary"
                        aria-label="Expandir árvore de derivação"
                    >
                        <Maximize2 size={16} />
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <>
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-default bg-surface-1/90 shadow-apple-md">
                {toolbar(false)}
                <div className="h-[320px] min-h-[320px] p-3">
                    {renderCanvas(false)}
                </div>
            </div>

            <ZoomModal
                isOpen={isZoomed}
                onClose={() => setIsZoomed(false)}
                title="Árvore de derivação"
            >
                <div className="flex h-full min-h-0 flex-col gap-4">
                    {toolbar(true)}
                    {renderCanvas(true)}
                </div>
            </ZoomModal>
        </>
    );
};
