import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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
            mode: 'regex'
        }
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
        expect(onSelectionChange).toHaveBeenCalledWith('er', null);
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
});
