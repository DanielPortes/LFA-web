import React from 'react';
import { X } from 'lucide-react';
import { SimulationInspectorPanel } from './SimulationInspectorPanel';

interface SimulationDockProps {
    desktopInspector: boolean;
    inspectorOpen: boolean;
    onCloseInspector: () => void;
    regexImportPanel: React.ReactNode;
    warningsPanel: React.ReactNode;
    detailsPanel: React.ReactNode;
    tapePanel: React.ReactNode;
    controlsBar: React.ReactNode;
    disableReason: string | null;
    isPda: boolean;
    showWarningsPanel: boolean;
    showDetailsPanel: boolean;
    showTapePanel: boolean;
    children: (slots: { rightDock: React.ReactNode; bottomDock: React.ReactNode }) => React.ReactElement;
}

export const SimulationDock: React.FC<SimulationDockProps> = ({
    desktopInspector,
    inspectorOpen,
    onCloseInspector,
    regexImportPanel,
    warningsPanel,
    detailsPanel,
    tapePanel,
    controlsBar,
    disableReason,
    isPda,
    showWarningsPanel,
    showDetailsPanel,
    showTapePanel,
    children,
}) => {
    const inspectorPanel = (
        <SimulationInspectorPanel
            preferredItemId={(disableReason || isPda) ? 'warnings' : 'tape'}
            items={[
                {
                    id: 'tape',
                    label: isPda ? 'Visualização' : 'Fita',
                    content: showTapePanel ? tapePanel : null,
                },
                {
                    id: 'warnings',
                    label: 'Alertas',
                    content: showWarningsPanel ? warningsPanel : null,
                },
                {
                    id: 'history',
                    label: 'Histórico',
                    content: showDetailsPanel ? detailsPanel : null,
                },
            ]}
        />
    );

    const inspectorShell = inspectorOpen ? (
        <section className={`glass-panel flex h-full min-h-0 flex-col rounded-[24px] border border-default bg-surface-1/95 shadow-apple-xl ${desktopInspector ? 'w-[min(24rem,calc(100vw-2rem))]' : 'max-h-[42vh] w-full'}`}>
            <div className="flex items-center justify-between gap-3 border-b border-default/60 px-4 py-3">
                <div>
                    <div className="ui-kicker-xs text-secondary">Inspetor</div>
                    <div className="text-sm font-bold text-primary">Simulação e diagnóstico</div>
                </div>
                <button
                    type="button"
                    onClick={onCloseInspector}
                    className="rounded-2xl p-2 text-secondary transition-colors hover:bg-surface-hover hover:text-primary"
                    aria-label="Fechar inspetor da simulação"
                >
                    <X size={16} />
                </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3 custom-scrollbar">
                {inspectorPanel}
            </div>
        </section>
    ) : null;

    const rightDock = desktopInspector ? inspectorShell : null;

    const bottomDock = (
        <div className="space-y-3">
            {!desktopInspector && inspectorShell && (
                <div className="mx-auto w-full max-w-[960px]">
                    {inspectorShell}
                </div>
            )}
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr),auto] lg:items-end">
                <div className="min-w-0">
                    {controlsBar}
                </div>
                <div className="lg:justify-self-end lg:self-center">
                    {regexImportPanel}
                </div>
            </div>
        </div>
    );

    return children({ rightDock, bottomDock });
};
