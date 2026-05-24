import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockViewport } from '../../../test/browserMocks';
import { GrammarWorkspace } from './GrammarWorkspace';

const renderWorkspace = (grammarSource: string, setGrammarSource = vi.fn()) => render(
    <GrammarWorkspace
        headerContent={null}
        grammarSource={grammarSource}
        grammarInput=""
        grammarWarnings={[]}
        grammarStrategy="leftmost"
        grammarLimits={{ maxSteps: 20, maxQueue: 2000, maxSymbols: 20 }}
        grammarResult={null}
        grammarTransform={null}
        setGrammarSource={setGrammarSource}
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

    it('mantém modelos de gramática em modal compacto', () => {
        renderWorkspace('S -> a S b | eps');

        expect(screen.queryByText('Modelos de gramática')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Modelos' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Carregar aⁿbⁿ/ })).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Modelos' }));

        expect(screen.getByRole('dialog', { name: 'Começar por exemplo' })).toBeInTheDocument();
        expect(screen.queryByText(/Preset/)).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Carregar aⁿbⁿ/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Carregar parênteses balanceados/ })).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: /Carregar/ })).toHaveLength(6);
    });

    it('carrega o modelo selecionado no editor de gramática', () => {
        const setGrammarSource = vi.fn();
        renderWorkspace('S -> a S b | eps', setGrammarSource);

        fireEvent.click(screen.getByRole('button', { name: 'Modelos' }));
        fireEvent.click(screen.getByRole('button', { name: /Carregar parênteses balanceados/ }));

        expect(setGrammarSource).toHaveBeenCalledWith('S -> ( S ) S | eps');
        expect(screen.queryByRole('dialog', { name: 'Começar por exemplo' })).not.toBeInTheDocument();
    });

    it('mantém limites técnicos recolhidos fora do fluxo principal', () => {
        renderWorkspace('S -> a S b | eps');

        expect(screen.getByRole('button', { name: 'Mostrar limites avançados da busca' })).toBeInTheDocument();
        expect(screen.queryByLabelText('Passos máximos da busca')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Mostrar limites avançados da busca' }));

        expect(screen.getByLabelText('Passos máximos da busca')).toBeInTheDocument();
        expect(screen.getByLabelText('Tamanho máximo da fila')).toBeInTheDocument();
        expect(screen.getByLabelText('Máximo de símbolos por forma sentencial')).toBeInTheDocument();
    });
});
