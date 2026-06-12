// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ContentSkeleton, ExercisesSkeleton, ModalSkeleton, SkeletonBlock } from './MotionSkeleton';

describe('MotionSkeleton', () => {
    it('renderiza blocos shimmer acessíveis como estado de carregamento', () => {
        render(<SkeletonBlock ariaLabel="Carregando cabeçalho" className="h-6 w-32" />);

        const block = screen.getByLabelText('Carregando cabeçalho');
        expect(block).toHaveClass('motion-shimmer');
        expect(block).toHaveAttribute('aria-busy', 'true');
    });

    it('oferece skeletons estruturados para áreas principais do app', () => {
        render(
            <>
                <ContentSkeleton />
                <ExercisesSkeleton />
                <ModalSkeleton label="Carregando conversor" />
            </>
        );

        expect(screen.getByLabelText('Carregando trilha de conteúdo')).toBeInTheDocument();
        expect(screen.getByLabelText('Carregando lista de exercícios')).toBeInTheDocument();
        expect(screen.getByLabelText('Carregando conversor')).toBeInTheDocument();
    });
});
