import React from 'react';
import {
    Grid3X3,
    Zap,
    AlertTriangle,
    Beaker,
    Table,
    Play,
    ArrowRightLeft,
} from 'lucide-react';
import { ToolbarButton } from '../ui/ToolbarButton';
import type { AutomatoData } from '../../types';
import { isAP, isAFN, isAFD, isMoore, isMealy } from '../../types';
import { cn } from '../../utils/cn';

interface EditorAnalysisToolsProps {
    data: AutomatoData;
    snapToGrid: boolean;
    onToggleSnapToGrid: () => void;
    onMagicLayout: () => void;
    showValidation: boolean;
    onToggleValidation: () => void;
    showBatchTest: boolean;
    onToggleBatchTest: () => void;
    showTable: boolean;
    onToggleTable: () => void;
    hasErrors: boolean;
    warningCount: number;
    onToast: (message: string, type: 'warning' | 'error' | 'info' | 'success') => void;
}

export const EditorAnalysisTools: React.FC<EditorAnalysisToolsProps> = ({
    data,
    snapToGrid,
    onToggleSnapToGrid,
    onMagicLayout,
    showValidation,
    onToggleValidation,
    showBatchTest,
    onToggleBatchTest,
    showTable,
    onToggleTable,
    hasErrors,
    warningCount,
    onToast,
}) => {
    const isPda = isAP(data);

    const handleBatchTestToggle = () => {
        if (isPda) {
            onToast('Indisponível para AP', 'warning');
            return;
        }
        onToggleBatchTest();
    };

    const handleTableToggle = () => {
        if (isPda) {
            onToast('Indisponível para AP', 'warning');
            return;
        }
        onToggleTable();
    };

    return (
        <div
            className="glass-panel p-2 rounded-2xl flex flex-wrap gap-2 shadow-apple-md border border-default w-full animate-fade-in-up items-center justify-between"
            style={{ animationDelay: '0.1s' }}
        >
            <div className="flex gap-1">
                <ToolbarButton
                    icon={Grid3X3}
                    label="Grid"
                    active={snapToGrid}
                    onClick={onToggleSnapToGrid}
                    side="left"
                />
                <ToolbarButton
                    icon={Zap}
                    label="Magic Layout"
                    onClick={onMagicLayout}
                    side="left"
                />
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex gap-1">
                <ToolbarButton
                    icon={AlertTriangle}
                    label="Validar"
                    active={showValidation}
                    onClick={onToggleValidation}
                    side="left"
                    className={cn(hasErrors && 'text-ios-red')}
                    badge={warningCount > 0 ? warningCount : undefined}
                />
                <ToolbarButton
                    icon={Beaker}
                    label="Testes em Lote"
                    active={showBatchTest}
                    onClick={handleBatchTestToggle}
                    side="left"
                    disabled={isPda}
                />
                <ToolbarButton
                    icon={Table}
                    label="Tabela"
                    active={showTable}
                    onClick={handleTableToggle}
                    side="left"
                    disabled={isPda}
                />
            </div>
        </div>
    );
};

interface EditorConvertersPanelProps {
    data: AutomatoData;
    showUtilities: boolean;
    onConvertToDFA: () => void;
    onEliminateEpsilon: () => void;
    onMinimizeDFA: () => void;
    onMooreToMealy: () => void;
    onMealyToMoore: () => void;
}

export const EditorConvertersPanel: React.FC<EditorConvertersPanelProps> = ({
    data,
    showUtilities,
    onConvertToDFA,
    onEliminateEpsilon,
    onMinimizeDFA,
    onMooreToMealy,
    onMealyToMoore,
}) => {
    const showConverters =
        showUtilities &&
        (isAFN(data) || isAFD(data) || isMoore(data) || isMealy(data));

    if (!showConverters) return null;

    return (
        <div className="glass-panel p-3 rounded-2xl shadow-apple-md border border-default w-full animate-fade-in-up flex flex-col gap-2">
            <div className="text-xs font-bold text-muted uppercase px-1">
                Conversores
            </div>
            {isAFN(data) && (
                <>
                    <button
                        onClick={onConvertToDFA}
                        className="flex items-center w-full p-2.5 rounded-xl hover:bg-surface-hover text-xs font-semibold text-secondary border border-transparent hover:border-default transition-all"
                    >
                        <Play size={14} className="mr-2" /> AFN → AFD
                    </button>
                    <button
                        onClick={onEliminateEpsilon}
                        className="flex items-center w-full p-2.5 rounded-xl hover:bg-surface-hover text-xs font-semibold text-secondary border border-transparent hover:border-default transition-all"
                    >
                        <Play size={14} className="mr-2" /> Remover ε
                    </button>
                </>
            )}
            {isAFD(data) && (
                <button
                    onClick={onMinimizeDFA}
                    className="flex items-center w-full p-2.5 rounded-xl hover:bg-surface-hover text-xs font-semibold text-secondary border border-transparent hover:border-default transition-all"
                >
                    <Play size={14} className="mr-2" /> Minimizar AFD
                </button>
            )}
            {isMoore(data) && (
                <button
                    onClick={onMooreToMealy}
                    className="flex items-center w-full p-2.5 rounded-xl hover:bg-surface-hover text-xs font-semibold text-secondary border border-transparent hover:border-default transition-all"
                >
                    <ArrowRightLeft size={14} className="mr-2" /> Moore → Mealy
                </button>
            )}
            {isMealy(data) && (
                <button
                    onClick={onMealyToMoore}
                    className="flex items-center w-full p-2.5 rounded-xl hover:bg-surface-hover text-xs font-semibold text-secondary border border-transparent hover:border-default transition-all"
                >
                    <ArrowRightLeft size={14} className="mr-2" /> Mealy → Moore
                </button>
            )}
        </div>
    );
};

