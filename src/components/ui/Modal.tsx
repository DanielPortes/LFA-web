import React, { useEffect, useId, useState } from 'react';
import { X } from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    className?: string;
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
            document.body.style.overflow = 'hidden';
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => setIsVisible(false), 300); // Match transition duration
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
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
                    bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl 
                    border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl
                    transform transition-all duration-300 ease-out
                    ${isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
                    ${className}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-white/5">
                    <h3 id={titleId} className="text-xl font-bold text-[var(--text-primary)]">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors"
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
