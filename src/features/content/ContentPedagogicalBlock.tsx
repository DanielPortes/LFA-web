import React from 'react';
import {
    AlertTriangle,
    ArrowRightLeft,
    BookOpen,
    CheckCircle2,
    Lightbulb,
    Pencil
} from 'lucide-react';
import { resolveExerciseRefs } from '../../data/learningConnections';
import type { ContentBlockTypeValue } from '../../types';
import type { ContentBlockComponentProps } from './contentBlockShared';
import { renderMarkdown } from './contentBlockShared';

type PedagogicalBlockType = Extract<
    ContentBlockTypeValue,
    | 'comparison'
    | 'proof-outline'
    | 'common-mistake'
    | 'checkpoint'
    | 'mini-exercise'
    | 'exercise-solution-step'
    | 'reference'
    | 'summary'
>;

const blockConfig: Record<
    PedagogicalBlockType,
    {
        kicker: string;
        icon: React.ComponentType<{ size?: number; className?: string }>;
        wrapperClassName: string;
        kickerClassName: string;
    }
> = {
    comparison: {
        kicker: 'Comparação guiada',
        icon: ArrowRightLeft,
        wrapperClassName: 'my-8 rounded-2xl border border-default bg-surface-muted/80 p-6',
        kickerClassName: 'text-ios-blue'
    },
    'proof-outline': {
        kicker: 'Roteiro de prova',
        icon: BookOpen,
        wrapperClassName: 'my-8 rounded-2xl border border-ios-indigo/20 bg-ios-indigo/5 p-6',
        kickerClassName: 'text-ios-indigo'
    },
    'common-mistake': {
        kicker: 'Erro frequente',
        icon: AlertTriangle,
        wrapperClassName: 'my-8 rounded-2xl border border-status-warning/30 bg-status-warning-soft/70 p-6',
        kickerClassName: 'text-status-warning'
    },
    checkpoint: {
        kicker: 'Checkpoint',
        icon: Lightbulb,
        wrapperClassName: 'my-8 rounded-2xl border border-status-info/30 bg-status-info-soft/60 p-6',
        kickerClassName: 'text-status-info'
    },
    'mini-exercise': {
        kicker: 'Mini-exercício',
        icon: Pencil,
        wrapperClassName: 'my-8 rounded-2xl border border-status-success/30 bg-status-success-soft/60 p-6',
        kickerClassName: 'text-status-success'
    },
    'exercise-solution-step': {
        kicker: 'Etapa comentada',
        icon: CheckCircle2,
        wrapperClassName: 'my-8 rounded-2xl border border-ios-green/20 bg-ios-green/10 p-6',
        kickerClassName: 'text-ios-green'
    },
    reference: {
        kicker: 'Referência de consulta',
        icon: BookOpen,
        wrapperClassName: 'my-8 rounded-2xl border border-default bg-surface-muted/80 p-6',
        kickerClassName: 'text-secondary'
    },
    summary: {
        kicker: 'Resumo operacional',
        icon: CheckCircle2,
        wrapperClassName: 'my-8 rounded-2xl border border-ios-green/20 bg-ios-green/10 p-6',
        kickerClassName: 'text-ios-green'
    }
};

export const ContentPedagogicalBlock: React.FC<ContentBlockComponentProps> = ({
    block,
    onOpenExercise
}) => {
    const config = blockConfig[block.type as PedagogicalBlockType];

    if (!config) {
        return null;
    }

    const relatedExercise = block.exerciseRef
        ? resolveExerciseRefs([block.exerciseRef])[0] ?? null
        : null;
    const Icon = config.icon;

    return (
        <section className={config.wrapperClassName}>
            <div className={`ui-kicker mb-3 flex items-center gap-2 ${config.kickerClassName}`}>
                <Icon size={16} />
                {config.kicker}
            </div>

            {block.title && (
                <h4 className="text-xl font-semibold tracking-tight text-primary">
                    {block.title}
                </h4>
            )}

            {Array.isArray(block.content) ? (
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-primary">
                    {block.content.map((item, index) => (
                        <li key={`${block.title ?? block.type}-${index}`} className="flex gap-3">
                            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current opacity-60" />
                            <span>{renderMarkdown(item)}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-primary">
                    {renderMarkdown(block.content)}
                </p>
            )}

            {relatedExercise && onOpenExercise && (
                <div className="surface-soft-panel mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-default p-4 dark:bg-black/10">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                            Prática associada
                        </p>
                        <p className="mt-1 text-sm font-medium text-primary">
                            {relatedExercise.categoryLabel} • Exercício {relatedExercise.exerciseId}
                        </p>
                        <p className="mt-1 text-sm text-secondary">
                            {relatedExercise.question}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => onOpenExercise(relatedExercise.ref)}
                        className="rounded-full bg-ios-blue px-4 py-2 text-xs font-bold text-white transition-colors hover:opacity-90"
                    >
                        Abrir no treino
                    </button>
                </div>
            )}
        </section>
    );
};
