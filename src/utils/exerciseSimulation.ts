import type { AutomatoData, AutomatoTipo, GrammarTree, APData } from '../types';
import { isAP } from '../types';
import { getEpsilonClosure, performStep } from './automatonLogic';
import { getPdaEpsilonClosure, performPdaStep } from './pda';
import { buildTuringConfigKey, END_MARKER, performALLStep, performTuringStep, START_MARKER } from './turingLogic';
import { matchesSymbol, tokenizeInput, type TokenizationOptions } from './symbols';

export interface SimulationResult {
    status: 'accepted' | 'rejected';
    reason?: string;
    finalStates: string[];
    tree?: GrammarTree;
}

export interface SimulationTraceStep {
    symbol: string;
    fromStates: string[];
    directTargets: string[];
    toStates: string[];
}

export const createEmptyAutomaton = (tipo: AutomatoTipo): AutomatoData => {
    const baseState = { id: 'q0', label: 'q0', x: 200, y: 200, isInicial: true, isFinal: false };

    if (tipo === 'AP') {
        const pdaAutomaton: APData = {
            tipo: 'AP',
            estados: [baseState],
            transicoes: [],
            alfabeto: [],
            alfabetoPilha: [],
            simboloInicialPilha: 'Z',
            pdaAcceptance: 'empty'
        };
        return pdaAutomaton;
    }

    return {
        tipo,
        estados: [baseState],
        transicoes: [],
        alfabeto: tipo === 'MT' || tipo === 'ALL' ? [] : undefined
    } as AutomatoData;
};

export const simulateAutomaton = (
    automaton: AutomatoData,
    input: string,
    tokenOptions?: TokenizationOptions
): SimulationResult => {
    const initialStates = automaton.estados.filter(e => e.isInicial).map(e => e.id);
    if (initialStates.length === 0) {
        return { status: 'rejected', reason: 'Nenhum estado inicial definido', finalStates: [] };
    }

    let currentStates = getEpsilonClosure(initialStates, automaton.transicoes);

    const tokens = tokenizeInput(input, tokenOptions);
    for (const symbol of tokens) {
        const nextStates = performStep(currentStates, symbol, automaton.transicoes);
        if (nextStates.length === 0) {
            return {
                status: 'rejected',
                reason: `Sem transicao valida para "${symbol}"`,
                finalStates: []
            };
        }
        currentStates = nextStates;
    }

    const hasFinal = currentStates.some(id =>
        automaton.estados.find(e => e.id === id)?.isFinal
    );

    return {
        status: hasFinal ? 'accepted' : 'rejected',
        reason: hasFinal ? undefined : 'Nenhum estado final foi alcancado',
        finalStates: currentStates
    };
};

export const simulateWithTrace = (
    automaton: AutomatoData,
    input: string,
    tokenOptions?: TokenizationOptions
): { result: SimulationResult; trace: SimulationTraceStep[] } => {
    const initialStates = automaton.estados.filter(e => e.isInicial).map(e => e.id);
    if (initialStates.length === 0) {
        return {
            result: { status: 'rejected', reason: 'Nenhum estado inicial definido', finalStates: [] },
            trace: []
        };
    }

    let currentStates = getEpsilonClosure(initialStates, automaton.transicoes);
    const tokens = tokenizeInput(input, tokenOptions);
    const trace: SimulationTraceStep[] = [];

    for (const symbol of tokens) {
        const directTargets = new Set<string>();
        for (const stateId of currentStates) {
            const relevantTransitions = automaton.transicoes.filter(t => t.de === stateId);
            for (const t of relevantTransitions) {
                if (matchesSymbol(t.simbolo, symbol)) {
                    directTargets.add(t.para);
                }
            }
        }
        const nextStates = getEpsilonClosure(Array.from(directTargets), automaton.transicoes);
        trace.push({
            symbol,
            fromStates: currentStates,
            directTargets: Array.from(directTargets),
            toStates: nextStates
        });

        if (nextStates.length === 0) {
            return {
                result: { status: 'rejected', reason: `Sem transicao valida para "${symbol}"`, finalStates: [] },
                trace
            };
        }

        currentStates = nextStates;
    }

    const hasFinal = currentStates.some(id =>
        automaton.estados.find(e => e.id === id)?.isFinal
    );

    return {
        result: {
            status: hasFinal ? 'accepted' : 'rejected',
            reason: hasFinal ? undefined : 'Nenhum estado final foi alcancado',
            finalStates: currentStates
        },
        trace
    };
};

export const simulatePda = (
    automaton: AutomatoData,
    input: string,
    tokenOptions?: TokenizationOptions
): SimulationResult => {
    const initialStates = automaton.estados.filter(e => e.isInicial).map(e => e.id);
    if (initialStates.length === 0) {
        return { status: 'rejected', reason: 'Nenhum estado inicial definido', finalStates: [] };
    }

    // Get PDA-specific properties safely
    const simboloInicialPilha = isAP(automaton) ? automaton.simboloInicialPilha : undefined;
    const baseStack = simboloInicialPilha ? [simboloInicialPilha] : [];
    const configs = initialStates.map(id => ({ stateId: id, stack: [...baseStack] }));
    let currentConfigs = getPdaEpsilonClosure(configs, automaton.transicoes);

    const tokens = tokenizeInput(input, tokenOptions);
    for (const symbol of tokens) {
        const result = performPdaStep(currentConfigs, symbol, automaton.transicoes);
        currentConfigs = result.configs;
        if (currentConfigs.length === 0) {
            return {
                status: 'rejected',
                reason: `Sem transicao valida para "${symbol}"`,
                finalStates: []
            };
        }
    }

    const hasFinal = currentConfigs.some(cfg => automaton.estados.find(e => e.id === cfg.stateId)?.isFinal);
    const hasEmpty = currentConfigs.some(cfg => cfg.stack.length === 0);
    const acceptance = isAP(automaton) ? (automaton.pdaAcceptance ?? 'final') : 'final';
    const accepted = acceptance === 'final'
        ? hasFinal
        : acceptance === 'empty'
            ? hasEmpty
            : hasFinal || hasEmpty;

    return {
        status: accepted ? 'accepted' : 'rejected',
        reason: accepted ? undefined : 'Nenhuma configuracao final ou pilha vazia',
        finalStates: Array.from(new Set(currentConfigs.map(cfg => cfg.stateId)))
    };
};

export const simulateTuring = (
    automaton: AutomatoData,
    input: string,
    tokenOptions?: TokenizationOptions
): SimulationResult => {
    const initial = automaton.estados.find(e => e.isInicial);
    if (!initial) {
        return { status: 'rejected', reason: 'Nenhum estado inicial definido', finalStates: [] };
    }
    const isAll = automaton.tipo === 'ALL';
    const tokens = tokenizeInput(input, tokenOptions);

    const tape: Record<number, string> = { 0: START_MARKER };
    tokens.forEach((token, idx) => {
        tape[idx + 1] = token;
    });
    if (isAll) {
        tape[tokens.length + 1] = END_MARKER;
    }

    let stateId = initial.id;
    let headPos = 0;
    const maxSteps = 400;
    const seen = new Set<string>();

    for (let step = 0; step < maxSteps; step += 1) {
        if (automaton.estados.find(e => e.id === stateId)?.isFinal) {
            return { status: 'accepted', finalStates: [stateId] };
        }

        const result = isAll
            ? performALLStep(stateId, tape, headPos, automaton.transicoes, 0, tokens.length + 1)
            : performTuringStep(stateId, tape, headPos, automaton.transicoes);

        if (result.status === 'rejected') {
            return {
                status: 'rejected',
                reason: isAll ? 'Cabeca saiu dos limites ou nao ha transicao' : 'Sem transicao valida',
                finalStates: [stateId]
            };
        }

        stateId = result.stateId;
        headPos = result.headPos;
        Object.keys(tape).forEach(key => delete tape[Number(key)]);
        Object.entries(result.tape).forEach(([key, value]) => {
            tape[Number(key)] = value;
        });

        const key = buildTuringConfigKey(stateId, tape, headPos);
        if (seen.has(key)) {
            return { status: 'rejected', reason: 'Loop detectado', finalStates: [stateId] };
        }
        seen.add(key);
    }

    return { status: 'rejected', reason: 'Limite de passos atingido', finalStates: [stateId] };
};
