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

    const routeFallback = isWorkspaceTab ? (
        <div className="flex h-full min-h-[70vh] items-center justify-center px-6 pt-24">
            <div className="glass-panel rounded-[32px] border border-default px-6 py-5 text-center shadow-apple-lg">
                <p className="ui-kicker text-secondary">Carregando</p>
                <p className="mt-2 text-sm text-primary">Preparando o laboratório visual.</p>
            </div>
        </div>
    ) : (
        <div className="flex min-h-[40vh] items-center justify-center px-4">
            <div className="glass-card max-w-md p-6 text-center">
                <p className="ui-kicker text-secondary">Carregando</p>
                <p className="mt-2 text-sm text-primary">Montando a próxima seção da plataforma.</p>
            </div>
        </div>
    );

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
