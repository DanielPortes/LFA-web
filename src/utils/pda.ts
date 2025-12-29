import type { Transicao } from '../types';
import { EPSILON_SYMBOL, isEpsilonToken, normalizeToken } from './symbols';

export interface PdaTransitionParsed {
    input: string | null;
    pop: string | null;
    push: string[];
}

export interface PdaConfiguration {
    stateId: string;
    stack: string[];
}

interface PdaLimits {
    maxConfigs?: number;
    maxStack?: number;
    maxEpsilonSteps?: number;
}

const DEFAULT_LIMITS: Required<PdaLimits> = {
    maxConfigs: 2000,
    maxStack: 40,
    maxEpsilonSteps: 200
};

const normalizeSymbol = (value: string) => normalizeToken(value);

const splitOnArrow = (raw: string): [string, string] | null => {
    const arrowMatch = raw.includes('->') ? '->' : (raw.includes('\u2192') ? '\u2192' : null);
    if (!arrowMatch) return null;
    const parts = raw.split(arrowMatch);
    if (parts.length < 2) return null;
    return [parts[0], parts.slice(1).join(arrowMatch)];
};

const parseStackSymbols = (raw: string): string[] => {
    const trimmed = normalizeSymbol(raw);
    if (!trimmed || isEpsilonToken(trimmed)) return [];
    if (/[,\s]/.test(trimmed)) {
        return trimmed
            .split(/[,\s]+/)
            .map(normalizeSymbol)
            .filter((token) => token.length > 0);
    }
    return trimmed.split('').map(normalizeSymbol).filter((token) => token.length > 0);
};

export const parsePdaTransition = (raw: string): PdaTransitionParsed | null => {
    const trimmed = normalizeSymbol(raw);
    if (!trimmed) return null;
    const arrowSplit = splitOnArrow(trimmed);
    if (!arrowSplit) return null;
    const [left, right] = arrowSplit;
    const leftParts = left.split(',');
    if (leftParts.length < 2) return null;
    const inputRaw = normalizeSymbol(leftParts[0]);
    const popRaw = normalizeSymbol(leftParts.slice(1).join(','));
    const pushRaw = normalizeSymbol(right);

    const input = inputRaw && !isEpsilonToken(inputRaw) ? inputRaw : null;
    const pop = popRaw && !isEpsilonToken(popRaw) ? popRaw : null;
    const push = parseStackSymbols(pushRaw);
    return { input, pop, push };
};

export const formatPdaTransition = (parsed: PdaTransitionParsed): string => {
    const input = parsed.input ?? EPSILON_SYMBOL;
    const pop = parsed.pop ?? EPSILON_SYMBOL;
    const push = parsed.push.length > 0 ? parsed.push.join('') : EPSILON_SYMBOL;
    return `${input}, ${pop} -> ${push}`;
};

const configKey = (config: PdaConfiguration) => `${config.stateId}::${config.stack.join(',')}`;

const clampStack = (stack: string[], maxStack: number): string[] | null => {
    if (stack.length > maxStack) return null;
    return stack;
};

const applyTransition = (
    config: PdaConfiguration,
    parsed: PdaTransitionParsed,
    targetState: string
): PdaConfiguration | null => {
    const nextStack = [...config.stack];
    if (parsed.pop) {
        const top = nextStack[nextStack.length - 1];
        if (!top || top !== parsed.pop) return null;
        nextStack.pop();
    }

    if (parsed.push.length > 0) {
        for (let i = parsed.push.length - 1; i >= 0; i -= 1) {
            nextStack.push(parsed.push[i]);
        }
    }

    return { stateId: targetState, stack: nextStack };
};

const collectTransitionsByState = (transitions: Transicao[]): Map<string, Transicao[]> => {
    const map = new Map<string, Transicao[]>();
    transitions.forEach((t) => {
        const list = map.get(t.de) ?? [];
        list.push(t);
        map.set(t.de, list);
    });
    return map;
};

export const getPdaInputAlphabet = (transitions: Transicao[]): string[] => {
    const alphabet = new Set<string>();
    transitions.forEach((t) => {
        const parsed = parsePdaTransition(t.simbolo);
        if (parsed?.input) {
            alphabet.add(parsed.input);
        }
    });
    return Array.from(alphabet);
};

export const getPdaStackAlphabet = (transitions: Transicao[]): string[] => {
    const alphabet = new Set<string>();
    transitions.forEach((t) => {
        const parsed = parsePdaTransition(t.simbolo);
        if (parsed?.pop) alphabet.add(parsed.pop);
        parsed?.push.forEach((symbol) => alphabet.add(symbol));
    });
    return Array.from(alphabet);
};

export const getPdaEpsilonClosure = (
    configs: PdaConfiguration[],
    transitions: Transicao[],
    limits: PdaLimits = {}
): PdaConfiguration[] => {
    const { maxConfigs, maxStack, maxEpsilonSteps } = { ...DEFAULT_LIMITS, ...limits };
    const byState = collectTransitionsByState(transitions);
    const queue: PdaConfiguration[] = [...configs];
    const visited = new Map<string, PdaConfiguration>();
    let steps = 0;

    queue.forEach((config) => visited.set(configKey(config), config));

    while (queue.length > 0) {
        const current = queue.shift()!;
        const stateTransitions = byState.get(current.stateId) ?? [];
        for (const t of stateTransitions) {
            const parsed = parsePdaTransition(t.simbolo);
            if (!parsed || parsed.input !== null) continue;
            const next = applyTransition(current, parsed, t.para);
            if (!next) continue;
            const clamped = clampStack(next.stack, maxStack);
            if (!clamped) continue;
            next.stack = clamped;
            const key = configKey(next);
            if (!visited.has(key)) {
                visited.set(key, next);
                queue.push(next);
                steps += 1;
                if (visited.size >= maxConfigs || steps >= maxEpsilonSteps) {
                    return Array.from(visited.values());
                }
            }
        }
    }
    return Array.from(visited.values());
};

export interface PdaStepResult {
    configs: PdaConfiguration[];
    usedTransitions: string[];
    directTargets: string[];
    edges: { from: string; to: string; transitionId: string }[];
}

export const performPdaStep = (
    configs: PdaConfiguration[],
    inputSymbol: string,
    transitions: Transicao[],
    limits: PdaLimits = {}
): PdaStepResult => {
    const { maxConfigs, maxStack } = { ...DEFAULT_LIMITS, ...limits };
    const byState = collectTransitionsByState(transitions);
    const startClosure = getPdaEpsilonClosure(configs, transitions, limits);
    const nextMap = new Map<string, PdaConfiguration>();
    const usedTransitions = new Set<string>();
    const directTargets = new Set<string>();
    const edges: { from: string; to: string; transitionId: string }[] = [];

    for (const config of startClosure) {
        const stateTransitions = byState.get(config.stateId) ?? [];
        for (const t of stateTransitions) {
            const parsed = parsePdaTransition(t.simbolo);
            if (!parsed || parsed.input === null || parsed.input !== inputSymbol) continue;
            const next = applyTransition(config, parsed, t.para);
            if (!next) continue;
            const clamped = clampStack(next.stack, maxStack);
            if (!clamped) continue;
            next.stack = clamped;
            const key = configKey(next);
            if (!nextMap.has(key) && nextMap.size < maxConfigs) {
                nextMap.set(key, next);
                usedTransitions.add(t.id);
                directTargets.add(t.para);
            }
            edges.push({
                from: configKey(config),
                to: key,
                transitionId: t.id
            });
        }
    }

    const closure = getPdaEpsilonClosure(Array.from(nextMap.values()), transitions, limits);
    return {
        configs: closure,
        usedTransitions: Array.from(usedTransitions),
        directTargets: Array.from(directTargets),
        edges
    };
};
