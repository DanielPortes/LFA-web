import React, { lazy, useState, useRef, useEffect, useCallback } from 'react';
import type { AutomatoData, Tool, APData } from '../../types';
import { AutomatonCanvas } from './AutomatonCanvas';
import { MousePointer2, Plus, ArrowUpRight, Trash2, SlidersHorizontal, Wrench, X, Undo2, Redo2 } from 'lucide-react';
import { useHistory } from '../../hooks/useHistory';
import { useToast } from '../ui';
import { useUiSettings } from '../../hooks/useUiSettings';
import { Minimap } from '../ui/Minimap';
import { getAlphabet, validateAutomaton } from '../../utils/conversions';
import { splitSymbolTokens } from '../../utils/symbols';
import { computeAutoLayout } from '../../utils/layout';
import { EditorBottomBar } from './editor/EditorBottomBar';
import { EditorDiagnosticsPanel } from './editor/EditorDiagnosticsPanel';
import { EditorEmptyState } from './editor/EditorEmptyState';
import { EditorModalStack } from './editor/EditorModalStack';
import { EditorPrimaryToolbar, type EditorToolDefinition } from './editor/EditorPrimaryToolbar';
import { EditorShell } from './editor/EditorShell';
import { getEditorPdaProps, normalizeAutomatonForType } from './editor/editorUtils';
import { useEditorConversions } from './editor/useEditorConversions';
import { useEditorImportExport } from './editor/useEditorImportExport';
import { useEditorViewport } from './editor/useEditorViewport';
import { isEditableTarget, useWindowKeyboard } from '../../features/shortcuts';
import { ToolbarButton } from '../ui/ToolbarButton';

const LazyTemplatesGallery = lazy(async () => {
    const module = await import('../ui/TemplatesGallery');
    return { default: module.TemplatesGallery };
});

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
    compactVariant?: 'workspace' | 'modal' | 'solver';
    fitRequestToken?: number;
    sessionKey?: number;
    hideCompactInspectorLauncher?: boolean;
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
    compactVariant = 'modal',
    fitRequestToken,
    hideCompactInspectorLauncher = false,
}) => {
    const [localTool, setTool] = useState<Tool>('pointer');
    const tool = localTool;
    const canvasRef = useRef<SVGSVGElement>(null);
    const syncSourceRef = useRef<'external' | 'internal' | null>(null);

    const { snapToGrid, setSnapToGrid } = useUiSettings();
    const { addToast } = useToast();

    const {
        zoom,
        pan,
        viewport,
        handleZoomChange,
        handlePanChange,
        handleTransformChange,
        fitToContent,
    } = useEditorViewport({
        canvasRef,
        states: data.estados,
        viewState,
        onViewStateChange,
        fitRequestToken,
    });

    const [showTemplates, setShowTemplates] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [showLibrary, setShowLibrary] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [showBatchTest, setShowBatchTest] = useState(false);
    const [showEquivalents, setShowEquivalents] = useState(false);
    const [showUtilities, setShowUtilities] = useState(false);
    const [showProps, setShowProps] = useState(!compact);
    const [showMinimap] = useState(true);
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
    const [showCompactTools, setShowCompactTools] = useState(false);
    const [showCompactInspector, setShowCompactInspector] = useState(false);
    const isWorkspaceCompact = compact && (compactVariant === 'workspace' || compactVariant === 'solver');
    const isSolverCompact = compact && compactVariant === 'solver';

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

    const pdaProps = getEditorPdaProps(data);

    const {
        fileInputRef,
        normalizeLoadedAutomaton,
        loadAutomatonIntoEditor,
        exportData,
        handleImport,
        handleShare,
        handleExportSVG,
        handleExportPNG,
    } = useEditorImportExport({
        data,
        viewport,
        canvasRef,
        onLoadAutomaton: handleChange,
        fitToContent,
        addToast,
    });

    const {
        conversionModal,
        setConversionModal,
        showGrammarImport,
        setShowGrammarImport,
        grammarImportKind,
        setGrammarImportKind,
        grammarImportTarget,
        setGrammarImportTarget,
        grammarImportSource,
        setGrammarImportSource,
        grammarImportError,
        setGrammarImportError,
        grammarImportWarnings,
        setGrammarImportWarnings,
        handleConvertToDFA,
        handleEliminateEpsilon,
        handleMinimizeDfa,
        handleMooreToMealy,
        handleMealyToMoore,
        handleGrammarImport,
    } = useEditorConversions({
        data,
        addToast,
        loadAutomatonIntoEditor,
    });

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
    }, [addToast, data.estados.length, handleChange, normalizeLoadedAutomaton]);

    const handleMagicLayout = useCallback(() => {
        if (!canvasRef.current) return;
        if (data.estados.length === 0) {
            addToast('Adicione estados primeiro.', 'warning');
            return;
        }

        const rect = canvasRef.current.getBoundingClientRect();
        const width = Math.max(rect.width, 400);
        const height = Math.max(rect.height, 300);
        const layouted = computeAutoLayout(data.estados, data.transicoes, width, height);

        const isValid = layouted.every((state) =>
            Number.isFinite(state.x)
            && Number.isFinite(state.y)
            && state.x > 0
            && state.y > 0
            && state.x < width * 2
            && state.y < height * 2
        );

        if (!isValid) {
            addToast('Erro no layout, tente novamente.', 'error');
            return;
        }

        handleChange({ ...data, estados: layouted });
        fitToContent();
        addToast('Layout automático aplicado.', 'success');
    }, [addToast, data, fitToContent, handleChange]);

    const commitAlphabet = useCallback((value: string) => {
        setIsEditingAlphabet(false);
        const tokens = splitSymbolTokens(value);
        if (tokens.length === 0) {
            handleChange({ ...data, alfabeto: undefined });
            return;
        }

        handleChange({ ...data, alfabeto: tokens });
    }, [data, handleChange]);

    const commitStackAlphabet = useCallback((value: string) => {
        setIsEditingStackAlphabet(false);
        if (data.tipo !== 'AP') return;

        const tokens = splitSymbolTokens(value);
        const nextData: APData = {
            ...data,
            alfabetoPilha: tokens.length === 0 ? undefined : tokens
        };

        handleChange(nextData);
    }, [data, handleChange]);

    const commitStackStart = useCallback((value: string) => {
        setIsEditingStackStart(false);
        handleChange({ ...data, simboloInicialPilha: value.trim() || undefined } as AutomatoData);
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

    const handleSelectTool = useCallback((nextTool: Tool) => {
        setTool(nextTool);
        if (nextTool === 'delete' && tool === 'delete' && data.estados.length > 0) {
            setShowDeleteConfirm(true);
        }
    }, [data.estados.length, tool]);

    const handleTypeChange = useCallback((nextTipo: AutomatoData['tipo']) => {
        handleChange(normalizeAutomatonForType(data, nextTipo, pdaProps));
    }, [data, handleChange, pdaProps]);

    const handleAutoAlphabet = useCallback(() => {
        setIsEditingAlphabet(false);
        const inferred = getAlphabet({ ...data, alfabeto: undefined });
        setAlphabetInput(inferred.join(', '));
        handleChange({ ...data, alfabeto: undefined });
    }, [data, handleChange]);

    const handleToggleBatchTest = useCallback(() => {
        if (data.tipo === 'AP') {
            addToast('Indisponível para AP', 'warning');
            return;
        }

        setShowBatchTest((current) => !current);
    }, [addToast, data.tipo]);

    const handleToggleTable = useCallback(() => {
        if (data.tipo === 'AP') {
            addToast('Indisponível para AP', 'warning');
            return;
        }

        setShowTable((current) => !current);
    }, [addToast, data.tipo]);

    const openGrammarImport = useCallback(() => {
        setGrammarImportError(null);
        setGrammarImportWarnings([]);
        if (!grammarImportSource.trim()) {
            setGrammarImportSource(grammarImportKind === 'regular' ? 'S -> aA | b' : 'S -> a S b | eps');
        }
        setShowGrammarImport(true);
    }, [
        grammarImportKind,
        grammarImportSource,
        setGrammarImportError,
        setGrammarImportSource,
        setGrammarImportWarnings,
        setShowGrammarImport
    ]);

    useWindowKeyboard({
        enabled: !readOnly,
        capture: true,
        onKeyDown: (event) => {
            if (event.key === 'Shift' && !modifierHeld && tool !== 'pointer') {
                previousToolRef.current = tool;
                setModifierHeld('shift');
                setTool('pointer');
                return;
            }

            if (event.key === 'Alt' && !modifierHeld && tool !== 'transition') {
                event.preventDefault();
                previousToolRef.current = tool;
                setModifierHeld('alt');
                setTool('transition');
                return;
            }

            if (isEditableTarget(event.target)) return;

            if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
                event.preventDefault();
                handleUndo();
                addToast('Ação desfeita.', 'info');
                return;
            }

            if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
                event.preventDefault();
                handleRedo();
                addToast('Ação refeita.', 'info');
                return;
            }

            switch (event.key.toLowerCase()) {
                case 'v':
                    setTool('pointer');
                    break;
                case 's':
                    setTool('state');
                    break;
                case 't':
                    setTool('transition');
                    break;
                case 'd':
                    setTool('delete');
                    break;
                case 'g':
                    setSnapToGrid(!snapToGrid);
                    break;
                case 'escape':
                    setTool('pointer');
                    setShowDeleteConfirm(false);
                    break;
                case 'delete':
                case 'backspace':
                    if (tool === 'delete' && data.estados.length > 0) {
                        event.preventDefault();
                        setShowDeleteConfirm(true);
                    }
                    break;
                default:
                    break;
            }
        },
        onKeyUp: (event) => {
            if (event.key === 'Shift' && modifierHeld === 'shift') {
                setModifierHeld(null);
                setTool(previousToolRef.current);
            }
            if (event.key === 'Alt' && modifierHeld === 'alt') {
                setModifierHeld(null);
                setTool(previousToolRef.current);
            }
        }
    });

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

    const tools: EditorToolDefinition[] = [
        { id: 'pointer', icon: MousePointer2, label: 'Mover', shortcut: 'V', hint: 'Segure Shift' },
        { id: 'state', icon: Plus, label: 'Estado', shortcut: 'S', hint: 'Clique para criar' },
        { id: 'transition', icon: ArrowUpRight, label: 'Transição', shortcut: 'T', hint: 'Segure Alt' },
        { id: 'delete', icon: Trash2, label: 'Apagar', shortcut: 'D', hint: 'Clique para remover' }
    ];

    const handleZoomIn = useCallback(() => handleZoomChange((current) => Math.min(current + 0.1, 5)), [handleZoomChange]);
    const handleZoomOut = useCallback(() => handleZoomChange((current) => Math.max(current - 0.1, 0.1)), [handleZoomChange]);
    const handleZoomReset = useCallback(() => fitToContent(), [fitToContent]);

    const validationIssues = validateAutomaton(data);
    const hasErrors = validationIssues.some((issue) => issue.type === 'error');
    const warningCount = validationIssues.length;
    const compactLauncherClass =
        'glass-panel inline-flex h-11 items-center gap-2 rounded-2xl border border-default bg-surface-1/90 px-3 text-xs font-black text-secondary shadow-apple-md transition-all hover:text-primary hover:bg-surface-1';

    const fileInputElement = (
        <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            aria-label="Importar autômato em JSON"
        />
    );

    const primaryToolbar = (
        <EditorPrimaryToolbar
            readOnly={readOnly}
            tools={tools}
            activeTool={tool}
            modifierHeld={modifierHeld}
            canUndo={canUndo}
            canRedo={canRedo}
            showUtilities={showUtilities}
            showCoachMarks={showCoachMarks}
            onSelectTool={handleSelectTool}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onOpenTemplates={() => setShowTemplates(true)}
            onOpenLibrary={() => setShowLibrary(true)}
            onToggleUtilities={() => setShowUtilities((current) => !current)}
            onToggleCoachMarks={() => setShowCoachMarks((current) => !current)}
            onDismissCoachMarks={dismissCoachMarks}
            onTriggerImport={() => fileInputRef.current?.click()}
            onOpenGrammarImport={openGrammarImport}
            onExportJson={exportData}
            onShare={handleShare}
            onExportPng={handleExportPNG}
            onExportSvg={handleExportSVG}
        />
    );

    const solverToolbar = (
        <div className="glass-panel rounded-2xl border border-default bg-surface-1/95 p-2 shadow-apple-md">
            <div className="flex flex-col gap-1">
                {tools.map((toolItem) => (
                    <ToolbarButton
                        key={toolItem.id}
                        icon={toolItem.icon}
                        label={toolItem.label}
                        shortcut={toolItem.shortcut}
                        hint={toolItem.hint}
                        active={tool === toolItem.id}
                        onClick={() => handleSelectTool(toolItem.id)}
                        className={`${modifierHeld === 'shift' && toolItem.id === 'pointer' ? 'ring-2 ring-ios-blue/50' : ''} ${modifierHeld === 'alt' && toolItem.id === 'transition' ? 'ring-2 ring-ios-blue/50' : ''}`}
                        side="right"
                    />
                ))}
            </div>

            <div className="my-2 h-px bg-border/70" />

            <div className="flex flex-col gap-1">
                <ToolbarButton icon={Undo2} label="Desfazer" shortcut="Ctrl+Z" disabled={!canUndo} onClick={handleUndo} side="right" />
                <ToolbarButton icon={Redo2} label="Refazer" shortcut="Ctrl+Y" disabled={!canRedo} onClick={handleRedo} side="right" />
            </div>
        </div>
    );

    const diagnosticsPanel = (
        <EditorDiagnosticsPanel
            data={data}
            pdaProps={pdaProps}
            readOnly={readOnly}
            snapToGrid={snapToGrid}
            showUtilities={showUtilities}
            showProps={showProps}
            showValidation={showValidation}
            showBatchTest={showBatchTest}
            showTable={showTable}
            showEquivalents={showEquivalents}
            validationIssues={validationIssues}
            hasErrors={hasErrors}
            warningCount={warningCount}
            alphabetInput={alphabetInput}
            stackAlphabetInput={stackAlphabetInput}
            stackStartSymbol={stackStartSymbol}
            onToggleProps={() => setShowProps((current) => !current)}
            onTypeChange={handleTypeChange}
            onAutoAlphabet={handleAutoAlphabet}
            onAlphabetInputChange={setAlphabetInput}
            onAlphabetFocus={() => setIsEditingAlphabet(true)}
            onAlphabetCommit={commitAlphabet}
            onStackAlphabetInputChange={setStackAlphabetInput}
            onStackAlphabetFocus={() => setIsEditingStackAlphabet(true)}
            onStackAlphabetCommit={commitStackAlphabet}
            onStackStartChange={setStackStartSymbol}
            onStackStartFocus={() => setIsEditingStackStart(true)}
            onStackStartCommit={commitStackStart}
            onToggleSnapToGrid={() => setSnapToGrid(!snapToGrid)}
            onMagicLayout={handleMagicLayout}
            onToggleValidation={() => setShowValidation((current) => !current)}
            onToggleBatchTest={handleToggleBatchTest}
            onToggleTable={handleToggleTable}
            onToggleEquivalents={() => setShowEquivalents((current) => !current)}
            onFocusState={(stateId) => setFocusStateId(stateId)}
            onLoadEquivalent={(equivalent) => {
                loadAutomatonIntoEditor(equivalent, {
                    successMessage: 'Autômato equivalente carregado.'
                });
            }}
            onConvertToDFA={handleConvertToDFA}
            onEliminateEpsilon={handleEliminateEpsilon}
            onMinimizeDfa={handleMinimizeDfa}
            onMooreToMealy={handleMooreToMealy}
            onMealyToMoore={handleMealyToMoore}
        />
    );

    const compactInspector = showCompactInspector ? (
        <div className={`pointer-events-auto overflow-y-auto custom-scrollbar ${isWorkspaceCompact ? 'w-[min(22rem,calc(100vw-2rem))] max-h-[min(70vh,calc(100%-6rem))]' : 'w-[20rem] max-w-[min(20rem,calc(100vw-2rem))] max-h-[calc(100%-3.5rem)] pr-1'}`}>
            {diagnosticsPanel}
        </div>
    ) : null;

    const compactOverlays = compact ? (
        <div className="pointer-events-none absolute inset-0 z-20">
            {fileInputElement}

            {isWorkspaceCompact ? (
                <>
                    {!readOnly && (
                        <>
                            <div className="pointer-events-auto absolute left-4 top-24 hidden md:block">
                                {isSolverCompact ? solverToolbar : primaryToolbar}
                            </div>

                            <div className="pointer-events-auto absolute left-4 top-24 md:hidden">
                                <button
                                    type="button"
                                    onClick={() => setShowCompactTools((current) => !current)}
                                    className={compactLauncherClass}
                                    aria-label={showCompactTools ? 'Fechar ferramentas do editor' : 'Abrir ferramentas do editor'}
                                    aria-expanded={showCompactTools}
                                >
                                    {showCompactTools ? <X size={16} /> : <Wrench size={16} />}
                                    <span>{showCompactTools ? 'Fechar' : 'Ferramentas'}</span>
                                </button>
                            </div>

                            {showCompactTools && (
                                <div className="pointer-events-auto absolute left-4 top-[7.25rem] max-h-[calc(100%-8rem)] overflow-y-auto overflow-x-visible custom-scrollbar md:hidden">
                                    {isSolverCompact ? solverToolbar : primaryToolbar}
                                </div>
                            )}
                        </>
                    )}

                    {!hideCompactInspectorLauncher && (
                        <div className="pointer-events-auto absolute right-4 top-4 flex flex-col items-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowCompactInspector((current) => !current)}
                                className={compactLauncherClass}
                                aria-label={showCompactInspector ? 'Fechar inspetor do editor' : 'Abrir inspetor do editor'}
                                aria-expanded={showCompactInspector}
                            >
                                {showCompactInspector ? <X size={16} /> : <SlidersHorizontal size={16} />}
                                <span>{showCompactInspector ? 'Fechar painel' : 'Inspetor'}</span>
                            </button>

                            {compactInspector}
                        </div>
                    )}
                </>
            ) : (
                <div className="absolute inset-x-2 top-2 flex items-start justify-between gap-3">
                    <div className="pointer-events-auto flex flex-col items-start gap-2">
                        {!readOnly && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setShowCompactTools((current) => !current)}
                                    className={compactLauncherClass}
                                    aria-label={showCompactTools ? 'Fechar ferramentas do editor' : 'Abrir ferramentas do editor'}
                                    aria-expanded={showCompactTools}
                                >
                                    {showCompactTools ? <X size={16} /> : <Wrench size={16} />}
                                    <span>{showCompactTools ? 'Fechar' : 'Ferramentas'}</span>
                                </button>

                                {showCompactTools && (
                                    <div className="max-h-[calc(100%-3.5rem)] overflow-y-auto overflow-x-visible custom-scrollbar pr-1">
                                        {primaryToolbar}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="pointer-events-auto flex flex-col items-end gap-2">
                        <button
                            type="button"
                            onClick={() => setShowCompactInspector((current) => !current)}
                            className={compactLauncherClass}
                            aria-label={showCompactInspector ? 'Fechar painel do editor' : 'Abrir painel do editor'}
                            aria-expanded={showCompactInspector}
                        >
                            {showCompactInspector ? <X size={16} /> : <SlidersHorizontal size={16} />}
                            <span>{showCompactInspector ? 'Fechar painel' : 'Painel'}</span>
                        </button>

                        {compactInspector}
                    </div>
                </div>
            )}
        </div>
    ) : fileInputElement;

    return (
        <EditorShell
            compact={compact}
            leftToolbar={compact ? undefined : <>{fileInputElement}{primaryToolbar}</>}
            rightPanel={compact ? undefined : diagnosticsPanel}
            emptyState={data.estados.length === 0 ? <EditorEmptyState /> : undefined}
            canvas={(
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
            )}
            minimap={showMinimap && data.estados.length > 6 ? (
                <div className={`absolute z-10 opacity-70 transition-opacity hover:z-30 hover:opacity-100 ${isWorkspaceCompact ? 'bottom-28 left-4 lg:bottom-32' : compact ? 'bottom-4 left-4' : 'bottom-16 left-16 sm:left-20'}`}>
                    <Minimap
                        data={data}
                        viewport={viewport}
                        zoom={zoom}
                        pan={pan}
                        onPanChange={handlePanChange}
                        activeStates={activeStates}
                    />
                </div>
            ) : undefined}
            bottomBar={(
                <EditorBottomBar
                    compact={compact}
                    data={data}
                    zoom={zoom}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onZoomReset={handleZoomReset}
                />
            )}
            overlays={compact ? compactOverlays : undefined}
            modals={(
                <EditorModalStack
                    lazyTemplatesGallery={LazyTemplatesGallery}
                    data={data}
                    showDeleteConfirm={showDeleteConfirm}
                    showTemplates={showTemplates}
                    showLibrary={showLibrary}
                    showGrammarImport={showGrammarImport}
                    showTableModal={showTable}
                    conversionModal={conversionModal}
                    grammarImportKind={grammarImportKind}
                    grammarImportTarget={grammarImportTarget}
                    grammarImportSource={grammarImportSource}
                    grammarImportError={grammarImportError}
                    grammarImportWarnings={grammarImportWarnings}
                    onCloseDeleteConfirm={() => setShowDeleteConfirm(false)}
                    onConfirmDeleteAll={handleDeleteAll}
                    onCloseTemplates={() => setShowTemplates(false)}
                    onSelectTemplate={(template) => {
                        loadAutomatonIntoEditor(template, { successMessage: 'Template carregado.' });
                    }}
                    onCloseTable={() => setShowTable(false)}
                    onChangeTableAutomaton={handleChange}
                    onCloseLibrary={() => setShowLibrary(false)}
                    onLoadSavedAutomaton={(loaded) => {
                        loadAutomatonIntoEditor(loaded, { successMessage: 'Autômato carregado.' });
                    }}
                    onCloseConversionModal={() => setConversionModal(null)}
                    onApplyConversionAutomaton={(automaton) => {
                        loadAutomatonIntoEditor(automaton, { successMessage: 'Conversão aplicada.' });
                        setConversionModal(null);
                    }}
                    onCloseGrammarImport={() => setShowGrammarImport(false)}
                    onGrammarImportKindChange={setGrammarImportKind}
                    onGrammarImportTargetChange={setGrammarImportTarget}
                    onGrammarImportSourceChange={(value) => {
                        setGrammarImportSource(value);
                        if (grammarImportError) setGrammarImportError(null);
                    }}
                    onSubmitGrammarImport={handleGrammarImport}
                />
            )}
        />
    );
};
