import React from 'react';
import { SimulationInspectorPanel } from './SimulationInspectorPanel';

interface SimulationDockProps {
    showRightDock: boolean;
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
    showRightDock,
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
            preferredItemId={showDetailsPanel ? 'history' : ((disableReason || isPda) ? 'warnings' : 'tape')}
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

    const rightDock = inspectorPanel;

    const bottomDock = (
        <div className="space-y-3">
            {regexImportPanel}
            {!showRightDock && inspectorPanel}
            {controlsBar}
        </div>
    );

    return children({ rightDock, bottomDock });
};
