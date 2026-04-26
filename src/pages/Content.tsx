import { useCallback, useId, useState } from 'react';
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
import { cloneAutomaton } from '../utils/cloneAutomaton';

interface ContentProps {
    onOpenFullSimulator?: (data: AutomatoData) => void;
    onOpenExercise?: (categoryId: string, exerciseId: number) => void;
    initialModuleId?: string;
    initialLessonId?: string;
    onSelectionChange?: (moduleId: string, lessonId: string) => void;
}

const ContentDataState = ({ message }: { message: string }) => (
    <div className="flex min-h-[40vh] items-center justify-center px-4">
        <div className="glass-card max-w-md p-6 text-center">
            <p className="ui-kicker text-secondary">Conteúdo</p>
            <p className="mt-2 text-sm text-primary">{message}</p>
        </div>
    </div>
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
        markLessonVisited,
        markLessonCompleted,
        getProgressPercentage,
        resetProgress
    } = useProgress();

    const {
        activeModule,
        activeLesson,
        activeLessonId,
        clearSelectedAutomaton,
        closeSidebar,
        filteredModules,
        handleNavigate,
        isSidebarOpen,
        lastVisitedLesson,
        moduleIndex,
        navigationState,
        openSidebar,
        searchQuery,
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
    const relatedExercises = resolveExerciseRefs(activeLesson.exerciseRefs);
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
                filteredModules={filteredModules}
                isLessonCompleted={isLessonCompleted}
                onNavigate={handleNavigate}
            />

            <main
                id="main-content-scroll"
                className="render-lite-panel flex-1 min-w-0 scroll-smooth rounded-2xl md:rounded-3xl glass-panel border border-default dark:border-transparent md:border-default md:dark:border-default pb-10"
            >
                <div className="max-w-6xl mx-auto py-10 px-6 md:px-12 pb-32">
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
                        relatedExercises={relatedExercises}
                        onOpenExercise={onOpenExercise}
                    />

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
        return <ContentDataState message="Carregando o roteiro teórico da disciplina." />;
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
