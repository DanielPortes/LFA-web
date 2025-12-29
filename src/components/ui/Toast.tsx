import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

const ToastIcon = ({ type }: { type: ToastType }) => {
    const icons = {
        success: <CheckCircle2 size={20} strokeWidth={3} className="text-ios-green" />,
        error: <XCircle size={20} className="text-ios-red" />,
        warning: <AlertTriangle size={20} className="text-ios-orange" />,
        info: <Info size={20} className="text-ios-blue" />
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
        success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        warning: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    };

    return (
        <div
            className={`
                flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-apple-lg
                transform transition-all duration-300 ease-out
                ${bgColors[toast.type]}
                ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
            `}
        >
            <ToastIcon type={toast.type} />
            <span className="text-sm font-medium text-primary flex-1">
                {toast.message}
            </span>
            <button
                onClick={() => { setIsExiting(true); setTimeout(onRemove, 300); }}
                className="p-1 rounded-full hover:bg-surface-muted transition-colors"
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
            <div className="fixed bottom-24 right-6 z-[100] flex flex-col gap-2 max-w-sm">
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
