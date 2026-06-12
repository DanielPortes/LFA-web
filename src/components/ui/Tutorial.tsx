import React, { useState, useEffect, useId } from 'react';
import {
    AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft, FileText,
    Keyboard, Lightbulb, PenTool, Play, Route, Search, X
} from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';
import type { ModalBaseProps } from './types';

interface TutorialStep {
    title: string;
    description: string;
    icon: React.ReactNode;
    shortcut?: string;
}

const tutorialSteps: TutorialStep[] = [
    {
        title: "Comece pela trilha",
        description: "Abra Trilha para estudar em sequência. Cada lição mostra objetivos, pré-requisitos, resumo, erros comuns e prática associada.",
        icon: <Route size={32} />
    },
    {
        title: "Busque e volte rápido",
        description: "Use a busca da trilha para encontrar conceito, teorema, algoritmo ou símbolo formal. Enter abre a lição destacada.",
        icon: <Search size={32} />,
        shortcut: "Enter"
    },
    {
        title: "Pratique com feedback",
        description: "Em Exercícios, resolva, verifique, leia o primeiro erro, abra uma pista e tente de novo antes de consultar o gabarito.",
        icon: <PenTool size={32} />,
        shortcut: "Ctrl+Enter"
    },
    {
        title: "Use o erro como roteiro",
        description: "Quando um teste falha, compare entrada, esperado, obtido, motivo e traço de execução. Depois revise a teoria ligada ao exercício.",
        icon: <AlertTriangle size={32} />
    },
    {
        title: "Teste no simulador",
        description: "No Simulador, crie um autômato, comece por template ou importe uma regex. Digite uma entrada para ver estados ativos e histórico.",
        icon: <Play size={32} />,
        shortcut: "Space"
    },
    {
        title: "Derive gramáticas",
        description: "Em Gramática, edite regras, escolha um exemplo, digite uma palavra, derive e leia os passos para entender aceitação ou rejeição.",
        icon: <FileText size={32} />
    },
    {
        title: "Marque revisão",
        description: "Conclua lições, marque pontos para revisar e use resumos e erros comuns como lista curta antes de refazer exercícios.",
        icon: <CheckCircle2 size={32} />
    },
    {
        title: "Atalhos do editor",
        description: "No canvas, use ferramentas de estado e transição, Ctrl+Z para desfazer e scroll para zoom. Espaço pausa ou continua a simulação.",
        icon: <Keyboard size={32} />,
        shortcut: "Ctrl+Z"
    }
];

interface TutorialProps extends ModalBaseProps {
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
        <div className="overlay-backdrop z-[200]" onClick={handleSkip}>
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className={`
                overlay-surface relative w-full max-w-lg
                transform transition-all duration-500 ease-out overflow-hidden
                ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
            `}
                onClick={(event) => event.stopPropagation()}
            >
                {/* Header */}
                <div className="relative h-44 bg-gradient-to-br from-ios-blue to-ios-purple flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-black/10" />

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
                        aria-label="Fechar tutorial"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="flex items-center gap-2 mb-2">
                        <Lightbulb size={16} className="text-ios-orange" />
                        <span className="ui-kicker text-muted">
                            Dica {currentStep + 1} de {tutorialSteps.length}
                        </span>
                    </div>

                    <h3 id={titleId} className="text-2xl font-bold text-primary mb-3">
                        {step.title}
                    </h3>

                    <p className="text-secondary leading-relaxed mb-8">
                        {step.description}
                    </p>

                    {/* Progress dots */}
                    <div className="flex justify-center gap-2 mb-6">
                        {tutorialSteps.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentStep(idx)}
                                aria-label={`Ir para dica ${idx + 1}`}
                                aria-pressed={idx === currentStep}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    idx === currentStep
                                        ? 'w-6 bg-ios-blue'
                                        : idx < currentStep
                                            ? 'bg-ios-green'
                                            : 'bg-text-muted'
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
                                    ? 'bg-surface-muted text-muted opacity-70 cursor-not-allowed'
                                    : 'bg-surface-muted text-primary hover:bg-surface-soft'
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
                        className="w-full mt-4 py-2 text-sm text-muted hover:text-secondary transition-colors"
                    >
                        Pular tutorial
                    </button>
                </div>
            </div>
        </div>
    );
};


