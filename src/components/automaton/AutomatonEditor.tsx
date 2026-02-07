import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { AutomatoData, Tool, APData, Estado } from '../../types';
import { isAP } from '../../types';
import { AutomatonCanvas } from './AutomatonCanvas';

// Helper to safely get PDA properties
function getPdaProps(data: AutomatoData) {
    if (isAP(data)) {
        return {
            alfabetoPilha: data.alfabetoPilha,
            simboloInicialPilha: data.simboloInicialPilha,
            pdaAcceptance: data.pdaAcceptance,
        };
    }
    return { alfabetoPilha: undefined, simboloInicialPilha: undefined, pdaAcceptance: undefined };
}
import {
    MousePointer2, Plus, ArrowUpRight, Trash2, Download, ZoomIn, ZoomOut, RotateCcw,
    Undo2, Redo2, Upload, Share2, Image, FileJson, Grid3X3, LayoutTemplate,
    AlertTriangle, Beaker, AlertCircle, Table, Folder, Zap, MoreVertical,
    Settings, Play, ChevronDown, ChevronUp, ArrowRightLeft, Sparkles, Lightbulb, X
} from 'lucide-react';
import { useHistory } from '../../hooks/useHistory';
import { useToast } from '../ui';
import { useUiSettings } from '../../hooks/useUiSettings';
import { TemplatesGallery } from '../ui/TemplatesGallery';
import { ValidationPanel } from '../ui/ValidationPanel';
import { BatchTestPanel } from '../ui/BatchTestPanel';
import { EquivalentsPanel } from '../ui/EquivalentsPanel';
import { Minimap } from '../ui/Minimap';
import { ToolbarButton } from '../ui/ToolbarButton';
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
    fitRequestToken?: number;
}

const EDITOR_COACH_STORAGE_KEY = 'lfa-simulator-coach-dismissed-v1';

export const AutomatonEditor: React.FC<EditorProps> = ({
    data,
    onChange,
    activeStates = [],
    activeTransitions = [],
    readOnly = false,
    onInteract,
    viewState,
    onViewStateChange,
    compact = false,
    fitRequestToken
}) => {
    const [localTool, setTool] = useState<Tool>('pointer');
    const tool = localTool;

    // Internal state if not controlled
    const [internalZoom, setInternalZoom] = useState(1);
    const [internalPan, setInternalPan] = useState({ x: 0, y: 0 });

    const zoom = viewState?.zoom ?? internalZoom;
    const pan = viewState?.pan ?? internalPan;

    // Use refs to avoid recreating callbacks when zoom/pan change
    const zoomRef = useRef(zoom);
    const panRef = useRef(pan);
    const onViewStateChangeRef = useRef(onViewStateChange);

    useEffect(() => { zoomRef.current = zoom; }, [zoom]);
    useEffect(() => { panRef.current = pan; }, [pan]);
    useEffect(() => { onViewStateChangeRef.current = onViewStateChange; }, [onViewStateChange]);

    // Stable callbacks that don't change when zoom/pan change
    const handleZoomChange = useCallback((newZoom: number | ((prev: number) => number)) => {
        const currentZoom = zoomRef.current;
        const currentPan = panRef.current;
        const nextZoom = typeof newZoom === 'function' ? newZoom(currentZoom) : newZoom;
        if (Math.abs(nextZoom - currentZoom) < 0.001) return;
        if (onViewStateChangeRef.current) {
            onViewStateChangeRef.current(nextZoom, currentPan);
        } else {
            setInternalZoom(nextZoom);
        }
    }, []);

    const handlePanChange = useCallback((newPan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => {
        const currentZoom = zoomRef.current;
        const currentPan = panRef.current;
        const nextPan = typeof newPan === 'function' ? newPan(currentPan) : newPan;
        const panDelta = Math.abs(nextPan.x - currentPan.x) + Math.abs(nextPan.y - currentPan.y);
        if (panDelta < 0.5) return;
        if (onViewStateChangeRef.current) {
            onViewStateChangeRef.current(currentZoom, nextPan);
        } else {
            setInternalPan(nextPan);
        }
    }, []);

    const handleTransformChange = useCallback((newZoom: number, newPan: { x: number; y: number }) => {
        if (onViewStateChangeRef.current) {
            onViewStateChangeRef.current(newZoom, newPan);
        } else {
            setInternalZoom(newZoom);
            setInternalPan(newPan);
        }
    }, []);

    const { snapToGrid, setSnapToGrid } = useUiSettings();
    const [showTemplates, setShowTemplates] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [showLibrary, setShowLibrary] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [showBatchTest, setShowBatchTest] = useState(false);
    const [showEquivalents, setShowEquivalents] = useState(false);
    const [showUtilities, setShowUtilities] = useState(false);
    const [showProps, setShowProps] = useState(!compact);
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
    const lastStateCountRef = useRef(data.estados.length);
    const [showCoachMarks, setShowCoachMarks] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(EDITOR_COACH_STORAGE_KEY) !== '1';
    });

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

    const pdaProps = getPdaProps(data);

    const calculateFitTransform = useCallback((states: Estado[]) => {
        if (states.length === 0) return { zoom: 1, pan: { x: 0, y: 0 } };

        const rect = canvasRef.current?.getBoundingClientRect();
        const viewWidth = Math.max(rect?.width || viewport.width || 800, 320);
        const viewHeight = Math.max(rect?.height || viewport.height || 600, 240);

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
        const zoomX = viewWidth / contentWidth;
        const zoomY = viewHeight / contentHeight;
        const nextZoom = Math.max(0.3, Math.min(1.5, Math.min(zoomX, zoomY)));

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        
        const nextPan = {
            x: viewWidth / 2 - centerX * nextZoom,
            y: viewHeight / 2 - centerY * nextZoom
        };

        return { zoom: nextZoom, pan: nextPan };
    }, [viewport.height, viewport.width]);

    const fitToContent = useCallback(() => {
        if (!canvasRef.current || data.estados.length === 0) {
            handleTransformChange(1, { x: 0, y: 0 });
            return;
        }

        const { zoom: nextZoom, pan: nextPan } = calculateFitTransform(data.estados);
        handleTransformChange(nextZoom, nextPan);
    }, [data.estados, calculateFitTransform, handleTransformChange]);

    const lastFitRequestRef = useRef<number | undefined>(undefined);
    useEffect(() => {
        if (fitRequestToken === undefined) return;
        if (lastFitRequestRef.current === fitRequestToken) return;
        lastFitRequestRef.current = fitRequestToken;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                fitToContent();
            });
        });
    }, [fitRequestToken, fitToContent]);

    const normalizeLoadedAutomaton = useCallback((incoming: AutomatoData) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        const viewWidth = rect?.width || viewport.width || 800;
        const viewHeight = rect?.height || viewport.height || 600;
        const { states: optimizedStates, needsReposition } = optimizeLoadedLayout(
            incoming.estados,
            incoming.transicoes,
            viewWidth,
            viewHeight
        );
        return {
            normalized: { ...incoming, estados: optimizedStates } as AutomatoData,
            needsReposition
        };
    }, [viewport.width, viewport.height]);

    const loadAutomatonIntoEditor = useCallback((incoming: AutomatoData, options?: {
        successMessage?: string;
        quiet?: boolean;
        repositionMessage?: string;
    }) => {
        const { normalized, needsReposition } = normalizeLoadedAutomaton(incoming);
        handleChange(normalized);

        // Wait for canvas/layout to settle before fitting.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                fitToContent();
            });
        });

        if (options?.quiet) return;

        if (needsReposition && options?.repositionMessage) {
            addToast(options.repositionMessage, 'info');
            return;
        }

        if (needsReposition) {
            addToast('Autômato carregado e ajustado na tela.', 'success');
            return;
        }

        if (options?.successMessage) {
            addToast(options.successMessage, 'success');
        }
    }, [normalizeLoadedAutomaton, handleChange, fitToContent, addToast]);

    const dismissCoachMarks = useCallback(() => {
        setShowCoachMarks(false);
        if (typeof window !== 'undefined') {
            localStorage.setItem(EDITOR_COACH_STORAGE_KEY, '1');
        }
    }, []);

    useEffect(() => {
        const currentCount = data.estados.length;
        const prevCount = lastStateCountRef.current;
        const shouldOptimize = currentCount > prevCount + 1 || (currentCount > 0 && prevCount === 0);

        if (shouldOptimize) {
            const timeout = setTimeout(() => {
                const currentData = dataRef.current;
                const { normalized, needsReposition } = normalizeLoadedAutomaton(currentData);
                if (needsReposition) {
                    handleChange(normalized);
                    addToast('Layout ajustado automaticamente.', 'info');
                }
                lastStateCountRef.current = currentData.estados.length;
            }, 100);
            return () => clearTimeout(timeout);
        }

        lastStateCountRef.current = currentCount;
    }, [data.estados.length, normalizeLoadedAutomaton, handleChange, addToast]);

    const handleMagicLayout = () => {
        if (!canvasRef.current) return;
        if (data.estados.length === 0) {
            addToast('Adicione estados primeiro.', 'warning');
            return;
        }

        const rect = canvasRef.current.getBoundingClientRect();
        const width = Math.max(rect.width, 400);
        const height = Math.max(rect.height, 300);
        const layouted = computeAutoLayout(data.estados, data.transicoes, width, height);

        const isValid = layouted.every((s) =>
            Number.isFinite(s.x) && Number.isFinite(s.y) && s.x > 0 && s.y > 0 && s.x < width * 2 && s.y < height * 2
        );

        if (!isValid) {
            addToast('Erro no layout, tente novamente.', 'error');
            return;
        }

        handleChange({ ...data, estados: layouted });
        const { zoom: nextZoom, pan: nextPan } = calculateFitTransform(layouted);
        handleTransformChange(nextZoom, nextPan);
        addToast('Layout automatico aplicado.', 'success');
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
        if (data.tipo !== 'AP') return;
        const tokens = splitSymbolTokens(value);
        const nextData: APData = {
            ...data,
            alfabetoPilha: tokens.length === 0 ? undefined : tokens
        };
        handleChange(nextData);
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
        addToast('Autômato limpo.', 'info');
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
                addToast('Acao desfeita.', 'info');
                return;
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                handleRedo();
                addToast('Acao refeita.', 'info');
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
                default:
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
    }, [data, data.alfabeto, data.transicoes, isEditingAlphabet]);

    useEffect(() => {
        if (isEditingStackAlphabet) return;
        const inferred = pdaProps.alfabetoPilha && pdaProps.alfabetoPilha.length > 0
            ? pdaProps.alfabetoPilha
            : [];
        setStackAlphabetInput(inferred.join(', '));
    }, [pdaProps.alfabetoPilha, isEditingStackAlphabet]);

    useEffect(() => {
        if (isEditingStackStart) return;
        setStackStartSymbol(pdaProps.simboloInicialPilha ?? '');
    }, [pdaProps.simboloInicialPilha, isEditingStackStart]);

    useEffect(() => {
        if (data.tipo === 'AP') {
            setShowTable(false);
            setShowBatchTest(false);
        }
    }, [data.tipo]);

    const tools = [
        { id: 'pointer', icon: MousePointer2, label: 'Mover', shortcut: 'V', hint: 'Segure Shift' },
        { id: 'state', icon: Plus, label: 'Estado', shortcut: 'S', hint: 'Clique para criar' },
        { id: 'transition', icon: ArrowUpRight, label: 'Transição', shortcut: 'T', hint: 'Segure Alt' },
        { id: 'delete', icon: Trash2, label: 'Apagar', shortcut: 'D', hint: 'Clique para remover' }
    ];

    const exportData = () => {
        const jsonString = JSON.stringify(data, null, 2);
        downloadFile(jsonString, `automato-${Date.now()}.json`, 'application/json');
        addToast('Autômato exportado como JSON.', 'success');
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target?.result as string);
                if (!imported.estados || !imported.transicoes) {
                    addToast('Arquivo JSON inválido.', 'error');
                    return;
                }

                loadAutomatonIntoEditor(imported as AutomatoData, {
                    successMessage: 'Autômato importado com sucesso.',
                    repositionMessage: 'Autômato importado e reposicionado automaticamente.'
                });
            } catch (err) {
                if (err instanceof SyntaxError) {
                    addToast('Arquivo JSON malformado.', 'error');
                } else {
                    addToast('Erro ao processar arquivo.', 'error');
                }
            } finally {
                e.target.value = '';
            }
        };
        reader.readAsText(file);
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
            openConversionModal({ title: 'Determinizar (AFN → AFD)', steps: result.steps, automaton: result.automaton });
        } catch { addToast('Erro na conversão', 'error'); }
    };
    const handleEliminateEpsilon = () => {
        try {
            const result = eliminateEpsilonTransitions(data);
            openConversionModal({ title: 'Remoção de eps', steps: result.steps, automaton: result.automaton });
        } catch { addToast('Erro na conversão', 'error'); }
    };
    const handleMinimizeDfa = () => {
        try {
            const result = minimizeDfaWithSteps(data);
            if (result.isMinimal && !result.needsCompletion) {
                addToast('AFD já está minimizado', 'info');
                openConversionModal({ title: 'Minimização de AFD', steps: result.steps });
                return;
            }
            if (result.isMinimal && result.needsCompletion) {
                addToast('AFD já é mínimo, mas está incompleto', 'info');
                openConversionModal({ title: 'Minimização de AFD', steps: result.steps, automaton: result.automaton });
                return;
            }
            openConversionModal({ title: 'Minimização de AFD', steps: result.steps, automaton: result.automaton });
        } catch { addToast('Erro na minimização', 'error'); }
    };
    const openConversionModal = (payload: any) => setConversionModal(payload);
    
    const handleMooreToMealy = () => {
        const converted = mooreToMealy(data);
        openConversionModal({ title: 'Moore → Mealy', steps: [{ title: 'Conversão', detail: 'OK' }], automaton: converted });
    };
    const handleMealyToMoore = () => {
        const converted = mealyToMoore(data);
        openConversionModal({ title: 'Mealy → Moore', steps: [{ title: 'Conversão', detail: 'OK' }], automaton: converted });
    };

    const handleGrammarImport = () => {
         const source = grammarImportSource.trim();
        if (!source) {
            setGrammarImportError('Informe a gramática.');
            return;
        }
        if (grammarImportKind === 'regular') {
            const result = grammarImportTarget === 'AFD' ? regularGrammarToDfa(source) : regularGrammarToNfa(source);
            if (!result.automaton) {
                setGrammarImportError(result.error || 'Erro');
                return;
            }
            setGrammarImportWarnings(result.warnings ?? []);
            loadAutomatonIntoEditor(result.automaton, { quiet: true });
            setShowGrammarImport(false);
            addToast('Gramática convertida', 'success');
        } else {
             const result = cfgToPda(source);
            if (!result.automaton) {
                setGrammarImportError(result.error || 'Erro');
                return;
            }
            setGrammarImportWarnings(result.warnings ?? []);
            loadAutomatonIntoEditor(result.automaton, { quiet: true });
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
                        <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-md border border-default">
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
                        <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-md border border-default">
                            <ToolbarButton icon={Undo2} label="Desfazer" shortcut="Ctrl+Z" disabled={!canUndo} onClick={handleUndo} side="right" />
                            <ToolbarButton icon={Redo2} label="Refazer" shortcut="Ctrl+Y" disabled={!canRedo} onClick={handleRedo} side="right" />
                        </div>

                        {/* Actions */}
                        <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-md border border-default">
                             <ToolbarButton icon={LayoutTemplate} label="Templates" onClick={() => setShowTemplates(true)} side="right" />
                             <ToolbarButton icon={Folder} label="Biblioteca" onClick={() => setShowLibrary(true)} side="right" />
                        </div>
                         
                         {/* Utilities Toggle */}
                        <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-md border border-default">
                            <ToolbarButton icon={MoreVertical} label={showUtilities ? 'Menos' : 'Mais'} active={showUtilities} onClick={() => setShowUtilities(s => !s)} side="right" />
                        </div>

                        {/* Suggestions */}
                        <div className="relative pointer-events-auto">
                            <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-md border border-default">
                                <ToolbarButton
                                    icon={Lightbulb}
                                    label="Sugestões"
                                    active={showCoachMarks}
                                    onClick={() => setShowCoachMarks((value) => !value)}
                                    side="right"
                                />
                            </div>
                            {showCoachMarks && (
                                <div className="absolute left-full top-0 ml-3 w-80 glass-panel rounded-2xl border border-default p-3 shadow-apple-lg z-40">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-primary">Sugestões rápidas</p>
                                            <ul className="mt-2 space-y-1.5 text-xs text-secondary leading-relaxed">
                                                <li>Duplo clique no canvas para criar um estado.</li>
                                                <li>Use `T` para transição e clique em origem e destino.</li>
                                                <li>Use Shift para mover rápido e Alt para transição temporária.</li>
                                                <li>Clique em um elemento para editar sem abrir menus extras.</li>
                                            </ul>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={dismissCoachMarks}
                                            className="rounded-lg p-1 text-secondary hover:text-primary hover:bg-surface-hover transition-colors"
                                            aria-label="Fechar sugestões"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Expanded Utilities */}
                        {showUtilities && (
                            <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-md border border-default animate-slide-right-fade">
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
                    <div className="glass-panel p-1 rounded-2xl shadow-apple-md border border-default w-full animate-fade-in-up transition-all">
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
                                    <label className="text-xs font-bold text-muted uppercase">Tipo</label>
                                    <select
                                        value={data.tipo}
                                        onChange={(e) => {
                                            const nextTipo = e.target.value as AutomatoData['tipo'];
                                            if (nextTipo === 'AP') {
                                                const apData: APData = {
                                                    tipo: 'AP',
                                                    estados: data.estados,
                                                    transicoes: data.transicoes,
                                                    alfabeto: data.alfabeto,
                                                    descricao: data.descricao,
                                                    alfabetoPilha: pdaProps.alfabetoPilha,
                                                    simboloInicialPilha: pdaProps.simboloInicialPilha ?? 'Z',
                                                    pdaAcceptance: pdaProps.pdaAcceptance ?? 'final',
                                                };
                                                handleChange(apData);
                                            } else {
                                                const baseData = {
                                                    tipo: nextTipo,
                                                    estados: data.estados,
                                                    transicoes: data.transicoes,
                                                    alfabeto: data.alfabeto,
                                                    descricao: data.descricao,
                                                } as AutomatoData;
                                                handleChange(baseData);
                                            }
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
                                        <label className="text-xs font-bold text-muted uppercase">Alfabeto</label>
                                        <button onClick={() => { setIsEditingAlphabet(false); const inferred = getAlphabet({ ...data, alfabeto: undefined }); setAlphabetInput(inferred.join(', ')); handleChange({ ...data, alfabeto: undefined }); }}
                                            className="text-xs text-ios-blue hover:underline">Auto</button>
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
                                            <label className="text-xs font-bold text-muted uppercase">Alfabeto Pilha</label>
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
                                            <label className="text-xs font-bold text-muted uppercase">Início Pilha</label>
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
                    <div className="glass-panel p-2 rounded-2xl flex flex-wrap gap-2 shadow-apple-md border border-default w-full animate-fade-in-up items-center justify-between" style={{ animationDelay: '0.1s' }}>
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
                             <ToolbarButton
                                icon={Sparkles}
                                label="Equivalentes"
                                active={showEquivalents}
                                onClick={() => setShowEquivalents(s => !s)}
                                side="left"
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

                    {/* Equivalents Panel (Embedded) */}
                    {showEquivalents && (
                        <div className="w-full animate-fade-in-up">
                            <EquivalentsPanel
                                data={data}
                                onLoadEquivalent={(equivalent) => {
                                    loadAutomatonIntoEditor(equivalent, {
                                        successMessage: 'Autômato equivalente carregado.'
                                    });
                                }}
                            />
                        </div>
                    )}

                     {/* Converters Panel (Only if Utility shown) */}
                    {showUtilities && !readOnly && (data.tipo === 'AFN' || data.tipo === 'AFD' || data.tipo === 'Moore' || data.tipo === 'Mealy') && (
                         <div className="glass-panel p-3 rounded-2xl shadow-apple-md border border-default w-full animate-fade-in-up flex flex-col gap-2">
                            <div className="text-xs font-bold text-muted uppercase px-1">Conversores</div>
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
                {data.estados.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
                        <div className="w-full max-w-md glass-panel rounded-2xl border border-default p-5 text-center shadow-apple-md">
                            <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-surface-muted border border-default flex items-center justify-center text-ios-blue">
                                <Plus size={28} />
                            </div>
                            <p className="text-sm font-bold text-primary">Canvas pronto para construir</p>
                            <p className="mt-1 text-xs text-secondary">Pressione `S` e clique no canvas para criar estados.</p>
                        </div>
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
                    <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-4 shadow-apple-lg border border-default pointer-events-auto">
                        {/* Info Stats */}
                        <div className="flex items-center gap-3 ui-kicker-xs text-secondary">
                            <span className="badge badge-info">{data.tipo}</span>
                            <span className="w-px h-3 bg-border"></span>
                            <span>{data.estados.length} Est.</span>
                            <span>{data.transicoes.length} Trans.</span>
                        </div>

                        {/* Zoom Controls */}
                        <div className="w-px h-4 bg-border"></div>
                        <div className="flex items-center gap-1">
                            <button onClick={handleZoomOut} className="p-1.5 hover:bg-surface-hover rounded-lg text-secondary transition-colors"><ZoomOut size={14} /></button>
                            <span className="text-xs font-mono font-bold w-10 text-center text-primary">{Math.round(zoom * 100)}%</span>
                            <button onClick={handleZoomIn} className="p-1.5 hover:bg-surface-hover rounded-lg text-secondary transition-colors"><ZoomIn size={14} /></button>
                            <button onClick={handleZoomReset} className="p-1.5 hover:bg-surface-hover rounded-lg text-secondary transition-colors ml-1" title="Ajustar ao conteúdo"><RotateCcw size={14} /></button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showDeleteConfirm && (
                <div className="overlay-backdrop z-[120] animate-fade-in">
                    <div className="overlay-surface p-6 max-w-sm w-full animate-scale-in bg-app">
                        <div className="flex flex-col items-center text-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-status-danger-soft flex items-center justify-center text-status-danger">
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

            <TemplatesGallery
                isOpen={showTemplates}
                onClose={() => setShowTemplates(false)}
                onSelect={(template) => {
                    loadAutomatonIntoEditor(template, { successMessage: 'Template carregado.' });
                }}
            />
            <TransitionTableModal isOpen={showTable} onClose={() => setShowTable(false)} automaton={data} onChange={handleChange} />
            <SavedAutomataModal
                isOpen={showLibrary}
                onClose={() => setShowLibrary(false)}
                current={data}
                onLoad={(loaded) => {
                    loadAutomatonIntoEditor(loaded, { successMessage: 'Autômato carregado.' });
                }}
            />
            <SavedAutomataModal isOpen={showAuxLibrary} onClose={() => setShowAuxLibrary(false)} current={auxAutomaton ?? data} onLoad={(l) => { setAuxAutomaton(l); addToast('B carregado!', 'success'); }} />
            
            {/* Conversion Modal */}
            <Modal isOpen={!!conversionModal} onClose={() => setConversionModal(null)} title={conversionModal?.title || 'Conversão'} className="max-w-3xl">
                <div className="space-y-6">
                     {conversionModal?.warnings && conversionModal.warnings.length > 0 && (
                        <div className="p-4 rounded-2xl bg-status-warning-soft border border-status-warning text-status-warning text-sm">
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
                            <button
                                onClick={() => {
                                    loadAutomatonIntoEditor(conversionModal.automaton as AutomatoData, {
                                        successMessage: 'Conversão aplicada.'
                                    });
                                    setConversionModal(null);
                                }}
                                className="px-4 py-2 rounded-xl bg-ios-blue text-white text-sm font-bold hover:bg-blue-600 transition-colors"
                            >
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



