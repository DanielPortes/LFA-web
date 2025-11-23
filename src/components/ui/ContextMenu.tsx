import React, { useEffect, useRef } from 'react';

interface ContextMenuOption {
    label: string;
    icon?: React.ReactNode;
    action: () => void;
    danger?: boolean;
    separator?: boolean;
}

interface ContextMenuProps {
    x: number;
    y: number;
    options: ContextMenuOption[];
    onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, options, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

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

    // Adjust position if it goes off screen
    const style: React.CSSProperties = {
        top: y,
        left: x,
    };

    return (
        <div
            ref={menuRef}
            className="fixed z-50 min-w-[180px] glass-panel p-1.5 rounded-xl shadow-apple-lg animate-scale-in flex flex-col gap-0.5"
            style={style}
            onContextMenu={(e) => e.preventDefault()}
        >
            {options.map((opt, index) => (
                opt.separator ? (
                    <div key={index} className="h-px bg-gray-200 dark:bg-white/10 my-1 mx-2" />
                ) : (
                    <button
                        key={index}
                        onClick={() => {
                            opt.action();
                            onClose();
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors
                            ${opt.danger
                                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10'
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
