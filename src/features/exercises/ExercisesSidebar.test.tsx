// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ExercisesSidebar } from './ExercisesSidebar';

describe('ExercisesSidebar', () => {
    it('mostra o alvo da busca e confirma o filtro com Enter', () => {
        const onSearchSubmit = vi.fn();

        render(
            <ExercisesSidebar
                sidebarId="exercicios-sidebar"
                isSidebarOpen={false}
                searchInputId="search-ex"
                searchQuery="sufixo obrigatório"
                onSearchChange={vi.fn()}
                onSearchSubmit={onSearchSubmit}
                onMoveSearchResult={vi.fn()}
                firstSearchResult={{
                    categoryId: 'er',
                    categoryLabel: 'Regex',
                    exerciseId: 2,
                    question: 'Descreva a linguagem por expressão regular.',
                    resultCount: 1
                }}
                activeSearchResult={{
                    categoryId: 'er',
                    categoryLabel: 'Regex',
                    exerciseId: 2,
                    question: 'Descreva a linguagem por expressão regular.',
                    resultCount: 1
                }}
                searchResultPosition={{ current: 1, total: 1 }}
                progressPercent={20}
                completedExercisesCount={2}
                totalExercisesCount={10}
                onResetExercises={vi.fn()}
                items={[{ id: 'er', label: 'Regex', index: 5, total: 1, completed: 0 }]}
                activeCategory="afd"
                onSelectCategory={vi.fn()}
            />
        );

        const targetCopy = screen.getByText('filtra: Exercício 2 · Regex');
        expect(targetCopy).toBeInTheDocument();
        expect(targetCopy).toHaveClass('search-target-copy');
        expect(targetCopy.closest('.search-target-shell')).toBeInTheDocument();
        expect(screen.getByText('1/1')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Regex/ })).toHaveClass('search-target-row');
        expect(screen.getByText('alvo')).toBeInTheDocument();

        fireEvent.keyDown(screen.getByLabelText('Buscar exercício'), { key: 'Enter' });

        expect(onSearchSubmit).toHaveBeenCalledTimes(1);
    });

    it('usa setas do teclado para trocar o destino da busca', () => {
        const onMoveSearchResult = vi.fn();

        render(
            <ExercisesSidebar
                sidebarId="exercicios-sidebar"
                isSidebarOpen={false}
                searchInputId="search-ex"
                searchQuery="afd"
                onSearchChange={vi.fn()}
                onSearchSubmit={vi.fn()}
                onMoveSearchResult={onMoveSearchResult}
                firstSearchResult={null}
                activeSearchResult={{
                    categoryId: 'afd',
                    categoryLabel: 'AFDs',
                    exerciseId: 5,
                    question: 'Construa um AFD.',
                    resultCount: 2
                }}
                searchResultPosition={{ current: 2, total: 2 }}
                progressPercent={20}
                completedExercisesCount={2}
                totalExercisesCount={10}
                onResetExercises={vi.fn()}
                items={[{ id: 'afd', label: 'AFDs', index: 1, total: 2, completed: 0 }]}
                activeCategory="afd"
                onSelectCategory={vi.fn()}
            />
        );

        fireEvent.keyDown(screen.getByLabelText('Buscar exercício'), { key: 'ArrowDown' });
        fireEvent.keyDown(screen.getByLabelText('Buscar exercício'), { key: 'ArrowUp' });

        expect(onMoveSearchResult).toHaveBeenNthCalledWith(1, 1);
        expect(onMoveSearchResult).toHaveBeenNthCalledWith(2, -1);
    });

    it('mostra categoria como alvo quando a busca bate no nome da categoria', () => {
        render(
            <ExercisesSidebar
                sidebarId="exercicios-sidebar"
                isSidebarOpen={false}
                searchInputId="search-ex"
                searchQuery="regex"
                onSearchChange={vi.fn()}
                onSearchSubmit={vi.fn()}
                onMoveSearchResult={vi.fn()}
                firstSearchResult={{
                    categoryId: 'er',
                    categoryLabel: 'Regex',
                    exerciseId: null,
                    question: 'Regex',
                    resultCount: 1
                }}
                activeSearchResult={{
                    categoryId: 'er',
                    categoryLabel: 'Regex',
                    exerciseId: null,
                    question: 'Regex',
                    resultCount: 1
                }}
                searchResultPosition={{ current: 1, total: 1 }}
                progressPercent={20}
                completedExercisesCount={2}
                totalExercisesCount={10}
                onResetExercises={vi.fn()}
                items={[{ id: 'er', label: 'Regex', index: 5, total: 1, completed: 0 }]}
                activeCategory="afd"
                onSelectCategory={vi.fn()}
            />
        );

        expect(screen.getByText('filtra: Regex')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Regex/ })).toHaveClass('search-target-row');
    });

    it('mostra um botão para limpar a busca somente quando há texto preenchido', () => {
        const onSearchChange = vi.fn();
        const props = {
            sidebarId: 'exercicios-sidebar',
            isSidebarOpen: false,
            searchInputId: 'search-ex',
            onSearchChange,
            onSearchSubmit: vi.fn(),
            onMoveSearchResult: vi.fn(),
            firstSearchResult: null,
            activeSearchResult: null,
            searchResultPosition: null,
            progressPercent: 20,
            completedExercisesCount: 2,
            totalExercisesCount: 10,
            onResetExercises: vi.fn(),
            items: [{ id: 'afd', label: 'AFDs', index: 1, total: 2, completed: 0 }],
            activeCategory: 'afd',
            onSelectCategory: vi.fn(),
        };

        const { rerender } = render(
            <ExercisesSidebar
                {...props}
                searchQuery=""
            />
        );

        expect(screen.queryByRole('button', { name: 'Limpar busca de exercício' })).not.toBeInTheDocument();

        rerender(
            <ExercisesSidebar
                {...props}
                searchQuery="afd"
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Limpar busca de exercício' }));

        expect(onSearchChange).toHaveBeenCalledWith('');
    });
});
