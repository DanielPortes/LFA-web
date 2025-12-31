import { useState, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    Lightbulb,
    Eye,
    EyeOff,
    Play,
    ChevronRight,
    CheckCircle2,
    ListFilter,
    Pencil,
    XCircle,
    RotateCcw,
    Loader2,
    Trophy,
    X,
    Braces,
    FileText
} from 'lucide-react';
import type { AutomatoData, TestCase } from '../types';
import { exerciciosDB } from '../data/constants';
import { AutomatonEditor, AutomatonPreview } from '../components/automaton';
import { regexToNfa, areDfaEquivalent } from '../utils/conversions';
import { deriveWordLeftmost, parseGrammar, type GrammarData } from '../utils/grammar';
import { EPSILON_SYMBOL, type TokenizationOptions } from '../utils/symbols';
import { useDialog } from '../hooks/useDialog';
import { useProgress } from '../hooks/useProgress';
import { useUiSettings } from '../hooks/UiSettingsContext';
import { DerivationTreeVisualizer } from '../components/ui';
import type { GrammarTree } from '../types';
import {
    createEmptyAutomaton,
    simulateAutomaton,
    simulatePda,
    simulateTuring,
    simulateWithTrace,
    type SimulationResult,
    type SimulationTraceStep
} from '../utils/exerciseSimulation';

type SolverMode = 'automaton' | 'regex' | 'text' | 'grammar';

interface CategoryConfig {
    id: string;
    label: string;
    tipo?: AutomatoData['tipo'];
    mode: SolverMode;
}

const categories: CategoryConfig[] = [
    { id: 'fundamentos', label: 'Fundamentos', mode: 'text' },
    { id: 'afd', label: 'AFDs', tipo: 'AFD', mode: 'automaton' },
    { id: 'lex', label: 'Lexico', tipo: 'AFD', mode: 'automaton' },
    { id: 'afn', label: 'AFNs', tipo: 'AFN', mode: 'automaton' },
    { id: 'afne', label: 'AFN-eps', tipo: 'AFN', mode: 'automaton' },
    { id: 'er', label: 'Regex', mode: 'regex' },
    { id: 'gr', label: 'Gramatica Regular', mode: 'grammar' },
    { id: 'cfg', label: 'GLC', mode: 'grammar' },
    { id: 'pda', label: 'Automato de Pilha', tipo: 'AP', mode: 'automaton' },
    { id: 'chomsky', label: 'Chomsky', mode: 'text' },
    { id: 'turing', label: 'Turing', tipo: 'MT', mode: 'automaton' },
    { id: 'minimizacao', label: 'Minimizacao', mode: 'text' },
    { id: 'moore_mealy', label: 'Moore/Mealy', mode: 'text' },
    { id: 'pumping', label: 'Bombeamento', mode: 'text' }
];

export const ExerciciosSection = ({
    onSimulate,
    initialCategoryId,
    initialExerciseId,
    onSelectionChange
}: {
    onSimulate: (data: AutomatoData) => void;
    initialCategoryId?: string;
    initialExerciseId?: number | null;
    onSelectionChange?: (categoryId: string, exerciseId: number | null) => void;
}) => {
    const {
        progress,
        markExerciseCompleted,
        isExerciseCompleted,
        setLastCategory
    } = useProgress();
    const { inputTokenization, inputSeparator } = useUiSettings();
    const tokenOptions = useMemo<TokenizationOptions>(() => ({
        mode: inputTokenization,
        separator: inputSeparator
    }), [inputTokenization, inputSeparator]);

    const [activeCategory, setActiveCategory] = useState(() => {
        if (initialCategoryId && exerciciosDB[initialCategoryId]) return initialCategoryId;
        return 'afd';
    });
    const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
    const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
    const [solvingExercise, setSolvingExercise] = useState<number | null>(null);
    const [solverMode, setSolverMode] = useState<SolverMode>('automaton');
    const [userAutomaton, setUserAutomaton] = useState<AutomatoData | null>(null);
    const [userRegex, setUserRegex] = useState('');
    const [userGrammar, setUserGrammar] = useState('');
    const [grammarError, setGrammarError] = useState<string | null>(null);
    const [grammarWarnings, setGrammarWarnings] = useState<string[]>([]);
    const [userText, setUserText] = useState('');
    const [grammarTree, setGrammarTree] = useState<GrammarTree | null>(null);
    const [showExpected, setShowExpected] = useState(false);
    const [testResults, setTestResults] = useState<Record<string, 'pass' | 'fail' | 'running'>>({});
    const [lastFailure, setLastFailure] = useState<{ input: string; expected: string; received: string; reason?: string } | null>(null);
    const [lastTrace, setLastTrace] = useState<SimulationTraceStep[] | null>(null);
    const [equivalenceStatus, setEquivalenceStatus] = useState<'pass' | 'fail' | null>(null);
    const [regexError, setRegexError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [fastVerify, setFastVerify] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const exercicios = exerciciosDB[activeCategory] || [];
    const filteredExercicios = useMemo(() => {
        if (!searchQuery.trim()) return exercicios;
        const query = searchQuery.trim().toLowerCase();
        return exercicios.filter(ex =>
            ex.pergunta.toLowerCase().includes(query)
            || ex.dica?.toLowerCase().includes(query)
            || ex.respostaTexto?.toLowerCase().includes(query)
        );
    }, [exercicios, searchQuery]);
    const currentExercise = solvingExercise !== null
        ? exercicios.find(e => e.id === solvingExercise) ?? null
        : null;

    const tests = useMemo<TestCase[]>(() => currentExercise?.testes ?? [], [currentExercise]);
    const hasTests = tests.length > 0;
    const hasEquivalenceCheck = solverMode === 'automaton'
        && !!currentExercise?.respostaAutomato
        && userAutomaton?.tipo === 'AFD'
        && currentExercise?.respostaAutomato?.tipo === 'AFD';
    const canVerify = hasTests || hasEquivalenceCheck;
    const formatStateList = useCallback((ids: string[]) => {
        if (!ids || ids.length === 0) return 'vazio';
        return ids
            .map(id => userAutomaton?.estados.find(s => s.id === id)?.label || id)
            .join(', ');
    }, [userAutomaton]);

    useEffect(() => {
        if (!initialCategoryId) return;
        if (exerciciosDB[initialCategoryId]) {
            setActiveCategory(prev => (prev === initialCategoryId ? prev : initialCategoryId));
        }
    }, [initialCategoryId]);

    useEffect(() => {
        if (initialCategoryId) return;
        if (progress.exercises.lastCategory && exerciciosDB[progress.exercises.lastCategory]) {
            setActiveCategory(prev => (progress.exercises.lastCategory ? progress.exercises.lastCategory : prev));
        }
    }, [progress.exercises.lastCategory, initialCategoryId]);

    useEffect(() => {
        if (typeof initialExerciseId === 'number') {
            const exerciseExists = exerciciosDB[activeCategory]?.some(e => e.id === initialExerciseId);
            if (exerciseExists && solvingExercise !== initialExerciseId) {
                startSolving(initialExerciseId);
            }
            return;
        }
        if (initialExerciseId === null) {
            // Close modal if URL parameter is removed (e.g. Back button)
            if (solvingExercise !== null) {
                stopSolving();
            }
        }
    }, [initialExerciseId, activeCategory, solvingExercise]);

    useEffect(() => {
        if (
            activeCategory !== initialCategoryId ||
            solvingExercise !== initialExerciseId
        ) {
            onSelectionChange?.(activeCategory, solvingExercise);
        }
    }, [activeCategory, solvingExercise, onSelectionChange, initialCategoryId, initialExerciseId]);

    useEffect(() => {
        setLastCategory(activeCategory);
    }, [activeCategory, setLastCategory]);

    useEffect(() => {
        setSearchQuery('');
    }, [activeCategory]);


    const startSolving = (exerciseId: number) => {
        const config = categories.find(c => c.id === activeCategory);
        const exercise = exercicios.find(e => e.id === exerciseId);
        const mode = exercise?.mode ?? config?.mode ?? 'automaton';
        const tipo = exercise?.tipo ?? config?.tipo ?? 'AFD';
        setSolverMode(mode);
        setSolvingExercise(exerciseId);
        setShowExpected(false);
        setTestResults({});
        setLastFailure(null);
        setLastTrace(null);
        setEquivalenceStatus(null);
        setRegexError(null);
        setGrammarError(null);
        setGrammarWarnings([]);
        setGrammarTree(null);

        if (mode === 'automaton') {
            setUserAutomaton(createEmptyAutomaton(tipo));
        } else {
            setUserAutomaton(null);
        }

        if (mode === 'regex') {
            setUserRegex('');
        }

        if (mode === 'grammar') {
            setUserGrammar('');
        }

        if (mode === 'text') {
            setUserText('');
        }
    };

    const stopSolving = () => {
        setSolvingExercise(null);
        setUserAutomaton(null);
        setUserRegex('');
        setUserGrammar('');
        setGrammarError(null);
        setGrammarWarnings([]);
        setGrammarTree(null);
        setUserText('');
        setTestResults({});
        setLastFailure(null);
        setLastTrace(null);
        setEquivalenceStatus(null);
        setRegexError(null);
        setIsVerifying(false);
    };

    const modalRef = useDialog(solvingExercise !== null, () => stopSolving());
    const portalTarget = typeof document !== 'undefined' ? document.body : null;

    const resetAutomaton = () => {
        const config = categories.find(c => c.id === activeCategory);
        const tipo = currentExercise?.tipo ?? config?.tipo ?? 'AFD';
        setUserAutomaton(createEmptyAutomaton(tipo));
        setTestResults({});
        setLastFailure(null);
        setLastTrace(null);
        setEquivalenceStatus(null);
    };

    const runTestCase = useCallback((tc: TestCase, grammar?: GrammarData): SimulationResult => {
        if (solverMode === 'regex') {
            try {
                const nfa = regexToNfa(userRegex.trim());
                return simulateAutomaton(nfa, tc.input, tokenOptions);
            } catch (e) {
                return { status: 'rejected', reason: 'Regex invalida', finalStates: [] };
            }
        }

        if (solverMode === 'grammar') {
            if (!grammar) {
                return { status: 'rejected', reason: 'Gramatica invalida', finalStates: [] };
            }
            const result = deriveWordLeftmost(grammar, tc.input, {
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
            return { status: 'rejected', reason: 'Sem automato', finalStates: [] };
        }

        if (userAutomaton.tipo === 'AP') {
            return simulatePda(userAutomaton, tc.input, tokenOptions);
        }

        if (userAutomaton.tipo === 'MT' || userAutomaton.tipo === 'ALL') {
            return simulateTuring(userAutomaton, tc.input, tokenOptions);
        }

        return simulateAutomaton(userAutomaton, tc.input, tokenOptions);
    }, [solverMode, userRegex, userAutomaton, tokenOptions]);

    const verifySolution = useCallback(async () => {
        if (!currentExercise) return;
        if (solverMode === 'regex' && !userRegex.trim()) {
            setRegexError('Digite uma expressao regular para testar.');
            return;
        }

        if (solverMode === 'grammar' && !userGrammar.trim()) {
            setGrammarError('Digite uma gramatica para testar.');
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
                setGrammarError(parsed.error || 'Falha ao ler a gramatica.');
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
        tests.forEach((_, idx) => {
            runningResults[`${idx}`] = 'running';
        });
        setTestResults(runningResults);

        let allPassed = true;
        let hasFailureRecorded = false;
        const delayMs = fastVerify ? 0 : 150;
        for (let i = 0; i < tests.length; i += 1) {
            if (delayMs > 0) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }

            const tc = tests[i];
            const result = runTestCase(tc, parsedGrammar);
            const passed = (tc.expected === 'accept' && result.status === 'accepted') ||
                (tc.expected === 'reject' && result.status === 'rejected');

            if (!passed && allPassed) {
                setLastFailure({
                    input: tc.input || EPSILON_SYMBOL,
                    expected: tc.expected === 'accept' ? 'Aceita' : 'Rejeita',
                    received: result.status === 'accepted' ? 'Aceita' : 'Rejeita',
                    reason: result.reason
                });
                hasFailureRecorded = true;
                if (solverMode === 'automaton' && userAutomaton && (userAutomaton.tipo === 'AFD' || userAutomaton.tipo === 'AFN')) {
                    const traceResult = simulateWithTrace(userAutomaton, tc.input, tokenOptions);
                    setLastTrace(traceResult.trace);
                }
                if (solverMode === 'regex' && userRegex.trim()) {
                    try {
                        const nfa = regexToNfa(userRegex.trim());
                        const traceResult = simulateWithTrace(nfa, tc.input, tokenOptions);
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

            setTestResults(prev => ({
                ...prev,
                [`${i}`]: passed ? 'pass' : 'fail'
            }));
        }

        if (hasEquivalenceCheck && userAutomaton && currentExercise?.respostaAutomato) {
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
                        reason: 'Automato nao e equivalente ao gabarito.'
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

        setIsVerifying(false);
    }, [
        currentExercise,
        solverMode,
        userRegex,
        userGrammar,
        userAutomaton,
        hasTests,
        hasEquivalenceCheck,
        tests,
        runTestCase,
        activeCategory,
        markExerciseCompleted,
        fastVerify,
        tokenOptions
    ]);

const markCompletedManually = () => {
        if (!currentExercise) return;
        markExerciseCompleted(activeCategory, currentExercise.id);
    };

    const answeredLabel = isExerciseCompleted(activeCategory, currentExercise?.id ?? null);

    return (
        <div className="h-full flex flex-col md:flex-row gap-8 animate-fade-in pb-10">

            {/* Sidebar Navigation */}
            <div className="md:w-64 flex-shrink-0">
                <div className="glass-panel p-2 rounded-3xl sticky top-28">
                    <div className="flex items-center gap-2 px-4 py-3 text-secondary mb-1">
                        <ListFilter size={14} />
                        <span className="ui-kicker-xs">Tópicos</span>
                    </div>
                    <div className="space-y-1">
                                    {categories.map(cat => {
                                        const count = exerciciosDB[cat.id]?.length || 0;
                                        const isActive = activeCategory === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => {
                                                    setActiveCategory(cat.id);
                                                    setLastCategory(cat.id);
                                                    setRevealedHints({});
                                                    setRevealedAnswers({});
                                                }}
                                    className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex justify-between items-center group relative overflow-hidden
                                        ${isActive
                                        ? 'text-white font-bold shadow-lg shadow-blue-500/20'
                                        : 'text-secondary hover:bg-black/5 dark:hover:bg-white/10'
                                    }`}
                                >
                                    {isActive && (
                                        <div className="absolute inset-0 bg-ios-blue -z-10" />
                                    )}
                                    <span className="flex-1">{cat.label}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        count === 0
                                            ? 'bg-black/5 dark:bg-white/10 text-secondary'
                                            : isActive
                                                ? 'bg-white/20 text-white'
                                                : 'bg-black/5 dark:bg-white/10 text-secondary'
                                    }`}>
                                        {count}
                                    </span>
                                    {isActive && <ChevronRight size={14} className="opacity-80 ml-2" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 space-y-6">
                <div className="flex flex-wrap items-end justify-between mb-4 px-2 gap-4">
                    <div>
                        <h2 className="ui-title-2 text-primary mb-1">{categories.find(c => c.id === activeCategory)?.label}</h2>
                        <p className="ui-body-sm text-secondary">Lista de exercícios práticos</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar exercício..."
                            className="px-3 py-2 rounded-xl bg-surface-2 border border-default text-sm font-medium text-primary outline-none focus:ring-2 ring-ios-blue/40 shadow-inner"
                        />
                        <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-xs font-bold text-secondary">
                            {filteredExercicios.length}/{exercicios.length} Questões
                        </span>
                    </div>
                </div>

                {filteredExercicios.map((ex, idx) => (
                    <div 
                        key={ex.id} 
                        className="glass-card overflow-hidden group hover:shadow-apple-md animate-slide-in-up opacity-0"
                        style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'forwards' }}
                    >
                        <div className="p-8">
                            <div className="flex gap-5 items-start">
                                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 text-secondary font-mono font-bold text-lg flex items-center justify-center border border-default">
                                    {ex.id}
                                </span>
                                <h3 className="text-lg font-medium text-primary leading-relaxed pt-1">{ex.pergunta}</h3>
                            </div>

                            <div className="flex flex-wrap gap-3 mt-8 ml-14">
                                <button
                                    onClick={() => startSolving(ex.id)}
                                    className={`btn-icon px-4 py-2.5 rounded-xl text-[13px] font-bold gap-2 border transition-all
                                        ${isExerciseCompleted(activeCategory, ex.id)
                                            ? 'bg-ios-green/15 text-ios-green border-ios-green/30'
                                            : 'bg-ios-green/12 text-ios-green border-ios-green/30 shadow-apple-sm hover:bg-ios-green hover:text-white hover:border-ios-green/60 hover:shadow-apple-md hover:scale-[1.01] active:scale-[0.99]'
                                        }`}
                                >
                                    {isExerciseCompleted(activeCategory, ex.id) ? (
                                        <>
                                            <Trophy size={14} />
                                            Resolvido!
                                        </>
                                    ) : (
                                        <>
                                            <Pencil size={14} />
                                            Tentar Resolver
                                        </>
                                    )}
                                </button>

                                {ex.dica && (
                                    <button
                                        onClick={() => setRevealedHints(p => ({ ...p, [ex.id]: !p[ex.id] }))}
                                        className={`btn-icon px-4 rounded-xl text-sm font-bold gap-2 border shadow-apple-sm ${
                                            revealedHints[ex.id]
                                                ? 'bg-orange-100/80 text-orange-700 border-orange-200/80 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20'
                                                : 'bg-surface-soft text-primary border-default hover:bg-surface-strong dark:text-secondary'
                                        }`}
                                    >
                                        <Lightbulb size={14} className={revealedHints[ex.id] ? 'fill-current' : ''} />
                                        {revealedHints[ex.id] ? 'Esconder' : 'Dica'}
                                    </button>
                                )}
                                <button
                                    onClick={() => setRevealedAnswers(p => ({ ...p, [ex.id]: !p[ex.id] }))}
                                    className={`btn-icon px-4 rounded-xl text-sm font-bold gap-2 border shadow-apple-sm ${
                                        revealedAnswers[ex.id]
                                            ? 'bg-blue-100/80 text-ios-blue border-blue-200/80 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20'
                                            : 'bg-surface-soft text-primary border-default hover:bg-surface-strong dark:text-secondary'
                                    }`}
                                >
                                    {revealedAnswers[ex.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                    {revealedAnswers[ex.id] ? 'Esconder' : 'Ver Resposta'}
                                </button>
                            </div>
                        </div>

                        {/* Hint Section */}
                        {revealedHints[ex.id] && ex.dica && (
                            <div className="mx-8 mb-6 ml-20 p-4 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-200/50 dark:border-orange-500/20 rounded-2xl text-orange-700 dark:text-orange-300 text-sm animate-scale-in">
                                <span className="font-bold mr-2 block mb-1 uppercase tracking-wide text-xs">Pista</span>{ex.dica}
                            </div>
                        )}

                        {/* Answer Section */}
                        {revealedAnswers[ex.id] && (
                            <div className="bg-black/5 dark:bg-black/20 border-t border-default p-8 animate-fade-in">
                                <div className="ml-14">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle2 size={16} strokeWidth={3} className="text-ios-green" />
                                        <span className="ui-kicker text-secondary">Solução</span>
                                    </div>

                                    {ex.respostaTexto && (
                                        <p className="text-primary whitespace-pre-line leading-relaxed font-mono text-sm bg-white dark:bg-white/5 p-6 rounded-2xl border border-default shadow-sm">
                                            {ex.respostaTexto}
                                        </p>
                                    )}

                                    {ex.respostaAutomato && (
                                        <div className="mt-8 pt-6 border-t border-default">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-ios-green animate-pulse"></div>
                                                    <span className="ui-kicker text-secondary">Gabarito Visual</span>
                                                </div>
                                                <button
                                                    onClick={() => onSimulate(ex.respostaAutomato!)}
                                                    className="group flex items-center gap-2 px-4 py-2 rounded-full bg-ios-blue/10 hover:bg-ios-blue text-ios-blue hover:text-white text-xs font-bold transition-all duration-300"
                                                >
                                                    <Play size={12} fill="currentColor" />
                                                    Simular
                                                </button>
                                            </div>
                                            <div className="h-80 w-full bg-white dark:bg-black rounded-3xl border border-default shadow-inner overflow-hidden relative">
                                                <AutomatonPreview data={ex.respostaAutomato} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {filteredExercicios.length === 0 && (
                    <div className="p-6 rounded-2xl border border-dashed border-default text-sm text-secondary">
                        Nenhum exercício encontrado para esta busca.
                    </div>
                )}
            </div>

            {/* Exercise Solving Workspace Modal */}
            {portalTarget && solvingExercise !== null && currentExercise && createPortal(
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
                    onClick={stopSolving}
                >
                    <div
                        ref={modalRef}
                        className="w-[98vw] h-[95vh] glass-panel rounded-3xl overflow-hidden flex flex-col animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-default flex items-center justify-between bg-surface-1">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-ios-green/10 text-ios-green">
                                    <Pencil size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-primary">
                                        Exercício {solvingExercise}
                                    </h3>
                                    <p className="text-sm text-secondary max-w-lg truncate">
                                        {currentExercise.pergunta}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {solverMode === 'automaton' && (
                                    <button
                                        onClick={resetAutomaton}
                                        className="p-2 rounded-lg text-secondary hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                        title="Resetar"
                                    >
                                        <RotateCcw size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={stopSolving}
                                    className="p-2 rounded-lg text-secondary hover:text-ios-red hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    title="Fechar"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 flex overflow-hidden">
                            {/* Left */}
                            <div className="flex-1 relative overflow-hidden">
                                {solverMode === 'automaton' && userAutomaton && (
                                    <AutomatonEditor
                                        data={userAutomaton}
                                        onChange={setUserAutomaton}
                                        readOnly={false}
                                        compact={true}
                                    />
                                )}

                                {solverMode === 'regex' && (
                                    <div className="p-6 md:p-8 h-full overflow-y-auto">
                                        <div className="flex items-center gap-2 ui-kicker text-secondary mb-4">
                                            <Braces size={14} />
                                            Expressao Regular
                                        </div>
                                        <input
                                            type="text"
                                            value={userRegex}
                                            onChange={(e) => { setUserRegex(e.target.value); setRegexError(null); }}
                                            placeholder="Ex: (a+b)*abb"
                                            className="w-full bg-surface-2 border border-default rounded-2xl px-4 py-3 text-lg font-mono text-primary outline-none focus:ring-2 ring-ios-blue/40 shadow-inner"
                                        />
                                        {regexError && (
                                            <p className="mt-3 text-sm text-ios-red flex items-center gap-2">
                                                <XCircle size={14} /> {regexError}
                                            </p>
                                        )}
                                        <div className="mt-6 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-default text-sm text-secondary leading-relaxed">
                                            Use <code className="font-mono">+</code> para uniao, <code className="font-mono">*</code> para fecho, <code className="font-mono">?</code> para opcional, e <code className="font-mono">eps</code> para vazio.
                                        </div>
                                    </div>
                                )}

                                {solverMode === 'grammar' && (
                                    <div className="p-6 md:p-8 h-full overflow-y-auto">
                                        <div className="flex items-center gap-2 ui-kicker text-secondary mb-4">
                                            <FileText size={14} />
                                            Gramatica
                                        </div>
                                        <textarea
                                            value={userGrammar}
                                            onChange={(e) => { setUserGrammar(e.target.value); setGrammarError(null); }}
                                            placeholder="S -> a S b | eps"
                                            className="w-full h-64 bg-surface-2 border border-default rounded-2xl px-4 py-3 text-sm font-mono text-primary outline-none focus:ring-2 ring-ios-blue/40 shadow-inner"
                                        />
                                        {grammarError && (
                                            <p className="mt-3 text-sm text-ios-red flex items-center gap-2">
                                                <XCircle size={14} /> {grammarError}
                                            </p>
                                        )}
                                        {grammarWarnings.length > 0 && (
                                            <div className="mt-3 text-xs text-yellow-700">
                                                {grammarWarnings.map((warn, idx) => (
                                                    <div key={`${warn}-${idx}`}>- {warn}</div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="mt-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-default text-sm text-secondary leading-relaxed">
                                            Formato: <code className="font-mono">S -&gt; a S b | eps</code>. Use espacos para simbolos multi-caractere.
                                        </div>
                                        {grammarTree && (
                                            <div className="mt-6 border-t border-default pt-6">
                                                <div className="ui-kicker text-secondary mb-4">
                                                    Última Árvore Gerada (Falha)
                                                </div>
                                                <div className="h-64 rounded-xl border border-default bg-surface-muted overflow-hidden">
                                                    <DerivationTreeVisualizer tree={grammarTree} autoPlay={true} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {solverMode === 'text' && (
                                    <div className="p-6 md:p-8 h-full overflow-y-auto">
                                        <div className="flex items-center gap-2 ui-kicker text-secondary mb-4">
                                            <FileText size={14} />
                                            Resposta aberta
                                        </div>
                                        <textarea
                                            value={userText}
                                            onChange={(e) => setUserText(e.target.value)}
                                            placeholder="Escreva sua solução aqui..."
                                            className="w-full h-64 bg-surface-2 border border-default rounded-2xl px-4 py-3 text-sm text-primary outline-none focus:ring-2 ring-ios-blue/40 shadow-inner"
                                        />
                                        <div className="mt-4 flex items-center gap-3">
                                            <button
                                                onClick={markCompletedManually}
                                                className="px-4 py-2 rounded-xl bg-ios-green text-white text-xs font-bold hover:bg-green-600 transition-colors"
                                            >
                                                Marcar como concluído
                                            </button>
                                            {answeredLabel && (
                                                <span className="text-xs text-ios-green font-bold flex items-center gap-2">
                                                    <Trophy size={14} /> Concluído
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Panel */}
                            <div className="w-80 border-l border-default flex flex-col bg-surface-1 backdrop-blur-xl">
                                <div className="p-4 border-b border-default">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h4 className="font-bold text-sm text-primary mb-1">Casos de Teste</h4>
                                            <p className="text-xs text-secondary">
                                                {hasTests ? 'Seu resultado será verificado com estas entradas' : 'Sem verificação automática'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {hasTests && (
                                                <button
                                                    onClick={() => setShowExpected(s => !s)}
                                                    className="text-xs font-bold text-ios-blue hover:opacity-80 transition-colors"
                                                >
                                                    {showExpected ? 'Ocultar' : 'Mostrar'} esperado
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setFastVerify(s => !s)}
                                                className={`text-xs font-bold transition-colors ${fastVerify ? 'text-ios-green' : 'text-secondary hover:text-ios-blue'}`}
                                                title={fastVerify ? 'Execução rápida' : 'Execução com animação'}
                                            >
                                                {fastVerify ? 'Rápido' : 'Normal'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-surface-1">
                                    {hasTests ? tests.map((tc, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all
                                                ${testResults[`${idx}`] === 'pass'
                                                    ? 'bg-ios-green/10 border-ios-green/30'
                                                    : testResults[`${idx}`] === 'fail'
                                                        ? 'bg-ios-red/10 border-ios-red/30'
                                                        : 'bg-surface-2 border-default'
                                                }`}
                                        >
                                            <div className="w-6 h-6 flex items-center justify-center">
                                                {testResults[`${idx}`] === 'running' ? (
                                                    <Loader2 size={16} className="text-ios-blue animate-spin" />
                                                ) : testResults[`${idx}`] === 'pass' ? (
                                                    <CheckCircle2 size={16} strokeWidth={3} className="text-ios-green" />
                                                ) : testResults[`${idx}`] === 'fail' ? (
                                                    <XCircle size={16} className="text-ios-red" />
                                                ) : (
                                                    <div className="w-2 h-2 rounded-full bg-text-secondary-30" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <code className="text-sm font-mono text-primary block truncate">
                                                    "{tc.input || EPSILON_SYMBOL}"
                                                </code>
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-xl border ${
                                                showExpected
                                                    ? (tc.expected === 'accept' ? 'bg-ios-green/15 text-ios-green border-ios-green/20' : 'bg-ios-red/15 text-ios-red border-ios-red/20')
                                                    : 'bg-surface-2 text-secondary border-default'
                                            }`}>
                                                {showExpected ? (tc.expected === 'accept' ? 'Aceita' : 'Rejeita') : 'Oculto'}
                                            </span>
                                        </div>
                                    )) : (
                                        <div className="p-4 rounded-2xl border border-dashed border-default text-sm text-secondary">
                                            Este exercício é conceitual. Compare sua solução com o gabarito quando terminar.
                                        </div>
                                    )}
                                </div>

                                {lastFailure && (
                                    <div className="p-4 border-t border-default bg-ios-red/10">
                                        <div className="ui-kicker text-ios-red mb-2">Primeiro erro</div>
                                        <div className="text-xs text-ios-red/80">
                                            Entrada: <code className="font-mono bg-ios-red/10 px-1 rounded">{lastFailure.input}</code> · Esperado: {lastFailure.expected} · Obtido: {lastFailure.received}
                                        </div>
                                        {lastFailure.reason && (
                                            <div className="mt-2 text-xs text-ios-red/70">{lastFailure.reason}</div>
                                        )}
                                    </div>
                                )}

                                {equivalenceStatus && (
                                    <div className={`p-4 border-t border-default ${equivalenceStatus === 'pass' ? 'bg-ios-green/10' : 'bg-ios-red/10'}`}>
                                        <div className={`ui-kicker mb-2 ${equivalenceStatus === 'pass' ? 'text-ios-green' : 'text-ios-red'}`}>
                                            Equivalência DFA
                                        </div>
                                        <div className={`text-xs ${equivalenceStatus === 'pass' ? 'text-ios-green/80' : 'text-ios-red/80'}`}>
                                            {equivalenceStatus === 'pass'
                                                ? 'Autômato equivalente ao gabarito.'
                                                : 'Autômato diferente do gabarito.'}
                                        </div>
                                    </div>
                                )}

                                {lastTrace && lastTrace.length > 0 && (
                                    <div className="p-4 border-t border-default bg-surface-1">
                                        <div className="ui-kicker text-secondary mb-2">Traço de execução</div>
                                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                            {lastTrace.map((step, idx) => (
                                                <div key={`${idx}-${step.symbol}`} className="text-[11px] text-secondary">
                                                    <span className="font-bold">Passo {idx + 1}</span> — símbolo <code className="font-mono">{step.symbol}</code>
                                                    <div>De: {formatStateList(step.fromStates)}</div>
                                                    {step.directTargets.length > 0 && (
                                                        <div>Alvo direto: {formatStateList(step.directTargets)}</div>
                                                    )}
                                                    <div>Para: {formatStateList(step.toStates)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {Object.keys(testResults).length > 0 && (
                                    <div className="p-4 border-t border-default bg-surface-1">
                                        {Object.values(testResults).every(r => r === 'pass') && equivalenceStatus !== 'fail' ? (
                                            <div className="flex items-center gap-3 text-ios-green">
                                                <Trophy size={24} className="animate-bounce-subtle" />
                                                <div>
                                                    <p className="font-bold">Parabéns!</p>
                                                    <p className="text-xs opacity-80">Todos os testes passaram</p>
                                                </div>
                                            </div>
                                        ) : Object.values(testResults).some(r => r === 'fail') || equivalenceStatus === 'fail' ? (
                                            <div className="flex items-center gap-3 text-ios-red">
                                                <XCircle size={24} />
                                                <div>
                                                    <p className="font-bold">Tente novamente</p>
                                                    <p className="text-xs opacity-80">
                                                        {Object.values(testResults).filter(r => r === 'fail').length} teste(s) falharam
                                                    </p>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                )}

                                <div className="p-4 border-t border-default bg-surface-1">
                                    <button
                                        onClick={verifySolution}
                                        disabled={isVerifying || !canVerify || (solverMode === 'automaton' && (!userAutomaton || userAutomaton.estados.length === 0))}
                                        className="w-full py-3 rounded-2xl bg-ios-blue text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-ios-blue/20"
                                    >
                                        {isVerifying ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Verificando...
                                            </>
                                        ) : (
                                            <>
                                                <Play size={18} fill="currentColor" />
                                                Verificar solução
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                portalTarget
            )}
        </div>
    );
};
