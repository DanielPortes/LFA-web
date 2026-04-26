import React, { useEffect, useId, useState } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { Modal } from '../../components/ui';
import { AutomatonSimulationWorkspace } from '../simulator';
import type { AutomatoData } from '../../types';
import { cloneAutomaton } from '../../utils/cloneAutomaton';

interface ContentSimulatorModalProps {
    automaton: AutomatoData | null;
    onClose: () => void;
    onOpenFullSimulator?: (data: AutomatoData) => void;
}

export const ContentSimulatorModal: React.FC<ContentSimulatorModalProps> = ({
    automaton,
    onClose,
    onOpenFullSimulator
}) => {
    const titleId = useId();
    const descriptionId = useId();
    const [draftAutomaton, setDraftAutomaton] = useState<AutomatoData | null>(null);

    useEffect(() => {
        if (!automaton) {
            setDraftAutomaton(null);
            return;
        }

        setDraftAutomaton(cloneAutomaton(automaton));
    }, [automaton]);

    const stageMetrics = draftAutomaton
        ? `${draftAutomaton.estados.length} estados • ${draftAutomaton.transicoes.length} transições`
        : null;

    return (
        <Modal
            isOpen={!!draftAutomaton}
            onClose={onClose}
            labelledById={titleId}
            describedById={descriptionId}
            hideHeader={true}
            bodyClassName="overflow-hidden p-0"
            overlayClassName="p-2 sm:p-4 lg:p-6"
            className="h-[min(92dvh,1024px)] min-h-[88dvh] w-[min(96vw,1440px)] max-w-none overflow-hidden rounded-[32px]"
        >
            {draftAutomaton && (
                <div className="flex h-full min-h-0 flex-col bg-app/30 p-3 sm:p-4 lg:p-5">
                    <div className="flex items-start justify-between gap-4 px-1 pb-3 sm:pb-4">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="badge border-status-info bg-status-info-soft text-status-info">
                                    Laboratório rápido
                                </span>
                                <span className="badge border-default bg-surface-muted text-secondary">
                                    {draftAutomaton.tipo}
                                </span>
                                {stageMetrics && (
                                    <span className="badge border-default bg-surface-muted text-secondary">
                                        {stageMetrics}
                                    </span>
                                )}
                            </div>
                            <h3 id={titleId} className="mt-3 text-xl font-bold text-primary sm:text-2xl">
                                Simule sem sair da trilha
                            </h3>
                            <p id={descriptionId} className="mt-1 max-w-3xl text-sm text-secondary">
                                Edite o autômato, rode entradas e inspecione a execução no mesmo workspace do simulador principal.
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            {onOpenFullSimulator && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onOpenFullSimulator(draftAutomaton);
                                        onClose();
                                    }}
                                    className="glass-panel flex items-center gap-2 rounded-2xl border border-default bg-surface-1/92 px-4 py-3 text-sm font-bold text-primary shadow-apple-md transition-colors hover:bg-surface-1"
                                    aria-label="Abrir autômato atual no simulador principal"
                                >
                                    <ExternalLink size={16} />
                                    <span className="hidden sm:inline">Abrir no simulador principal</span>
                                    <span className="sm:hidden">Principal</span>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                className="glass-panel rounded-2xl border border-default bg-surface-1/92 p-3 text-secondary shadow-apple-md transition-colors hover:bg-surface-1 hover:text-primary"
                                aria-label="Fechar simulador da trilha"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px]">
                        <AutomatonSimulationWorkspace
                            data={draftAutomaton}
                            onChange={setDraftAutomaton}
                            variant="modal"
                        />
                    </div>
                </div>
            )}
        </Modal>
    );
};
