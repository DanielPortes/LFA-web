import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import type { BaseProps } from './types';

interface ContextMenuOption {
    label: string;
    icon?: React.ReactNode;
    action: () => void;
    danger?: boolean;
    separator?: boolean;
}

interface ContextMenuProps extends BaseProps {
    x: number;
    y: number;
    options: ContextMenuOption[];
    onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, options, onClose, className = '', style }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [adjustedPos, setAdjustedPos] = useState({ x, y });

    // Adjust position to keep menu within viewport
    useLayoutEffect(() => {
        if (!menuRef.current) {
            setAdjustedPos({ x, y });
            return;
        }

        const rect = menuRef.current.getBoundingClientRect();
        const padding = 8;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let newX = x;
        let newY = y;

        // Adjust horizontal position
        if (x + rect.width + padding > viewportWidth) {
            newX = Math.max(padding, viewportWidth - rect.width - padding);
        }
        if (x < padding) {
            newX = padding;
        }

        // Adjust vertical position
        if (y + rect.height + padding > viewportHeight) {
            newY = Math.max(padding, viewportHeight - rect.height - padding);
        }
        if (y < padding) {
            newY = padding;
        }

        setAdjustedPos({ x: newX, y: newY });
    }, [x, y]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        // Close on scroll as well
        const handleScroll = () => onClose();

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [onClose]);

    const positionStyle: React.CSSProperties = {
        top: adjustedPos.y,
        left: adjustedPos.x,
    };

    return (
        <div
            ref={menuRef}
            className={`fixed z-50 min-w-[180px] glass-panel p-1.5 rounded-xl shadow-apple-lg animate-scale-in flex flex-col gap-0.5 ${className}`}
            style={{ ...positionStyle, ...style }}
            onContextMenu={(e) => e.preventDefault()}
        >
            {options.map((opt, index) => (
                opt.separator ? (
                    <div key={index} className="h-px bg-border my-1 mx-2" />
                ) : (
                    <button
                        key={index}
                        onClick={() => {
                            opt.action();
                            onClose();
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors
                            ${opt.danger
                                ? 'text-status-danger status-hover-danger'
                                : 'text-primary hover:bg-surface-muted'
                            }`}
                    >
                        {opt.icon && <span className="w-4 h-4">{opt.icon}</span>}
                        {opt.label}
                    </button>
                )
            ))}
        </div>
    );
};
