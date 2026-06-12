import React from 'react';
import { Search } from 'lucide-react';

interface SkeletonBlockProps {
    className?: string;
    ariaLabel?: string;
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
    className = '',
    ariaLabel,
}) => (
    <div
        className={`motion-shimmer rounded-xl bg-surface-muted ${className}`}
        aria-label={ariaLabel}
        aria-busy="true"
    />
);

const SkeletonLineGroup = ({ lines = 3 }: { lines?: number }) => (
    <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
            <SkeletonBlock
                key={index}
                className={index === lines - 1 ? 'h-3 w-2/3' : 'h-3 w-full'}
            />
        ))}
    </div>
);

export const ContentSkeleton = () => (
    <div
        className="relative flex w-full min-w-0 gap-4 pb-8 md:gap-6"
        aria-label="Carregando trilha de conteúdo"
        aria-busy="true"
    >
        <aside className="hidden w-80 shrink-0 md:block">
            <div className="glass-panel motion-panel-enter sticky top-24 rounded-[28px] border border-default p-4">
                <SkeletonBlock className="mb-5 h-9 w-40" />
                <SkeletonBlock className="mb-5 h-11 w-full rounded-2xl" />
                <div className="space-y-3">
                    {Array.from({ length: 7 }).map((_, index) => (
                        <div key={index} className="rounded-2xl border border-default/50 p-3">
                            <SkeletonBlock className="h-3 w-24" />
                            <SkeletonBlock className="mt-3 h-2.5 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        </aside>

        <main className="content-reading-panel render-lite-panel min-w-0 flex-1 rounded-2xl pb-10 md:rounded-3xl">
            <div className="mx-auto max-w-5xl px-5 py-8 md:px-10 md:py-10">
                <div className="lesson-header-panel motion-panel-enter rounded-[24px] border p-6">
                    <SkeletonBlock className="h-4 w-36" />
                    <SkeletonBlock className="mt-5 h-10 w-3/4" />
                    <SkeletonBlock className="mt-4 h-4 w-full" />
                    <SkeletonBlock className="mt-2 h-4 w-4/5" />
                </div>
                <div className="mt-8 space-y-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <section key={index} className="lesson-support-block motion-panel-enter" style={{ animationDelay: `${index * 70}ms` }}>
                            <SkeletonBlock className="mb-4 h-5 w-52" />
                            <SkeletonLineGroup lines={4} />
                        </section>
                    ))}
                </div>
            </div>
        </main>
    </div>
);

export const ExercisesSkeleton = () => (
    <div
        className="render-lite-shell relative flex w-full min-w-0 gap-4 pb-8 md:gap-6"
        aria-label="Carregando lista de exercícios"
        aria-busy="true"
    >
        <aside className="hidden w-80 shrink-0 md:block">
            <div className="glass-panel motion-panel-enter sticky top-24 rounded-[28px] border border-default p-4">
                <SkeletonBlock className="h-9 w-44" />
                <SkeletonBlock className="mt-5 h-11 w-full rounded-2xl" />
                <div className="mt-5 space-y-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <SkeletonBlock key={index} className="h-12 w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-5">
            <div className="glass-card motion-panel-enter px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <SkeletonBlock className="h-8 w-48" />
                    <div className="flex gap-2">
                        <SkeletonBlock className="h-8 w-24 rounded-full" />
                        <SkeletonBlock className="h-8 w-28 rounded-full" />
                    </div>
                </div>
            </div>

            {Array.from({ length: 5 }).map((_, index) => (
                <article key={index} className="glass-card motion-panel-enter p-6" style={{ animationDelay: `${index * 70}ms` }}>
                    <div className="flex gap-4">
                        <SkeletonBlock className="h-10 w-10 shrink-0 rounded-xl" />
                        <div className="min-w-0 flex-1">
                            <SkeletonBlock className="h-5 w-full" />
                            <SkeletonBlock className="mt-3 h-4 w-4/5" />
                            <div className="mt-5 flex flex-wrap gap-3">
                                <SkeletonBlock className="h-10 w-36 rounded-xl" />
                                <SkeletonBlock className="h-10 w-28 rounded-xl" />
                                <SkeletonBlock className="h-10 w-40 rounded-xl" />
                            </div>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    </div>
);

export const ModalSkeleton = ({ label = 'Carregando painel' }: { label?: string }) => (
    <div
        className="glass-card motion-panel-enter mx-auto max-w-2xl p-6"
        aria-label={label}
        aria-busy="true"
    >
        <SkeletonBlock className="h-7 w-52" />
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <SkeletonBlock className="h-10 rounded-xl" />
            <SkeletonBlock className="h-10 rounded-xl" />
            <SkeletonBlock className="h-10 rounded-xl" />
        </div>
        <div className="mt-6 rounded-2xl border border-default/60 p-4">
            <SkeletonLineGroup lines={5} />
        </div>
    </div>
);

export const EmptyMotionState = ({
    title,
    description,
}: {
    title: string;
    description?: string;
}) => (
    <div className="motion-empty-state rounded-2xl border border-dashed border-default bg-surface-1/70 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-default bg-surface-muted text-secondary">
            <Search size={20} />
        </div>
        <p className="text-sm font-black text-primary">{title}</p>
        {description && (
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-secondary">{description}</p>
        )}
    </div>
);
