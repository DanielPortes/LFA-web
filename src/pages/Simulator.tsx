import React, { useState, useEffect, useCallback, useRef, useId, useMemo } from 'react';
import { AutomatonEditor } from '../components/automaton';
import type { AutomatoData } from '../types';
import { XCircle, X, Keyboard, History, ListOrdered, Info, Sparkles, RotateCcw, LayoutList } from 'lucide-react';
import { regexToNfa } from '../utils/conversions';
import {
    StackVisualizer,
    TuringTape,
    useToast,
    SimulationControls,
    InputTape
} from '../components/ui';
import { useUiSettings } from '../hooks/useUiSettings';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { SIMULATOR_STORAGE_KEY } from '../constants/storage';
import { useAutomatonSimulation } from '../hooks/useAutomatonSimulation';
import { useGrammarSimulation } from '../hooks/useGrammarSimulation';
import { GrammarWorkspace } from '../features/simulator';
import type { SimulatorLayout } from '../features/simulator/types';

interface SimulatorProps {
    initialData?: AutomatoData;
    onInitialDataConsumed?: () => void;
};

const isEditableTarget = (target: EventTarget | null): boolean => (
    target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement
    || (target instanceof HTMLElement && target.isContentEditable)
);

const isInsideAutomatonEditor = (target: EventTarget | null): boolean => (
    target instanceof HTMLElement && !!target.closest('[data-automaton-editor="true"]')
);

const emptyAutomaton: AutomatoData = {
    tipo: 'AFD',
    estados: [],
    transicoes: [],
    descricao: 'Novo autômato'
};

export const SimulatorPage: React.FC<SimulatorProps> = ({
    initialData,
    onInitialDataConsumed
}) => {
    // Ensure data is never null, even if initialData is undefined
    const [data, setData] = useLocalStorageState<AutomatoData>(
        SIMULATOR_STORAGE_KEY,
        initialData ?? emptyAutomaton,
        { readOnInit: !initialData }
    );
    const [simulatorMode, setSimulatorMode] = useState<'automaton' | 'grammar'>('automaton');
    const [isDesktopViewport, setIsDesktopViewport] = useState(() => {
        if (typeof window === 'undefined') return true;
        return window.matchMedia('(min-width: 1024px)').matches;
    });
    
    // Keep view state ephemeral so each simulator session starts centered and predictable.
    const [viewState, setViewState] = useState({ zoom: 1, pan: { x: 0, y: 0 } });
    const [fitRequestToken, setFitRequestToken] = useState(0);

    const handleViewStateChange = useCallback((zoom: number, pan: { x: number; y: number }) => {
        setViewState((prev: { zoom: number; pan: { x: number; y: number } }) => {
            const zoomDelta = Math.abs(prev.zoom - zoom);
            const panDelta = Math.abs(prev.pan.x - pan.x) + Math.abs(prev.pan.y - pan.y);
            if (zoomDelta < 0.001 && panDelta < 0.5) return prev;
            return { zoom, pan };
        });
    }, [setViewState]);

    const requestCanvasCenter = useCallback(() => {
        setViewState({ zoom: 1, pan: { x: 0, y: 0 } });
        setFitRequestToken((value) => value + 1);
    }, []);

    // Safety check: if data somehow becomes null (e.g. from parent update), use empty
    const safeData = data || emptyAutomaton;

    const [inputString, setInputString] = useState('');
    const [regexImport, setRegexImport] = useState('');
    const [regexImportError, setRegexImportError] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const regexImportErrorId = useId();

    const { addToast } = useToast();
    const {
        simulatorLayout,
        inputTokenization,
        inputSeparator,
        setInputTokenization,
        setInputSeparator
    } = useUiSettings();
    const tokenizationConfig = useMemo(() => ({
        mode: inputTokenization,
        separator: inputSeparator
    }), [inputTokenization, inputSeparator]);

    // Automaton Simulation Hook
    const {
        simulationState,
        isPlaying,
        speed,
        history,
        activeTransitions,
        inputTokens,
        alphabet,
        invalidSymbols,
        hasInvalidInput,
        isPda,
        isTuring,
        isAll,
        isMoore,
        isMealy,
        stateLabelMap,
        setSpeed,
        setIsPlaying,
        resetSimulation,
        step,
        stepBack
    } = useAutomatonSimulation(
        safeData,
        inputString,
        tokenizationConfig
    );

    // Grammar Simulation Hook
    const {
        grammarSource,
        grammarInput,
        grammarResult,
        grammarWarnings,
        grammarLimits,
        grammarStrategy,
        grammarTransform,
        setGrammarSource,
        setGrammarInput,
        setGrammarLimits,
        setGrammarStrategy,
        runDerivation,
        runTransform,
        clearTransform,
        clearResult
    } = useGrammarSimulation(tokenizationConfig);

    useEffect(() => {
        if (!initialData) return;
        setData(typeof structuredClone === 'function'
            ? structuredClone(initialData)
            : JSON.parse(JSON.stringify(initialData)));
        setSimulatorMode('automaton');
        requestAnimationFrame(() => requestCanvasCenter());
        onInitialDataConsumed?.();
    }, [initialData, onInitialDataConsumed, requestCanvasCenter, setData]);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        const media = window.matchMedia('(min-width: 1024px)');
        const onChange = (event: MediaQueryListEvent) => setIsDesktopViewport(event.matches);
        setIsDesktopViewport(media.matches);
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        if (simulatorMode !== 'automaton') return;
        requestAnimationFrame(() => requestCanvasCenter());
    }, [simulatorMode, requestCanvasCenter]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputString(e.target.value);
    };
    
    useEffect(() => {
        if (simulatorMode === 'automaton') {
             resetSimulation(false);
        }
    }, [inputTokens, simulatorMode, resetSimulation]);

    const clearInput = () => {
        setInputString('');
        resetSimulation(true);
        inputRef.current?.focus();
    };

    const handleRegexImport = useCallback(() => {
        const trimmed = regexImport.trim();
        if (!trimmed) return;
        try {
            const nfa = regexToNfa(trimmed);
            setData(nfa);
            setSimulatorMode('automaton');
            setRegexImportError(null);
            requestAnimationFrame(() => requestCanvasCenter());
            addToast('Regex convertida para AFN', 'success');
        } catch {
            setRegexImportError('Regex inválida');
        }
    }, [regexImport, addToast, requestCanvasCenter, setData]);

    // Keyboard shortcuts
    useEffect(() => {
        const canStartSimulation = !hasInvalidInput && (inputTokens.length === 0 || alphabet.length > 0 || isTuring || isAll);
        const handleKeyDown = (e: KeyboardEvent) => {
            if (simulatorMode !== 'automaton') return;
            const target = e.target;
            if (target === inputRef.current) {
                if (e.key === 'Enter' && !e.repeat) {
                    inputRef.current?.blur();
                    if (canStartSimulation) {
                        resetSimulation();
                        setIsPlaying(true);
                    }
                }
                return;
            }
            if (isEditableTarget(target)) return;
            if (isInsideAutomatonEditor(target)) return;

            switch (e.code) {
                case 'Space':
                    if (e.repeat) break;
                    e.preventDefault();
                    if (canStartSimulation) {
                        const shouldStartFromBeginning = !simulationState || simulationState.status !== 'running';
                        if (shouldStartFromBeginning) {
                            resetSimulation();
                            setIsPlaying(true);
                        } else {
                            setIsPlaying(!isPlaying);
                        }
                    }
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (canStartSimulation) {
                        setIsPlaying(false);
                        if (!simulationState || simulationState.status !== 'running') {
                            resetSimulation();
                            break;
                        }
                        step();
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    stepBack();
                    break;
                case 'KeyR':
                    e.preventDefault();
                    resetSimulation();
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [simulationState, isPlaying, step, stepBack, resetSimulation, hasInvalidInput, inputTokens, alphabet, isTuring, isAll, simulatorMode, setIsPlaying]);

    // Helpers for display
    const formatStateList = useCallback((ids: string[] | undefined) => {
        if (!ids || ids.length === 0) return 'vazio';
        return ids.map(id => stateLabelMap.get(id) || id).join(', ');
    }, [stateLabelMap]);

    const stepCount = simulationState?.processedInput.length || 0;
    const totalSteps = inputTokens.length;
    const preferredLayout: SimulatorLayout = isDesktopViewport ? simulatorLayout : 'bottom';
    const showRightDock = preferredLayout === 'side' || preferredLayout === 'top_side';
    const simulationStatus = simulationState?.status ?? 'idle';
    const hasAlphabetForInput = inputTokens.length === 0 || alphabet.length > 0 || isTuring || isAll;
    const canPlay = !hasInvalidInput && hasAlphabetForInput;
    const canStepForward = canPlay && simulationState?.status === 'running';
    const hasSimulationProgress = !!simulationState && (history.length > 1 || stepCount > 0);
    const disableReason = hasInvalidInput
        ? `Entrada contém símbolos fora do alfabeto: ${invalidSymbols.join(', ')}.`
        : !hasAlphabetForInput
            ? 'Defina o alfabeto de entrada no autômato antes de iniciar a simulação.'
            : null;

    const modeSelector = (
        <div className="glass-panel rounded-2xl px-3 py-2 flex flex-wrap items-center gap-2 pointer-events-auto shadow-apple-md border border-default">
            <div className="inline-flex items-center gap-1 rounded-xl bg-surface-muted p-1 border border-default">
                <button
                    onClick={() => setSimulatorMode('automaton')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        simulatorMode === 'automaton'
                            ? 'bg-ios-blue text-white shadow'
                            : 'text-secondary hover:bg-surface-hover'
                    }`}
                    aria-pressed={simulatorMode === 'automaton'}
                >
                    {'Aut\u00f4mato'}
                </button>
                <button
                    onClick={() => setSimulatorMode('grammar')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        simulatorMode === 'grammar'
                            ? 'bg-ios-purple text-white shadow'
                            : 'text-secondary hover:bg-surface-hover'
                    }`}
                    aria-pressed={simulatorMode === 'grammar'}
                >
                    {'Gram\u00e1tica'}
                </button>
            </div>
        </div>
    );

    const regexImportPanel = (
        <div className="glass-panel p-4 rounded-3xl h-full shadow-apple-md border border-default bg-surface-1/80">
            <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-ios-blue/10 text-ios-blue">
                        <Sparkles size={16} />
                    </div>
                    <span className="ui-kicker-xs text-primary font-bold">
                        Regex → AFN
                    </span>
                </div>
                <span className="badge badge-info font-mono text-[9px]">ER</span>
            </div>
            <div className="flex gap-2">
                <input
                    value={regexImport}
                    onChange={(e) => {
                        setRegexImport(e.target.value);
                        setRegexImportError(null);
                    }}
                    placeholder="ex: (a+b)*abb"
                    className="flex-1 min-w-0 rounded-xl border border-default bg-surface-2 px-3 py-2 text-sm font-mono text-primary shadow-inner outline-none focus:ring-2 ring-ios-blue/40"
                />
                <button
                    onClick={handleRegexImport}
                    className="px-4 py-2 rounded-xl bg-ios-blue text-white text-xs font-black uppercase tracking-wider hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                    Importar
                </button>
            </div>
            {regexImportError && (
                <div id={regexImportErrorId} role="status" className="mt-2 text-[10px] font-bold text-ios-red flex items-center gap-1.5 px-1">
                    <XCircle size={12} /> {regexImportError}
                </div>
            )}
        </div>
    );

    const statsPanel = (
        <div className="glass-panel px-3 py-2 rounded-2xl text-muted flex items-center gap-2 shadow-apple-md border border-default">
            <span className="badge badge-info">{safeData.tipo}</span>
            <div className="w-px h-3 bg-border mx-1" />
            <span className="text-[11px] font-bold text-secondary">{safeData.estados.length} estados</span>
            <span className="text-[11px] font-bold text-secondary">{safeData.transicoes.length} trans.</span>
            <div className="w-px h-3 bg-border mx-1" />
            <span className={`badge ${
                simulationStatus === 'accepted'
                    ? 'badge-success'
                    : simulationStatus === 'rejected'
                        ? 'badge-danger'
                        : 'badge-accent'
            }`}>
                {simulationStatus === 'accepted'
                    ? 'Aceito'
                    : simulationStatus === 'rejected'
                        ? 'Rejeitado'
                        : hasSimulationProgress
                            ? 'Rodando'
                            : 'Pronto'}
            </span>
        </div>
    );

    const tapePanel = (
        <div className={`glass-panel p-5 rounded-3xl shadow-apple-md border border-default transition-all duration-500 bg-surface-1/90 ${
            (inputTokens.length > 0 || isTuring) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}>
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                        simulationStatus === 'accepted' ? 'bg-ios-green shadow-[0_0_8px_rgba(52,199,89,0.6)]' :
                        simulationStatus === 'rejected' ? 'bg-ios-red' : 'bg-ios-blue animate-pulse'
                    }`} />
                    <span className="ui-kicker-xs text-primary font-black tracking-widest">
                        {isAll ? 'Fita limitada' : isTuring ? 'Fita infinita' : 'Visualização'}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {history.length > 1 && (
                        <span className="text-[10px] font-black text-muted flex items-center gap-1 uppercase tracking-tighter bg-surface-muted px-2 py-0.5 rounded-md">
                            <History size={10} />
                            {history.length - 1} passos
                        </span>
                    )}
                    <span className="text-[10px] font-mono font-black text-ios-blue bg-ios-blue/10 px-2 py-0.5 rounded-md border border-ios-blue/20">
                        {isTuring ? `H:${simulationState?.headPos ?? 0}` : `${stepCount}/${totalSteps}`}
                    </span>
                </div>
            </div>

            {isTuring ? (
                <TuringTape 
                    tape={simulationState?.tape ?? {}} 
                    headPos={simulationState?.headPos ?? 0}
                    minIndex={isAll ? 0 : undefined}
                    maxIndex={isAll ? inputTokens.length + 1 : undefined}
                />
            ) : (
                <div className="flex justify-center overflow-x-auto custom-scrollbar pb-2">
                     <InputTape 
                        tokens={inputTokens}
                        processedCount={simulationState?.processedInput.length || 0}
                        showLabels={false}
                     />
                </div>
            )}

            {/* Active States Indicator */}
            {simulationState && simulationState.activeStates.length > 0 && (
                <div className="mt-4 pt-4 border-t border-default/50 flex flex-wrap items-center justify-center gap-3">
                    <span className="text-[10px] font-black text-muted uppercase tracking-widest opacity-60">Ativos:</span>
                    <div className="flex flex-wrap gap-1.5">
                        {simulationState.activeStates.map(stateId => {
                            const state = data.estados.find(s => s.id === stateId);
                            return (
                                <span
                                    key={stateId}
                                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black shadow-sm border
                                        ${state?.isFinal 
                                            ? 'bg-ios-green text-white border-green-600/20' 
                                            : 'bg-ios-blue text-white border-blue-600/20'}`}
                                >
                                    {state?.label || stateId}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {(isMoore || isMealy) && simulationState && (
                <div className="mt-3 flex items-center justify-center gap-3 pt-3 border-t border-default/30">
                    <span className="text-[10px] font-black text-muted uppercase tracking-widest opacity-60">Saída:</span>
                    {simulationState.outputStatus === 'ambiguous' ? (
                        <span className="text-[10px] font-black text-ios-orange bg-ios-orange/10 px-2 py-0.5 rounded-md">Ambígua</span>
                    ) : (
                        <div className="flex flex-wrap gap-1">
                            {(simulationState.output ?? []).length === 0 && (
                                <span className="text-[10px] font-bold text-muted italic opacity-50">vazio</span>
                            )}
                            {(simulationState.output ?? []).map((out, idx) => (
                                <span
                                    key={`${out}-${idx}`}
                                    className="px-2 py-0.5 rounded-md text-[10px] font-black bg-ios-purple text-white shadow-sm"
                                >
                                    {out}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            {/* PDA Stack Visualizer */}
            {isPda && simulationState?.activeConfigs && simulationState.activeConfigs.length > 0 && (
                <div className="mt-5 flex justify-center bg-surface-muted/30 p-4 rounded-2xl border border-default/40 shadow-inner">
                    <StackVisualizer stack={simulationState.activeConfigs[0].stack} />
                </div>
            )}
        </div>
    );

    const warningsPanel = (
        <div className="space-y-2">
            {disableReason ? (
                <div className={`glass-panel px-5 py-4 rounded-[24px] text-[11px] font-bold flex items-start gap-3 shadow-apple-md border border-default leading-relaxed ${hasInvalidInput ? 'text-ios-red bg-ios-red/5' : 'text-ios-orange bg-ios-orange/5'}`}>
                    <Info size={18} className="shrink-0 mt-0.5 opacity-80" />
                    <p>{disableReason}</p>
                </div>
            ) : (
                <div className="glass-panel px-5 py-3 rounded-full text-[10px] font-black text-secondary flex items-center gap-3 shadow-apple-md border border-default uppercase tracking-widest bg-surface-1/80">
                    <Keyboard size={14} className="text-ios-blue" />
                    <span>Espaço: Iniciar · Setas: Passo · R: Reset</span>
                </div>
            )}
            {isPda && (
                <div className="glass-panel px-5 py-3 rounded-2xl text-[11px] font-medium text-secondary flex items-start gap-3 shadow-apple-sm border border-default bg-surface-1/50 backdrop-blur-md">
                    <LayoutList size={16} className="text-ios-purple shrink-0 mt-0.5" />
                    <p>AP: <code className="font-black bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-ios-purple">símbolo, topo -&gt; novos</code></p>
                </div>
            )}
        </div>
    );

    const detailsPanel = showDetails && (
        <div className="glass-panel p-6 rounded-[32px] shadow-apple-xl border border-default animate-scale-in origin-bottom-right bg-surface-1/95 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-5 border-b border-default pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-ios-blue/10 text-ios-blue">
                        <History size={20} />
                    </div>
                    <span className="ui-kicker text-primary font-black tracking-widest">Histórico</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-muted uppercase">Alfabeto</span>
                    <span className="text-[11px] font-mono font-black text-ios-blue bg-ios-blue/10 px-2 py-0.5 rounded-md border border-ios-blue/20">
                        {alphabet.length > 0 ? alphabet.join('') : '∅'}
                    </span>
                </div>
            </div>
            <div className="max-h-72 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center opacity-40">
                        <History size={32} className="mb-2" />
                        <p className="text-[11px] font-bold uppercase tracking-wider">Aguardando execução</p>
                    </div>
                ) : history.map((stepItem, index) => {
                    const symbolLabel = stepItem.symbol ?? (index === 0 ? 'START' : 'ε');
                    return (
                        <div key={index} className="rounded-2xl border border-default/60 p-4 text-[11px] bg-surface-muted/20 transition-all hover:bg-surface-muted/40 hover:translate-x-1">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-black text-ios-blue uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-ios-blue" />
                                    Passo {index}
                                </span>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border shadow-sm ${
                                    stepItem.status === 'accepted' ? 'bg-ios-green text-white border-green-600/20' : 
                                    stepItem.status === 'rejected' ? 'bg-ios-red text-white border-red-600/20' : 'bg-surface-strong text-secondary border-default'
                                }`}>
                                    {stepItem.status}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 bg-black/5 dark:bg-white/5 p-2 rounded-xl border border-default/30">
                                    <span className="text-[9px] font-black text-muted uppercase block tracking-tighter">Símbolo lido</span>
                                    <code className="font-black text-primary text-xs">{symbolLabel}</code>
                                </div>
                                <div className="space-y-1.5 bg-black/5 dark:bg-white/5 p-2 rounded-xl border border-default/30">
                                    <span className="text-[9px] font-black text-muted uppercase block tracking-tighter">Configuração</span>
                                    <span className="text-secondary font-black truncate block">{formatStateList(stepItem.activeStates)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const controlsBar = (
        <div className="glass-card p-2 md:p-3 rounded-[40px] flex flex-col lg:flex-row lg:items-center gap-3 pointer-events-auto shadow-apple-2xl border border-default/80 backdrop-blur-3xl bg-surface-1/90">

            {/* Input Field Area */}
            <div className={`flex w-full lg:flex-1 items-center bg-surface-2/50 rounded-[28px] px-5 py-1 border-2 transition-all duration-300 ${
                hasInvalidInput 
                    ? 'border-ios-red ring-4 ring-ios-red/10' 
                    : 'border-default focus-within:border-ios-blue focus-within:ring-4 focus-within:ring-ios-blue/10 shadow-inner'
            }`}>
                <div className={`p-2 rounded-full mr-3 transition-colors ${hasInvalidInput ? 'text-ios-red bg-ios-red/10' : 'text-muted bg-surface-muted'}`}>
                    <Keyboard size={20} strokeWidth={2.5} />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={inputString}
                    onChange={handleInputChange}
                    placeholder="Digite a entrada para o autômato..."
                    className="flex-1 bg-transparent border-none outline-none text-base font-mono font-black py-3 text-primary placeholder:text-muted placeholder:opacity-40 min-w-0"
                    aria-invalid={hasInvalidInput}
                />
                
                <div className="flex items-center gap-2 ml-3">
                    <div className="flex items-center bg-surface-muted/80 rounded-2xl p-1.5 border border-default/60 shadow-sm">
                        <select
                            value={inputTokenization}
                            onChange={(e) => setInputTokenization(e.target.value as 'auto' | 'char' | 'separator')}
                            className="text-[10px] font-black uppercase tracking-widest bg-transparent px-3 py-1 text-secondary outline-none cursor-pointer hover:text-primary transition-colors"
                            title="Modo de leitura da entrada"
                        >
                            <option value="auto">Auto</option>
                            <option value="char">Carac.</option>
                            <option value="separator">Separ.</option>
                        </select>
                        {inputTokenization === 'separator' && (
                            <input
                                value={inputSeparator}
                                onChange={(e) => setInputSeparator(e.target.value)}
                                className="w-10 text-xs font-mono font-black bg-white dark:bg-black/40 rounded-xl px-2 py-1 text-center text-ios-blue border border-ios-blue/30 shadow-inner outline-none mx-1"
                                title="Símbolo separador"
                                placeholder="|"
                            />
                        )}
                    </div>
                </div>

                {inputString && (
                    <button
                        onClick={clearInput}
                        className="ml-3 p-2 rounded-full text-muted hover:text-ios-red hover:bg-ios-red/10 transition-all active:scale-90"
                        title="Limpar entrada"
                    >
                        <X size={20} strokeWidth={3} />
                    </button>
                )}
            </div>

            <div className="hidden lg:block w-px h-12 bg-border/40 mx-2"></div>

            {/* Playback Controls */}
            <div className="w-full lg:w-auto flex justify-center scale-110 lg:scale-100 origin-center px-4">
                <SimulationControls 
                    isPlaying={isPlaying}
                    canPlay={canPlay}
                    canStep={canStepForward}
                    canStepBack={history.length > 1}
                    speed={speed}
                    onPlay={() => {
                        if (!simulationState || simulationState.status !== 'running') {
                            resetSimulation();
                        }
                        setIsPlaying(true);
                    }}
                    onPause={() => setIsPlaying(false)}
                    onStep={() => {
                        if (!simulationState || simulationState.status !== 'running') {
                            resetSimulation();
                            return;
                        }
                        step();
                    }}
                    onStepBack={stepBack}
                    onReset={() => resetSimulation()}
                    onSpeedChange={setSpeed}
                    disabled={hasInvalidInput}
                    compact={!isDesktopViewport}
                />
            </div>

            {/* Extra Actions */}
            <div className="flex items-center gap-2 lg:border-l border-default/40 lg:pl-4 justify-end">
                 {simulationState && hasSimulationProgress && (
                    <button
                        onClick={() => resetSimulation(true)}
                        className="p-3 rounded-[20px] bg-surface-muted text-secondary hover:text-ios-blue hover:bg-ios-blue/10 hover:border-ios-blue/30 border border-transparent transition-all active:scale-90"
                        title="Reiniciar e voltar ao editor"
                    >
                        <RotateCcw size={22} />
                    </button>
                )}
                <div className="hidden sm:flex items-center justify-center min-w-[70px] text-[11px] font-black font-mono text-ios-blue bg-ios-blue/5 rounded-2xl h-12 border border-ios-blue/20 shadow-inner">
                    {isTuring ? `H:${simulationState?.headPos ?? 0}` : `${stepCount}/${totalSteps}`}
                </div>
                <button
                    onClick={() => setShowDetails(s => !s)}
                    className={`p-3 rounded-[20px] transition-all border-2 active:scale-95 ${
                        showDetails 
                            ? 'bg-ios-blue text-white shadow-xl shadow-blue-500/40 border-ios-blue' 
                            : 'bg-surface-muted text-secondary hover:text-primary hover:bg-surface-hover border-transparent'
                    }`}
                    title="Ver histórico detalhado da execução"
                >
                    <ListOrdered size={22} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );


    return (
        <div className="relative h-[calc(100dvh-1.5rem)] w-full pt-[4.75rem] md:pt-[5.5rem] animate-fade-in flex flex-col overflow-hidden" data-native-cursor="true">
            {simulatorMode === 'automaton' ? (
                <div className="relative flex-1 min-h-0">
                    <div className="absolute inset-0">
                        <AutomatonEditor
                            data={safeData}
                            onChange={setData}
                            activeStates={simulationState?.activeStates}
                            activeTransitions={activeTransitions}
                            readOnly={!!simulationState && simulationState.processedInput.length > 0}
                            viewState={viewState}
                            onViewStateChange={handleViewStateChange}
                            compact
                            fitRequestToken={fitRequestToken}
                        />
                    </div>

                    <div className="pointer-events-none absolute inset-x-3 top-2 md:top-3 z-30">
                        <div className="mx-auto w-full max-w-[1450px] flex flex-wrap items-start justify-between gap-2 px-16 md:px-20">
                            <div className="pointer-events-auto flex flex-wrap gap-2 items-start">
                                {modeSelector}
                                {statsPanel}
                            </div>
                        </div>
                    </div>

                    {showRightDock && (
                        <aside className="pointer-events-none absolute right-3 md:right-80 top-[6.5rem] bottom-[9.5rem] z-30 w-[min(400px,calc(100%-1.5rem))]">
                            <div className="h-full overflow-y-auto custom-scrollbar space-y-4 pr-2">
                                <div className="pointer-events-auto">
                                    {tapePanel}
                                </div>
                                <div className="pointer-events-auto">
                                    {warningsPanel}
                                </div>
                                {detailsPanel && (
                                    <div className="pointer-events-auto">
                                        {detailsPanel}
                                    </div>
                                )}
                            </div>
                        </aside>
                    )}

                    <div className="pointer-events-none absolute inset-x-3 bottom-3 z-30">
                        <div className="mx-auto w-full max-w-[1450px] space-y-4">
                            <div className="pointer-events-auto max-w-[480px]">
                                {regexImportPanel}
                            </div>

                            {!showRightDock && (disableReason || isPda) && (
                                <div className="pointer-events-auto max-w-[760px]">
                                    {warningsPanel}
                                </div>
                            )}

                            {!showRightDock && detailsPanel && (
                                <div className="pointer-events-auto max-w-[760px] ml-auto">
                                    {detailsPanel}
                                </div>
                            )}

                            {!showRightDock && (inputTokens.length > 0 || isTuring) && (
                                <div className="pointer-events-auto">
                                    {tapePanel}
                                </div>
                            )}

                            <div className="pointer-events-auto">
                                {controlsBar}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <GrammarWorkspace
                    modeSelector={modeSelector}
                    grammarSource={grammarSource}
                    grammarInput={grammarInput}
                    grammarWarnings={grammarWarnings}
                    grammarStrategy={grammarStrategy}
                    grammarLimits={grammarLimits}
                    grammarResult={grammarResult}
                    grammarTransform={grammarTransform}
                    setGrammarSource={setGrammarSource}
                    setGrammarInput={setGrammarInput}
                    setGrammarStrategy={setGrammarStrategy}
                    setGrammarLimits={setGrammarLimits}
                    runDerivation={runDerivation}
                    runTransform={runTransform}
                    clearTransform={clearTransform}
                    clearResult={clearResult}
                />
            )}
        </div>
    );
};
