import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { AutomatoData, Exercicio, TestCase } from '../../types';
import { createEmptyAutomaton } from '../../utils/exerciseSimulation';
import { exerciseCategories } from './exerciseCategories';
import type { ConverterData, ExerciseDatabase, SolverMode } from './types';

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
    const [activeCategory, setActiveCategory] = useState(() => {
        if (initialCategoryId && exerciseDatabase[initialCategoryId]) return initialCategoryId;
        return 'afd';
    });
    const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
    const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
    const [solvingExercise, setSolvingExercise] = useState<number | null>(null);
    const [solverMode, setSolverMode] = useState<SolverMode>('automaton');
    const [userAutomaton, setUserAutomaton] = useState<AutomatoData | null>(null);
    const [userRegex, setUserRegex] = useState('');
    const [userGrammar, setUserGrammar] = useState('');
    const [userText, setUserText] = useState('');
    const [showExpected, setShowExpected] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [showConverter, setShowConverter] = useState(false);
    const [converterData, setConverterData] = useState<ConverterData>({});

    const lastUrlSelectionRef = useRef<{
        categoryId?: string;
        exerciseId: number | null | undefined;
    } | null>(null);
    const lastSyncedSelectionRef = useRef<{
        categoryId: string;
        exerciseId: number | null;
    } | null>(null);

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

    const startSolving = useCallback((exerciseId: number) => {
        const exercise = exercises.find((item) => item.id === exerciseId);
        const mode = exercise?.mode ?? activeCategoryConfig.mode ?? 'automaton';
        const tipo = exercise?.tipo ?? activeCategoryConfig.tipo ?? 'AFD';

        setSolverMode(mode);
        setSolvingExercise(exerciseId);
        setShowExpected(false);
        setUserRegex('');
        setUserGrammar('');
        setUserText('');

        if (mode === 'automaton') {
            setUserAutomaton(createEmptyAutomaton(tipo));
            return;
        }

        setUserAutomaton(null);
    }, [activeCategoryConfig.mode, activeCategoryConfig.tipo, exercises]);

    const stopSolving = useCallback(() => {
        setSolvingExercise(null);
        setUserAutomaton(null);
        setUserRegex('');
        setUserGrammar('');
        setUserText('');
        setShowExpected(false);
    }, []);

    const resetAutomaton = useCallback(() => {
        const tipo = currentExercise?.tipo ?? activeCategoryConfig.tipo ?? 'AFD';
        setUserAutomaton(createEmptyAutomaton(tipo));
    }, [activeCategoryConfig.tipo, currentExercise?.tipo]);

    const handleCategorySelect = useCallback((categoryId: string) => {
        setActiveCategory(categoryId);
        setLastCategory(categoryId);
        setRevealedHints({});
        setRevealedAnswers({});
        setSidebarOpen(false);
    }, [setLastCategory]);

    useEffect(() => {
        if (!initialCategoryId) return;
        if (exerciseDatabase[initialCategoryId]) {
            setActiveCategory((previous) => (previous === initialCategoryId ? previous : initialCategoryId));
        }
    }, [exerciseDatabase, initialCategoryId]);

    useEffect(() => {
        if (initialCategoryId) return;
        if (lastCategory && exerciseDatabase[lastCategory]) {
            setActiveCategory((previous) => (lastCategory ? lastCategory : previous));
        }
    }, [exerciseDatabase, initialCategoryId, lastCategory]);

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
            const exerciseExists = exerciseDatabase[categoryId]?.some((exercise) => exercise.id === initialExerciseId);
            if (exerciseExists && solvingExercise !== initialExerciseId) {
                startSolving(initialExerciseId);
            }
            return;
        }

        if (initialExerciseId === null && solvingExercise !== null) {
            stopSolving();
        }
    }, [activeCategory, exerciseDatabase, initialCategoryId, initialExerciseId, solvingExercise, startSolving, stopSolving]);

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
    }, [activeCategory, initialCategoryId, initialExerciseId, onSelectionChange, solvingExercise]);

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
        userRegex,
        userGrammar,
        userText,
        showExpected,
        searchQuery,
        isSidebarOpen,
        showConverter,
        converterData,
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
        stopSolving,
        resetAutomaton,
        handleCategorySelect,
    };
};
