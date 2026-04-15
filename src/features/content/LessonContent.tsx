import React from 'react';
import type { AutomatoData, ContentBlock } from '../../types';
import { ContentBlockRenderer } from './ContentBlockRenderer';

interface LessonContentProps {
    blocks: ContentBlock[];
    onSimulate?: (data: AutomatoData) => void;
    onExpand: (data: AutomatoData) => void;
}

export const LessonContent: React.FC<LessonContentProps> = ({
    blocks,
    onSimulate,
    onExpand
}) => (
    <div className="space-y-2">
        {blocks.map((block, index) => (
            <ContentBlockRenderer
                key={`${block.type}-${index}-${block.title ?? 'content-block'}`}
                block={block}
                onSimulate={onSimulate}
                onExpand={onExpand}
            />
        ))}
    </div>
);
