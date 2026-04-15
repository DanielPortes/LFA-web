import { useState, useMemo, useCallback } from 'react';
import type { AutomatoData, Exercicio, TestCase, GrammarTree } from '../../types';
import { regexToNfa, areDfaEquivalent } from '../../utils/conversions';
import { deriveWordLeftmost, parseGrammar, type GrammarData } from '../../utils/grammar';
import { EPSILON_SYMBOL, type TokenizationOptions } from '../../utils/symbols';
import {
    simulateAutomaton,
    simulatePda,
    simulateTuring,
    simulateWithTrace,
    type SimulationResult,
    type SimulationTraceStep
} from '../../utils/exerciseSimulation';
import type { ExerciseFailure, SolverMode } from './types';

interface UseExerciseVerificationOptions {
    activeCategory: string;
    currentExercise: Exercicio | null;
    solverMode: SolverMode;
    userAutomaton: AutomatoData | null;
    userRegex: string;
    userGrammar: string;
    tokenOptions: TokenizationOptions;
    markExerciseCompleted: (categoryId: string, exerciseId: number) => void;
}

export const useExerciseVerification = ({
    activeCategory,
    currentExercise,
    solverMode,
    userAutomaton,
    userRegex,
    userGrammar,
    tokenOptions,
    markExerciseCompleted,
}: UseExerciseVerificationOptions) => {
    const [grammarError, setGrammarError] = useState<string | null>(null);
    const [grammarWarnings, setGrammarWarnings] = useState<string[]>([]);
    const [grammarTree, setGrammarTree] = useState<GrammarTree | null>(null);
    const [testResults, setTestResults] = useState<Record<string, 'pass' | 'fail' | 'running'>>({});
    const [lastFailure, setLastFailure] = useState<ExerciseFailure | null>(null);
    const [lastTrace, setLastTrace] = useState<SimulationTraceStep[] | null>(null);
    const [equivalenceStatus, setEquivalenceStatus] = useState<'pass' | 'fail' | null>(null);
    const [regexError, setRegexError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [fastVerify, setFastVerify] = useState(false);

    const tests = useMemo<TestCase[]>(() => currentExercise?.testes ?? [], [currentExercise]);
    const hasTests = tests.length > 0;
    const hasEquivalenceCheck = solverMode === 'automaton'
        && !!currentExercise?.respostaAutomato
        && userAutomaton?.tipo === 'AFD'
        && currentExercise.respostaAutomato.tipo === 'AFD';
    const canVerify = hasTests || hasEquivalenceCheck;
    const verifyDisabledReason = !canVerify
        ? 'Este exercício não possui validação automática.'
        : solverMode === 'automaton' && (!userAutomaton || userAutomaton.estados.length === 0)
            ? 'Crie pelo menos um estado no autômato para verificar a solução.'
            : null;

    const formatStateList = useCallback((ids: string[]) => {
        if (!ids || ids.length === 0) return 'vazio';
        return ids
            .map((id) => userAutomaton?.estados.find((state) => state.id === id)?.label || id)
            .join(', ');
    }, [userAutomaton]);

    const resetVerificationState = useCallback(() => {
        setGrammarError(null);
        setGrammarWarnings([]);
        setGrammarTree(null);
        setTestResults({});
        setLastFailure(null);
        setLastTrace(null);
        setEquivalenceStatus(null);
        setRegexError(null);
        setIsVerifying(false);
    }, []);

    const runTestCase = useCallback((testCase: TestCase, grammar?: GrammarData): SimulationResult => {
        if (solverMode === 'regex') {
            try {
                const nfa = regexToNfa(userRegex.trim());
                return simulateAutomaton(nfa, testCase.input, tokenOptions);
            } catch {
                return { status: 'rejected', reason: 'Regex inválida', finalStates: [] };
            }
        }

        if (solverMode === 'grammar') {
            if (!grammar) {
                return { status: 'rejected', reason: 'Gramática inválida', finalStates: [] };
            }
            const result = deriveWordLeftmost(grammar, testCase.input, {
                maxSteps: 30,
                maxQueue: 2000,
                maxSymbols: 40
            }, tokenOptions);
            return {
                status: result.accepted ? 'accepted' : 'rejected',
                reason: result.accepted ? undefined : result.reason,
                finalStates: [],
                tree: result.tree
            };
        }

        if (!userAutomaton) {
            return { status: 'rejected', reason: 'Sem autômato', finalStates: [] };
        }

        if (userAutomaton.tipo === 'AP') {
            return simulatePda(userAutomaton, testCase.input, tokenOptions);
        }

        if (userAutomaton.tipo === 'MT' || userAutomaton.tipo === 'ALL') {
            return simulateTuring(userAutomaton, testCase.input, tokenOptions);
        }

        return simulateAutomaton(userAutomaton, testCase.input, tokenOptions);
    }, [solverMode, tokenOptions, userAutomaton, userRegex]);

    const verifySolution = useCallback(async (isCancelled: () => boolean) => {
        if (isVerifying || !currentExercise) return;

        if (solverMode === 'regex' && !userRegex.trim()) {
            setRegexError('Digite uma expressao regular para testar.');
            return;
        }

        if (solverMode === 'grammar' && !userGrammar.trim()) {
            setGrammarError('Digite uma gramática para testar.');
            setGrammarWarnings([]);
            return;
        }

        if (solverMode === 'automaton' && (!userAutomaton || userAutomaton.estados.length === 0)) {
            return;
        }

        if (!hasTests && !hasEquivalenceCheck) return;

        let parsedGrammar: GrammarData | undefined;
        if (solverMode === 'grammar') {
            const parsed = parseGrammar(userGrammar);
            setGrammarWarnings(parsed.warnings ?? []);
            if (!parsed.grammar) {
                setGrammarError(parsed.error || 'Falha ao ler a gramática.');
                return;
            }
            setGrammarError(null);
            parsedGrammar = parsed.grammar;
        } else {
            setGrammarError(null);
            setGrammarWarnings([]);
        }

        setIsVerifying(true);
        setRegexError(null);
        setLastFailure(null);
        setLastTrace(null);
        setEquivalenceStatus(null);

        const runningResults: Record<string, 'running'> = {};
        tests.forEach((_, index) => {
            runningResults[`${index}`] = 'running';
        });
        setTestResults(runningResults);

        let allPassed = true;
        let hasFailureRecorded = false;
        const delayMs = fastVerify ? 0 : 150;

        for (let index = 0; index < tests.length; index += 1) {
            if (delayMs > 0) {
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
            if (isCancelled()) return;

            const testCase = tests[index];
            const result = runTestCase(testCase, parsedGrammar);
            const passed = (testCase.expected === 'accept' && result.status === 'accepted')
                || (testCase.expected === 'reject' && result.status === 'rejected');

            if (!passed && allPassed) {
                setLastFailure({
                    input: testCase.input || EPSILON_SYMBOL,
                    expected: testCase.expected === 'accept' ? 'Aceita' : 'Rejeita',
                    received: result.status === 'accepted' ? 'Aceita' : 'Rejeita',
                    reason: result.reason
                });
                hasFailureRecorded = true;

                if (solverMode === 'automaton' && userAutomaton && (userAutomaton.tipo === 'AFD' || userAutomaton.tipo === 'AFN')) {
                    const traceResult = simulateWithTrace(userAutomaton, testCase.input, tokenOptions);
                    setLastTrace(traceResult.trace);
                }
                if (solverMode === 'regex' && userRegex.trim()) {
                    try {
                        const nfa = regexToNfa(userRegex.trim());
                        const traceResult = simulateWithTrace(nfa, testCase.input, tokenOptions);
                        setLastTrace(traceResult.trace);
                    } catch {
                        setLastTrace(null);
                    }
                }
                if (solverMode === 'grammar' && result.tree) {
                    setGrammarTree(result.tree);
                }
            }

            if (!passed) allPassed = false;

            setTestResults((previous) => ({
                ...previous,
                [`${index}`]: passed ? 'pass' : 'fail'
            }));
        }

        if (isCancelled()) return;

        if (hasEquivalenceCheck && userAutomaton && currentExercise.respostaAutomato) {
            const equivalence = areDfaEquivalent(userAutomaton, currentExercise.respostaAutomato);
            if (!equivalence.equivalent) {
                allPassed = false;
                setEquivalenceStatus('fail');
                if (!hasFailureRecorded && equivalence.witness) {
                    const witnessInput = equivalence.witness.join(' ');
                    const expected = simulateAutomaton(currentExercise.respostaAutomato, witnessInput, tokenOptions).status === 'accepted' ? 'Aceita' : 'Rejeita';
                    const received = simulateAutomaton(userAutomaton, witnessInput, tokenOptions).status === 'accepted' ? 'Aceita' : 'Rejeita';
                    setLastFailure({
                        input: witnessInput || EPSILON_SYMBOL,
                        expected,
                        received,
                        reason: 'Autômato não é equivalente ao gabarito.'
                    });
                    const traceResult = simulateWithTrace(userAutomaton, witnessInput, tokenOptions);
                    setLastTrace(traceResult.trace);
                }
            } else {
                setEquivalenceStatus('pass');
            }
        }

        if (allPassed) {
            markExerciseCompleted(activeCategory, currentExercise.id);
        }

        if (!isCancelled()) {
            setIsVerifying(false);
        }
    }, [
        activeCategory,
        currentExercise,
        fastVerify,
        hasEquivalenceCheck,
        hasTests,
        isVerifying,
        markExerciseCompleted,
        runTestCase,
        solverMode,
        tests,
        tokenOptions,
        userAutomaton,
        userGrammar,
        userRegex
    ]);

    return {
        tests,
        hasTests,
        hasEquivalenceCheck,
        canVerify,
        verifyDisabledReason,
        grammarError,
        setGrammarError,
        grammarWarnings,
        setGrammarWarnings,
        grammarTree,
        testResults,
        lastFailure,
        lastTrace,
        equivalenceStatus,
        regexError,
        setRegexError,
        isVerifying,
        fastVerify,
        setFastVerify,
        formatStateList,
        resetVerificationState,
        verifySolution,
    };
};
