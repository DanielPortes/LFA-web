import React from 'react';
import type { ContentBlockComponentProps } from './contentBlockShared';
import { renderMarkdown } from './contentBlockShared';

export const ContentTextBlock: React.FC<ContentBlockComponentProps> = ({ block }) => (
    <div className="lesson-prose animate-fade-in">
        {typeof block.content === 'string' ? renderMarkdown(block.content) : block.content}
    </div>
);
