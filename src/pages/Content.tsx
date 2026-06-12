import { useCallback, useId, useMemo, useState } from 'react';
import { resolveExerciseRefs } from '../data/learningConnections';
import type { AutomatoData, CourseModule } from '../types';
import { useProgress } from '../hooks/useProgress';
import { ContentPreviewModal } from '../features/content/ContentPreviewModal';
import { ContentSimulatorModal } from '../features/content/ContentSimulatorModal';
import { ContentSidebar } from '../features/content/ContentSidebar';
import { LessonContent } from '../features/content/LessonContent';
import { LessonHeader } from '../features/content/LessonHeader';
import { LessonNavigator } from '../features/content/LessonNavigator';
import { LessonSupportPanel } from '../features/content/LessonSupportPanel';
import { useContentSelection } from '../features/content/useContentSelection';
import { useCourseModulesData } from '../features/content/useCourseModulesData';
import { ContentSkeleton } from '../components/ui';
import { cloneAutomaton } from '../utils/cloneAutomaton';
import { ArrowRight, CheckCircle2, PenTool } from 'lucide-react';

interface ContentProps {
    onOpenFullSimulator?: (data: AutomatoData) => void;
    onOpenExercise?: (categoryId: string, exerciseId: number) => void;
    initialModuleId?: string;
    initialLessonId?: string;
    onSelectionChange?: (moduleId: string, lessonId: string, lessonTitle?: string) => void;
}

const ContentDataState = ({ message }: { message: string }) => (
    <div className="flex min-h-[40vh] items-center justify-center px-4">
        <div className="glass-card max-w-md p-6 text-center">
            <p className="ui-kicker text-secondary">Conteúdo</p>
            <p className="mt-2 text-sm text-primary">{message}</p>
        </div>
    </div>
);

const collectInlineExerciseRefs = (blocks: CourseModule['lessons'][number]['content']) => (
    new Set(blocks.flatMap((block) => block.exerciseRef ? [block.exerciseRef] : []))
);

const LoadedContentSection = ({
    modules,
    onOpenFullSimulator,
    onOpenExercise,
    initialModuleId,
    initialLessonId,
    onSelectionChange
}: ContentProps & { modules: CourseModule[] }) => {
    const sidebarId = useId();
    const [selectedSimulatorAutomaton, setSelectedSimulatorAutomaton] = useState<AutomatoData | null>(null);
    const {
        progress,
        isLessonCompleted,
        isLessonMarkedForReview,
        markLessonVisited,
        markLessonCompleted,
        toggleLessonReview,
        getProgressPercentage,
        resetProgress
    } = useProgress();

    const {
        activeModule,
        activeLesson,
        activeLessonId,
        activeSearchResult,
        clearSelectedAutomaton,
        closeSidebar,
        firstSearchResult,
        filteredModules,
        handleNavigate,
        isSidebarOpen,
        lastVisitedLesson,
        moduleIndex,
        moveSearchResultSelection,
        navigateToFirstSearchResult,
        navigationState,
        openSidebar,
        searchQuery,
        searchResultPosition,
        selectedAutomaton,
        setSearchQuery,
        setSelectedAutomaton,
        totalLessons
    } = useContentSelection({
        modules,
        initialModuleId,
        initialLessonId,
        lastVisitedLessonId: progress.lastVisited,
        markLessonVisited,
        onSelectionChange
    });
    const inlineExerciseRefs = useMemo(
        () => collectInlineExerciseRefs(activeLesson.content),
        [activeLesson.content]
    );
    const relatedExercises = useMemo(
        () => resolveExerciseRefs(activeLesson.exerciseRefs),
        [activeLesson.exerciseRefs]
    );
    const supportRelatedExercises = useMemo(
        () => relatedExercises.filter((exercise) => !inlineExerciseRefs.has(exercise.ref)),
        [inlineExerciseRefs, relatedExercises]
    );
    const firstRelatedExercise = relatedExercises[0] ?? null;
    const handleOpenInlineSimulator = useCallback((data: AutomatoData) => {
        clearSelectedAutomaton();
        setSelectedSimulatorAutomaton(cloneAutomaton(data));
    }, [clearSelectedAutomaton]);
    const handleCloseInlineSimulator = useCallback(() => {
        setSelectedSimulatorAutomaton(null);
    }, []);

    return (
        <div className="relative flex w-full min-w-0 gap-4 md:gap-6 pb-8">
            {isSidebarOpen && (
                <button
                    className="md:hidden fixed inset-0 z-30 bg-black/45 backdrop-blur-[2px]"
                    onClick={closeSidebar}
                    aria-label="Fechar menu de conteúdo"
                />
            )}

            <ContentSidebar
                sidebarId={sidebarId}
                isSidebarOpen={isSidebarOpen}
                progressPercent={getProgressPercentage(totalLessons)}
                onResetProgress={resetProgress}
                lastVisitedLesson={lastVisitedLesson ?? null}
                activeLessonId={activeLessonId}
                onContinue={handleNavigate}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSearchSubmit={navigateToFirstSearchResult}
                onMoveSearchResult={moveSearchResultSelection}
                firstSearchResult={firstSearchResult}
                activeSearchResult={activeSearchResult}
                searchResultPosition={searchResultPosition}
                filteredModules={filteredModules}
                isLessonCompleted={isLessonCompleted}
                isLessonMarkedForReview={isLessonMarkedForReview}
                onMarkLessonCompleted={markLessonCompleted}
                onToggleLessonReview={toggleLessonReview}
                onNavigate={handleNavigate}
            />

            <main
                id="main-content-scroll"
                className="content-reading-panel render-lite-panel flex-1 min-w-0 scroll-smooth rounded-2xl md:rounded-3xl pb-10"
            >
                <div className="mx-auto max-w-5xl px-5 py-8 pb-32 md:px-10 md:py-10">
                    <LessonHeader
                        moduleIndex={moduleIndex}
                        moduleTitle={activeModule.title}
                        lessonTitle={activeLesson.title}
                        lessonDescription={activeLesson.description}
                        objectives={activeLesson.objectives}
                        prerequisites={activeLesson.prerequisites}
                        keywords={activeLesson.keywords}
                        estimatedMinutes={activeLesson.estimatedMinutes}
                        references={activeLesson.references}
                        status={activeLesson.status}
                        isSidebarOpen={isSidebarOpen}
                        sidebarId={sidebarId}
                        onOpenSidebar={openSidebar}
                    />

                    <LessonContent
                        blocks={activeLesson.content}
                        onSimulate={handleOpenInlineSimulator}
                        onExpand={setSelectedAutomaton}
                        onOpenExercise={(exerciseRef) => {
                            const exercise = resolveExerciseRefs([exerciseRef])[0];
                            if (!exercise || !onOpenExercise) return;
                            onOpenExercise(exercise.categoryId, exercise.exerciseId);
                        }}
                    />

                    <LessonSupportPanel
                        summary={activeLesson.summary}
                        commonMistakes={activeLesson.commonMistakes}
                        relatedExercises={supportRelatedExercises}
                        onOpenExercise={onOpenExercise}
                    />

                    <section className="lesson-next-step mt-12 rounded-[24px] border border-status-info/20 bg-status-info-soft/55 p-5 shadow-apple-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                                <div className="ui-kicker text-status-info">Próximo passo</div>
                                <h2 className="mt-2 text-xl font-black text-primary">
                                    Fixe esta lição antes de avançar
                                </h2>
                                <p className="mt-2 text-sm leading-relaxed text-secondary">
                                    Resolva a prática associada, marque a lição como concluída ou siga para a próxima aula quando o conceito estiver claro.
                                </p>
                            </div>

                            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                                {firstRelatedExercise && onOpenExercise && (
                                    <button
                                        type="button"
                                        onClick={() => onOpenExercise(firstRelatedExercise.categoryId, firstRelatedExercise.exerciseId)}
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-ios-blue px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-ios-blue/20 transition-colors hover:opacity-90"
                                    >
                                        <PenTool size={15} />
                                        Abrir exercício
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => markLessonCompleted(activeLessonId)}
                                    disabled={isLessonCompleted(activeLessonId)}
                                    className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-colors ${
                                        isLessonCompleted(activeLessonId)
                                            ? 'cursor-default border border-ios-green/20 bg-ios-green/10 text-ios-green'
                                            : 'border border-ios-green/25 bg-ios-green text-white hover:bg-green-600'
                                    }`}
                                >
                                    <CheckCircle2 size={15} />
                                    {isLessonCompleted(activeLessonId) ? 'Concluída' : 'Marcar concluída'}
                                </button>
                                {navigationState.next && (
                                    <button
                                        type="button"
                                        onClick={() => handleNavigate(navigationState.next!.modId, navigationState.next!.lessonId)}
                                        className="inline-flex items-center justify-center gap-2 rounded-full border border-default bg-surface-1 px-4 py-2.5 text-xs font-bold text-primary transition-colors hover:bg-surface-hover"
                                    >
                                        Próxima lição
                                        <ArrowRight size={15} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    <LessonNavigator
                        isCompleted={isLessonCompleted(activeLessonId)}
                        onMarkCompleted={() => markLessonCompleted(activeLessonId)}
                        previousLesson={navigationState.prev}
                        nextLesson={navigationState.next}
                        onNavigate={handleNavigate}
                    />
                </div>
            </main>

            <ContentPreviewModal
                automaton={selectedAutomaton}
                onClose={clearSelectedAutomaton}
                onSimulate={handleOpenInlineSimulator}
            />
            <ContentSimulatorModal
                automaton={selectedSimulatorAutomaton}
                onClose={handleCloseInlineSimulator}
                onOpenFullSimulator={onOpenFullSimulator}
            />
        </div>
    );
};

export const ConteudoSection = ({
    onOpenFullSimulator,
    onOpenExercise,
    initialModuleId,
    initialLessonId,
    onSelectionChange
}: ContentProps) => {
    const { modules, isLoading, error } = useCourseModulesData();

    if (isLoading) {
        return <ContentSkeleton />;
    }

    if (error || modules.length === 0) {
        return <ContentDataState message={error ?? 'Nenhum módulo teórico foi encontrado.'} />;
    }

    return (
        <LoadedContentSection
            modules={modules}
            onOpenFullSimulator={onOpenFullSimulator}
            onOpenExercise={onOpenExercise}
            initialModuleId={initialModuleId}
            initialLessonId={initialLessonId}
            onSelectionChange={onSelectionChange}
        />
    );
};
