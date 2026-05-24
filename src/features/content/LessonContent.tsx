import React from 'react';
import type { AutomatoData, ContentBlock } from '../../types';
import { ContentBlockRenderer } from './ContentBlockRenderer';

interface LessonContentProps {
    blocks: ContentBlock[];
    onSimulate?: (data: AutomatoData) => void;
    onExpand: (data: AutomatoData) => void;
    onOpenExercise?: (exerciseRef: string) => void;
}

export const LessonContent: React.FC<LessonContentProps> = ({
    blocks,
    onSimulate,
    onExpand,
    onOpenExercise
}) => (
    <article className="lesson-book-shell render-lite-shell">
        {blocks.map((block, index) => (
            <section
                key={`${block.type}-${index}-${block.title ?? 'content-block'}`}
                className="lesson-book-section"
                data-deferred-render="section"
            >
                <ContentBlockRenderer
                    block={block}
                    onSimulate={onSimulate}
                    onExpand={onExpand}
                    onOpenExercise={onOpenExercise}
                />
            </section>
        ))}
    </article>
);
