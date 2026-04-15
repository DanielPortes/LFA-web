import React from 'react';
import { ContentAlgorithmBlock } from './ContentAlgorithmBlock';
import { ContentCalloutBlock } from './ContentCalloutBlock';
import { ContentExampleBlock } from './ContentExampleBlock';
import { ContentInteractiveGrammarBlock } from './ContentInteractiveGrammarBlock';
import { ContentListBlock } from './ContentListBlock';
import { ContentTextBlock } from './ContentTextBlock';
import type { ContentBlockComponentProps } from './contentBlockShared';

type ContentBlockRendererProps = ContentBlockComponentProps;

export const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = ({
    block,
    onSimulate,
    onExpand
}) => {
    switch (block.type) {
        case 'definition':
        case 'theorem':
        case 'note':
        case 'warning':
        case 'math-tip':
            return <ContentCalloutBlock block={block} />;
        case 'algorithm':
            return <ContentAlgorithmBlock block={block} />;
        case 'example':
            return <ContentExampleBlock block={block} onSimulate={onSimulate} onExpand={onExpand} />;
        case 'list':
            return <ContentListBlock block={block} />;
        case 'interactive-grammar':
            return <ContentInteractiveGrammarBlock block={block} />;
        default:
            return <ContentTextBlock block={block} />;
    }
};
