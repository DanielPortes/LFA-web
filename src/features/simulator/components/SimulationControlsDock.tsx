import React from 'react';
import type { SimulationStep } from '../../../types';
import { X, Keyboard, RotateCcw, ListOrdered } from 'lucide-react';
import { SimulationControls } from '../../../components/ui';

interface SimulationControlsDockProps {
    inputRef: React.RefObject<HTMLInputElement | null>;
    inputString: string;
    onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    inputTokenization: 'auto' | 'char' | 'separator';
    inputSeparator: string;
    setInputTokenization: (value: 'auto' | 'char' | 'separator') => void;
    setInputSeparator: (value: string) => void;
    clearInput: () => void;
    hasInvalidInput: boolean;
    isPlaying: boolean;
    canPlay: boolean;
    canStepForward: boolean;
    historyLength: number;
    speed: number;
    simulationState: SimulationStep | null;
    hasSimulationProgress: boolean;
    isDesktopViewport: boolean;
    isTuring: boolean;
    stepCount: number;
    totalSteps: number;
    inspectorOpen: boolean;
    onToggleInspector: () => void;
    onPlay: () => void;
    onPause: () => void;
    onStep: () => void;
    onStepBack: () => void;
    onReset: () => void;
    onResetToEditor: () => void;
    onSpeedChange: (speed: number) => void;
}

export const SimulationControlsDock: React.FC<SimulationControlsDockProps> = ({
    inputRef,
    inputString,
    onInputChange,
    inputTokenization,
    inputSeparator,
    setInputTokenization,
    setInputSeparator,
    clearInput,
    hasInvalidInput,
    isPlaying,
    canPlay,
    canStepForward,
    historyLength,
    speed,
    simulationState,
    hasSimulationProgress,
    isDesktopViewport,
    isTuring,
    stepCount,
    totalSteps,
    inspectorOpen,
    onToggleInspector,
    onPlay,
    onPause,
    onStep,
    onStepBack,
    onReset,
    onResetToEditor,
    onSpeedChange,
}) => (
    <div className="glass-card p-2 md:p-3 rounded-[40px] flex flex-col lg:flex-row lg:items-center gap-3 pointer-events-auto shadow-apple-2xl border border-default/80 backdrop-blur-3xl bg-surface-1/90">
        <div className={`flex w-full lg:flex-1 items-center bg-surface-2/50 rounded-[28px] px-5 py-1 border-2 transition-all duration-300 ${
            hasInvalidInput
                ? 'border-ios-red ring-4 ring-ios-red/10'
                : 'border-default focus-within:border-ios-blue focus-within:ring-4 focus-within:ring-ios-blue/10 shadow-inner'
        }`}>
            <div className={`p-2 rounded-full mr-3 transition-colors ${hasInvalidInput ? 'text-ios-red bg-ios-red/10' : 'text-muted bg-surface-muted'}`}>
                <Keyboard size={20} strokeWidth={2.5} />
            </div>
            <input
                ref={inputRef}
                type="text"
                value={inputString}
                onChange={onInputChange}
                placeholder="Digite a entrada para o autômato..."
                className="flex-1 bg-transparent border-none outline-none text-base font-mono font-black py-3 text-primary placeholder:text-muted placeholder:opacity-40 min-w-0"
                aria-invalid={hasInvalidInput}
            />

            <div className="flex items-center gap-2 ml-3">
                <div className="flex items-center bg-surface-muted/80 rounded-2xl p-1.5 border border-default/60 shadow-sm">
                    <select
                        value={inputTokenization}
                        onChange={(event) => setInputTokenization(event.target.value as 'auto' | 'char' | 'separator')}
                        className="text-[10px] font-black uppercase tracking-widest bg-transparent px-3 py-1 text-secondary outline-none cursor-pointer hover:text-primary transition-colors"
                        title="Modo de leitura da entrada"
                        aria-label="Modo de leitura da entrada"
                    >
                        <option value="auto">Auto</option>
                        <option value="char">Carac.</option>
                        <option value="separator">Separ.</option>
                    </select>
                    {inputTokenization === 'separator' && (
                        <input
                            value={inputSeparator}
                            onChange={(event) => setInputSeparator(event.target.value)}
                            className="w-10 text-xs font-mono font-black bg-white dark:bg-black/40 rounded-xl px-2 py-1 text-center text-ios-blue border border-ios-blue/30 shadow-inner outline-none mx-1"
                            title="Símbolo separador"
                            placeholder="|"
                            aria-label="Símbolo separador da entrada"
                        />
                    )}
                </div>
            </div>

            {inputString && (
                <button
                    onClick={clearInput}
                    className="ml-3 p-2 rounded-full text-muted hover:text-ios-red hover:bg-ios-red/10 transition-all active:scale-90"
                    title="Limpar entrada"
                    aria-label="Limpar entrada"
                >
                    <X size={20} strokeWidth={3} />
                </button>
            )}
        </div>

        <div className="hidden lg:block w-px h-12 bg-border/40 mx-2"></div>

        <div className="w-full lg:w-auto flex justify-center scale-110 lg:scale-100 origin-center px-4">
            <SimulationControls
                isPlaying={isPlaying}
                canPlay={canPlay}
                canStep={canStepForward}
                canStepBack={historyLength > 1}
                speed={speed}
                onPlay={onPlay}
                onPause={onPause}
                onStep={onStep}
                onStepBack={onStepBack}
                onReset={onReset}
                onSpeedChange={onSpeedChange}
                disabled={hasInvalidInput}
                compact={!isDesktopViewport}
            />
        </div>

        <div className="flex items-center gap-2 lg:border-l border-default/40 lg:pl-4 justify-end">
            {simulationState && hasSimulationProgress && (
                <button
                    onClick={onResetToEditor}
                    className="p-3 rounded-[20px] bg-surface-muted text-secondary hover:text-ios-blue hover:bg-ios-blue/10 hover:border-ios-blue/30 border border-transparent transition-all active:scale-90"
                    title="Reiniciar e voltar ao editor"
                    aria-label="Reiniciar e voltar ao editor"
                >
                    <RotateCcw size={22} />
                </button>
            )}
            <div className="hidden sm:flex items-center justify-center min-w-[70px] text-[11px] font-black font-mono text-ios-blue bg-ios-blue/5 rounded-2xl h-12 border border-ios-blue/20 shadow-inner">
                {isTuring ? `H:${simulationState?.headPos ?? 0}` : `${stepCount}/${totalSteps}`}
            </div>
            <button
                onClick={onToggleInspector}
                className={`p-3 rounded-[20px] transition-all border-2 active:scale-95 ${
                    inspectorOpen
                        ? 'bg-ios-blue text-white shadow-xl shadow-blue-500/40 border-ios-blue'
                        : 'bg-surface-muted text-secondary hover:text-primary hover:bg-surface-hover border-transparent'
                }`}
                title={inspectorOpen ? 'Fechar painel de diagnóstico' : 'Abrir painel de diagnóstico'}
                aria-label={inspectorOpen ? 'Fechar painel de diagnóstico da simulação' : 'Abrir painel de diagnóstico da simulação'}
            >
                <ListOrdered size={22} strokeWidth={2.5} />
            </button>
        </div>
    </div>
);
