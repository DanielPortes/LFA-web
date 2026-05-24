// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CourseModule } from '../../types';
import { ContentSidebar } from './ContentSidebar';

const modules: CourseModule[] = [
    {
        id: 'mod-2',
        title: 'Módulo 2',
        lessons: [
            {
                id: 'lesson-3',
                title: 'Pilhas',
                description: 'Autômatos com pilha',
                content: [{ type: 'text', content: 'Terceira lição' }]
            }
        ]
    }
];

describe('ContentSidebar', () => {
    it('mostra o destino que será aberto ao confirmar a busca', () => {
        render(
            <ContentSidebar
                sidebarId="conteudo-sidebar"
                isSidebarOpen={false}
                progressPercent={10}
                onResetProgress={vi.fn()}
                lastVisitedLesson={null}
                activeLessonId="lesson-1"
                onContinue={vi.fn()}
                searchQuery="pilha"
                onSearchChange={vi.fn()}
                onSearchSubmit={vi.fn()}
                onMoveSearchResult={vi.fn()}
                firstSearchResult={{
                    moduleId: 'mod-2',
                    lessonId: 'lesson-3',
                    moduleTitle: 'Módulo 2',
                    lessonTitle: 'Pilhas',
                    resultCount: 1
                }}
                activeSearchResult={{
                    moduleId: 'mod-2',
                    lessonId: 'lesson-3',
                    moduleTitle: 'Módulo 2',
                    lessonTitle: 'Pilhas',
                    resultCount: 1
                }}
                searchResultPosition={{ current: 1, total: 1 }}
                filteredModules={modules}
                isLessonCompleted={() => false}
                onNavigate={vi.fn()}
            />
        );

        const targetCopy = screen.getByText('abre: Pilhas');
        expect(targetCopy).toBeInTheDocument();
        expect(targetCopy).toHaveClass('search-target-copy');
        expect(targetCopy.closest('.search-target-shell')).toBeInTheDocument();
        expect(screen.getByText('1/1')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Pilhas/ })).toHaveClass('search-target-row');
    });

    it('usa setas do teclado para trocar o destino da busca', () => {
        const onMoveSearchResult = vi.fn();

        render(
            <ContentSidebar
                sidebarId="conteudo-sidebar"
                isSidebarOpen={false}
                progressPercent={10}
                onResetProgress={vi.fn()}
                lastVisitedLesson={null}
                activeLessonId="lesson-1"
                onContinue={vi.fn()}
                searchQuery="lição"
                onSearchChange={vi.fn()}
                onSearchSubmit={vi.fn()}
                onMoveSearchResult={onMoveSearchResult}
                firstSearchResult={null}
                activeSearchResult={{
                    moduleId: 'mod-2',
                    lessonId: 'lesson-3',
                    moduleTitle: 'Módulo 2',
                    lessonTitle: 'Pilhas',
                    resultCount: 3
                }}
                searchResultPosition={{ current: 2, total: 3 }}
                filteredModules={modules}
                isLessonCompleted={() => false}
                onNavigate={vi.fn()}
            />
        );

        fireEvent.keyDown(screen.getByLabelText('Buscar conceito na trilha'), { key: 'ArrowDown' });
        fireEvent.keyDown(screen.getByLabelText('Buscar conceito na trilha'), { key: 'ArrowUp' });

        expect(onMoveSearchResult).toHaveBeenNthCalledWith(1, 1);
        expect(onMoveSearchResult).toHaveBeenNthCalledWith(2, -1);
    });
});
