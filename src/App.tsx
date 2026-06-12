import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { ThemeProvider } from './hooks/ThemeContext';
import type { AutomatoData, Tab } from './types';
import { ContentSkeleton, ExercisesSkeleton, SettingsModal, SkeletonBlock, ToastProvider, Tutorial, useTutorial } from './components/ui';
import { getAutomatonFromUrl } from './utils/sharing';
import { UiSettingsProvider } from './hooks/UiSettingsContext';
import { PageAmbientBackground, TopNav } from './components/layout';
import { useRouteState } from './features/navigation';

import { HomeSection } from './pages/Home';
import { cloneAutomaton } from './utils/cloneAutomaton';

const ConteudoSection = lazy(async () => {
    const module = await import('./pages/Content');
    return { default: module.ConteudoSection };
});

const ExerciciosSection = lazy(async () => {
    const module = await import('./pages/Exercises');
    return { default: module.ExerciciosSection };
});

const SimulatorPage = lazy(async () => {
    const module = await import('./pages/Simulator');
    return { default: module.SimulatorPage };
});

const GrammarPage = lazy(async () => {
    const module = await import('./pages/Grammar');
    return { default: module.GrammarPage };
});

interface ExerciseReturnTarget {
    moduleId: string;
    lessonId: string;
    label: string;
}

interface SimulatorExerciseReturnTarget {
    categoryId: string;
    exerciseId: number;
    label: string;
}

const RouteLoadingFallback = ({ tab, workspace }: { tab: Tab; workspace: boolean }) => {
    if (workspace) {
        return (
            <div className="flex h-full min-h-[calc(100dvh-5rem)] items-center justify-center px-3 pb-3 pt-20 sm:px-4 lg:px-5">
                <div className="relative h-[calc(100dvh-7rem)] w-full overflow-hidden rounded-[28px] border border-default bg-canvas shadow-apple-xl">
                    <div className="absolute left-4 top-4 z-10 flex gap-2">
                        <SkeletonBlock className="glass-panel h-10 w-28 rounded-2xl border border-default" />
                        <SkeletonBlock className="glass-panel h-10 w-20 rounded-2xl border border-default [animation-delay:80ms]" />
                    </div>
                    <SkeletonBlock className="absolute right-4 top-4 z-10 h-12 w-48 rounded-2xl border border-default shadow-apple-md" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative h-56 w-[min(34rem,80vw)]">
                            <SkeletonBlock className="absolute left-2 top-20 h-[4.5rem] w-[4.5rem] rounded-full border-[5px] border-ios-blue/45 shadow-apple-md" />
                            <SkeletonBlock className="absolute left-1/2 top-6 h-[4.5rem] w-[4.5rem] -translate-x-1/2 rounded-full border-[5px] border-ios-purple/40 shadow-apple-md [animation-delay:90ms]" />
                            <SkeletonBlock className="absolute right-2 top-20 h-[4.5rem] w-[4.5rem] rounded-full border-[5px] border-ios-green/45 shadow-apple-md [animation-delay:140ms]" />
                            <SkeletonBlock className="absolute left-[5.2rem] top-[6.4rem] h-1.5 w-[calc(50%-6.5rem)] rotate-[-18deg] rounded-full" />
                            <SkeletonBlock className="absolute right-[5.2rem] top-[6.4rem] h-1.5 w-[calc(50%-6.5rem)] rotate-[18deg] rounded-full [animation-delay:120ms]" />
                            <SkeletonBlock className="absolute bottom-0 left-1/2 h-12 w-64 -translate-x-1/2 rounded-[24px] border border-default shadow-apple-md [animation-delay:180ms]" />
                        </div>
                    </div>
                    <SkeletonBlock className="absolute inset-x-4 bottom-4 mx-auto h-20 max-w-4xl rounded-[32px] border border-default shadow-apple-xl" />
                </div>
            </div>
        );
    }

    if (tab === 'conteudo') {
        return <ContentSkeleton />;
    }

    if (tab === 'exercicios') {
        return <ExercisesSkeleton />;
    }

    return (
        <div className="mx-auto grid min-h-[46vh] w-full max-w-6xl place-items-center px-4">
            <div className="glass-card w-full max-w-3xl p-6">
                <SkeletonBlock className="mb-4 h-8 w-56" />
                <SkeletonBlock className="mb-2 h-4 w-full" />
                <SkeletonBlock className="h-4 w-3/4" />
            </div>
        </div>
    );
};

function MainApp() {
    const { route, updateRoute } = useRouteState();
    const [pendingSimulatorData, setPendingSimulatorData] = useState<AutomatoData | undefined>(() => {
        const fromUrl = getAutomatonFromUrl();
        return fromUrl ? cloneAutomaton(fromUrl) : undefined;
    });
    const [lastContentLesson, setLastContentLesson] = useState<ExerciseReturnTarget | null>(null);
    const [exerciseReturnTarget, setExerciseReturnTarget] = useState<ExerciseReturnTarget | null>(null);
    const [simulatorExerciseReturnTarget, setSimulatorExerciseReturnTarget] = useState<SimulatorExerciseReturnTarget | null>(null);
    const { showTutorial, setShowTutorial, completeTutorial } = useTutorial();
    const [showSettings, setShowSettings] = useState(false);
    const [ambientTransitionKey, setAmbientTransitionKey] = useState(0);
    const sharedAutomatonHandled = useRef(false);
    const isWorkspaceTab = route.tab === 'simulador' || route.tab === 'gramatica';
    const showAmbientBackground = !isWorkspaceTab;

    useEffect(() => {
        if (sharedAutomatonHandled.current) return;
        if (!pendingSimulatorData) return;

        sharedAutomatonHandled.current = true;
        updateRoute(
            { tab: 'simulador' },
            { replace: true, stripAutomaton: true }
        );
    }, [pendingSimulatorData, updateRoute]);

    const triggerAmbientTransition = useCallback(() => {
        setAmbientTransitionKey((previous) => previous + 1);
    }, []);

    const navigateToTab = useCallback((tab: Tab) => {
        setExerciseReturnTarget(null);
        if (tab !== 'simulador') {
            setSimulatorExerciseReturnTarget(null);
        }

        if (tab === 'home') {
            updateRoute({ tab, moduleId: null, lessonId: null, categoryId: null, exerciseId: null });
            return;
        }
        if (tab === 'conteudo') {
            updateRoute({ tab, categoryId: null, exerciseId: null });
            return;
        }
        if (tab === 'exercicios') {
            updateRoute({ tab, moduleId: null, lessonId: null });
            return;
        }
        updateRoute({ tab, moduleId: null, lessonId: null, categoryId: null, exerciseId: null });
    }, [updateRoute]);

    const handleTabChange = useCallback((tab: Tab) => {
        if (tab === route.tab) return;
        if (tab !== 'simulador') {
            setPendingSimulatorData(undefined);
            setSimulatorExerciseReturnTarget(null);
        }
        triggerAmbientTransition();
        navigateToTab(tab);
    }, [navigateToTab, route.tab, triggerAmbientTransition]);

    const handleSimulationRequest = useCallback((data: AutomatoData, origin?: SimulatorExerciseReturnTarget) => {
        setPendingSimulatorData(cloneAutomaton(data));
        setSimulatorExerciseReturnTarget(origin ?? null);
        if (route.tab !== 'simulador') {
            triggerAmbientTransition();
        }
        navigateToTab('simulador');
    }, [navigateToTab, route.tab, triggerAmbientTransition]);

    const handleContentSelectionChange = useCallback((moduleId: string | undefined, lessonId: string | undefined, lessonTitle?: string) => {
        updateRoute({
            tab: 'conteudo',
            moduleId: moduleId ?? null,
            lessonId: lessonId ?? null
        });

        if (moduleId && lessonId) {
            setLastContentLesson({
                moduleId,
                lessonId,
                label: lessonTitle ?? 'aula anterior'
            });
        }
    }, [updateRoute]);

    const handleExerciseSelectionChange = useCallback((categoryId: string, exerciseId: number | null) => {
        updateRoute({
            tab: 'exercicios',
            categoryId: categoryId ?? null,
            exerciseId
        });
    }, [updateRoute]);

    const handleOpenExerciseFromContent = useCallback((categoryId: string, exerciseId: number) => {
        if (route.tab !== 'exercicios') {
            triggerAmbientTransition();
        }

        const currentContentTarget = route.moduleId && route.lessonId
            ? {
                moduleId: route.moduleId,
                lessonId: route.lessonId,
                label: lastContentLesson?.moduleId === route.moduleId && lastContentLesson.lessonId === route.lessonId
                    ? lastContentLesson.label
                    : 'aula anterior'
            }
            : lastContentLesson;

        setExerciseReturnTarget(currentContentTarget ?? null);

        updateRoute({
            tab: 'exercicios',
            categoryId,
            exerciseId,
            moduleId: null,
            lessonId: null
        });
    }, [lastContentLesson, route.lessonId, route.moduleId, route.tab, triggerAmbientTransition, updateRoute]);

    const handleOpenTheoryFromExercises = useCallback((moduleId: string, lessonId: string) => {
        if (route.tab !== 'conteudo') {
            triggerAmbientTransition();
        }

        setExerciseReturnTarget(null);
        updateRoute({
            tab: 'conteudo',
            moduleId,
            lessonId,
            categoryId: null,
            exerciseId: null
        });
    }, [route.tab, triggerAmbientTransition, updateRoute]);

    const handleReturnToLessonFromExercise = useCallback(() => {
        if (!exerciseReturnTarget) return;

        if (route.tab !== 'conteudo') {
            triggerAmbientTransition();
        }

        updateRoute({
            tab: 'conteudo',
            moduleId: exerciseReturnTarget.moduleId,
            lessonId: exerciseReturnTarget.lessonId,
            categoryId: null,
            exerciseId: null
        });
        setExerciseReturnTarget(null);
    }, [exerciseReturnTarget, route.tab, triggerAmbientTransition, updateRoute]);

    const handleReturnToExerciseFromSimulator = useCallback(() => {
        if (!simulatorExerciseReturnTarget) return;

        triggerAmbientTransition();
        updateRoute({
            tab: 'exercicios',
            categoryId: simulatorExerciseReturnTarget.categoryId,
            exerciseId: simulatorExerciseReturnTarget.exerciseId,
            moduleId: null,
            lessonId: null
        });
        setSimulatorExerciseReturnTarget(null);
    }, [simulatorExerciseReturnTarget, triggerAmbientTransition, updateRoute]);

    const routeFallback = <RouteLoadingFallback tab={route.tab} workspace={isWorkspaceTab} />;

    return (
        <div className={`min-h-screen flex flex-col relative font-sans ${isWorkspaceTab ? 'pb-0' : 'pb-6'}`}>
            {showAmbientBackground && (
                <PageAmbientBackground tab={route.tab} transitionKey={ambientTransitionKey} />
            )}

            <a href="#main-content" className="skip-link">
                Pular para o conteúdo principal
            </a>

            <TopNav
                activeTab={route.tab}
                onTabChange={handleTabChange}
                onShowTutorial={() => setShowTutorial(true)}
                onShowSettings={() => setShowSettings(true)}
            />

            <main
                id="main-content"
                className={`relative z-10 transition-all duration-500 ${
                    isWorkspaceTab
                        ? 'flex flex-col flex-1 min-h-0 w-full max-w-none mx-0 px-0 mt-0 overflow-hidden'
                        : 'flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-8 mt-20 sm:mt-[5.5rem] lg:mt-24'
                }`}
            >
                {route.tab === 'home' && (
                    <HomeSection onNavigate={handleTabChange} />
                )}

                <Suspense fallback={routeFallback}>
                    {route.tab === 'conteudo' && (
                        <ConteudoSection
                            onOpenFullSimulator={handleSimulationRequest}
                            onOpenExercise={handleOpenExerciseFromContent}
                            initialModuleId={route.moduleId}
                            initialLessonId={route.lessonId}
                            onSelectionChange={handleContentSelectionChange}
                        />
                    )}

                    {route.tab === 'exercicios' && (
                        <ExerciciosSection
                            onSimulate={handleSimulationRequest}
                            onOpenTheory={handleOpenTheoryFromExercises}
                            returnToLessonLabel={exerciseReturnTarget?.label ?? null}
                            onReturnToLesson={exerciseReturnTarget ? handleReturnToLessonFromExercise : undefined}
                            initialCategoryId={route.categoryId}
                            initialExerciseId={route.exerciseId}
                            onSelectionChange={handleExerciseSelectionChange}
                        />
                    )}

                    {route.tab === 'simulador' && (
                        <SimulatorPage
                            initialData={pendingSimulatorData}
                            onInitialDataConsumed={() => setPendingSimulatorData(undefined)}
                            returnToExerciseLabel={simulatorExerciseReturnTarget?.label ?? null}
                            onReturnToExercise={simulatorExerciseReturnTarget ? handleReturnToExerciseFromSimulator : undefined}
                        />
                    )}

                    {route.tab === 'gramatica' && (
                        <GrammarPage />
                    )}
                </Suspense>
            </main>

            <Tutorial
                isOpen={showTutorial}
                onClose={() => setShowTutorial(false)}
                onComplete={completeTutorial}
            />

            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />
        </div>
    );
}

export default function App() {
    return (
        <UiSettingsProvider>
            <ThemeProvider>
                <ToastProvider>
                    <MainApp />
                </ToastProvider>
            </ThemeProvider>
        </UiSettingsProvider>
    );
}
