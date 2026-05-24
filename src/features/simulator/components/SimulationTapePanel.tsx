import React from 'react';
import type { AutomatoData, SimulationStep } from '../../../types';
import { History } from 'lucide-react';
import { StackVisualizer, TuringTape, InputTape } from '../../../components/ui';

interface SimulationTapePanelProps {
    data: AutomatoData;
    inputTokens: string[];
    history: SimulationStep[];
    simulationState: SimulationStep | null;
    simulationStatus: string;
    isTuring: boolean;
    isAll: boolean;
    isMoore: boolean;
    isMealy: boolean;
    isPda: boolean;
    stepCount: number;
    totalSteps: number;
}

export const SimulationTapePanel: React.FC<SimulationTapePanelProps> = ({
    data,
    inputTokens,
    history,
    simulationState,
    simulationStatus,
    isTuring,
    isAll,
    isMoore,
    isMealy,
    isPda,
    stepCount,
    totalSteps,
}) => (
    <div className={`glass-panel p-5 rounded-3xl shadow-apple-md border border-default transition-all duration-500 bg-surface-1/90 ${
        (inputTokens.length > 0 || isTuring || isPda) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
    }`}>
        <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                    simulationStatus === 'accepted' ? 'bg-ios-green shadow-[0_0_8px_rgba(52,199,89,0.6)]' :
                    simulationStatus === 'rejected' ? 'bg-ios-red' : 'bg-ios-blue animate-pulse'
                }`} />
                <span className="ui-kicker-xs text-primary font-black tracking-widest">
                    {isAll ? 'Fita limitada' : isTuring ? 'Fita infinita' : isPda ? 'Pilha e entrada' : 'Visualização'}
                </span>
            </div>
            <div className="flex items-center gap-3">
                {history.length > 1 && (
                    <span className="text-[10px] font-black text-muted flex items-center gap-1 uppercase tracking-tighter bg-surface-muted px-2 py-0.5 rounded-md">
                        <History size={10} />
                        {history.length - 1} passos
                    </span>
                )}
                <span className="text-[10px] font-mono font-black text-ios-blue bg-ios-blue/10 px-2 py-0.5 rounded-md border border-ios-blue/20">
                    {isTuring ? `H:${simulationState?.headPos ?? 0}` : `${stepCount}/${totalSteps}`}
                </span>
            </div>
        </div>

        {isTuring ? (
            <TuringTape
                tape={simulationState?.tape ?? {}}
                headPos={simulationState?.headPos ?? 0}
                minIndex={isAll ? 0 : undefined}
                maxIndex={isAll ? inputTokens.length + 1 : undefined}
            />
        ) : inputTokens.length > 0 ? (
            <div className="flex justify-center overflow-x-auto custom-scrollbar pb-2">
                <InputTape
                    tokens={inputTokens}
                    processedCount={simulationState?.processedInput.length || 0}
                    showLabels={false}
                />
            </div>
        ) : (
            <div className="rounded-2xl border border-dashed border-default bg-surface-2/60 px-4 py-3 text-center text-xs font-semibold text-secondary">
                Entrada vazia: acompanhe a pilha inicial e transições ε.
            </div>
        )}

        {simulationState && simulationState.activeStates.length > 0 && (
            <div className="mt-4 pt-4 border-t border-default/50 flex flex-wrap items-center justify-center gap-3">
                <span className="text-[10px] font-black text-muted uppercase tracking-widest opacity-60">Ativos:</span>
                <div className="flex flex-wrap gap-1.5">
                    {simulationState.activeStates.map((stateId) => {
                        const state = data.estados.find((item) => item.id === stateId);
                        return (
                            <span
                                key={stateId}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-black shadow-sm border
                                    ${state?.isFinal
                                        ? 'bg-ios-green text-white border-green-600/20'
                                        : 'bg-ios-blue text-white border-blue-600/20'}`}
                            >
                                {state?.label || stateId}
                            </span>
                        );
                    })}
                </div>
            </div>
        )}

        {(isMoore || isMealy) && simulationState && (
            <div className="mt-3 flex items-center justify-center gap-3 pt-3 border-t border-default/30">
                <span className="text-[10px] font-black text-muted uppercase tracking-widest opacity-60">Saída:</span>
                {simulationState.outputStatus === 'ambiguous' ? (
                    <span className="text-[10px] font-black text-ios-orange bg-ios-orange/10 px-2 py-0.5 rounded-md">Ambígua</span>
                ) : (
                    <div className="flex flex-wrap gap-1">
                        {(simulationState.output ?? []).length === 0 && (
                            <span className="text-[10px] font-bold text-muted italic opacity-50">vazio</span>
                        )}
                        {(simulationState.output ?? []).map((output, index) => (
                            <span
                                key={`${output}-${index}`}
                                className="px-2 py-0.5 rounded-md text-[10px] font-black bg-ios-purple text-white shadow-sm"
                            >
                                {output}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        )}

        {isPda && simulationState?.activeConfigs && simulationState.activeConfigs.length > 0 && (
            <div className="mt-5 rounded-2xl border border-default/40 bg-surface-muted/30 p-4 shadow-inner">
                <div className="mb-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wide text-secondary">
                    <span>Topo da pilha</span>
                </div>
                <div className="flex justify-center">
                    <StackVisualizer stack={simulationState.activeConfigs[0].stack} />
                </div>
            </div>
        )}
    </div>
);
