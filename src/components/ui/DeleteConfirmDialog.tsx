import React from 'react';
import { AlertCircle } from 'lucide-react';

interface DeleteConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemCount: number;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    itemCount,
}) => {
    if (!isOpen) return null;

    return (
        <div className="overlay-backdrop z-[120] animate-fade-in">
            <div className="overlay-surface p-6 max-w-sm w-full animate-scale-in bg-app">
                <div className="flex flex-col items-center text-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-status-danger-soft flex items-center justify-center text-status-danger">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-primary">
                            Limpar tudo?
                        </h3>
                        <p className="text-sm text-muted mt-1">
                            Isso apagará {itemCount} estados e não pode ser desfeito (apenas via Undo).
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold text-secondary bg-surface-muted hover:bg-surface-hover transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 rounded-xl font-bold text-white bg-ios-red hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                    >
                        Apagar
                    </button>
                </div>
            </div>
        </div>
    );
};

