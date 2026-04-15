import React from 'react';

interface SimulatorStatusBarProps {
    automatonType: string;
    stateCount: number;
    transitionCount: number;
    simulationStatus: 'idle' | 'running' | 'accepted' | 'rejected';
    hasSimulationProgress: boolean;
}

export const SimulatorStatusBar: React.FC<SimulatorStatusBarProps> = ({
    automatonType,
    stateCount,
    transitionCount,
    simulationStatus,
    hasSimulationProgress
}) => (
    <div className="glass-panel flex items-center gap-2 rounded-2xl border border-default px-3 py-2 text-muted shadow-apple-md">
        <span className="badge badge-info">{automatonType}</span>
        <div className="mx-1 h-3 w-px bg-border" />
        <span className="text-[11px] font-bold text-secondary">{stateCount} estados</span>
        <span className="text-[11px] font-bold text-secondary">{transitionCount} trans.</span>
        <div className="mx-1 h-3 w-px bg-border" />
        <span className={`badge ${
            simulationStatus === 'accepted'
                ? 'badge-success'
                : simulationStatus === 'rejected'
                    ? 'badge-danger'
                    : 'badge-accent'
        }`}>
            {simulationStatus === 'accepted'
                ? 'Aceito'
                : simulationStatus === 'rejected'
                    ? 'Rejeitado'
                    : hasSimulationProgress
                        ? 'Rodando'
                        : 'Pronto'}
        </span>
    </div>
);
