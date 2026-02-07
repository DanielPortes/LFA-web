import React from 'react';
import type { BaseProps } from './types';

interface StackVisualizerProps extends BaseProps {
    stack: string[];
    maxVisible?: number;
}

export const StackVisualizer: React.FC<StackVisualizerProps> = ({ stack, maxVisible = 8, className = '' }) => {
    const visibleItems = [...stack].reverse().slice(0, maxVisible);
    const hiddenCount = Math.max(0, stack.length - maxVisible);

    return (
        <div className={`glass-panel p-4 w-32 flex flex-col items-center shadow-apple-lg border border-default ${className}`}>
            <div className="ui-kicker-xs text-muted mb-2 w-full text-center border-b border-default pb-1">
                Pilha ({stack.length})
            </div>
            
            <div className="w-full flex flex-col gap-1 min-h-[160px] justify-end relative">
                 {visibleItems.map((symbol, i) => (
                    <div
                        key={`${stack.length - i}-${symbol}`}
                        className={`
                            w-full h-8 rounded-md flex items-center justify-center font-mono font-bold text-sm border transition-all duration-300 animate-scale-in
                            ${i === 0 
                                ? 'bg-ios-blue text-white border-blue-400 shadow-sm z-10' // Top of stack
                                : 'bg-surface-muted text-primary border-default'
                            }
                        `}
                    >
                        {symbol}
                    </div>
                ))}
                
                {hiddenCount > 0 && (
                     <div className="text-xs text-muted text-center py-1 mt-1 border-t border-default">
                        + {hiddenCount} itens
                    </div>
                )}
                
                {stack.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-muted italic">
                        Vazia
                    </div>
                )}
            </div>
            
            <div className="w-16 h-1 bg-border rounded-full mt-2 opacity-50" />
        </div>
    );
};
