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
    useEmptyInputAlias: () => void;
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
    useEmptyInputAlias,
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
    <div className="glass-card flex flex-col gap-2 rounded-[32px] border border-default/80 bg-surface-1/90 p-1.5 shadow-apple-xl backdrop-blur-3xl md:p-2 lg:flex-row lg:items-center">
        <div className={`flex w-full items-center rounded-[24px] border-2 bg-surface-2/50 px-3 py-0.5 transition-all duration-300 lg:flex-1 ${
            hasInvalidInput
                ? 'border-ios-red ring-4 ring-ios-red/10'
                : 'border-default focus-within:border-ios-blue focus-within:ring-4 focus-within:ring-ios-blue/10 shadow-inner'
        }`}>
            <div className={`mr-2 rounded-full p-1.5 transition-colors ${hasInvalidInput ? 'text-ios-red bg-ios-red/10' : 'text-muted bg-surface-muted'}`}>
                <Keyboard size={16} strokeWidth={2.5} />
            </div>
            <input
                ref={inputRef}
                type="text"
                value={inputString}
                onChange={onInputChange}
                placeholder="Digite a entrada para o autômato..."
                className="min-w-0 flex-1 border-none bg-transparent py-2 font-mono text-sm font-black text-primary outline-none placeholder:text-muted placeholder:opacity-40"
                aria-invalid={hasInvalidInput}
            />

            <div className="ml-2 flex items-center gap-1.5">
                <button
                    type="button"
                    onClick={useEmptyInputAlias}
                    className="rounded-xl border border-default bg-surface-muted/80 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-secondary shadow-sm transition-all hover:bg-ios-blue/10 hover:text-ios-blue"
                    title="Usar entrada vazia (eps)"
                    aria-label="Usar entrada vazia, eps"
                >
                    eps
                </button>
                <div className="flex items-center rounded-xl border border-default/60 bg-surface-muted/80 p-1 shadow-sm">
                    <select
                        value={inputTokenization}
                        onChange={(event) => setInputTokenization(event.target.value as 'auto' | 'char' | 'separator')}
                        className="cursor-pointer bg-transparent px-2 py-1 text-[10px] font-black uppercase tracking-widest text-secondary outline-none transition-colors hover:text-primary"
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
                            className="mx-1 w-9 rounded-lg border border-ios-blue/30 bg-white px-2 py-1 text-center font-mono text-xs font-black text-ios-blue shadow-inner outline-none dark:bg-black/40"
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
                    className="ml-2 rounded-full p-1.5 text-muted transition-all hover:bg-ios-red/10 hover:text-ios-red active:scale-90"
                    title="Limpar entrada"
                    aria-label="Limpar entrada"
                >
                    <X size={18} strokeWidth={3} />
                </button>
            )}
        </div>

        <div className="mx-1 hidden h-10 w-px bg-border/40 lg:block"></div>

        <div className="flex w-full origin-center justify-center px-1 lg:w-auto">
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

        <div className="flex items-center justify-end gap-1.5 border-default/40 lg:border-l lg:pl-3">
            {simulationState && hasSimulationProgress && (
                <button
                    onClick={onResetToEditor}
                    className="rounded-2xl border border-transparent bg-surface-muted p-2.5 text-secondary transition-all hover:border-ios-blue/30 hover:bg-ios-blue/10 hover:text-ios-blue active:scale-90"
                    title="Reiniciar e voltar ao editor"
                    aria-label="Reiniciar e voltar ao editor"
                >
                    <RotateCcw size={19} />
                </button>
            )}
            <div className="hidden h-10 min-w-[58px] items-center justify-center rounded-2xl border border-ios-blue/20 bg-ios-blue/5 font-mono text-[11px] font-black text-ios-blue shadow-inner sm:flex">
                {isTuring ? `H:${simulationState?.headPos ?? 0}` : `${stepCount}/${totalSteps}`}
            </div>
            <button
                onClick={onToggleInspector}
                className={`rounded-2xl border-2 p-2.5 transition-all active:scale-95 ${
                    inspectorOpen
                        ? 'bg-ios-blue text-white shadow-xl shadow-blue-500/40 border-ios-blue'
                        : 'bg-surface-muted text-secondary hover:text-primary hover:bg-surface-hover border-transparent'
                }`}
                title={inspectorOpen ? 'Fechar painel de diagnóstico' : 'Abrir painel de diagnóstico'}
                aria-label={inspectorOpen ? 'Fechar painel de diagnóstico da simulação' : 'Abrir painel de diagnóstico da simulação'}
            >
                <ListOrdered size={19} strokeWidth={2.5} />
            </button>
        </div>
    </div>
);
