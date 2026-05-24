import React from 'react';
import {
    AlertTriangle,
    BookOpen,
    Calculator,
    CheckCircle,
    Lightbulb
} from 'lucide-react';
import type { ContentBlockComponentProps } from './contentBlockShared';
import { renderMarkdown } from './contentBlockShared';

export const ContentCalloutBlock: React.FC<ContentBlockComponentProps> = ({ block }) => {
    switch (block.type) {
        case 'definition':
            return (
                <div className="lesson-callout lesson-callout-definition my-8 animate-fade-in">
                    <h4 className="ui-kicker text-ios-blue mb-3 flex items-center gap-2">
                        <BookOpen size={16} />
                        Definição Formal
                    </h4>
                    <div className="whitespace-pre-line text-base font-medium leading-8 text-primary md:text-lg">
                        {block.title && <strong className="block mb-2 text-xl tracking-tight text-ios-blue dark:text-blue-300 md:text-2xl">{block.title}</strong>}
                        {typeof block.content === 'string' ? renderMarkdown(block.content) : block.content}
                    </div>
                </div>
            );
        case 'theorem':
            return (
                <div className="lesson-callout lesson-callout-theorem my-8 animate-fade-in">
                    <h4 className="ui-kicker text-ios-purple mb-3 flex items-center gap-2">
                        <CheckCircle size={16} />
                        Teorema
                    </h4>
                    <div className="font-serif text-lg leading-8 text-primary md:text-xl">
                        {block.title && <strong className="block mb-2 font-sans text-xl font-bold not-italic text-ios-purple dark:text-purple-300 md:text-2xl">{block.title}</strong>}
                        <span className="italic">{typeof block.content === 'string' ? renderMarkdown(block.content) : block.content}</span>
                    </div>
                </div>
            );
        case 'note':
            return (
                <div className="lesson-callout lesson-callout-note my-6 flex gap-4 animate-fade-in">
                    <div className="flex-shrink-0 mt-1">
                        <Lightbulb className="text-yellow-600 dark:text-yellow-400" size={24} />
                    </div>
                    <div>
                        <h4 className="ui-kicker text-yellow-700 dark:text-yellow-200 mb-1">{block.title || 'Nota do Professor'}</h4>
                        <p className="text-base leading-8 text-primary md:text-lg">{typeof block.content === 'string' ? renderMarkdown(block.content) : block.content}</p>
                    </div>
                </div>
            );
        case 'warning':
            return (
                <div className="lesson-callout lesson-callout-warning my-6 flex gap-4 animate-fade-in">
                    <div className="flex-shrink-0 mt-1 text-ios-red">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h4 className="ui-kicker text-ios-red dark:text-red-400 mb-1">
                            {block.title || 'Atenção!'}
                        </h4>
                        <p className="leading-8 text-primary">{typeof block.content === 'string' ? renderMarkdown(block.content) : block.content}</p>
                    </div>
                </div>
            );
        case 'math-tip':
            return (
                <div className="lesson-callout lesson-callout-math my-6 flex gap-4 animate-fade-in">
                    <div className="flex-shrink-0 mt-1 text-ios-indigo">
                        <Calculator size={24} />
                    </div>
                    <div>
                        <h4 className="ui-kicker text-ios-indigo dark:text-indigo-400 mb-1">
                            {block.title || 'Matematiquês'}
                        </h4>
                        <p className="text-primary font-mono text-sm leading-relaxed whitespace-pre-line">
                            {typeof block.content === 'string' ? renderMarkdown(block.content) : block.content}
                        </p>
                    </div>
                </div>
            );
        default:
            return null;
    }
};
