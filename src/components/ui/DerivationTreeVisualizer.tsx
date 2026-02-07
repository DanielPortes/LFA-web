import React, { useMemo, useState, useEffect } from 'react';
import type { GrammarTree } from '../../types';
import { ChevronLeft, ChevronRight, Play, RotateCcw, Pause, Maximize2 } from 'lucide-react';
import { ZoomModal } from './ZoomModal';

interface DerivationTreeVisualizerProps {
    tree: GrammarTree;
    steps?: string[]; // derivation forms (e.g., "S => aSb")
    autoPlay?: boolean;
}

interface TreeNodeLayout {
    x: number;
    y: number;
    symbol: string;
    id: string;
    children: TreeNodeLayout[];
    width: number;
    depth: number;
}

const NODE_RADIUS = 20;
const LEVEL_HEIGHT = 80;
const NODE_GAP = 25;

export const DerivationTreeVisualizer: React.FC<DerivationTreeVisualizerProps> = ({ tree, steps, autoPlay = false }) => {
    const [playbackState, setPlaybackState] = useState<'playing' | 'paused' | 'stopped'>('stopped');
    const [visibleNodeCount, setVisibleNodeCount] = useState(1);
    const [totalNodeCount, setTotalNodeCount] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    // Layout Calculation
    const layout = useMemo(() => {
        let idCounter = 0;
        let count = 0;

        const calculateDimensions = (node: GrammarTree, depth: number): TreeNodeLayout => {
            count++;
            const id = `node-${idCounter++}`;
            
            if (!node.children || node.children.length === 0) {
                return {
                    x: 0, y: depth * LEVEL_HEIGHT,
                    symbol: node.symbol,
                    id,
                    children: [],
                    width: NODE_RADIUS * 2 + NODE_GAP,
                    depth
                };
            }

            const childrenLayouts = node.children.map(child => calculateDimensions(child, depth + 1));
            const totalWidth = childrenLayouts.reduce((sum, c) => sum + c.width, 0);

            return {
                x: 0, y: depth * LEVEL_HEIGHT,
                symbol: node.symbol,
                id,
                children: childrenLayouts,
                width: Math.max(totalWidth, NODE_RADIUS * 2 + NODE_GAP),
                depth
            };
        };

        const rootLayout = calculateDimensions(tree, 0);
        setTotalNodeCount(count);

        const assigNÓSitions = (node: TreeNodeLayout, xStart: number) => {
            node.x = xStart + node.width / 2;
            let currentX = xStart;
            const childrenTotalWidth = node.children.reduce((sum, c) => sum + c.width, 0);
            if (childrenTotalWidth < node.width) {
                currentX += (node.width - childrenTotalWidth) / 2;
            }
            node.children.forEach(child => {
                assigNÓSitions(child, currentX);
                currentX += child.width;
            });
        };

        assigNÓSitions(rootLayout, 0);
        return rootLayout;
    }, [tree]);

    // Flatten logic for step control
    const flatNodes = useMemo(() => {
        const list: TreeNodeLayout[] = [];
        const dfs = (node: TreeNodeLayout) => {
            list.push(node);
            node.children.forEach(dfs);
        };
        dfs(layout);
        return list;
    }, [layout]);

    // Auto-play logic
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (playbackState === 'playing') {
            timer = setInterval(() => {
                setVisibleNodeCount(prev => {
                    if (prev >= totalNodeCount) {
                        setPlaybackState('paused');
                        return prev;
                    }
                    return prev + 1;
                });
            }, 800);
        }
        return () => clearInterval(timer);
    }, [playbackState, totalNodeCount]);

    // Initial state
    useEffect(() => {
        if (autoPlay) {
            setPlaybackState('playing');
            setVisibleNodeCount(1);
        } else {
            setVisibleNodeCount(totalNodeCount);
            setPlaybackState('stopped');
        }
    }, [tree, totalNodeCount, autoPlay]);


    const handleStepForward = () => {
        setPlaybackState('paused');
        setVisibleNodeCount(prev => Math.min(prev + 1, totalNodeCount));
    };

    const handleStepBack = () => {
        setPlaybackState('paused');
        setVisibleNodeCount(prev => Math.max(prev - 1, 1));
    };

    const handleReset = () => {
        setPlaybackState('stopped');
        setVisibleNodeCount(1);
    };

    const togglePlay = () => {
        if (playbackState === 'playing') {
            setPlaybackState('paused');
        } else {
            if (visibleNodeCount >= totalNodeCount) setVisibleNodeCount(1);
            setPlaybackState('playing');
        }
    };

    // Determine current "context" (last added node)
    const lastNode = flatNodes[visibleNodeCount - 1];
    
    // Find the closest step string if available
    const currentStepIndex = Math.floor((visibleNodeCount / totalNodeCount) * (steps ? steps.length : 0));
    const currentStepLabel = steps ? steps[Math.min(currentStepIndex, steps.length - 1)] : null;


    const renderContent = () => {
        const visibleIds = new Set(flatNodes.slice(0, visibleNodeCount).map(n => n.id));
        const width = layout.width + 60;
        const height = (Math.max(...flatNodes.map(n => n.depth)) + 1) * LEVEL_HEIGHT + 60;

        const renderLinks = (node: TreeNodeLayout): React.ReactNode[] => {
            if (!visibleIds.has(node.id)) return [];
            const links: React.ReactNode[] = [];
            node.children.forEach(child => {
                if (visibleIds.has(child.id)) {
                    links.push(
                        <path
                            key={`link-${node.id}-${child.id}`}
                            d={`M${node.x},${node.y + NODE_RADIUS} C${node.x},${node.y + LEVEL_HEIGHT / 2} ${child.x},${node.y + LEVEL_HEIGHT / 2} ${child.x},${child.y - NODE_RADIUS}`}
                            fill="none"
                            stroke={visibleIds.has(child.id) ? "var(--border-color)" : "transparent"}
                            strokeWidth="2"
                            className="transition-all duration-500"
                            strokeDasharray="5,5"
                        />
                    );
                    links.push(...renderLinks(child));
                }
            });
            return links;
        };

        const renderNodes = (node: TreeNodeLayout): React.ReactNode[] => {
            if (!visibleIds.has(node.id)) return [];
            const nodes: React.ReactNode[] = [];
            const isLast = node.id === lastNode?.id;

            nodes.push(
                <g 
                    key={node.id} 
                    className="transition-all duration-500 ease-out" 
                    style={{ 
                        transform: `translate(${node.x}px, ${node.y}px)`,
                        opacity: visibleIds.has(node.id) ? 1 : 0
                    }}
                >
                    <circle
                        r={NODE_RADIUS}
                        fill={isLast ? 'var(--color-info)' : 'var(--color-surface-1)'}
                        stroke={isLast ? 'var(--color-info)' : 'var(--border-color)'}
                        strokeWidth="2"
                        className="transition-colors duration-300 shadow-sm"
                    />
                    <text
                        dy=".35em"
                        textAnchor="middle"
                        className={`font-mono font-bold text-xs select-none transition-colors duration-300 ${isLast ? 'fill-white' : 'fill-[var(--text-primary)]'}`}
                    >
                        {node.symbol === 'epsilon' || node.symbol === 'ε' ? 'ε' : node.symbol}
                    </text>
                </g>
            );
            node.children.forEach(child => nodes.push(...renderNodes(child)));
            return nodes;
        };

        return (
            <div className="flex-1 overflow-auto custom-scrollbar flex items-center justify-center bg-canvas rounded-xl relative">
                 {/* Label Overlay */}
                 <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    {currentStepLabel && (
                        <div className="bg-surface-1-90 backdrop-blur border border-default px-4 py-2 rounded-lg shadow-sm">
                            <div className="ui-kicker-xs text-secondary mb-1">
                                Forma Sentencial
                            </div>
                            <div className="font-mono text-sm font-bold text-primary">
                                {currentStepLabel}
                            </div>
                        </div>
                    )}
                </div>

                <svg width={width} height={height}>
                    <g transform="translate(30, 30)">
                        {renderLinks(layout)}
                        {renderNodes(layout)}
                    </g>
                </svg>
            </div>
        );
    };

    return (
        <>
            <div className="flex flex-col gap-0 border border-default rounded-xl overflow-hidden shadow-sm bg-surface-soft">
                {/* Toolbar */}
                <div className="flex items-center justify-between p-2 border-b border-default bg-surface-muted">
                    <div className="flex items-center gap-1">
                        <button onClick={handleReset} className="p-1.5 hover:bg-surface-hover rounded-md transition-colors text-secondary">
                            <RotateCcw size={14} />
                        </button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <button onClick={handleStepBack} disabled={visibleNodeCount <= 1} className="p-1.5 hover:bg-surface-hover rounded-md transition-colors disabled:opacity-50">
                            <ChevronLeft size={16} />
                        </button>
                        <button onClick={togglePlay} className="p-1.5 hover:bg-surface-hover rounded-md transition-colors text-ios-blue">
                            {playbackState === 'playing' ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                        </button>
                        <button onClick={handleStepForward} disabled={visibleNodeCount >= totalNodeCount} className="p-1.5 hover:bg-surface-hover rounded-md transition-colors disabled:opacity-50">
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                         <span className="font-mono text-xs font-bold text-secondary bg-surface-1 px-2 py-0.5 rounded border border-default">
                            {visibleNodeCount} / {totalNodeCount} NÓS
                        </span>
                        <button 
                            onClick={() => setIsZoomed(true)} 
                            className="p-1.5 hover:bg-surface-hover rounded-md transition-colors text-secondary hover:text-primary"
                            title="Expandir visualização"
                        >
                            <Maximize2 size={14} />
                        </button>
                    </div>
                </div>

                {/* Inline View */}
                <div className="h-[300px] flex">
                    {renderContent()}
                </div>
            </div>

            {/* Expanded Modal View */}
            <ZoomModal isOpen={isZoomed} onClose={() => setIsZoomed(false)} title="Árvore de Derivação">
                <div className="flex flex-col h-full gap-4">
                     {/* Duplicate Controls for Modal */}
                     <div className="flex items-center justify-center gap-4 p-2 bg-surface-muted rounded-xl border border-default w-fit mx-auto shadow-sm">
                        <button onClick={handleStepBack} disabled={visibleNodeCount <= 1} className="p-2 hover:bg-surface-hover rounded-full transition-colors disabled:opacity-50">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={togglePlay} className="p-3 bg-ios-blue text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg active:scale-95">
                            {playbackState === 'playing' ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                        </button>
                        <button onClick={handleStepForward} disabled={visibleNodeCount >= totalNodeCount} className="p-2 hover:bg-surface-hover rounded-full transition-colors disabled:opacity-50">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    {renderContent()}
                </div>
            </ZoomModal>
        </>
    );
};


