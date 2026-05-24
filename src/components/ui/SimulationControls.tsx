/**
 * Simulation control buttons and speed presets
 *
 * @module components/ui/SimulationControls
 */

import React from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Zap, Rabbit, Gauge, Turtle } from 'lucide-react';

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

const speedPresets = [
    { label: 'Rápido', value: 500, Icon: Rabbit },
    { label: 'Normal', value: 1000, Icon: Gauge },
    { label: 'Lento', value: 1800, Icon: Turtle },
] as const;

const getClosestSpeedPreset = (speed: number) => speedPresets.reduce((closest, preset) => (
    Math.abs(preset.value - speed) < Math.abs(closest.value - speed) ? preset : closest
), speedPresets[0]);

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
    const buttonClass = compact
        ? 'p-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue/35'
        : 'p-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue/35';

    const iconSize = compact ? 16 : 17;
    const selectedSpeed = getClosestSpeedPreset(speed).value;

    return (
        <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 rounded-xl border border-default/50 bg-surface-muted/50 p-1">
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
                    } px-3.5`}
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

            <div
                className={`ml-1 flex items-center gap-0.5 rounded-xl border border-default/40 bg-surface-muted/30 p-1 ${
                    compact ? 'max-w-[12rem] overflow-x-auto custom-scrollbar' : ''
                }`}
                role="group"
                aria-label="Velocidade da simulação"
            >
                {speedPresets.map((preset) => {
                    const isSelected = selectedSpeed === preset.value;

                    return (
                        <button
                            key={preset.value}
                            type="button"
                            onClick={() => onSpeedChange(preset.value)}
                            disabled={disabled}
                            className={`flex h-7 w-8 items-center justify-center rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue/35 ${
                                isSelected
                                    ? 'bg-ios-blue text-white shadow-md shadow-ios-blue/20'
                                    : 'text-secondary hover:bg-surface-hover hover:text-primary'
                            } disabled:cursor-not-allowed disabled:opacity-50`}
                            title={preset.label}
                            aria-label={preset.label}
                            aria-pressed={isSelected}
                        >
                            <preset.Icon size={15} aria-hidden="true" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default SimulationControls;
