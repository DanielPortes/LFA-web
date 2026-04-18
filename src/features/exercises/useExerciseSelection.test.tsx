// @vitest-environment jsdom

import { useState } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AutomatoData } from '../../types';
import type { ExerciseDatabase } from './types';
import { useExerciseSelection } from './useExerciseSelection';

const exerciseDatabase: ExerciseDatabase = {
    afd: [
        {
            id: 1,
            pergunta: 'Construa um AFD para palavras que terminam com a.',
            nivel: 'facil',
            mode: 'automaton',
            tipo: 'AFD'
        }
    ],
    er: [
        {
            id: 2,
            pergunta: 'Descreva a linguagem por expressão regular.',
            nivel: 'medio',
            mode: 'regex',
            estrategia: 'Separe a solução em prefixo livre e sufixo obrigatório.',
            metadata: {
                learningGoal: 'Modelar um sufixo em expressão regular.',
                pattern: 'construction',
                theoryRefs: ['Módulo 3 • Padrões de sufixo']
            }
        }
    ]
};

const attemptAutomaton: AutomatoData = {
    tipo: 'AFD',
    estados: [
        { id: 's0', label: 's0', x: 80, y: 80, isInicial: true, isFinal: false }
    ],
    transicoes: []
};

const answerAutomaton: AutomatoData = {
    tipo: 'AFD',
    estados: [
        { id: 'q0', label: 'q0', x: 120, y: 120, isInicial: true, isFinal: false },
        { id: 'q1', label: 'q1', x: 240, y: 120, isInicial: false, isFinal: true }
    ],
    transicoes: [
        { id: 't0', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 }
    ]
};

describe('useExerciseSelection', () => {
    it('sincroniza categoria inicial e abre o exercício indicado pela rota', () => {
        const setLastCategory = vi.fn();
        const onSelectionChange = vi.fn();

        const { result } = renderHook(() => useExerciseSelection({
            exerciseDatabase,
            initialCategoryId: 'er',
            initialExerciseId: 2,
            setLastCategory,
            onSelectionChange
        }));

        expect(result.current.activeCategory).toBe('er');
        expect(result.current.currentExercise?.id).toBe(2);
        expect(result.current.solverMode).toBe('regex');
        expect(result.current.exercises).toHaveLength(1);
        expect(result.current.filteredExercises).toHaveLength(1);
        expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it('filtra exercícios e categorias e fecha a sidebar ao trocar a categoria', () => {
        const { result } = renderHook(() => useExerciseSelection({
            exerciseDatabase,
            setLastCategory: vi.fn()
        }));

        act(() => {
            result.current.setSearchQuery('regex');
        });

        expect(result.current.filteredExercises).toHaveLength(0);
        expect(result.current.filteredCategories.map((category) => category.id)).toEqual(['er']);

        act(() => {
            result.current.setSidebarOpen(true);
        });

        act(() => {
            result.current.handleCategorySelect('er');
        });

        expect(result.current.activeCategory).toBe('er');
        expect(result.current.isSidebarOpen).toBe(false);
        expect(result.current.exercises).toHaveLength(1);
    });

    it('busca também em estratégia e metadados pedagógicos', () => {
        const { result } = renderHook(() => useExerciseSelection({
            exerciseDatabase,
            initialCategoryId: 'er',
            setLastCategory: vi.fn()
        }));

        act(() => {
            result.current.setSearchQuery('sufixo obrigatório');
        });

        expect(result.current.filteredExercises).toHaveLength(1);
        expect(result.current.filteredExercises[0]?.id).toBe(2);
        expect(result.current.activeCategory).toBe('er');
    });

    it('estabiliza a rota ao consumir uma seleção inicial vinda da URL', async () => {
        const setLastCategory = vi.fn();

        const { result } = renderHook(() => {
            const [routeSelection, setRouteSelection] = useState<{
                categoryId?: string;
                exerciseId: number | null;
            }>({
                categoryId: 'er',
                exerciseId: 2
            });

            const selection = useExerciseSelection({
                exerciseDatabase,
                initialCategoryId: routeSelection.categoryId,
                initialExerciseId: routeSelection.exerciseId,
                setLastCategory,
                onSelectionChange: (categoryId, exerciseId) => {
                    setRouteSelection((previous) => (
                        previous.categoryId === categoryId && previous.exerciseId === exerciseId
                            ? previous
                            : { categoryId, exerciseId }
                    ));
                }
            });

            return {
                routeSelection,
                selection
            };
        });

        await waitFor(() => {
            expect(result.current.selection.solvingExercise).toBe(2);
            expect(result.current.routeSelection).toEqual({
                categoryId: 'er',
                exerciseId: 2
            });
        });
    });

    it('permite trocar de categoria quando a URL ainda aponta para a categoria anterior', async () => {
        const setLastCategory = vi.fn();

        const { result } = renderHook(() => {
            const [routeSelection, setRouteSelection] = useState<{
                categoryId?: string;
                exerciseId: number | null;
            }>({
                categoryId: 'afd',
                exerciseId: null
            });

            const selection = useExerciseSelection({
                exerciseDatabase,
                initialCategoryId: routeSelection.categoryId,
                initialExerciseId: routeSelection.exerciseId,
                setLastCategory,
                onSelectionChange: (categoryId, exerciseId) => {
                    setRouteSelection((previous) => (
                        previous.categoryId === categoryId && previous.exerciseId === exerciseId
                            ? previous
                            : { categoryId, exerciseId }
                    ));
                }
            });

            return {
                routeSelection,
                selection
            };
        });

        act(() => {
            result.current.selection.handleCategorySelect('er');
        });

        await waitFor(() => {
            expect(result.current.selection.activeCategory).toBe('er');
            expect(result.current.routeSelection).toEqual({
                categoryId: 'er',
                exerciseId: null
            });
        });
    });

    it('gera uma nova sessão de editor ao alternar entre tentativa e gabarito', () => {
        const { result } = renderHook(() => useExerciseSelection({
            exerciseDatabase,
            setLastCategory: vi.fn()
        }));

        act(() => {
            result.current.startSolving(1, { initialAutomaton: attemptAutomaton });
        });

        expect(result.current.editorSessionKey).toBe(1);
        expect(result.current.userAutomaton).toMatchObject(attemptAutomaton);

        act(() => {
            result.current.loadAnswerAutomaton(answerAutomaton);
        });

        expect(result.current.editorSessionKey).toBe(2);
        expect(result.current.isViewingAnswerAutomaton).toBe(true);
        expect(result.current.savedAttemptAutomaton).toMatchObject(attemptAutomaton);
        expect(result.current.userAutomaton).toMatchObject(answerAutomaton);

        act(() => {
            result.current.restoreSavedAttempt();
        });

        expect(result.current.editorSessionKey).toBe(3);
        expect(result.current.isViewingAnswerAutomaton).toBe(false);
        expect(result.current.userAutomaton).toMatchObject(attemptAutomaton);
    });
});
