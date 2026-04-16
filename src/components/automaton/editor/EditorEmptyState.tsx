import React from 'react';
import { Plus } from 'lucide-react';

export const EditorEmptyState: React.FC = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
        <div className="w-full max-w-md glass-panel rounded-2xl border border-default p-5 text-center shadow-apple-md">
            <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-surface-muted border border-default flex items-center justify-center text-ios-blue">
                <Plus size={28} />
            </div>
            <p className="text-sm font-bold text-primary">Canvas pronto para construir</p>
            <p className="mt-1 text-xs text-secondary">Pressione `S` e clique no canvas para criar o primeiro estado.</p>
            <p className="mt-2 text-[11px] text-muted">Ou abra Templates para carregar um modelo inicial.</p>
        </div>
    </div>
);
