import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AutomatonEditor } from '../components/automaton/AutomatonEditor';
import type { AutomatoData, SimulationStep } from '../types';
import { Play, Pause, SkipForward, RotateCcw, CheckCircle2, XCircle, X, Zap, Keyboard } from 'lucide-react';
import { getEpsilonClosure, performStep } from '../utils/automatonLogic';

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
    const [data, setData] = useState<AutomatoData>(initialData || emptyAutomaton);
    const [inputString, setInputString] = useState('');
    const [simulationState, setSimulationState] = useState<SimulationStep | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1000);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialData) {
            setData(prev => {
                if (JSON.stringify(prev) === JSON.stringify(initialData)) return prev;
                return initialData;
            });
            resetSimulation(true);
        }
    }, [initialData]);

    const resetSimulation = useCallback((fullReset = false) => {
        setIsPlaying(false);
        if (fullReset) {
            setSimulationState(null);
            setInputString('');
        } else {
            const initialStates = data.estados.filter(e => e.isInicial).map(e => e.id);
            // Calculate epsilon closure for initial states
            const activeStates = getEpsilonClosure(initialStates, data.transicoes);

            setSimulationState({
                activeStates,
                remainingInput: inputString,
                processedInput: '',
                status: 'running'
            });
        }
    }, [data, inputString]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputString(e.target.value);
        setSimulationState(null);
        setIsPlaying(false);
    };

    const clearInput = () => {
        setInputString('');
        setSimulationState(null);
        setIsPlaying(false);
        inputRef.current?.focus();
    };

    const step = useCallback(() => {
        let currentState = simulationState;

        if (!currentState) {
            const initialStates = data.estados.filter(e => e.isInicial).map(e => e.id);
            const activeStates = getEpsilonClosure(initialStates, data.transicoes);

            currentState = {
                activeStates,
                remainingInput: inputString,
                processedInput: '',
                status: 'running'
            };
            setSimulationState(currentState);
            return;
        }

        if (currentState.status !== 'running') return;

        const currentSymbol = currentState.remainingInput[0];

        // Use the new logic to calculate next states including epsilon closures
        const nextStatesArray = performStep(currentState.activeStates, currentSymbol, data.transicoes);

        const nextRemaining = currentState.remainingInput.slice(1);
        let status: 'running' | 'accepted' | 'rejected' = 'running';

        // Check acceptance conditions
        if (currentState.remainingInput.length === 0) {
            const hasFinal = currentState.activeStates.some(id => data.estados.find(e => e.id === id)?.isFinal);
            status = hasFinal ? 'accepted' : 'rejected';
            setSimulationState(prev => prev ? { ...prev, status } : null);
            setIsPlaying(false);
            return;
        }

        if (nextStatesArray.length === 0) {
            status = 'rejected';
        }

        const newStep: SimulationStep = {
            activeStates: nextStatesArray,
            remainingInput: nextRemaining,
            processedInput: currentState.processedInput + (currentSymbol || ''),
            status
        };

        // If we just consumed the last character, check if we landed on a final state
        if (nextRemaining.length === 0 && status === 'running') {
            const hasFinal = nextStatesArray.some(id => data.estados.find(e => e.id === id)?.isFinal);
            newStep.status = hasFinal ? 'accepted' : 'rejected';
        }

        setSimulationState(newStep);
        if (newStep.status !== 'running') setIsPlaying(false);
    }, [simulationState, data, inputString]);

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
                    resetSimulation();
                    setIsPlaying(true);
                }
                return;
            }

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    if (!simulationState) resetSimulation();
                    setIsPlaying(p => !p);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    setIsPlaying(false);
                    step();
                    break;
                case 'KeyR':
                    resetSimulation();
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [simulationState, isPlaying, step, resetSimulation]);

    return (
        // Container ocupa a tela inteira menos o navbar (considerando layout pai)
        <div className="absolute inset-x-0 bottom-0 top-24 animate-fade-in flex flex-col overflow-hidden">

            {/* Full Width Canvas Layer - Transparent to show global background */}
            <div className="flex-1 relative z-0">
                <AutomatonEditor
                    data={data}
                    onChange={setData}
                    activeStates={simulationState?.activeStates}
                    readOnly={!!simulationState && simulationState.processedInput.length > 0}
                    onInteract={() => { if (simulationState) resetSimulation(true); }}
                />
            </div>

            {/* Floating Control Dock - Bottom Center */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col gap-4 w-full max-w-2xl px-4 pointer-events-none">

                {/* 1. Visual Tape - Só aparece quando tem input */}
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
                        <span className="text-[11px] font-mono text-gray-500">
                            {simulationState ? simulationState.processedInput.length : 0} / {inputString.length}
                        </span>
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
                </div>

                {/* 2. Controls Bar */}
                <div className="glass-dock p-2 flex items-center justify-between gap-4 pointer-events-auto">

                    {/* Input Field Area */}
                    <div className="flex-1 flex items-center bg-white/30 dark:bg-black/20 rounded-full px-4 py-1 border border-[var(--border-color)] focus-within:ring-2 focus-within:ring-ios-blue/30 transition-all">
                        <Keyboard size={16} className="text-gray-500 mr-2" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputString}
                            onChange={handleInputChange}
                            placeholder="Digite a entrada..."
                            className="flex-1 bg-transparent border-none outline-none text-sm font-mono font-medium py-2 text-[var(--text-primary)] placeholder-gray-500/70"
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

                        <button
                            onClick={() => resetSimulation()}
                            className="btn-icon text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/10"
                            title="Reiniciar (R)"
                        >
                            <RotateCcw size={20} />
                        </button>

                        <button
                            onClick={() => { if (!simulationState) resetSimulation(); setIsPlaying(!isPlaying); }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-95 hover:scale-105
                                ${isPlaying ? 'bg-ios-orange shadow-orange-500/30' : 'bg-ios-blue shadow-blue-500/30'}`}
                        >
                            {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-1" />}
                        </button>

                        <button
                            onClick={() => { if (!simulationState) resetSimulation(); step(); }}
                            disabled={isPlaying || (!!simulationState?.status && simulationState.status !== 'running')}
                            className="btn-icon text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30"
                        >
                            <SkipForward size={22} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};