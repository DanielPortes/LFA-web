import React from 'react';
import {
    Grid3X3,
    Zap,
    AlertTriangle,
    Beaker,
    Table,
    Sparkles,
    Play,
    ArrowRightLeft,
} from 'lucide-react';
import type { AutomatoData } from '../../../types';
import type { ValidationIssue } from '../../../utils/conversions';
import { ValidationPanel } from '../../ui/ValidationPanel';
import { BatchTestPanel } from '../../ui/BatchTestPanel';
import { EquivalentsPanel } from '../../ui/EquivalentsPanel';
import { ToolbarButton } from '../../ui/ToolbarButton';
import { EditorPropertiesCard } from './EditorPropertiesCard';
import type { EditorPdaProps } from './types';

interface EditorDiagnosticsPanelProps {
    data: AutomatoData;
    pdaProps: EditorPdaProps;
    readOnly?: boolean;
    snapToGrid: boolean;
    showUtilities: boolean;
    showProps: boolean;
    showValidation: boolean;
    showBatchTest: boolean;
    showTable: boolean;
    showEquivalents: boolean;
    validationIssues: ValidationIssue[];
    hasErrors: boolean;
    warningCount: number;
    alphabetInput: string;
    stackAlphabetInput: string;
    stackStartSymbol: string;
    onToggleProps: () => void;
    onTypeChange: (nextTipo: AutomatoData['tipo']) => void;
    onAutoAlphabet: () => void;
    onAlphabetInputChange: (value: string) => void;
    onAlphabetFocus: () => void;
    onAlphabetCommit: (value: string) => void;
    onStackAlphabetInputChange: (value: string) => void;
    onStackAlphabetFocus: () => void;
    onStackAlphabetCommit: (value: string) => void;
    onStackStartChange: (value: string) => void;
    onStackStartFocus: () => void;
    onStackStartCommit: (value: string) => void;
    onToggleSnapToGrid: () => void;
    onMagicLayout: () => void;
    onToggleValidation: () => void;
    onToggleBatchTest: () => void;
    onToggleTable: () => void;
    onToggleEquivalents: () => void;
    onFocusState: (stateId: string) => void;
    onLoadEquivalent: (equivalent: AutomatoData) => void;
    onConvertToDFA: () => void;
    onEliminateEpsilon: () => void;
    onMinimizeDfa: () => void;
    onMooreToMealy: () => void;
    onMealyToMoore: () => void;
}

export const EditorDiagnosticsPanel: React.FC<EditorDiagnosticsPanelProps> = ({
    data,
    pdaProps,
    readOnly = false,
    snapToGrid,
    showUtilities,
    showProps,
    showValidation,
    showBatchTest,
    showTable,
    showEquivalents,
    validationIssues,
    hasErrors,
    warningCount,
    alphabetInput,
    stackAlphabetInput,
    stackStartSymbol,
    onToggleProps,
    onTypeChange,
    onAutoAlphabet,
    onAlphabetInputChange,
    onAlphabetFocus,
    onAlphabetCommit,
    onStackAlphabetInputChange,
    onStackAlphabetFocus,
    onStackAlphabetCommit,
    onStackStartChange,
    onStackStartFocus,
    onStackStartCommit,
    onToggleSnapToGrid,
    onMagicLayout,
    onToggleValidation,
    onToggleBatchTest,
    onToggleTable,
    onToggleEquivalents,
    onFocusState,
    onLoadEquivalent,
    onConvertToDFA,
    onEliminateEpsilon,
    onMinimizeDfa,
    onMooreToMealy,
    onMealyToMoore,
}) => (
    <div className="flex min-h-0 flex-col gap-3">
        <div className="flex flex-col gap-3 w-full lg:max-h-[calc(100dvh-12rem)] lg:overflow-y-auto lg:overflow-x-hidden lg:custom-scrollbar lg:pr-1">
            <EditorPropertiesCard
                data={data}
                pdaProps={pdaProps}
                readOnly={readOnly}
                showProps={showProps}
                alphabetInput={alphabetInput}
                stackAlphabetInput={stackAlphabetInput}
                stackStartSymbol={stackStartSymbol}
                onToggleProps={onToggleProps}
                onTypeChange={onTypeChange}
                onAutoAlphabet={onAutoAlphabet}
                onAlphabetInputChange={onAlphabetInputChange}
                onAlphabetFocus={onAlphabetFocus}
                onAlphabetCommit={onAlphabetCommit}
                onStackAlphabetInputChange={onStackAlphabetInputChange}
                onStackAlphabetFocus={onStackAlphabetFocus}
                onStackAlphabetCommit={onStackAlphabetCommit}
                onStackStartChange={onStackStartChange}
                onStackStartFocus={onStackStartFocus}
                onStackStartCommit={onStackStartCommit}
            />

            {!readOnly && (
                <div className="glass-panel p-2 rounded-2xl flex flex-wrap gap-2 shadow-apple-md border border-default w-full animate-fade-in-up items-center justify-between" style={{ animationDelay: '0.1s' }}>
                    <div className="flex gap-1">
                        <ToolbarButton icon={Grid3X3} label="Grid" active={snapToGrid} onClick={onToggleSnapToGrid} side="left" />
                        <ToolbarButton icon={Zap} label="Magic Layout" onClick={onMagicLayout} side="left" />
                    </div>

                    <div className="w-px h-6 bg-border" />

                    <div className="flex gap-1">
                        <ToolbarButton
                            icon={AlertTriangle}
                            label="Validar"
                            active={showValidation}
                            onClick={onToggleValidation}
                            side="left"
                            className={hasErrors ? 'text-ios-red' : ''}
                            badge={warningCount > 0 ? warningCount : undefined}
                        />
                        <ToolbarButton
                            icon={Beaker}
                            label="Testes em Lote"
                            active={showBatchTest}
                            onClick={onToggleBatchTest}
                            side="left"
                            disabled={data.tipo === 'AP'}
                        />
                        <ToolbarButton
                            icon={Table}
                            label="Tabela"
                            active={showTable}
                            onClick={onToggleTable}
                            side="left"
                            disabled={data.tipo === 'AP'}
                        />
                        <ToolbarButton
                            icon={Sparkles}
                            label="Equivalentes"
                            active={showEquivalents}
                            onClick={onToggleEquivalents}
                            side="left"
                        />
                    </div>
                </div>
            )}

            {showValidation && !readOnly && (
                <div className="w-full animate-fade-in-up">
                    <ValidationPanel issues={validationIssues} automaton={data} onStateClick={onFocusState} />
                </div>
            )}

            {showBatchTest && !readOnly && data.tipo !== 'AP' && (
                <div className="w-full animate-fade-in-up">
                    <BatchTestPanel automaton={data} onClose={onToggleBatchTest} />
                </div>
            )}

            {showEquivalents && (
                <div className="w-full animate-fade-in-up">
                    <EquivalentsPanel data={data} onLoadEquivalent={onLoadEquivalent} />
                </div>
            )}

            {showUtilities && !readOnly && (data.tipo === 'AFN' || data.tipo === 'AFD' || data.tipo === 'Moore' || data.tipo === 'Mealy') && (
                <div className="glass-panel p-3 rounded-2xl shadow-apple-md border border-default w-full animate-fade-in-up flex flex-col gap-2">
                    <div className="text-xs font-bold text-muted uppercase px-1">Conversores</div>

                    {data.tipo === 'AFN' && (
                        <>
                            <button onClick={onConvertToDFA} className="flex items-center w-full p-2.5 rounded-xl hover:bg-surface-hover text-xs font-semibold text-secondary border border-transparent hover:border-default transition-all">
                                <Play size={14} className="mr-2" /> AFN → AFD
                            </button>
                            <button onClick={onEliminateEpsilon} className="flex items-center w-full p-2.5 rounded-xl hover:bg-surface-hover text-xs font-semibold text-secondary border border-transparent hover:border-default transition-all">
                                <Play size={14} className="mr-2" /> Remover ε
                            </button>
                        </>
                    )}

                    {data.tipo === 'AFD' && (
                        <button onClick={onMinimizeDfa} className="flex items-center w-full p-2.5 rounded-xl hover:bg-surface-hover text-xs font-semibold text-secondary border border-transparent hover:border-default transition-all">
                            <Play size={14} className="mr-2" /> Minimizar AFD
                        </button>
                    )}

                    {data.tipo === 'Moore' && (
                        <button onClick={onMooreToMealy} className="flex items-center w-full p-2.5 rounded-xl hover:bg-surface-hover text-xs font-semibold text-secondary border border-transparent hover:border-default transition-all">
                            <ArrowRightLeft size={14} className="mr-2" /> Moore → Mealy
                        </button>
                    )}

                    {data.tipo === 'Mealy' && (
                        <button onClick={onMealyToMoore} className="flex items-center w-full p-2.5 rounded-xl hover:bg-surface-hover text-xs font-semibold text-secondary border border-transparent hover:border-default transition-all">
                            <ArrowRightLeft size={14} className="mr-2" /> Mealy → Moore
                        </button>
                    )}
                </div>
            )}
        </div>
    </div>
);
