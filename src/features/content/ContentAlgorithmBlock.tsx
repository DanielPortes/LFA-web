import React from 'react';
import { ListOrdered } from 'lucide-react';
import type { ContentBlockComponentProps } from './contentBlockShared';
import { renderMarkdown } from './contentBlockShared';

export const ContentAlgorithmBlock: React.FC<ContentBlockComponentProps> = ({ block }) => (
    <div className="lesson-algorithm-block my-9 animate-fade-in">
        <h4 className="lesson-section-heading mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-ios-green/10 p-2 text-ios-green">
                <ListOrdered size={20} />
            </div>
            {block.title || 'Algoritmo'}
        </h4>
        <div className="space-y-4">
            {Array.isArray(block.content) ? block.content.map((step, index) => (
                <div key={index} className="flex gap-4">
                    <div className="surface-chip flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-black/10 font-mono text-sm font-bold text-secondary dark:border-white/20">
                        {index + 1}
                    </div>
                    <p className="pt-1 text-base leading-7 text-secondary md:text-lg">{renderMarkdown(step)}</p>
                </div>
            )) : <p>{typeof block.content === 'string' ? renderMarkdown(block.content) : block.content}</p>}
        </div>
    </div>
);
