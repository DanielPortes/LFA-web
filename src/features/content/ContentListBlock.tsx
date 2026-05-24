import React from 'react';
import type { ContentBlockComponentProps } from './contentBlockShared';
import { renderMarkdown } from './contentBlockShared';

export const ContentListBlock: React.FC<ContentBlockComponentProps> = ({ block }) => (
    <div className="lesson-list-block my-8">
        {block.title && <h4 className="lesson-section-heading animate-fade-in">{block.title}</h4>}
        <ul className="space-y-3">
            {(block.content as string[]).map((item, index) => (
                <li
                    key={index}
                    className="lesson-list-item flex items-start gap-4 text-secondary animate-slide-in-up opacity-0"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                >
                    <div className="mt-3 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ios-blue" />
                    <span className="leading-8">{renderMarkdown(item)}</span>
                </li>
            ))}
        </ul>
    </div>
);
