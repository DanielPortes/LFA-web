import React from 'react';
import { Sparkles, X, XCircle } from 'lucide-react';

interface RegexImportCardProps {
    error: string | null;
    errorId: string;
    value: string;
    onChange: (value: string) => void;
    onImport: () => void;
    onClose?: () => void;
}

export const RegexImportCard: React.FC<RegexImportCardProps> = ({
    error,
    errorId,
    value,
    onChange,
    onImport,
    onClose
}) => (
    <div className="glass-panel h-full rounded-3xl border border-default bg-surface-1/80 p-4 shadow-apple-md">
        <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
                <div className="rounded-lg bg-ios-blue/10 p-1.5 text-ios-blue">
                    <Sparkles size={16} />
                </div>
                <span className="ui-kicker-xs font-bold text-primary">
                    Regex → AFN
                </span>
            </div>
            <div className="flex items-center gap-2">
                <span className="badge badge-info font-mono text-[9px]">ER</span>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-primary"
                        title="Ocultar importação por regex"
                        aria-label="Ocultar importação por regex"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>
        <div className="flex gap-2">
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="ex: (a+b)*abb"
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                className="min-w-0 flex-1 rounded-xl border border-default bg-surface-2 px-3 py-2 text-sm font-mono text-primary shadow-inner outline-none ring-ios-blue/40 focus:ring-2"
            />
            <button
                onClick={onImport}
                className="rounded-xl bg-ios-blue px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-600 active:scale-95"
            >
                Importar
            </button>
        </div>
        {error && (
            <div id={errorId} role="status" className="mt-2 flex items-center gap-1.5 px-1 text-[10px] font-bold text-ios-red">
                <XCircle size={12} /> {error}
            </div>
        )}
    </div>
);
