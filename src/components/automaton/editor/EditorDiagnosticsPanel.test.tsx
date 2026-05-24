import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { simplePDA } from '../../../test/fixtures';
import { EditorDiagnosticsPanel } from './EditorDiagnosticsPanel';

const renderPanel = (overrides: Partial<Parameters<typeof EditorDiagnosticsPanel>[0]> = {}) => {
    const props: Parameters<typeof EditorDiagnosticsPanel>[0] = {
        data: simplePDA,
        pdaProps: {
            alfabetoPilha: ['Z', 'A'],
            simboloInicialPilha: 'Z',
            pdaAcceptance: 'final',
        },
        snapToGrid: false,
        showUtilities: false,
        showProps: true,
        showValidation: false,
        showBatchTest: false,
        showTable: false,
        showEquivalents: false,
        validationIssues: [],
        hasErrors: false,
        warningCount: 0,
        alphabetInput: 'a, b',
        stackAlphabetInput: 'Z, A',
        stackStartSymbol: 'Z',
        onToggleProps: vi.fn(),
        onTypeChange: vi.fn(),
        onAutoAlphabet: vi.fn(),
        onAlphabetInputChange: vi.fn(),
        onAlphabetFocus: vi.fn(),
        onAlphabetCommit: vi.fn(),
        onStackAlphabetInputChange: vi.fn(),
        onStackAlphabetFocus: vi.fn(),
        onStackAlphabetCommit: vi.fn(),
        onStackStartChange: vi.fn(),
        onStackStartFocus: vi.fn(),
        onStackStartCommit: vi.fn(),
        onToggleSnapToGrid: vi.fn(),
        onMagicLayout: vi.fn(),
        onToggleValidation: vi.fn(),
        onToggleBatchTest: vi.fn(),
        onToggleTable: vi.fn(),
        onToggleEquivalents: vi.fn(),
        onFocusState: vi.fn(),
        onLoadEquivalent: vi.fn(),
        onConvertToDFA: vi.fn(),
        onEliminateEpsilon: vi.fn(),
        onMinimizeDfa: vi.fn(),
        onMooreToMealy: vi.fn(),
        onMealyToMoore: vi.fn(),
        ...overrides,
    };

    render(<EditorDiagnosticsPanel {...props} />);
    return props;
};

describe('EditorDiagnosticsPanel', () => {
    it('mantém ações indisponíveis para AP clicáveis para explicar o motivo ao aluno', () => {
        const onToggleBatchTest = vi.fn();
        const onToggleTable = vi.fn();
        renderPanel({ onToggleBatchTest, onToggleTable });

        const batchButton = screen.getByRole('button', { name: 'Testes em Lote' });
        const tableButton = screen.getByRole('button', { name: 'Tabela' });

        expect(batchButton).toBeEnabled();
        expect(tableButton).toBeEnabled();

        fireEvent.click(batchButton);
        fireEvent.click(tableButton);

        expect(onToggleBatchTest).toHaveBeenCalledTimes(1);
        expect(onToggleTable).toHaveBeenCalledTimes(1);
    });
});
