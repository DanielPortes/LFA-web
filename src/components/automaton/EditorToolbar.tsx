import React from 'react';
import {
    MousePointer2,
    Plus,
    ArrowUpRight,
    Trash2,
    Undo2,
    Redo2,
    LayoutTemplate,
    Folder,
    MoreVertical,
    Upload,
    Download,
    Share2,
    Image,
    FileJson,
} from 'lucide-react';
import { ToolbarButton } from '../ui/ToolbarButton';
import type { Tool } from '../../types';
import { ToolTypes } from '../../types';
import { cn } from '../../utils/cn';

interface EditorToolbarProps {
    tool: Tool;
    onToolChange: (tool: Tool) => void;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
    onOpenTemplates: () => void;
    onOpenLibrary: () => void;
    showUtilities: boolean;
    onToggleUtilities: () => void;
    onImport: () => void;
    onExport: () => void;
    onShare: () => void;
    onExportPNG: () => void;
    onExportSVG: () => void;
    modifierHeld?: 'shift' | 'alt' | null;
    hasStates: boolean;
    onDeleteAll?: () => void;
}

const TOOLS = [
    {
        id: ToolTypes.POINTER,
        icon: MousePointer2,
        label: 'Mover',
        shortcut: 'V',
        hint: 'Segure Shift',
    },
    {
        id: ToolTypes.STATE,
        icon: Plus,
        label: 'Estado',
        shortcut: 'S',
        hint: 'Clique para criar',
    },
    {
        id: ToolTypes.TRANSITION,
        icon: ArrowUpRight,
        label: 'Transição',
        shortcut: 'T',
        hint: 'Segure Alt',
    },
    {
        id: ToolTypes.DELETE,
        icon: Trash2,
        label: 'Apagar',
        shortcut: 'D',
        hint: 'Clique p/ remover',
    },
] as const;

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
    tool,
    onToolChange,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    onOpenTemplates,
    onOpenLibrary,
    showUtilities,
    onToggleUtilities,
    onImport,
    onExport,
    onShare,
    onExportPNG,
    onExportSVG,
    modifierHeld,
    hasStates,
    onDeleteAll,
}) => {
    const handleToolClick = (toolId: Tool) => {
        if (toolId === ToolTypes.DELETE && tool === ToolTypes.DELETE && hasStates) {
            onDeleteAll?.();
        } else {
            onToolChange(toolId);
        }
    };

    return (
        <div className="absolute left-4 top-4 bottom-4 z-20 flex flex-col pointer-events-none">
            <div className="pointer-events-auto flex flex-col gap-3">
                {/* Tools */}
                <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-md border border-default">
                    {TOOLS.map((t) => (
                        <ToolbarButton
                            key={t.id}
                            icon={t.icon}
                            label={t.label}
                            shortcut={t.shortcut}
                            hint={t.hint}
                            active={tool === t.id}
                            onClick={() => handleToolClick(t.id)}
                            className={cn(
                                modifierHeld === 'shift' &&
                                    t.id === ToolTypes.POINTER &&
                                    'ring-2 ring-ios-blue/50',
                                modifierHeld === 'alt' &&
                                    t.id === ToolTypes.TRANSITION &&
                                    'ring-2 ring-ios-blue/50'
                            )}
                            side="right"
                        />
                    ))}
                </div>

                {/* History */}
                <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-md border border-default">
                    <ToolbarButton
                        icon={Undo2}
                        label="Desfazer"
                        shortcut="Ctrl+Z"
                        disabled={!canUndo}
                        onClick={onUndo}
                        side="right"
                    />
                    <ToolbarButton
                        icon={Redo2}
                        label="Refazer"
                        shortcut="Ctrl+Y"
                        disabled={!canRedo}
                        onClick={onRedo}
                        side="right"
                    />
                </div>

                {/* Actions */}
                <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-md border border-default">
                    <ToolbarButton
                        icon={LayoutTemplate}
                        label="Templates"
                        onClick={onOpenTemplates}
                        side="right"
                    />
                    <ToolbarButton
                        icon={Folder}
                        label="Biblioteca"
                        onClick={onOpenLibrary}
                        side="right"
                    />
                </div>

                {/* Utilities Toggle */}
                <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-md border border-default">
                    <ToolbarButton
                        icon={MoreVertical}
                        label={showUtilities ? 'Menos' : 'Mais'}
                        active={showUtilities}
                        onClick={onToggleUtilities}
                        side="right"
                    />
                </div>

                {/* Expanded Utilities */}
                {showUtilities && (
                    <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-md border border-default animate-slide-right-fade">
                        <ToolbarButton
                            icon={Upload}
                            label="Importar JSON"
                            onClick={onImport}
                            side="right"
                        />
                        <ToolbarButton
                            icon={Download}
                            label="Exportar JSON"
                            onClick={onExport}
                            side="right"
                        />
                        <ToolbarButton
                            icon={Share2}
                            label="Compartilhar"
                            onClick={onShare}
                            side="right"
                        />
                        <div className="h-px bg-border my-1" />
                        <ToolbarButton
                            icon={Image}
                            label="Exportar PNG"
                            onClick={onExportPNG}
                            side="right"
                        />
                        <ToolbarButton
                            icon={FileJson}
                            label="Exportar SVG"
                            onClick={onExportSVG}
                            side="right"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};


