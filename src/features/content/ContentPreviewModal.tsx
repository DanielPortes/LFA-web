import React from 'react';
import { Modal } from '../../components/ui';
import { AutomatonViewer } from '../../components/automaton';
import type { AutomatoData } from '../../types';

interface ContentPreviewModalProps {
    automaton: AutomatoData | null;
    onClose: () => void;
    onSimulate?: (data: AutomatoData) => void;
}

export const ContentPreviewModal: React.FC<ContentPreviewModalProps> = ({
    automaton,
    onClose,
    onSimulate
}) => (
    <Modal
        isOpen={!!automaton}
        onClose={onClose}
        title={automaton ? `Visualização ${automaton.tipo}` : 'Visualização do autômato'}
        className="h-[min(88dvh,920px)] w-[min(94vw,1280px)] max-w-none"
        bodyClassName="overflow-hidden p-0"
    >
        {automaton && (
            <AutomatonViewer
                data={automaton}
                onOpenSimulator={onSimulate}
                openSimulatorLabel="Abrir autômato no laboratório interativo"
            />
        )}
    </Modal>
);
