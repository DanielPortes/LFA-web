/**
 * Simulation control buttons and speed slider
 *
 * @module components/ui/SimulationControls
 */

import React from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Zap } from 'lucide-react';

interface SimulationControlsProps {
    isPlaying: boolean;
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

export const SimulationControls: React.FC<SimulationControlsProps> = ({
    isPlaying,
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
    const buttonClass = compact
        ? 'p-2 rounded-lg transition-all disabled:opacity-50'
        : 'p-3 rounded-xl transition-all disabled:opacity-50';

    const iconSize = compact ? 18 : 20;

    return (
        <div className="flex items-center gap-2">
            {/* Playback Controls */}
            <div className="flex items-center gap-1 bg-surface-muted rounded-xl p-1">
                <button
                    onClick={onReset}
                    disabled={disabled}
                    className={`${buttonClass} hover:bg-surface-soft text-secondary hover:text-primary`}
                    title="Reiniciar (R)"
                >
                    <RotateCcw size={iconSize} />
                </button>

                <button
                    onClick={onStepBack}
                    disabled={disabled || !canStepBack}
                    className={`${buttonClass} hover:bg-surface-soft text-secondary hover:text-primary`}
                    title="Voltar (←)"
                >
                    <SkipBack size={iconSize} />
                </button>

                <button
                    onClick={isPlaying ? onPause : onPlay}
                    disabled={disabled || !canStep}
                    className={`${buttonClass} ${
                        isPlaying
                            ? 'bg-ios-red text-white hover:bg-red-600'
                            : 'bg-ios-green text-white hover:bg-green-600'
                    }`}
                    title={isPlaying ? 'Pausar (P)' : 'Iniciar (P)'}
                >
                    {isPlaying ? <Pause size={iconSize} /> : <Play size={iconSize} />}
                </button>

                <button
                    onClick={onStep}
                    disabled={disabled || !canStep}
                    className={`${buttonClass} hover:bg-surface-soft text-secondary hover:text-primary`}
                    title="Proximo passo (→)"
                >
                    <SkipForward size={iconSize} />
                </button>

                {onRunAll && (
                    <button
                        onClick={onRunAll}
                        disabled={disabled || !canStep}
                        className={`${buttonClass} hover:bg-surface-soft text-secondary hover:text-primary`}
                        title="Executar tudo (Shift+Enter)"
                    >
                        <Zap size={iconSize} />
                    </button>
                )}
            </div>

            {/* Speed Control */}
            {!compact && (
                <div className="flex items-center gap-2 px-3">
                    <span className="text-xs text-muted font-medium min-w-[60px]">
                        {speed}ms
                    </span>
                    <input
                        type="range"
                        min="100"
                        max="2000"
                        step="100"
                        value={speed}
                        onChange={(e) => onSpeedChange(Number(e.target.value))}
                        className="w-24 accent-ios-blue"
                        title="Velocidade da simulacao"
                    />
                </div>
            )}
        </div>
    );
};

export default SimulationControls;
