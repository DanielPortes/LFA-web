import React from 'react';
import type { AutomatoData, ContentBlock } from '../../types';

export interface ContentBlockComponentProps {
    block: ContentBlock;
    onSimulate?: (data: AutomatoData) => void;
    onExpand?: (data: AutomatoData) => void;
    onOpenExercise?: (exerciseRef: string) => void;
}

export const renderMarkdown = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*.+?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};
