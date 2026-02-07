import React, { useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastContext, type ToastType } from './toast-context';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

const ToastIcon = ({ type }: { type: ToastType }) => {
    const icons = {
        success: <CheckCircle2 size={20} strokeWidth={3} className="text-status-success" />,
        error: <XCircle size={20} className="text-status-danger" />,
        warning: <AlertTriangle size={20} className="text-status-warning" />,
        info: <Info size={20} className="text-status-info" />
    };
    return icons[type];
};

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: () => void }) => {
    const [isExiting, setIsExiting] = React.useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(onRemove, 300);
        }, toast.duration || 3000);
        return () => clearTimeout(timer);
    }, [toast.duration, onRemove]);

    const bgColors = {
        success: 'bg-status-success-soft border-status-success',
        error: 'bg-status-danger-soft border-status-danger',
        warning: 'bg-status-warning-soft border-status-warning',
        info: 'bg-status-info-soft border-status-info'
    };

    return (
        <div
            className={`
                flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-apple-lg
                transform transition-all duration-300 ease-out
                ${bgColors[toast.type]}
                ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
            `}
            role="status"
            aria-live="polite"
            aria-atomic="true"
        >
            <ToastIcon type={toast.type} />
            <span className="text-sm font-medium text-primary flex-1">
                {toast.message}
            </span>
            <button
                type="button"
                onClick={() => { setIsExiting(true); setTimeout(onRemove, 300); }}
                className="p-1 rounded-full hover:bg-surface-muted transition-colors"
                aria-label="Fechar notificação"
            >
                <X size={14} className="text-muted" />
            </button>
        </div>
    );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-24 right-6 z-[100] flex flex-col gap-2 max-w-sm" aria-live="polite">
                {toasts.map(toast => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onRemove={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};
