import type { Tab } from '../../types';
import { useTheme } from '../../hooks/ThemeContext';
import { Book, Code, HelpCircle, Home, LayoutGrid, Moon, PenTool, SlidersHorizontal, Sun } from 'lucide-react';

interface TopNavProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    onShowTutorial: () => void;
    onShowSettings: () => void;
}

const menuItems = [
    { id: 'home' as const, label: 'Inicio', icon: Home },
    { id: 'conteudo' as const, label: 'Material', icon: Book },
    { id: 'exercicios' as const, label: 'Exercicios', icon: PenTool },
    { id: 'simulador' as const, label: 'Simulador', icon: Code },
];

export const TopNav = ({ activeTab, onTabChange, onShowTutorial, onShowSettings }: TopNavProps) => {
    const { theme, toggleTheme } = useTheme();

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
                            onClick={() => onTabChange(item.id)}
                            className={`relative px-5 py-2.5 rounded-full transition-all duration-300 group flex items-center gap-2
                                ${isActive
                                    ? 'text-white'
                                    : 'text-secondary hover:text-primary'
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
                className="w-9 h-9 rounded-full flex items-center justify-center text-secondary hover:text-primary hover:bg-surface-muted transition-all active:scale-95"
                title="Ajuda"
            >
                <HelpCircle size={18} />
            </button>

            <button
                onClick={onShowSettings}
                className="w-9 h-9 rounded-full flex items-center justify-center text-secondary hover:text-primary hover:bg-surface-muted transition-all active:scale-95"
                title="Preferencias"
            >
                <SlidersHorizontal size={18} />
            </button>

            <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-full flex items-center justify-center text-secondary hover:text-primary hover:bg-surface-muted transition-all active:scale-95"
            >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
        </div>
    );
};
