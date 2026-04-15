import React from 'react';
import { LayoutList } from 'lucide-react';
import { DerivationTreeVisualizer } from '../../components/ui';
import type { ContentBlockComponentProps } from './contentBlockShared';
import { renderMarkdown } from './contentBlockShared';

export const ContentInteractiveGrammarBlock: React.FC<ContentBlockComponentProps> = ({ block }) => (
    <div className="my-10 animate-fade-in">
        <div className="glass-card overflow-hidden border border-default">
            <div className="p-6 bg-gradient-to-b from-white/50 to-transparent dark:from-white/5">
                <h4 className="ui-kicker text-secondary flex items-center gap-2 mb-4">
                    <LayoutList size={18} />
                    Visualização Interativa
                </h4>
                {block.title && <h5 className="text-2xl font-bold mb-4 text-primary">{block.title}</h5>}
                {block.content && <p className="text-secondary mb-6">{typeof block.content === 'string' ? renderMarkdown(block.content) : block.content}</p>}

                {block.grammarTreeData && (
                    <div className="rounded-xl border border-default bg-surface-1 overflow-hidden">
                        <DerivationTreeVisualizer tree={block.grammarTreeData} autoPlay={false} />
                    </div>
                )}
            </div>
        </div>
    </div>
);
