import React from 'react';
import type { SimulationStep } from '../../../types';
import { History } from 'lucide-react';

interface SimulationHistoryPanelProps {
    showDetails: boolean;
    history: SimulationStep[];
    alphabet: string[];
    formatStateList: (ids: string[] | undefined) => string;
}

const STATUS_LABELS: Record<SimulationStep['status'], string> = {
    running: 'Rodando',
    accepted: 'Aceito',
    rejected: 'Rejeitado',
};

export const SimulationHistoryPanel: React.FC<SimulationHistoryPanelProps> = ({
    showDetails,
    history,
    alphabet,
    formatStateList,
}) => {
    if (!showDetails) return null;

    return (
        <div className="glass-panel p-6 rounded-[32px] shadow-apple-xl border border-default animate-scale-in origin-bottom-right bg-surface-1/95 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-5 border-b border-default pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-ios-blue/10 text-ios-blue">
                        <History size={20} />
                    </div>
                    <span className="ui-kicker text-primary font-black tracking-widest">Histórico</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-muted uppercase">Alfabeto</span>
                    <span className="text-[11px] font-mono font-black text-ios-blue bg-ios-blue/10 px-2 py-0.5 rounded-md border border-ios-blue/20">
                        {alphabet.length > 0 ? alphabet.join('') : '∅'}
                    </span>
                </div>
            </div>
            <div className="max-h-72 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center opacity-40">
                        <History size={32} className="mb-2" />
                        <p className="text-[11px] font-bold uppercase tracking-wider">Aguardando execução</p>
                    </div>
                ) : history.map((stepItem, index) => {
                    const symbolLabel = stepItem.symbol ?? (index === 0 ? 'Início' : 'ε');
                    const statusLabel = STATUS_LABELS[stepItem.status];
                    return (
                        <div key={index} className="rounded-2xl border border-default/60 p-4 text-[11px] bg-surface-muted/20 transition-all hover:bg-surface-muted/40 hover:translate-x-1">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-black text-ios-blue uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-ios-blue" />
                                    Passo {index}
                                </span>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border shadow-sm ${
                                    stepItem.status === 'accepted' ? 'bg-ios-green text-white border-green-600/20' :
                                    stepItem.status === 'rejected' ? 'bg-ios-red text-white border-red-600/20' : 'bg-surface-strong text-secondary border-default'
                                }`}>
                                    {statusLabel}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 bg-black/5 dark:bg-white/5 p-2 rounded-xl border border-default/30">
                                    <span className="text-[9px] font-black text-muted uppercase block tracking-tighter">Símbolo lido</span>
                                    <code className="font-black text-primary text-xs">{symbolLabel}</code>
                                </div>
                                <div className="space-y-1.5 bg-black/5 dark:bg-white/5 p-2 rounded-xl border border-default/30">
                                    <span className="text-[9px] font-black text-muted uppercase block tracking-tighter">Configuração</span>
                                    <span className="text-secondary font-black truncate block">{formatStateList(stepItem.activeStates)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
