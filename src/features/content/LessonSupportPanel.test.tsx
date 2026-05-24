import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ResolvedExerciseLink } from '../../data/learningConnections';
import { LessonSupportPanel } from './LessonSupportPanel';

const relatedExercises: ResolvedExerciseLink[] = [
    {
        ref: 'afd:5',
        categoryId: 'afd',
        categoryLabel: 'AFDs',
        exerciseId: 5,
        question: 'Construa um AFD para L = { w | w contém a substring "abb" }.',
        level: 'medio'
    }
];

describe('LessonSupportPanel', () => {
    it('renderiza resumo, erros comuns e exercícios relacionados', () => {
        const onOpenExercise = vi.fn();

        render(
            <LessonSupportPanel
                summary={[{ id: 'sum-1', text: 'Resumo rápido da lição.' }]}
                commonMistakes={[
                    {
                        title: 'Erro clássico',
                        explanation: 'Confundir estado final com progresso parcial.',
                        correction: 'Cheque a condição de aceitação antes de marcar finais.'
                    }
                ]}
                relatedExercises={relatedExercises}
                onOpenExercise={onOpenExercise}
            />
        );

        expect(screen.getByText('Prática associada')).toBeInTheDocument();
        expect(screen.getByText('Resumo para revisão')).toBeInTheDocument();
        expect(screen.getByText('Erros comuns')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Tentar resolver' }));

        expect(onOpenExercise).toHaveBeenCalledWith('afd', 5);
    });
});
