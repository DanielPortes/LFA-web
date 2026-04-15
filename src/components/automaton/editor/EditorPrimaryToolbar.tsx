import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    Undo2,
    Redo2,
    Upload,
    Download,
    Share2,
    Image,
    FileJson,
    LayoutTemplate,
    Folder,
    MoreVertical,
    Lightbulb,
    X,
    Type,
} from 'lucide-react';
import type { Tool } from '../../../types';
import { ToolbarButton } from '../../ui/ToolbarButton';

export interface EditorToolDefinition {
    id: Tool;
    icon: LucideIcon;
    label: string;
    shortcut: string;
    hint: string;
}

interface EditorPrimaryToolbarProps {
    readOnly?: boolean;
    tools: EditorToolDefinition[];
    activeTool: Tool;
    modifierHeld: 'shift' | 'alt' | null;
    canUndo: boolean;
    canRedo: boolean;
    showUtilities: boolean;
    showCoachMarks: boolean;
    onSelectTool: (tool: Tool) => void;
    onUndo: () => void;
    onRedo: () => void;
    onOpenTemplates: () => void;
    onOpenLibrary: () => void;
    onToggleUtilities: () => void;
    onToggleCoachMarks: () => void;
    onDismissCoachMarks: () => void;
    onTriggerImport: () => void;
    onOpenGrammarImport: () => void;
    onExportJson: () => void;
    onShare: () => void;
    onExportPng: () => void;
    onExportSvg: () => void;
}

export const EditorPrimaryToolbar: React.FC<EditorPrimaryToolbarProps> = ({
    readOnly = false,
    tools,
    activeTool,
    modifierHeld,
    canUndo,
    canRedo,
    showUtilities,
    showCoachMarks,
    onSelectTool,
    onUndo,
    onRedo,
    onOpenTemplates,
    onOpenLibrary,
    onToggleUtilities,
    onToggleCoachMarks,
    onDismissCoachMarks,
    onTriggerImport,
    onOpenGrammarImport,
    onExportJson,
    onShare,
    onExportPng,
    onExportSvg,
}) => {
    if (readOnly) return null;

    return (
        <div className="flex flex-col gap-3 lg:sticky lg:top-0">
            <div className="flex flex-col gap-3">
                <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-md border border-default">
                    {tools.map((toolItem) => (
                        <ToolbarButton
                            key={toolItem.id}
                            icon={toolItem.icon}
                            label={toolItem.label}
                            shortcut={toolItem.shortcut}
                            hint={toolItem.hint}
                            active={activeTool === toolItem.id}
                            onClick={() => onSelectTool(toolItem.id)}
                            className={`${modifierHeld === 'shift' && toolItem.id === 'pointer' ? 'ring-2 ring-ios-blue/50' : ''} ${modifierHeld === 'alt' && toolItem.id === 'transition' ? 'ring-2 ring-ios-blue/50' : ''}`}
                            side="right"
                        />
                    ))}
                </div>

                <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-md border border-default">
                    <ToolbarButton icon={Undo2} label="Desfazer" shortcut="Ctrl+Z" disabled={!canUndo} onClick={onUndo} side="right" />
                    <ToolbarButton icon={Redo2} label="Refazer" shortcut="Ctrl+Y" disabled={!canRedo} onClick={onRedo} side="right" />
                </div>

                <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-md border border-default">
                    <ToolbarButton icon={LayoutTemplate} label="Templates" onClick={onOpenTemplates} side="right" />
                    <ToolbarButton icon={Folder} label="Biblioteca" onClick={onOpenLibrary} side="right" />
                </div>

                <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-md border border-default">
                    <ToolbarButton icon={MoreVertical} label={showUtilities ? 'Menos' : 'Mais'} active={showUtilities} onClick={onToggleUtilities} side="right" />
                </div>

                <div className="relative pointer-events-auto">
                    <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-md border border-default">
                        <ToolbarButton
                            icon={Lightbulb}
                            label="Sugestões"
                            active={showCoachMarks}
                            onClick={onToggleCoachMarks}
                            side="right"
                        />
                    </div>

                    {showCoachMarks && (
                        <div className="absolute left-full top-0 ml-3 w-80 glass-panel rounded-2xl border border-default p-3 shadow-apple-lg z-40">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-primary">Sugestões rápidas</p>
                                    <ul className="mt-2 space-y-1.5 text-xs text-secondary leading-relaxed">
                                        <li>Duplo clique no canvas para criar um estado.</li>
                                        <li>Use `T` para transição e clique em origem e destino.</li>
                                        <li>Use Shift para mover rápido e Alt para transição temporária.</li>
                                        <li>Clique em um elemento para editar sem abrir menus extras.</li>
                                    </ul>
                                </div>

                                <button
                                    type="button"
                                    onClick={onDismissCoachMarks}
                                    className="rounded-lg p-1 text-secondary hover:text-primary hover:bg-surface-hover transition-colors"
                                    aria-label="Fechar sugestões"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {showUtilities && (
                    <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 shadow-apple-md border border-default animate-slide-right-fade">
                        <ToolbarButton icon={Upload} label="Importar JSON" onClick={onTriggerImport} side="right" />
                        <ToolbarButton icon={Type} label="Importar gramática" onClick={onOpenGrammarImport} side="right" />
                        <ToolbarButton icon={Download} label="Exportar JSON" onClick={onExportJson} side="right" />
                        <ToolbarButton icon={Share2} label="Compartilhar" onClick={onShare} side="right" />
                        <div className="h-px bg-border my-1" />
                        <ToolbarButton icon={Image} label="Exportar PNG" onClick={onExportPng} side="right" />
                        <ToolbarButton icon={FileJson} label="Exportar SVG" onClick={onExportSvg} side="right" />
                    </div>
                )}
            </div>
        </div>
    );
};
