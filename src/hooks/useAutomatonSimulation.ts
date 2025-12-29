/**
 * Hook for automaton simulation logic
 * Encapsulates all simulation state and operations for DFA, NFA, PDA, TM, etc.
 *
 * @module hooks/useAutomatonSimulation
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { AutomatoData, SimulationStep, Transicao } from '../types';
import { getEpsilonClosure } from '../utils/automatonLogic';
import { getPdaEpsilonClosure, performPdaStep } from '../utils/pda';
import {
    END_MARKER,
    performALLStep,
    performTuringStep,
    START_MARKER,
    buildTuringConfigKey
} from '../utils/turingLogic';
import { matchesSymbol, tokenizeInput } from '../utils/symbols';
import { getAlphabet } from '../utils/conversions';
import { TURING, SIMULATION } from '../constants/ui';

interface SimulationConfig {
    turingMaxSteps: number;
    turingDetectLoops: boolean;
}

interface TokenizationConfig {
    mode: 'auto' | 'char' | 'separator';
    separator: string;
}

interface UseAutomatonSimulationResult {
    // State
    simulationState: SimulationStep | null;
    isPlaying: boolean;
    speed: number;
    history: SimulationStep[];
    activeTransitions: string[];
    inputTokens: string[];
    alphabet: string[];
    invalidSymbols: string[];
    hasInvalidInput: boolean;

    // Computed
    isPda: boolean;
    isTuring: boolean;
    isAll: boolean;
    isMoore: boolean;
    isMealy: boolean;
    stateLabelMap: Map<string, string>;
    transitionMap: Map<string, Transicao>;

    // Actions
    setSpeed: (speed: number) => void;
    setIsPlaying: (playing: boolean) => void;
    resetSimulation: (fullReset?: boolean) => void;
    step: () => { finished: boolean; accepted?: boolean };
    stepBack: () => void;
    goToStart: () => void;
    formatPdaConfig: (key: string) => string;
}

const defaultConfig: SimulationConfig = {
    turingMaxSteps: TURING.MAX_STEPS,
    turingDetectLoops: TURING.DETECT_LOOPS
};

export function useAutomatonSimulation(
    automaton: AutomatoData | null,
    inputString: string,
    tokenizationConfig: TokenizationConfig,
    config: SimulationConfig = defaultConfig
): UseAutomatonSimulationResult {
    // Simulation State
    const [simulationState, setSimulationState] = useState<SimulationStep | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState<number>(SIMULATION.DEFAULT_SPEED);
    const [history, setHistory] = useState<SimulationStep[]>([]);
    const [activeTransitions, setActiveTransitions] = useState<string[]>([]);
    const turingSeenRef = useRef<Set<string>>(new Set());

    // Safe automaton access
    const safeData = automaton || {
        tipo: 'AFD' as const,
        estados: [],
        transicoes: [],
        descricao: 'Empty'
    };

    // Computed properties
    const isPda = safeData.tipo === 'AP';
    const isAll = safeData.tipo === 'ALL';
    const isTuring = safeData.tipo === 'MT' || safeData.tipo === 'ALL';
    const isMoore = safeData.tipo === 'Moore';
    const isMealy = safeData.tipo === 'Mealy';

    const inputTokens = useMemo(() =>
        tokenizeInput(inputString, tokenizationConfig),
        [inputString, tokenizationConfig]
    );

    const alphabet = useMemo(() =>
        safeData ? getAlphabet(safeData) : [],
        [safeData]
    );

    const stateLabelMap = useMemo(() => {
        const map = new Map<string, string>();
        safeData.estados.forEach(state => map.set(state.id, state.label || state.id));
        return map;
    }, [safeData.estados]);

    const transitionMap = useMemo(() => {
        const map = new Map<string, Transicao>();
        safeData.transicoes.forEach(t => map.set(t.id, t));
        return map;
    }, [safeData.transicoes]);

    const invalidSymbols = useMemo(() => {
        if (inputTokens.length === 0 || alphabet.length === 0) return [];
        const unique = new Set<string>();
        for (const symbol of inputTokens) {
            if (!alphabet.includes(symbol)) {
                unique.add(symbol);
            }
        }
        return Array.from(unique);
    }, [inputTokens, alphabet]);

    const hasInvalidInput = invalidSymbols.length > 0;

    // Helper functions
    const buildInitialPdaConfigs = useCallback(() => {
        if (!safeData.estados || !safeData.transicoes) return [];
        const initialStates = safeData.estados.filter(e => e.isInicial).map(e => e.id);
        const baseStack = safeData.simboloInicialPilha ? [safeData.simboloInicialPilha] : [];
        const configs = initialStates.map(id => ({ stateId: id, stack: [...baseStack] }));
        return getPdaEpsilonClosure(configs, safeData.transicoes);
    }, [safeData]);

    const findActiveTransitions = useCallback((fromStates: string[], symbol: string): string[] => {
        if (!symbol || !safeData.transicoes) return [];
        return safeData.transicoes
            .filter(t => fromStates.includes(t.de) && matchesSymbol(t.simbolo, symbol))
            .map(t => t.id);
    }, [safeData.transicoes]);

    const getMealyOutput = useCallback((transitionId: string): string => {
        const transition = transitionMap.get(transitionId);
        if (!transition) return '';
        if (transition.output !== undefined && transition.output !== '') {
            return transition.output;
        }
        const parts = transition.simbolo.split('/');
        if (parts.length >= 2) {
            return parts.slice(1).join('/').trim();
        }
        return '';
    }, [transitionMap]);

    const formatPdaConfig = useCallback((key: string): string => {
        const [stateId, stackRaw = ''] = key.split('::');
        const label = stateLabelMap.get(stateId) ?? stateId;
        const stack = stackRaw ? stackRaw.split(',').filter(Boolean).join('') : 'vazio';
        return `${label} [${stack || 'vazio'}]`;
    }, [stateLabelMap]);

    // Reset simulation
    const resetSimulation = useCallback((fullReset = false) => {
        setIsPlaying(false);
        setHistory([]);
        setActiveTransitions([]);
        turingSeenRef.current.clear();

        if (fullReset) {
            setSimulationState(null);
            return;
        }

        if (!safeData.estados || !safeData.transicoes) return;

        if (isPda) {
            const configs = buildInitialPdaConfigs();
            const activeStates = Array.from(new Set(configs.map(c => c.stateId)));
            const initialStep: SimulationStep = {
                activeStates,
                remainingInput: inputTokens,
                processedInput: [],
                status: 'running',
                activeConfigs: configs
            };
            setSimulationState(initialStep);
            setHistory([initialStep]);
            return;
        }

        if (isTuring) {
            const initialStates = safeData.estados.filter(e => e.isInicial).map(e => e.id);
            const tape: Record<number, string> = {};
            tape[0] = START_MARKER;
            inputTokens.forEach((token, i) => {
                tape[i + 1] = token;
            });
            if (isAll) {
                tape[inputTokens.length + 1] = END_MARKER;
            }

            const initialStep: SimulationStep = {
                activeStates: initialStates,
                remainingInput: [],
                processedInput: [],
                status: 'running',
                tape,
                headPos: 0
            };
            setSimulationState(initialStep);
            setHistory([initialStep]);
            if (initialStates.length > 0) {
                const key = buildTuringConfigKey(initialStates[0], tape, 0);
                turingSeenRef.current.add(key);
            }
            return;
        }

        // Regular automaton (DFA, NFA, Moore, Mealy)
        const initialStates = safeData.estados.filter(e => e.isInicial).map(e => e.id);
        const activeStates = getEpsilonClosure(initialStates, safeData.transicoes);

        let output: string[] | undefined;
        let outputStatus: SimulationStep['outputStatus'] = 'ok';
        if (isMoore) {
            if (activeStates.length === 1) {
                const out = safeData.estados.find(s => s.id === activeStates[0])?.output;
                if (out !== undefined && out !== '') {
                    output = [out];
                }
            } else {
                outputStatus = 'ambiguous';
                output = [];
            }
        } else if (isMealy) {
            output = [];
        }

        const initialStep: SimulationStep = {
            activeStates,
            remainingInput: inputTokens,
            processedInput: [],
            status: 'running',
            output,
            outputStatus
        };
        setSimulationState(initialStep);
        setHistory([initialStep]);
    }, [safeData, inputTokens, isPda, buildInitialPdaConfigs, isMoore, isMealy, isTuring, isAll]);

    // Step function
    const step = useCallback((): { finished: boolean; accepted?: boolean } => {
        if (hasInvalidInput || !safeData.estados || !safeData.transicoes) {
            setIsPlaying(false);
            return { finished: true, accepted: false };
        }

        let currentState = simulationState;

        if (!currentState) {
            resetSimulation(false);
            return { finished: false };
        }

        if (currentState.status !== 'running') {
            return { finished: true, accepted: currentState.status === 'accepted' };
        }

        // Check if input is exhausted
        if (currentState.remainingInput.length === 0 && !isTuring) {
            if (isPda) {
                const configs = currentState.activeConfigs ?? [];
                const hasFinal = configs.some(cfg =>
                    safeData.estados.find(e => e.id === cfg.stateId)?.isFinal
                );
                const hasEmpty = configs.some(cfg => cfg.stack.length === 0);
                const acceptance = safeData.pdaAcceptance ?? 'final';
                const accepted = acceptance === 'final' ? hasFinal
                    : acceptance === 'empty' ? hasEmpty
                    : hasFinal || hasEmpty;

                const finalStep: SimulationStep = {
                    ...currentState,
                    status: accepted ? 'accepted' : 'rejected'
                };
                setSimulationState(finalStep);
                setHistory(prev => {
                    if (prev.length === 0) return [finalStep];
                    const updated = [...prev];
                    updated[updated.length - 1] = finalStep;
                    return updated;
                });
                setIsPlaying(false);
                setActiveTransitions([]);
                return { finished: true, accepted };
            }

            const hasFinal = currentState.activeStates.some(id =>
                safeData.estados.find(e => e.id === id)?.isFinal
            );
            const finalStep: SimulationStep = {
                ...currentState,
                status: hasFinal ? 'accepted' : 'rejected'
            };
            setSimulationState(finalStep);
            setHistory(prev => {
                if (prev.length === 0) return [finalStep];
                const updated = [...prev];
                updated[updated.length - 1] = finalStep;
                return updated;
            });
            setIsPlaying(false);
            setActiveTransitions([]);
            return { finished: true, accepted: hasFinal };
        }

        const currentSymbol = currentState.remainingInput[0];

        // Turing Machine Logic
        if (isTuring) {
            if (config.turingMaxSteps > 0 && history.length >= config.turingMaxSteps) {
                const finalStep: SimulationStep = { ...currentState, status: 'rejected' };
                setSimulationState(finalStep);
                setHistory(prev => [...prev.slice(0, -1), finalStep]);
                setIsPlaying(false);
                return { finished: true, accepted: false };
            }

            const stateId = currentState.activeStates[0];
            const tape = currentState.tape ?? {};
            const headPos = currentState.headPos ?? 0;

            // For ALL, calculate boundaries
            const tapeKeys = Object.keys(tape).map(Number);
            const minIndex = tapeKeys.length > 0 ? Math.min(...tapeKeys) : 0;
            const maxIndex = tapeKeys.length > 0 ? Math.max(...tapeKeys) : inputTokens.length + 1;

            const stepResult = isAll
                ? performALLStep(stateId, tape, headPos, safeData.transicoes, minIndex, maxIndex)
                : performTuringStep(stateId, tape, headPos, safeData.transicoes);

            if (stepResult.status === 'rejected') {
                const hasFinal = safeData.estados.find(e => e.id === stateId)?.isFinal;
                const finalStep: SimulationStep = {
                    ...currentState,
                    status: hasFinal ? 'accepted' : 'rejected'
                };
                setSimulationState(finalStep);
                setHistory(prev => [...prev.slice(0, -1), finalStep]);
                setIsPlaying(false);
                return { finished: true, accepted: hasFinal ?? false };
            }

            if (config.turingDetectLoops) {
                const key = buildTuringConfigKey(stepResult.stateId, stepResult.tape, stepResult.headPos);
                if (turingSeenRef.current.has(key)) {
                    const finalStep: SimulationStep = { ...currentState, status: 'rejected' };
                    setSimulationState(finalStep);
                    setHistory(prev => [...prev.slice(0, -1), finalStep]);
                    setIsPlaying(false);
                    return { finished: true, accepted: false };
                }
                turingSeenRef.current.add(key);
            }

            const nextStep: SimulationStep = {
                activeStates: [stepResult.stateId],
                remainingInput: [],
                processedInput: [...currentState.processedInput, 'tm-step'],
                status: 'running',
                tape: stepResult.tape,
                headPos: stepResult.headPos,
                usedTransitions: stepResult.usedTransition ? [stepResult.usedTransition] : []
            };
            setSimulationState(nextStep);
            setHistory(prev => [...prev, nextStep]);
            setActiveTransitions(stepResult.usedTransition ? [stepResult.usedTransition] : []);
            return { finished: false };
        }

        // PDA Logic
        if (isPda) {
            const currentConfigs = currentState.activeConfigs ?? [];
            const result = performPdaStep(currentConfigs, currentSymbol, safeData.transicoes);

            if (result.configs.length === 0) {
                const finalStep: SimulationStep = { ...currentState, status: 'rejected' };
                setSimulationState(finalStep);
                setHistory(prev => [...prev.slice(0, -1), finalStep]);
                setIsPlaying(false);
                setActiveTransitions([]);
                return { finished: true, accepted: false };
            }

            const nextStep: SimulationStep = {
                activeStates: Array.from(new Set(result.configs.map(c => c.stateId))),
                remainingInput: currentState.remainingInput.slice(1),
                processedInput: [...currentState.processedInput, currentSymbol],
                status: 'running',
                activeConfigs: result.configs,
                pdaEdges: result.edges
            };
            setSimulationState(nextStep);
            setHistory(prev => [...prev, nextStep]);
            setActiveTransitions(result.usedTransitions);
            return { finished: false };
        }

        // Regular Automaton Logic (DFA, NFA, Moore, Mealy)
        const usedTransitions = findActiveTransitions(currentState.activeStates, currentSymbol);
        const directTargets = new Set<string>();
        usedTransitions.forEach(tId => {
            const transition = transitionMap.get(tId);
            if (transition) directTargets.add(transition.para);
        });

        if (directTargets.size === 0) {
            const finalStep: SimulationStep = { ...currentState, status: 'rejected' };
            setSimulationState(finalStep);
            setHistory(prev => [...prev.slice(0, -1), finalStep]);
            setIsPlaying(false);
            setActiveTransitions([]);
            return { finished: true, accepted: false };
        }

        const nextActiveStates = getEpsilonClosure(Array.from(directTargets), safeData.transicoes);

        let nextOutput = currentState.output ? [...currentState.output] : undefined;
        let nextOutputStatus = currentState.outputStatus;

        if (isMoore && nextActiveStates.length > 0) {
            if (nextActiveStates.length === 1) {
                const out = safeData.estados.find(s => s.id === nextActiveStates[0])?.output;
                if (out !== undefined && out !== '') {
                    nextOutput = [...(nextOutput ?? []), out];
                }
            } else {
                nextOutputStatus = 'ambiguous';
            }
        } else if (isMealy && usedTransitions.length > 0) {
            if (usedTransitions.length === 1) {
                const out = getMealyOutput(usedTransitions[0]);
                if (out) {
                    nextOutput = [...(nextOutput ?? []), out];
                }
            } else {
                nextOutputStatus = 'ambiguous';
            }
        }

        const nextStep: SimulationStep = {
            activeStates: nextActiveStates,
            remainingInput: currentState.remainingInput.slice(1),
            processedInput: [...currentState.processedInput, currentSymbol],
            status: 'running',
            symbol: currentSymbol,
            fromStates: currentState.activeStates,
            usedTransitions,
            directTargets: Array.from(directTargets),
            output: nextOutput,
            outputStatus: nextOutputStatus
        };
        setSimulationState(nextStep);
        setHistory(prev => [...prev, nextStep]);
        setActiveTransitions(usedTransitions);
        return { finished: false };
    }, [
        simulationState, hasInvalidInput, safeData, isTuring, isAll,
        isPda, isMoore, isMealy, history, config,
        buildInitialPdaConfigs, findActiveTransitions, getMealyOutput,
        transitionMap, resetSimulation
    ]);

    // Step back
    const stepBack = useCallback(() => {
        if (history.length <= 1) return;
        setIsPlaying(false);
        const newHistory = history.slice(0, -1);
        setHistory(newHistory);
        setSimulationState(newHistory[newHistory.length - 1]);
        setActiveTransitions([]);
    }, [history]);

    // Go to start
    const goToStart = useCallback(() => {
        if (history.length === 0) return;
        setIsPlaying(false);
        const firstStep = history[0];
        setHistory([firstStep]);
        setSimulationState(firstStep);
        setActiveTransitions([]);
    }, [history]);

    // Reset when automaton changes
    useEffect(() => {
        resetSimulation(true);
    }, [automaton]);

    return {
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
        goToStart,
        formatPdaConfig
    };
}
