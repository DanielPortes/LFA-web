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
    currentHistoryIndex: number;
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
    goToHistoryStep: (index: number) => void;
    formatPdaConfig: (key: string) => string;
}

const getSimulationStepTransitionIds = (stepItem: SimulationStep): string[] => {
    const pdaTransitionIds = stepItem.pdaEdges
        ?.map((edge) => edge.transitionId)
        .filter((transitionId): transitionId is string => Boolean(transitionId)) ?? [];

    return stepItem.usedTransitions ?? pdaTransitionIds;
};

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
    const [historyCursor, setHistoryCursor] = useState(-1);
    const [activeTransitions, setActiveTransitions] = useState<string[]>([]);
    const turingSeenRef = useRef<Set<string>>(new Set());

    // Safe automaton access
    const safeData = useMemo<AutomatoData>(() => (
        automaton || {
            tipo: 'AFD' as const,
            estados: [],
            transicoes: [],
            descricao: 'Empty'
        }
    ), [automaton]);

    // Computed properties
    const isPda = safeData.tipo === 'AP';
    const isAll = safeData.tipo === 'ALL';
    const isTuring = safeData.tipo === 'MT' || safeData.tipo === 'ALL';
    const isMoore = safeData.tipo === 'Moore';
    const isMealy = safeData.tipo === 'Mealy';
    const tokenizationMode = tokenizationConfig.mode;
    const tokenizationSeparator = tokenizationConfig.separator;

    const inputTokens = useMemo(() =>
        tokenizeInput(inputString, { mode: tokenizationMode, separator: tokenizationSeparator }),
        [inputString, tokenizationMode, tokenizationSeparator]
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

    const currentHistoryIndex = useMemo(() => {
        if (history.length === 0) return -1;
        if (!Number.isInteger(historyCursor)) return history.length - 1;
        return Math.min(Math.max(historyCursor, 0), history.length - 1);
    }, [history.length, historyCursor]);

    // Helper functions
    const buildInitialPdaConfigs = useCallback(() => {
        if (!safeData.estados || !safeData.transicoes) return [];
        const initialStates = safeData.estados.filter(e => e.isInicial).map(e => e.id);
        // Use type narrowing - only PDA has simboloInicialPilha
        const simboloInicialPilha = isPda && 'simboloInicialPilha' in safeData ? safeData.simboloInicialPilha : undefined;
        const baseStack = simboloInicialPilha ? [simboloInicialPilha] : [];
        const configs = initialStates.map(id => ({ stateId: id, stack: [...baseStack] }));
        return getPdaEpsilonClosure(configs, safeData.transicoes);
    }, [safeData, isPda]);

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

    const rebuildTuringSeenFromHistory = useCallback((steps: SimulationStep[]) => {
        if (!isTuring) {
            turingSeenRef.current.clear();
            return;
        }

        const rebuilt = new Set<string>();
        steps.forEach((stepItem) => {
            const stateId = stepItem.activeStates[0];
            if (!stateId || !stepItem.tape) return;
            rebuilt.add(buildTuringConfigKey(stateId, stepItem.tape, stepItem.headPos ?? 0));
        });
        turingSeenRef.current = rebuilt;
    }, [isTuring]);

    // Reset simulation
    const resetSimulation = useCallback((fullReset = false) => {
        setIsPlaying(false);
        setHistory([]);
        setHistoryCursor(-1);
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
            setHistoryCursor(0);
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
            setHistoryCursor(0);
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
        setHistoryCursor(0);
    }, [safeData, inputTokens, isPda, buildInitialPdaConfigs, isMoore, isMealy, isTuring, isAll]);

    // Step function
    const step = useCallback((): { finished: boolean; accepted?: boolean } => {
        if (hasInvalidInput || !safeData.estados || !safeData.transicoes) {
            setIsPlaying(false);
            return { finished: true, accepted: false };
        }

        const currentState = simulationState;

        if (!currentState) {
            resetSimulation(false);
            return { finished: false };
        }

        if (currentState.status !== 'running') {
            return { finished: true, accepted: currentState.status === 'accepted' };
        }

        const currentHistoryPrefix = currentHistoryIndex >= 0
            ? history.slice(0, currentHistoryIndex + 1)
            : [];
        const replaceCurrentHistoryStep = (finalStep: SimulationStep) => {
            const updated = currentHistoryPrefix.length > 0
                ? [...currentHistoryPrefix]
                : [finalStep];
            updated[updated.length - 1] = finalStep;
            setHistory(updated);
            setHistoryCursor(updated.length - 1);
        };
        const appendHistoryStep = (nextStep: SimulationStep) => {
            const baseHistory = currentHistoryPrefix.length > 0 ? currentHistoryPrefix : history;
            const updated = [...baseHistory, nextStep];
            setHistory(updated);
            setHistoryCursor(updated.length - 1);
        };

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
                replaceCurrentHistoryStep(finalStep);
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
            replaceCurrentHistoryStep(finalStep);
            setIsPlaying(false);
            setActiveTransitions([]);
            return { finished: true, accepted: hasFinal };
        }

        const currentSymbol = currentState.remainingInput[0];

        // Turing Machine Logic
        if (isTuring) {
            const activeHistoryLength = currentHistoryPrefix.length || history.length;
            if (config.turingMaxSteps > 0 && activeHistoryLength >= config.turingMaxSteps) {
                const finalStep: SimulationStep = { ...currentState, status: 'rejected' };
                setSimulationState(finalStep);
                replaceCurrentHistoryStep(finalStep);
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
                replaceCurrentHistoryStep(finalStep);
                setIsPlaying(false);
                return { finished: true, accepted: hasFinal ?? false };
            }

            if (config.turingDetectLoops) {
                const key = buildTuringConfigKey(stepResult.stateId, stepResult.tape, stepResult.headPos);
                if (turingSeenRef.current.has(key)) {
                    const finalStep: SimulationStep = { ...currentState, status: 'rejected' };
                    setSimulationState(finalStep);
                    replaceCurrentHistoryStep(finalStep);
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
            appendHistoryStep(nextStep);
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
                replaceCurrentHistoryStep(finalStep);
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
            appendHistoryStep(nextStep);
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
            replaceCurrentHistoryStep(finalStep);
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
        appendHistoryStep(nextStep);
        setActiveTransitions(usedTransitions);
        return { finished: false };
    }, [
        simulationState, hasInvalidInput, safeData, isTuring, isAll,
        isPda, isMoore, isMealy, history, currentHistoryIndex, config,
        findActiveTransitions, getMealyOutput,
        transitionMap, resetSimulation, inputTokens.length
    ]);

    useEffect(() => {
        if (!isPlaying) return;
        if (hasInvalidInput) {
            setIsPlaying(false);
            return;
        }

        const delay = Math.max(50, speed);
        const timer = window.setInterval(() => {
            const result = step();
            if (result.finished) {
                setIsPlaying(false);
            }
        }, delay);

        return () => window.clearInterval(timer);
    }, [isPlaying, hasInvalidInput, speed, step]);

    // Step back
    const stepBack = useCallback(() => {
        if (currentHistoryIndex <= 0) return;
        setIsPlaying(false);
        const nextIndex = currentHistoryIndex - 1;
        const targetStep = history[nextIndex];
        setHistoryCursor(nextIndex);
        setSimulationState(targetStep);
        setActiveTransitions(getSimulationStepTransitionIds(targetStep));
        rebuildTuringSeenFromHistory(history.slice(0, nextIndex + 1));
    }, [currentHistoryIndex, history, rebuildTuringSeenFromHistory]);

    // Go to start
    const goToStart = useCallback(() => {
        if (history.length === 0) return;
        setIsPlaying(false);
        const firstStep = history[0];
        setHistoryCursor(0);
        setSimulationState(firstStep);
        setActiveTransitions(getSimulationStepTransitionIds(firstStep));
        rebuildTuringSeenFromHistory([firstStep]);
    }, [history, rebuildTuringSeenFromHistory]);

    const goToHistoryStep = useCallback((index: number) => {
        if (!Number.isInteger(index)) return;
        if (index < 0 || index >= history.length) return;

        setIsPlaying(false);
        const targetStep = history[index];

        setHistoryCursor(index);
        setSimulationState(targetStep);
        setActiveTransitions(getSimulationStepTransitionIds(targetStep));
        rebuildTuringSeenFromHistory(history.slice(0, index + 1));
    }, [history, rebuildTuringSeenFromHistory]);

    const resetSimulationRef = useRef(resetSimulation);
    useEffect(() => {
        resetSimulationRef.current = resetSimulation;
    }, [resetSimulation]);

    // Reset only when automaton source changes
    useEffect(() => {
        resetSimulationRef.current(true);
    }, [automaton]);

    return {
        simulationState,
        isPlaying,
        speed,
        history,
        currentHistoryIndex,
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
        goToHistoryStep,
        formatPdaConfig
    };
}
