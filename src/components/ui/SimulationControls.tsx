/**
 * Simulation control buttons and speed slider
 *
 * @module components/ui/SimulationControls
 */

import React, { useId } from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Zap } from 'lucide-react';

interface SimulationControlsProps {
    isPlaying: boolean;
    canPlay?: boolean;
    canStepBack: boolean;
    canStep: boolean;
    speed: number;
    onPlay: () => void;
    onPause: () => void;
    onStep: () => void;
    onStepBack: () => void;
    onReset: () => void;
    onSpeedChange: (speed: number) => void;
    onRunAll?: () => void;
    disabled?: boolean;
    compact?: boolean;
}

const speedOptions = [200, 400, 700, 1000, 1500, 2000] as const;

const formatSpeed = (value: number) => `${(value / 1000).toFixed(1)}s`;

export const SimulationControls: React.FC<SimulationControlsProps> = ({
    isPlaying,
    canPlay = true,
    canStepBack,
    canStep,
    speed,
    onPlay,
    onPause,
    onStep,
    onStepBack,
    onReset,
    onSpeedChange,
    onRunAll,
    disabled = false,
    compact = false
}) => {
    const speedControlId = useId();
    const buttonClass = compact
        ? 'p-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue/35'
        : 'p-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue/35';

    const iconSize = compact ? 16 : 18;

    return (
        <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 bg-surface-muted/50 rounded-xl p-1 border border-default/50">
                <button
                    type="button"
                    onClick={onReset}
                    disabled={disabled}
                    className={`${buttonClass} hover:bg-surface-soft text-secondary hover:text-primary active:scale-95`}
                    title="Reiniciar simulação (R)"
                    aria-label="Reiniciar simulação"
                >
                    <RotateCcw size={iconSize} />
                </button>

                <button
                    type="button"
                    onClick={onStepBack}
                    disabled={disabled || !canStepBack}
                    className={`${buttonClass} hover:bg-surface-soft text-secondary hover:text-primary active:scale-95`}
                    title="Voltar um passo (Seta para a esquerda)"
                    aria-label="Voltar um passo"
                >
                    <SkipBack size={iconSize} />
                </button>

                <button
                    type="button"
                    onClick={isPlaying ? onPause : onPlay}
                    disabled={disabled || (!isPlaying && !canPlay)}
                    className={`${buttonClass} ${
                        isPlaying
                            ? 'bg-ios-red text-white shadow-lg shadow-red-500/20 active:scale-90'
                            : 'bg-ios-green text-white shadow-lg shadow-green-500/20 active:scale-90'
                    } px-4`}
                    title={isPlaying ? 'Pausar (Espaço)' : 'Iniciar (Espaço)'}
                    aria-label={isPlaying ? 'Pausar simulação' : 'Iniciar simulação'}
                >
                    {isPlaying ? <Pause size={iconSize} fill="currentColor" /> : <Play size={iconSize} fill="currentColor" />}
                </button>

                <button
                    type="button"
                    onClick={onStep}
                    disabled={disabled || !canStep}
                    className={`${buttonClass} hover:bg-surface-soft text-secondary hover:text-primary active:scale-95`}
                    title="Avançar um passo (Seta para a direita)"
                    aria-label="Avançar um passo"
                >
                    <SkipForward size={iconSize} />
                </button>

                {onRunAll && (
                    <button
                        type="button"
                        onClick={onRunAll}
                        disabled={disabled || !canStep}
                        className={`${buttonClass} hover:bg-surface-soft text-secondary hover:text-primary active:scale-95`}
                        title="Executar tudo"
                        aria-label="Executar todos os passos"
                    >
                        <Zap size={iconSize} />
                    </button>
                )}
            </div>

            {compact ? (
                <div className="flex items-center gap-1">
                    <label htmlFor={speedControlId} className="sr-only">Velocidade da simulação</label>
                    <select
                        id={speedControlId}
                        value={speed}
                        onChange={(e) => onSpeedChange(Number(e.target.value))}
                        className="h-8 rounded-lg border border-default bg-surface-2 px-1 text-[10px] font-black text-secondary uppercase"
                        title="Velocidade"
                        aria-label="Velocidade da simulação"
                    >
                        {speedOptions.map((option) => (
                            <option key={option} value={option}>{formatSpeed(option)}</option>
                        ))}
                    </select>
                </div>
            ) : (
                <div className="flex items-center gap-2 px-2 h-10 bg-surface-muted/30 rounded-xl border border-default/40 ml-1">
                    <span className="text-[10px] text-muted font-black uppercase tracking-tighter w-10 text-center">
                        {speed}ms
                    </span>
                    <label htmlFor={speedControlId} className="sr-only">Velocidade da simulação</label>
                    <input
                        id={speedControlId}
                        type="range"
                        min="100"
                        max="2000"
                        step="100"
                        value={speed}
                        onChange={(e) => onSpeedChange(Number(e.target.value))}
                        className="w-20 accent-ios-blue h-1.5"
                        title="Velocidade da simulação"
                        aria-label="Velocidade da simulação"
                    />
                </div>
            )}
        </div>
    );
};

export default SimulationControls;
