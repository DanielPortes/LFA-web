// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ExerciseList } from './ExerciseList';
import type { AutomatoData, Exercicio } from '../../types';

const answerAutomaton: AutomatoData = {
    tipo: 'AFD',
    estados: [],
    transicoes: [],
};

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
        respostaAutomato: answerAutomaton,
        respostaTexto: 'Use dois estados para rastrear o último símbolo.',
        nivel: 'facil',
    }
];

describe('ExerciseList', () => {
    it('renderiza a lista e encaminha ações do cartão', () => {
        const onToggleHint = vi.fn();
        const onToggleAnswer = vi.fn();
        const onRevealNextHint = vi.fn();
        const onStartSolving = vi.fn();
        const onOpenSidebar = vi.fn();
        const onOpenConverter = vi.fn();

        render(
            <ExerciseList
                activeCategory="afd"
                activeCategoryLabel="AFDs"
                exercises={exercises}
                filteredExercises={exercises}
                completedInActiveCategory={0}
                revealedHintCounts={{}}
                revealedAnswers={{}}
                isExerciseCompleted={() => false}
                onToggleHint={onToggleHint}
                onRevealNextHint={onRevealNextHint}
                onToggleAnswer={onToggleAnswer}
                onStartSolving={onStartSolving}
                onOpenSidebar={onOpenSidebar}
                onOpenConverter={onOpenConverter}
            />
        );

        expect(screen.getByRole('heading', { name: 'AFDs' })).toHaveClass('text-2xl');
        expect(screen.queryByText('Lista de exercícios práticos')).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Abrir sumário de exercícios' }));
        fireEvent.click(screen.getByRole('button', { name: 'Abrir conversor de modelos' }));
        fireEvent.click(screen.getByRole('button', { name: /Tentar resolver/i }));
        fireEvent.click(screen.getByRole('button', { name: /Pistas \(2\)/i }));
        fireEvent.click(screen.getByRole('button', { name: /Apoio e gabarito/i }));

        expect(screen.getByText('Construção')).toBeInTheDocument();
        expect(screen.getByText('Estratégia')).toBeInTheDocument();
        expect(screen.getByText('Solução guiada')).toBeInTheDocument();
        expect(screen.getByText(/Construa um AFD/i).closest('[data-deferred-render="card"]')).not.toBeNull();
        expect(onOpenSidebar).toHaveBeenCalledTimes(1);
        expect(onOpenConverter).toHaveBeenCalledWith({});
        expect(onStartSolving).toHaveBeenCalledWith(1);
        expect(onToggleHint).toHaveBeenCalledWith(1);
        expect(onRevealNextHint).not.toHaveBeenCalled();
        expect(onToggleAnswer).toHaveBeenCalledWith(1);
    });

    it('libera pistas progressivamente em vez de mostrar todas de uma vez', () => {
        const onToggleHint = vi.fn();
        const onRevealNextHint = vi.fn();

        render(
            <ExerciseList
                activeCategory="afd"
                activeCategoryLabel="AFDs"
                exercises={exercises}
                filteredExercises={exercises}
                completedInActiveCategory={0}
                revealedHintCounts={{ 1: 1 }}
                revealedAnswers={{}}
                isExerciseCompleted={() => false}
                onToggleHint={onToggleHint}
                onRevealNextHint={onRevealNextHint}
                onToggleAnswer={vi.fn()}
                onStartSolving={vi.fn()}
                onOpenSidebar={vi.fn()}
                onOpenConverter={vi.fn()}
            />
        );

        expect(screen.getByText('Pista 1')).toBeInTheDocument();
        expect(screen.getByText('Pense no último símbolo lido.')).toBeInTheDocument();
        expect(screen.queryByText('Dois estados bastam para esse padrão.')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Liberar próxima pista' }));

        expect(onRevealNextHint).toHaveBeenCalledWith(1);
        expect(onToggleHint).not.toHaveBeenCalled();
    });

    it('abre apoio e gabarito recolhidos antes de carregar o autômato no solver', () => {
        const onStartSolving = vi.fn();

        render(
            <ExerciseList
                activeCategory="afd"
                activeCategoryLabel="AFDs"
                exercises={exercises}
                filteredExercises={exercises}
                completedInActiveCategory={0}
                revealedHintCounts={{}}
                revealedAnswers={{ 1: true }}
                isExerciseCompleted={() => false}
                onToggleHint={vi.fn()}
                onRevealNextHint={vi.fn()}
                onToggleAnswer={vi.fn()}
                onStartSolving={onStartSolving}
                onOpenSidebar={vi.fn()}
                onOpenConverter={vi.fn()}
            />
        );

        expect(screen.getByRole('button', { name: 'Gabarito final' })).toBeInTheDocument();
        expect(screen.queryByText('Gabarito visual')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Gabarito final' }));
        fireEvent.click(screen.getByRole('button', { name: /Carregar no canvas/i }));

        expect(onStartSolving).toHaveBeenCalledWith(1, { initialAutomaton: answerAutomaton });
    });

    it('mantém o caminho de volta para a aula quando veio da trilha teórica', () => {
        const onReturnToLesson = vi.fn();

        render(
            <ExerciseList
                activeCategory="afd"
                activeCategoryLabel="AFDs"
                exercises={exercises}
                filteredExercises={exercises}
                completedInActiveCategory={0}
                revealedHintCounts={{}}
                revealedAnswers={{}}
                isExerciseCompleted={() => false}
                onToggleHint={vi.fn()}
                onRevealNextHint={vi.fn()}
                onToggleAnswer={vi.fn()}
                onStartSolving={vi.fn()}
                onOpenSidebar={vi.fn()}
                onOpenConverter={vi.fn()}
                returnToLessonLabel="Projeto de AFDs"
                onReturnToLesson={onReturnToLesson}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Voltar à aula Projeto de AFDs' }));

        expect(onReturnToLesson).toHaveBeenCalledTimes(1);
    });

    it('mostra referências teóricas da categoria antes da prática', () => {
        const onOpenTheory = vi.fn();

        render(
            <ExerciseList
                activeCategory="afd"
                activeCategoryLabel="AFDs"
                exercises={exercises}
                filteredExercises={exercises}
                completedInActiveCategory={0}
                revealedHintCounts={{}}
                revealedAnswers={{}}
                isExerciseCompleted={() => false}
                onToggleHint={vi.fn()}
                onRevealNextHint={vi.fn()}
                onToggleAnswer={vi.fn()}
                onStartSolving={vi.fn()}
                onOpenSidebar={vi.fn()}
                onOpenConverter={vi.fn()}
                theoryLinks={[{
                    ref: 'Módulo 1 • Definição formal de AFD',
                    moduleId: 'mod1',
                    lessonId: 'l1-def',
                    label: 'Módulo 1 • Autômato Finito Determinístico'
                }]}
                onOpenTheory={onOpenTheory}
            />
        );

        expect(screen.getByText('Estude antes')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Módulo 1 • Autômato Finito Determinístico' }));

        expect(onOpenTheory).toHaveBeenCalledWith('mod1', 'l1-def');
    });

    it('mostra estado vazio quando o filtro não retorna itens', () => {
        render(
            <ExerciseList
                activeCategory="afd"
                activeCategoryLabel="AFDs"
                exercises={exercises}
                filteredExercises={[]}
                completedInActiveCategory={0}
                revealedHintCounts={{}}
                revealedAnswers={{}}
                isExerciseCompleted={() => false}
                onToggleHint={vi.fn()}
                onRevealNextHint={vi.fn()}
                onToggleAnswer={vi.fn()}
                onStartSolving={vi.fn()}
                onOpenSidebar={vi.fn()}
                onOpenConverter={vi.fn()}
            />
        );

        expect(screen.getByText('Nenhum exercício encontrado para esta busca.')).toBeInTheDocument();
    });
});
