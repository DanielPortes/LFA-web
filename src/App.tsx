import { useCallback, useEffect, useRef, useState } from 'react';
import { ThemeProvider } from './hooks/ThemeContext';
import type { AutomatoData, Tab } from './types';
import { CustomCursor, SettingsModal, ToastProvider, Tutorial, useTutorial } from './components/ui';
import { getAutomatonFromUrl } from './utils/sharing';
import { UiSettingsProvider } from './hooks/UiSettingsContext';
import { PageAmbientBackground, TopNav } from './components/layout';
import { useRouteState } from './features/navigation';

import { HomeSection } from './pages/Home';
import { ConteudoSection } from './pages/Content';
import { ExerciciosSection } from './pages/Exercises';
import { SimulatorPage } from './pages/Simulator';

const cloneAutomaton = (data: AutomatoData): AutomatoData => {
    if (typeof structuredClone === 'function') {
        return structuredClone(data);
    }
    return JSON.parse(JSON.stringify(data)) as AutomatoData;
};

function MainApp() {
    const { route, updateRoute } = useRouteState();
    const [pendingSimulatorData, setPendingSimulatorData] = useState<AutomatoData | undefined>(() => {
        const fromUrl = getAutomatonFromUrl();
        return fromUrl ? cloneAutomaton(fromUrl) : undefined;
    });
    const { showTutorial, setShowTutorial, completeTutorial } = useTutorial();
    const [showSettings, setShowSettings] = useState(false);
    const [ambientTransitionKey, setAmbientTransitionKey] = useState(0);
    const sharedAutomatonHandled = useRef(false);

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
        }
        triggerAmbientTransition();
        navigateToTab(tab);
    }, [navigateToTab, route.tab, triggerAmbientTransition]);

    const handleSimulationRequest = useCallback((data: AutomatoData) => {
        setPendingSimulatorData(cloneAutomaton(data));
        if (route.tab !== 'simulador') {
            triggerAmbientTransition();
        }
        navigateToTab('simulador');
    }, [navigateToTab, route.tab, triggerAmbientTransition]);

    const handleContentSelectionChange = useCallback((moduleId: string | undefined, lessonId: string | undefined) => {
        updateRoute({
            tab: 'conteudo',
            moduleId: moduleId ?? null,
            lessonId: lessonId ?? null
        });
    }, [updateRoute]);

    const handleExerciseSelectionChange = useCallback((categoryId: string, exerciseId: number | null) => {
        updateRoute({
            tab: 'exercicios',
            categoryId: categoryId ?? null,
            exerciseId
        });
    }, [updateRoute]);

    return (
        <div className="min-h-screen flex flex-col pb-6 relative font-sans">
            <PageAmbientBackground tab={route.tab} transitionKey={ambientTransitionKey} />

            <a href="#main-content" className="skip-link">
                Pular para o conteúdo principal
            </a>

            <CustomCursor />

            <TopNav
                activeTab={route.tab}
                onTabChange={handleTabChange}
                onShowTutorial={() => setShowTutorial(true)}
                onShowSettings={() => setShowSettings(true)}
            />

            <main
                id="main-content"
                className={`relative z-10 transition-all duration-500 ${
                    route.tab === 'simulador'
                        ? 'flex-1 min-h-0 w-full max-w-none mx-0 px-0 mt-0'
                        : 'flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-8 mt-28 md:mt-32'
                }`}
            >
                <div className={`transition-opacity duration-300 ${route.tab === 'home' ? 'block' : 'hidden'}`}>
                    <HomeSection onNavigate={handleTabChange} />
                </div>

                {route.tab === 'conteudo' && (
                    <ConteudoSection
                        onSimulate={handleSimulationRequest}
                        initialModuleId={route.moduleId}
                        initialLessonId={route.lessonId}
                        onSelectionChange={handleContentSelectionChange}
                    />
                )}

                {route.tab === 'exercicios' && (
                    <ExerciciosSection
                        onSimulate={handleSimulationRequest}
                        initialCategoryId={route.categoryId}
                        initialExerciseId={route.exerciseId}
                        onSelectionChange={handleExerciseSelectionChange}
                    />
                )}

                {route.tab === 'simulador' && (
                    <SimulatorPage
                        initialData={pendingSimulatorData}
                        onInitialDataConsumed={() => setPendingSimulatorData(undefined)}
                    />
                )}
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
