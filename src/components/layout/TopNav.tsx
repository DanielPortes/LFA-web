import type { Tab } from '../../types';
import { useTheme } from '../../hooks/ThemeContext';
import { Book, Code, HelpCircle, Home, Moon, PenTool, SlidersHorizontal, Sun } from 'lucide-react';

interface TopNavProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    onShowTutorial: () => void;
    onShowSettings: () => void;
}

const menuItems = [
    { id: 'home' as const, label: 'Início', icon: Home },
    { id: 'conteudo' as const, label: 'Material', icon: Book },
    { id: 'exercicios' as const, label: 'Exercícios', icon: PenTool },
    { id: 'simulador' as const, label: 'Simulador', icon: Code },
];

const actionButtonClass =
    'w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-secondary hover:text-primary hover:bg-surface-muted transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue/35';

export const TopNav = ({ activeTab, onTabChange, onShowTutorial, onShowSettings }: TopNavProps) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="fixed top-3 md:top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-1rem)] max-w-[940px] glass-panel rounded-2xl md:rounded-full px-3 py-1.5 flex items-center gap-2 shadow-apple-lg">
            <nav
                className="flex items-center gap-1 overflow-x-auto max-w-[calc(100%-9.5rem)] sm:max-w-[calc(100%-10.5rem)] [scrollbar-width:none] [-ms-overflow-style:none] snap-x snap-mandatory"
                aria-label="Navegação principal"
            >
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onTabChange(item.id)}
                            aria-label={item.label}
                            aria-current={isActive ? 'page' : undefined}
                            className={`relative snap-start shrink-0 px-2.5 sm:px-3.5 md:px-4 py-2 rounded-full transition-all duration-300 group flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue/35
                                ${isActive
                                    ? 'text-white'
                                    : 'text-secondary hover:text-primary'
                                }`}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-ios-blue rounded-full shadow-lg shadow-blue-500/30 -z-10 animate-scale-in" />
                            )}
                            <Icon size={17} strokeWidth={2.5} className="relative z-10" />
                            <span className={`text-xs sm:text-sm font-semibold relative z-10 whitespace-nowrap ${isActive ? 'opacity-100' : 'opacity-75'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>

            <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
                <div className="w-px h-5 bg-border mx-0.5 sm:mx-1" />

                <button
                    type="button"
                    onClick={onShowTutorial}
                    className={actionButtonClass}
                    title="Ajuda"
                    aria-label="Abrir ajuda"
                >
                    <HelpCircle size={18} />
                </button>

                <button
                    type="button"
                    onClick={onShowSettings}
                    className={actionButtonClass}
                    title="Preferências"
                    aria-label="Abrir preferências"
                >
                    <SlidersHorizontal size={18} />
                </button>

                <button
                    type="button"
                    onClick={toggleTheme}
                    className={actionButtonClass}
                    aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
                    aria-pressed={theme === 'dark'}
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </div>
        </header>
    );
};
