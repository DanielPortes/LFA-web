import React from 'react';
import { Info } from 'lucide-react';

interface SimulationWarningsPanelProps {
    disableReason: string | null;
    hasInvalidInput: boolean;
}

export const SimulationWarningsPanel: React.FC<SimulationWarningsPanelProps> = ({
    disableReason,
    hasInvalidInput,
}) => {
    if (!disableReason) return null;

    return (
        <div className="space-y-2">
            <div className={`glass-panel px-5 py-4 rounded-[24px] text-[11px] font-bold flex items-start gap-3 shadow-apple-md border border-default leading-relaxed ${hasInvalidInput ? 'text-ios-red bg-ios-red/5' : 'text-ios-orange bg-ios-orange/5'}`}>
                <Info size={18} className="shrink-0 mt-0.5 opacity-80" />
                <p>{disableReason}</p>
            </div>
        </div>
    );
};
