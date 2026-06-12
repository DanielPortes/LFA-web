/**
 * Input tape visualization component
 * Shows input tokens with processed/remaining highlighting
 *
 * @module components/ui/InputTape
 */

import React from 'react';

interface InputTapeProps {
    tokens: string[];
    processedCount: number;
    showLabels?: boolean;
    compact?: boolean;
}

export const InputTape: React.FC<InputTapeProps> = ({
    tokens,
    processedCount,
    showLabels = true,
    compact = false
}) => {
    if (tokens.length === 0) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted italic">
                {showLabels && <span className="font-medium">Entrada:</span>}
                <span>vazia (epsilon)</span>
            </div>
        );
    }

    const cellClass = compact
        ? 'px-2 py-0.5 text-xs font-mono font-bold rounded border'
        : 'px-3 py-1.5 text-sm font-mono font-bold rounded-lg border-2';

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {showLabels && (
                <span className="text-sm font-medium text-muted mr-1">Entrada:</span>
            )}
            {tokens.map((token, index) => {
                const isProcessed = index < processedCount;
                const isCurrent = index === processedCount;

                return (
                    <span
                        key={index}
                        className={`${cellClass} transition-all duration-200 ${
                            isProcessed
                                ? 'bg-status-success-soft border-status-success text-status-success'
                                : isCurrent
                                    ? 'motion-cell-focus bg-status-info-soft border-status-info text-status-info ring-2 ring-ios-blue/30'
                                    : 'bg-surface-muted border-default text-secondary'
                        }`}
                    >
                        {token}
                    </span>
                );
            })}
        </div>
    );
};

export default InputTape;
