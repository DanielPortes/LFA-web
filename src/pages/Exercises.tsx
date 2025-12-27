import { useState, useCallback, useEffect, useMemo } from 'react';
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
import { AutomatonEditor } from '../components/automaton/AutomatonEditor';
import { AutomatonPreview } from '../components/automaton/AutomatonPreview';
import { getEpsilonClosure, performStep } from '../utils/automatonLogic';
import { regexToNfa } from '../utils/conversions';
import { useDialog } from '../hooks/useDialog';

type SolverMode = 'automaton' | 'regex' | 'text';

interface CategoryConfig {
    id: string;
    label: string;
    tipo?: AutomatoData['tipo'];
    mode: SolverMode;
}

interface SimulationResult {
    status: 'accepted' | 'rejected';
    reason?: string;
    finalStates: string[];
}

interface ExerciseProgress {
    completed: Record<string, boolean>;
    lastCategory?: string;
}

const PROGRESS_KEY = 'lfa-exercises-progress';

const categories: CategoryConfig[] = [
    { id: 'afd', label: 'AFDs', tipo: 'AFD', mode: 'automaton' },
    { id: 'lex', label: 'Léxico', tipo: 'AFD', mode: 'automaton' },
    { id: 'afn', label: 'AFNs', tipo: 'AFN', mode: 'automaton' },
    { id: 'afne', label: 'AFNε', tipo: 'AFN', mode: 'automaton' },
    { id: 'er', label: 'Regex', mode: 'regex' },
    { id: 'gr', label: 'Gramática', mode: 'text' },
    { id: 'minimizacao', label: 'Minimização', mode: 'text' },
    { id: 'moore_mealy', label: 'Moore/Mealy', mode: 'text' },
    { id: 'pumping', label: 'Bombeamento', mode: 'text' }
];

const createEmptyAutomaton = (tipo: AutomatoData['tipo']): AutomatoData => ({
    tipo,
    estados: [
        { id: 'q0', label: 'q0', x: 200, y: 200, isInicial: true, isFinal: false }
    ],
    transicoes: []
});

const simulateAutomaton = (automaton: AutomatoData, input: string): SimulationResult => {
    const initialStates = automaton.estados.filter(e => e.isInicial).map(e => e.id);
    if (initialStates.length === 0) {
        return { status: 'rejected', reason: 'Nenhum estado inicial definido', finalStates: [] };
    }

    let currentStates = getEpsilonClosure(initialStates, automaton.transicoes);

    for (const symbol of input) {
        const nextStates = performStep(currentStates, symbol, automaton.transicoes);
        if (nextStates.length === 0) {
            return {
                status: 'rejected',
                reason: `Sem transição válida para \"${symbol}\"`,
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
        reason: hasFinal ? undefined : 'Nenhum estado final foi alcançado',
        finalStates: currentStates
    };
};

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
    const [activeCategory, setActiveCategory] = useState(() => {
        if (initialCategoryId && exerciciosDB[initialCategoryId]) return initialCategoryId;
        try {
            const saved = localStorage.getItem(PROGRESS_KEY);
            if (saved) {
                const parsed = JSON.parse(saved) as ExerciseProgress;
                if (parsed.lastCategory && exerciciosDB[parsed.lastCategory]) {
                    return parsed.lastCategory;
                }
            }
        } catch {
            // ignore
        }
        return 'afd';
    });
    const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
    const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
    const [solvingExercise, setSolvingExercise] = useState<number | null>(null);
    const [solverMode, setSolverMode] = useState<SolverMode>('automaton');
    const [userAutomaton, setUserAutomaton] = useState<AutomatoData | null>(null);
    const [userRegex, setUserRegex] = useState('');
    const [userText, setUserText] = useState('');
    const [showExpected, setShowExpected] = useState(false);
    const [testResults, setTestResults] = useState<Record<string, 'pass' | 'fail' | 'running'>>({});
    const [lastFailure, setLastFailure] = useState<{ input: string; expected: string; received: string; reason?: string } | null>(null);
    const [regexError, setRegexError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [exerciseCompleted, setExerciseCompleted] = useState<Record<string, boolean>>({});

    const exercicios = exerciciosDB[activeCategory] || [];
    const currentExercise = solvingExercise !== null
        ? exercicios.find(e => e.id === solvingExercise) ?? null
        : null;

    const tests = useMemo<TestCase[]>(() => currentExercise?.testes ?? [], [currentExercise]);
    const hasTests = tests.length > 0;

    useEffect(() => {
        if (!initialCategoryId) return;
        if (exerciciosDB[initialCategoryId]) {
            setActiveCategory(initialCategoryId);
        }
    }, [initialCategoryId]);

    useEffect(() => {
        if (initialExerciseId == null) return;
        const exerciseExists = exerciciosDB[activeCategory]?.some(e => e.id === initialExerciseId);
        if (exerciseExists) startSolving(initialExerciseId);
    }, [initialExerciseId]);

    useEffect(() => {
        onSelectionChange?.(activeCategory, solvingExercise);
    }, [activeCategory, solvingExercise, onSelectionChange]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(PROGRESS_KEY);
            if (saved) {
                const parsed = JSON.parse(saved) as ExerciseProgress;
                setExerciseCompleted(parsed.completed || {});
            }
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        try {
            const payload: ExerciseProgress = {
                completed: exerciseCompleted,
                lastCategory: activeCategory
            };
            localStorage.setItem(PROGRESS_KEY, JSON.stringify(payload));
        } catch {
            // ignore
        }
    }, [exerciseCompleted, activeCategory]);

    const startSolving = (exerciseId: number) => {
        const config = categories.find(c => c.id === activeCategory);
        const mode = config?.mode ?? 'automaton';
        setSolverMode(mode);
        setSolvingExercise(exerciseId);
        setShowExpected(false);
        setTestResults({});
        setLastFailure(null);
        setRegexError(null);

        if (mode === 'automaton') {
            setUserAutomaton(createEmptyAutomaton(config?.tipo || 'AFD'));
        } else {
            setUserAutomaton(null);
        }

        if (mode === 'regex') {
            setUserRegex('');
        }

        if (mode === 'text') {
            setUserText('');
        }
    };

    const stopSolving = () => {
        setSolvingExercise(null);
        setUserAutomaton(null);
        setUserRegex('');
        setUserText('');
        setTestResults({});
        setLastFailure(null);
        setRegexError(null);
        setIsVerifying(false);
    };

    const modalRef = useDialog(solvingExercise !== null, () => stopSolving());

    const resetAutomaton = () => {
        const config = categories.find(c => c.id === activeCategory);
        setUserAutomaton(createEmptyAutomaton(config?.tipo || 'AFD'));
        setTestResults({});
        setLastFailure(null);
    };

    const runTestCase = useCallback((tc: TestCase): SimulationResult => {
        if (solverMode === 'regex') {
            try {
                const nfa = regexToNfa(userRegex.trim());
                return simulateAutomaton(nfa, tc.input);
            } catch (e) {
                return { status: 'rejected', reason: 'Regex inválida', finalStates: [] };
            }
        }
        if (!userAutomaton) {
            return { status: 'rejected', reason: 'Sem autômato', finalStates: [] };
        }
        return simulateAutomaton(userAutomaton, tc.input);
    }, [solverMode, userRegex, userAutomaton]);

    const verifySolution = useCallback(async () => {
        if (!currentExercise) return;
        if (solverMode === 'regex' && !userRegex.trim()) {
            setRegexError('Digite uma expressão regular para testar.');
            return;
        }

        if (solverMode === 'automaton' && (!userAutomaton || userAutomaton.estados.length === 0)) {
            return;
        }

        if (!hasTests) return;

        setIsVerifying(true);
        setRegexError(null);
        setLastFailure(null);

        const runningResults: Record<string, 'running'> = {};
        tests.forEach((_, idx) => {
            runningResults[`${idx}`] = 'running';
        });
        setTestResults(runningResults);

        let allPassed = true;
        for (let i = 0; i < tests.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 150));

            const tc = tests[i];
            const result = runTestCase(tc);
            const passed = (tc.expected === 'accept' && result.status === 'accepted') ||
                (tc.expected === 'reject' && result.status === 'rejected');

            if (!passed && allPassed) {
                setLastFailure({
                    input: tc.input || 'ε',
                    expected: tc.expected === 'accept' ? 'Aceita' : 'Rejeita',
                    received: result.status === 'accepted' ? 'Aceita' : 'Rejeita',
                    reason: result.reason
                });
            }

            if (!passed) allPassed = false;

            setTestResults(prev => ({
                ...prev,
                [`${i}`]: passed ? 'pass' : 'fail'
            }));
        }

        if (allPassed) {
            setExerciseCompleted(prev => ({
                ...prev,
                [`${activeCategory}-${currentExercise.id}`]: true
            }));
        }

        setIsVerifying(false);
    }, [currentExercise, solverMode, userRegex, userAutomaton, hasTests, tests, runTestCase, activeCategory]);

    const markCompletedManually = () => {
        if (!currentExercise) return;
        setExerciseCompleted(prev => ({
            ...prev,
            [`${activeCategory}-${currentExercise.id}`]: true
        }));
    };

    const answeredLabel = exerciseCompleted[`${activeCategory}-${currentExercise?.id}`];

    return (
        <div className="h-full flex flex-col md:flex-row gap-8 animate-fade-in pb-10">

            {/* Sidebar Navigation */}
            <div className="md:w-64 flex-shrink-0">
                <div className="glass-panel p-2 rounded-3xl sticky top-28">
                    <div className="flex items-center gap-2 px-4 py-3 text-gray-600 mb-1">
                        <ListFilter size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Tópicos</span>
                    </div>
                    <div className="space-y-1">
                        {categories.map(cat => {
                            const count = exerciciosDB[cat.id]?.length || 0;
                            const isActive = activeCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => { setActiveCategory(cat.id); setRevealedHints({}); setRevealedAnswers({}); }}
                                    className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex justify-between items-center group relative overflow-hidden
                                        ${isActive
                                        ? 'text-white font-bold shadow-lg shadow-blue-500/20'
                                        : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10'
                                    }`}
                                >
                                    {isActive && (
                                        <div className="absolute inset-0 bg-ios-blue -z-10" />
                                    )}
                                    <span className="flex-1">{cat.label}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        count === 0
                                            ? 'bg-gray-200 dark:bg-white/10 text-gray-600'
                                            : isActive
                                                ? 'bg-white/20 text-white'
                                                : 'bg-gray-100 dark:bg-white/10 text-gray-600'
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
                <div className="flex items-end justify-between mb-4 px-2">
                    <div>
                        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-1">{categories.find(c => c.id === activeCategory)?.label}</h2>
                        <p className="text-[var(--text-secondary)] text-sm">Lista de exercícios práticos</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-bold text-gray-600">{exercicios.length} Questões</span>
                </div>

                {exercicios.map((ex) => (
                    <div key={ex.id} className="glass-card overflow-hidden group hover:shadow-apple-md">
                        <div className="p-8">
                            <div className="flex gap-5 items-start">
                                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-600 font-mono font-bold text-lg flex items-center justify-center border border-gray-100 dark:border-white/5">
                                    {ex.id}
                                </span>
                                <h3 className="text-lg font-medium text-[var(--text-primary)] leading-relaxed pt-1">{ex.pergunta}</h3>
                            </div>

                            <div className="flex flex-wrap gap-3 mt-8 ml-14">
                                <button
                                    onClick={() => startSolving(ex.id)}
                                    className={`btn-icon px-4 rounded-xl text-xs font-bold gap-2
                                        ${exerciseCompleted[`${activeCategory}-${ex.id}`]
                                            ? 'bg-ios-green/10 text-ios-green'
                                            : 'bg-ios-green text-white hover:bg-green-600 shadow-md shadow-green-500/20'
                                        }`}
                                >
                                    {exerciseCompleted[`${activeCategory}-${ex.id}`] ? (
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
                                        className={`btn-icon px-4 rounded-xl text-xs font-bold gap-2 ${
                                            revealedHints[ex.id]
                                                ? 'bg-orange-50 text-orange-500 dark:bg-orange-500/10'
                                                : 'bg-gray-100 dark:bg-white/5 text-gray-600 hover:bg-gray-200 dark:hover:bg-white/10'
                                        }`}
                                    >
                                        <Lightbulb size={14} className={revealedHints[ex.id] ? 'fill-current' : ''} />
                                        {revealedHints[ex.id] ? 'Esconder' : 'Dica'}
                                    </button>
                                )}
                                <button
                                    onClick={() => setRevealedAnswers(p => ({ ...p, [ex.id]: !p[ex.id] }))}
                                    className={`btn-icon px-4 rounded-xl text-xs font-bold gap-2 ${
                                        revealedAnswers[ex.id]
                                            ? 'bg-blue-50 text-ios-blue dark:bg-blue-500/10'
                                            : 'bg-gray-100 dark:bg-white/5 text-gray-600 hover:bg-gray-200 dark:hover:bg-white/10'
                                    }`}
                                >
                                    {revealedAnswers[ex.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                    {revealedAnswers[ex.id] ? 'Esconder' : 'Ver Resposta'}
                                </button>
                            </div>
                        </div>

                        {/* Hint Section */}
                        {revealedHints[ex.id] && ex.dica && (
                            <div className="mx-8 mb-6 ml-20 p-4 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl text-orange-700 dark:text-orange-300 text-sm animate-scale-in">
                                <span className="font-bold mr-2 block mb-1 uppercase tracking-wide text-xs">Pista</span>{ex.dica}
                            </div>
                        )}

                        {/* Answer Section */}
                        {revealedAnswers[ex.id] && (
                            <div className="bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5 p-8 animate-fade-in">
                                <div className="ml-14">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle2 size={16} className="text-ios-green" />
                                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Solução</span>
                                    </div>

                                    {ex.respostaTexto && (
                                        <p className="text-[var(--text-primary)] whitespace-pre-line leading-relaxed font-mono text-sm bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
                                            {ex.respostaTexto}
                                        </p>
                                    )}

                                    {ex.respostaAutomato && (
                                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/5">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-ios-green animate-pulse"></div>
                                                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Gabarito Visual</span>
                                                </div>
                                                <button
                                                    onClick={() => onSimulate(ex.respostaAutomato!)}
                                                    className="group flex items-center gap-2 px-4 py-2 rounded-full bg-ios-blue/10 hover:bg-ios-blue text-ios-blue hover:text-white text-xs font-bold transition-all duration-300"
                                                >
                                                    <Play size={12} fill="currentColor" />
                                                    Simular
                                                </button>
                                            </div>
                                            <div className="h-80 w-full bg-white dark:bg-black rounded-3xl border border-gray-200 dark:border-white/10 shadow-inner overflow-hidden relative">
                                                <AutomatonPreview data={ex.respostaAutomato} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Exercise Solving Workspace Modal */}
            {solvingExercise !== null && currentExercise && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div ref={modalRef} className="w-[95vw] max-w-6xl h-[90vh] glass-panel rounded-3xl overflow-hidden flex flex-col animate-scale-in">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-white/50 dark:bg-black/30">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-ios-green/10 text-ios-green">
                                    <Pencil size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-[var(--text-primary)]">
                                        Exercício {solvingExercise}
                                    </h3>
                                    <p className="text-sm text-[var(--text-secondary)] max-w-lg truncate">
                                        {currentExercise.pergunta}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {solverMode === 'automaton' && (
                                    <button
                                        onClick={resetAutomaton}
                                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                        title="Resetar"
                                    >
                                        <RotateCcw size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={stopSolving}
                                    className="p-2 rounded-lg text-gray-600 hover:text-ios-red hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
                                    />
                                )}

                                {solverMode === 'regex' && (
                                    <div className="p-6 md:p-8 h-full overflow-y-auto">
                                        <div className="flex items-center gap-2 text-gray-600 text-xs font-bold uppercase tracking-widest mb-4">
                                            <Braces size={14} />
                                            Expressão Regular
                                        </div>
                                        <input
                                            type="text"
                                            value={userRegex}
                                            onChange={(e) => { setUserRegex(e.target.value); setRegexError(null); }}
                                            placeholder="Ex: (a+b)*abb"
                                            className="w-full bg-white/70 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-lg font-mono text-[var(--text-primary)] outline-none focus:ring-2 ring-ios-blue/40"
                                        />
                                        {regexError && (
                                            <p className="mt-3 text-sm text-ios-red flex items-center gap-2">
                                                <XCircle size={14} /> {regexError}
                                            </p>
                                        )}
                                        <div className="mt-6 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-[var(--text-secondary)] leading-relaxed">
                                            Use <code className="font-mono">|</code> para união, <code className="font-mono">*</code> para fecho, <code className="font-mono">+</code> para uma ou mais, <code className="font-mono">?</code> para opcional.
                                        </div>
                                    </div>
                                )}

                                {solverMode === 'text' && (
                                    <div className="p-6 md:p-8 h-full overflow-y-auto">
                                        <div className="flex items-center gap-2 text-gray-600 text-xs font-bold uppercase tracking-widest mb-4">
                                            <FileText size={14} />
                                            Resposta aberta
                                        </div>
                                        <textarea
                                            value={userText}
                                            onChange={(e) => setUserText(e.target.value)}
                                            placeholder="Escreva sua solução aqui..."
                                            className="w-full h-64 bg-white/70 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:ring-2 ring-ios-blue/40"
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
                            <div className="w-80 border-l border-[var(--border-color)] flex flex-col bg-white/30 dark:bg-black/20">
                                <div className="p-4 border-b border-[var(--border-color)]">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-sm text-[var(--text-primary)] mb-1">Casos de Teste</h4>
                                            <p className="text-xs text-gray-600">
                                                {hasTests ? 'Seu resultado será verificado com estas entradas' : 'Sem verificação automática'}
                                            </p>
                                        </div>
                                        {hasTests && (
                                            <button
                                                onClick={() => setShowExpected(s => !s)}
                                                className="text-xs font-bold text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                            >
                                                {showExpected ? 'Ocultar' : 'Mostrar'} esperado
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                    {hasTests ? tests.map((tc, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                                                ${testResults[`${idx}`] === 'pass'
                                                    ? 'bg-green-50 dark:bg-green-900/10 border-ios-green/30'
                                                    : testResults[`${idx}`] === 'fail'
                                                        ? 'bg-red-50 dark:bg-red-900/10 border-ios-red/30'
                                                        : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10'
                                                }`}
                                        >
                                            <div className="w-6 h-6 flex items-center justify-center">
                                                {testResults[`${idx}`] === 'running' ? (
                                                    <Loader2 size={16} className="text-ios-blue animate-spin" />
                                                ) : testResults[`${idx}`] === 'pass' ? (
                                                    <CheckCircle2 size={16} className="text-ios-green" />
                                                ) : testResults[`${idx}`] === 'fail' ? (
                                                    <XCircle size={16} className="text-ios-red" />
                                                ) : (
                                                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <code className="text-sm font-mono text-[var(--text-primary)] block truncate">
                                                    "{tc.input || 'ε'}"
                                                </code>
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                                showExpected
                                                    ? (tc.expected === 'accept' ? 'bg-green-100 dark:bg-green-900/30 text-ios-green' : 'bg-red-100 dark:bg-red-900/30 text-ios-red')
                                                    : 'bg-gray-100 dark:bg-white/10 text-gray-600'
                                            }`}>
                                                {showExpected ? (tc.expected === 'accept' ? 'Aceita' : 'Rejeita') : 'Oculto'}
                                            </span>
                                        </div>
                                    )) : (
                                        <div className="p-4 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 text-sm text-gray-600">
                                            Este exercício é conceitual. Compare sua solução com o gabarito quando terminar.
                                        </div>
                                    )}
                                </div>

                                {lastFailure && (
                                    <div className="p-4 border-t border-[var(--border-color)] bg-gray-50 dark:bg-black/30">
                                        <div className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2">Primeiro erro</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-300">
                                            Entrada: <code className="font-mono">{lastFailure.input}</code> · Esperado: {lastFailure.expected} · Obtido: {lastFailure.received}
                                        </div>
                                        {lastFailure.reason && (
                                            <div className="mt-2 text-xs text-ios-red">{lastFailure.reason}</div>
                                        )}
                                    </div>
                                )}

                                {Object.keys(testResults).length > 0 && (
                                    <div className="p-4 border-t border-[var(--border-color)] bg-gray-50 dark:bg-black/30">
                                        {Object.values(testResults).every(r => r === 'pass') ? (
                                            <div className="flex items-center gap-3 text-ios-green">
                                                <Trophy size={24} className="animate-bounce-subtle" />
                                                <div>
                                                    <p className="font-bold">Parabéns!</p>
                                                    <p className="text-xs opacity-80">Todos os testes passaram</p>
                                                </div>
                                            </div>
                                        ) : Object.values(testResults).some(r => r === 'fail') ? (
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

                                <div className="p-4 border-t border-[var(--border-color)]">
                                    <button
                                        onClick={verifySolution}
                                        disabled={isVerifying || !hasTests || (solverMode === 'automaton' && (!userAutomaton || userAutomaton.estados.length === 0))}
                                        className="w-full py-3 rounded-xl bg-ios-blue text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20"
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
                </div>
            )}
        </div>
    );
};
