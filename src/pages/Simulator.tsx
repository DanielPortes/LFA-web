import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AutomatonEditor } from '../components/automaton/AutomatonEditor';
import type { AutomatoData, SimulationStep, Transicao } from '../types';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, CheckCircle2, XCircle, X, Zap, Keyboard, History, ListOrdered, Info } from 'lucide-react';
import { getEpsilonClosure, performStep } from '../utils/automatonLogic';
import { getAlphabet } from '../utils/conversions';
import { matchesSymbol } from '../utils/symbols';
import { useToast } from '../components/ui/Toast';

interface SimulatorProps {
    initialData?: AutomatoData;
}

const emptyAutomaton: AutomatoData = {
    tipo: 'AFD',
    estados: [],
    transicoes: [],
    descricao: 'Novo Autômato'
};

export const SimulatorPage: React.FC<SimulatorProps> = ({ initialData }) => {
    // Ensure data is never null, even if initialData is undefined
    const [data, setData] = useState<AutomatoData>(initialData ?? emptyAutomaton);
    
    // Safety check: if data somehow becomes null (e.g. from parent update), use empty
    const safeData = data || emptyAutomaton;

    const [inputString, setInputString] = useState('');
    const [simulationState, setSimulationState] = useState<SimulationStep | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1000);
    const [history, setHistory] = useState<SimulationStep[]>([]);
    const [activeTransitions, setActiveTransitions] = useState<string[]>([]);
    const [showDetails, setShowDetails] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const { addToast } = useToast();

    const alphabet = useMemo(() => safeData ? getAlphabet(safeData) : [], [safeData]);
    const stateLabelMap = useMemo(() => {
        const map = new Map<string, string>();
        if (safeData && safeData.estados) {
            safeData.estados.forEach((state) => map.set(state.id, state.label || state.id));
        }
        return map;
    }, [safeData]);
    const transitionMap = useMemo(() => {
        const map = new Map<string, Transicao>();
        if (safeData && safeData.transicoes) {
            safeData.transicoes.forEach((transition) => map.set(transition.id, transition));
        }
        return map;
    }, [safeData]);
    const invalidSymbols = useMemo(() => {
        if (!inputString || alphabet.length === 0) return [];
        const unique = new Set<string>();
        for (const symbol of inputString) {
            if (!alphabet.includes(symbol)) {
                unique.add(symbol);
            }
        }
        return Array.from(unique);
    }, [inputString, alphabet]);
    const hasInvalidInput = invalidSymbols.length > 0;

    const resetSimulation = useCallback((fullReset = false) => {
        setIsPlaying(false);
        setHistory([]);
        setActiveTransitions([]);
        if (fullReset) {
            setSimulationState(null);
            return;
        }

        if (!safeData || !safeData.estados || !safeData.transicoes) return;

        const initialStates = safeData.estados.filter(e => e.isInicial).map(e => e.id);
        const activeStates = getEpsilonClosure(initialStates, safeData.transicoes);

        const initialStep: SimulationStep = {
            activeStates,
            remainingInput: inputString,
            processedInput: '',
            status: 'running'
        };
        setSimulationState(initialStep);
        setHistory([initialStep]);
    }, [safeData, inputString]);

    const prevInitialDataRef = useRef<string>('');

    useEffect(() => {
        if (initialData) {
            const currentString = JSON.stringify(initialData);
            if (prevInitialDataRef.current !== currentString) {
                prevInitialDataRef.current = currentString;
                setData(initialData);
                // We don't call resetSimulation here immediately to avoid dependency cycles if not needed
                // But logic requires it. It is safe now as resetSimulation depends on safeData.
                // However, setData is async. The resetSimulation will run with OLD data if called immediately?
                // Actually, resetSimulation depends on [safeData]. So when data updates, resetSimulation is recreated.
                // We should trigger reset in a separate effect that watches data?
                // Or just let the user reset? No, auto-reset is expected.
                
                // Better pattern: Set data. Then an effect on [data] triggers reset.
            }
        }
    }, [initialData]);

    // Auto-reset when data changes
    useEffect(() => {
        resetSimulation(true);
    }, [data]); // Trigger full reset when data object reference changes (loaded new automaton)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputString(e.target.value);
        // We need to reset simulation but keep input
        // We can't call resetSimulation(true) because it clears everything including potential state?
        // Actually resetSimulation(true) clears state. We want to restart from q0 with new input.
        // So we call resetSimulation(false) which recalculates initial closure.
        // But we need to update inputString state first.
        // The resetSimulation depends on inputString.
        // So we just setInputString. The effect or callback needs to handle it.
        // Let's keep manual call for now to be explicit.
    };
    
    // Fix: We need to trigger simulation reset when input changes, but we can't depend on inputString in the effect above
    // or it will reset on every keystroke (which is fine actually, live update).
    // But resetSimulation(false) is what we want.
    
    useEffect(() => {
        resetSimulation(false); 
    }, [inputString]); // Re-run simulation setup when input changes



    const clearInput = () => {
        setInputString('');
        resetSimulation(true);
        inputRef.current?.focus();
    };

    const findActiveTransitions = useCallback((fromStates: string[], symbol: string): string[] => {
        if (!symbol || !safeData.transicoes) return [];
        return safeData.transicoes
            .filter(t => fromStates.includes(t.de) && matchesSymbol(t.simbolo, symbol))
            .map(t => t.id);
    }, [safeData]);

    const step = useCallback(() => {
        if (hasInvalidInput || !safeData || !safeData.estados || !safeData.transicoes) {
            setIsPlaying(false);
            return;
        }

        let currentState = simulationState;

        if (!currentState) {
            const initialStates = safeData.estados.filter(e => e.isInicial).map(e => e.id);
            const activeStates = getEpsilonClosure(initialStates, safeData.transicoes);

            currentState = {
                activeStates,
                remainingInput: inputString,
                processedInput: '',
                status: 'running'
            };
            setSimulationState(currentState);
            setHistory([currentState]);
            return;
        }

        if (currentState.status !== 'running') return;

        if (currentState.remainingInput.length === 0) {
            const hasFinal = currentState.activeStates.some(id => safeData.estados.find(e => e.id === id)?.isFinal);
            const status: SimulationStep['status'] = hasFinal ? 'accepted' : 'rejected';
            const finalStep: SimulationStep = { ...currentState, status };
            setSimulationState(finalStep);
            setHistory(prev => {
                if (prev.length === 0) return [finalStep];
                const updated = [...prev];
                updated[updated.length - 1] = finalStep;
                return updated;
            });
            setIsPlaying(false);
            setActiveTransitions([]);

            if (status === 'accepted') {
                addToast('String aceita!', 'success');
            } else {
                addToast('String rejeitada', 'error');
            }
            return;
        }

        const currentSymbol = currentState.remainingInput[0];

        // Find active transitions for visual trace
        const transitions = findActiveTransitions(currentState.activeStates, currentSymbol);
        setActiveTransitions(transitions);

        const nextStatesArray = performStep(currentState.activeStates, currentSymbol, safeData.transicoes);

        const nextRemaining = currentState.remainingInput.slice(1);
        let status: 'running' | 'accepted' | 'rejected' = 'running';

        if (nextStatesArray.length === 0) {
            status = 'rejected';
            addToast('String rejeitada - sem transição válida', 'error');
        }

        const newStep: SimulationStep = {
            activeStates: nextStatesArray,
            remainingInput: nextRemaining,
            processedInput: currentState.processedInput + (currentSymbol || ''),
            status,
            symbol: currentSymbol,
            fromStates: currentState.activeStates,
            usedTransitions: transitions
        };

        if (nextRemaining.length === 0 && status === 'running') {
            const hasFinal = nextStatesArray.some(id => safeData.estados.find(e => e.id === id)?.isFinal);
            newStep.status = hasFinal ? 'accepted' : 'rejected';

            if (newStep.status === 'accepted') {
                addToast('String aceita!', 'success');
            } else {
                addToast('String rejeitada', 'error');
            }
        }

        setSimulationState(newStep);
        setHistory(prev => [...prev, newStep]);
        if (newStep.status !== 'running') {
            setIsPlaying(false);
        }
    }, [simulationState, safeData, inputString, findActiveTransitions, addToast, hasInvalidInput]);

    const stepBack = useCallback(() => {
        if (history.length <= 1) return;

        const newHistory = history.slice(0, -1);
        const previousState = newHistory[newHistory.length - 1];

        setHistory(newHistory);
        setSimulationState(previousState);
        setActiveTransitions(previousState.usedTransitions || []);
        setIsPlaying(false);
    }, [history]);

    useEffect(() => {
        let interval: number;
        if (isPlaying) {
            interval = setInterval(step, speed);
        }
        return () => clearInterval(interval);
    }, [isPlaying, step, speed]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
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
                        setIsPlaying(p => !p);
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
    }, [simulationState, isPlaying, step, stepBack, resetSimulation, hasInvalidInput]);

    const handleCanvasInteract = useCallback(() => {
        if (!simulationState && history.length === 0) return;
        resetSimulation(true);
        addToast('Edição no autômato reiniciou a simulação.', 'info');
    }, [simulationState, history.length, resetSimulation, addToast]);

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

    const stepCount = simulationState?.processedInput.length || 0;
    const totalSteps = inputString.length;

    return (
        <div className="absolute inset-x-0 bottom-0 top-24 animate-fade-in flex flex-col overflow-hidden">
            {/* Full Width Canvas Layer */}
            <div className="flex-1 relative z-0">
                <AutomatonEditor
                    data={safeData}
                    onChange={setData}
                    activeStates={simulationState?.activeStates}
                    activeTransitions={activeTransitions}
                    readOnly={!!simulationState && simulationState.processedInput.length > 0}
                    onInteract={handleCanvasInteract}
                />
            </div>

            {/* Floating Control Dock - Bottom Center */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col gap-4 w-full max-w-2xl px-4 pointer-events-none">

                {/* Visual Tape */}
                <div className={`glass-card p-4 transition-all duration-500 pointer-events-auto
                    ${inputString ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>

                    <div className="flex items-center justify-between mb-3 px-1">
                        <span className={`text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5
                             ${simulationState?.status === 'accepted' ? 'text-ios-green' :
                                simulationState?.status === 'rejected' ? 'text-ios-red' : 'text-gray-500'}`}>
                            {simulationState?.status === 'accepted' && <CheckCircle2 size={14} />}
                            {simulationState?.status === 'rejected' && <XCircle size={14} />}
                            {simulationState?.status === 'accepted' ? 'Aceito' : simulationState?.status === 'rejected' ? 'Rejeitado' : 'Fita de Leitura'}
                        </span>
                        <div className="flex items-center gap-3">
                            {history.length > 1 && (
                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                    <History size={12} />
                                    {history.length - 1} passos
                                </span>
                            )}
                            <span className="text-[11px] font-mono text-gray-500">
                                Passo {stepCount} / {totalSteps}
                            </span>
                        </div>
                    </div>

                    <div className="h-16 bg-white/20 dark:bg-black/20 rounded-xl border border-[var(--border-color)] flex items-center justify-center overflow-hidden relative shadow-inner backdrop-blur-sm">
                        <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-ios-blue z-10 h-full opacity-40"></div>
                        <div
                            className="flex gap-3 absolute transition-all duration-300 ease-out will-change-transform"
                            style={{ transform: `translateX(calc(50% - ${(simulationState?.processedInput.length || 0) * 44 + 22}px))` }}
                        >
                            {inputString.split('').map((char, i) => {
                                const processedLen = simulationState?.processedInput.length || 0;
                                const isCurrent = i === processedLen;
                                const isProcessed = i < processedLen;

                                return (
                                    <div
                                        key={i}
                                        className={`w-8 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-lg transition-all duration-300
                                            ${isCurrent
                                                ? 'bg-ios-blue text-white scale-125 shadow-lg z-20 ring-4 ring-blue-500/20'
                                                : (isProcessed
                                                    ? 'text-[var(--text-secondary)] opacity-40 scale-90 blur-[0.5px]'
                                                    : 'text-[var(--text-primary)] bg-white/40 dark:bg-white/5 border border-[var(--border-color)]')
                                            }`}
                                    >
                                        {char}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Active States Indicator */}
                    {simulationState && simulationState.activeStates.length > 0 && (
                        <div className="mt-3 flex items-center justify-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Estados ativos:</span>
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
                </div>

                {hasInvalidInput && (
                    <div className="glass-card px-4 py-3 text-xs text-ios-red flex items-center gap-2 pointer-events-auto">
                        <Info size={14} />
                        Entrada contém símbolos fora do alfabeto: {invalidSymbols.join(', ')}.
                    </div>
                )}

                {showDetails && (
                    <div className="glass-card p-4 pointer-events-auto">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                                <ListOrdered size={12} />
                                Detalhes
                            </span>
                            <span className="text-[10px] text-gray-500">
                                Alfabeto: {alphabet.length > 0 ? alphabet.join(', ') : 'vazio'}
                            </span>
                        </div>
                        <div className="max-h-48 overflow-auto space-y-2 custom-scrollbar">
                            {history.length === 0 ? (
                                <div className="text-xs text-gray-400">Sem execução ainda.</div>
                            ) : history.map((stepItem, index) => {
                                const statusLabel = stepItem.status === 'accepted'
                                    ? 'Aceito'
                                    : stepItem.status === 'rejected'
                                        ? 'Rejeitado'
                                        : 'Rodando';
                                const symbolLabel = stepItem.symbol ?? (index === 0 ? 'início' : '-');
                                const used = formatTransitions(stepItem.usedTransitions);
                                return (
                                    <div key={`${index}-${stepItem.processedInput}`} className="rounded-xl border border-[var(--border-color)] p-3 text-xs bg-white/40 dark:bg-black/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-[var(--text-primary)]">Passo {index}</span>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                                stepItem.status === 'accepted'
                                                    ? 'text-ios-green'
                                                    : stepItem.status === 'rejected'
                                                        ? 'text-ios-red'
                                                        : 'text-gray-500'
                                            }`}>
                                                {statusLabel}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-gray-500 font-mono mb-1">Símbolo: {symbolLabel}</div>
                                        <div className="text-[11px] text-gray-600">De: {formatStateList(stepItem.fromStates || stepItem.activeStates)}</div>
                                        <div className="text-[11px] text-gray-600">Para: {formatStateList(stepItem.activeStates)}</div>
                                        {used.length > 0 && (
                                            <div className="mt-2 text-[10px] text-gray-500 font-mono">
                                                Transições: {used.join(' | ')}
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
                    <div className={`flex-1 flex items-center bg-white/30 dark:bg-black/20 rounded-full px-4 py-1 border border-[var(--border-color)] focus-within:ring-2 transition-all ${
                        hasInvalidInput ? 'ring-2 ring-ios-red/40' : 'focus-within:ring-ios-blue/30'
                    }`}>
                        <Keyboard size={16} className="text-gray-500 mr-2" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputString}
                            onChange={handleInputChange}
                            placeholder="Digite a entrada..."
                            className="flex-1 bg-transparent border-none outline-none text-sm font-mono font-medium py-2 text-[var(--text-primary)] placeholder-gray-500/70"
                            aria-invalid={hasInvalidInput}
                        />
                        {inputString && (
                            <button onClick={clearInput} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-full hover:bg-black/5 transition-all">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-gray-400/30 dark:bg-white/10"></div>

                    {/* Playback Controls */}
                    <div className="flex items-center gap-1">
                        {/* Speed Trigger */}
                        <div className="flex bg-white/30 dark:bg-black/20 rounded-full p-1 border border-[var(--border-color)] mr-2">
                            {[1000, 500, 200].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setSpeed(s)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full text-[10px] font-bold transition-all
                                        ${speed === s
                                            ? 'bg-white dark:bg-gray-700 shadow-sm text-ios-blue scale-105'
                                            : 'text-gray-500 hover:text-[var(--text-primary)]'}`}
                                >
                                    {s === 1000 ? '1x' : s === 500 ? '2x' : <Zap size={12} />}
                                </button>
                            ))}
                        </div>

                        {/* Step Back */}
                        <button
                            onClick={stepBack}
                            disabled={history.length <= 1}
                            className="btn-icon text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Voltar (←)"
                        >
                            <SkipBack size={20} />
                        </button>

                        <button
                            onClick={() => resetSimulation()}
                            className="btn-icon text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/10"
                            title="Reiniciar (R)"
                        >
                            <RotateCcw size={20} />
                        </button>

                        <button
                            onClick={() => {
                                if (hasInvalidInput) return;
                                if (!simulationState) resetSimulation();
                                setIsPlaying(!isPlaying);
                            }}
                            disabled={hasInvalidInput}
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-95 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed
                                ${isPlaying ? 'bg-ios-orange shadow-orange-500/30' : 'bg-ios-blue shadow-blue-500/30'}`}
                        >
                            {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-1" />}
                        </button>

                        <button
                            onClick={() => { if (!simulationState) resetSimulation(); step(); }}
                            disabled={hasInvalidInput || isPlaying || (!!simulationState?.status && simulationState.status !== 'running')}
                            className="btn-icon text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30"
                            title="Avançar (→)"
                        >
                            <SkipForward size={22} />
                        </button>

                        <button
                            onClick={() => setShowDetails(s => !s)}
                            className={`btn-icon text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/10 ${
                                showDetails ? 'bg-ios-blue/10 text-ios-blue' : ''
                            }`}
                            title="Detalhes da simulação"
                        >
                            <ListOrdered size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
