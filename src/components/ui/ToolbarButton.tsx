import React from 'react';
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
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={cn(
            'p-2.5 rounded-xl transition-all duration-200 relative group/tooltip flex items-center justify-center shrink-0',
            active && 'bg-ios-blue text-white shadow-md shadow-blue-500/20',
            !active && 'text-secondary hover:bg-surface-hover',
            danger && 'text-status-danger status-hover-danger',
            disabled && 'opacity-40 cursor-not-allowed',
            className
        )}
    >
        <Icon size={20} strokeWidth={2.5} />
        {badge !== undefined && (
            <span className="absolute -top-1 -right-1 bg-ios-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm min-w-[16px] flex items-center justify-center">
                {badge}
            </span>
        )}
        {/* Tooltip */}
        <div
            className={cn(
                'absolute top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 shadow-xl border border-white/10 invisible group-hover/tooltip:visible',
                side === 'right' ? 'left-full ml-3' : 'right-full mr-3'
            )}
        >
            <div className="font-bold leading-none">{label}</div>
            {(shortcut || hint) && (
                <div className="text-xs text-gray-300 flex items-center gap-1 mt-1">
                    {shortcut && (
                        <span className="bg-white/20 px-1.5 py-0.5 rounded font-mono">
                            {shortcut}
                        </span>
                    )}
                    {hint && <span>{hint}</span>}
                </div>
            )}
        </div>
    </button>
);
