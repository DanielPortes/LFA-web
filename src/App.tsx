import { useState, useEffect, useCallback, useRef } from 'react';
import { ThemeProvider, useTheme } from './hooks/ThemeContext';
import type { AutomatoData, Tab } from './types';
import { Home, Book, PenTool, Code, Sun, Moon, LayoutGrid, HelpCircle, SlidersHorizontal } from 'lucide-react';
import { CustomCursor } from './components/ui/CustomCursor';
import { ToastProvider } from './components/ui/Toast';
import { Tutorial, useTutorial } from './components/ui/Tutorial';
import { getAutomatonFromUrl } from './utils/sharing';
import { UiSettingsProvider } from './hooks/UiSettingsContext';
import { SettingsModal } from './components/ui/SettingsModal';

const SIMULATOR_STORAGE_KEY = 'lfa-simulator-data';

import { HomeSection } from './pages/Home';
import { ConteudoSection } from './pages/Content';
import { ExerciciosSection } from './pages/Exercises';
import { SimulatorPage } from './pages/Simulator';

interface SidebarProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    onShowTutorial: () => void;
    onShowSettings: () => void;
}

const Navbar = ({ activeTab, setActiveTab, onShowTutorial, onShowSettings }: SidebarProps) => {
    const { theme, toggleTheme } = useTheme();
    const menuItems = [
        { id: 'home' as const, label: 'Início', icon: Home },
        { id: 'conteudo' as const, label: 'Material', icon: Book },
        { id: 'exercicios' as const, label: 'Exercícios', icon: PenTool },
        { id: 'simulador' as const, label: 'Simulador', icon: Code },
    ];

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-panel rounded-full px-2 py-1.5 flex items-center shadow-apple-lg">
            {/* Mobile Logo */}
            <div className="md:hidden pl-4 pr-2 flex items-center">
                <LayoutGrid className="text-ios-blue" size={20} />
            </div>

            <nav className="flex items-center gap-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`relative px-5 py-2.5 rounded-full transition-all duration-300 group flex items-center gap-2
                                ${isActive
                                    ? 'text-white'
                                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                }`}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-ios-blue rounded-full shadow-lg shadow-blue-500/30 -z-10 animate-scale-in" />
                            )}
                            <Icon size={18} strokeWidth={2.5} className="relative z-10" />
                            <span className={`text-sm font-semibold relative z-10 hidden md:block ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>

            <div className="w-px h-5 bg-gray-300 dark:bg-white/10 mx-3 hidden md:block"></div>

            <button
                onClick={onShowTutorial}
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95"
                title="Ajuda"
            >
                <HelpCircle size={18} />
            </button>

            <button
                onClick={onShowSettings}
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95"
                title="Preferências"
            >
                <SlidersHorizontal size={18} />
            </button>

            <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95"
            >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
        </div>
    );
};

function MainApp() {
    const [activeTab, setActiveTab] = useState<Tab>('home');
    const [simuladorData, setSimuladorData] = useState<AutomatoData | undefined>(undefined);
    const { showTutorial, setShowTutorial, completeTutorial } = useTutorial();
    const [showSettings, setShowSettings] = useState(false);
    const [contentSelection, setContentSelection] = useState<{ moduleId?: string; lessonId?: string }>({});
    const [exerciseSelection, setExerciseSelection] = useState<{ categoryId?: string; exerciseId: number | null }>({ exerciseId: null });
    const hasLoadedFromStorage = useRef(false);

    // Load simulator data from localStorage on mount
    useEffect(() => {
        if (hasLoadedFromStorage.current) return;
        try {
            const saved = localStorage.getItem(SIMULATOR_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved) as AutomatoData;
                if (parsed.estados && parsed.transicoes) {
                    setSimuladorData(parsed);
                    hasLoadedFromStorage.current = true;
                }
            }
        } catch {
            // ignore parse errors
        }
    }, []);

    // Save simulator data to localStorage when it changes
    useEffect(() => {
        if (simuladorData && simuladorData.estados && simuladorData.estados.length > 0) {
            try {
                localStorage.setItem(SIMULATOR_STORAGE_KEY, JSON.stringify(simuladorData));
            } catch {
                // ignore storage errors
            }
        }
    }, [simuladorData]);

    const updateUrl = useCallback((updates: Record<string, string | number | null | undefined>, replace = false) => {
        const params = new URLSearchParams(window.location.search);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }
        });
        const query = params.toString();
        const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
        if (replace) {
            window.history.replaceState({}, document.title, url);
        } else {
            window.history.pushState({}, document.title, url);
        }
    }, []);

    const applyUrlState = useCallback(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab') as Tab | null;
        const moduleId = params.get('module') || undefined;
        const lessonId = params.get('lesson') || undefined;
        const categoryId = params.get('cat') || undefined;
        const exerciseIdParam = params.get('ex');
        const exerciseId = exerciseIdParam ? Number(exerciseIdParam) : null;

        if (tab) setActiveTab(tab);
        setContentSelection({ moduleId, lessonId });
        setExerciseSelection({ categoryId, exerciseId });
    }, []);

    useEffect(() => {
        applyUrlState();
        const handlePop = () => applyUrlState();
        window.addEventListener('popstate', handlePop);
        return () => window.removeEventListener('popstate', handlePop);
    }, [applyUrlState]);

    // Check for automaton in URL on load
    useEffect(() => {
        const urlAutomaton = getAutomatonFromUrl();
        if (urlAutomaton) {
            setSimuladorData(urlAutomaton);
            setActiveTab('simulador');
            updateUrl({ automaton: null, tab: 'simulador' }, true);
        }
    }, [updateUrl]);

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        // Clear other params when changing tabs to avoid stale state
        updateUrl({
            tab,
            module: null,
            lesson: null,
            cat: null,
            ex: null
        });
    };

    const handleSimulationRequest = (data: AutomatoData) => {
        setSimuladorData(data);
        handleTabChange('simulador');
    };

    return (
        <div className="min-h-screen flex flex-col pb-6 relative font-sans">
            <CustomCursor />
            <Navbar
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                onShowTutorial={() => setShowTutorial(true)}
                onShowSettings={() => setShowSettings(true)}
            />

            <main className="flex-1 w-full max-w-7xl mx-auto px-6 mt-28 transition-all duration-500">
                <div className={`transition-opacity duration-300 ${activeTab === 'home' ? 'block' : 'hidden'}`}>
                    <HomeSection onNavigate={handleTabChange} />
                </div>

                {activeTab === 'conteudo' && (
                    <ConteudoSection
                        onSimulate={handleSimulationRequest}
                        initialModuleId={contentSelection.moduleId}
                        initialLessonId={contentSelection.lessonId}
                        onSelectionChange={(moduleId, lessonId) => {
                            setContentSelection({ moduleId, lessonId });
                            updateUrl({ tab: 'conteudo', module: moduleId, lesson: lessonId });
                        }}
                    />
                )}

                {activeTab === 'exercicios' && (
                    <ExerciciosSection
                        onSimulate={handleSimulationRequest}
                        initialCategoryId={exerciseSelection.categoryId}
                        initialExerciseId={exerciseSelection.exerciseId}
                        onSelectionChange={(categoryId, exerciseId) => {
                            setExerciseSelection({ categoryId, exerciseId });
                            updateUrl({ tab: 'exercicios', cat: categoryId, ex: exerciseId ?? undefined });
                        }}
                    />
                )}
                {activeTab === 'simulador' && <SimulatorPage initialData={simuladorData} />}
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
