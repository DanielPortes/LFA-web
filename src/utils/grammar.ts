import { EPSILON_SYMBOL, isEpsilonToken, normalizeToken, tokenizeInput, type TokenizationOptions } from './symbols';
import type { GrammarTree } from '../types';

export type { GrammarTree };

export interface GrammarRule {
    head: string;
    bodies: string[][];
}

export interface GrammarData {
    start: string;
    variables: string[];
    terminals: string[];
    rules: GrammarRule[];
}

export interface GrammarParseResult {
    grammar?: GrammarData;
    error?: string;
    warnings?: string[];
}

export interface DerivationResult {
    accepted: boolean;
    steps: string[];
    tree?: GrammarTree;
    reason?: string;
}

export type DerivationStrategy = 'leftmost' | 'rightmost';

export interface GrammarTransformStep {
    title: string;
    detail: string;
}

export interface GrammarTransformResult {
    grammar: GrammarData;
    steps: GrammarTransformStep[];
    warnings?: string[];
}

interface DerivationChoice {
    variable: string;
    body: string[];
}

interface DerivationLimits {
    maxSteps?: number;
    maxQueue?: number;
    maxSymbols?: number;
}

const stripComments = (line: string) => {
    const hash = line.indexOf('#');
    const slash = line.indexOf('//');
    const cut = [hash, slash].filter((idx) => idx >= 0).sort((a, b) => a - b)[0];
    return cut === undefined ? line : line.slice(0, cut);
};

const parseBodyTokens = (raw: string): string[] => {
    const trimmed = normalizeToken(raw);
    if (!trimmed || isEpsilonToken(trimmed)) return [];
    if (/[,\s]/.test(trimmed)) {
        return trimmed
            .split(/[,\s]+/)
            .map(normalizeToken)
            .filter((token) => token.length > 0);
    }
    return trimmed.split('').map(normalizeToken).filter((token) => token.length > 0);
};

export const parseGrammar = (source: string): GrammarParseResult => {
    const lines = source
        .split(/\r?\n/)
        .map(stripComments)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    const rulesMap = new Map<string, string[][]>();
    const warnings: string[] = [];

    const unicodeArrow = '\u2192';
    for (const line of lines) {
        const arrow = line.includes('->') ? '->' : (line.includes(unicodeArrow) ? unicodeArrow : null);
        if (!arrow) {
            warnings.push(`Linha ignorada (sem seta): ${line}`);
            continue;
        }
        const [left, right] = line.split(arrow).map((part) => part.trim());
        if (!left || !right) {
            warnings.push(`Linha incompleta: ${line}`);
            continue;
        }

        const head = normalizeToken(left.split(/\s+/)[0]);
        if (!head) {
            warnings.push(`Cabeca vazia: ${line}`);
            continue;
        }

        const bodies = right
            .split('|')
            .map((body) => parseBodyTokens(body))
            .filter((body) => body !== undefined);

        if (bodies.length === 0) {
            warnings.push(`Sem producoes em: ${line}`);
            continue;
        }

        const current = rulesMap.get(head) ?? [];
        current.push(...bodies);
        rulesMap.set(head, current);
    }

    if (rulesMap.size === 0) {
        return { error: 'Nenhuma producao valida encontrada.' };
    }

    const variables = Array.from(rulesMap.keys());
    const terminalsSet = new Set<string>();
    rulesMap.forEach((bodies) => {
        bodies.forEach((body) => {
            body.forEach((symbol) => {
                if (!variables.includes(symbol) && !isEpsilonToken(symbol)) {
                    terminalsSet.add(symbol);
                }
            });
        });
    });

    const rules: GrammarRule[] = Array.from(rulesMap.entries()).map(([head, bodies]) => ({
        head,
        bodies
    }));

    return {
        grammar: {
            start: variables[0],
            variables,
            terminals: Array.from(terminalsSet),
            rules
        },
        warnings: warnings.length > 0 ? warnings : undefined
    };
};

const renderForm = (form: string[]) => {
    if (form.length === 0) return EPSILON_SYMBOL;
    return form.join(' ');
};

const findVariableIndex = (symbols: string[], variables: Set<string>, strategy: DerivationStrategy) => {
    if (strategy === 'leftmost') {
        return symbols.findIndex((symbol) => variables.has(symbol));
    }
    for (let idx = symbols.length - 1; idx >= 0; idx -= 1) {
        if (variables.has(symbols[idx])) return idx;
    }
    return -1;
};

const buildParseTree = (
    start: string,
    variables: Set<string>,
    choices: DerivationChoice[],
    strategy: DerivationStrategy
): GrammarTree => {
    const root: GrammarTree = { symbol: start, children: [] };
    const leaves: GrammarTree[] = [root];

    choices.forEach((choice) => {
        const idx = findVariableIndex(leaves.map((node) => node.symbol), variables, strategy);
        if (idx < 0) return;
        const node = leaves[idx];
        if (node.symbol !== choice.variable) return;
        if (choice.body.length === 0) {
            node.children = [{ symbol: EPSILON_SYMBOL, children: [] }];
            leaves.splice(idx, 1);
            return;
        }
        const children = choice.body.map((symbol) => ({ symbol, children: [] }));
        node.children = children;
        leaves.splice(idx, 1, ...children);
    });

    return root;
};

export const renderParseTree = (tree: GrammarTree): string => {
    const lines: string[] = [];

    const walk = (node: GrammarTree, prefix: string, isLast: boolean) => {
        const connector = prefix ? (isLast ? '\\- ' : '|- ') : '';
        lines.push(`${prefix}${connector}${node.symbol}`);
        const nextPrefix = prefix + (prefix ? (isLast ? '   ' : '|  ') : '');
        node.children.forEach((child, idx) => {
            walk(child, nextPrefix, idx === node.children.length - 1);
        });
    };

    walk(tree, '', true);
    return lines.join('\n');
};

const cloneGrammar = (grammar: GrammarData): GrammarData => ({
    start: grammar.start,
    variables: [...grammar.variables],
    terminals: [...grammar.terminals],
    rules: grammar.rules.map(rule => ({
        head: rule.head,
        bodies: rule.bodies.map(body => [...body])
    }))
});

export const grammarToString = (grammar: GrammarData): string => {
    const lines: string[] = [];
    grammar.rules.forEach(rule => {
        const bodies = rule.bodies.map(body => (body.length === 0 ? EPSILON_SYMBOL : body.join(' ')));
        lines.push(`${rule.head} -> ${bodies.join(' | ')}`);
    });
    return lines.join('\n');
};

const collectVariables = (grammar: GrammarData) => new Set(grammar.variables);

export const eliminateEpsilonProductions = (grammar: GrammarData): GrammarTransformResult => {
    const steps: GrammarTransformStep[] = [];
    const g = cloneGrammar(grammar);
    const variables = collectVariables(g);
    const nullable = new Set<string>();

    let changed = true;
    while (changed) {
        changed = false;
        g.rules.forEach(rule => {
            if (nullable.has(rule.head)) return;
            if (rule.bodies.some(body => body.length === 0 || body.every(sym => nullable.has(sym)))) {
                nullable.add(rule.head);
                changed = true;
            }
        });
    }

    steps.push({
        title: 'Variaveis anulaveis',
        detail: Array.from(nullable).join(', ') || 'nenhuma'
    });

    const newRules: GrammarRule[] = [];
    g.rules.forEach(rule => {
        const newBodies: string[][] = [];
        rule.bodies.forEach(body => {
            if (body.length === 0) return;
            const positions = body
                .map((sym, idx) => (nullable.has(sym) ? idx : -1))
                .filter(idx => idx >= 0);
            const combos = 1 << positions.length;
            for (let mask = 0; mask < combos; mask += 1) {
                const next: string[] = [];
                body.forEach((sym, idx) => {
                    const posIndex = positions.indexOf(idx);
                    if (posIndex >= 0 && (mask & (1 << posIndex))) return;
                    next.push(sym);
                });
                if (next.length > 0) {
                    newBodies.push(next);
                }
            }
            newBodies.push(body);
        });
        const unique = new Map<string, string[]>();
        newBodies.forEach(body => unique.set(body.join(' '), body));
        newRules.push({ head: rule.head, bodies: Array.from(unique.values()) });
    });

    g.rules = newRules;

    if (nullable.has(g.start)) {
        const oldStart = g.start;
        const newStart = `${g.start}_0`;
        if (!variables.has(newStart)) {
            g.variables.unshift(newStart);
            g.rules.unshift({
                head: newStart,
                bodies: [[oldStart], []]
            });
            g.start = newStart;
            steps.push({
                title: 'Novo simbolo inicial',
                detail: `${newStart} -> ${oldStart} | ${EPSILON_SYMBOL}`
            });
        }
    }

    steps.push({
        title: 'Remocao de producoes epsilon',
        detail: 'Producoes vazias removidas e combinacoes geradas.'
    });

    return { grammar: g, steps };
};

export const eliminateUnitProductions = (grammar: GrammarData): GrammarTransformResult => {
    const steps: GrammarTransformStep[] = [];
    const g = cloneGrammar(grammar);
    const variables = collectVariables(g);

    const unitMap = new Map<string, Set<string>>();
    g.variables.forEach(v => unitMap.set(v, new Set([v])));

    let changed = true;
    while (changed) {
        changed = false;
        g.rules.forEach(rule => {
            rule.bodies.forEach(body => {
                if (body.length === 1 && variables.has(body[0])) {
                    const from = unitMap.get(rule.head) ?? new Set();
                    const to = unitMap.get(body[0]) ?? new Set();
                    to.forEach(v => {
                        if (!from.has(v)) {
                            from.add(v);
                            changed = true;
                        }
                    });
                    unitMap.set(rule.head, from);
                }
            });
        });
    }

    const newRules: GrammarRule[] = [];
    g.rules.forEach(rule => {
        const expanded = new Map<string, string[]>();
        const closure = unitMap.get(rule.head) ?? new Set([rule.head]);
        closure.forEach(head => {
            const sourceRule = g.rules.find(r => r.head === head);
            sourceRule?.bodies.forEach(body => {
                if (body.length === 1 && variables.has(body[0])) return;
                expanded.set(body.join(' '), body);
            });
        });
        newRules.push({ head: rule.head, bodies: Array.from(expanded.values()) });
    });

    g.rules = newRules;
    steps.push({
        title: 'Remocao de unitarias',
        detail: 'Producoes do tipo A -> B foram substituidas.'
    });

    return { grammar: g, steps };
};

const ensureStartNotOnRhs = (grammar: GrammarData, steps: GrammarTransformStep[]) => {
    const appearsOnRhs = grammar.rules.some(rule =>
        rule.bodies.some(body => body.includes(grammar.start))
    );
    if (!appearsOnRhs) return;
    const oldStart = grammar.start;
    const newStart = `${grammar.start}_0`;
    grammar.variables.unshift(newStart);
    grammar.rules.unshift({ head: newStart, bodies: [[oldStart]] });
    grammar.start = newStart;
    steps.push({
        title: 'Novo simbolo inicial',
        detail: `${newStart} -> ${oldStart}`
    });
};

export const toCnf = (grammar: GrammarData): GrammarTransformResult => {
    const steps: GrammarTransformStep[] = [];
    let g = cloneGrammar(grammar);

    const epsilonResult = eliminateEpsilonProductions(g);
    g = epsilonResult.grammar;
    steps.push(...epsilonResult.steps);

    const unitResult = eliminateUnitProductions(g);
    g = unitResult.grammar;
    steps.push(...unitResult.steps);

    ensureStartNotOnRhs(g, steps);

    const terminalMap = new Map<string, string>();
    const newRules: GrammarRule[] = [];
    g.rules.forEach(rule => {
        const bodies: string[][] = [];
        rule.bodies.forEach(body => {
            if (body.length <= 1) {
                bodies.push(body);
                return;
            }
            const mapped = body.map(sym => {
                if (!g.terminals.includes(sym)) return sym;
                if (!terminalMap.has(sym)) {
                    const varName = `T_${sym}`;
                    terminalMap.set(sym, varName);
                    g.variables.push(varName);
                    newRules.push({ head: varName, bodies: [[sym]] });
                }
                return terminalMap.get(sym) ?? sym;
            });
            bodies.push(mapped);
        });
        newRules.push({ head: rule.head, bodies });
    });
    g.rules = newRules;

    const binarized: GrammarRule[] = [];
    g.rules.forEach(rule => {
        const bodies: string[][] = [];
        rule.bodies.forEach(body => {
            if (body.length <= 2) {
                bodies.push(body);
                return;
            }
            let current = body;
            let head = rule.head;
            while (current.length > 2) {
                const [first, second, ...rest] = current;
                const newVar = `${head}_X${Math.random().toString(36).slice(2, 6)}`;
                g.variables.push(newVar);
                binarized.push({ head, bodies: [[first, newVar]] });
                head = newVar;
                current = [second, ...rest];
            }
            bodies.push(current);
        });
        binarized.push({ head: rule.head, bodies });
    });
    g.rules = binarized;

    steps.push({
        title: 'CNF',
        detail: 'Producoes ajustadas para A -> BC ou A -> a.'
    });

    return { grammar: g, steps };
};

export const toGnf = (grammar: GrammarData): GrammarTransformResult => {
    const steps: GrammarTransformStep[] = [];
    let g = cloneGrammar(grammar);

    const unitResult = eliminateUnitProductions(g);
    g = unitResult.grammar;
    steps.push(...unitResult.steps);

    const variables = collectVariables(g);
    const rulesMap = new Map(g.rules.map(rule => [rule.head, rule.bodies]));

    let changed = true;
    let guard = 0;
    while (changed && guard < 200) {
        changed = false;
        guard += 1;
        g.rules.forEach(rule => {
            const newBodies: string[][] = [];
            rule.bodies.forEach(body => {
                if (body.length === 0) return;
                const first = body[0];
                if (!variables.has(first)) {
                    newBodies.push(body);
                    return;
                }
                const expansions = rulesMap.get(first) ?? [];
                expansions.forEach(exp => {
                    if (exp.length === 0) return;
                    newBodies.push([...exp, ...body.slice(1)]);
                });
                changed = true;
            });
            rule.bodies = newBodies.length > 0 ? newBodies : rule.bodies;
        });
        rulesMap.clear();
        g.rules.forEach(rule => rulesMap.set(rule.head, rule.bodies));
    }

    const allGnf = g.rules.every(rule =>
        rule.bodies.every(body => body.length > 0 && g.terminals.includes(body[0]))
    );

    steps.push({
        title: 'GNF',
        detail: allGnf ? 'Producoes iniciam com terminal.' : 'Nao foi possivel garantir GNF para todas as producoes.'
    });

    if (!allGnf) {
        return { grammar: g, steps, warnings: ['Algumas producoes ainda iniciam com variavel.'] };
    }

    return { grammar: g, steps };
};

const deriveFormFromChoices = (
    start: string,
    variables: Set<string>,
    choices: DerivationChoice[],
    strategy: DerivationStrategy
): string[] => {
    let form = [start];
    choices.forEach((choice) => {
        const idx = findVariableIndex(form, variables, strategy);
        if (idx < 0) return;
        if (form[idx] !== choice.variable) return;
        form = [...form.slice(0, idx), ...choice.body, ...form.slice(idx + 1)];
    });
    return form;
};

const deriveWordWithStrategy = (
    grammar: GrammarData,
    input: string,
    limits: DerivationLimits = {},
    tokenizeOptions?: TokenizationOptions,
    strategy: DerivationStrategy = 'leftmost'
): DerivationResult => {
    const target = tokenizeInput(input, tokenizeOptions);
    const variables = new Set(grammar.variables);
    const rulesMap = new Map(grammar.rules.map((rule) => [rule.head, rule.bodies]));
    const maxSteps = limits.maxSteps ?? 20;
    const maxQueue = limits.maxQueue ?? 2000;
    const maxSymbols = limits.maxSymbols ?? Math.max(10, target.length * 2 + 4);

    const queue: { form: string[]; choices: DerivationChoice[] }[] = [
        { form: [grammar.start], choices: [] }
    ];
    const visited = new Set<string>([renderForm([grammar.start])]);

    while (queue.length > 0) {
        const current = queue.shift()!;
        const form = current.form;

        const isTerminalOnly = form.every((symbol) => !variables.has(symbol));
        if (isTerminalOnly) {
            if (form.length === target.length && form.every((sym, idx) => sym === target[idx])) {
                const tree = buildParseTree(grammar.start, variables, current.choices, strategy);
                const steps = [
                    renderForm([grammar.start]),
                    ...current.choices.map((_, idx) =>
                        renderForm(deriveFormFromChoices(grammar.start, variables, current.choices.slice(0, idx + 1), strategy))
                    )
                ];
                return {
                    accepted: true,
                    steps,
                    tree
                };
            }
            continue;
        }

        if (current.choices.length >= maxSteps) {
            continue;
        }

        const varIndex = findVariableIndex(form, variables, strategy);
        if (varIndex < 0) continue;
        const variable = form[varIndex];
        const bodies = rulesMap.get(variable) ?? [];

        for (const body of bodies) {
            const newForm = [
                ...form.slice(0, varIndex),
                ...body,
                ...form.slice(varIndex + 1)
            ];
            if (newForm.length > maxSymbols) continue;

            const key = renderForm(newForm);
            if (visited.has(key)) continue;
            visited.add(key);
            queue.push({
                form: newForm,
                choices: [...current.choices, { variable, body }]
            });
            if (queue.length >= maxQueue) break;
        }
    }

    return {
        accepted: false,
        steps: [renderForm([grammar.start])],
        reason: 'Nao foi encontrada derivacao dentro do limite de busca.'
    };
};

export const deriveWordLeftmost = (
    grammar: GrammarData,
    input: string,
    limits: DerivationLimits = {},
    tokenizeOptions?: TokenizationOptions
): DerivationResult => deriveWordWithStrategy(grammar, input, limits, tokenizeOptions, 'leftmost');

export const deriveWordRightmost = (
    grammar: GrammarData,
    input: string,
    limits: DerivationLimits = {},
    tokenizeOptions?: TokenizationOptions
): DerivationResult => deriveWordWithStrategy(grammar, input, limits, tokenizeOptions, 'rightmost');
