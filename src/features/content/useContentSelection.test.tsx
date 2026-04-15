import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CourseModule } from '../../types';
import { useContentSelection } from './useContentSelection';

const modules: CourseModule[] = [
    {
        id: 'mod-1',
        title: 'Módulo 1',
        lessons: [
            {
                id: 'lesson-1',
                title: 'Introdução',
                description: 'Fundamentos iniciais',
                content: [{ type: 'text', content: 'Primeira lição' }]
            },
            {
                id: 'lesson-2',
                title: 'Fechos',
                description: 'Propriedades de fechamento',
                content: [{ type: 'text', content: 'Segunda lição' }]
            }
        ]
    },
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

describe('useContentSelection', () => {
    beforeEach(() => {
        const scrollContainer = document.createElement('div');
        scrollContainer.id = 'main-content-scroll';
        scrollContainer.scrollTo = vi.fn();
        Object.defineProperty(scrollContainer, 'scrollHeight', { value: 1000, configurable: true });
        Object.defineProperty(scrollContainer, 'clientHeight', { value: 400, configurable: true });
        document.body.innerHTML = '';
        document.body.appendChild(scrollContainer);
        window.scrollTo = vi.fn();
    });

    it('sincroniza seleção inicial, navegação e última lição visitada', () => {
        const markLessonVisited = vi.fn();
        const onSelectionChange = vi.fn();

        const { result } = renderHook(() => useContentSelection({
            modules,
            initialModuleId: 'mod-2',
            initialLessonId: 'lesson-3',
            lastVisitedLessonId: 'lesson-2',
            markLessonVisited,
            onSelectionChange
        }));

        expect(result.current.activeModuleId).toBe('mod-2');
        expect(result.current.activeLessonId).toBe('lesson-3');
        expect(result.current.totalLessons).toBe(3);
        expect(result.current.moduleIndex).toBe(2);
        expect(result.current.navigationState.prev).toEqual({
            modId: 'mod-1',
            lessonId: 'lesson-2'
        });
        expect(result.current.navigationState.next).toBeNull();
        expect(result.current.lastVisitedLesson?.lesson.id).toBe('lesson-2');
        expect(markLessonVisited).toHaveBeenCalledWith('lesson-3');
        expect(onSelectionChange).toHaveBeenCalledWith('mod-2', 'lesson-3');
    });

    it('filtra módulos pela busca e fecha a sidebar ao navegar', () => {
        const { result } = renderHook(() => useContentSelection({
            modules,
            markLessonVisited: vi.fn()
        }));

        act(() => {
            result.current.setSearchQuery('pilha');
        });

        expect(result.current.filteredModules).toHaveLength(1);
        expect(result.current.filteredModules[0].id).toBe('mod-2');

        act(() => {
            result.current.setSidebarOpen(true);
        });

        act(() => {
            result.current.handleNavigate('mod-1', 'lesson-2');
        });

        expect(result.current.activeModuleId).toBe('mod-1');
        expect(result.current.activeLessonId).toBe('lesson-2');
        expect(result.current.isSidebarOpen).toBe(false);
    });
});
