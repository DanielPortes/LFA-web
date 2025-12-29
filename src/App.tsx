import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './hooks/ThemeContext';
import type { AutomatoData, Tab } from './types';
import { CustomCursor, SettingsModal, ToastProvider, Tutorial, useTutorial } from './components/ui';
import { getAutomatonFromUrl } from './utils/sharing';
import { UiSettingsProvider } from './hooks/UiSettingsContext';
import { useUrlState } from './hooks/useUrlState';
import { TopNav } from './components/layout';

import { HomeSection } from './pages/Home';
import { ConteudoSection } from './pages/Content';
import { ExerciciosSection } from './pages/Exercises';
import { SimulatorPage } from './pages/Simulator';

function MainApp() {
    const {
        activeTab,
        setActiveTab,
        contentSelection,
        setContentSelection,
        exerciseSelection,
        setExerciseSelection,
        updateUrl
    } = useUrlState();
    const [pendingSimulatorData, setPendingSimulatorData] = useState<AutomatoData | undefined>(undefined);
    const { showTutorial, setShowTutorial, completeTutorial } = useTutorial();
    const [showSettings, setShowSettings] = useState(false);
    const setTabAndClear = useCallback((
        tab: Tab,
        replace = false,
        extraUpdates: Record<string, string | number | null | undefined> = {}
    ) => {
        setActiveTab(tab);
        updateUrl({
            tab,
            module: null,
            lesson: null,
            cat: null,
            ex: null,
            ...extraUpdates
        }, replace);
    }, [setActiveTab, updateUrl]);

    // Check for automaton in URL on load
    useEffect(() => {
        const urlAutomaton = getAutomatonFromUrl();
        if (urlAutomaton) {
            setPendingSimulatorData(urlAutomaton);
            setTabAndClear('simulador', true, { automaton: null });
        }
    }, [setTabAndClear, updateUrl]);

    const handleTabChange = (tab: Tab) => setTabAndClear(tab);

    const handleSimulationRequest = useCallback((data: AutomatoData) => {
        setPendingSimulatorData(data);
        setTabAndClear('simulador');
    }, [setTabAndClear]);

    const handleContentSelectionChange = useCallback((moduleId: string | undefined, lessonId: string | undefined) => {
        setContentSelection({ moduleId, lessonId });
        updateUrl({ tab: 'conteudo', module: moduleId, lesson: lessonId });
    }, [updateUrl]);

    const handleExerciseSelectionChange = useCallback((categoryId: string, exerciseId: number | null) => {
        setExerciseSelection({ categoryId, exerciseId });
        updateUrl({ tab: 'exercicios', cat: categoryId, ex: exerciseId ?? undefined });
    }, [updateUrl]);

    useEffect(() => {
        if (activeTab === 'simulador' && pendingSimulatorData) {
            setPendingSimulatorData(undefined);
        }
    }, [activeTab, pendingSimulatorData]);

    return (
        <div className="min-h-screen flex flex-col pb-6 relative font-sans">
            <CustomCursor />
            <TopNav
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onShowTutorial={() => setShowTutorial(true)}
                onShowSettings={() => setShowSettings(true)}
            />

            <main
                className={`transition-all duration-500 ${
                    activeTab === 'simulador'
                        ? 'relative flex-1 w-full max-w-none mx-0 px-0 mt-0'
                        : 'flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-8 mt-24 md:mt-28'
                }`}
            >
                <div className={`transition-opacity duration-300 ${activeTab === 'home' ? 'block' : 'hidden'}`}>
                    <HomeSection onNavigate={handleTabChange} />
                </div>

                {activeTab === 'conteudo' && (
                    <ConteudoSection
                        onSimulate={handleSimulationRequest}
                        initialModuleId={contentSelection.moduleId}
                        initialLessonId={contentSelection.lessonId}
                        onSelectionChange={handleContentSelectionChange}
                    />
                )}

                {activeTab === 'exercicios' && (
                    <ExerciciosSection
                        onSimulate={handleSimulationRequest}
                        initialCategoryId={exerciseSelection.categoryId}
                        initialExerciseId={exerciseSelection.exerciseId}
                        onSelectionChange={handleExerciseSelectionChange}
                    />
                )}
                {activeTab === 'simulador' && <SimulatorPage initialData={pendingSimulatorData} />}
            </main>

            {/* Tutorial Overlay */}
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
