// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LessonHeader } from './LessonHeader';

const baseProps = {
    lessonTitle: 'Exemplo: a^n b^n',
    lessonDescription: 'Pilha para contar e comparar.',
    isSidebarOpen: false,
    sidebarId: 'content-sidebar',
    onOpenSidebar: vi.fn(),
};

describe('LessonHeader', () => {
    it('usa o número canônico do título do módulo em vez do índice visual da lista', () => {
        render(
            <LessonHeader
                {...baseProps}
                moduleIndex={12}
                moduleTitle="Módulo 11: Automatos de Pilha (AP)"
            />
        );

        expect(screen.getByText('Módulo 11')).toBeInTheDocument();
        expect(screen.queryByText('Módulo 12')).not.toBeInTheDocument();
    });
});
