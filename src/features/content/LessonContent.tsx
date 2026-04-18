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
    <div className="render-lite-shell space-y-2">
        {blocks.map((block, index) => (
            <div
                key={`${block.type}-${index}-${block.title ?? 'content-block'}`}
                data-deferred-render="section"
            >
                <ContentBlockRenderer
                    block={block}
                    onSimulate={onSimulate}
                    onExpand={onExpand}
                    onOpenExercise={onOpenExercise}
                />
            </div>
        ))}
    </div>
);
