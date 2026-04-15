import React from 'react';
import type { ContentBlockComponentProps } from './contentBlockShared';
import { renderMarkdown } from './contentBlockShared';

export const ContentListBlock: React.FC<ContentBlockComponentProps> = ({ block }) => (
    <div className="my-8">
        {block.title && <h4 className="ui-title-4 text-primary mb-4 animate-fade-in">{block.title}</h4>}
        <ul className="grid gap-3">
            {(block.content as string[]).map((item, index) => (
                <li
                    key={index}
                    className="flex items-start gap-4 text-secondary glass-card p-4 rounded-xl border border-default hover:border-ios-blue/30 transition-colors animate-slide-in-up opacity-0"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                >
                    <div className="w-1.5 h-1.5 mt-2.5 rounded-full bg-ios-blue flex-shrink-0" />
                    <span className="leading-relaxed font-medium text-lg">{renderMarkdown(item)}</span>
                </li>
            ))}
        </ul>
    </div>
);
