import React from 'react';
import { ContentAlgorithmBlock } from './ContentAlgorithmBlock';
import { ContentCalloutBlock } from './ContentCalloutBlock';
import { ContentExampleBlock } from './ContentExampleBlock';
import { ContentInteractiveGrammarBlock } from './ContentInteractiveGrammarBlock';
import { ContentListBlock } from './ContentListBlock';
import { ContentPedagogicalBlock } from './ContentPedagogicalBlock';
import { ContentTextBlock } from './ContentTextBlock';
import type { ContentBlockComponentProps } from './contentBlockShared';

type ContentBlockRendererProps = ContentBlockComponentProps;

export const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = ({
    block,
    onSimulate,
    onExpand,
    onOpenExercise
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
        case 'comparison':
        case 'proof-outline':
        case 'common-mistake':
        case 'checkpoint':
        case 'mini-exercise':
        case 'exercise-solution-step':
        case 'reference':
        case 'summary':
            return <ContentPedagogicalBlock block={block} onOpenExercise={onOpenExercise} />;
        default:
            return <ContentTextBlock block={block} />;
    }
};
