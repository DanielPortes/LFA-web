import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockViewport } from '../../../test/browserMocks';
import { GrammarWorkspace } from './GrammarWorkspace';

const renderWorkspace = (grammarSource: string) => render(
    <GrammarWorkspace
        headerContent={null}
        grammarSource={grammarSource}
        grammarInput=""
        grammarWarnings={[]}
        grammarStrategy="leftmost"
        grammarLimits={{ maxSteps: 20, maxQueue: 2000, maxSymbols: 20 }}
        grammarResult={null}
        grammarTransform={null}
        setGrammarSource={vi.fn()}
        setGrammarInput={vi.fn()}
        setGrammarStrategy={vi.fn()}
        setGrammarLimits={vi.fn()}
        runDerivation={vi.fn()}
        runTransform={vi.fn()}
        clearTransform={vi.fn()}
        clearResult={vi.fn()}
    />
);

describe('GrammarWorkspace', () => {
    beforeEach(() => {
        mockViewport({ width: 1280, height: 800 });
    });

    it('alerta quando a gramática contém regras duplicadas', () => {
        renderWorkspace('S -> a S b | eps\nS -> a S b | eps');

        expect(screen.getByText('Regras duplicadas')).toBeInTheDocument();
        expect(screen.getAllByText(/S -> a S b \| eps/).length).toBeGreaterThan(0);
    });

});
