import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { AutomatoData, Exercicio, TestCase } from '../../types';
import { createEmptyAutomaton } from '../../utils/exerciseSimulation';
import { exerciseCategories } from './exerciseCategories';
import type { ConverterData, ExerciseDatabase, ExerciseSolverStartOptions, SolverMode } from './types';

interface UseExerciseSelectionOptions {
    exerciseDatabase: ExerciseDatabase;
    initialCategoryId?: string;
    initialExerciseId?: number | null;
    lastCategory?: string;
    onSelectionChange?: (categoryId: string, exerciseId: number | null) => void;
    setLastCategory: (categoryId: string) => void;
}

export const useExerciseSelection = ({
    exerciseDatabase,
    initialCategoryId,
    initialExerciseId,
    lastCategory,
    onSelectionChange,
    setLastCategory,
}: UseExerciseSelectionOptions) => {
    const fallbackCategoryId = useMemo(() => {
        if (exerciseDatabase.afd) return 'afd';
        return Object.keys(exerciseDatabase)[0] ?? 'afd';
    }, [exerciseDatabase]);
    const routeCategoryId = initialCategoryId && exerciseDatabase[initialCategoryId]
        ? initialCategoryId
        : undefined;
    const storedCategoryId = !routeCategoryId && lastCategory && exerciseDatabase[lastCategory]
        ? lastCategory
        : undefined;
    const externalCategoryId = routeCategoryId ?? storedCategoryId;

    const cloneAutomaton = useCallback((data: AutomatoData): AutomatoData => {
        if (typeof structuredClone === 'function') {
            return structuredClone(data);
        }

        return JSON.parse(JSON.stringify(data)) as AutomatoData;
    }, []);
    const [activeCategory, setActiveCategory] = useState(() => {
        return externalCategoryId ?? fallbackCategoryId;
    });
    const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
    const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
    const [solvingExercise, setSolvingExercise] = useState<number | null>(null);
    const [solverMode, setSolverMode] = useState<SolverMode>('automaton');
    const [userAutomaton, setUserAutomaton] = useState<AutomatoData | null>(null);
    const [savedAttemptAutomaton, setSavedAttemptAutomaton] = useState<AutomatoData | null>(null);
    const [isViewingAnswerAutomaton, setIsViewingAnswerAutomaton] = useState(false);
    const [userRegex, setUserRegex] = useState('');
    const [userGrammar, setUserGrammar] = useState('');
    const [userText, setUserText] = useState('');
    const [showExpected, setShowExpected] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [showConverter, setShowConverter] = useState(false);
    const [converterData, setConverterData] = useState<ConverterData>({});
    const [editorSessionKey, setEditorSessionKey] = useState(0);

    const lastSyncedSelectionRef = useRef<{
        categoryId: string;
        exerciseId: number | null;
    } | null>(null);
    const lastObservedExternalSelectionRef = useRef<{
        categoryId?: string;
        exerciseId: number | null | undefined;
    } | null>(null);
    const pendingExternalSyncRef = useRef<{
        categoryId?: string;
        exerciseId: number | null | undefined;
    } | null>(null);
    const isSyncingFromRouteRef = useRef(false);
    const resetEditorSession = useCallback(() => {
        setEditorSessionKey((current) => current + 1);
    }, []);

    const exercises = useMemo<Exercicio[]>(
        () => exerciseDatabase[activeCategory] || [],
        [activeCategory, exerciseDatabase]
    );
    const activeCategoryConfig = useMemo(
        () => exerciseCategories.find((category) => category.id === activeCategory) ?? exerciseCategories[0],
        [activeCategory]
    );

    const filteredExercises = useMemo(() => {
        if (!searchQuery.trim()) return exercises;
        const query = searchQuery.trim().toLowerCase();
        return exercises.filter((exercise) =>
            exercise.id.toString() === query
            || exercise.pergunta.toLowerCase().includes(query)
            || exercise.dica?.toLowerCase().includes(query)
            || exercise.dicas?.some((hint) => hint.text.toLowerCase().includes(query))
            || exercise.estrategia?.toLowerCase().includes(query)
            || exercise.respostaTexto?.toLowerCase().includes(query)
            || exercise.guidedSolution?.some((step) =>
                step.title.toLowerCase().includes(query)
                || step.explanation.toLowerCase().includes(query)
                || step.expectedStudentAction?.toLowerCase().includes(query)
                || step.checkpointQuestion?.toLowerCase().includes(query)
            )
            || exercise.commonMistakes?.some((mistake) =>
                mistake.title.toLowerCase().includes(query)
                || mistake.symptom.toLowerCase().includes(query)
                || mistake.correction.toLowerCase().includes(query)
            )
            || exercise.metadata?.learningGoal.toLowerCase().includes(query)
            || exercise.metadata?.pattern.toLowerCase().includes(query)
            || exercise.metadata?.prerequisites?.some((prerequisite) => prerequisite.toLowerCase().includes(query))
            || exercise.metadata?.theoryRefs?.some((reference) => reference.toLowerCase().includes(query))
        );
    }, [exercises, searchQuery]);

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return exerciseCategories;
        const query = searchQuery.trim().toLowerCase();
        return exerciseCategories.filter((category) => category.label.toLowerCase().includes(query));
    }, [searchQuery]);

    const currentExercise = solvingExercise !== null
        ? exercises.find((exercise) => exercise.id === solvingExercise) ?? null
        : null;

    const tests = useMemo<TestCase[]>(() => currentExercise?.testes ?? [], [currentExercise]);

    const openConverter = useCallback((data: ConverterData) => {
        setConverterData(data);
        setShowConverter(true);
    }, []);

    const startSolving = useCallback((exerciseId: number, options?: ExerciseSolverStartOptions) => {
        const exercise = exercises.find((item) => item.id === exerciseId);
        const mode = exercise?.mode ?? activeCategoryConfig.mode ?? 'automaton';
        const tipo = exercise?.tipo ?? activeCategoryConfig.tipo ?? 'AFD';

        setSolverMode(mode);
        setSolvingExercise(exerciseId);
        setShowExpected(false);
        setUserRegex('');
        setUserGrammar('');
        setUserText('');
        setSavedAttemptAutomaton(null);
        setIsViewingAnswerAutomaton(false);

        if (mode === 'automaton') {
            resetEditorSession();
            setUserAutomaton(
                options?.initialAutomaton
                    ? cloneAutomaton(options.initialAutomaton)
                    : createEmptyAutomaton(tipo)
            );
            return;
        }

        setUserAutomaton(null);
    }, [activeCategoryConfig.mode, activeCategoryConfig.tipo, cloneAutomaton, exercises, resetEditorSession]);

    const loadAnswerAutomaton = useCallback((data: AutomatoData) => {
        setSavedAttemptAutomaton((currentSavedAttempt) => {
            if (currentSavedAttempt || isViewingAnswerAutomaton || !userAutomaton) {
                return currentSavedAttempt;
            }

            return cloneAutomaton(userAutomaton);
        });
        resetEditorSession();
        setUserAutomaton(cloneAutomaton(data));
        setIsViewingAnswerAutomaton(true);
    }, [cloneAutomaton, isViewingAnswerAutomaton, resetEditorSession, userAutomaton]);

    const restoreSavedAttempt = useCallback(() => {
        if (!savedAttemptAutomaton) return;

        resetEditorSession();
        setUserAutomaton(cloneAutomaton(savedAttemptAutomaton));
        setSavedAttemptAutomaton(null);
        setIsViewingAnswerAutomaton(false);
    }, [cloneAutomaton, resetEditorSession, savedAttemptAutomaton]);

    const stopSolving = useCallback(() => {
        setSolvingExercise(null);
        setUserAutomaton(null);
        setSavedAttemptAutomaton(null);
        setIsViewingAnswerAutomaton(false);
        setUserRegex('');
        setUserGrammar('');
        setUserText('');
        setShowExpected(false);
    }, []);

    const resetAutomaton = useCallback(() => {
        const tipo = currentExercise?.tipo ?? activeCategoryConfig.tipo ?? 'AFD';
        resetEditorSession();
        setUserAutomaton(createEmptyAutomaton(tipo));
        setSavedAttemptAutomaton(null);
        setIsViewingAnswerAutomaton(false);
    }, [activeCategoryConfig.tipo, currentExercise?.tipo, resetEditorSession]);

    const handleCategorySelect = useCallback((categoryId: string) => {
        setActiveCategory(categoryId);
        setLastCategory(categoryId);
        setRevealedHints({});
        setRevealedAnswers({});
        setSidebarOpen(false);
    }, [setLastCategory]);

    useEffect(() => {
        let isSyncingFromRoute = false;
        const nextExternalSelection = {
            categoryId: externalCategoryId,
            exerciseId: initialExerciseId
        };
        const hasObservedExternalSelectionChanged = !lastObservedExternalSelectionRef.current
            || lastObservedExternalSelectionRef.current.categoryId !== nextExternalSelection.categoryId
            || lastObservedExternalSelectionRef.current.exerciseId !== nextExternalSelection.exerciseId;

        if (hasObservedExternalSelectionChanged) {
            lastObservedExternalSelectionRef.current = nextExternalSelection;
            pendingExternalSyncRef.current = nextExternalSelection;
        }

        const pendingExternalSync = pendingExternalSyncRef.current;

        if (pendingExternalSync?.categoryId && activeCategory !== pendingExternalSync.categoryId) {
            isSyncingFromRoute = true;
            setActiveCategory(pendingExternalSync.categoryId);
            isSyncingFromRouteRef.current = true;
            return;
        }

        if (!exerciseDatabase[activeCategory]) {
            isSyncingFromRoute = true;
            setActiveCategory(fallbackCategoryId);
            isSyncingFromRouteRef.current = true;
            return;
        }

        if (typeof pendingExternalSync?.exerciseId === 'number') {
            const categoryId = pendingExternalSync.categoryId ?? activeCategory;
            const exerciseExists = exerciseDatabase[categoryId]?.some((exercise) => exercise.id === pendingExternalSync.exerciseId);
            if (exerciseExists && solvingExercise !== pendingExternalSync.exerciseId) {
                isSyncingFromRoute = true;
                startSolving(pendingExternalSync.exerciseId);
            } else {
                isSyncingFromRoute = false;
            }
            isSyncingFromRouteRef.current = isSyncingFromRoute;
            if (!isSyncingFromRoute) {
                pendingExternalSyncRef.current = null;
            }
            return;
        }

        if (pendingExternalSync?.exerciseId === null && solvingExercise !== null) {
            isSyncingFromRoute = true;
            stopSolving();
        }

        if (!isSyncingFromRoute) {
            pendingExternalSyncRef.current = null;
        }
        isSyncingFromRouteRef.current = isSyncingFromRoute;
    }, [activeCategory, exerciseDatabase, externalCategoryId, fallbackCategoryId, initialExerciseId, routeCategoryId, solvingExercise, startSolving, stopSolving]);

    useEffect(() => {
        if (!onSelectionChange) return;
        if (isSyncingFromRouteRef.current) return;

        if (activeCategory === routeCategoryId && solvingExercise === initialExerciseId) {
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
    }, [activeCategory, initialExerciseId, onSelectionChange, routeCategoryId, solvingExercise]);

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

    return {
        activeCategory,
        activeCategoryConfig,
        revealedHints,
        revealedAnswers,
        solvingExercise,
        solverMode,
        userAutomaton,
        savedAttemptAutomaton,
        isViewingAnswerAutomaton,
        userRegex,
        userGrammar,
        userText,
        showExpected,
        searchQuery,
        isSidebarOpen,
        showConverter,
        converterData,
        editorSessionKey,
        exercises,
        filteredExercises,
        filteredCategories,
        currentExercise,
        tests,
        setRevealedHints,
        setRevealedAnswers,
        setUserAutomaton,
        setUserRegex,
        setUserGrammar,
        setUserText,
        setShowExpected,
        setSearchQuery,
        setSidebarOpen,
        setShowConverter,
        openConverter,
        startSolving,
        loadAnswerAutomaton,
        restoreSavedAttempt,
        stopSolving,
        resetAutomaton,
        handleCategorySelect,
    };
};
