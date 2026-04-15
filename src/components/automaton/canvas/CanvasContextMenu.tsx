import React from 'react';
import { Check, Flag, Plus, RotateCcw, Trash2 } from 'lucide-react';
import type { AutomatoData } from '../../../types';
import { ContextMenu } from '../../ui/ContextMenu';
import type { CanvasContextMenuState } from './types';

interface CanvasContextMenuProps {
    contextMenu: CanvasContextMenuState | null;
    data: AutomatoData;
    svgRef: React.RefObject<SVGSVGElement | null>;
    currentPan: { x: number; y: number };
    zoom: number;
    onClose: () => void;
    onChange: (data: AutomatoData) => void;
    onDeleteState: (id: string) => void;
    onDeleteTransition: (id: string) => void;
    onCreateStateAtLogical: (x: number, y: number) => void;
    onResetView: () => void;
}

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
    contextMenu,
    data,
    svgRef,
    currentPan,
    zoom,
    onClose,
    onChange,
    onDeleteState,
    onDeleteTransition,
    onCreateStateAtLogical,
    onResetView,
}) => {
    if (!contextMenu) return null;

    return (
        <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={onClose}
            options={
                contextMenu.type === 'state' ? [
                    {
                        label: 'Inicial',
                        icon: <Flag size={14} />,
                        action: () => {
                            if (!contextMenu.targetId) return;
                            onChange({
                                ...data,
                                estados: data.estados.map((state) => (
                                    state.id === contextMenu.targetId
                                        ? { ...state, isInicial: !state.isInicial }
                                        : state
                                ))
                            });
                        }
                    },
                    {
                        label: 'Final',
                        icon: <Check size={14} />,
                        action: () => {
                            if (!contextMenu.targetId) return;
                            onChange({
                                ...data,
                                estados: data.estados.map((state) => (
                                    state.id === contextMenu.targetId
                                        ? { ...state, isFinal: !state.isFinal }
                                        : state
                                ))
                            });
                        }
                    },
                    { separator: true, label: '', action: () => { } },
                    {
                        label: 'Excluir',
                        icon: <Trash2 size={14} />,
                        danger: true,
                        action: () => {
                            if (contextMenu.targetId) {
                                onDeleteState(contextMenu.targetId);
                            }
                        }
                    }
                ] : contextMenu.type === 'transition' ? [
                    {
                        label: 'Resetar Curvatura',
                        icon: <RotateCcw size={14} />,
                        action: () => {
                            if (!contextMenu.targetId) return;
                            onChange({
                                ...data,
                                transicoes: data.transicoes.map((transition) => (
                                    transition.id === contextMenu.targetId
                                        ? { ...transition, curvatura: 0, controlPoint: null }
                                        : transition
                                ))
                            });
                        }
                    },
                    {
                        label: 'Excluir',
                        icon: <Trash2 size={14} />,
                        danger: true,
                        action: () => {
                            if (contextMenu.targetId) {
                                onDeleteTransition(contextMenu.targetId);
                            }
                        }
                    }
                ] : [
                    {
                        label: 'Novo Estado',
                        icon: <Plus size={14} />,
                        action: () => {
                            const rect = svgRef.current?.getBoundingClientRect();
                            if (!rect) return;

                            const mouseX = contextMenu.x - rect.left;
                            const mouseY = contextMenu.y - rect.top;
                            onCreateStateAtLogical(
                                (mouseX - currentPan.x) / zoom,
                                (mouseY - currentPan.y) / zoom
                            );
                        }
                    },
                    {
                        label: 'Resetar View',
                        icon: <RotateCcw size={14} />,
                        action: onResetView
                    }
                ]
            }
        />
    );
};
