import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ExerciseVerificationPanel } from './ExerciseVerificationPanel';

describe('ExerciseVerificationPanel', () => {
    it('renderiza testes e dispara ações principais', () => {
        const onToggleShowExpected = vi.fn();
        const onToggleFastVerify = vi.fn();
        const onVerify = vi.fn();

        render(
            <ExerciseVerificationPanel
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
                    { symbol: 'a', fromStates: ['q0'], directTargets: ['q1'], toStates: ['q1'] },
                ]}
                formatStateList={(ids) => ids.join(', ')}
            />
        );

        expect(screen.getByText('Casos de teste')).toBeInTheDocument();
        expect(screen.getByText('Primeiro erro')).toBeInTheDocument();
        expect(screen.getByText('Equivalência DFA')).toBeInTheDocument();
        expect(screen.getByText('Traço de execução')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Mostrar esperado/i }));
        fireEvent.click(screen.getByRole('button', { name: /Normal/i }));
        fireEvent.click(screen.getByRole('button', { name: /Verificar solução/i }));

        expect(onToggleShowExpected).toHaveBeenCalledTimes(1);
        expect(onToggleFastVerify).toHaveBeenCalledTimes(1);
        expect(onVerify).toHaveBeenCalledTimes(1);
    });

    it('mostra estado conceitual quando não há testes', () => {
        render(
            <ExerciseVerificationPanel
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
