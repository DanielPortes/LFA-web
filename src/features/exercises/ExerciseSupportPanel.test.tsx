// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
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

        expect(screen.queryByText('Revise primeiro')).not.toBeInTheDocument();
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

        expect(screen.getByText('Revise primeiro')).toBeInTheDocument();
        expect(screen.getByText('Ignorar estado de erro')).toBeInTheDocument();
    });
});
