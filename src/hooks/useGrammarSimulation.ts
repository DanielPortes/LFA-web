/**
 * Hook for grammar simulation and transformations
 *
 * @module hooks/useGrammarSimulation
 */

import { useState, useCallback } from 'react';
import {
    deriveWordLeftmost,
    deriveWordRightmost,
    parseGrammar,
    renderParseTree,
    eliminateEpsilonProductions,
    eliminateUnitProductions,
    toCnf,
    toGnf,
    grammarToString,
    type GrammarTree
} from '../utils/grammar';
import { GRAMMAR } from '../constants/ui';

export interface GrammarResult {
    status: 'accepted' | 'rejected';
    steps: string[];
    tree?: GrammarTree;
    treeText?: string;
    reason?: string;
}

export interface GrammarTransformResult {
    title: string;
    steps: string[];
    output: string;
    warnings?: string[];
}

interface GrammarLimits {
    maxSteps: number;
    maxQueue: number;
    maxSymbols: number;
}

interface TokenizationConfig {
    mode: 'auto' | 'char' | 'separator';
    separator: string;
}

interface UseGrammarSimulationResult {
    // State
    grammarSource: string;
    grammarInput: string;
    grammarResult: GrammarResult | null;
    grammarWarnings: string[];
    grammarLimits: GrammarLimits;
    grammarStrategy: 'leftmost' | 'rightmost';
    grammarTransform: GrammarTransformResult | null;

    // Actions
    setGrammarSource: (source: string) => void;
    setGrammarInput: (input: string) => void;
    setGrammarLimits: (limits: GrammarLimits) => void;
    setGrammarStrategy: (strategy: 'leftmost' | 'rightmost') => void;
    runDerivation: () => void;
    runTransform: (kind: 'epsilon' | 'unit' | 'cnf' | 'gnf') => void;
    clearTransform: () => void;
    clearResult: () => void;
}

const defaultLimits: GrammarLimits = {
    maxSteps: GRAMMAR.MAX_STEPS,
    maxQueue: GRAMMAR.MAX_QUEUE,
    maxSymbols: GRAMMAR.MAX_SYMBOLS
};

export function useGrammarSimulation(
    tokenizationConfig: TokenizationConfig
): UseGrammarSimulationResult {
    const [grammarSource, setGrammarSource] = useState('S -> a S b | eps');
    const [grammarInput, setGrammarInput] = useState('');
    const [grammarResult, setGrammarResult] = useState<GrammarResult | null>(null);
    const [grammarWarnings, setGrammarWarnings] = useState<string[]>([]);
    const [grammarLimits, setGrammarLimits] = useState<GrammarLimits>(defaultLimits);
    const [grammarStrategy, setGrammarStrategy] = useState<'leftmost' | 'rightmost'>('leftmost');
    const [grammarTransform, setGrammarTransform] = useState<GrammarTransformResult | null>(null);

    const runDerivation = useCallback(() => {
        const parsed = parseGrammar(grammarSource);
        setGrammarWarnings(parsed.warnings ?? []);

        if (!parsed.grammar) {
            setGrammarResult({
                status: 'rejected',
                steps: [],
                reason: parsed.error || 'Falha ao ler a gramatica.'
            });
            return;
        }

        const derive = grammarStrategy === 'rightmost' ? deriveWordRightmost : deriveWordLeftmost;
        const result = derive(
            parsed.grammar,
            grammarInput,
            {
                maxSteps: grammarLimits.maxSteps,
                maxQueue: grammarLimits.maxQueue,
                maxSymbols: grammarLimits.maxSymbols
            },
            tokenizationConfig
        );

        setGrammarResult({
            status: result.accepted ? 'accepted' : 'rejected',
            steps: result.steps,
            tree: result.tree,
            treeText: result.tree ? renderParseTree(result.tree) : undefined,
            reason: result.reason
        });
    }, [grammarSource, grammarInput, grammarLimits, grammarStrategy, tokenizationConfig]);

    const runTransform = useCallback((kind: 'epsilon' | 'unit' | 'cnf' | 'gnf') => {
        const parsed = parseGrammar(grammarSource);

        if (!parsed.grammar) {
            setGrammarTransform({
                title: 'Erro',
                steps: [parsed.error || 'Falha ao ler a gramatica.'],
                output: ''
            });
            return;
        }

        let result;
        let title = '';

        switch (kind) {
            case 'epsilon':
                title = 'Eliminacao de epsilon';
                result = eliminateEpsilonProductions(parsed.grammar);
                break;
            case 'unit':
                title = 'Eliminacao de unitarias';
                result = eliminateUnitProductions(parsed.grammar);
                break;
            case 'cnf':
                title = 'Forma Normal de Chomsky';
                result = toCnf(parsed.grammar);
                break;
            case 'gnf':
                title = 'Forma Normal de Greibach';
                result = toGnf(parsed.grammar);
                break;
        }

        setGrammarTransform({
            title,
            steps: result.steps.map(step => `${step.title}: ${step.detail}`),
            output: grammarToString(result.grammar),
            warnings: result.warnings
        });
    }, [grammarSource]);

    const clearTransform = useCallback(() => {
        setGrammarTransform(null);
    }, []);

    const clearResult = useCallback(() => {
        setGrammarResult(null);
    }, []);

    return {
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
    };
}
