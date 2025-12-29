import React, { useEffect, useState } from 'react';
import { X, Maximize2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { BaseProps, ModalBaseProps, WithChildren } from './types';

interface ZoomModalProps extends ModalBaseProps, WithChildren, BaseProps {
    title?: string;
}

export const ZoomModal: React.FC<ZoomModalProps> = ({ isOpen, onClose, title, children, className = '' }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className={`bg-surface-1 w-[95vw] h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-default animate-in zoom-in-95 duration-200 relative overflow-hidden ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-default bg-surface-muted">
                    <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                        <Maximize2 size={18} className="text-ios-blue" />
                        {title || 'Visualização Expandida'}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-surface-hover rounded-full transition-colors text-secondary hover:text-primary"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden relative bg-canvas p-4 flex flex-col">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};
