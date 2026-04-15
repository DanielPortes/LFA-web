import React from 'react';
import { ListOrdered } from 'lucide-react';
import type { ContentBlockComponentProps } from './contentBlockShared';
import { renderMarkdown } from './contentBlockShared';

export const ContentAlgorithmBlock: React.FC<ContentBlockComponentProps> = ({ block }) => (
    <div className="my-8 glass-card rounded-2xl p-6 border border-default animate-fade-in">
        <h4 className="ui-title-4 text-primary mb-6 flex items-center gap-3">
            <div className="p-2 bg-ios-green/10 rounded-lg text-ios-green">
                <ListOrdered size={20} />
            </div>
            {block.title || 'Algoritmo'}
        </h4>
        <div className="space-y-4">
            {Array.isArray(block.content) ? block.content.map((step, index) => (
                <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/20 flex items-center justify-center font-bold text-sm text-secondary font-mono">
                        {index + 1}
                    </div>
                    <p className="pt-1 text-lg text-secondary">{renderMarkdown(step)}</p>
                </div>
            )) : <p>{typeof block.content === 'string' ? renderMarkdown(block.content) : block.content}</p>}
        </div>
    </div>
);
