import React, { useEffect, useId, useState } from 'react';
import { Maximize2, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useDialog } from '../../hooks/useDialog';
import type { BaseProps, ModalBaseProps, WithChildren } from './types';

interface ZoomModalProps extends ModalBaseProps, WithChildren, BaseProps {
    title?: string;
}

export const ZoomModal: React.FC<ZoomModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    className = '',
}) => {
    const [mounted, setMounted] = useState(false);
    const titleId = useId();
    const dialogRef = useDialog(isOpen, onClose);

    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="overlay-backdrop z-[110] animate-in fade-in duration-200" onClick={onClose}>
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className={`overlay-surface relative flex h-[90vh] w-[95vw] flex-col rounded-2xl animate-in zoom-in-95 duration-200 ${className}`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-default bg-surface-muted px-6 py-4">
                    <h3 id={titleId} className="flex items-center gap-2 text-lg font-bold text-primary">
                        <Maximize2 size={18} className="text-ios-blue" />
                        {title || 'Visualização expandida'}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-secondary transition-colors hover:bg-surface-hover hover:text-primary"
                        aria-label="Fechar visualização expandida"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="relative flex flex-1 flex-col overflow-hidden bg-canvas p-4">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};
