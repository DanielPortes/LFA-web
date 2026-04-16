import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SimulationDock } from './SimulationDock';

describe('SimulationDock', () => {
    it('prioriza um único inspetor lateral por vez quando o layout é side/top_side', () => {
        render(
            <SimulationDock
                desktopInspector={true}
                inspectorOpen={true}
                onCloseInspector={() => {}}
                regexImportPanel={<span>REGEX</span>}
                warningsPanel={<span>WARNINGS</span>}
                detailsPanel={<span>DETAILS</span>}
                tapePanel={<span>TAPE</span>}
                controlsBar={<span>CONTROLS</span>}
                disableReason="Entrada inválida"
                isPda={false}
                showWarningsPanel={true}
                showDetailsPanel={false}
                showTapePanel={true}
            >
                {({ rightDock, bottomDock }) => (
                    <div>
                        <section data-testid="right">{rightDock}</section>
                        <section data-testid="bottom">{bottomDock}</section>
                    </div>
                )}
            </SimulationDock>
        );

        expect(within(screen.getByTestId('right')).getByText('WARNINGS')).toBeInTheDocument();
        expect(within(screen.getByTestId('right')).getByRole('button', { name: 'Fita' })).toBeInTheDocument();
        expect(within(screen.getByTestId('right')).queryByRole('button', { name: 'Histórico' })).not.toBeInTheDocument();
        expect(within(screen.getByTestId('bottom')).getByText('REGEX')).toBeInTheDocument();
        expect(within(screen.getByTestId('bottom')).getByText('CONTROLS')).toBeInTheDocument();
        expect(within(screen.getByTestId('bottom')).queryByText('WARNINGS')).not.toBeInTheDocument();
    });

    it('traz um inspetor tabulado para baixo quando o layout é bottom', () => {
        render(
            <SimulationDock
                desktopInspector={false}
                inspectorOpen={true}
                onCloseInspector={() => {}}
                regexImportPanel={<span>REGEX</span>}
                warningsPanel={<span>WARNINGS</span>}
                detailsPanel={<span>DETAILS</span>}
                tapePanel={<span>TAPE</span>}
                controlsBar={<span>CONTROLS</span>}
                disableReason="Entrada inválida"
                isPda={false}
                showWarningsPanel={true}
                showDetailsPanel={true}
                showTapePanel={true}
            >
                {({ rightDock, bottomDock }) => (
                    <div>
                        <section data-testid="right">{rightDock}</section>
                        <section data-testid="bottom">{bottomDock}</section>
                    </div>
                )}
            </SimulationDock>
        );

        expect(within(screen.getByTestId('right')).queryByText('TAPE')).not.toBeInTheDocument();
        expect(within(screen.getByTestId('bottom')).getByText('WARNINGS')).toBeInTheDocument();
        const bottom = within(screen.getByTestId('bottom'));

        expect(bottom.getByRole('button', { name: 'Histórico' })).toBeInTheDocument();
        expect(bottom.getByRole('button', { name: 'Fita' })).toBeInTheDocument();
        expect(bottom.getByRole('button', { name: 'Alertas' })).toBeInTheDocument();

        fireEvent.click(bottom.getByRole('button', { name: 'Alertas' }));
        expect(within(screen.getByTestId('bottom')).getByText('WARNINGS')).toBeInTheDocument();
    });

    it('abre o histórico como inspetor preferencial quando ele está habilitado', () => {
        render(
            <SimulationDock
                desktopInspector={false}
                inspectorOpen={true}
                onCloseInspector={() => {}}
                regexImportPanel={<span>REGEX</span>}
                warningsPanel={<span>WARNINGS</span>}
                detailsPanel={<span>DETAILS</span>}
                tapePanel={<span>TAPE</span>}
                controlsBar={<span>CONTROLS</span>}
                disableReason={null}
                isPda={false}
                showWarningsPanel={false}
                showDetailsPanel={true}
                showTapePanel={true}
            >
                {({ bottomDock }) => <section data-testid="bottom">{bottomDock}</section>}
            </SimulationDock>
        );

        expect(within(screen.getByTestId('bottom')).getByText('TAPE')).toBeInTheDocument();
        expect(within(screen.getByTestId('bottom')).queryByText('WARNINGS')).not.toBeInTheDocument();
    });
});
