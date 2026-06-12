import { Suspense, lazy, useCallback, useEffect, useId, useMemo, useRef } from 'react';
import type { AutomatoData } from '../types';
import { useProgress } from '../hooks/useProgress';
import { useUiSettings } from '../hooks/useUiSettings';
import { ExerciseList } from '../features/exercises/ExerciseList';
import { exerciseCategories } from '../features/exercises/exerciseCategories';
import { ExerciseSolverModal } from '../features/exercises/ExerciseSolverModal';
import { ExercisesSidebar } from '../features/exercises/ExercisesSidebar';
import type { ExerciseDatabase, ExerciseSolverStartOptions } from '../features/exercises/types';
import { useExerciseData } from '../features/exercises/useExerciseData';
import { useExerciseSelection } from '../features/exercises/useExerciseSelection';
import { useExerciseVerification } from '../features/exercises/useExerciseVerification';
import type { TokenizationOptions } from '../utils/symbols';
import { ExercisesSkeleton, ModalSkeleton } from '../components/ui';
import { resolveCategoryTheoryRefs } from '../data/learningConnections';

const LazyConversionTool = lazy(async () => {
    const module = await import('../components/ui/ConversionTool');
    return { default: module.ConversionTool };
});

interface ExerciseSimulationOrigin {
    categoryId: string;
    exerciseId: number;
    label: string;
}

type ExerciseSimulateHandler = (data: AutomatoData, origin?: ExerciseSimulationOrigin) => void;

const ExerciseDataState = ({ message }: { message: string }) => (
    <div className="flex min-h-[40vh] items-center justify-center px-4">
        <div className="glass-card max-w-md p-6 text-center">
            <p className="ui-kicker text-secondary">Exercícios</p>
            <p className="mt-2 text-sm text-primary">{message}</p>
        </div>
    </div>
);

const LoadedExercisesSection = ({
    exerciseDatabase,
    onSimulate,
    onOpenTheory,
    returnToLessonLabel,
    onReturnToLesson,
    initialCategoryId,
    initialExerciseId,
    onSelectionChange
}: {
    exerciseDatabase: ExerciseDatabase;
    onSimulate: ExerciseSimulateHandler;
    onOpenTheory?: (moduleId: string, lessonId: string) => void;
    returnToLessonLabel?: string | null;
    onReturnToLesson?: () => void;
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

    const searchInputId = useId();
    const sidebarId = useId();
    const verifyRunRef = useRef(0);

    const selection = useExerciseSelection({
        exerciseDatabase,
        initialCategoryId,
        initialExerciseId,
        lastCategory: progress.exercises.lastCategory,
        onSelectionChange,
        setLastCategory
    });

    const verification = useExerciseVerification({
        activeCategory: selection.activeCategory,
        currentExercise: selection.currentExercise,
        solverMode: selection.solverMode,
        userAutomaton: selection.userAutomaton,
        userRegex: selection.userRegex,
        userGrammar: selection.userGrammar,
        tokenOptions,
        markExerciseCompleted
    });

    const startSolving = useCallback((exerciseId: number, options?: ExerciseSolverStartOptions) => {
        verifyRunRef.current += 1;
        verification.resetVerificationState();
        selection.startSolving(exerciseId, options);
    }, [selection, verification]);

    const stopSolving = useCallback(() => {
        verifyRunRef.current += 1;
        selection.stopSolving();
        verification.resetVerificationState();
    }, [selection, verification]);

    const resetAutomaton = useCallback(() => {
        selection.resetAutomaton();
        verification.resetVerificationState();
    }, [selection, verification]);

    const verifySolution = useCallback(async () => {
        if (verification.isVerifying) return;
        const runId = verifyRunRef.current + 1;
        verifyRunRef.current = runId;
        const isCancelled = () => verifyRunRef.current !== runId;
        await verification.verifySolution(isCancelled);
    }, [verification]);

    const handleRegexChange = useCallback((value: string) => {
        selection.setUserRegex(value);
        verification.setRegexError(null);
    }, [selection, verification]);

    const handleGrammarChange = useCallback((value: string) => {
        selection.setUserGrammar(value);
        verification.setGrammarError(null);
    }, [selection, verification]);

    const getHintCount = useCallback((exerciseId: number) => {
        const exercise = selection.exercises.find((item) => item.id === exerciseId);
        return exercise?.dicas?.length ?? (exercise?.dica ? 1 : 0);
    }, [selection.exercises]);

    const toggleHint = useCallback((exerciseId: number) => {
        selection.setRevealedHintCounts((previous) => {
            const isOpen = (previous[exerciseId] ?? 0) > 0;
            return {
                ...previous,
                [exerciseId]: isOpen ? 0 : Math.min(1, getHintCount(exerciseId))
            };
        });
    }, [getHintCount, selection]);

    const revealNextHint = useCallback((exerciseId: number) => {
        selection.setRevealedHintCounts((previous) => ({
            ...previous,
            [exerciseId]: Math.min((previous[exerciseId] ?? 0) + 1, getHintCount(exerciseId))
        }));
    }, [getHintCount, selection]);

    const toggleAnswer = useCallback((exerciseId: number) => {
        selection.setRevealedAnswers((previous) => ({
            ...previous,
            [exerciseId]: !previous[exerciseId]
        }));
    }, [selection]);

    const markCompletedManually = useCallback(() => {
        if (!selection.currentExercise) return;
        markExerciseCompleted(selection.activeCategory, selection.currentExercise.id);
    }, [markExerciseCompleted, selection.activeCategory, selection.currentExercise]);

    const handleSimulateFromExercise = useCallback((data: AutomatoData) => {
        if (!selection.currentExercise) {
            onSimulate(data);
            return;
        }

        onSimulate(data, {
            categoryId: selection.activeCategory,
            exerciseId: selection.currentExercise.id,
            label: `Exercício ${selection.currentExercise.id} · ${selection.activeCategoryConfig.label}`
        });
    }, [onSimulate, selection.activeCategory, selection.activeCategoryConfig.label, selection.currentExercise]);

    const answeredLabel = isExerciseCompleted(selection.activeCategory, selection.currentExercise?.id ?? null);
    const totalExercisesCount = useMemo(
        () => Object.values(exerciseDatabase).reduce((sum, list) => sum + list.length, 0),
        [exerciseDatabase]
    );
    const completedExercisesCount = useMemo(() => {
        let count = 0;
        for (const [categoryId, list] of Object.entries(exerciseDatabase)) {
            for (const exercise of list) {
                if (progress.exercises.completed[`${categoryId}-${exercise.id}`]) {
                    count += 1;
                }
            }
        }
        return count;
    }, [exerciseDatabase, progress.exercises.completed]);
    const completedInActiveCategory = useMemo(
        () => selection.exercises.filter((exercise) => isExerciseCompleted(selection.activeCategory, exercise.id)).length,
        [isExerciseCompleted, selection.activeCategory, selection.exercises]
    );
    const sidebarItems = useMemo(() => selection.filteredCategories.map((category) => ({
        id: category.id,
        label: category.label,
        index: exerciseCategories.findIndex((item) => item.id === category.id),
        total: exerciseDatabase[category.id]?.length || 0,
        completed: (exerciseDatabase[category.id] || []).filter((exercise) => isExerciseCompleted(category.id, exercise.id)).length
    })), [exerciseDatabase, isExerciseCompleted, selection.filteredCategories]);
    const exercisesProgressPercent = totalExercisesCount === 0
        ? 0
        : Math.round((completedExercisesCount / totalExercisesCount) * 100);
    const activeCategoryTheoryLinks = useMemo(
        () => resolveCategoryTheoryRefs(selection.activeCategory),
        [selection.activeCategory]
    );

    useEffect(() => {
        if (selection.solvingExercise === null) return undefined;
        const onKeyDown = (event: KeyboardEvent) => {
            if (!(event.ctrlKey || event.metaKey) || event.key !== 'Enter') return;
            if (verification.isVerifying || verification.verifyDisabledReason) return;
            event.preventDefault();
            void verifySolution();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [selection.solvingExercise, verification.isVerifying, verification.verifyDisabledReason, verifySolution]);

    return (
        <div className="relative flex w-full min-w-0 animate-fade-in gap-4 md:gap-6 pb-8">
            {selection.isSidebarOpen && (
                <button
                    className="md:hidden fixed inset-0 z-30 bg-black/45 backdrop-blur-[2px]"
                    onClick={() => selection.setSidebarOpen(false)}
                    aria-label="Fechar sumário de exercícios"
                />
            )}

            <ExercisesSidebar
                sidebarId={sidebarId}
                isSidebarOpen={selection.isSidebarOpen}
                searchInputId={searchInputId}
                searchQuery={selection.searchQuery}
                onSearchChange={selection.setSearchQuery}
                onSearchSubmit={selection.navigateToFirstSearchResult}
                onMoveSearchResult={selection.moveSearchResultSelection}
                firstSearchResult={selection.firstSearchResult}
                activeSearchResult={selection.activeSearchResult}
                searchResultPosition={selection.searchResultPosition}
                progressPercent={exercisesProgressPercent}
                completedExercisesCount={completedExercisesCount}
                totalExercisesCount={totalExercisesCount}
                onResetExercises={resetExercises}
                items={sidebarItems}
                activeCategory={selection.activeCategory}
                onSelectCategory={selection.handleCategorySelect}
            />

            <ExerciseList
                activeCategory={selection.activeCategory}
                activeCategoryLabel={selection.activeCategoryConfig.label}
                exercises={selection.exercises}
                filteredExercises={selection.filteredExercises}
                completedInActiveCategory={completedInActiveCategory}
                revealedHintCounts={selection.revealedHintCounts}
                revealedAnswers={selection.revealedAnswers}
                isExerciseCompleted={isExerciseCompleted}
                onToggleHint={toggleHint}
                onRevealNextHint={revealNextHint}
                onToggleAnswer={toggleAnswer}
                onStartSolving={startSolving}
                onOpenSidebar={() => selection.setSidebarOpen(true)}
                onOpenConverter={selection.openConverter}
                theoryLinks={activeCategoryTheoryLinks}
                onOpenTheory={onOpenTheory}
                returnToLessonLabel={returnToLessonLabel}
                onReturnToLesson={onReturnToLesson}
            />

            <ExerciseSolverModal
                isOpen={selection.solvingExercise !== null && selection.currentExercise !== null}
                exercise={selection.currentExercise}
                exerciseId={selection.solvingExercise}
                question={selection.currentExercise?.pergunta ?? null}
                onOpenTheory={onOpenTheory}
                solverMode={selection.solverMode}
                userAutomaton={selection.userAutomaton}
                onAutomatonChange={selection.setUserAutomaton}
                onLoadAnswerAutomaton={selection.loadAnswerAutomaton}
                onRestoreAttempt={selection.restoreSavedAttempt}
                hasSavedAttempt={selection.savedAttemptAutomaton !== null}
                isViewingAnswerAutomaton={selection.isViewingAnswerAutomaton}
                editorSessionKey={selection.editorSessionKey}
                onSimulate={handleSimulateFromExercise}
                userRegex={selection.userRegex}
                onRegexChange={handleRegexChange}
                regexError={verification.regexError}
                userGrammar={selection.userGrammar}
                onGrammarChange={handleGrammarChange}
                grammarError={verification.grammarError}
                grammarWarnings={verification.grammarWarnings}
                grammarTree={verification.grammarTree}
                userText={selection.userText}
                onTextChange={selection.setUserText}
                answeredLabel={answeredLabel}
                onMarkCompleted={markCompletedManually}
                onOpenConverter={() => selection.openConverter({
                    automaton: selection.userAutomaton,
                    grammar: selection.userGrammar || undefined,
                    regex: selection.userRegex || undefined
                })}
                onClose={stopSolving}
                onResetAutomaton={resetAutomaton}
                hasTests={verification.hasTests}
                tests={selection.tests}
                onToggleShowExpected={() => selection.setShowExpected((previous) => !previous)}
                showExpected={selection.showExpected}
                fastVerify={verification.fastVerify}
                onToggleFastVerify={() => verification.setFastVerify((previous) => !previous)}
                testResults={verification.testResults}
                verifyDisabledReason={verification.verifyDisabledReason}
                isVerifying={verification.isVerifying}
                onVerify={verifySolution}
                lastFailure={verification.lastFailure}
                equivalenceStatus={verification.equivalenceStatus}
                lastTrace={verification.lastTrace}
                formatStateList={verification.formatStateList}
                returnToLessonLabel={returnToLessonLabel}
                onReturnToLesson={onReturnToLesson}
            />

            <Suspense fallback={<ModalSkeleton label="Carregando conversor" />}>
                {selection.showConverter && (
                    <LazyConversionTool
                        isOpen={selection.showConverter}
                        onClose={() => selection.setShowConverter(false)}
                        initialAutomaton={selection.converterData.automaton ?? undefined}
                        initialRegex={selection.converterData.regex}
                        initialGrammar={selection.converterData.grammar}
                    />
                )}
            </Suspense>
        </div>
    );
};

export const ExerciciosSection = ({
    onSimulate,
    onOpenTheory,
    returnToLessonLabel,
    onReturnToLesson,
    initialCategoryId,
    initialExerciseId,
    onSelectionChange
}: {
    onSimulate: ExerciseSimulateHandler;
    onOpenTheory?: (moduleId: string, lessonId: string) => void;
    returnToLessonLabel?: string | null;
    onReturnToLesson?: () => void;
    initialCategoryId?: string;
    initialExerciseId?: number | null;
    onSelectionChange?: (categoryId: string, exerciseId: number | null) => void;
}) => {
    const { exerciseDatabase, isLoading, error } = useExerciseData();

    if (isLoading) {
        return <ExercisesSkeleton />;
    }

    if (error || Object.keys(exerciseDatabase).length === 0) {
        return <ExerciseDataState message={error ?? 'Nenhum exercício foi encontrado.'} />;
    }

    return (
        <LoadedExercisesSection
            exerciseDatabase={exerciseDatabase}
            onSimulate={onSimulate}
            onOpenTheory={onOpenTheory}
            returnToLessonLabel={returnToLessonLabel}
            onReturnToLesson={onReturnToLesson}
            initialCategoryId={initialCategoryId}
            initialExerciseId={initialExerciseId}
            onSelectionChange={onSelectionChange}
        />
    );
};
