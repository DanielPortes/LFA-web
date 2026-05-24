export const EPSILON_SYMBOL = 'eps';

const EPSILON_ALIASES = new Set([
    'eps',
    'epsilon',
    'e',
    '?',
    'ε',
    'Ić',
    'IŻ',
    'iAÝ',
    'iŹ¬'
]);

const EMPTY_INPUT_ALIASES = new Set([
    'eps',
    'epsilon',
    'vazio',
    'empty',
    'lambda',
    'λ',
    'ε'
]);

export const normalizeToken = (token: string) => token.trim();

export const splitSymbolTokens = (symbol: string): string[] =>
    symbol.split(',').map(normalizeToken).filter((token) => token.length > 0);

export const isEpsilonToken = (token: string): boolean => {
    const normalized = normalizeToken(token).toLowerCase();
    if (!normalized) return false;
    return EPSILON_ALIASES.has(normalized);
};

export const hasEpsilonToken = (symbol: string): boolean =>
    splitSymbolTokens(symbol).some(isEpsilonToken);

export const isEpsilonOnly = (symbol: string): boolean => {
    const tokens = splitSymbolTokens(symbol);
    return tokens.length > 0 && tokens.every(isEpsilonToken);
};

export const expandRangeToken = (token: string): string[] => {
    if (!token.includes('..')) return [token];
    const [start, end] = token.split('..');
    if (!start || !end || start.length !== 1 || end.length !== 1) return [token];

    const startCode = start.charCodeAt(0);
    const endCode = end.charCodeAt(0);
    const symbols: string[] = [];
    const step = startCode <= endCode ? 1 : -1;
    for (let code = startCode; step > 0 ? code <= endCode : code >= endCode; code += step) {
        symbols.push(String.fromCharCode(code));
    }
    return symbols;
};

export const matchesSymbol = (transitionSymbol: string, inputSymbol: string): boolean => {
    const tokens = splitSymbolTokens(transitionSymbol);
    for (const token of tokens) {
        if (isEpsilonToken(token)) continue;
        if (token.includes('..')) {
            const [start, end] = token.split('..');
            if (!start || !end) continue;
            if (inputSymbol >= start && inputSymbol <= end) return true;
        } else if (token === inputSymbol) {
            return true;
        }
    }
    return false;
};

export type TokenizationMode = 'auto' | 'char' | 'separator';

export interface TokenizationOptions {
    mode?: TokenizationMode;
    separator?: string;
}

export const tokenizeInput = (input: string, options: TokenizationOptions = {}): string[] => {
    const trimmed = input.trim();
    if (!trimmed) return [];
    if (EMPTY_INPUT_ALIASES.has(trimmed.toLowerCase())) return [];

    const mode = options.mode ?? 'auto';
    if (mode === 'char') {
        return trimmed.split('').map(normalizeToken).filter((token) => token.length > 0);
    }

    if (mode === 'separator') {
        const sep = options.separator ?? ' ';
        if (!sep) {
            return trimmed.split('').map(normalizeToken).filter((token) => token.length > 0);
        }
        const escaped = sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return trimmed
            .split(new RegExp(escaped, 'g'))
            .map(normalizeToken)
            .filter((token) => token.length > 0);
    }

    if (/\s/.test(trimmed)) {
        return trimmed
            .split(/\s+/)
            .map(normalizeToken)
            .filter((token) => token.length > 0);
    }
    return trimmed.split('').map(normalizeToken).filter((token) => token.length > 0);
};
