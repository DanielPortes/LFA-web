import React, { useState, useEffect, useId } from 'react';
import {
    MousePointer2, Plus, ArrowUpRight, Trash2, Play,
    ChevronRight, ChevronLeft, X, Keyboard, Move,
    ZoomIn, Lightbulb
} from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';

interface TutorialStep {
    title: string;
    description: string;
    icon: React.ReactNode;
    shortcut?: string;
}

const tutorialSteps: TutorialStep[] = [
    {
        title: "Criar Estados",
        description: "Clique duplo no canvas ou use a ferramenta Estado (S) para adicionar novos estados ao autômato.",
        icon: <Plus size={32} />,
        shortcut: "S"
    },
    {
        title: "Criar Transições",
        description: "Use a ferramenta Transição (T), clique no estado de origem e depois no destino para criar uma seta.",
        icon: <ArrowUpRight size={32} />,
        shortcut: "T"
    },
    {
        title: "Selecionar e Mover",
        description: "Use a ferramenta Ponteiro (V) para selecionar e arrastar estados. Shift+clique para seleção múltipla.",
        icon: <MousePointer2 size={32} />,
        shortcut: "V"
    },
    {
        title: "Editar Propriedades",
        description: "Clique em um estado para editar seu nome. Clique direito para marcar como Inicial ou Final.",
        icon: <Move size={32} />
    },
    {
        title: "Apagar Elementos",
        description: "Use a ferramenta Apagar (D) ou selecione e pressione Delete/Backspace.",
        icon: <Trash2 size={32} />,
        shortcut: "Del"
    },
    {
        title: "Navegação",
        description: "Space + arrastar para mover o canvas. Scroll do mouse ou botões +/- para zoom.",
        icon: <ZoomIn size={32} />,
        shortcut: "Space"
    },
    {
        title: "Simular",
        description: "Digite uma string de entrada e pressione Enter ou Play. Use as setas para avançar passo a passo.",
        icon: <Play size={32} />,
        shortcut: "Enter"
    },
    {
        title: "Atalhos Úteis",
        description: "Ctrl+Z para desfazer, Ctrl+Y para refazer, Ctrl+A para selecionar tudo. R para resetar simulação.",
        icon: <Keyboard size={32} />,
        shortcut: "Ctrl+Z"
    }
];

interface TutorialProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

export const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const titleId = useId();
    const dialogRef = useDialog(isOpen, onClose);

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
            setIsAnimating(true);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const step = tutorialSteps[currentStep];
    const isLast = currentStep === tutorialSteps.length - 1;
    const isFirst = currentStep === 0;

    const handleNext = () => {
        if (isLast) {
            onComplete();
            onClose();
        } else {
            setCurrentStep(s => s + 1);
        }
    };

    const handlePrev = () => {
        if (!isFirst) setCurrentStep(s => s - 1);
    };

    const handleSkip = () => {
        onComplete();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300
                    ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleSkip}
            />

            {/* Modal */}
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className={`
                relative w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl
                transform transition-all duration-500 ease-out overflow-hidden
                ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
            `}>
                {/* Header */}
                <div className="relative h-48 bg-gradient-to-br from-ios-blue to-ios-purple flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-black/10" />

                    {/* Animated background circles */}
                    <div className="absolute w-64 h-64 bg-white/10 rounded-full -top-20 -right-20 animate-pulse" />
                    <div className="absolute w-48 h-48 bg-white/10 rounded-full -bottom-10 -left-10 animate-pulse" style={{ animationDelay: '1s' }} />

                    <div className="relative z-10 text-white text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            {step.icon}
                        </div>
                        {step.shortcut && (
                            <kbd className="px-3 py-1 bg-white/20 rounded-lg text-sm font-mono font-bold backdrop-blur-sm">
                                {step.shortcut}
                            </kbd>
                        )}
                    </div>

                    {/* Close button */}
                    <button
                        onClick={handleSkip}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="flex items-center gap-2 mb-2">
                        <Lightbulb size={16} className="text-ios-orange" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Dica {currentStep + 1} de {tutorialSteps.length}
                        </span>
                    </div>

                    <h3 id={titleId} className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                        {step.title}
                    </h3>

                    <p className="text-[var(--text-secondary)] leading-relaxed mb-8">
                        {step.description}
                    </p>

                    {/* Progress dots */}
                    <div className="flex justify-center gap-2 mb-6">
                        {tutorialSteps.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentStep(idx)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    idx === currentStep
                                        ? 'w-6 bg-ios-blue'
                                        : idx < currentStep
                                            ? 'bg-ios-green'
                                            : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrev}
                            disabled={isFirst}
                            className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                                ${isFirst
                                    ? 'bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                    : 'bg-gray-100 dark:bg-white/10 text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-white/20'
                                }`}
                        >
                            <ChevronLeft size={18} />
                            Anterior
                        </button>

                        <button
                            onClick={handleNext}
                            className="flex-1 py-3 px-6 rounded-xl font-bold bg-ios-blue text-white hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                        >
                            {isLast ? 'Começar!' : 'Próximo'}
                            {!isLast && <ChevronRight size={18} />}
                        </button>
                    </div>

                    {/* Skip link */}
                    <button
                        onClick={handleSkip}
                        className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        Pular tutorial
                    </button>
                </div>
            </div>
        </div>
    );
};

// Hook to manage tutorial visibility
export const useTutorial = () => {
    const STORAGE_KEY = 'lfa-tutorial-completed';

    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem(STORAGE_KEY);
        if (!completed) {
            // Small delay to let the page load first
            const timer = setTimeout(() => setShowTutorial(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const completeTutorial = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setShowTutorial(false);
    };

    const resetTutorial = () => {
        localStorage.removeItem(STORAGE_KEY);
        setShowTutorial(true);
    };

    return { showTutorial, setShowTutorial, completeTutorial, resetTutorial };
};
