import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

export interface ToolbarButtonProps {
    icon: React.ElementType;
    label: string;
    shortcut?: string;
    hint?: string;
    active?: boolean;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
    danger?: boolean;
    side?: 'left' | 'right';
    badge?: number | string;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
    icon: Icon,
    label,
    shortcut,
    hint,
    active,
    onClick,
    disabled,
    className = '',
    danger,
    side = 'right',
    badge,
}) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState<React.CSSProperties | null>(null);

    const updateTooltipPosition = useCallback(() => {
        if (!buttonRef.current || typeof window === 'undefined') return;

        const rect = buttonRef.current.getBoundingClientRect();
        const offset = 12;
        setTooltipPosition({
            top: rect.top + rect.height / 2,
            ...(side === 'right'
                ? { left: rect.right + offset }
                : { right: window.innerWidth - rect.left + offset }),
        });
    }, [side]);

    const showTooltip = () => {
        if (disabled) return;
        updateTooltipPosition();
        setTooltipOpen(true);
    };

    const hideTooltip = () => setTooltipOpen(false);

    useLayoutEffect(() => {
        if (!tooltipOpen) return undefined;

        updateTooltipPosition();
        window.addEventListener('resize', updateTooltipPosition);
        window.addEventListener('scroll', updateTooltipPosition, true);

        return () => {
            window.removeEventListener('resize', updateTooltipPosition);
            window.removeEventListener('scroll', updateTooltipPosition, true);
        };
    }, [tooltipOpen, updateTooltipPosition]);

    const tooltip = tooltipOpen && tooltipPosition && typeof document !== 'undefined'
        ? createPortal(
            <div
                className={cn(
                    'pointer-events-none fixed z-[9999] -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-gray-900 px-3 py-2 text-xs font-medium text-white opacity-100 shadow-xl',
                    side === 'right' ? 'animate-fade-in' : 'animate-fade-in'
                )}
                style={tooltipPosition}
            >
                <div className="font-bold leading-none">{label}</div>
                {(shortcut || hint) && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-300">
                        {shortcut && (
                            <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono">
                                {shortcut}
                            </span>
                        )}
                        {hint && <span>{hint}</span>}
                    </div>
                )}
            </div>,
            document.body
        )
        : null;

    return (
        <>
            <button
                ref={buttonRef}
                onClick={onClick}
                disabled={disabled}
                aria-label={label}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                onFocus={showTooltip}
                onBlur={hideTooltip}
                className={cn(
                    'relative flex shrink-0 items-center justify-center rounded-xl p-2.5 transition-all duration-200',
                    active && 'bg-ios-blue text-white shadow-md shadow-blue-500/20',
                    !active && 'text-secondary hover:bg-surface-hover',
                    danger && 'text-status-danger status-hover-danger',
                    disabled && 'cursor-not-allowed opacity-40',
                    className
                )}
            >
                <Icon size={20} strokeWidth={2.5} />
                {badge !== undefined && (
                    <span className="absolute -right-1 -top-1 flex min-w-[16px] items-center justify-center rounded-full bg-ios-red px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        {badge}
                    </span>
                )}
            </button>
            {tooltip}
        </>
    );
};
