import React from 'react';
import { Info, LayoutList } from 'lucide-react';

interface SimulationWarningsPanelProps {
    disableReason: string | null;
    hasInvalidInput: boolean;
    isPda: boolean;
}

export const SimulationWarningsPanel: React.FC<SimulationWarningsPanelProps> = ({
    disableReason,
    hasInvalidInput,
    isPda,
}) => {
    if (!disableReason && !isPda) return null;

    return (
        <div className="space-y-2">
            {disableReason && (
                <div className={`glass-panel px-5 py-4 rounded-[24px] text-[11px] font-bold flex items-start gap-3 shadow-apple-md border border-default leading-relaxed ${hasInvalidInput ? 'text-ios-red bg-ios-red/5' : 'text-ios-orange bg-ios-orange/5'}`}>
                    <Info size={18} className="shrink-0 mt-0.5 opacity-80" />
                    <p>{disableReason}</p>
                </div>
            )}
            {isPda && (
                <div className="glass-panel px-5 py-3 rounded-2xl text-[11px] font-medium text-secondary flex items-start gap-3 shadow-apple-sm border border-default bg-surface-1/50 backdrop-blur-md">
                    <LayoutList size={16} className="text-ios-purple shrink-0 mt-0.5" />
                    <p>AP: <code className="font-black bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-ios-purple">símbolo, topo -&gt; novos</code></p>
                </div>
            )}
        </div>
    );
};
