import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ContentBlockRenderer } from './ContentBlockRenderer';
import type { AutomatoData } from '../../types';

vi.mock('../../components/automaton/AutomatonPreview', () => ({
    AutomatonPreview: ({ data }: { data: AutomatoData }) => (
        <div data-testid="automaton-preview">{data.tipo}</div>
    )
}));

vi.mock('../../components/ui', () => ({
    DerivationTreeVisualizer: ({ tree }: { tree: { symbol: string } }) => (
        <div>Árvore {tree.symbol}</div>
    )
}));

const automaton: AutomatoData = {
    tipo: 'AFD',
    estados: [],
    transicoes: []
};

const pdaAutomaton: AutomatoData = {
    tipo: 'AP',
    estados: [
        { id: 'q0', label: 'q0', x: 120, y: 120, isInicial: true, isFinal: false },
        { id: 'q1', label: 'q1', x: 320, y: 120, isInicial: false, isFinal: true },
    ],
    transicoes: [
        { id: 't0', de: 'q0', para: 'q1', simbolo: 'a, Z -> AZ', curvatura: 0 },
    ],
    alfabetoPilha: ['Z', 'A'],
    simboloInicialPilha: 'Z',
};

describe('ContentBlockRenderer', () => {
    it('encaminha simulação e expansão a partir do bloco de exemplo', () => {
        const onSimulate = vi.fn();
        const onExpand = vi.fn();

        render(
            <ContentBlockRenderer
                block={{
                    type: 'example',
                    title: 'AFD de exemplo',
                    content: 'Um exemplo com automato expandível.',
                    automatoRef: automaton
                }}
                onSimulate={onSimulate}
                onExpand={onExpand}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'SIMULAR' }));
        fireEvent.click(screen.getByRole('button', { name: 'Expandir visualização do autômato' }));

        expect(onSimulate).toHaveBeenCalledWith(automaton);
        expect(onExpand).toHaveBeenCalledWith(automaton);
        expect(screen.getByText('AFD de exemplo')).toBeInTheDocument();
        expect(screen.getByTestId('automaton-preview')).toHaveTextContent('AFD');
    });

    it('renderiza blocos especializados de lista e gramática interativa', () => {
        render(
            <>
                <ContentBlockRenderer
                    block={{
                        type: 'list',
                        title: 'Checklist',
                        content: ['**Passo 1**', 'Passo 2']
                    }}
                    onExpand={vi.fn()}
                />
                <ContentBlockRenderer
                    block={{
                        type: 'interactive-grammar',
                        title: 'Árvore',
                        content: 'Veja a derivação.',
                        grammarTreeData: {
                            symbol: 'S',
                            children: []
                        }
                    }}
                    onExpand={vi.fn()}
                />
            </>
        );

        expect(screen.getByText('Checklist')).toBeInTheDocument();
        expect(screen.getByText('Passo 1')).toBeInTheDocument();
        expect(screen.getByText('Árvore S')).toBeInTheDocument();
    });

    it('abre exercício relacionado a partir de bloco pedagógico', () => {
        const onOpenExercise = vi.fn();

        render(
            <ContentBlockRenderer
                block={{
                    type: 'mini-exercise',
                    title: 'Aplicação guiada',
                    content: 'Modele primeiro a memória mínima.',
                    exerciseRef: 'afd:1'
                }}
                onOpenExercise={onOpenExercise}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Tentar resolver' }));

        expect(screen.getByText('Aplicação guiada')).toBeInTheDocument();
        expect(screen.getByText(/Exercício 1/i)).toBeInTheDocument();
        expect(onOpenExercise).toHaveBeenCalledWith('afd:1');
    });

    it('mostra um visual de pilha quando o exemplo é um autômato de pilha', () => {
        render(
            <ContentBlockRenderer
                block={{
                    type: 'example',
                    title: 'AP para a^n b^n',
                    content: 'Empilhe A para cada a e desempilhe ao ler b.',
                    automatoRef: pdaAutomaton
                }}
                onSimulate={vi.fn()}
                onExpand={vi.fn()}
            />
        );

        expect(screen.getByText('Pilha durante a leitura')).toBeInTheDocument();
        expect(screen.getByText('Z')).toBeInTheDocument();
        expect(screen.getByText('A')).toBeInTheDocument();
    });
});
