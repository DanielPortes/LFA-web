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
                isLessonMarkedForReview={() => false}
                onMarkLessonCompleted={vi.fn()}
                onToggleLessonReview={vi.fn()}
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
                isLessonMarkedForReview={() => false}
                onMarkLessonCompleted={vi.fn()}
                onToggleLessonReview={vi.fn()}
                onNavigate={vi.fn()}
            />
        );

        fireEvent.keyDown(screen.getByLabelText('Buscar conceito na trilha'), { key: 'ArrowDown' });
        fireEvent.keyDown(screen.getByLabelText('Buscar conceito na trilha'), { key: 'ArrowUp' });

        expect(onMoveSearchResult).toHaveBeenNthCalledWith(1, 1);
        expect(onMoveSearchResult).toHaveBeenNthCalledWith(2, -1);
    });

    it('abre menu de contexto da aula para concluir ou marcar revisão', () => {
        const onMarkLessonCompleted = vi.fn();
        const onToggleLessonReview = vi.fn();

        render(
            <ContentSidebar
                sidebarId="conteudo-sidebar"
                isSidebarOpen={false}
                progressPercent={10}
                onResetProgress={vi.fn()}
                lastVisitedLesson={null}
                activeLessonId="lesson-1"
                onContinue={vi.fn()}
                searchQuery=""
                onSearchChange={vi.fn()}
                onSearchSubmit={vi.fn()}
                onMoveSearchResult={vi.fn()}
                firstSearchResult={null}
                activeSearchResult={null}
                searchResultPosition={null}
                filteredModules={modules}
                isLessonCompleted={() => false}
                isLessonMarkedForReview={() => false}
                onMarkLessonCompleted={onMarkLessonCompleted}
                onToggleLessonReview={onToggleLessonReview}
                onNavigate={vi.fn()}
            />
        );

        fireEvent.contextMenu(screen.getByRole('button', { name: /Pilhas/ }), {
            clientX: 120,
            clientY: 160
        });

        fireEvent.click(screen.getByRole('button', { name: 'Marcar como concluída' }));
        expect(onMarkLessonCompleted).toHaveBeenCalledWith('lesson-3');

        fireEvent.contextMenu(screen.getByRole('button', { name: /Pilhas/ }), {
            clientX: 120,
            clientY: 160
        });
        fireEvent.click(screen.getByRole('button', { name: 'Marcar para revisar' }));

        expect(onToggleLessonReview).toHaveBeenCalledWith('lesson-3');
    });

    it('mostra indicador claro quando a aula está marcada para revisão', () => {
        render(
            <ContentSidebar
                sidebarId="conteudo-sidebar"
                isSidebarOpen={false}
                progressPercent={10}
                onResetProgress={vi.fn()}
                lastVisitedLesson={null}
                activeLessonId="lesson-1"
                onContinue={vi.fn()}
                searchQuery=""
                onSearchChange={vi.fn()}
                onSearchSubmit={vi.fn()}
                onMoveSearchResult={vi.fn()}
                firstSearchResult={null}
                activeSearchResult={null}
                searchResultPosition={null}
                filteredModules={modules}
                isLessonCompleted={() => false}
                isLessonMarkedForReview={(lessonId) => lessonId === 'lesson-3'}
                onMarkLessonCompleted={vi.fn()}
                onToggleLessonReview={vi.fn()}
                onNavigate={vi.fn()}
            />
        );

        expect(screen.getByText('Revisar')).toBeInTheDocument();
    });
});
