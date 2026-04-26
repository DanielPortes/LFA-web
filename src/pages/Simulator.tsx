import React, { useEffect, useState } from 'react';
import type { AutomatoData } from '../types';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { SIMULATOR_STORAGE_KEY } from '../constants/storage';
import { AutomatonSimulationWorkspace } from '../features/simulator';
import { cloneAutomaton } from '../utils/cloneAutomaton';

interface SimulatorProps {
    initialData?: AutomatoData;
    onInitialDataConsumed?: () => void;
}

const emptyAutomaton: AutomatoData = {
    tipo: 'AFD',
    estados: [],
    transicoes: [],
    descricao: 'Novo autômato'
};

export const SimulatorPage: React.FC<SimulatorProps> = ({
    initialData,
    onInitialDataConsumed
}) => {
    const [data, setData] = useLocalStorageState<AutomatoData>(
        SIMULATOR_STORAGE_KEY,
        initialData ?? emptyAutomaton,
        {
            readOnInit: !initialData,
            writeDelayMs: 200
        }
    );
    const [workspaceResetToken, setWorkspaceResetToken] = useState(0);

    useEffect(() => {
        if (!initialData) return;

        setData(cloneAutomaton(initialData));
        setWorkspaceResetToken((value) => value + 1);
        onInitialDataConsumed?.();
    }, [initialData, onInitialDataConsumed, setData]);

    return (
        <div
            className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden pb-3 pt-20 animate-fade-in sm:pt-[5.5rem] lg:pt-24"
            data-native-cursor="true"
        >
            <AutomatonSimulationWorkspace
                data={data || emptyAutomaton}
                onChange={setData}
                resetToken={workspaceResetToken}
                variant="page"
            />
        </div>
    );
};
