import React, { useState } from 'react';
import type { AutomatoData, Tool } from '../../types';
import { AutomatonCanvas } from './AutomatonCanvas';
import { MousePointer2, Plus, ArrowUpRight, Trash2, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { CustomCursor } from '../ui/CustomCursor';

interface EditorProps {
    data: AutomatoData;
    onChange: (data: AutomatoData) => void;
    activeStates?: string[];
    readOnly?: boolean;
    onInteract?: () => void;
}

export const AutomatonEditor: React.FC<EditorProps> = ({ data, onChange, activeStates = [], readOnly = false, onInteract }) => {
    const [tool, setTool] = useState<Tool>('pointer');
    const [zoom, setZoom] = useState(1);

    const tools = [
        { id: 'pointer', icon: MousePointer2, label: 'Mover (V)' },
        { id: 'state', icon: Plus, label: 'Estado (S)' },
        { id: 'transition', icon: ArrowUpRight, label: 'Transição (T)' },
        { id: 'delete', icon: Trash2, label: 'Apagar (Del)' },
    ];

    // Shortcuts
    React.useEffect(() => {
        if (readOnly) return;
        const handleKeys = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement) return;
            switch (e.key.toLowerCase()) {
                case 'v': setTool('pointer'); break;
                case 's': setTool('state'); break;
                case 't': setTool('transition'); break;
                case 'd': setTool('delete'); break;
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [readOnly]);

    const exportData = () => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `automato-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 2));
    const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.5));
    const handleZoomReset = () => setZoom(1);

    return (
        <div className="flex flex-col h-full relative group">
            <CustomCursor />

            {/* Toolbar - macOS Style Floating Palette */}
            {!readOnly && (
                <div className="absolute left-6 top-6 z-20 flex flex-col gap-4">
                    <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-lg">
                        {tools.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTool(t.id as Tool)}
                                className={`p-3 rounded-xl transition-all duration-200 relative group/tooltip ${tool === t.id
                                    ? 'bg-ios-blue text-white shadow-md'
                                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200'
                                    }`}
                            >
                                <t.icon size={20} strokeWidth={2.5} />
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-black/80 text-white text-[10px] font-bold rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity backdrop-blur-md">
                                    {t.label}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-lg">
                        <button
                            onClick={exportData}
                            className="p-3 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            title="Exportar JSON"
                        >
                            <Download size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            )}

            {/* Zoom Controls */}
            <div className="absolute right-6 top-6 z-20 flex flex-col gap-1 glass-panel p-2 rounded-2xl shadow-apple-lg">
                <button onClick={handleZoomIn} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <ZoomIn size={20} strokeWidth={2.5} />
                </button>
                <button onClick={handleZoomOut} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <ZoomOut size={20} strokeWidth={2.5} />
                </button>
                <button onClick={handleZoomReset} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <RotateCcw size={18} strokeWidth={2.5} />
                </button>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-hidden relative rounded-[24px] border border-gray-200 dark:border-white/10 bg-white dark:bg-black">
                {!readOnly && data.estados.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                            <Plus className="text-gray-400" size={32} />
                        </div>
                        <p className="text-sm font-medium text-gray-400">Clique para adicionar estados</p>
                    </div>
                )}

                <AutomatonCanvas
                    data={data}
                    onChange={onChange}
                    tool={readOnly ? 'pointer' : tool}
                    activeStates={activeStates}
                    readOnly={readOnly}
                    zoom={zoom}
                    onZoomChange={setZoom}
                    onInteract={onInteract}
                />
            </div>

            {/* Status Bar */}
            <div className="absolute bottom-6 right-6 pointer-events-none">
                <div className="glass-panel px-4 py-2 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-wider flex gap-4 shadow-apple-md">
                    <span className="text-ios-blue">{data.tipo}</span>
                    <span className="w-px h-3 bg-gray-300 dark:bg-gray-600 self-center"></span>
                    <span>{data.estados.length} Estados</span>
                    <span>{data.transicoes.length} Transições</span>
                    <span className="w-px h-3 bg-gray-300 dark:bg-gray-600 self-center"></span>
                    <span>{Math.round(zoom * 100)}%</span>
                </div>
            </div>
        </div>
    );
};