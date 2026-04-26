import React, { useEffect, useState } from 'react';
import { ExternalLink, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import type { AutomatoData } from '../../types';
import { AutomatonPreview } from './AutomatonPreview';

interface AutomatonViewerProps {
    data: AutomatoData;
    ariaLabel?: string;
    className?: string;
    onOpenSimulator?: (data: AutomatoData) => void;
    openSimulatorLabel?: string;
}

export const AutomatonViewer: React.FC<AutomatonViewerProps> = ({
    data,
    ariaLabel,
    className = '',
    onOpenSimulator,
    openSimulatorLabel = 'Abrir autômato no simulador principal',
}) => {
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        setZoom(1);
    }, [data]);

    return (
        <div data-testid="automaton-viewer" className={`relative flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-default bg-canvas ${className}`}>
            <div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex justify-end">
                <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-default bg-surface-1/95 p-1 shadow-apple-lg">
                    <button
                        type="button"
                        onClick={() => setZoom((value) => Math.max(0.8, Number((value - 0.2).toFixed(2))))}
                        className="rounded-full p-2 text-secondary transition-colors hover:bg-surface-hover hover:text-primary"
                        aria-label="Reduzir zoom da visualização"
                    >
                        <ZoomOut size={16} />
                    </button>
                    <span className="min-w-12 text-center text-[11px] font-black text-secondary">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        type="button"
                        onClick={() => setZoom((value) => Math.min(2.4, Number((value + 0.2).toFixed(2))))}
                        className="rounded-full p-2 text-secondary transition-colors hover:bg-surface-hover hover:text-primary"
                        aria-label="Aumentar zoom da visualização"
                    >
                        <ZoomIn size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setZoom(1)}
                        className="rounded-full p-2 text-secondary transition-colors hover:bg-surface-hover hover:text-primary"
                        aria-label="Ajustar visualização ao conteúdo"
                    >
                        <RotateCcw size={16} />
                    </button>
                    {onOpenSimulator && (
                        <button
                            type="button"
                            onClick={() => onOpenSimulator(data)}
                            className="rounded-full p-2 text-secondary transition-colors hover:bg-surface-hover hover:text-primary"
                            aria-label={openSimulatorLabel}
                        >
                            <ExternalLink size={16} />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-auto p-5 pt-20 md:p-8 md:pt-24">
                <div className="flex min-h-full min-w-full items-center justify-center">
                    <div
                        className="w-full max-w-[1200px] transition-transform duration-200 ease-out"
                        style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                    >
                        <div className="aspect-[16/10] min-h-[320px] overflow-hidden rounded-[24px] border border-default/60 bg-canvas-surface shadow-inner">
                            <AutomatonPreview
                                data={data}
                                ariaLabel={ariaLabel ?? `Visualização ampliada do autômato ${data.tipo}`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
