import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { AutomatoData, Tool } from '../../types';
import { AutomatonCanvas } from './AutomatonCanvas';
import {
    MousePointer2, Plus, ArrowUpRight, Trash2, Download, ZoomIn, ZoomOut, RotateCcw,
    Undo2, Redo2, Upload, Share2, Image, FileJson, Grid3X3, LayoutTemplate,
    AlertTriangle, Beaker, Check, AlertCircle
} from 'lucide-react';
import { useHistory } from '../../hooks/useHistory';
import { useToast } from '../ui/Toast';
import { useUiSettings } from '../../hooks/UiSettingsContext';
import { TemplatesGallery } from '../ui/TemplatesGallery';
import { ValidationPanel } from '../ui/ValidationPanel';
import { BatchTestPanel } from '../ui/BatchTestPanel';
import { Minimap } from '../ui/Minimap';
import { validateAutomaton, nfaToDfa } from '../../utils/conversions';
import { generateShareUrl, copyToClipboard, exportAsSvg, exportAsPng, downloadFile, downloadDataUrl } from '../../utils/sharing';

interface EditorProps {
    data: AutomatoData;
    onChange: (data: AutomatoData) => void;
    activeStates?: string[];
    activeTransitions?: string[];
    readOnly?: boolean;
    onInteract?: () => void;
}

export const AutomatonEditor: React.FC<EditorProps> = ({
    data,
    onChange,
    activeStates = [],
    activeTransitions = [],
    readOnly = false,
    onInteract
}) => {
    const [tool, setTool] = useState<Tool>('pointer');
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const { snapToGrid, setSnapToGrid } = useUiSettings();
    const [showTemplates, setShowTemplates] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [showBatchTest, setShowBatchTest] = useState(false);
    const [showMinimap] = useState(true); // Always show minimap for now
    const [copied, setCopied] = useState(false);
    const [viewport, setViewport] = useState({ x: 0, y: 0, width: 800, height: 600 });
    const [focusStateId, setFocusStateId] = useState<string | null>(null);
    // Track if modifier key is held for temporary tool switch
    const [modifierHeld, setModifierHeld] = useState<'shift' | 'alt' | null>(null);
    const previousToolRef = useRef<Tool>('pointer');
    // Delete all confirmation dialog
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<SVGSVGElement>(null);
    const syncSourceRef = useRef<'external' | 'internal' | null>(null);

    const { addToast } = useToast();

    // History for undo/redo
    const {
        state: historyState,
        set: setHistory,
        undo,
        redo,
        canUndo,
        canRedo
    } = useHistory<AutomatoData>(data);

    // Sync external data with history without overwriting local edits mid-render.
    useEffect(() => {
        if (syncSourceRef.current === 'internal') {
            if (data === historyState) {
                syncSourceRef.current = null;
            }
            return;
        }
        if (data !== historyState) {
            syncSourceRef.current = 'external';
            setHistory(data, false);
        }
    }, [data, historyState, setHistory]);

    // Propagate history changes to parent.
    useEffect(() => {
        if (syncSourceRef.current === 'external') {
            syncSourceRef.current = null;
            return;
        }
        if (historyState !== data) {
            onChange(historyState);
        }
    }, [historyState, onChange, data]);

    const handleChange = useCallback((newData: AutomatoData) => {
        syncSourceRef.current = 'internal';
        setHistory(newData);
    }, [setHistory]);

    // Undo/Redo with history
    const handleUndo = useCallback(() => {
        syncSourceRef.current = 'internal';
        undo();
    }, [undo]);

    const handleRedo = useCallback(() => {
        syncSourceRef.current = 'internal';
        redo();
    }, [redo]);

    const handleDeleteAll = useCallback(() => {
        handleChange({
            ...data,
            estados: [],
            transicoes: []
        });
        setShowDeleteConfirm(false);
        addToast('Autômato limpo', 'info');
    }, [data, handleChange, addToast]);

    // Keyboard shortcuts - with capture to have priority over other handlers
    useEffect(() => {
        if (readOnly) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const isInputFocused = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

            // Modifier keys for temporary tool switch - ALWAYS work, even in inputs
            // Shift -> Pointer (mover)
            if (e.key === 'Shift' && !modifierHeld && tool !== 'pointer') {
                previousToolRef.current = tool;
                setModifierHeld('shift');
                setTool('pointer');
                return;
            }
            // Alt or Ctrl -> Transition
            if ((e.key === 'Alt' || e.key === 'Control') && !modifierHeld && tool !== 'transition') {
                e.preventDefault(); // Prevent Alt from opening browser menu
                previousToolRef.current = tool;
                setModifierHeld('alt');
                setTool('transition');
                return;
            }

            // Skip other shortcuts if input is focused
            if (isInputFocused) return;

            // Undo/Redo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                handleUndo();
                addToast('Ação desfeita', 'info');
                return;
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                handleRedo();
                addToast('Ação refeita', 'info');
                return;
            }

            // Tool shortcuts
            switch (e.key.toLowerCase()) {
                case 'v': setTool('pointer'); break;
                case 's': setTool('state'); break;
                case 't': setTool('transition'); break;
                case 'd': setTool('delete'); break;
                case 'g': setSnapToGrid(!snapToGrid); break;
                case 'escape':
                    setTool('pointer');
                    setShowDeleteConfirm(false);
                    break;
                case 'delete':
                case 'backspace':
                    // If delete tool is active and there are states, show confirm dialog
                    if (tool === 'delete' && data.estados.length > 0) {
                        e.preventDefault();
                        setShowDeleteConfirm(true);
                    }
                    break;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            // Release Shift - restore previous tool
            if (e.key === 'Shift' && modifierHeld === 'shift') {
                setModifierHeld(null);
                setTool(previousToolRef.current);
            }
            // Release Alt or Ctrl - restore previous tool
            if ((e.key === 'Alt' || e.key === 'Control') && modifierHeld === 'alt') {
                setModifierHeld(null);
                setTool(previousToolRef.current);
            }
        };

        // Use capture phase to have priority over other handlers
        window.addEventListener('keydown', handleKeyDown, { capture: true });
        window.addEventListener('keyup', handleKeyUp, { capture: true });
        return () => {
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
            window.removeEventListener('keyup', handleKeyUp, { capture: true });
        };
    }, [readOnly, handleUndo, handleRedo, addToast, tool, modifierHeld, data.estados.length, snapToGrid, setSnapToGrid]);

    // Update viewport on resize
    useEffect(() => {
        const updateViewport = () => {
            if (canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                setViewport({ x: 0, y: 0, width: rect.width, height: rect.height });
            }
        };
        updateViewport();
        window.addEventListener('resize', updateViewport);
        return () => window.removeEventListener('resize', updateViewport);
    }, []);

    const tools = [
        { id: 'pointer', icon: MousePointer2, label: 'Mover', shortcut: 'V', hint: 'Segure Shift para ativar temporariamente' },
        { id: 'state', icon: Plus, label: 'Estado', shortcut: 'S' },
        { id: 'transition', icon: ArrowUpRight, label: 'Transição', shortcut: 'T', hint: 'Segure Alt/Ctrl para ativar temporariamente' },
        { id: 'delete', icon: Trash2, label: 'Apagar', shortcut: 'D', hint: 'Del/Backspace para limpar tudo' },
    ];

    const exportData = () => {
        const jsonString = JSON.stringify(data, null, 2);
        downloadFile(jsonString, `automato-${Date.now()}.json`, 'application/json');
        addToast('Autômato exportado como JSON', 'success');
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target?.result as string);
                if (imported.estados && imported.transicoes) {
                    handleChange(imported);
                    addToast('Autômato importado com sucesso!', 'success');
                } else {
                    addToast('Arquivo JSON inválido', 'error');
                }
            } catch {
                addToast('Erro ao ler arquivo JSON', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleShare = async () => {
        const url = generateShareUrl(data);
        if (url.length > 1900) {
            addToast('Link muito longo para alguns navegadores. Prefira exportar JSON.', 'warning', 4000);
        }
        const success = await copyToClipboard(url);
        if (success) {
            setCopied(true);
            addToast('Link copiado para a área de transferência!', 'success');
            setTimeout(() => setCopied(false), 2000);
        } else {
            addToast('Erro ao copiar link', 'error');
        }
    };

    const handleExportSVG = () => {
        if (!canvasRef.current) return;
        const svg = exportAsSvg(canvasRef.current);
        downloadFile(svg, `automato-${Date.now()}.svg`, 'image/svg+xml');
        addToast('Exportado como SVG', 'success');
    };

    const handleExportPNG = async () => {
        if (!canvasRef.current) return;
        try {
            const dataUrl = await exportAsPng(canvasRef.current);
            downloadDataUrl(dataUrl, `automato-${Date.now()}.png`);
            addToast('Exportado como PNG', 'success');
        } catch {
            addToast('Erro ao exportar PNG', 'error');
        }
    };

    const handleConvertToDFA = () => {
        if (data.tipo === 'AFD') {
            addToast('Já é um AFD!', 'info');
            return;
        }
        try {
            const dfa = nfaToDfa(data);
            handleChange(dfa);
            addToast('Convertido para AFD!', 'success');
        } catch (e) {
            addToast('Erro na conversão', 'error');
        }
    };

    const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 2));
    const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.5));

    const fitToContent = useCallback(() => {
        if (!canvasRef.current || data.estados.length === 0) {
            setZoom(1);
            setPan({ x: 0, y: 0 });
            return;
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        data.estados.forEach(s => {
            minX = Math.min(minX, s.x);
            minY = Math.min(minY, s.y);
            maxX = Math.max(maxX, s.x);
            maxY = Math.max(maxY, s.y);
        });

        const padding = 120;
        const contentWidth = (maxX - minX) + padding;
        const contentHeight = (maxY - minY) + padding;
        const zoomX = viewport.width / contentWidth;
        const zoomY = viewport.height / contentHeight;
        const nextZoom = Math.max(0.3, Math.min(2, Math.min(zoomX, zoomY)));

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        setZoom(nextZoom);
        setPan({
            x: viewport.width / 2 - centerX * nextZoom,
            y: viewport.height / 2 - centerY * nextZoom
        });
    }, [data.estados, viewport, setPan, setZoom]);

    const handleZoomReset = () => {
        fitToContent();
    };

    const validationIssues = validateAutomaton(data);
    const hasErrors = validationIssues.some(i => i.type === 'error');

    return (
        <div className="flex flex-col h-full relative group">
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
            />

            {/* Toolbar - Left Side */}
            {!readOnly && (
                <div className="absolute left-6 top-6 z-20 flex flex-col gap-4">
                    {/* Tool Palette */}
                    <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-lg">
                        {tools.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setTool(t.id as Tool);
                                    // If clicking delete tool when already active, show confirm dialog
                                    if (t.id === 'delete' && tool === 'delete' && data.estados.length > 0) {
                                        setShowDeleteConfirm(true);
                                    }
                                }}
                                className={`p-3 rounded-xl transition-all duration-200 relative group/tooltip ${tool === t.id
                                    ? 'bg-ios-blue text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200'
                                } ${modifierHeld === 'shift' && t.id === 'pointer' ? 'ring-2 ring-ios-blue/50' : ''
                                } ${modifierHeld === 'alt' && t.id === 'transition' ? 'ring-2 ring-ios-blue/50' : ''}`}
                            >
                                <t.icon size={20} strokeWidth={2.5} />
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-black/90 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity backdrop-blur-md flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        {t.label}
                                        <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-[9px]">{t.shortcut}</kbd>
                                    </div>
                                    {t.hint && <span className="text-[9px] text-gray-600">{t.hint}</span>}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Undo/Redo */}
                    <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-lg">
                        <button
                            onClick={handleUndo}
                            disabled={!canUndo}
                            className="p-3 rounded-xl text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed relative group/tooltip"
                            title="Desfazer (Ctrl+Z)"
                        >
                            <Undo2 size={20} strokeWidth={2.5} />
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-black/90 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity backdrop-blur-md">
                                Desfazer <kbd className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-[9px]">Ctrl+Z</kbd>
                            </div>
                        </button>
                        <button
                            onClick={handleRedo}
                            disabled={!canRedo}
                            className="p-3 rounded-xl text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed relative group/tooltip"
                            title="Refazer (Ctrl+Y)"
                        >
                            <Redo2 size={20} strokeWidth={2.5} />
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-black/90 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity backdrop-blur-md">
                                Refazer <kbd className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-[9px]">Ctrl+Y</kbd>
                            </div>
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-lg">
                        <button
                            onClick={() => setShowTemplates(true)}
                            className="p-3 rounded-xl text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200 transition-colors relative group/tooltip"
                        >
                            <LayoutTemplate size={20} strokeWidth={2.5} />
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-black/90 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity backdrop-blur-md">
                                Templates
                            </div>
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 rounded-xl text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200 transition-colors relative group/tooltip"
                        >
                            <Upload size={20} strokeWidth={2.5} />
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-black/90 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity backdrop-blur-md">
                                Importar JSON
                            </div>
                        </button>
                        <button
                            onClick={exportData}
                            className="p-3 rounded-xl text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200 transition-colors relative group/tooltip"
                        >
                            <Download size={20} strokeWidth={2.5} />
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-black/90 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity backdrop-blur-md">
                                Exportar JSON
                            </div>
                        </button>
                        <button
                            onClick={handleShare}
                            className="p-3 rounded-xl text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200 transition-colors relative group/tooltip"
                        >
                            {copied ? <Check size={20} strokeWidth={2.5} className="text-ios-green" /> : <Share2 size={20} strokeWidth={2.5} />}
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-black/90 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity backdrop-blur-md">
                                Compartilhar Link
                            </div>
                        </button>
                    </div>

                    {/* Export Images */}
                    <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-lg">
                        <button
                            onClick={handleExportPNG}
                            className="p-3 rounded-xl text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200 transition-colors relative group/tooltip"
                        >
                            <Image size={20} strokeWidth={2.5} />
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-black/90 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity backdrop-blur-md">
                                Exportar PNG
                            </div>
                        </button>
                        <button
                            onClick={handleExportSVG}
                            className="p-3 rounded-xl text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200 transition-colors relative group/tooltip"
                        >
                            <FileJson size={20} strokeWidth={2.5} />
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-black/90 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity backdrop-blur-md">
                                Exportar SVG
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Right Side Controls */}
            <div className="absolute right-6 top-6 z-20 flex flex-col gap-4">
                {/* Zoom Controls */}
                <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-lg">
                    <button onClick={handleZoomIn} className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <ZoomIn size={20} strokeWidth={2.5} />
                    </button>
                    <button onClick={handleZoomOut} className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <ZoomOut size={20} strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={handleZoomReset}
                        title="Ajustar ao conteúdo"
                        className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <RotateCcw size={18} strokeWidth={2.5} />
                    </button>
                </div>

                {/* View Options */}
                {!readOnly && (
                    <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-lg">
                        <button
                            onClick={() => setSnapToGrid(!snapToGrid)}
                            className={`p-2 rounded-xl transition-colors relative group/tooltip ${
                                snapToGrid ? 'bg-ios-blue text-white' : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10'
                            }`}
                        >
                            <Grid3X3 size={20} strokeWidth={2.5} />
                            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-black/90 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity backdrop-blur-md">
                                Snap to Grid <kbd className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-[9px]">G</kbd>
                            </div>
                        </button>
                        <button
                            onClick={() => setShowValidation(s => !s)}
                            className={`p-2 rounded-xl transition-colors relative group/tooltip ${
                                hasErrors ? 'text-ios-red' : showValidation ? 'bg-ios-green text-white' : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10'
                            }`}
                        >
                            <AlertTriangle size={20} strokeWidth={2.5} />
                            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-black/90 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity backdrop-blur-md">
                                Validar Autômato
                            </div>
                        </button>
                        <button
                            onClick={() => setShowBatchTest(s => !s)}
                            className={`p-2 rounded-xl transition-colors relative group/tooltip ${
                                showBatchTest ? 'bg-ios-purple text-white' : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10'
                            }`}
                        >
                            <Beaker size={20} strokeWidth={2.5} />
                            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-black/90 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity backdrop-blur-md">
                                Testes em Lote
                            </div>
                        </button>
                    </div>
                )}

                {/* Conversion */}
                {!readOnly && data.tipo === 'AFN' && (
                    <button
                        onClick={handleConvertToDFA}
                        className="glass-panel px-4 py-2 rounded-xl text-xs font-bold text-ios-blue hover:bg-ios-blue hover:text-white transition-all shadow-apple-lg"
                    >
                        AFN → AFD
                    </button>
                )}
            </div>

            {/* Validation Panel */}
            {showValidation && !readOnly && (
                <div className="absolute right-6 top-56 z-30 w-80">
                    <ValidationPanel
                        issues={validationIssues}
                        automaton={data}
                        onStateClick={(stateId) => setFocusStateId(stateId)}
                    />
                </div>
            )}

            {/* Batch Test Panel */}
            {showBatchTest && !readOnly && (
                <div className="absolute right-6 top-56 z-30">
                    <BatchTestPanel
                        automaton={data}
                        onClose={() => setShowBatchTest(false)}
                    />
                </div>
            )}

            {/* Canvas Area */}
            <div className="flex-1 overflow-hidden relative rounded-[24px] border border-gray-200 dark:border-white/10 bg-transparent">
                {!readOnly && data.estados.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                            <Plus className="text-gray-600" size={32} />
                        </div>
                        <p className="text-sm font-medium text-gray-600">Clique duplo para adicionar estados</p>
                        <p className="text-xs text-gray-600 mt-2">ou use um template →</p>
                    </div>
                )}

                <AutomatonCanvas
                    ref={canvasRef}
                    data={data}
                    onChange={handleChange}
                    tool={readOnly ? 'pointer' : tool}
                    activeStates={activeStates}
                    activeTransitions={activeTransitions}
                    readOnly={readOnly}
                    zoom={zoom}
                    onZoomChange={setZoom}
                    pan={pan}
                    onPanChange={setPan}
                    snapToGrid={snapToGrid}
                    onInteract={onInteract}
                    onFitToContent={fitToContent}
                    focusStateId={focusStateId}
                    onFocusHandled={() => setFocusStateId(null)}
                />

                {/* Minimap */}
                {showMinimap && data.estados.length > 3 && (
                    <Minimap
                        data={data}
                        viewport={viewport}
                        zoom={zoom}
                        pan={pan}
                        onPanChange={setPan}
                        activeStates={activeStates}
                    />
                )}
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
                    {snapToGrid && (
                        <>
                            <span className="w-px h-3 bg-gray-300 dark:bg-gray-600 self-center"></span>
                            <span className="text-ios-purple">GRID</span>
                        </>
                    )}
                </div>
            </div>

            {/* Delete All Confirmation Dialog */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowDeleteConfirm(false)}
                    />
                    <div className="relative glass-panel p-6 rounded-2xl shadow-2xl max-w-sm w-full animate-scale-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-ios-red/10 flex items-center justify-center">
                                <AlertCircle className="text-ios-red" size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">Limpar Autômato</h3>
                                <p className="text-sm text-gray-500">Esta ação não pode ser desfeita</p>
                            </div>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mb-6">
                            Tem certeza que deseja apagar todos os <strong>{data.estados.length} estados</strong> e <strong>{data.transicoes.length} transições</strong>?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteAll}
                                className="px-4 py-2 rounded-xl text-sm font-semibold bg-ios-red text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                            >
                                Apagar Tudo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Templates Modal */}
            <TemplatesGallery
                isOpen={showTemplates}
                onClose={() => setShowTemplates(false)}
                onSelect={(template) => {
                    handleChange(template);
                    addToast('Template carregado!', 'success');
                }}
            />
        </div>
    );
};
