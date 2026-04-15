import { useCallback } from 'react';
import type { AutomatoData } from '../../../types';
import { useModifierKey, useWindowKeyboard, isEditableTarget } from '../../../features/shortcuts';
import type { CanvasSelection } from './types';

interface UseCanvasKeyboardOptions {
    data: AutomatoData;
    readOnly: boolean;
    selection: CanvasSelection | null;
    selectedStateIds: string[];
    deleteState: (id: string) => void;
    deleteTransition: (id: string) => void;
    onChange: (data: AutomatoData) => void;
    onClearSelection: () => void;
    onSelectAll: (stateIds: string[], transitionIds: string[]) => void;
}

export const useCanvasKeyboard = ({
    data,
    readOnly,
    selection,
    selectedStateIds,
    deleteState,
    deleteTransition,
    onChange,
    onClearSelection,
    onSelectAll,
}: UseCanvasKeyboardOptions) => {
    const isSpacePressed = useModifierKey('Space', { enabled: !readOnly });
    const isCtrlPressed = useModifierKey('Control');

    const deleteSelection = useCallback(() => {
        if (selection?.type === 'state') {
            deleteState(selection.id);
            return;
        }

        if (selection?.type === 'transition') {
            deleteTransition(selection.id);
            return;
        }

        if (selectedStateIds.length === 0) return;

        const nextStates = data.estados.filter((state) => !selectedStateIds.includes(state.id));
        const nextTransitions = data.transicoes.filter((transition) => (
            !selectedStateIds.includes(transition.de) && !selectedStateIds.includes(transition.para)
        ));

        onChange({ ...data, estados: nextStates, transicoes: nextTransitions });
        onClearSelection();
    }, [data, deleteState, deleteTransition, onChange, onClearSelection, selectedStateIds, selection]);

    useWindowKeyboard({
        enabled: !readOnly,
        onKeyDown: (event) => {
            if (isEditableTarget(event.target)) return;

            if (event.key === 'Delete' || event.key === 'Backspace') {
                deleteSelection();
                return;
            }

            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
                event.preventDefault();
                onSelectAll(
                    data.estados.map((state) => state.id),
                    data.transicoes.map((transition) => transition.id)
                );
            }
        },
    });

    return {
        isCtrlPressed,
        isSpacePressed,
    };
};
