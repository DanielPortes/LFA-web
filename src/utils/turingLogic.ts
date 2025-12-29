import type { Transicao } from '../types';

export interface TuringStepResult {
    stateId: string;
    tape: Record<number, string>; // Map index -> symbol
    headPos: number;
    status: 'running' | 'accepted' | 'rejected';
    usedTransition?: string;
}

export const BLANK = 'BLANK';
export const START_MARKER = 'START';
export const END_MARKER = 'END';

export const buildTuringConfigKey = (
    stateId: string,
    tape: Record<number, string>,
    headPos: number
): string => {
    const keys = Object.keys(tape)
        .map(Number)
        .sort((a, b) => a - b);
    const entries = keys.map(key => `${key}:${tape[key]}`).join('|');
    return `${stateId}::${headPos}::${entries}`;
};

export const parseTuringTransition = (
    symbol: string
): { read: string; write: string; direction: 'L' | 'R' | 'S' } | null => {
    // Format: "read -> write, Dir" (e.g., "a -> b, R")
    const arrow = symbol.includes('->') ? '->' : (symbol.includes('\u2192') ? '\u2192' : null);
    if (!arrow) return null;

    const [readPart, actionPart] = symbol.split(arrow);
    const read = readPart.trim();

    const actions = actionPart.split(',');
    if (actions.length < 2) return null;

    const write = actions[0].trim();
    const dirRaw = actions[1].trim().toUpperCase();
    const direction = (dirRaw === 'L' || dirRaw === 'R') ? dirRaw : 'S';

    return { read, write, direction };
};

export const performTuringStep = (
    currentState: string,
    tape: Record<number, string>,
    headPos: number,
    transitions: Transicao[]
): TuringStepResult => {
    const currentSymbol = tape[headPos] || BLANK;
    const relevantTransitions = transitions.filter(t => t.de === currentState);

    for (const t of relevantTransitions) {
        const parsed = parseTuringTransition(t.simbolo);
        const read = parsed?.read ?? t.simbolo.trim();
        const write = t.write ?? parsed?.write ?? read;
        const direction = t.direction ?? parsed?.direction ?? 'S';

        if (read === currentSymbol) {
            const newTape = { ...tape };
            if (write === BLANK) {
                delete newTape[headPos];
            } else {
                newTape[headPos] = write;
            }

            let newHead = headPos;
            if (direction === 'L') newHead--;
            else if (direction === 'R') newHead++;

            return {
                stateId: t.para,
                tape: newTape,
                headPos: newHead,
                status: 'running',
                usedTransition: t.id
            };
        }
    }

    return {
        stateId: currentState,
        tape,
        headPos,
        status: 'rejected'
    };
};

export const performALLStep = (
    currentState: string,
    tape: Record<number, string>,
    headPos: number,
    transitions: Transicao[],
    minIndex: number,
    maxIndex: number
): TuringStepResult => {
    const currentSymbol = tape[headPos] || BLANK;
    const relevantTransitions = transitions.filter(t => t.de === currentState);

    for (const t of relevantTransitions) {
        const parsed = parseTuringTransition(t.simbolo);
        const read = parsed?.read ?? t.simbolo.trim();
        const write = t.write ?? parsed?.write ?? read;
        const direction = t.direction ?? parsed?.direction ?? 'S';

        if (read === currentSymbol) {
            if ((headPos === minIndex && direction === 'L') || (headPos === maxIndex && direction === 'R')) {
                return {
                    stateId: currentState,
                    tape,
                    headPos,
                    status: 'rejected',
                    usedTransition: t.id
                };
            }

            const newTape = { ...tape };
            if (write === BLANK) {
                delete newTape[headPos];
            } else {
                newTape[headPos] = write;
            }

            newTape[minIndex] = START_MARKER;
            newTape[maxIndex] = END_MARKER;

            let newHead = headPos;
            if (direction === 'L') newHead--;
            else if (direction === 'R') newHead++;

            return {
                stateId: t.para,
                tape: newTape,
                headPos: newHead,
                status: 'running',
                usedTransition: t.id
            };
        }
    }

    return {
        stateId: currentState,
        tape,
        headPos,
        status: 'rejected'
    };
};
