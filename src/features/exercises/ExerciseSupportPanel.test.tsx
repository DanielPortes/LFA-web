// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Exercicio } from '../../types';
import { ExerciseSupportPanel } from './ExerciseSupportPanel';

const exercise: Exercicio = {
    id: 9,
    pergunta: 'Construa um AFD para cadeias terminadas em a.',
    nivel: 'medio',
    commonMistakes: [
        {
            id: 'mistake-final-state',
            title: 'Marcar final cedo demais',
            symptom: 'Você aceita cadeias antes de ler o último símbolo relevante.',
            correction: 'Atrase a aceitação até consumir a condição final da palavra.'
        },
        {
            id: 'mistake-sink-state',
            title: 'Ignorar estado de erro',
            symptom: 'Faltam transições para símbolos fora do caso favorável.',
            correction: 'Complete a função de transição com um estado sumidouro quando necessário.'
        }
    ],
    metadata: {
        learningGoal: 'Relacionar sufixo e memória de estado.',
        pattern: 'construction'
    }
};

describe('ExerciseSupportPanel', () => {
    it('apresenta ajuda como menu compacto de estudo, sem explicar a própria interface', () => {
        render(<ExerciseSupportPanel exercise={exercise} />);

        const panel = screen.getByTestId('exercise-support-panel');

        expect(panel).toBeInTheDocument();
        expect(panel).toHaveClass('bg-transparent');
        expect(panel).not.toHaveClass('rounded-[22px]');
        expect(panel).not.toHaveClass('shadow-sm');
        expect(screen.getByText('Apoio de estudo')).toBeInTheDocument();
        expect(screen.queryByText('Ajuda opcional')).not.toBeInTheDocument();
        expect(screen.queryByText(/Estratégia, teoria e gabarito/)).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Erros comuns' })).toBeInTheDocument();
    });

    it('não destaca erro comum arbitrário quando a falha não combina com nenhum diagnóstico', () => {
        render(
            <ExerciseSupportPanel
                exercise={exercise}
                lastFailure={{
                    input: 'abba',
                    expected: 'accept',
                    received: 'reject',
                    reason: 'Autômato não é equivalente ao gabarito.'
                }}
            />
        );

        expect(screen.getByRole('button', { name: 'Erros comuns' })).toBeInTheDocument();
        expect(screen.queryByText('Revisar')).not.toBeInTheDocument();
    });

    it('destaca o erro comum correspondente quando há diagnóstico compatível', () => {
        render(
            <ExerciseSupportPanel
                exercise={exercise}
                lastFailure={{
                    input: 'ba',
                    expected: 'accept',
                    received: 'reject',
                    reason: 'Faltam transições para símbolos fora do caso favorável.'
                }}
            />
        );

        expect(screen.getByText('Revisar')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Erros comuns' }));

        expect(screen.getByText('Ignorar estado de erro')).toBeInTheDocument();
        expect(screen.getByText('Revise primeiro')).toBeInTheDocument();
    });

    it('mantém contexto e teoria recolhidos por padrão', () => {
        render(<ExerciseSupportPanel exercise={exercise} />);

        expect(screen.queryByText('Relacionar sufixo e memória de estado.')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Contexto e teoria' }));

        expect(screen.getByText('Relacionar sufixo e memória de estado.')).toBeInTheDocument();
    });
});
