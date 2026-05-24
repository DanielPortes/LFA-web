// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MousePointer2, Circle, ArrowRight } from 'lucide-react';
import { EditorPrimaryToolbar, type EditorToolDefinition } from './EditorPrimaryToolbar';

const tools: EditorToolDefinition[] = [
    {
        id: 'pointer',
        icon: MousePointer2,
        label: 'Mover',
        shortcut: 'V',
        hint: 'Mover elementos'
    },
    {
        id: 'state',
        icon: Circle,
        label: 'Estado',
        shortcut: 'S',
        hint: 'Criar estado'
    },
    {
        id: 'transition',
        icon: ArrowRight,
        label: 'Transição',
        shortcut: 'T',
        hint: 'Criar transição'
    }
];

const baseProps = {
    tools,
    activeTool: 'pointer' as const,
    modifierHeld: null,
    canUndo: false,
    canRedo: false,
    showUtilities: false,
    showCoachMarks: true,
    onSelectTool: vi.fn(),
    onUndo: vi.fn(),
    onRedo: vi.fn(),
    onOpenTemplates: vi.fn(),
    onOpenLibrary: vi.fn(),
    onToggleUtilities: vi.fn(),
    onToggleCoachMarks: vi.fn(),
    onDismissCoachMarks: vi.fn(),
    onTriggerImport: vi.fn(),
    onOpenGrammarImport: vi.fn(),
    onExportJson: vi.fn(),
    onShare: vi.fn(),
    onExportPng: vi.fn(),
    onExportSvg: vi.fn(),
};

describe('EditorPrimaryToolbar', () => {
    it('posiciona sugestões rápidas acima do botão para não ficar sob docks inferiores', () => {
        render(<EditorPrimaryToolbar {...baseProps} />);

        const coachMarks = screen.getByTestId('editor-coach-marks');

        expect(coachMarks).toHaveClass('bottom-full');
        expect(coachMarks).not.toHaveClass('top-0');
    });
});
