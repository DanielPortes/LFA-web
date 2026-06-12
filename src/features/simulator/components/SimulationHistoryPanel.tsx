import React from 'react';
import type { SimulationStep } from '../../../types';
import { History } from 'lucide-react';

interface SimulationHistoryPanelProps {
    showDetails: boolean;
    history: SimulationStep[];
    currentStepIndex?: number;
    alphabet: string[];
    formatStateList: (ids: string[] | undefined) => string;
    onSelectStep?: (index: number) => void;
}

const STATUS_LABELS: Record<SimulationStep['status'], string> = {
    running: 'Rodando',
    accepted: 'Aceito',
    rejected: 'Rejeitado',
};

export const SimulationHistoryPanel: React.FC<SimulationHistoryPanelProps> = ({
    showDetails,
    history,
    currentStepIndex: currentStepIndexProp,
    alphabet,
    formatStateList,
    onSelectStep,
}) => {
    if (!showDetails) return null;
    const currentStepIndex = currentStepIndexProp !== undefined && history.length > 0
        ? Math.min(Math.max(currentStepIndexProp, 0), history.length - 1)
        : Math.max(0, history.length - 1);

    return (
        <div className="space-y-3 animate-scale-in origin-bottom-right">
            <div className="flex items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-ios-blue/10 p-2 text-ios-blue">
                        <History size={16} />
                    </div>
                    <div>
                        <div className="ui-kicker-xs text-secondary">Histórico</div>
                        <div className="text-sm font-black text-primary">{history.length} passos</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-muted uppercase">Alfabeto</span>
                    <span className="text-[11px] font-mono font-black text-ios-blue bg-ios-blue/10 px-2 py-0.5 rounded-md border border-ios-blue/20">
                        {alphabet.length > 0 ? alphabet.join('') : '∅'}
                    </span>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-default/45 bg-surface-1/35">
                <div className="grid grid-cols-[4.75rem_4.5rem_minmax(0,1fr)_5rem] gap-2 border-b border-default/40 bg-surface-muted/25 px-3 py-2 text-[9px] font-black uppercase tracking-wide text-muted">
                    <span>Passo</span>
                    <span>Lido</span>
                    <span>Configuração</span>
                    <span className="text-right">Status</span>
                </div>

                <div className="max-h-72 overflow-y-auto custom-scrollbar">
                {history.length === 0 ? (
                    <div className="motion-empty-state flex flex-col items-center justify-center p-8 text-center text-secondary">
                        <History size={32} className="mb-2" />
                        <p className="text-[11px] font-bold uppercase tracking-wider">Aguardando execução</p>
                    </div>
                ) : history.map((stepItem, index) => {
                    const symbolLabel = stepItem.symbol ?? (index === 0 ? 'Início' : 'ε');
                    const statusLabel = STATUS_LABELS[stepItem.status];
                    const isCurrent = index === currentStepIndex;
                    const configLabel = stepItem.activeConfigs && stepItem.activeConfigs.length > 0
                        ? stepItem.activeConfigs
                            .map((config) => `${config.stateId} [${config.stack.join('') || 'vazio'}]`)
                            .join(', ')
                        : formatStateList(stepItem.activeStates);
                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={() => onSelectStep?.(index)}
                            disabled={!onSelectStep}
                            aria-current={isCurrent ? 'step' : undefined}
                            aria-label={`Voltar para o passo ${index}`}
                            className={`grid w-full grid-cols-[4.75rem_4.5rem_minmax(0,1fr)_5rem] items-center gap-2 border-b border-default/25 px-3 py-2.5 text-left text-[11px] transition-colors last:border-b-0 ${
                                isCurrent
                                    ? 'bg-ios-blue/10 text-primary'
                                    : 'text-secondary hover:bg-surface-hover hover:text-primary'
                            } disabled:cursor-default`}
                            style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                        >
                            <span className="flex items-center gap-2 font-black uppercase tracking-wide text-ios-blue">
                                <span className={`h-1.5 w-1.5 rounded-full ${isCurrent ? 'bg-ios-blue' : 'bg-current opacity-60'}`} />
                                Passo {index}
                            </span>
                            <code className="truncate font-mono text-[11px] font-black text-primary">{symbolLabel}</code>
                            <span className="truncate font-semibold">{configLabel}</span>
                            <span className={`justify-self-end rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${
                                stepItem.status === 'accepted' ? 'border-green-600/20 bg-ios-green text-white' :
                                stepItem.status === 'rejected' ? 'border-red-600/20 bg-ios-red text-white' : 'border-default bg-surface-strong text-secondary'
                            }`}>
                                {statusLabel}
                            </span>
                        </button>
                    );
                })}
                </div>
            </div>
        </div>
    );
};
