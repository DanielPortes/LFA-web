/**
 * Simulation status display component
 *
 * @module components/ui/SimulationStatus
 */

import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { SimulationStep } from '../../types';

interface SimulationStatusProps {
    status: SimulationStep['status'] | null;
    message?: string;
    compact?: boolean;
}

export const SimulationStatus: React.FC<SimulationStatusProps> = ({
    status,
    message,
    compact = false
}) => {
    if (!status) return null;

    const getStatusConfig = () => {
        switch (status) {
            case 'accepted':
                return {
                    icon: CheckCircle2,
                    color: 'text-status-success',
                    bg: 'bg-status-success-soft',
                    border: 'border-status-success',
                    label: 'Aceita'
                };
            case 'rejected':
                return {
                    icon: XCircle,
                    color: 'text-status-danger',
                    bg: 'bg-status-danger-soft',
                    border: 'border-status-danger',
                    label: 'Rejeitada'
                };
            case 'running':
                return {
                    icon: AlertTriangle,
                    color: 'text-status-warning',
                    bg: 'bg-status-warning-soft',
                    border: 'border-status-warning',
                    label: 'Executando'
                };
            default:
                return null;
        }
    };

    const config = getStatusConfig();
    if (!config) return null;

    const Icon = config.icon;

    if (compact) {
        return (
            <div className={`flex items-center gap-1.5 ${config.color}`}>
                <Icon size={16} />
                <span className="text-sm font-semibold">{config.label}</span>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${config.bg} ${config.border}`}>
            <Icon size={20} className={config.color} />
            <div className="flex flex-col">
                <span className={`text-sm font-bold ${config.color}`}>{config.label}</span>
                {message && (
                    <span className="text-xs text-muted">{message}</span>
                )}
            </div>
        </div>
    );
};

export default SimulationStatus;
