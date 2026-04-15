import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import type { AutomatoData } from '../../../types';

interface EditorBottomBarProps {
    compact?: boolean;
    data: AutomatoData;
    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onZoomReset: () => void;
}

export const EditorBottomBar: React.FC<EditorBottomBarProps> = ({
    compact = false,
    data,
    zoom,
    onZoomIn,
    onZoomOut,
    onZoomReset,
}) => {
    if (compact) return null;

    return (
        <div className="flex justify-center">
            <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-4 shadow-apple-lg border border-default">
                <div className="flex items-center gap-3 ui-kicker-xs text-secondary">
                    <span className="badge badge-info">{data.tipo}</span>
                    <span className="w-px h-3 bg-border"></span>
                    <span>{data.estados.length} Est.</span>
                    <span>{data.transicoes.length} Trans.</span>
                </div>

                <div className="w-px h-4 bg-border"></div>

                <div className="flex items-center gap-1">
                    <button onClick={onZoomOut} className="p-1.5 hover:bg-surface-hover rounded-lg text-secondary transition-colors">
                        <ZoomOut size={14} />
                    </button>
                    <span className="text-xs font-mono font-bold w-10 text-center text-primary">{Math.round(zoom * 100)}%</span>
                    <button onClick={onZoomIn} className="p-1.5 hover:bg-surface-hover rounded-lg text-secondary transition-colors">
                        <ZoomIn size={14} />
                    </button>
                    <button onClick={onZoomReset} className="p-1.5 hover:bg-surface-hover rounded-lg text-secondary transition-colors ml-1" title="Ajustar ao conteúdo">
                        <RotateCcw size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
