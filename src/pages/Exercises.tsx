import { useState, useCallback, useEffect, useMemo, useRef, useId } from 'react';
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
    FileText,
    ArrowRightLeft
} from 'lucide-react';
import type { AutomatoData, TestCase } from '../types';
import { exerciciosDB } from '../data/constants';
import { AutomatonEditor, AutomatonPreview } from '../components/automaton';
import { regexToNfa, areDfaEquivalent } from '../utils/conversions';
import { deriveWordLeftmost, parseGrammar, type GrammarData } from '../utils/grammar';
import { EPSILON_SYMBOL, type TokenizationOptions } from '../utils/symbols';
import { useDialog } from '../hooks/useDialog';
import { useProgress } from '../hooks/useProgress';
import { useUiSettings } from '../hooks/useUiSettings';
import { DerivationTreeVisualizer, ConversionTool } from '../components/ui';
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
    { id: 'lex', label: 'Léxico', tipo: 'AFD', mode: 'automaton' },
    { id: 'afn', label: 'AFNs', tipo: 'AFN', mode: 'automaton' },
    { id: 'afne', label: 'AFN-eps', tipo: 'AFN', mode: 'automaton' },
    { id: 'er', label: 'Regex', mode: 'regex' },
    { id: 'gr', label: 'Gramática Regular', mode: 'grammar' },
    { id: 'cfg', label: 'GLC', mode: 'grammar' },
    { id: 'pda', label: 'Autômato de Pilha', tipo: 'AP', mode: 'automaton' },
    { id: 'chomsky', label: 'Chomsky', mode: 'text' },
    { id: 'turing', label: 'Turing', tipo: 'MT', mode: 'automaton' },
    { id: 'minimizacao', label: 'Minimização', mode: 'text' },
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
        setLastCategory,
        resetExercises
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
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [showConverter, setShowConverter] = useState(false);
    const searchInputId = useId();
    const sidebarId = useId();
    const modalTitleId = useId();
    const modalDescriptionId = useId();
    const regexErrorId = useId();
    const grammarErrorId = useId();
    const [converterData, setConverterData] = useState<{
        automaton?: AutomatoData | null;
        grammar?: string;
        regex?: string;
    }>({});
    const lastUrlSelectionRef = useRef<{
        categoryId?: string;
        exerciseId: number | null | undefined;
    } | null>(null);
    const verifyRunRef = useRef(0);
    const lastSyncedSelectionRef = useRef<{
        categoryId: string;
        exerciseId: number | null;
    } | null>(null);

    const openConverter = (data: typeof converterData) => {
        setConverterData(data);
        setShowConverter(true);
    };

    const exercicios = useMemo(() => exerciciosDB[activeCategory] || [], [activeCategory]);

    const startSolving = useCallback((exerciseId: number) => {
        verifyRunRef.current += 1;
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
    }, [activeCategory, exercicios]);

    const stopSolving = useCallback(() => {
        verifyRunRef.current += 1;
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
    }, []);

    const filteredExercicios = useMemo(() => {
        if (!searchQuery.trim()) return exercicios;
        const query = searchQuery.trim().toLowerCase();
        return exercicios.filter(ex =>
            ex.id.toString() === query
            || ex.pergunta.toLowerCase().includes(query)
            || ex.dica?.toLowerCase().includes(query)
            || ex.respostaTexto?.toLowerCase().includes(query)
        );
    }, [exercicios, searchQuery]);

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return categories;
        const query = searchQuery.trim().toLowerCase();
        return categories.filter(cat =>
            cat.label.toLowerCase().includes(query)
        );
    }, [searchQuery]);

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
    const verifyDisabledReason = !canVerify
        ? 'Este exercício não possui validação automática.'
        : solverMode === 'automaton' && (!userAutomaton || userAutomaton.estados.length === 0)
            ? 'Crie pelo menos um estado no autômato para verificar a solução.'
            : null;
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
        if (initialCategoryId && activeCategory !== initialCategoryId) {
            return;
        }

        const nextUrlSelection = { categoryId: initialCategoryId, exerciseId: initialExerciseId };
        if (
            lastUrlSelectionRef.current &&
            lastUrlSelectionRef.current.categoryId === nextUrlSelection.categoryId &&
            lastUrlSelectionRef.current.exerciseId === nextUrlSelection.exerciseId
        ) {
            return;
        }
        lastUrlSelectionRef.current = nextUrlSelection;

        if (typeof initialExerciseId === 'number') {
            const categoryId = initialCategoryId ?? activeCategory;
            const exerciseExists = exerciciosDB[categoryId]?.some(e => e.id === initialExerciseId);
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
    }, [initialExerciseId, initialCategoryId, activeCategory, solvingExercise, startSolving, stopSolving]);

    useEffect(() => {
        if (!onSelectionChange) return;

        if (activeCategory === initialCategoryId && solvingExercise === initialExerciseId) {
            lastSyncedSelectionRef.current = { categoryId: activeCategory, exerciseId: solvingExercise };
            return;
        }

        const nextSelection = { categoryId: activeCategory, exerciseId: solvingExercise };
        if (
            lastSyncedSelectionRef.current &&
            lastSyncedSelectionRef.current.categoryId === nextSelection.categoryId &&
            lastSyncedSelectionRef.current.exerciseId === nextSelection.exerciseId
        ) {
            return;
        }

        lastSyncedSelectionRef.current = nextSelection;
        onSelectionChange(activeCategory, solvingExercise);
    }, [activeCategory, solvingExercise, onSelectionChange, initialCategoryId, initialExerciseId]);

    useEffect(() => {
        setLastCategory(activeCategory);
    }, [activeCategory, setLastCategory]);

    useEffect(() => {
        setSearchQuery('');
    }, [activeCategory]);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        if (!isSidebarOpen || window.innerWidth >= 768) return undefined;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isSidebarOpen]);

    useEffect(() => {
        if (!isSidebarOpen) return undefined;
        const onEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('keydown', onEscape);
        return () => window.removeEventListener('keydown', onEscape);
    }, [isSidebarOpen]);


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
            } catch {
                return { status: 'rejected', reason: 'Regex inválida', finalStates: [] };
            }
        }

        if (solverMode === 'grammar') {
            if (!grammar) {
                return { status: 'rejected', reason: 'Gramática inválida', finalStates: [] };
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
            return { status: 'rejected', reason: 'Sem autômato', finalStates: [] };
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
        if (isVerifying) return;
        const runId = verifyRunRef.current + 1;
        verifyRunRef.current = runId;
        const isCancelled = () => verifyRunRef.current !== runId;

        if (!currentExercise) return;
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
            if (isCancelled()) return;

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

        if (isCancelled()) return;

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
        isVerifying,
        tokenOptions
    ]);

const markCompletedManually = () => {
        if (!currentExercise) return;
        markExerciseCompleted(activeCategory, currentExercise.id);
    };

    const answeredLabel = isExerciseCompleted(activeCategory, currentExercise?.id ?? null);
    const totalExercisesCount = useMemo(
        () => Object.values(exerciciosDB).reduce((sum, list) => sum + list.length, 0),
        []
    );
    const completedExercisesCount = useMemo(() => {
        let count = 0;
        for (const [categoryId, list] of Object.entries(exerciciosDB)) {
            for (const exercise of list) {
                if (progress.exercises.completed[`${categoryId}-${exercise.id}`]) {
                    count += 1;
                }
            }
        }
        return count;
    }, [progress.exercises.completed]);
    const completedInActiveCategory = useMemo(
        () => exercicios.filter((exercise) => isExerciseCompleted(activeCategory, exercise.id)).length,
        [activeCategory, exercicios, isExerciseCompleted]
    );
    const exercisesProgressPercent = totalExercisesCount === 0
        ? 0
        : Math.round((completedExercisesCount / totalExercisesCount) * 100);

    const handleCategorySelect = useCallback((categoryId: string) => {
        setActiveCategory(categoryId);
        setLastCategory(categoryId);
        setRevealedHints({});
        setRevealedAnswers({});
        setSidebarOpen(false);
    }, [setLastCategory]);

    useEffect(() => {
        if (solvingExercise === null) return undefined;
        const onKeyDown = (event: KeyboardEvent) => {
            if (!(event.ctrlKey || event.metaKey) || event.key !== 'Enter') return;
            if (isVerifying || verifyDisabledReason) return;
            event.preventDefault();
            void verifySolution();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [solvingExercise, isVerifying, verifyDisabledReason, verifySolution]);

    return (
        <div className="relative flex w-full min-w-0 min-h-[calc(100dvh-9.5rem)] md:h-[calc(100dvh-9.5rem)] animate-fade-in gap-4 md:gap-6 md:pb-4">
            <div className="md:hidden fixed bottom-6 right-6 z-[60]">
                <button
                    type="button"
                    onClick={() => setSidebarOpen(!isSidebarOpen)}
                    aria-expanded={isSidebarOpen}
                    aria-controls={sidebarId}
                    aria-label={isSidebarOpen ? 'Fechar sumário de exercícios' : 'Abrir sumário de exercícios'}
                    className="bg-ios-blue text-white p-4 rounded-full shadow-apple-xl flex items-center justify-center active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                >
                    {isSidebarOpen ? <X size={24} /> : <ListFilter size={24} />}
                </button>
            </div>

            {isSidebarOpen && (
                <button
                    className="md:hidden fixed inset-0 z-30 bg-black/45 backdrop-blur-[2px]"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Fechar sumário de exercícios"
                />
            )}

            {/* Sidebar Navigation */}
            <aside
                id={sidebarId}
                className={`
                    fixed md:relative top-[5.5rem] bottom-0 md:top-auto md:bottom-auto left-0 z-40 w-[88vw] max-w-[22rem]
                    md:w-[22rem] md:max-w-[22rem] md:min-w-[22rem]
                    ${isSidebarOpen ? 'bg-surface-1-95 backdrop-blur-2xl' : 'bg-transparent'}
                    md:bg-transparent md:backdrop-blur-none
                    border-r border-default md:border-r-0
                    transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    flex flex-col md:h-full
                `}
            >
                <div className="h-full min-w-0 glass-panel rounded-3xl flex flex-col overflow-hidden shadow-apple-md">
                    <div className="p-6 border-b border-default bg-surface-1 backdrop-blur-md sticky top-0 z-10 rounded-t-3xl">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-ios-green" />
                            <span className="ui-kicker-xs text-secondary">DCC063 • Prática</span>
                        </div>
                        <div className="text-2xl font-bold text-primary flex items-center gap-3">
                            <ListFilter size={24} className="text-ios-blue" />
                            Sumário
                        </div>

                        <div className="mt-4">
                            <div className="flex items-center justify-between text-xs mb-2">
                                <span className="text-secondary font-medium">Progresso</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-ios-green font-bold">{exercisesProgressPercent}%</span>
                                    <button
                                        onClick={resetExercises}
                                        className="p-1 text-secondary hover:text-ios-red transition-colors"
                                        title="Resetar progresso de exercícios"
                                        aria-label="Resetar progresso de exercícios"
                                    >
                                        <RotateCcw size={12} />
                                    </button>
                                </div>
                            </div>
                            <div className="h-2.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden shadow-inner border border-black/5 dark:border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-ios-green via-emerald-500 to-ios-teal rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(52,199,89,0.4)]"
                                    style={{ width: `${exercisesProgressPercent}%` }}
                                />
                            </div>
                            <div className="mt-2 text-xs text-secondary">
                                {completedExercisesCount}/{totalExercisesCount} exercícios concluídos
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="sr-only" htmlFor={searchInputId}>Buscar exercício</label>
                            <input
                                id={searchInputId}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar exercício..."
                                aria-label="Buscar exercício"
                                className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-default text-sm font-medium text-primary outline-none focus:ring-2 ring-ios-blue/40 shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="p-2 pb-6 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                        {filteredCategories.map((cat) => {
                            const index = categories.findIndex(c => c.id === cat.id);
                            const count = exerciciosDB[cat.id]?.length || 0;
                            const done = (exerciciosDB[cat.id] || []).filter((exercise) => isExerciseCompleted(cat.id, exercise.id)).length;
                            const isActive = activeCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategorySelect(cat.id)}
                                    className={`group w-full text-left pl-3 pr-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden flex items-center gap-3 mb-1
                                        ${isActive
                                            ? 'text-status-info bg-status-info-soft border border-status-info shadow-sm'
                                            : 'text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                                        }`}
                                >
                                    <span className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono
                                        ${isActive ? 'bg-ios-blue text-white' : 'bg-black/5 dark:bg-white/10 text-secondary'}`}>
                                        {index + 1}
                                    </span>
                                    <span className="flex-1 truncate">{cat.label}</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                                        isActive
                                            ? 'bg-ios-blue/10 border-ios-blue/30 text-ios-blue'
                                            : 'bg-surface-2 border-default text-secondary'
                                    }`}>
                                        {done}/{count}
                                    </span>
                                    {isActive && <ChevronRight size={14} className="opacity-80" />}
                                </button>
                            );
                        })}
                        {filteredCategories.length === 0 && (
                            <div className="p-4 text-xs text-secondary text-center italic">
                                Nenhuma categoria encontrada
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Content List */}
            <div className="flex-1 min-w-0 space-y-6 overflow-y-auto custom-scrollbar md:pr-1 pb-10">
                <div className="glass-card p-6 flex flex-col gap-4">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h2 className="ui-title-2 text-primary mb-1">{categories.find(c => c.id === activeCategory)?.label}</h2>
                            <p className="ui-body-sm text-secondary">Lista de exercícios práticos</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="badge bg-surface-muted text-secondary border-default">
                                {completedInActiveCategory}/{exercicios.length} concluídos
                            </span>
                            <span className="badge bg-surface-muted text-secondary border-default">
                                {filteredExercicios.length}/{exercicios.length} questões
                            </span>
                            <button
                                onClick={() => openConverter({})}
                                className="p-2 rounded-xl bg-surface-2 border border-default text-secondary hover:text-ios-blue hover:border-ios-blue/40 transition-all"
                                title="Abrir conversor"
                                aria-label="Abrir conversor de modelos"
                            >
                                <ArrowRightLeft size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {filteredExercicios.map((ex, idx) => (
                    <div 
                        key={ex.id} 
                        className="glass-card overflow-hidden group hover:shadow-apple-md animate-slide-in-up opacity-0"
                        style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'forwards' }}
                    >
                        <div className="p-5 sm:p-6 lg:p-8">
                            <div className="flex gap-4 sm:gap-5 items-start">
                                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 text-secondary font-mono font-bold text-lg flex items-center justify-center border border-default">
                                    {ex.id}
                                </span>
                                <h3 className="text-lg font-medium text-primary leading-relaxed pt-1">{ex.pergunta}</h3>
                            </div>

                            <div className="flex flex-wrap gap-3 mt-6 sm:mt-8 ml-0 sm:ml-14">
                                <button
                                    onClick={() => startSolving(ex.id)}
                                    className={`btn-icon px-4 py-2.5 rounded-xl text-[13px] font-bold gap-2 border transition-all
                                        ${isExerciseCompleted(activeCategory, ex.id)
                                            ? 'bg-status-success-soft text-status-success border-status-success'
                                            : 'bg-status-success-soft text-status-success border-status-success shadow-apple-sm hover:bg-ios-green hover:text-white hover:shadow-apple-md hover:scale-[1.01] active:scale-[0.99]'
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
                                                ? 'bg-status-warning-soft text-status-warning border-status-warning'
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
                                            ? 'bg-status-info-soft text-status-info border-status-info'
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
                            <div className="mx-4 sm:mx-8 mb-6 sm:ml-20 p-4 bg-status-warning-soft border border-status-warning rounded-2xl text-status-warning text-sm animate-scale-in">
                                <span className="font-bold mr-2 block mb-1 uppercase tracking-wide text-xs">Pista</span>{ex.dica}
                            </div>
                        )}

                        {/* Answer Section */}
                        {revealedAnswers[ex.id] && (
                            <div className="bg-black/5 dark:bg-black/20 border-t border-default p-5 sm:p-8 animate-fade-in">
                                <div className="sm:ml-14">
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
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-ios-green"></div>
                                                    <span className="ui-kicker text-secondary">Gabarito Visual</span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <button
                                                        onClick={() => openConverter({ automaton: ex.respostaAutomato })}
                                                        className="group flex items-center gap-2 px-4 py-2 rounded-full bg-status-accent-soft text-status-accent hover:bg-ios-purple hover:text-white text-xs font-bold transition-all duration-300"
                                                    >
                                                        <ArrowRightLeft size={12} />
                                                        Converter
                                                    </button>
                                                    <button
                                                        onClick={() => onSimulate(ex.respostaAutomato!)}
                                                        className="group flex items-center gap-2 px-4 py-2 rounded-full bg-status-info-soft text-status-info hover:bg-ios-blue hover:text-white text-xs font-bold transition-all duration-300"
                                                    >
                                                        <Play size={12} fill="currentColor" />
                                                        Simular
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="h-64 sm:h-80 w-full bg-white dark:bg-black rounded-3xl border border-default shadow-inner overflow-hidden relative">
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
                    className="overlay-backdrop z-[120] animate-fade-in"
                    onClick={stopSolving}
                >
                    <div
                        ref={modalRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={modalTitleId}
                        aria-describedby={modalDescriptionId}
                        tabIndex={-1}
                        className="overlay-surface w-[96vw] sm:w-[92vw] max-w-[1200px] h-[90vh] sm:h-[84vh] max-h-[90vh] sm:max-h-[84vh] flex flex-col animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-default flex items-center justify-between bg-surface-1">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-ios-green/10 text-ios-green">
                                    <Pencil size={20} />
                                </div>
                                <div>
                                    <h3 id={modalTitleId} className="font-bold text-lg text-primary">
                                        Exercício {solvingExercise}
                                    </h3>
                                    <p id={modalDescriptionId} className="text-sm text-secondary max-w-lg truncate">
                                        {currentExercise.pergunta}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                {solverMode === 'automaton' && userAutomaton && userAutomaton.estados.length > 0 && (
                                    <button
                                        onClick={() => onSimulate(userAutomaton)}
                                        className="p-2 rounded-lg text-ios-blue hover:bg-ios-blue/10 transition-colors"
                                        title="Abrir no simulador"
                                        aria-label="Abrir autômato atual no simulador"
                                    >
                                        <Play size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={() => openConverter({ 
                                        automaton: userAutomaton,
                                        grammar: userGrammar,
                                        regex: userRegex
                                    })}
                                    className="p-2 rounded-lg text-secondary hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                    title="Conversor de Modelos"
                                    aria-label="Abrir conversor de modelos"
                                >
                                    <ArrowRightLeft size={18} />
                                </button>
                                {solverMode === 'automaton' && (
                                    <button
                                        onClick={resetAutomaton}
                                        className="p-2 rounded-lg text-secondary hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                        title="Resetar"
                                        aria-label="Resetar autômato"
                                    >
                                        <RotateCcw size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={stopSolving}
                                    className="p-2 rounded-lg text-status-danger status-hover-danger transition-colors"
                                    title="Fechar"
                                    aria-label="Fechar exercício"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
                            {/* Left */}
                            <div className="flex-1 relative overflow-hidden min-h-[320px] xl:min-h-0">
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
                                            Expressão Regular
                                        </div>
                                        <input
                                            type="text"
                                            value={userRegex}
                                            onChange={(e) => { setUserRegex(e.target.value); setRegexError(null); }}
                                            placeholder="Ex: (a+b)*abb"
                                            aria-invalid={!!regexError}
                                            aria-describedby={regexError ? regexErrorId : undefined}
                                            className="w-full bg-surface-2 border border-default rounded-2xl px-4 py-3 text-lg font-mono text-primary outline-none focus:ring-2 ring-ios-blue/40 shadow-inner"
                                        />
                                        {regexError && (
                                            <p id={regexErrorId} role="status" className="mt-3 text-sm text-status-danger flex items-center gap-2">
                                                <XCircle size={14} /> {regexError}
                                            </p>
                                        )}
                                        <div className="mt-6 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-default text-sm text-secondary leading-relaxed">
                                            Use <code className="font-mono">+</code> para união, <code className="font-mono">*</code> para fecho, <code className="font-mono">?</code> para opcional, e <code className="font-mono">eps</code> para vazio.
                                        </div>
                                    </div>
                                )}

                                {solverMode === 'grammar' && (
                                    <div className="p-6 md:p-8 h-full overflow-y-auto">
                                        <div className="flex items-center gap-2 ui-kicker text-secondary mb-4">
                                            <FileText size={14} />
                                            Gramática
                                        </div>
                                        <textarea
                                            value={userGrammar}
                                            onChange={(e) => { setUserGrammar(e.target.value); setGrammarError(null); }}
                                            placeholder="S -> a S b | eps"
                                            aria-invalid={!!grammarError}
                                            aria-describedby={grammarError ? grammarErrorId : undefined}
                                            className="w-full h-64 bg-surface-2 border border-default rounded-2xl px-4 py-3 text-sm font-mono text-primary outline-none focus:ring-2 ring-ios-blue/40 shadow-inner"
                                        />
                                        {grammarError && (
                                            <p id={grammarErrorId} role="status" className="mt-3 text-sm text-status-danger flex items-center gap-2">
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
                                            Formato: <code className="font-mono">S -&gt; a S b | eps</code>. Use espaços para símbolos multi-caractere.
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
                            <div className="w-full xl:w-80 max-h-[45%] xl:max-h-none border-t xl:border-t-0 xl:border-l border-default flex flex-col bg-surface-1 backdrop-blur-xl">
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
                                                <div key={`${idx}-${step.symbol}`} className="text-xs text-secondary">
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
                                                <Trophy size={24} />
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
                                    {verifyDisabledReason ? (
                                        <p className="mb-3 rounded-xl border border-status-warning bg-status-warning-soft px-3 py-2 text-xs text-status-warning">
                                            {verifyDisabledReason}
                                        </p>
                                    ) : (
                                        <p className="mb-3 text-xs text-secondary">
                                            Dica: use <span className="font-mono">Ctrl + Enter</span> para verificar mais rápido.
                                        </p>
                                    )}
                                    <button
                                        onClick={verifySolution}
                                        disabled={isVerifying || !!verifyDisabledReason}
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

                        {/* Conversion Tool Modal (Contextual to current solving session) */}
                        <ConversionTool
                            isOpen={showConverter}
                            onClose={() => setShowConverter(false)}
                            initialAutomaton={converterData.automaton}
                            initialGrammar={converterData.grammar}
                            initialRegex={converterData.regex}
                        />
                    </div>
                </div>,
                portalTarget
            )}

            {/* Global Conversion Tool (Accessible when not solving) */}
            {!solvingExercise && (
                <ConversionTool
                    isOpen={showConverter}
                    onClose={() => setShowConverter(false)}
                    initialAutomaton={converterData.automaton}
                    initialGrammar={converterData.grammar}
                    initialRegex={converterData.regex}
                />
            )}
        </div>
    );
};



