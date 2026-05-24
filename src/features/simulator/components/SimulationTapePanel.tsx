import React from 'react';
import type { AutomatoData, SimulationStep } from '../../../types';
import { History } from 'lucide-react';
import { TuringTape, InputTape } from '../../../components/ui';

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
    pdaMode?: 'combined' | 'input' | 'stack';
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
    pdaMode = 'combined',
}) => {
    if (isPda) {
        const hasStarted = simulationStatus !== 'idle' && Boolean(simulationState);
        if (!hasStarted) return null;

        const stack = simulationState?.activeConfigs?.[0]?.stack ?? [];
        const visibleStack = [...stack].reverse().slice(0, 6);
        const hiddenStackCount = Math.max(0, stack.length - visibleStack.length);
        const shouldShowInput = inputTokens.length > 0;

        const inputRail = shouldShowInput ? (
            <div
                data-testid="pda-input-rail"
                className="pointer-events-auto mx-auto flex max-w-[34rem] items-center justify-center overflow-x-auto rounded-2xl border border-default/25 bg-surface-1/25 px-3 py-2 custom-scrollbar"
            >
                <InputTape
                    tokens={inputTokens}
                    processedCount={simulationState?.processedInput.length || 0}
                    showLabels={false}
                    compact
                />
            </div>
        ) : null;

        const stackWidget = (
            <aside
                data-testid="pda-stack-widget"
                className="pointer-events-auto flex w-16 shrink-0 flex-col items-stretch bg-transparent p-1"
                aria-label="Pilha do autômato"
            >
                <div className="mb-1 text-center text-[8px] font-black uppercase tracking-widest text-muted">
                    Topo
                </div>
                <div className="flex min-h-[3rem] flex-col justify-end gap-1">
                    {visibleStack.map((symbol, index) => (
                        <div
                            key={`${stack.length - index}-${symbol}`}
                            className={`flex h-5 items-center justify-center rounded-md font-mono text-[11px] font-black transition-colors ${
                                index === 0
                                    ? 'bg-ios-blue text-white shadow-[0_4px_14px_rgba(0,122,255,0.24)]'
                                    : 'bg-surface-muted/35 text-primary'
                            }`}
                        >
                            {symbol}
                        </div>
                    ))}
                    {hiddenStackCount > 0 && (
                        <div className="text-center text-[9px] font-bold text-muted">
                            +{hiddenStackCount}
                        </div>
                    )}
                    {stack.length === 0 && (
                        <div className="flex min-h-[3rem] items-center justify-center text-[10px] font-semibold italic text-muted">
                            Vazia
                        </div>
                    )}
                </div>
            </aside>
        );

        if (pdaMode === 'input') return inputRail;
        if (pdaMode === 'stack') return stackWidget;

        return (
            <div className="pointer-events-none flex w-full items-end justify-center gap-3">
                <div className="min-w-0 flex-1">
                    {inputRail}
                </div>

                {simulationState?.activeStates && simulationState.activeStates.length > 0 && (
                    <div className="pointer-events-auto flex items-center justify-center gap-1.5">
                        {simulationState.activeStates.map((stateId) => {
                            const state = data.estados.find((item) => item.id === stateId);
                            return (
                                <span
                                    key={stateId}
                                    className={`rounded-lg border px-2 py-0.5 text-[10px] font-black ${
                                        state?.isFinal
                                            ? 'border-green-600/20 bg-ios-green text-white'
                                            : 'border-blue-600/20 bg-ios-blue text-white'
                                    }`}
                                >
                                    {state?.label || stateId}
                                </span>
                            );
                        })}
                    </div>
                )}

                {stackWidget}
            </div>
        );
    }

    return (
    <div className="rounded-[22px] border border-default/45 bg-surface-1/45 p-4 opacity-100 shadow-none backdrop-blur-sm transition-all duration-500 translate-y-0">
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

    </div>
    );
};
