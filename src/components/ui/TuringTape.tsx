import React from 'react';
import { BLANK, END_MARKER, START_MARKER } from '../../utils/turingLogic';
import type { BaseProps } from './types';

interface TuringTapeProps extends BaseProps {
    tape: Record<number, string>;
    headPos: number;
    viewportSize?: number; // How many cells to show around head
    minIndex?: number;
    maxIndex?: number;
}

export const TuringTape: React.FC<TuringTapeProps> = ({
    tape,
    headPos,
    viewportSize = 5,
    minIndex,
    maxIndex,
    className = ''
}) => {
    const hasBounds = typeof minIndex === 'number' && typeof maxIndex === 'number';
    const rangeStart = hasBounds ? Math.max(minIndex as number, headPos - viewportSize) : headPos - viewportSize;
    const rangeEnd = hasBounds ? Math.min(maxIndex as number, headPos + viewportSize) : headPos + viewportSize;
    const range: number[] = [];
    for (let i = rangeStart; i <= rangeEnd; i++) {
        range.push(i);
    }
    const showLeftCap = hasBounds && rangeStart > (minIndex as number);
    const showRightCap = hasBounds && rangeEnd < (maxIndex as number);

    return (
        <div className={`relative h-20 w-full max-w-2xl mx-auto overflow-hidden select-none ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-overlay)] via-transparent to-[var(--bg-overlay)] z-10 pointer-events-none" />

            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-14 border-2 border-ios-purple rounded-lg shadow-[0_0_15px_rgba(175,82,222,0.4)] z-0 absolute" />
                <div className="absolute -top-3 text-ios-purple ui-kicker-xs bg-surface-2 px-2">Head</div>
            </div>

            <div className="flex items-center justify-center gap-1 h-full transition-transform duration-300 ease-in-out">
                {showLeftCap && (
                    <div className="w-12 h-12 flex-shrink-0 rounded-md border border-ios-blue/40 bg-surface-muted flex items-center justify-center text-lg font-mono font-bold opacity-80">
                        {START_MARKER}
                    </div>
                )}
                {range.map(index => {
                    const symbol = tape[index] || BLANK;
                    const isHead = index === headPos;
                    const isBound = hasBounds && (index === minIndex || index === maxIndex);

                    return (
                        <div
                            key={index}
                            className={`
                                w-12 h-12 flex-shrink-0 rounded-md border flex items-center justify-center text-lg font-mono font-bold
                                transition-all duration-200
                                ${isHead
                                    ? 'bg-surface-soft text-primary border-ios-purple/50 scale-100 z-10'
                                    : isBound
                                        ? 'bg-surface-soft text-primary border-ios-blue/40 opacity-80 scale-95'
                                        : 'bg-surface-muted text-secondary border-default opacity-70 scale-90'
                                }
                            `}
                        >
                            {symbol === BLANK ? <span className="text-muted opacity-20">{BLANK}</span> : symbol}
                            <span className="absolute bottom-0.5 right-1 text-[8px] text-muted opacity-50">{index}</span>
                        </div>
                    );
                })}
                {showRightCap && (
                    <div className="w-12 h-12 flex-shrink-0 rounded-md border border-ios-blue/40 bg-surface-muted flex items-center justify-center text-lg font-mono font-bold opacity-80">
                        {END_MARKER}
                    </div>
                )}
            </div>
        </div>
    );
};
