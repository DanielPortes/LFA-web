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
        expect(within(screen.getByTestId('regex-import-slot')).getByText('REGEX')).toBeInTheDocument();
        expect(within(screen.getByTestId('simulation-controls-slot')).getByText('CONTROLS')).toBeInTheDocument();
        expect(within(screen.getByTestId('bottom')).queryByText('WARNINGS')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Fechar painel lateral de diagnóstico' })).toBeInTheDocument();
    });

    it('ancora a importação por regex fora do fluxo vertical do player', () => {
        render(
            <SimulationDock
                desktopInspector={true}
                inspectorOpen={false}
                onCloseInspector={() => {}}
                regexImportPanel={<span>REGEX</span>}
                warningsPanel={<span>WARNINGS</span>}
                detailsPanel={<span>DETAILS</span>}
                tapePanel={<span>TAPE</span>}
                controlsBar={<span>CONTROLS</span>}
                disableReason={null}
                isPda={false}
                showWarningsPanel={false}
                showDetailsPanel={false}
                showTapePanel={false}
            >
                {({ bottomDock }) => <section data-testid="bottom">{bottomDock}</section>}
            </SimulationDock>
        );

        const regexSlot = screen.getByTestId('regex-import-slot');
        const controlsSlot = screen.getByTestId('simulation-controls-slot');

        expect(regexSlot).toHaveClass('absolute');
        expect(regexSlot).toHaveClass('right-0');
        expect(regexSlot).toHaveClass('bottom-[4.75rem]');
        expect(within(regexSlot).getByText('REGEX')).toBeInTheDocument();
        expect(within(controlsSlot).getByText('CONTROLS')).toBeInTheDocument();
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

    it('prioriza visualização de pilha no inspetor de AP quando não há erro', () => {
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
                disableReason={null}
                isPda={true}
                showWarningsPanel={true}
                showDetailsPanel={false}
                showTapePanel={true}
            >
                {({ rightDock }) => <section data-testid="right">{rightDock}</section>}
            </SimulationDock>
        );

        expect(within(screen.getByTestId('right')).getByText('TAPE')).toBeInTheDocument();
        expect(within(screen.getByTestId('right')).queryByText('WARNINGS')).not.toBeInTheDocument();
        expect(within(screen.getByTestId('right')).getByRole('button', { name: 'Visualização' })).toBeInTheDocument();
        expect(within(screen.getByTestId('right')).getByRole('button', { name: 'Alertas' })).toBeInTheDocument();
    });

    it('mantém o inspetor desktop compacto para não sobrepor o player inferior', () => {
        render(
            <SimulationDock
                desktopInspector={true}
                inspectorOpen={true}
                onCloseInspector={() => {}}
                regexImportPanel={<span>REGEX</span>}
                warningsPanel={<span>WARNINGS</span>}
                detailsPanel={<span>DETAILS</span>}
                tapePanel={<div className="h-[900px]">TAPE</div>}
                controlsBar={<span>CONTROLS</span>}
                disableReason={null}
                isPda={true}
                showWarningsPanel={true}
                showDetailsPanel={true}
                showTapePanel={true}
            >
                {({ rightDock }) => <section data-testid="right">{rightDock}</section>}
            </SimulationDock>
        );

        const inspector = screen.getByTestId('simulation-inspector-shell');
        const inspectorBody = screen.getByTestId('simulation-inspector-body');

        expect(inspector).toHaveClass('max-h-[min(34rem,calc(100dvh-14rem))]');
        expect(inspector).toHaveClass('bg-surface-1/35');
        expect(inspector).toHaveClass('shadow-none');
        expect(inspector).toHaveClass('backdrop-blur-sm');
        expect(inspector).not.toHaveClass('h-full');
        expect(inspectorBody).toHaveClass('overflow-y-auto');
    });

    it('renderiza apenas a visualização como faixa nativa acima do player quando não há alerta nem histórico', () => {
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
                disableReason={null}
                isPda={true}
                showWarningsPanel={false}
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

        expect(within(screen.getByTestId('right')).queryByText('TAPE')).not.toBeInTheDocument();
        expect(screen.queryByTestId('simulation-inspector-shell')).not.toBeInTheDocument();
        expect(within(screen.getByTestId('pda-native-readout-slot')).getByText('TAPE')).toBeInTheDocument();
        expect(within(screen.getByTestId('simulation-controls-slot')).getByText('CONTROLS')).toBeInTheDocument();
    });

    it('posiciona a pilha de AP no canto sem empurrar o player nativo', () => {
        render(
            <SimulationDock
                desktopInspector={true}
                inspectorOpen={true}
                onCloseInspector={() => {}}
                regexImportPanel={<span>REGEX</span>}
                warningsPanel={<span>WARNINGS</span>}
                detailsPanel={<span>DETAILS</span>}
                tapePanel={(
                    <div>
                        <div data-testid="pda-input-rail">FITA</div>
                    </div>
                )}
                nativeSidePanel={<div data-testid="pda-stack-widget">PILHA</div>}
                controlsBar={<span>CONTROLS</span>}
                disableReason={null}
                isPda={true}
                showWarningsPanel={false}
                showDetailsPanel={false}
                showTapePanel={true}
            >
                {({ bottomDock }) => <section data-testid="bottom">{bottomDock}</section>}
            </SimulationDock>
        );

        const stackSlot = screen.getByTestId('pda-stack-corner-slot');

        expect(screen.getByTestId('pda-native-readout-slot')).toHaveClass('min-h-10');
        expect(within(screen.getByTestId('pda-native-readout-slot')).getByText('FITA')).toBeInTheDocument();
        expect(stackSlot).toHaveClass('absolute');
        expect(stackSlot).toHaveClass('right-0');
        expect(within(stackSlot).getByText('PILHA')).toBeInTheDocument();
        expect(within(screen.getByTestId('pda-player-row')).getByText('CONTROLS')).toBeInTheDocument();
        expect(within(screen.getByTestId('pda-player-row')).queryByText('PILHA')).not.toBeInTheDocument();
    });
});
