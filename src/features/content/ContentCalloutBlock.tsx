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
                <div className="my-8 p-6 glass-card border-l-[6px] border-l-ios-blue rounded-r-2xl animate-fade-in transition-all hover:shadow-apple-lg">
                    <h4 className="ui-kicker text-ios-blue mb-3 flex items-center gap-2">
                        <BookOpen size={16} />
                        Definição Formal
                    </h4>
                    <div className="text-lg font-medium text-primary whitespace-pre-line leading-relaxed">
                        {block.title && <strong className="block mb-2 text-2xl tracking-tight text-ios-blue dark:text-blue-300">{block.title}</strong>}
                        {typeof block.content === 'string' ? renderMarkdown(block.content) : block.content}
                    </div>
                </div>
            );
        case 'theorem':
            return (
                <div className="my-8 relative overflow-hidden rounded-2xl border border-purple-200/60 dark:border-purple-500/30 glass-card p-8 animate-fade-in">
                    <div className="absolute top-0 left-0 w-1 h-full bg-ios-purple/50"></div>
                    <h4 className="ui-kicker text-ios-purple mb-3 flex items-center gap-2">
                        <CheckCircle size={16} />
                        Teorema
                    </h4>
                    <div className="font-serif text-xl text-primary leading-relaxed">
                        {block.title && <strong className="block mb-2 not-italic font-sans font-bold text-2xl text-ios-purple dark:text-purple-300">{block.title}</strong>}
                        <span className="italic">{typeof block.content === 'string' ? renderMarkdown(block.content) : block.content}</span>
                    </div>
                </div>
            );
        case 'note':
            return (
                <div className="my-6 p-5 glass-card rounded-xl border border-yellow-300/50 dark:border-yellow-700/30 flex gap-4 animate-fade-in">
                    <div className="flex-shrink-0 mt-1">
                        <Lightbulb className="text-yellow-600 dark:text-yellow-400" size={24} />
                    </div>
                    <div>
                        <h4 className="ui-kicker text-yellow-700 dark:text-yellow-200 mb-1">{block.title || 'Nota do Professor'}</h4>
                        <p className="text-primary text-lg leading-relaxed">{typeof block.content === 'string' ? renderMarkdown(block.content) : block.content}</p>
                    </div>
                </div>
            );
        case 'warning':
            return (
                <div className="my-6 p-5 rounded-xl border border-red-300/50 dark:border-red-500/30 glass-card flex gap-4 animate-fade-in">
                    <div className="flex-shrink-0 mt-1 text-ios-red">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h4 className="ui-kicker text-ios-red dark:text-red-400 mb-1">
                            {block.title || 'Atenção!'}
                        </h4>
                        <p className="text-primary leading-relaxed">{typeof block.content === 'string' ? renderMarkdown(block.content) : block.content}</p>
                    </div>
                </div>
            );
        case 'math-tip':
            return (
                <div className="my-6 p-5 rounded-xl border border-indigo-300/50 dark:border-indigo-500/30 glass-card flex gap-4 animate-fade-in">
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
