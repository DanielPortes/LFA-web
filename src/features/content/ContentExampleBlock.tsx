import React from 'react';
import {
    ArrowDown,
    LayoutList,
    Maximize2,
    Play
} from 'lucide-react';
import { AutomatonPreview } from '../../components/automaton/AutomatonPreview';
import type { AutomatoData } from '../../types';
import type { ContentBlockComponentProps } from './contentBlockShared';
import { renderMarkdown } from './contentBlockShared';

const PreviewCard = ({
    data,
    label,
    accentClassName,
    onExpand
}: {
    data: AutomatoData;
    label?: string;
    accentClassName: string;
    onExpand?: (data: AutomatoData) => void;
}) => (
    <div className="flex flex-col gap-3">
        {label && <div className={`ui-kicker text-center ${accentClassName}`}>{label}</div>}
        <div className={`h-72 bg-canvas rounded-2xl overflow-hidden relative shadow-inner group-hover:shadow-md transition-shadow ${accentClassName === 'text-ios-green' ? 'border-2 border-ios-green/20' : 'border border-default'}`}>
            {onExpand && (
                <div className="absolute top-2 right-2 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onExpand(data)}
                        className="p-2 bg-surface-2 hover:bg-surface-1 text-primary rounded-lg backdrop-blur-sm transition-colors border border-default"
                        title="Expandir visualização"
                        aria-label="Expandir visualização do autômato"
                    >
                        <Maximize2 size={16} />
                    </button>
                </div>
            )}
            <AutomatonPreview data={data} />
        </div>
    </div>
);

export const ContentExampleBlock: React.FC<ContentBlockComponentProps> = ({
    block,
    onSimulate,
    onExpand
}) => {
    const primaryAutomaton = block.automatoRef;
    const secondaryAutomaton = block.automatoRef2;

    return (
        <div className="my-10 animate-fade-in group">
            <div className="glass-card overflow-hidden border-2 border-transparent hover:border-ios-blue/20 transition-all duration-300">
                <div className="p-6 md:p-8 bg-gradient-to-b from-white/50 to-transparent dark:from-white/5">
                    <div className="flex justify-between items-start mb-6">
                        <h4 className="ui-kicker text-secondary flex items-center gap-2">
                            <LayoutList size={18} />
                            Exemplo Prático
                        </h4>

                        {primaryAutomaton && onSimulate && (
                            <button
                                onClick={() => onSimulate(primaryAutomaton)}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-ios-blue text-white text-xs font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30 active:scale-95"
                            >
                                <Play size={12} fill="currentColor" />
                                SIMULAR
                            </button>
                        )}
                    </div>

                    {block.title && <h5 className="text-2xl font-bold mb-4 text-primary">{block.title}</h5>}

                    <div className="text-secondary text-lg leading-relaxed mb-8 whitespace-pre-line">
                        {typeof block.content === 'string' ? renderMarkdown(block.content) : block.content}
                    </div>

                    <div className={`grid gap-6 ${secondaryAutomaton ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                        {primaryAutomaton && (
                            <PreviewCard
                                data={primaryAutomaton}
                                label={secondaryAutomaton ? 'Antes' : undefined}
                                accentClassName="text-secondary"
                                onExpand={onExpand}
                            />
                        )}

                        {secondaryAutomaton && (
                            <>
                                <div className="md:hidden flex justify-center text-muted"><ArrowDown /></div>
                                <PreviewCard
                                    data={secondaryAutomaton}
                                    label="Depois"
                                    accentClassName="text-ios-green"
                                    onExpand={onExpand}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
