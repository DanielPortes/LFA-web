import React, { Suspense, lazy } from 'react';
import { Modal } from '../../components/ui';
import type { AutomatoData } from '../../types';

const AutomatonEditor = lazy(async () => {
    const module = await import('../../components/automaton/AutomatonEditor');
    return { default: module.AutomatonEditor };
});

interface ContentPreviewModalProps {
    automaton: AutomatoData | null;
    onClose: () => void;
}

export const ContentPreviewModal: React.FC<ContentPreviewModalProps> = ({
    automaton,
    onClose
}) => (
    <Modal
        isOpen={!!automaton}
        onClose={onClose}
        title={automaton?.tipo || 'Visualização do Autômato'}
        className="h-[80vh]"
    >
        {automaton && (
            <div className="h-full w-full bg-canvas rounded-xl border border-default overflow-hidden relative shadow-inner">
                <Suspense fallback={<div className="flex h-full items-center justify-center text-sm font-medium text-secondary">Carregando visualização do autômato...</div>}>
                    <AutomatonEditor
                        data={automaton}
                        onChange={() => { }}
                        readOnly={true}
                    />
                </Suspense>
            </div>
        )}
    </Modal>
);
