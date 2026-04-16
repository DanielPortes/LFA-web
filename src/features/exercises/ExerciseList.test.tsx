import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ExerciseList } from './ExerciseList';
import type { Exercicio } from '../../types';

const exercises: Exercicio[] = [
    {
        id: 1,
        pergunta: 'Construa um AFD para palavras que terminam com a.',
        dicas: [
            { id: 'hint-1', level: 1, text: 'Pense no último símbolo lido.' },
            { id: 'hint-2', level: 2, text: 'Dois estados bastam para esse padrão.' }
        ],
        estrategia: 'Reduza o problema à memória do último símbolo.',
        guidedSolution: [
            {
                id: 'step-1',
                title: 'Defina os estados',
                explanation: 'Um estado para terminar em a e outro para não terminar em a.'
            }
        ],
        metadata: {
            learningGoal: 'Reconhecer um sufixo fixo com AFD.',
            pattern: 'construction'
        },
        respostaTexto: 'Use dois estados para rastrear o último símbolo.',
        nivel: 'facil',
    }
];

describe('ExerciseList', () => {
    it('renderiza a lista e encaminha ações do cartão', () => {
        const onToggleHint = vi.fn();
        const onToggleAnswer = vi.fn();
        const onStartSolving = vi.fn();
        const onOpenSidebar = vi.fn();
        const onOpenConverter = vi.fn();
        const onSimulate = vi.fn();

        render(
            <ExerciseList
                activeCategory="afd"
                activeCategoryLabel="AFDs"
                exercises={exercises}
                filteredExercises={exercises}
                completedInActiveCategory={0}
                revealedHints={{}}
                revealedAnswers={{}}
                isExerciseCompleted={() => false}
                onToggleHint={onToggleHint}
                onToggleAnswer={onToggleAnswer}
                onStartSolving={onStartSolving}
                onOpenSidebar={onOpenSidebar}
                onOpenConverter={onOpenConverter}
                onSimulate={onSimulate}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Abrir sumário de exercícios' }));
        fireEvent.click(screen.getByRole('button', { name: 'Abrir conversor de modelos' }));
        fireEvent.click(screen.getByRole('button', { name: /Tentar Resolver/i }));
        fireEvent.click(screen.getByRole('button', { name: /Pistas \(2\)/i }));
        fireEvent.click(screen.getByRole('button', { name: /Ver Resposta/i }));

        expect(screen.getByText('construction')).toBeInTheDocument();
        expect(screen.getByText('Estratégia')).toBeInTheDocument();
        expect(screen.getByText('Solução guiada')).toBeInTheDocument();
        expect(onOpenSidebar).toHaveBeenCalledTimes(1);
        expect(onOpenConverter).toHaveBeenCalledWith({});
        expect(onStartSolving).toHaveBeenCalledWith(1);
        expect(onToggleHint).toHaveBeenCalledWith(1);
        expect(onToggleAnswer).toHaveBeenCalledWith(1);
    });

    it('mostra estado vazio quando o filtro não retorna itens', () => {
        render(
            <ExerciseList
                activeCategory="afd"
                activeCategoryLabel="AFDs"
                exercises={exercises}
                filteredExercises={[]}
                completedInActiveCategory={0}
                revealedHints={{}}
                revealedAnswers={{}}
                isExerciseCompleted={() => false}
                onToggleHint={vi.fn()}
                onToggleAnswer={vi.fn()}
                onStartSolving={vi.fn()}
                onOpenSidebar={vi.fn()}
                onOpenConverter={vi.fn()}
                onSimulate={vi.fn()}
            />
        );

        expect(screen.getByText('Nenhum exercício encontrado para esta busca.')).toBeInTheDocument();
    });
});
