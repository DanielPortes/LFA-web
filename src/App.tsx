import { useState } from 'react';
import { ThemeProvider, useTheme } from './hooks/ThemeContext';
import type { AutomatoData, Tab } from './types';
import { Home, Book, PenTool, Code, Sun, Moon, LayoutGrid } from 'lucide-react';

import { HomeSection } from './pages/Home';
import { ConteudoSection } from './pages/Content';
import { ExerciciosSection } from './pages/Exercises';
import { SimulatorPage } from './pages/Simulator';

interface SidebarProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}

const Navbar = ({ activeTab, setActiveTab }: SidebarProps) => {
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
                                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
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
                onClick={toggleTheme}
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95"
            >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
        </div>
    );
};

function MainApp() {
    const [activeTab, setActiveTab] = useState<Tab>('home');
    const [simuladorData, setSimuladorData] = useState<AutomatoData | undefined>(undefined);

    const handleSimulationRequest = (data: AutomatoData) => {
        setSimuladorData(data);
        setActiveTab('simulador');
    };

    return (
        <div className="min-h-screen flex flex-col pb-6 relative font-sans">
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 w-full max-w-7xl mx-auto px-6 mt-28 transition-all duration-500">
                <div className={`transition-opacity duration-300 ${activeTab === 'home' ? 'block' : 'hidden'}`}>
                    <HomeSection onNavigate={setActiveTab} />
                </div>
                {activeTab === 'conteudo' && <ConteudoSection />}
                {activeTab === 'exercicios' && <ExerciciosSection onSimulate={handleSimulationRequest} />}
                {activeTab === 'simulador' && <SimulatorPage initialData={simuladorData} />}
            </main>
        </div>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <MainApp />
        </ThemeProvider>
    );
}