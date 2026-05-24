import React, { useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle,
    BookOpen,
    CheckCircle2,
    FileText,
    Info,
    Menu,
    Play,
    RotateCcw,
    Sparkles,
    X,
    XCircle,
} from 'lucide-react';
import { DerivationTreeVisualizer } from '../../../components/ui';
import type { GrammarResult, GrammarTransformResult } from '../../../hooks/useGrammarSimulation';

interface GrammarWorkspaceProps {
    headerContent: React.ReactNode;
    grammarSource: string;
    grammarInput: string;
    grammarWarnings: string[];
    grammarStrategy: 'leftmost' | 'rightmost';
    grammarLimits: {
        maxSteps: number;
        maxQueue: number;
        maxSymbols: number;
    };
    grammarResult: GrammarResult | null;
    grammarTransform: GrammarTransformResult | null;
    setGrammarSource: (value: string) => void;
    setGrammarInput: (value: string) => void;
    setGrammarStrategy: (value: 'leftmost' | 'rightmost') => void;
    setGrammarLimits: (limits: { maxSteps: number; maxQueue: number; maxSymbols: number }) => void;
    runDerivation: () => void;
    runTransform: (kind: 'epsilon' | 'unit' | 'cnf' | 'gnf') => void;
    clearTransform: () => void;
    clearResult: () => void;
}

const GrammarRail = ({
    grammarSource,
    grammarWarnings,
    grammarLimits,
    grammarTransform,
    setGrammarSource,
    setGrammarLimits,
    runTransform,
    clearTransform,
    onClose,
    mobile,
}: {
    grammarSource: string;
    grammarWarnings: string[];
    grammarLimits: {
        maxSteps: number;
        maxQueue: number;
        maxSymbols: number;
    };
    grammarTransform: GrammarTransformResult | null;
    setGrammarSource: (value: string) => void;
    setGrammarLimits: (limits: { maxSteps: number; maxQueue: number; maxSymbols: number }) => void;
    runTransform: (kind: 'epsilon' | 'unit' | 'cnf' | 'gnf') => void;
    clearTransform: () => void;
    onClose?: () => void;
    mobile?: boolean;
}) => {
    const duplicateRules = useMemo(() => {
        const seen = new Set<string>();
        const duplicates = new Set<string>();
        grammarSource
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)
            .forEach((line) => {
                if (seen.has(line)) {
                    duplicates.add(line);
                    return;
                }
                seen.add(line);
            });
        return [...duplicates];
    }, [grammarSource]);

    return (
    <div className={`flex h-full min-h-0 flex-col rounded-[28px] border border-default bg-surface-1/95 shadow-apple-xl ${mobile ? '' : 'bg-surface-1/92'}`}>
        <div className="flex items-center justify-between border-b border-default/60 px-5 py-4">
            <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-ios-purple/12 p-2 text-ios-purple">
                    <BookOpen size={18} />
                </div>
                <div>
                    <div className="ui-kicker-xs text-secondary">Gramática</div>
                    <div className="text-sm font-bold text-primary">Regras e normalizações</div>
                </div>
            </div>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-2xl p-2 text-secondary transition-colors hover:bg-surface-hover hover:text-primary lg:hidden"
                    aria-label="Fechar edição da gramática"
                >
                    <X size={16} />
                </button>
            )}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5 custom-scrollbar">
            <section className="space-y-4 rounded-[24px] border border-default/60 bg-surface-2/60 p-5">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setGrammarSource('S -> a S b | eps')}
                        className="rounded-full border border-default px-3 py-1.5 text-[11px] font-black text-secondary transition-colors hover:bg-surface-hover hover:text-primary"
                    >
                        Preset aⁿbⁿ
                    </button>
                    <button
                        type="button"
                        onClick={() => setGrammarSource('S -> a S a | b S b | a | b | eps')}
                        className="rounded-full border border-default px-3 py-1.5 text-[11px] font-black text-secondary transition-colors hover:bg-surface-hover hover:text-primary"
                    >
                        Preset palíndromos
                    </button>
                </div>

                <div className="rounded-2xl border border-default bg-surface-2 px-4 py-3 text-[11px] leading-relaxed text-secondary">
                    <div className="mb-1 flex items-center gap-2 ui-kicker-xs text-secondary">
                        <Info size={12} />
                        Formato esperado
                    </div>
                    <code className="font-mono">S -&gt; a S b | eps</code>
                </div>

                <textarea
                    value={grammarSource}
                    onChange={(event) => setGrammarSource(event.target.value)}
                    className="h-[280px] w-full resize-none rounded-[24px] border border-default bg-surface-2 px-4 py-4 font-mono text-sm text-primary shadow-inner outline-none ring-ios-purple/30 focus:ring-2 xl:h-[320px]"
                    placeholder="S -> a S b | eps"
                    aria-label="Fonte da gramática"
                />

                {grammarWarnings.length > 0 && (
                    <div className="rounded-[24px] border border-status-warning bg-status-warning-soft/30 p-4 text-xs leading-relaxed text-status-warning">
                        <div className="mb-2 flex items-center gap-2 ui-kicker-xs text-status-warning">
                            <AlertTriangle size={12} />
                            Avisos de parsing
                        </div>
                        <div className="space-y-1">
                            {grammarWarnings.map((warning, index) => (
                                <p key={`${warning}-${index}`}>{warning}</p>
                            ))}
                        </div>
                    </div>
                )}

                {duplicateRules.length > 0 && (
                    <div className="rounded-[24px] border border-status-warning bg-status-warning-soft/30 p-4 text-xs leading-relaxed text-status-warning">
                        <div className="mb-2 flex items-center gap-2 ui-kicker-xs text-status-warning">
                            <AlertTriangle size={12} />
                            Regras duplicadas
                        </div>
                        <p className="mb-2">
                            Repetições podem deixar a busca mais lenta e dificultar a leitura da derivação.
                        </p>
                        <div className="space-y-1">
                            {duplicateRules.map((rule) => (
                                <code key={rule} className="block rounded-xl bg-surface-1/80 px-3 py-2 font-mono text-[11px] text-primary">
                                    {rule}
                                </code>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <section className="space-y-4 rounded-[24px] border border-default/60 bg-surface-2/60 p-5">
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-ios-purple" />
                    <h3 className="text-sm font-bold text-primary">Transformações</h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => runTransform('epsilon')} className="btn-transform">ε-remover</button>
                    <button type="button" onClick={() => runTransform('unit')} className="btn-transform">Unitárias</button>
                    <button type="button" onClick={() => runTransform('cnf')} className="btn-transform">Forma CNF</button>
                    <button type="button" onClick={() => runTransform('gnf')} className="btn-transform">Forma GNF</button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <label className="space-y-1 text-[10px] font-black uppercase tracking-wide text-secondary">
                        <span className="block">Passos</span>
                        <input
                            type="number"
                            value={grammarLimits.maxSteps}
                            onChange={(event) => setGrammarLimits({ ...grammarLimits, maxSteps: Number(event.target.value) })}
                            className="w-full rounded-2xl border border-default bg-surface-2 px-3 py-2 text-xs font-mono text-primary outline-none"
                        />
                    </label>
                    <label className="space-y-1 text-[10px] font-black uppercase tracking-wide text-secondary">
                        <span className="block">Fila</span>
                        <input
                            type="number"
                            value={grammarLimits.maxQueue}
                            onChange={(event) => setGrammarLimits({ ...grammarLimits, maxQueue: Number(event.target.value) })}
                            className="w-full rounded-2xl border border-default bg-surface-2 px-3 py-2 text-xs font-mono text-primary outline-none"
                        />
                    </label>
                    <label className="space-y-1 text-[10px] font-black uppercase tracking-wide text-secondary">
                        <span className="block">Símbolos</span>
                        <input
                            type="number"
                            value={grammarLimits.maxSymbols}
                            onChange={(event) => setGrammarLimits({ ...grammarLimits, maxSymbols: Number(event.target.value) })}
                            className="w-full rounded-2xl border border-default bg-surface-2 px-3 py-2 text-xs font-mono text-primary outline-none"
                        />
                    </label>
                </div>

                {grammarTransform && (
                    <div className="rounded-[24px] border border-status-accent bg-status-accent-soft p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                                <div className="ui-kicker-xs text-status-accent">{grammarTransform.title}</div>
                                <div className="text-sm font-bold text-primary">Resultado da transformação</div>
                            </div>
                            <button
                                type="button"
                                onClick={clearTransform}
                                className="rounded-full p-2 text-secondary transition-colors hover:bg-surface-hover hover:text-primary"
                                aria-label="Limpar transformação"
                            >
                                <RotateCcw size={14} />
                            </button>
                        </div>
                        {grammarTransform.warnings && grammarTransform.warnings.length > 0 && (
                            <div className="mb-3 rounded-2xl border border-status-warning bg-status-warning-soft px-3 py-2 text-xs text-status-warning">
                                {grammarTransform.warnings.join(', ')}
                            </div>
                        )}
                        <div className="space-y-2">
                            {grammarTransform.steps.map((step, index) => (
                                <div key={`${step}-${index}`} className="rounded-2xl border border-default/50 bg-surface-1/90 px-3 py-2 text-xs text-secondary">
                                    {step}
                                </div>
                            ))}
                        </div>
                        <pre className="mt-3 overflow-auto rounded-2xl border border-default/50 bg-surface-1/90 p-3 font-mono text-xs text-primary custom-scrollbar">
                            {grammarTransform.output}
                        </pre>
                    </div>
                )}
            </section>
        </div>
    </div>
    );
};

export const GrammarWorkspace: React.FC<GrammarWorkspaceProps> = ({
    headerContent,
    grammarSource,
    grammarInput,
    grammarWarnings,
    grammarStrategy,
    grammarLimits,
    grammarResult,
    grammarTransform,
    setGrammarSource,
    setGrammarInput,
    setGrammarStrategy,
    setGrammarLimits,
    runDerivation,
    runTransform,
    clearTransform,
    clearResult,
}) => {
    const [isDesktopViewport, setIsDesktopViewport] = useState(() => {
        if (typeof window === 'undefined') return true;
        return window.matchMedia('(min-width: 1024px)').matches;
    });
    const [railOpen, setRailOpen] = useState(() => {
        if (typeof window === 'undefined') return true;
        return window.matchMedia('(min-width: 1024px)').matches;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        const media = window.matchMedia('(min-width: 1024px)');
        const handleChange = (event: MediaQueryListEvent) => {
            setIsDesktopViewport(event.matches);
            if (event.matches) {
                setRailOpen(true);
            }
        };

        setIsDesktopViewport(media.matches);
        media.addEventListener('change', handleChange);
        return () => media.removeEventListener('change', handleChange);
    }, []);

    return (
        <div data-testid="grammar-workspace" className="flex-1 min-h-0 px-3 pb-3 sm:px-4 sm:pb-4 lg:px-5 lg:pb-5 2xl:px-6 2xl:pb-6">
            <div className="relative h-full min-h-[calc(100dvh-92px)] overflow-hidden rounded-[28px] border border-default bg-canvas shadow-apple-xl sm:min-h-[calc(100dvh-104px)] lg:min-h-[calc(100dvh-116px)]">
                {!isDesktopViewport && railOpen && (
                    <button
                        type="button"
                        className="absolute inset-0 z-30 bg-black/35 backdrop-blur-[2px] lg:hidden"
                        onClick={() => setRailOpen(false)}
                        aria-label="Fechar painel da gramática"
                    />
                )}

                <div className="pointer-events-none absolute left-4 top-4 z-30 flex max-w-[420px] flex-col gap-2">
                    {headerContent}
                    <div className="glass-panel pointer-events-auto inline-flex w-fit items-center gap-2 rounded-full border border-default bg-surface-1/95 px-3 py-2 shadow-apple-md">
                        <span className="badge badge-accent">GLC</span>
                        <span className="text-[11px] font-black text-secondary">Laboratório de gramáticas</span>
                    </div>
                </div>

                {!isDesktopViewport && (
                    <div className="pointer-events-none absolute right-4 top-4 z-30">
                        <button
                            type="button"
                            onClick={() => setRailOpen(true)}
                            className="pointer-events-auto rounded-2xl border border-default bg-surface-1/95 p-3 text-secondary shadow-apple-md transition-colors hover:bg-surface-hover hover:text-primary"
                            aria-label="Abrir painel da gramática"
                        >
                            <Menu size={16} />
                        </button>
                    </div>
                )}

                {!isDesktopViewport && railOpen && (
                    <aside className="absolute inset-y-4 left-4 top-20 z-40 w-[min(24rem,calc(100%-2rem))] lg:hidden">
                        <GrammarRail
                            grammarSource={grammarSource}
                            grammarWarnings={grammarWarnings}
                            grammarLimits={grammarLimits}
                            grammarTransform={grammarTransform}
                            setGrammarSource={setGrammarSource}
                            setGrammarLimits={setGrammarLimits}
                            runTransform={runTransform}
                            clearTransform={clearTransform}
                            onClose={() => setRailOpen(false)}
                            mobile
                        />
                    </aside>
                )}

                <div className="flex h-full min-h-0">
                    {isDesktopViewport && (
                        <aside className="hidden h-full min-h-0 w-[360px] shrink-0 px-4 pb-32 pt-24 xl:w-[380px] lg:block">
                            <GrammarRail
                                grammarSource={grammarSource}
                                grammarWarnings={grammarWarnings}
                                grammarLimits={grammarLimits}
                                grammarTransform={grammarTransform}
                                setGrammarSource={setGrammarSource}
                                setGrammarLimits={setGrammarLimits}
                                runTransform={runTransform}
                                clearTransform={clearTransform}
                            />
                        </aside>
                    )}

                    <main className="min-h-0 flex-1 overflow-y-auto p-4 pb-36 pt-24 custom-scrollbar lg:p-6 lg:pb-36 lg:pt-24">
                        {grammarResult ? (
                            <div data-testid="grammar-result-stage" className="mx-auto max-w-6xl">
                                <section className="rounded-[28px] border border-default bg-surface-1/92 p-6 shadow-apple-xl md:p-8">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`rounded-[24px] p-4 ${grammarResult.status === 'accepted' ? 'bg-ios-green text-white' : 'bg-ios-red text-white'}`}>
                                                {grammarResult.status === 'accepted' ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
                                            </div>
                                            <div>
                                                <div className="ui-kicker-xs text-secondary">Resultado</div>
                                                <h2 className="mt-1 text-2xl font-black text-primary">
                                                    {grammarResult.status === 'accepted' ? 'Palavra aceita' : 'Palavra rejeitada'}
                                                </h2>
                                                <p className="mt-2 inline-flex rounded-full border border-default bg-surface-muted px-3 py-1 font-mono text-sm font-bold text-primary">
                                                    "{grammarInput || 'ε'}"
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={clearResult}
                                            className="rounded-2xl border border-default bg-surface-2 px-4 py-2 text-xs font-black text-secondary transition-colors hover:bg-surface-hover hover:text-primary"
                                        >
                                            Limpar resultado
                                        </button>
                                    </div>

                                    {grammarResult.reason && (
                                        <div className="mt-6 rounded-[24px] border border-default bg-surface-2/60 p-4 text-sm leading-relaxed text-secondary">
                                            {grammarResult.reason}
                                        </div>
                                    )}

                                    {grammarResult.tree && (
                                        <section className="mt-8">
                                            <div className="mb-3 ui-kicker text-secondary">Árvore de derivação</div>
                                            <div className="h-[320px] rounded-[28px] border border-default bg-canvas p-3 md:h-[400px] lg:h-[520px]">
                                                <DerivationTreeVisualizer
                                                    tree={grammarResult.tree}
                                                    steps={grammarResult.steps}
                                                    autoPlay={true}
                                                />
                                            </div>
                                        </section>
                                    )}

                                    <section className="mt-8">
                                        <div className="mb-3 ui-kicker text-secondary">Passos da derivação</div>
                                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                            {grammarResult.steps.map((step, index) => (
                                                <div key={`${step}-${index}`} className="rounded-[24px] border border-default bg-surface-2/60 px-4 py-3">
                                                    <div className="text-[10px] font-black uppercase tracking-wide text-secondary">Passo {index}</div>
                                                    <div className="mt-1 font-mono text-sm font-bold text-primary">{step}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </section>
                            </div>
                        ) : (
                            <div data-testid="grammar-empty-stage" className="flex h-full min-h-[320px] items-center justify-center px-4 py-10">
                                <div className="max-w-lg rounded-[28px] border border-default bg-surface-1/92 px-8 py-10 text-center shadow-apple-lg">
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-ios-purple/12 text-ios-purple">
                                        <FileText size={34} />
                                    </div>
                                    <h2 className="text-2xl font-black text-primary">Pronto para derivar</h2>
                                    <p className="mt-3 text-sm leading-relaxed text-secondary">
                                        Edite as regras, informe a palavra e execute a derivação.
                                    </p>
                                </div>
                            </div>
                        )}
                    </main>
                </div>

                <div className="pointer-events-none absolute inset-x-4 bottom-4 z-30">
                    <div className="pointer-events-auto mx-auto w-full max-w-[980px]">
                        <div className="glass-card flex flex-col gap-3 rounded-[28px] border border-default/80 bg-surface-1/95 p-3 shadow-apple-xl lg:flex-row lg:items-center lg:p-4">
                            <div className="flex flex-1 items-center gap-3 rounded-[24px] border border-default bg-surface-2/70 px-4 py-2 shadow-inner">
                                <FileText size={18} className="text-secondary" />
                                <div className="min-w-0 flex-1">
                                    <input
                                        value={grammarInput}
                                        onChange={(event) => setGrammarInput(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') runDerivation();
                                        }}
                                        placeholder="Digite a palavra para testar"
                                        className="w-full min-w-0 bg-transparent font-mono text-sm font-bold text-primary outline-none placeholder:text-muted"
                                        aria-label="Palavra a ser derivada"
                                    />
                                    <div className="mt-0.5 text-[10px] font-semibold text-secondary">Entrada vazia representa ε.</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 lg:w-auto">
                                <div className="flex items-center rounded-full border border-default bg-surface-muted p-1">
                                    <button
                                        type="button"
                                        onClick={() => setGrammarStrategy('leftmost')}
                                        className={`rounded-full px-3 py-1.5 text-[11px] font-black transition-colors ${grammarStrategy === 'leftmost' ? 'bg-ios-blue text-white' : 'text-secondary hover:text-primary'}`}
                                    >
                                        Esquerda
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setGrammarStrategy('rightmost')}
                                        className={`rounded-full px-3 py-1.5 text-[11px] font-black transition-colors ${grammarStrategy === 'rightmost' ? 'bg-ios-purple text-white' : 'text-secondary hover:text-primary'}`}
                                    >
                                        Direita
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={runDerivation}
                                        className="inline-flex items-center gap-2 rounded-[20px] bg-ios-green px-5 py-3 text-xs font-black uppercase tracking-wide text-white shadow-lg shadow-green-500/20 transition-colors hover:bg-green-600"
                                    >
                                        <Play size={16} fill="currentColor" />
                                        Derivar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setGrammarInput('');
                                            clearResult();
                                        }}
                                        className="rounded-[20px] border border-default bg-surface-2 p-3 text-secondary transition-colors hover:bg-surface-hover hover:text-primary"
                                        aria-label="Limpar palavra e resultado"
                                    >
                                        <RotateCcw size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
