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

type ExerciseSearchIndex = Record<string, Map<number, string>>;

export interface ExerciseSearchResultPreview {
    categoryId: string;
    categoryLabel: string;
    exerciseId: number;
    question: string;
    resultCount: number;
}

const normalizeExerciseSearch = (value: string) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const getExerciseSearchTokens = (value: string) => normalizeExerciseSearch(value)
    .split(/\s+/)
    .filter(Boolean);

const buildExerciseSearchText = (exercise: Exercicio) => {
    const searchableParts = [
        exercise.id.toString(),
        exercise.pergunta,
        exercise.dica,
        ...(exercise.dicas?.map((hint) => hint.text) ?? []),
        exercise.estrategia,
        exercise.respostaTexto,
        ...(exercise.guidedSolution?.flatMap((step) => [
            step.title,
            step.explanation,
            step.expectedStudentAction,
            step.checkpointQuestion
        ]) ?? []),
        ...(exercise.commonMistakes?.flatMap((mistake) => [
            mistake.title,
            mistake.symptom,
            mistake.correction
        ]) ?? []),
        exercise.metadata?.learningGoal,
        exercise.metadata?.pattern,
        ...(exercise.metadata?.prerequisites ?? []),
        ...(exercise.metadata?.theoryRefs ?? [])
    ]
        .filter((part): part is string => Boolean(part))
        .map(normalizeExerciseSearch);

    return searchableParts.join(' ');
};

const exerciseMatchesSearch = (searchText: string, tokens: string[]) => {
    if (tokens.length === 0) return true;

    return tokens.every((token) => searchText.includes(token));
};

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
    const [revealedHintCounts, setRevealedHintCounts] = useState<Record<number, number>>({});
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
    const [selectedSearchResultIndex, setSelectedSearchResultIndex] = useState(0);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [showConverter, setShowConverter] = useState(false);
    const [converterData, setConverterData] = useState<ConverterData>({});
    const [editorSessionKey, setEditorSessionKey] = useState(0);
    const exerciseSearchIndex = useMemo<ExerciseSearchIndex>(() => {
        const index: ExerciseSearchIndex = {};

        for (const [categoryId, categoryExercises] of Object.entries(exerciseDatabase)) {
            index[categoryId] = new Map(
                categoryExercises.map((exercise) => [exercise.id, buildExerciseSearchText(exercise)])
            );
        }

        return index;
    }, [exerciseDatabase]);
    const searchTokens = useMemo(() => getExerciseSearchTokens(searchQuery), [searchQuery]);
    const searchTokensKey = searchTokens.join('\u0001');

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
        if (searchTokens.length === 0) return exercises;
        const activeCategoryIndex = exerciseSearchIndex[activeCategory] ?? new Map<number, string>();

        return exercises.filter((exercise) =>
            exerciseMatchesSearch(activeCategoryIndex.get(exercise.id) ?? buildExerciseSearchText(exercise), searchTokens)
        );
    }, [activeCategory, exerciseSearchIndex, exercises, searchTokens]);

    const filteredCategories = useMemo(() => {
        if (searchTokens.length === 0) return exerciseCategories;

        return exerciseCategories.filter((category) => {
            const categoryLabelMatches = searchTokens.every((token) =>
                normalizeExerciseSearch(category.label).includes(token)
            );
            if (categoryLabelMatches) return true;

            const categoryIndex = exerciseSearchIndex[category.id];
            if (!categoryIndex) return false;

            for (const searchText of categoryIndex.values()) {
                if (exerciseMatchesSearch(searchText, searchTokens)) return true;
            }

            return false;
        });
    }, [exerciseSearchIndex, searchTokens]);

    const searchResults = useMemo<ExerciseSearchResultPreview[]>(() => {
        if (searchTokens.length === 0) return [];
        const matches: ExerciseSearchResultPreview[] = [];

        for (const category of exerciseCategories) {
            const categoryExercises = exerciseDatabase[category.id] ?? [];
            const categoryIndex = exerciseSearchIndex[category.id] ?? new Map<number, string>();

            for (const exercise of categoryExercises) {
                const searchText = categoryIndex.get(exercise.id) ?? buildExerciseSearchText(exercise);
                if (!exerciseMatchesSearch(searchText, searchTokens)) continue;

                matches.push({
                    categoryId: category.id,
                    categoryLabel: category.label,
                    exerciseId: exercise.id,
                    question: exercise.pergunta,
                    resultCount: 0
                });
            }
        }

        return matches.map((match) => ({ ...match, resultCount: matches.length }));
    }, [exerciseDatabase, exerciseSearchIndex, searchTokens]);
    const firstSearchResult = searchResults[0] ?? null;
    const activeSearchResult = searchResults[
        Math.min(selectedSearchResultIndex, Math.max(searchResults.length - 1, 0))
    ] ?? null;
    const searchResultPosition = activeSearchResult
        ? {
            current: Math.min(selectedSearchResultIndex, searchResults.length - 1) + 1,
            total: searchResults.length
        }
        : null;

    const currentExercise = solvingExercise !== null
        ? exercises.find((exercise) => exercise.id === solvingExercise) ?? null
        : null;

    const tests = useMemo<TestCase[]>(() => currentExercise?.testes ?? [], [currentExercise]);

    const openConverter = useCallback((data: ConverterData) => {
        setConverterData(data);
        setShowConverter(true);
    }, []);

    const startSolvingInCategory = useCallback((
        categoryId: string,
        exerciseId: number,
        options?: ExerciseSolverStartOptions
    ) => {
        const categoryExercises = exerciseDatabase[categoryId] ?? [];
        const categoryConfig = exerciseCategories.find((category) => category.id === categoryId) ?? activeCategoryConfig;
        const exercise = categoryExercises.find((item) => item.id === exerciseId);
        const mode = exercise?.mode ?? categoryConfig.mode ?? 'automaton';
        const tipo = exercise?.tipo ?? categoryConfig.tipo ?? 'AFD';

        setActiveCategory(categoryId);
        setLastCategory(categoryId);
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
    }, [activeCategoryConfig, cloneAutomaton, exerciseDatabase, resetEditorSession, setLastCategory]);

    const startSolving = useCallback((exerciseId: number, options?: ExerciseSolverStartOptions) => {
        startSolvingInCategory(activeCategory, exerciseId, options);
    }, [activeCategory, startSolvingInCategory]);

    const navigateToFirstSearchResult = useCallback(() => {
        if (!activeSearchResult) return;

        startSolvingInCategory(activeSearchResult.categoryId, activeSearchResult.exerciseId);
        setSidebarOpen(false);
    }, [activeSearchResult, startSolvingInCategory]);
    const moveSearchResultSelection = useCallback((delta: number) => {
        if (searchResults.length === 0) return;

        setSelectedSearchResultIndex((current) => (
            (current + delta + searchResults.length) % searchResults.length
        ));
    }, [searchResults.length]);

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
        setSearchQuery('');
        setRevealedHintCounts({});
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
        setSelectedSearchResultIndex(0);
    }, [searchTokensKey]);

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
        activeSearchResult,
        revealedHintCounts,
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
        firstSearchResult,
        searchResultPosition,
        filteredExercises,
        filteredCategories,
        currentExercise,
        tests,
        setRevealedHintCounts,
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
        navigateToFirstSearchResult,
        moveSearchResultSelection,
        loadAnswerAutomaton,
        restoreSavedAttempt,
        stopSolving,
        resetAutomaton,
        handleCategorySelect,
    };
};
