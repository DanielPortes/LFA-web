import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ExerciseVerificationPanel } from './ExerciseVerificationPanel';
import type { Exercicio } from '../../types';

const pedagogicalExercise: Exercicio = {
    id: 7,
    pergunta: 'Construa um AFD para cadeias terminadas em a.',
    nivel: 'facil',
    dicas: [
        { id: 'hint-1', level: 1, text: 'Observe apenas o último símbolo lido.' },
        { id: 'hint-2', level: 2, text: 'Dois estados bastam: termina em a e não termina em a.' }
    ],
    estrategia: 'Modele a propriedade relevante como memória de um único símbolo.',
    guidedSolution: [
        {
            id: 'step-1',
            title: 'Escolha a memória mínima',
            explanation: 'O AFD só precisa lembrar se o último símbolo lido foi a.'
        }
    ],
    commonMistakes: [
        {
            id: 'mistake-1',
            title: 'Aceitar a palavra vazia',
            symptom: 'O estado inicial é marcado como final sem justificativa.',
            correction: 'O estado inicial só é final se a linguagem aceitar ε.'
        }
    ],
    metadata: {
        learningGoal: 'Modelar uma condição de sufixo em um AFD.',
        pattern: 'construction',
        theoryRefs: ['Módulo 1 • Definição formal de AFD'],
        recommendation: 'required'
    },
    respostaTexto: 'Use dois estados: q0 e q1.'
};

describe('ExerciseVerificationPanel', () => {
    it('renderiza testes e dispara ações principais', () => {
        const onToggleShowExpected = vi.fn();
        const onToggleFastVerify = vi.fn();
        const onVerify = vi.fn();
        const onOpenTheory = vi.fn();

        render(
            <ExerciseVerificationPanel
                exercise={pedagogicalExercise}
                onOpenTheory={onOpenTheory}
                solverMode="automaton"
                hasTests={true}
                tests={[
                    { input: 'abba', expected: 'accept' },
                    { input: '', expected: 'reject' },
                ]}
                showExpected={false}
                onToggleShowExpected={onToggleShowExpected}
                fastVerify={false}
                onToggleFastVerify={onToggleFastVerify}
                testResults={{ 0: 'pass', 1: 'fail' }}
                verifyDisabledReason={null}
                isVerifying={false}
                onVerify={onVerify}
                lastFailure={{
                    input: 'ε',
                    expected: 'Rejeita',
                    received: 'Aceita',
                    reason: 'Aceitou indevidamente a palavra vazia.'
                }}
                equivalenceStatus="fail"
                lastTrace={[
                    {
                        symbol: 'a',
                        fromStates: ['q0'],
                        directTargets: ['q1'],
                        toStates: ['q1'],
                        fromStacks: [['Z']],
                        toStacks: [['A', 'Z']],
                    },
                ]}
                formatStateList={(ids) => ids.join(', ')}
            />
        );

        expect(screen.queryByText('Verificação da solução')).not.toBeInTheDocument();
        expect(screen.queryByText('Bateria de testes')).not.toBeInTheDocument();
        expect(screen.getByText('1/2 OK')).toHaveClass('whitespace-nowrap');
        expect(screen.getByLabelText('1 de 2 testes aprovados')).toBeInTheDocument();
        expect(screen.queryByText(/entrada\(s\) configurada\(s\)/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Pronto para validar sua solução/i)).not.toBeInTheDocument();
        expect(screen.queryByText('Mostrar esperado')).not.toBeInTheDocument();
        expect(screen.queryByText('Modo animado')).not.toBeInTheDocument();
        expect(screen.queryByText('Canvas interativo')).not.toBeInTheDocument();
        expect(screen.getByText('Primeiro erro')).toBeInTheDocument();
        expect(screen.getByText('Equivalência DFA')).toBeInTheDocument();
        expect(screen.getByText('Traço de execução')).toBeInTheDocument();
        expect(screen.getByText('Pilha')).toBeInTheDocument();
        expect(screen.getByText('Z')).toBeInTheDocument();
        expect(screen.getByText('A Z')).toBeInTheDocument();
        expect(screen.getByText('Apoio de estudo')).toBeInTheDocument();
        expect(screen.queryByText(pedagogicalExercise.pergunta)).not.toBeInTheDocument();
        expect(screen.queryByText('Observe apenas o último símbolo lido.')).not.toBeInTheDocument();
        expect(screen.queryByText('Modelar uma condição de sufixo em um AFD.')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Dicas' }));
        fireEvent.click(screen.getByRole('button', { name: /Liberar pista 1/i }));
        fireEvent.click(screen.getByRole('button', { name: 'Estratégia' }));
        fireEvent.click(screen.getByRole('button', { name: 'Solução guiada' }));
        fireEvent.click(screen.getByRole('button', { name: 'Contexto e teoria' }));
        fireEvent.click(screen.getByRole('button', { name: 'Módulo 1 • Autômato Finito Determinístico' }));
        fireEvent.click(screen.getByRole('button', { name: /Mostrar resultados esperados/i }));
        fireEvent.click(screen.getByRole('button', { name: /Usar modo rápido/i }));
        fireEvent.click(screen.getByRole('button', { name: /Verificar solução/i }));

        expect(screen.getByText('Observe apenas o último símbolo lido.')).toBeInTheDocument();
        expect(screen.getByText('Modele a propriedade relevante como memória de um único símbolo.')).toBeInTheDocument();
        expect(screen.getByText('Escolha a memória mínima')).toBeInTheDocument();
        expect(screen.getByText('Modelar uma condição de sufixo em um AFD.')).toBeInTheDocument();
        expect(onOpenTheory).toHaveBeenCalledWith('mod1', 'l1-def');
        expect(onToggleShowExpected).toHaveBeenCalledTimes(1);
        expect(onToggleFastVerify).toHaveBeenCalledTimes(1);
        expect(onVerify).toHaveBeenCalledTimes(1);
    }, 15000);

    it('mostra estado conceitual quando não há testes', () => {
        render(
            <ExerciseVerificationPanel
                exercise={null}
                solverMode="text"
                hasTests={false}
                tests={[]}
                showExpected={false}
                onToggleShowExpected={vi.fn()}
                fastVerify={true}
                onToggleFastVerify={vi.fn()}
                testResults={{}}
                verifyDisabledReason="Este exercício não possui validação automática."
                isVerifying={false}
                onVerify={vi.fn()}
                lastFailure={null}
                equivalenceStatus={null}
                lastTrace={null}
                formatStateList={() => ''}
            />
        );

        expect(screen.getByText('Este exercício é conceitual. Compare sua solução com o gabarito quando terminar.')).toBeInTheDocument();
        expect(screen.getByText('Este exercício não possui validação automática.')).toBeInTheDocument();
    });
});
