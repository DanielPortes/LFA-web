import React from 'react';
import type { ContentBlockComponentProps } from './contentBlockShared';
import { renderMarkdown } from './contentBlockShared';

export const ContentTextBlock: React.FC<ContentBlockComponentProps> = ({ block }) => (
    <div className="my-6 text-primary leading-8 text-lg animate-fade-in whitespace-pre-line text-justify font-medium">
        {typeof block.content === 'string' ? renderMarkdown(block.content) : block.content}
    </div>
);
