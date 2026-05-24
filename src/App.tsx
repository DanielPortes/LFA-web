import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { ThemeProvider } from './hooks/ThemeContext';
import type { AutomatoData, Tab } from './types';
import { CustomCursor, SettingsModal, ToastProvider, Tutorial, useTutorial } from './components/ui';
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

const skeletonLine = 'animate-pulse rounded-full bg-surface-muted/80';
const skeletonPanel = 'border border-default bg-surface-1/88 shadow-apple-md';

const RouteLoadingFallback = ({ tab, workspace }: { tab: Tab; workspace: boolean }) => {
    if (workspace) {
        return (
            <div className="flex h-full min-h-[calc(100dvh-5rem)] items-center justify-center px-3 pb-3 pt-20 sm:px-4 lg:px-5">
                <div className="relative h-[calc(100dvh-7rem)] w-full overflow-hidden rounded-[28px] border border-default bg-canvas shadow-apple-xl">
                    <div className="absolute left-4 top-4 z-10 flex gap-2">
                        <div className="glass-panel h-10 w-28 animate-pulse rounded-2xl border border-default bg-surface-1/85" />
                        <div className="glass-panel h-10 w-20 animate-pulse rounded-2xl border border-default bg-surface-1/70 [animation-delay:80ms]" />
                    </div>
                    <div className="absolute right-4 top-4 z-10 h-12 w-48 animate-pulse rounded-2xl border border-default bg-surface-1/85 shadow-apple-md" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative h-56 w-[min(34rem,80vw)]">
                            <div className="absolute left-2 top-20 h-[4.5rem] w-[4.5rem] animate-pulse rounded-full border-[5px] border-ios-blue/45 bg-surface-1 shadow-apple-md" />
                            <div className="absolute left-1/2 top-6 h-[4.5rem] w-[4.5rem] -translate-x-1/2 animate-pulse rounded-full border-[5px] border-ios-purple/40 bg-surface-1 shadow-apple-md [animation-delay:90ms]" />
                            <div className="absolute right-2 top-20 h-[4.5rem] w-[4.5rem] animate-pulse rounded-full border-[5px] border-ios-green/45 bg-surface-1 shadow-apple-md [animation-delay:140ms]" />
                            <div className="absolute left-[5.2rem] top-[6.4rem] h-1.5 w-[calc(50%-6.5rem)] rotate-[-18deg] animate-pulse rounded-full bg-ios-blue/30" />
                            <div className="absolute right-[5.2rem] top-[6.4rem] h-1.5 w-[calc(50%-6.5rem)] rotate-[18deg] animate-pulse rounded-full bg-ios-green/30 [animation-delay:120ms]" />
                            <div className="absolute bottom-0 left-1/2 h-12 w-64 -translate-x-1/2 animate-pulse rounded-[24px] border border-default bg-surface-1/80 shadow-apple-md [animation-delay:180ms]" />
                        </div>
                    </div>
                    <div className="absolute inset-x-4 bottom-4 mx-auto h-20 max-w-4xl animate-pulse rounded-[32px] border border-default bg-surface-1/90 shadow-apple-xl" />
                </div>
            </div>
        );
    }

    if (tab === 'conteudo') {
        return (
            <div className="relative flex w-full min-w-0 gap-4 pb-8 md:gap-6">
                <aside className={`hidden w-[320px] shrink-0 rounded-3xl p-4 md:block ${skeletonPanel}`}>
                    <div className="mb-5 flex items-center gap-3">
                        <div className="h-10 w-10 animate-pulse rounded-xl bg-surface-muted" />
                        <div className="min-w-0 flex-1 space-y-2">
                            <div className={`${skeletonLine} h-3 w-24`} />
                            <div className={`${skeletonLine} h-4 w-40`} />
                        </div>
                    </div>
                    <div className="space-y-3">
                        {[0, 1, 2, 3, 4].map((item) => (
                            <div key={item} className="rounded-2xl border border-default bg-surface-2/60 p-3">
                                <div className={`${skeletonLine} mb-2 h-3 w-20`} />
                                <div className={`${skeletonLine} h-4 w-full`} />
                            </div>
                        ))}
                    </div>
                </aside>
                <section className={`min-h-[62vh] flex-1 rounded-2xl p-6 md:rounded-3xl md:p-10 ${skeletonPanel}`}>
                    <div className="mb-8 flex flex-wrap items-center gap-3">
                        <div className="h-7 w-20 animate-pulse rounded-full bg-surface-muted" />
                        <div className="h-7 w-28 animate-pulse rounded-full bg-surface-muted/80" />
                    </div>
                    <div className={`${skeletonLine} mb-4 h-10 w-3/4 max-w-3xl`} />
                    <div className={`${skeletonLine} mb-3 h-4 w-full max-w-4xl`} />
                    <div className={`${skeletonLine} mb-10 h-4 w-2/3 max-w-3xl`} />
                    <div className="grid gap-4 lg:grid-cols-2">
                        {[0, 1, 2, 3].map((item) => (
                            <div key={item} className="rounded-2xl border border-default bg-surface-2/55 p-5">
                                <div className={`${skeletonLine} mb-3 h-4 w-36`} />
                                <div className={`${skeletonLine} mb-2 h-3 w-full`} />
                                <div className={`${skeletonLine} h-3 w-3/4`} />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        );
    }

    if (tab === 'exercicios') {
        return (
            <div className="relative flex w-full min-w-0 gap-4 pb-8 md:gap-6">
                <aside className={`hidden w-[300px] shrink-0 rounded-3xl p-4 md:block ${skeletonPanel}`}>
                    <div className={`${skeletonLine} mb-5 h-8 w-40`} />
                    <div className="space-y-2">
                        {[0, 1, 2, 3, 4, 5].map((item) => (
                            <div key={item} className="flex items-center gap-3 rounded-2xl border border-default bg-surface-2/60 p-3">
                                <div className="h-8 w-8 animate-pulse rounded-xl bg-surface-muted" />
                                <div className={`${skeletonLine} h-3 flex-1`} />
                            </div>
                        ))}
                    </div>
                </aside>
                <section className="flex-1 space-y-4">
                    <div className={`rounded-[24px] p-6 ${skeletonPanel}`}>
                        <div className={`${skeletonLine} mb-3 h-8 w-56`} />
                        <div className="flex gap-2">
                            <div className="h-6 w-24 animate-pulse rounded-full bg-surface-muted" />
                            <div className="h-6 w-28 animate-pulse rounded-full bg-surface-muted/80" />
                        </div>
                    </div>
                    {[0, 1, 2].map((item) => (
                        <div key={item} className={`rounded-[24px] p-6 ${skeletonPanel}`}>
                            <div className="flex gap-4">
                                <div className="h-10 w-10 animate-pulse rounded-xl bg-surface-muted" />
                                <div className="flex-1">
                                    <div className={`${skeletonLine} mb-3 h-5 w-4/5`} />
                                    <div className={`${skeletonLine} mb-5 h-4 w-2/3`} />
                                    <div className="flex flex-wrap gap-2">
                                        <div className="h-9 w-32 animate-pulse rounded-xl bg-status-success-soft" />
                                        <div className="h-9 w-24 animate-pulse rounded-xl bg-surface-muted" />
                                        <div className="h-9 w-36 animate-pulse rounded-xl bg-surface-muted/80" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        );
    }

    return (
        <div className="mx-auto grid min-h-[46vh] w-full max-w-6xl place-items-center px-4">
            <div className="glass-card w-full max-w-3xl p-6">
                <div className={`${skeletonLine} mb-4 h-8 w-56`} />
                <div className={`${skeletonLine} mb-2 h-4 w-full`} />
                <div className={`${skeletonLine} h-4 w-3/4`} />
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
    const showCustomCursor = !isWorkspaceTab;

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

            {showCustomCursor && <CustomCursor />}

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
