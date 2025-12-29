import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AutomatonEditor } from '../components/automaton';
import type { AutomatoData, SimulationStep } from '../types';
import { CheckCircle2, XCircle, X, Keyboard, History, ListOrdered, Info, Pencil } from 'lucide-react';
import { regexToNfa } from '../utils/conversions';
import {
    DerivationTreeVisualizer,
    StackVisualizer,
    TuringTape,
    useToast,
    SimulationControls,
    InputTape
} from '../components/ui';
import { useUiSettings } from '../hooks/UiSettingsContext';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { SIMULATOR_STORAGE_KEY, SIMULATOR_VIEW_KEY } from '../constants/storage';
import { useAutomatonSimulation } from '../hooks/useAutomatonSimulation';
import { useGrammarSimulation } from '../hooks/useGrammarSimulation';

interface SimulatorProps {
    initialData?: AutomatoData;
}

const emptyAutomaton: AutomatoData = {
    tipo: 'AFD',
    estados: [],
    transicoes: [],
    descricao: 'Novo automato'
};

export const SimulatorPage: React.FC<SimulatorProps> = ({ initialData }) => {
    // Ensure data is never null, even if initialData is undefined
    const [data, setData] = useLocalStorageState<AutomatoData>(
        SIMULATOR_STORAGE_KEY,
        initialData ?? emptyAutomaton,
        { readOnInit: !initialData }
    );
    const [simulatorMode, setSimulatorMode] = useState<'automaton' | 'grammar'>('automaton');
    
    // Persistent View State
    const [viewState, setViewState] = useLocalStorageState(
        SIMULATOR_VIEW_KEY,
        { zoom: 1, pan: { x: 0, y: 0 } }
    );

    const handleViewStateChange = useCallback((zoom: number, pan: { x: number; y: number }) => {
        setViewState((prev: { zoom: number; pan: { x: number; y: number } }) => {
            const zoomDelta = Math.abs(prev.zoom - zoom);
            const panDelta = Math.abs(prev.pan.x - pan.x) + Math.abs(prev.pan.y - pan.y);
            if (zoomDelta < 0.001 && panDelta < 0.5) return prev;
            return { zoom, pan };
        });
    }, []);

    // Safety check: if data somehow becomes null (e.g. from parent update), use empty
    const safeData = data || emptyAutomaton;

    const [inputString, setInputString] = useState('');
    const [regexImport, setRegexImport] = useState('');
    const [regexImportError, setRegexImportError] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const { addToast } = useToast();
    const {
        inputTokenization,
        inputSeparator,
        setInputTokenization,
        setInputSeparator
    } = useUiSettings();

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
        transitionMap,
        setSpeed,
        setIsPlaying,
        resetSimulation,
        step,
        stepBack,
        formatPdaConfig
    } = useAutomatonSimulation(
        safeData,
        inputString,
        { mode: inputTokenization, separator: inputSeparator }
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
    } = useGrammarSimulation({ mode: inputTokenization, separator: inputSeparator });

    const prevInitialDataRef = useRef<string>('');

    useEffect(() => {
        if (!initialData) return;
        const currentString = JSON.stringify(initialData);
        if (prevInitialDataRef.current !== currentString) {
            prevInitialDataRef.current = currentString;
            setData(initialData);
            setSimulatorMode('automaton');
        }
    }, [initialData, setData]);

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
            addToast('Regex convertida para AFN', 'success');
        } catch {
            setRegexImportError('Regex invalida');
        }
    }, [regexImport, addToast, setData]);

    const handleCanvasInteract = useCallback(() => {
        if (simulatorMode !== 'automaton') return;
        if (!simulationState && history.length === 0) return;
        resetSimulation(true);
        addToast('Edição no autômato reiniciou a simulação.', 'info');
    }, [simulationState, history.length, resetSimulation, addToast, simulatorMode]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (simulatorMode !== 'automaton') return;
            if (document.activeElement === inputRef.current) {
                if (e.key === 'Enter') {
                    inputRef.current?.blur();
                    if (!hasInvalidInput) {
                        resetSimulation();
                        setIsPlaying(true);
                    }
                }
                return;
            }

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    if (!hasInvalidInput) {
                        if (!simulationState) resetSimulation();
                        setIsPlaying(!isPlaying);
                    }
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (!hasInvalidInput) {
                        setIsPlaying(false);
                        step();
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    stepBack();
                    break;
                case 'KeyR':
                    resetSimulation();
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [simulationState, isPlaying, step, stepBack, resetSimulation, hasInvalidInput, simulatorMode, setIsPlaying]);

    // Helpers for display
    const formatStateList = useCallback((ids: string[] | undefined) => {
        if (!ids || ids.length === 0) return 'vazio';
        return ids.map(id => stateLabelMap.get(id) || id).join(', ');
    }, [stateLabelMap]);

    const formatTransitions = useCallback((ids: string[] | undefined) => {
        if (!ids || ids.length === 0) return [];
        return ids.map(id => {
            const transition = transitionMap.get(id);
            if (!transition) return id;
            const fromLabel = stateLabelMap.get(transition.de) || transition.de;
            const toLabel = stateLabelMap.get(transition.para) || transition.para;
            const symbol = transition.simbolo?.trim() ? transition.simbolo : '?';
            return `${fromLabel} -${symbol}-> ${toLabel}`;
        });
    }, [transitionMap, stateLabelMap]);

    const formatConfigs = useCallback((configs: SimulationStep['activeConfigs']) => {
        if (!configs || configs.length === 0) return 'vazio';
        return configs.slice(0, 6).map(cfg => {
            const label = stateLabelMap.get(cfg.stateId) || cfg.stateId;
            const stackLabel = cfg.stack.length > 0 ? cfg.stack.join(' ') : 'eps';
            return `${label} [${stackLabel}]`;
        }).join(' | ');
    }, [stateLabelMap]);

    const stepCount = simulationState?.processedInput.length || 0;
    const totalSteps = inputTokens.length;

    // Toast for status changes
    useEffect(() => {
        if (simulationState?.status === 'accepted') {
             // Optional: visual feedback already exists
        }
    }, [simulationState?.status]);


    return (
        <div className="absolute inset-0 animate-fade-in flex flex-col overflow-hidden">
            {simulatorMode === 'automaton' ? (
                <>
                    {/* Full Width Canvas Layer */}
                    <div className="flex-1 relative z-0">
                        {/* Top Bar: Mode Selector + Regex Import */}
                        <div className="absolute top-4 left-4 right-4 z-20 flex items-start justify-between gap-4 pointer-events-none">
                            {/* Regex Import (left) */}
                            <div className="glass-panel p-3 rounded-2xl pointer-events-auto max-w-xs flex-shrink-0">
                                <div className="ui-kicker-xs text-muted mb-2">
                                    Regex → AFN
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        value={regexImport}
                                        onChange={(e) => {
                                            setRegexImport(e.target.value);
                                            setRegexImportError(null);
                                        }}
                                        placeholder="ex: (a+b)*abb"
                                        className="flex-1 min-w-0 rounded-xl border border-default bg-surface-2 px-3 py-2 text-xs font-mono text-primary shadow-inner"
                                    />
                                    <button
                                        onClick={handleRegexImport}
                                        className="px-3 py-2 rounded-xl bg-ios-blue text-white text-[10px] font-bold hover:bg-blue-600 transition-colors whitespace-nowrap"
                                    >
                                        OK
                                    </button>
                                </div>
                                {regexImportError && (
                                    <div className="mt-2 text-[10px] text-ios-red">{regexImportError}</div>
                                )}
                            </div>

                            {/* Mode Selector (right) */}
                            <div className="glass-dock px-2 py-1.5 rounded-full flex gap-1 pointer-events-auto flex-shrink-0">
                                <button
                                    onClick={() => setSimulatorMode('automaton')}
                                    className="px-3 py-1.5 rounded-full text-xs font-bold transition-all bg-ios-blue text-white shadow"
                                >
                                    Autômato
                                </button>
                                <button
                                    onClick={() => setSimulatorMode('grammar')}
                                    className="px-3 py-1.5 rounded-full text-xs font-bold transition-all text-secondary hover:bg-surface-muted"
                                >
                                    Gramática
                                </button>
                            </div>
                        </div>

                        {/* Stats Panel (bottom right) */}
                        <div className="absolute bottom-24 right-4 z-20 pointer-events-none">
                            <div className="glass-panel px-3 py-2 rounded-xl ui-kicker-xs text-muted flex flex-col gap-1 shadow-apple-md pointer-events-auto">
                                <div className="flex items-center gap-2">
                                    <span className="text-ios-blue bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{safeData.tipo}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[9px]">
                                    <span>{safeData.estados.length} Estados</span>
                                    <span>{safeData.transicoes.length} Trans.</span>
                                </div>
                                <div className="flex items-center gap-2 pt-1 border-t border-default">
                                    <span className="text-primary">{Math.round((viewState?.zoom ?? 1) * 100)}%</span>
                                </div>
                            </div>
                        </div>

                        <AutomatonEditor
                            data={safeData}
                            onChange={setData}
                            activeStates={simulationState?.activeStates}
                            activeTransitions={activeTransitions}
                            readOnly={!!simulationState && simulationState.processedInput.length > 0}
                            onInteract={handleCanvasInteract}
                            viewState={viewState}
                            onViewStateChange={handleViewStateChange}
                            compact
                        />
                    </div>

            {/* Floating Control Dock - Bottom Center */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col gap-4 w-full max-w-2xl px-4 pointer-events-none">

                {/* Visual Tape / Machine State */}
                <div className={`glass-card p-4 transition-all duration-500 pointer-events-auto
                    ${(inputTokens.length > 0 || isTuring) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>

                    <div className="flex items-center justify-between mb-3 px-1">
                        <span className={`ui-kicker-xs flex items-center gap-1.5
                             ${simulationState?.status === 'accepted' ? 'text-ios-green' :
                                simulationState?.status === 'rejected' ? 'text-ios-red' : 'text-muted'}`}>
                            {simulationState?.status === 'accepted' && <CheckCircle2 size={14} />}
                            {simulationState?.status === 'rejected' && <XCircle size={14} />}
                            {simulationState?.status === 'accepted'
                                ? 'Aceito'
                                : simulationState?.status === 'rejected'
                                    ? 'Rejeitado'
                                    : isAll
                                        ? 'Fita limitada'
                                        : isTuring
                                            ? 'Fita infinita'
                                            : 'Fita de leitura'}
                        </span>
                        <div className="flex items-center gap-3">
                            {history.length > 1 && (
                                <span className="text-[10px] font-bold text-muted flex items-center gap-1">
                                    <History size={12} />
                                    {history.length - 1} passos
                                </span>
                            )}
                            <span className="text-[11px] font-mono text-muted">
                                {isTuring ? `Cabeça: ${simulationState?.headPos ?? 0}` : `Passo ${stepCount} / ${totalSteps}`}
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
                        <div className="flex justify-center">
                             <InputTape 
                                tokens={inputTokens}
                                processedCount={simulationState?.processedInput.length || 0}
                             />
                        </div>
                    )}

                    {/* Active States Indicator */}
                    {simulationState && simulationState.activeStates.length > 0 && (
                        <div className="mt-3 flex items-center justify-center gap-2">
                            <span className="text-[10px] font-bold text-muted uppercase">Estados ativos:</span>
                            <div className="flex gap-1">
                                {simulationState.activeStates.map(stateId => {
                                    const state = data.estados.find(s => s.id === stateId);
                                    return (
                                        <span
                                            key={stateId}
                                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                                                ${state?.isFinal ? 'bg-ios-green text-white' : 'bg-ios-blue/20 text-ios-blue'}`}
                                        >
                                            {state?.label || stateId}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {(isMoore || isMealy) && simulationState && (
                        <div className="mt-3 flex items-center justify-center gap-2">
                            <span className="text-[10px] font-bold text-muted uppercase">Saida:</span>
                            {simulationState.outputStatus === 'ambiguous' ? (
                                <span className="text-[10px] font-bold text-ios-orange">Ambigua</span>
                            ) : (
                                <div className="flex gap-1">
                                    {(simulationState.output ?? []).length === 0 && (
                                        <span className="text-[10px] text-muted">vazio</span>
                                    )}
                                    {(simulationState.output ?? []).map((out, idx) => (
                                        <span
                                            key={`${out}-${idx}`}
                                            className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-ios-purple/20 text-ios-purple"
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
                        <div className="mt-4 flex justify-center">
                            <StackVisualizer stack={simulationState.activeConfigs[0].stack} />
                        </div>
                    )}
                    {isPda && simulationState?.activeConfigs && simulationState.activeConfigs.length > 1 && (
                        <div className="mt-4 rounded-xl border border-default bg-surface-muted p-3">
                            <div className="ui-kicker-xs text-muted mb-2">
                                Ramificacoes ({simulationState.activeConfigs.length})
                            </div>
                            <div className="grid gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                                {simulationState.activeConfigs.map((cfg, idx) => {
                                    const label = data.estados.find(s => s.id === cfg.stateId)?.label || cfg.stateId;
                                    const stack = cfg.stack.length > 0 ? cfg.stack.join('') : 'vazio';
                                    return (
                                        <div key={`${cfg.stateId}-${idx}`} className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-primary">{label}</span>
                                            <span className="font-mono text-secondary">{stack}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {isPda && simulationState?.pdaEdges && simulationState.pdaEdges.length > 0 && (
                        <div className="mt-3 rounded-xl border border-default bg-surface-muted p-3">
                            <div className="ui-kicker-xs text-muted mb-2">
                                Arvore de ramificacoes
                            </div>
                            <div className="grid gap-1 max-h-32 overflow-y-auto custom-scrollbar text-[11px] text-secondary font-mono">
                                {simulationState.pdaEdges.slice(0, 30).map((edge, idx) => (
                                    <div key={`${edge.from}-${edge.to}-${idx}`}>
                                        {formatPdaConfig(edge.from)} -&gt; {formatPdaConfig(edge.to)}
                                    </div>
                                ))}
                                {simulationState.pdaEdges.length > 30 && (
                                    <div className="text-[10px] text-muted">
                                        +{simulationState.pdaEdges.length - 30} ramificacoes...
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {hasInvalidInput && (
                    <div className="glass-card px-4 py-3 text-xs text-ios-red flex items-center gap-2 pointer-events-auto">
                        <Info size={14} />
                        Entrada contém símbolos fora do alfabeto: {invalidSymbols.join(', ')}.
                    </div>
                )}
                {inputTokens.length > 0 && alphabet.length === 0 && (
                    <div className="glass-card px-4 py-3 text-xs text-ios-orange flex items-center gap-2 pointer-events-auto">
                        <Info size={14} />
                        {isPda ? 'Defina o alfabeto de entrada antes de simular.' : 'Defina o alfabeto nas transições antes de simular.'}
                    </div>
                )}
                {isPda && (
                    <div className="glass-card px-4 py-3 text-xs text-secondary flex items-center gap-2 pointer-events-auto">
                        <Info size={14} />
                        Formato de transicao do AP: <span className="font-mono">a, Z -&gt; AZ</span> (use eps para vazio).
                    </div>
                )}

                {showDetails && (
                    <div className="glass-card p-4 pointer-events-auto">
                        <div className="flex items-center justify-between mb-3">
                            <span className="ui-kicker-xs text-muted flex items-center gap-1.5">
                                <ListOrdered size={12} />
                                Detalhes
                            </span>
                            <span className="text-[10px] text-muted">
                                Alfabeto: {alphabet.length > 0 ? alphabet.join(', ') : 'vazio'}
                            </span>
                        </div>
                        <div className="max-h-48 overflow-auto space-y-2 custom-scrollbar">
                            {history.length === 0 ? (
                                <div className="text-xs text-muted">Sem execução ainda.</div>
                            ) : history.map((stepItem, index) => {
                                const statusLabel = stepItem.status === 'accepted'
                                    ? 'Aceito'
                                    : stepItem.status === 'rejected'
                                        ? 'Rejeitado'
                                        : 'Rodando';
                                const symbolLabel = stepItem.symbol ?? (index === 0 ? 'inicio' : '-');
                                const used = formatTransitions(stepItem.usedTransitions);
                                const directTargetsLabel = formatStateList(stepItem.directTargets);
                                return (
                                    <div key={`${index}-${stepItem.processedInput.join(' ')}`} className="rounded-xl border border-default p-3 text-xs bg-surface-muted">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-primary">Passo {index}</span>
                                            <span className={`ui-kicker-xs ${
                                                stepItem.status === 'accepted'
                                                    ? 'text-ios-green'
                                                    : stepItem.status === 'rejected'
                                                        ? 'text-ios-red'
                                                        : 'text-muted'
                                            }`}>
                                                {statusLabel}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-muted font-mono mb-1">Simbolo: {symbolLabel}</div>
                                        <div className="text-[11px] text-secondary">De: {formatStateList(stepItem.fromStates || stepItem.activeStates)}</div>
                                        {stepItem.directTargets && stepItem.directTargets.length > 0 && (
                                            <div className="text-[11px] text-secondary">Alvo direto: {directTargetsLabel}</div>
                                        )}
                                        <div className="text-[11px] text-secondary">Para: {formatStateList(stepItem.activeStates)}</div>
                                        {isPda && stepItem.activeConfigs && (
                                            <div className="text-[11px] text-secondary">Configuracoes: {formatConfigs(stepItem.activeConfigs)}</div>
                                        )}
                                        {(isMoore || isMealy) && stepItem.output && (
                                            <div className="text-[11px] text-secondary">
                                                Saida: {stepItem.outputStatus === 'ambiguous' ? 'ambigua' : (stepItem.output.length > 0 ? stepItem.output.join(' ') : 'vazio')}
                                            </div>
                                        )}
                                        {stepItem.pdaEdges && stepItem.pdaEdges.length > 0 && (
                                            <div className="text-[11px] text-secondary">
                                                Ramificacoes: {stepItem.pdaEdges.length}
                                            </div>
                                        )}
                                        {used.length > 0 && (
                                            <div className="mt-2 text-[10px] text-muted font-mono">
                                                Transicoes: {used.join(' | ')}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Controls Bar */}
                <div className="glass-dock p-2 flex items-center justify-between gap-4 pointer-events-auto">

                    {/* Input Field Area */}
                    <div className={`flex-1 flex items-center bg-surface-soft rounded-full px-4 py-1 border border-default focus-within:ring-2 transition-all ${
                        hasInvalidInput ? 'ring-2 ring-ios-red/40' : 'focus-within:ring-ios-blue/30'
                    }`}>
                        <Keyboard size={16} className="text-muted mr-2" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputString}
                            onChange={handleInputChange}
                            placeholder="Digite a entrada (use espacos para simbolos)..."
                            className="flex-1 bg-transparent border-none outline-none text-sm font-mono font-medium py-2 text-primary placeholder:text-muted placeholder:opacity-70"
                            aria-invalid={hasInvalidInput}
                        />
                        <div className="flex items-center gap-2">
                            <select
                                value={inputTokenization}
                                onChange={(e) => setInputTokenization(e.target.value as 'auto' | 'char' | 'separator')}
                                className="text-[10px] font-bold bg-surface-muted border border-default rounded-lg px-2 py-1 text-secondary"
                                title="Tokenizacao"
                            >
                                <option value="auto">Auto</option>
                                <option value="char">Char</option>
                                <option value="separator">Sep</option>
                            </select>
                            {inputTokenization === 'separator' && (
                                <input
                                    value={inputSeparator}
                                    onChange={(e) => setInputSeparator(e.target.value)}
                                    className="w-10 text-[10px] font-mono bg-surface-muted border border-default rounded-lg px-2 py-1 text-secondary"
                                    title="Separador"
                                    placeholder="|"
                                />
                            )}
                        </div>
                        {inputString && (
                            <button onClick={clearInput} className="text-muted hover:text-primary p-1 rounded-full hover:bg-surface-muted transition-all">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-border"></div>

                    {/* Playback Controls */}
                    <SimulationControls 
                        isPlaying={isPlaying}
                        canStep={!hasInvalidInput && (!simulationState?.status || simulationState.status === 'running')}
                        canStepBack={history.length > 1}
                        speed={speed}
                        onPlay={() => {
                            if (!simulationState) resetSimulation();
                            setIsPlaying(true);
                        }}
                        onPause={() => setIsPlaying(false)}
                        onStep={() => {
                            if (!simulationState) resetSimulation();
                            step();
                        }}
                        onStepBack={stepBack}
                        onReset={() => resetSimulation()}
                        onSpeedChange={setSpeed}
                        disabled={hasInvalidInput}
                    />

                    {/* Extra Actions */}
                    <div className="flex items-center gap-1 border-l border-border pl-2">
                         {simulationState && (
                            <button
                                onClick={() => resetSimulation(true)}
                                className="p-2 rounded-lg hover:bg-surface-soft text-secondary hover:text-primary transition-all"
                                title="Editar autômato"
                            >
                                <Pencil size={18} />
                            </button>
                        )}
                        <button
                            onClick={() => setShowDetails(s => !s)}
                            className={`p-2 rounded-lg transition-all ${
                                showDetails 
                                    ? 'bg-ios-blue/10 text-ios-blue' 
                                    : 'hover:bg-surface-soft text-secondary hover:text-primary'
                            }`}
                            title="Detalhes da simulação"
                        >
                            <ListOrdered size={18} />
                        </button>
                    </div>
                </div>
            </div>
                </>
            ) : (
                <div className="flex-1 relative z-0 overflow-hidden">
                    <div className="absolute inset-0 bg-canvas" />
                    <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

                    {/* Mode Selector (top right) */}
                    <div className="absolute top-4 right-4 z-20">
                        <div className="glass-dock px-2 py-1.5 rounded-full flex gap-1">
                            <button
                                onClick={() => setSimulatorMode('automaton')}
                                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all text-secondary hover:bg-surface-muted"
                            >
                                Autômato
                            </button>
                            <button
                                onClick={() => setSimulatorMode('grammar')}
                                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all bg-ios-purple text-white shadow"
                            >
                                Gramática
                            </button>
                        </div>
                    </div>

                    <div className="relative h-full overflow-auto px-6 py-16">
                        <div className="max-w-6xl mx-auto">
                            <div className="glass-panel rounded-[32px] p-6 md:p-8 border border-default shadow-apple-lg">
                                <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
                                    <div className="glass-card p-6">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-primary">Gramatica Livre de Contexto</h2>
                                    <p className="text-sm text-secondary">
                                        Formato: <span className="font-mono">S -&gt; a S b | eps</span>. Use espacos para simbolos multi-caractere.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setGrammarSource('S -> a S b | eps')}
                                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-200/60 bg-blue-50/70 text-ios-blue hover:bg-blue-100/80 transition-colors dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
                                    >
                                        Exemplo a^n b^n
                                    </button>
                                    <button
                                        onClick={() => setGrammarSource('S -> a S a | b S b | a | b | eps')}
                                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-purple-200/60 bg-purple-50/70 text-ios-purple hover:bg-purple-100/80 transition-colors dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300 dark:hover:bg-purple-500/20"
                                    >
                                        Exemplo palindromo
                                    </button>
                                </div>
                            </div>
                            <textarea
                                value={grammarSource}
                                onChange={(e) => setGrammarSource(e.target.value)}
                                className="w-full h-64 rounded-xl border border-default bg-surface-soft p-4 font-mono text-sm text-primary shadow-inner"
                                placeholder="S -> a S b | eps"
                            />
                            {grammarWarnings.length > 0 && (
                                <div className="mt-4 rounded-xl border border-yellow-400/40 bg-yellow-50/60 dark:bg-yellow-900/10 p-3 text-xs text-yellow-700 dark:text-yellow-300">
                                    {grammarWarnings.map((warn, idx) => (
                                        <div key={`${warn}-${idx}`}>- {warn}</div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-4 grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block ui-kicker-xs text-muted mb-1">Max passos</label>
                                    <input
                                        type="number"
                                        min={5}
                                        max={100}
                                        value={grammarLimits.maxSteps}
                                        onChange={(e) => setGrammarLimits({ ...grammarLimits, maxSteps: Number(e.target.value) })}
                                        className="w-full rounded-lg border border-default bg-surface-soft px-3 py-2 text-xs font-mono shadow-inner"
                                    />
                                </div>
                                <div>
                                    <label className="block ui-kicker-xs text-muted mb-1">Max fila</label>
                                    <input
                                        type="number"
                                        min={100}
                                        max={10000}
                                        value={grammarLimits.maxQueue}
                                        onChange={(e) => setGrammarLimits({ ...grammarLimits, maxQueue: Number(e.target.value) })}
                                        className="w-full rounded-lg border border-default bg-surface-soft px-3 py-2 text-xs font-mono shadow-inner"
                                    />
                                </div>
                                <div>
                                    <label className="block ui-kicker-xs text-muted mb-1">Max simbolos</label>
                                    <input
                                        type="number"
                                        min={5}
                                        max={100}
                                        value={grammarLimits.maxSymbols}
                                        onChange={(e) => setGrammarLimits({ ...grammarLimits, maxSymbols: Number(e.target.value) })}
                                        className="w-full rounded-lg border border-default bg-surface-soft px-3 py-2 text-xs font-mono shadow-inner"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 rounded-xl border border-default bg-surface-muted p-4">
                                <div className="ui-kicker-xs text-muted mb-3">
                                    Transformacoes
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => runTransform('epsilon')}
                                        className="px-3 py-2 rounded-lg text-xs font-bold border border-default bg-surface-soft hover:bg-surface-muted transition-colors">
                                        Remover epsilon
                                    </button>
                                    <button
                                        onClick={() => runTransform('unit')}
                                        className="px-3 py-2 rounded-lg text-xs font-bold border border-default bg-surface-soft hover:bg-surface-muted transition-colors">
                                        Remover unitarias
                                    </button>
                                    <button
                                        onClick={() => runTransform('cnf')}
                                        className="px-3 py-2 rounded-lg text-xs font-bold border border-default bg-surface-soft hover:bg-surface-muted transition-colors">
                                        CNF
                                    </button>
                                    <button
                                        onClick={() => runTransform('gnf')}
                                        className="px-3 py-2 rounded-lg text-xs font-bold border border-default bg-surface-soft hover:bg-surface-muted transition-colors">
                                        GNF
                                    </button>
                                </div>
                                {grammarTransform && (
                                    <div className="mt-3 rounded-lg border border-default bg-surface-soft p-3 text-xs">
                                        <div className="font-bold text-primary mb-2">{grammarTransform.title}</div>
                                        {grammarTransform.warnings && grammarTransform.warnings.length > 0 && (
                                            <div className="text-[10px] text-yellow-700 dark:text-yellow-300 mb-2">
                                                {grammarTransform.warnings.map((warn, idx) => (
                                                    <div key={`${warn}-${idx}`}>- {warn}</div>
                                                ))}
                                            </div>
                                        )}
                                        {grammarTransform.steps.length > 0 && (
                                            <div className="space-y-1 text-[10px] text-secondary">
                                                {grammarTransform.steps.map((step, idx) => (
                                                    <div key={`${step}-${idx}`}>{idx + 1}. {step}</div>
                                                ))}
                                            </div>
                                        )}
                                        {grammarTransform.output && (
                                            <pre className="mt-2 text-[11px] font-mono text-secondary whitespace-pre-wrap">
                                                {grammarTransform.output}
                                            </pre>
                                        )}
                                        <button onClick={clearTransform} className="mt-2 text-[10px] text-ios-blue underline">Fechar</button>
                                    </div>
                                )}
                            </div>
                                    </div>

                                    <div className="glass-card p-6 flex flex-col gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-primary mb-1">Teste de derivacao</h3>
                                            <p className="text-xs text-muted">Aceita tokens separados por espaco.</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="ui-kicker-xs text-muted">Derivacao</span>
                                            <button
                                                onClick={() => setGrammarStrategy('leftmost')}
                                                className={`px-3 py-1 rounded-full border text-[10px] font-bold ${
                                                    grammarStrategy === 'leftmost'
                                                        ? 'bg-ios-blue text-white border-ios-blue'
                                                        : 'bg-surface-soft text-secondary border-default'
                                                }`}
                                            >
                                                Esquerda
                                            </button>
                                            <button
                                                onClick={() => setGrammarStrategy('rightmost')}
                                                className={`px-3 py-1 rounded-full border text-[10px] font-bold ${
                                                    grammarStrategy === 'rightmost'
                                                        ? 'bg-ios-purple text-white border-ios-purple'
                                                        : 'bg-surface-soft text-secondary border-default'
                                                }`}
                                            >
                                                Direita
                                            </button>
                                        </div>
                                        <input
                                            value={grammarInput}
                                            onChange={(e) => setGrammarInput(e.target.value)}
                                            className="w-full rounded-xl border border-default bg-surface-soft px-4 py-2 text-sm font-mono text-primary shadow-inner"
                                            placeholder="ex: a a b b"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={runDerivation}
                                                className="flex-1 px-4 py-2 rounded-xl text-sm font-bold bg-ios-green text-white hover:bg-green-600 transition-colors shadow-apple-sm"
                                            >
                                                Derivar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setGrammarInput('');
                                                    clearResult();
                                                }}
                                                className="px-4 py-2 rounded-xl text-sm font-bold text-secondary border border-default bg-surface-soft hover:bg-surface-muted transition-colors"
                                            >
                                                Limpar
                                            </button>
                                        </div>

                                        {grammarResult && (
                                            <div className="rounded-xl border border-default bg-surface-muted p-4 text-sm">
                                                <div className={`font-bold mb-2 ${grammarResult.status === 'accepted' ? 'text-ios-green' : 'text-ios-red'}`}>
                                                    {grammarResult.status === 'accepted' ? 'Aceito' : 'Rejeitado'}
                                                </div>
                                                {grammarResult.reason && (
                                                    <div className="text-xs text-muted mb-2">{grammarResult.reason}</div>
                                                )}
                                                {grammarResult.steps.length > 0 && (
                                                    <div className="text-xs font-mono text-secondary space-y-1">
                                                        {grammarResult.steps.map((step, idx) => (
                                                            <div key={`${step}-${idx}`}>{idx}. {step}</div>
                                                        ))}
                                                    </div>
                                                )}
                                                {grammarResult.tree && (
                                                    <div className="mt-3">
                                                        <DerivationTreeVisualizer tree={grammarResult.tree} steps={grammarResult.steps} autoPlay={true} />
                                                    </div>
                                                )}
                                                {grammarResult.treeText && (
                                                    <pre className="mt-3 text-[11px] font-mono text-secondary whitespace-pre-wrap">
                                                        {grammarResult.treeText}
                                                    </pre>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
