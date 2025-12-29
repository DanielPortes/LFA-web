import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { AutomatoData, Tool } from '../../types';
import { AutomatonCanvas } from './AutomatonCanvas';
import {
    MousePointer2, Plus, ArrowUpRight, Trash2, Download, ZoomIn, ZoomOut, RotateCcw,
    Undo2, Redo2, Upload, Share2, Image, FileJson, Grid3X3, LayoutTemplate,
    AlertTriangle, Beaker, AlertCircle, Table, Folder, Zap, MoreVertical,
    Settings, Play, ChevronDown, ChevronUp, ArrowRightLeft
} from 'lucide-react';
import { useHistory } from '../../hooks/useHistory';
import { useToast } from '../ui/Toast';
import { useUiSettings } from '../../hooks/UiSettingsContext';
import { TemplatesGallery } from '../ui/TemplatesGallery';
import { ValidationPanel } from '../ui/ValidationPanel';
import { BatchTestPanel } from '../ui/BatchTestPanel';
import { Minimap } from '../ui/Minimap';
import { TransitionTableModal } from './TransitionTableModal';
import { SavedAutomataModal } from '../ui/SavedAutomataModal';
import { Modal } from '../ui/Modal';
import {
    getAlphabet,
    validateAutomaton,
    nfaToDfaWithSteps,
    minimizeDfaWithSteps,
    eliminateEpsilonTransitions,
    regularGrammarToNfa,
    regularGrammarToDfa,
    cfgToPda,
    mooreToMealy,
    mealyToMoore,
    type ConversionStep
} from '../../utils/conversions';
import { splitSymbolTokens } from '../../utils/symbols';
import { generateShareUrl, copyToClipboard, exportAsSvg, exportAsPng, downloadFile, downloadDataUrl } from '../../utils/sharing';
import { computeAutoLayout, optimizeLoadedLayout } from '../../utils/layout';

interface ToolbarButtonProps {
    icon: React.ElementType;
    label: string;
    shortcut?: string;
    hint?: string;
    active?: boolean;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
    danger?: boolean;
    side?: 'left' | 'right';
    badge?: number | string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon: Icon, label, shortcut, hint, active, onClick, disabled, className = '', danger, side = 'right', badge }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`p-2.5 rounded-xl transition-all duration-200 relative group/tooltip flex items-center justify-center shrink-0
            ${active
                ? 'bg-ios-blue text-white shadow-md shadow-blue-500/20'
                : 'text-secondary hover:bg-surface-hover'}
            ${danger ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : ''}
            ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
            ${className}
        `}
    >
        <Icon size={20} strokeWidth={2.5} />
        {badge !== undefined && (
            <span className="absolute -top-1 -right-1 bg-ios-red text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm min-w-[16px] flex items-center justify-center">
                {badge}
            </span>
        )}
        {/* Tooltip */}
        <div className={`absolute ${side === 'right' ? 'left-full ml-3' : 'right-full mr-3'} top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900/95 backdrop-blur-sm text-white text-xs font-medium rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 shadow-xl border border-white/10`}>
            <div className="font-bold leading-none">{label}</div>
            {(shortcut || hint) && (
                <div className="text-[10px] text-gray-300 flex items-center gap-1 mt-1">
                    {shortcut && <span className="bg-white/20 px-1.5 py-0.5 rounded font-mono">{shortcut}</span>}
                    {hint && <span>{hint}</span>}
                </div>
            )}
        </div>
    </button>
);

interface EditorProps {
    data: AutomatoData;
    onChange: (data: AutomatoData) => void;
    activeStates?: string[];
    activeTransitions?: string[];
    readOnly?: boolean;
    onInteract?: () => void;
    viewState?: { zoom: number; pan: { x: number; y: number } };
    onViewStateChange?: (zoom: number, pan: { x: number; y: number }) => void;
    compact?: boolean;
}

export const AutomatonEditor: React.FC<EditorProps> = ({
    data,
    onChange,
    activeStates = [],
    activeTransitions = [],
    readOnly = false,
    onInteract,
    viewState,
    onViewStateChange,
    compact = false
}) => {
    const [localTool, setTool] = useState<Tool>('pointer');
    const tool = localTool;

    // Internal state if not controlled
    const [internalZoom, setInternalZoom] = useState(1);
    const [internalPan, setInternalPan] = useState({ x: 0, y: 0 });

    const zoom = viewState?.zoom ?? internalZoom;
    const pan = viewState?.pan ?? internalPan;

    const handleZoomChange = useCallback((newZoom: number | ((prev: number) => number)) => {
        const nextZoom = typeof newZoom === 'function' ? newZoom(zoom) : newZoom;
        if (Math.abs(nextZoom - zoom) < 0.001) return;
        if (onViewStateChange) {
            onViewStateChange(nextZoom, pan);
        } else {
            setInternalZoom(nextZoom);
        }
    }, [zoom, pan, onViewStateChange]);

    const handlePanChange = useCallback((newPan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => {
        const nextPan = typeof newPan === 'function' ? newPan(pan) : newPan;
        const panDelta = Math.abs(nextPan.x - pan.x) + Math.abs(nextPan.y - pan.y);
        if (panDelta < 0.5) return;
        if (onViewStateChange) {
            onViewStateChange(zoom, nextPan);
        } else {
            setInternalPan(nextPan);
        }
    }, [zoom, pan, onViewStateChange]);

    const handleTransformChange = useCallback((newZoom: number, newPan: { x: number; y: number }) => {
        if (onViewStateChange) {
            onViewStateChange(newZoom, newPan);
        } else {
            setInternalZoom(newZoom);
            setInternalPan(newPan);
        }
    }, [onViewStateChange]);

    const { snapToGrid, setSnapToGrid } = useUiSettings();
    const [showTemplates, setShowTemplates] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [showLibrary, setShowLibrary] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [showBatchTest, setShowBatchTest] = useState(false);
    const [showUtilities, setShowUtilities] = useState(false);
    const [showProps, setShowProps] = useState(true);
    const [conversionModal, setConversionModal] = useState<null | {
        title: string;
        steps?: ConversionStep[];
        warnings?: string[];
        outputText?: string;
        automaton?: AutomatoData;
    }>(null);
    const [showGrammarImport, setShowGrammarImport] = useState(false);
    const [grammarImportKind, setGrammarImportKind] = useState<'regular' | 'cfg'>('regular');
    const [grammarImportTarget, setGrammarImportTarget] = useState<'AFN' | 'AFD'>('AFN');
    const [grammarImportSource, setGrammarImportSource] = useState('');
    const [grammarImportError, setGrammarImportError] = useState<string | null>(null);
    const [grammarImportWarnings, setGrammarImportWarnings] = useState<string[]>([]);
    const [auxAutomaton, setAuxAutomaton] = useState<AutomatoData | null>(null);
    const [showAuxLibrary, setShowAuxLibrary] = useState(false);
    const [showMinimap] = useState(true);
    const [viewport, setViewport] = useState({ x: 0, y: 0, width: 800, height: 600 });
    const [focusStateId, setFocusStateId] = useState<string | null>(null);
    const [alphabetInput, setAlphabetInput] = useState('');
    const [isEditingAlphabet, setIsEditingAlphabet] = useState(false);
    const [stackAlphabetInput, setStackAlphabetInput] = useState('');
    const [isEditingStackAlphabet, setIsEditingStackAlphabet] = useState(false);
    const [stackStartSymbol, setStackStartSymbol] = useState('');
    const [isEditingStackStart, setIsEditingStackStart] = useState(false);
    const [modifierHeld, setModifierHeld] = useState<'shift' | 'alt' | null>(null);
    const previousToolRef = useRef<Tool>('pointer');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Auto-Layout State Tracking
    const lastStateCountRef = useRef(data.estados.length);

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

    const dataRef = useRef(data);
    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    useEffect(() => {
        const currentCount = data.estados.length;
        const prevCount = lastStateCountRef.current;
        const shouldOptimize = currentCount > prevCount + 1 || (currentCount > 0 && prevCount === 0);

        if (shouldOptimize) {
            const timeout = setTimeout(() => {
                const currentData = dataRef.current;
                const rect = canvasRef.current?.getBoundingClientRect();
                const viewWidth = rect?.width || 800;
                const viewHeight = rect?.height || 600;

                const { states: optimized, needsReposition } = optimizeLoadedLayout(
                    currentData.estados,
                    currentData.transicoes,
                    viewWidth,
                    viewHeight
                );

                if (needsReposition) {
                    handleChange({ ...currentData, estados: optimized });
                    addToast('Layout ajustado automaticamente', 'info');
                }
                lastStateCountRef.current = currentData.estados.length;
            }, 100);
            return () => clearTimeout(timeout);
        }

        lastStateCountRef.current = currentCount;
    }, [data.estados.length, handleChange, addToast]);

    const calculateFitTransform = useCallback((states: typeof data.estados) => {
        if (states.length === 0) return { zoom: 1, pan: { x: 0, y: 0 } };

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        states.forEach(s => {
            minX = Math.min(minX, s.x);
            minY = Math.min(minY, s.y);
            maxX = Math.max(maxX, s.x);
            maxY = Math.max(maxY, s.y);
        });

        const padding = 150;
        const contentWidth = (maxX - minX) + padding;
        const contentHeight = (maxY - minY) + padding;
        const zoomX = viewport.width / contentWidth;
        const zoomY = viewport.height / contentHeight;
        const nextZoom = Math.max(0.3, Math.min(1.5, Math.min(zoomX, zoomY)));

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        
        const nextPan = {
            x: viewport.width / 2 - centerX * nextZoom,
            y: viewport.height / 2 - centerY * nextZoom
        };

        return { zoom: nextZoom, pan: nextPan };
    }, [viewport]);

    const fitToContent = useCallback(() => {
        if (!canvasRef.current || data.estados.length === 0) {
            handleTransformChange(1, { x: 0, y: 0 });
            return;
        }

        const { zoom: nextZoom, pan: nextPan } = calculateFitTransform(data.estados);
        handleTransformChange(nextZoom, nextPan);
    }, [data.estados, calculateFitTransform, handleTransformChange]);

    const handleMagicLayout = () => {
        if (!canvasRef.current) return;
        if (data.estados.length === 0) {
            addToast('Adicione estados primeiro', 'warning');
            return;
        }

        const rect = canvasRef.current.getBoundingClientRect();
        // Ensure valid dimensions
        const width = Math.max(rect.width, 400);
        const height = Math.max(rect.height, 300);

        const layouted = computeAutoLayout(data.estados, data.transicoes, width, height);

        // Validate layout results before applying
        const isValid = layouted.every(s =>
            Number.isFinite(s.x) && Number.isFinite(s.y) &&
            s.x > 0 && s.y > 0 && s.x < width * 2 && s.y < height * 2
        );

        if (!isValid) {
            addToast('Erro no layout, tente novamente', 'error');
            return;
        }

        handleChange({ ...data, estados: layouted });
        
        // Calculate and apply new view transform immediately
        const { zoom: nextZoom, pan: nextPan } = calculateFitTransform(layouted);
        handleTransformChange(nextZoom, nextPan);

        addToast('Layout automático aplicado!', 'success');
    };

    const commitAlphabet = useCallback((value: string) => {
        const tokens = splitSymbolTokens(value);
        if (tokens.length === 0) {
            handleChange({ ...data, alfabeto: undefined });
        } else {
            handleChange({ ...data, alfabeto: tokens });
        }
    }, [data, handleChange]);

    const commitStackAlphabet = useCallback((value: string) => {
        const tokens = splitSymbolTokens(value);
        if (tokens.length === 0) {
            handleChange({ ...data, alfabetoPilha: undefined });
        } else {
            handleChange({ ...data, alfabetoPilha: tokens });
        }
    }, [data, handleChange]);

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

    useEffect(() => {
        if (readOnly) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const isInputFocused = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

            if (e.key === 'Shift' && !modifierHeld && tool !== 'pointer') {
                previousToolRef.current = tool;
                setModifierHeld('shift');
                setTool('pointer');
                return;
            }
            if (e.key === 'Alt' && !modifierHeld && tool !== 'transition') {
                e.preventDefault();
                previousToolRef.current = tool;
                setModifierHeld('alt');
                setTool('transition');
                return;
            }

            if (isInputFocused) return;

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
                    if (tool === 'delete' && data.estados.length > 0) {
                        e.preventDefault();
                        setShowDeleteConfirm(true);
                    }
                    break;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift' && modifierHeld === 'shift') {
                setModifierHeld(null);
                setTool(previousToolRef.current);
            }
            if (e.key === 'Alt' && modifierHeld === 'alt') {
                setModifierHeld(null);
                setTool(previousToolRef.current);
            }
        };

        window.addEventListener('keydown', handleKeyDown, { capture: true });
        window.addEventListener('keyup', handleKeyUp, { capture: true });
        return () => {
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
            window.removeEventListener('keyup', handleKeyUp, { capture: true });
        };
    }, [readOnly, handleUndo, handleRedo, addToast, tool, modifierHeld, data.estados.length, snapToGrid, setSnapToGrid]);

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

    useEffect(() => {
        if (isEditingAlphabet) return;
        const inferred = data.alfabeto && data.alfabeto.length > 0
            ? data.alfabeto
            : getAlphabet({ ...data, alfabeto: undefined });
        setAlphabetInput(inferred.join(', '));
    }, [data.alfabeto, data.transicoes, isEditingAlphabet]);

    useEffect(() => {
        if (isEditingStackAlphabet) return;
        const inferred = data.alfabetoPilha && data.alfabetoPilha.length > 0
            ? data.alfabetoPilha
            : [];
        setStackAlphabetInput(inferred.join(', '));
    }, [data.alfabetoPilha, isEditingStackAlphabet]);

    useEffect(() => {
        if (isEditingStackStart) return;
        setStackStartSymbol(data.simboloInicialPilha ?? '');
    }, [data.simboloInicialPilha, isEditingStackStart]);

    useEffect(() => {
        if (data.tipo === 'AP') {
            setShowTable(false);
        }
    }, [data.tipo]);

    const tools = [
        { id: 'pointer', icon: MousePointer2, label: 'Mover', shortcut: 'V', hint: 'Segure Shift' },
        { id: 'state', icon: Plus, label: 'Estado', shortcut: 'S', hint: 'Clique para criar' },
        { id: 'transition', icon: ArrowUpRight, label: 'Transição', shortcut: 'T', hint: 'Segure Alt' },
        { id: 'delete', icon: Trash2, label: 'Apagar', shortcut: 'D', hint: 'Clique p/ remover' },
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
                    const rect = canvasRef.current?.getBoundingClientRect();
                    const viewWidth = rect?.width || 800;
                    const viewHeight = rect?.height || 600;

                    const { states: optimizedStates, needsReposition } = optimizeLoadedLayout(
                        imported.estados,
                        imported.transicoes,
                        viewWidth,
                        viewHeight
                    );

                    const optimizedData = { ...imported, estados: optimizedStates };
                    handleChange(optimizedData);

                    if (needsReposition) {
                        addToast('Autômato importado e ajustado!', 'success');
                    } else {
                        addToast('Autômato importado com sucesso!', 'success');
                    }
                    setTimeout(() => fitToContent(), 200);
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
            addToast('Link muito longo. Use Exportar JSON.', 'warning', 4000);
        }
        const success = await copyToClipboard(url);
        if (success) {
            addToast('Link copiado!', 'success');
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
        try {
            const result = nfaToDfaWithSteps(data);
            openConversionModal({ title: 'Determinizar (AFN -> AFD)', steps: result.steps, automaton: result.automaton });
        } catch { addToast('Erro na conversao', 'error'); }
    };
    const handleEliminateEpsilon = () => {
        try {
            const result = eliminateEpsilonTransitions(data);
            openConversionModal({ title: 'Remocao de eps', steps: result.steps, automaton: result.automaton });
        } catch { addToast('Erro na conversao', 'error'); }
    };
    const handleMinimizeDfa = () => {
        try {
            const result = minimizeDfaWithSteps(data);
            openConversionModal({ title: 'Minimizacao de AFD', steps: result.steps, automaton: result.automaton });
        } catch { addToast('Erro na minimizacao', 'error'); }
    };
    const openConversionModal = (payload: any) => setConversionModal(payload);
    
    const handleMooreToMealy = () => {
        const converted = mooreToMealy(data);
        openConversionModal({ title: 'Moore -> Mealy', steps: [{ title: 'Conversao', detail: 'OK' }], automaton: converted });
    };
    const handleMealyToMoore = () => {
        const converted = mealyToMoore(data);
        openConversionModal({ title: 'Mealy -> Moore', steps: [{ title: 'Conversao', detail: 'OK' }], automaton: converted });
    };

    const handleGrammarImport = () => {
         const source = grammarImportSource.trim();
        if (!source) {
            setGrammarImportError('Informe a gramatica.');
            return;
        }
        if (grammarImportKind === 'regular') {
            const result = grammarImportTarget === 'AFD' ? regularGrammarToDfa(source) : regularGrammarToNfa(source);
            if (!result.automaton) {
                setGrammarImportError(result.error || 'Erro');
                return;
            }
            setGrammarImportWarnings(result.warnings ?? []);
            handleChange(result.automaton);
            setShowGrammarImport(false);
            addToast('Gramatica convertida', 'success');
        } else {
             const result = cfgToPda(source);
            if (!result.automaton) {
                setGrammarImportError(result.error || 'Erro');
                return;
            }
            setGrammarImportWarnings(result.warnings ?? []);
            handleChange(result.automaton);
            setShowGrammarImport(false);
            addToast('GLC convertida', 'success');
        }
    };

    const handleZoomIn = () => handleZoomChange(z => Math.min(z + 0.1, 5));
    const handleZoomOut = () => handleZoomChange(z => Math.max(z - 0.1, 0.1));
    const handleZoomReset = () => fitToContent();

    const validationIssues = validateAutomaton(data);
    const hasErrors = validationIssues.some(i => i.type === 'error');
    const warningCount = validationIssues.length;

    return (
        <div className="flex flex-col h-full relative group bg-app">
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

            {/* --- LEFT TOOLBAR (Tools) --- */}
            {!readOnly && (
                <div className="absolute left-4 top-4 bottom-4 z-20 flex flex-col pointer-events-none">
                    <div className="pointer-events-auto flex flex-col gap-3">
                        {/* Tools */}
                        <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-xl backdrop-blur-xl border border-white/20">
                            {tools.map((t) => (
                                <ToolbarButton
                                    key={t.id}
                                    icon={t.icon}
                                    label={t.label}
                                    shortcut={t.shortcut}
                                    hint={t.hint}
                                    active={tool === t.id}
                                    onClick={() => {
                                        setTool(t.id as Tool);
                                        if (t.id === 'delete' && tool === 'delete' && data.estados.length > 0) setShowDeleteConfirm(true);
                                    }}
                                    className={`${modifierHeld === 'shift' && t.id === 'pointer' ? 'ring-2 ring-ios-blue/50' : ''} ${modifierHeld === 'alt' && t.id === 'transition' ? 'ring-2 ring-ios-blue/50' : ''}`}
                                    side="right"
                                />
                            ))}
                        </div>

                        {/* History */}
                        <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-xl backdrop-blur-xl border border-white/20">
                            <ToolbarButton icon={Undo2} label="Desfazer" shortcut="Ctrl+Z" disabled={!canUndo} onClick={handleUndo} side="right" />
                            <ToolbarButton icon={Redo2} label="Refazer" shortcut="Ctrl+Y" disabled={!canRedo} onClick={handleRedo} side="right" />
                        </div>

                        {/* Actions */}
                        <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-xl backdrop-blur-xl border border-white/20">
                             <ToolbarButton icon={LayoutTemplate} label="Templates" onClick={() => setShowTemplates(true)} side="right" />
                             <ToolbarButton icon={Folder} label="Biblioteca" onClick={() => setShowLibrary(true)} side="right" />
                        </div>
                         
                         {/* Utilities Toggle */}
                        <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-xl backdrop-blur-xl border border-white/20">
                            <ToolbarButton icon={MoreVertical} label={showUtilities ? 'Menos' : 'Mais'} active={showUtilities} onClick={() => setShowUtilities(s => !s)} side="right" />
                        </div>

                        {/* Expanded Utilities */}
                        {showUtilities && (
                            <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-xl backdrop-blur-xl border border-white/20 animate-slide-right-fade">
                                <ToolbarButton icon={Upload} label="Importar JSON" onClick={() => fileInputRef.current?.click()} side="right" />
                                <ToolbarButton icon={Download} label="Exportar JSON" onClick={exportData} side="right" />
                                <ToolbarButton icon={Share2} label="Compartilhar" onClick={handleShare} side="right" />
                                <div className="h-px bg-border my-1" />
                                <ToolbarButton icon={Image} label="Exportar PNG" onClick={handleExportPNG} side="right" />
                                <ToolbarButton icon={FileJson} label="Exportar SVG" onClick={handleExportSVG} side="right" />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- RIGHT CONTROLS (Settings & Analysis) --- */}
            <div className="absolute right-4 top-4 bottom-20 w-72 pointer-events-none z-20 flex flex-col gap-3 items-end">
                <div className="pointer-events-auto flex flex-col gap-3 w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar pb-4 pr-1">
                    
                    {/* Collapsible Properties Panel */}
                    <div className="glass-panel p-1 rounded-2xl shadow-xl backdrop-blur-xl border border-white/20 w-full animate-fade-in-up transition-all">
                        <button 
                            onClick={() => setShowProps(p => !p)}
                            className="w-full flex items-center justify-between p-3 text-secondary hover:bg-surface-hover rounded-xl transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Settings size={16} />
                                <span className="ui-kicker">Propriedades</span>
                            </div>
                            {showProps ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        
                        {showProps && (
                            <div className="px-3 pb-3 pt-1 space-y-3 animate-scale-in origin-top">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-muted uppercase">Tipo</label>
                                    <select
                                        value={data.tipo}
                                        onChange={(e) => {
                                            const nextTipo = e.target.value as AutomatoData['tipo'];
                                            const nextData = { ...data, tipo: nextTipo, pdaAcceptance: nextTipo === 'AP' ? (data.pdaAcceptance ?? 'final') : data.pdaAcceptance };
                                            if (nextTipo === 'AP' && !data.simboloInicialPilha) nextData.simboloInicialPilha = 'Z';
                                            handleChange(nextData);
                                        }}
                                        disabled={readOnly}
                                        className="w-full bg-surface-muted border border-default rounded-lg px-2 py-1.5 text-sm font-semibold outline-none focus:ring-2 ring-ios-blue/30"
                                    >
                                        <option value="AFD">AFD</option>
                                        <option value="AFN">AFN</option>
                                        <option value="AP">Autômato com Pilha</option>
                                        <option value="MT">Máquina de Turing</option>
                                        <option value="ALL">Linearmente Limitado</option>
                                        <option value="Moore">Máquina de Moore</option>
                                        <option value="Mealy">Máquina de Mealy</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-bold text-muted uppercase">Alfabeto</label>
                                        <button onClick={() => { setIsEditingAlphabet(false); const inferred = getAlphabet({ ...data, alfabeto: undefined }); setAlphabetInput(inferred.join(', ')); handleChange({ ...data, alfabeto: undefined }); }}
                                            className="text-[10px] text-ios-blue hover:underline">Auto</button>
                                    </div>
                                    <input
                                        value={alphabetInput}
                                        onChange={(e) => setAlphabetInput(e.target.value)}
                                        onFocus={() => setIsEditingAlphabet(true)}
                                        onBlur={(e) => { setIsEditingAlphabet(false); commitAlphabet(e.target.value); }}
                                        className="w-full bg-surface-muted border border-default rounded-lg px-2 py-1.5 text-sm font-mono outline-none focus:ring-2 ring-ios-blue/30"
                                        placeholder="ex: a, b"
                                        disabled={readOnly}
                                    />
                                </div>

                                {data.tipo === 'AP' && (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-muted uppercase">Alfabeto Pilha</label>
                                            <input
                                                value={stackAlphabetInput}
                                                onChange={(e) => setStackAlphabetInput(e.target.value)}
                                                onFocus={() => setIsEditingStackAlphabet(true)}
                                                onBlur={(e) => { setIsEditingStackAlphabet(false); commitStackAlphabet(e.target.value); }}
                                                className="w-full bg-surface-muted border border-default rounded-lg px-2 py-1.5 text-sm font-mono outline-none focus:ring-2 ring-ios-blue/30"
                                                placeholder="ex: Z, A"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-muted uppercase">Início Pilha</label>
                                            <input
                                                value={stackStartSymbol}
                                                onChange={(e) => setStackStartSymbol(e.target.value)}
                                                onFocus={() => setIsEditingStackStart(true)}
                                                onBlur={(e) => { setIsEditingStackStart(false); handleChange({ ...data, simboloInicialPilha: e.target.value.trim() || undefined }); }}
                                                className="w-full bg-surface-muted border border-default rounded-lg px-2 py-1.5 text-sm font-mono outline-none focus:ring-2 ring-ios-blue/30"
                                                placeholder="ex: Z0"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Compact View & Analysis Tools */}
                    {!readOnly && (
                    <div className="glass-panel p-2 rounded-2xl flex flex-wrap gap-2 shadow-xl backdrop-blur-xl border border-white/20 w-full animate-fade-in-up items-center justify-between" style={{ animationDelay: '0.1s' }}>
                         <div className="flex gap-1">
                            <ToolbarButton icon={Grid3X3} label="Grid" active={snapToGrid} onClick={() => setSnapToGrid(!snapToGrid)} side="left" />
                            <ToolbarButton icon={Zap} label="Magic Layout" onClick={handleMagicLayout} side="left" />
                         </div>
                         <div className="w-px h-6 bg-border" />
                         <div className="flex gap-1">
                             <ToolbarButton 
                                icon={AlertTriangle} 
                                label="Validar" 
                                active={showValidation} 
                                onClick={() => setShowValidation(s => !s)} 
                                side="left" 
                                className={hasErrors ? 'text-ios-red' : ''}
                                badge={warningCount > 0 ? warningCount : undefined}
                             />
                             <ToolbarButton 
                                icon={Beaker} 
                                label="Testes em Lote" 
                                active={showBatchTest} 
                                onClick={() => { if (data.tipo === 'AP') { addToast('Indisponível para AP', 'warning'); return; } setShowBatchTest(s => !s); }} 
                                side="left" 
                                disabled={data.tipo === 'AP'}
                             />
                             <ToolbarButton
                                icon={Table}
                                label="Tabela"
                                active={showTable}
                                onClick={() => { if (data.tipo === 'AP') { addToast('Indisponível para AP', 'warning'); return; } setShowTable(s => !s); }}
                                side="left"
                                disabled={data.tipo === 'AP'}
                             />
                         </div>
                    </div>
                    )}

                    {/* Validation Detail Panel (Embedded) */}
                    {showValidation && !readOnly && (
                        <div className="w-full animate-fade-in-up">
                            <ValidationPanel issues={validationIssues} automaton={data} onStateClick={setFocusStateId} />
                        </div>
                    )}

                    {/* Batch Test Panel (Embedded) */}
                    {showBatchTest && !readOnly && data.tipo !== 'AP' && (
                        <div className="w-full animate-fade-in-up">
                            <BatchTestPanel automaton={data} onClose={() => setShowBatchTest(false)} />
                        </div>
                    )}

                     {/* Converters Panel (Only if Utility shown) */}
                    {showUtilities && !readOnly && (data.tipo === 'AFN' || data.tipo === 'AFD' || data.tipo === 'Moore' || data.tipo === 'Mealy') && (
                         <div className="glass-panel p-3 rounded-2xl shadow-xl backdrop-blur-xl border border-white/20 w-full animate-fade-in-up flex flex-col gap-2">
                            <div className="text-[10px] font-bold text-muted uppercase px-1">Conversores</div>
                            {data.tipo === 'AFN' && (
                                <>
                                    <button onClick={handleConvertToDFA} className="flex items-center w-full p-2.5 rounded-xl hover:bg-surface-hover text-xs font-semibold text-secondary border border-transparent hover:border-default transition-all">
                                        <Play size={14} className="mr-2"/> AFN → AFD
                                    </button>
                                    <button onClick={handleEliminateEpsilon} className="flex items-center w-full p-2.5 rounded-xl hover:bg-surface-hover text-xs font-semibold text-secondary border border-transparent hover:border-default transition-all">
                                        <Play size={14} className="mr-2"/> Remover ε
                                    </button>
                                </>
                            )}
                            {data.tipo === 'AFD' && (
                                <button onClick={handleMinimizeDfa} className="flex items-center w-full p-2.5 rounded-xl hover:bg-surface-hover text-xs font-semibold text-secondary border border-transparent hover:border-default transition-all">
                                    <Play size={14} className="mr-2"/> Minimizar AFD
                                </button>
                            )}
                            {data.tipo === 'Moore' && (
                                <button onClick={handleMooreToMealy} className="flex items-center w-full p-2.5 rounded-xl hover:bg-surface-hover text-xs font-semibold text-secondary border border-transparent hover:border-default transition-all">
                                    <ArrowRightLeft size={14} className="mr-2"/> Moore → Mealy
                                </button>
                            )}
                            {data.tipo === 'Mealy' && (
                                <button onClick={handleMealyToMoore} className="flex items-center w-full p-2.5 rounded-xl hover:bg-surface-hover text-xs font-semibold text-secondary border border-transparent hover:border-default transition-all">
                                    <ArrowRightLeft size={14} className="mr-2"/> Mealy → Moore
                                </button>
                            )}
                         </div>
                    )}
                </div>
            </div>

            {/* --- CANVAS --- */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {!readOnly && data.estados.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
                         <div className="w-20 h-20 rounded-3xl bg-gray-100/50 dark:bg-white/5 flex items-center justify-center mb-4 border border-dashed border-gray-400">
                            <Plus className="text-gray-400" size={40} />
                        </div>
                        <p className="text-sm font-medium text-muted">Comece adicionando um estado</p>
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
                    onZoomChange={handleZoomChange}
                    pan={pan}
                    onPanChange={handlePanChange}
                    onTransformChange={handleTransformChange}
                    snapToGrid={snapToGrid}
                    onInteract={onInteract}
                    onFitToContent={fitToContent}
                    focusStateId={focusStateId}
                    onFocusHandled={() => setFocusStateId(null)}
                />
            </div>
            
            {/* Minimap (Floating Bottom Left) */}
            {showMinimap && data.estados.length > 3 && (
                 <div className="absolute bottom-16 left-16 sm:left-20 z-10 opacity-70 hover:opacity-100 transition-opacity hover:z-30">
                    <Minimap
                        data={data}
                        viewport={viewport}
                        zoom={zoom}
                        pan={pan}
                        onPanChange={handlePanChange}
                        activeStates={activeStates}
                    />
                </div>
            )}

            {/* --- BOTTOM BAR --- (hidden in compact mode) */}
            {!compact && (
                <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center pointer-events-none">
                    <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-4 shadow-2xl backdrop-blur-xl border border-white/20 pointer-events-auto">
                        {/* Info Stats */}
                        <div className="flex items-center gap-3 ui-kicker-xs text-secondary">
                            <span className="text-ios-blue bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{data.tipo}</span>
                            <span className="w-px h-3 bg-border"></span>
                            <span>{data.estados.length} Est.</span>
                            <span>{data.transicoes.length} Trans.</span>
                        </div>

                        {/* Zoom Controls */}
                        <div className="w-px h-4 bg-border"></div>
                        <div className="flex items-center gap-1">
                            <button onClick={handleZoomOut} className="p-1.5 hover:bg-surface-hover rounded-lg text-secondary transition-colors"><ZoomOut size={14} /></button>
                            <span className="text-[10px] font-mono font-bold w-10 text-center text-primary">{Math.round(zoom * 100)}%</span>
                            <button onClick={handleZoomIn} className="p-1.5 hover:bg-surface-hover rounded-lg text-secondary transition-colors"><ZoomIn size={14} /></button>
                            <button onClick={handleZoomReset} className="p-1.5 hover:bg-surface-hover rounded-lg text-secondary transition-colors ml-1" title="Ajustar ao conteúdo"><RotateCcw size={14} /></button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="glass-panel p-6 rounded-3xl shadow-2xl max-w-sm w-full animate-scale-in border border-white/20 bg-app">
                        <div className="flex flex-col items-center text-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-ios-red">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-primary">Limpar tudo?</h3>
                                <p className="text-sm text-muted mt-1">Isso apagará {data.estados.length} estados e não pode ser desfeito (apenas via Undo).</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-xl font-bold text-secondary bg-surface-muted hover:bg-surface-hover transition-colors">Cancelar</button>
                            <button onClick={handleDeleteAll} className="flex-1 py-3 rounded-xl font-bold text-white bg-ios-red hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">Apagar</button>
                        </div>
                    </div>
                </div>
            )}

            <TemplatesGallery isOpen={showTemplates} onClose={() => setShowTemplates(false)} onSelect={(t) => { handleChange(t); addToast('Template carregado!', 'success'); }} />
            <TransitionTableModal isOpen={showTable} onClose={() => setShowTable(false)} automaton={data} onChange={handleChange} />
            <SavedAutomataModal isOpen={showLibrary} onClose={() => setShowLibrary(false)} current={data} onLoad={(l) => { handleChange(l); addToast('Carregado!', 'success'); }} />
            <SavedAutomataModal isOpen={showAuxLibrary} onClose={() => setShowAuxLibrary(false)} current={auxAutomaton ?? data} onLoad={(l) => { setAuxAutomaton(l); addToast('B carregado!', 'success'); }} />
            
            {/* Conversion Modal */}
            <Modal isOpen={!!conversionModal} onClose={() => setConversionModal(null)} title={conversionModal?.title || 'Conversão'} className="max-w-3xl">
                <div className="space-y-6">
                     {conversionModal?.warnings && conversionModal.warnings.length > 0 && (
                        <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200 text-sm">
                            <div className="font-bold mb-2 flex items-center gap-2"><AlertTriangle size={16}/> Avisos</div>
                            <ul className="list-disc list-inside space-y-1 opacity-90">{conversionModal.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
                        </div>
                    )}
                    {conversionModal?.steps && (
                        <div className="space-y-3">
                            {conversionModal.steps.map((step, i) => (
                                <div key={i} className="flex gap-3 text-sm">
                                    <div className="w-6 h-6 rounded-full bg-ios-blue/10 text-ios-blue flex items-center justify-center font-bold text-xs shrink-0">{i + 1}</div>
                                    <div><span className="font-bold text-primary">{step.title}</span> <span className="text-secondary">{step.detail}</span></div>
                                </div>
                            ))}
                        </div>
                    )}
                    {conversionModal?.outputText && <pre className="p-4 rounded-xl bg-surface-muted font-mono text-xs overflow-auto max-h-64 border border-default">{conversionModal.outputText}</pre>}
                    {conversionModal?.automaton && (
                        <div className="flex justify-end pt-4 border-t border-default">
                            <button onClick={() => { handleChange(conversionModal.automaton as AutomatoData); setConversionModal(null); addToast('Aplicado!', 'success'); }} className="px-4 py-2 rounded-xl bg-ios-blue text-white text-sm font-bold hover:bg-blue-600 transition-colors">
                                Substituir Autômato Atual
                            </button>
                        </div>
                    )}
                </div>
            </Modal>
            
            {/* Grammar Import Modal */}
            <Modal isOpen={showGrammarImport} onClose={() => setShowGrammarImport(false)} title="Importar Gramática" className="max-w-2xl">
                 <div className="space-y-4">
                     <div className="flex gap-2 p-1 bg-surface-muted rounded-xl w-fit">
                         <button onClick={() => setGrammarImportKind('regular')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${grammarImportKind === 'regular' ? 'bg-white shadow text-black' : 'text-secondary'}`}>Regular</button>
                         <button onClick={() => setGrammarImportKind('cfg')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${grammarImportKind === 'cfg' ? 'bg-white shadow text-black' : 'text-secondary'}`}>Livre de Contexto</button>
                     </div>
                     {grammarImportKind === 'regular' && (
                         <div className="flex gap-2 p-1 bg-surface-muted rounded-xl w-fit">
                             <button
                                 onClick={() => setGrammarImportTarget('AFN')}
                                 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${grammarImportTarget === 'AFN' ? 'bg-white shadow text-black' : 'text-secondary'}`}
                             >
                                 AFN
                             </button>
                             <button
                                 onClick={() => setGrammarImportTarget('AFD')}
                                 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${grammarImportTarget === 'AFD' ? 'bg-white shadow text-black' : 'text-secondary'}`}
                             >
                                 AFD
                             </button>
                         </div>
                     )}
                     <textarea value={grammarImportSource} onChange={(e) => setGrammarImportSource(e.target.value)} className="w-full h-48 bg-surface-muted border border-default rounded-xl p-3 font-mono text-sm" placeholder={grammarImportKind === 'regular' ? "S -> aA | b" : "S -> aSb | ε"} />
                     {grammarImportError && <div className="text-sm text-ios-red font-medium flex items-center gap-2"><AlertCircle size={16}/> {grammarImportError}</div>}
                     {grammarImportWarnings.length > 0 && (
                         <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                             {grammarImportWarnings.map((warn, idx) => (
                                 <div key={`${warn}-${idx}`}>- {warn}</div>
                             ))}
                         </div>
                     )}
                     <div className="flex justify-end gap-2">
                         <button onClick={handleGrammarImport} className="px-4 py-2 rounded-xl bg-ios-blue text-white text-sm font-bold hover:bg-blue-600 transition-colors">Converter</button>
                     </div>
                 </div>
            </Modal>
        </div>
    );
};
