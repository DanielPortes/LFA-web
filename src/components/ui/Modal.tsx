import React, { useEffect, useId, useState } from 'react';
import { X } from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';
import type { BaseProps, ModalBaseProps, WithChildren } from './types';

// Global modal counter to handle stacked modals correctly
let openModalCount = 0;

const lockScroll = () => {
    openModalCount++;
    if (openModalCount === 1) {
        document.body.style.overflow = 'hidden';
    }
};

const unlockScroll = () => {
    openModalCount = Math.max(0, openModalCount - 1);
    if (openModalCount === 0) {
        document.body.style.overflow = 'unset';
    }
};

interface ModalProps extends ModalBaseProps, WithChildren, BaseProps {
    title?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, className = '' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const titleId = useId();
    const dialogRef = useDialog(isOpen, onClose);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            // Small delay to allow render before animation starts
            requestAnimationFrame(() => setIsAnimating(true));
            lockScroll();
            return () => unlockScroll();
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => setIsVisible(false), 300); // Match transition duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${isAnimating ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                tabIndex={-1}
                className={`
                    relative w-full max-w-5xl max-h-[90vh] flex flex-col
                    glass-card shadow-apple-xl
                    transform transition-all duration-300 ease-out
                    ${isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
                    ${className}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-default">
                    <h3 id={titleId} className="text-xl font-bold text-primary">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-surface-muted text-secondary transition-colors"
                        aria-label="Fechar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};
