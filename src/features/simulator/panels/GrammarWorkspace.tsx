import React, { useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle,
    BookOpen,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    FileText,
    Info,
    Menu,
    Play,
    RotateCcw,
    Sparkles,
    Wand2,
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

const GRAMMAR_EXAMPLES = [
    {
        title: 'aⁿbⁿ',
        goal: 'Mesma quantidade de a antes de b.',
        source: 'S -> a S b | eps',
    },
    {
        title: 'palíndromos',
        goal: 'Cadeias que leem igual nos dois sentidos.',
        source: 'S -> a S a | b S b | a | b | eps',
    },
    {
        title: 'parênteses balanceados',
        goal: 'Aberturas e fechamentos bem aninhados.',
        source: 'S -> ( S ) S | eps',
    },
    {
        title: 'expressões simples',
        goal: 'Somas e produtos com identificadores.',
        source: 'E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id',
    },
    {
        title: 'listas com vírgula',
        goal: 'Uma ou mais entradas separadas por vírgula.',
        source: 'L -> id R\nR -> , id R | eps',
    },
    {
        title: 'blocos aninhados',
        goal: 'Estruturas recursivas com início e fim.',
        source: 'B -> { S }\nS -> B S | id S | eps',
    },
] as const;

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
    const [showAdvancedLimits, setShowAdvancedLimits] = useState(false);
    const [examplesOpen, setExamplesOpen] = useState(false);
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

    const loadExample = (source: string) => {
        setGrammarSource(source);
        setExamplesOpen(false);
    };

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
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-default bg-surface-2 px-4 py-3 text-[11px] leading-relaxed text-secondary">
                    <div className="min-w-0">
                        <div className="mb-1 flex items-center gap-2 ui-kicker-xs text-secondary">
                            <Info size={12} />
                            Formato esperado
                        </div>
                        <code className="font-mono">S -&gt; a S b | eps</code>
                    </div>
                    <button
                        type="button"
                        onClick={() => setExamplesOpen(true)}
                        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-default bg-surface-1 px-3 py-2 text-xs font-black text-secondary transition-colors hover:border-ios-purple/45 hover:text-ios-purple"
                    >
                        <Wand2 size={14} />
                        Modelos
                    </button>
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

                <div className="rounded-[22px] border border-default/60 bg-surface-1/70">
                    <button
                        type="button"
                        onClick={() => setShowAdvancedLimits((value) => !value)}
                        aria-expanded={showAdvancedLimits}
                        aria-label={showAdvancedLimits ? 'Ocultar limites avançados da busca' : 'Mostrar limites avançados da busca'}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-purple/35"
                    >
                        <span>
                            <span className="block text-xs font-black text-primary">Limites avançados</span>
                            <span className="mt-0.5 block text-[11px] leading-snug text-secondary">
                                Use só quando a derivação crescer demais.
                            </span>
                        </span>
                        <span className="rounded-full border border-default bg-surface-2 p-1.5 text-secondary">
                            {showAdvancedLimits ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                    </button>

                    {showAdvancedLimits && (
                        <div className="grid grid-cols-3 gap-3 border-t border-default/60 p-4">
                            <label className="space-y-1 text-[10px] font-black uppercase tracking-wide text-secondary">
                                <span className="block">Passos</span>
                                <input
                                    type="number"
                                    value={grammarLimits.maxSteps}
                                    onChange={(event) => setGrammarLimits({ ...grammarLimits, maxSteps: Number(event.target.value) })}
                                    aria-label="Passos máximos da busca"
                                    className="w-full rounded-2xl border border-default bg-surface-2 px-3 py-2 text-xs font-mono text-primary outline-none focus:ring-2 focus:ring-ios-purple/30"
                                />
                            </label>
                            <label className="space-y-1 text-[10px] font-black uppercase tracking-wide text-secondary">
                                <span className="block">Fila</span>
                                <input
                                    type="number"
                                    value={grammarLimits.maxQueue}
                                    onChange={(event) => setGrammarLimits({ ...grammarLimits, maxQueue: Number(event.target.value) })}
                                    aria-label="Tamanho máximo da fila"
                                    className="w-full rounded-2xl border border-default bg-surface-2 px-3 py-2 text-xs font-mono text-primary outline-none focus:ring-2 focus:ring-ios-purple/30"
                                />
                            </label>
                            <label className="space-y-1 text-[10px] font-black uppercase tracking-wide text-secondary">
                                <span className="block">Símbolos</span>
                                <input
                                    type="number"
                                    value={grammarLimits.maxSymbols}
                                    onChange={(event) => setGrammarLimits({ ...grammarLimits, maxSymbols: Number(event.target.value) })}
                                    aria-label="Máximo de símbolos por forma sentencial"
                                    className="w-full rounded-2xl border border-default bg-surface-2 px-3 py-2 text-xs font-mono text-primary outline-none focus:ring-2 focus:ring-ios-purple/30"
                                />
                            </label>
                        </div>
                    )}
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

        {examplesOpen && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" role="presentation" onMouseDown={() => setExamplesOpen(false)}>
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="grammar-examples-title"
                    className="w-full max-w-2xl rounded-[28px] border border-default bg-surface-1 p-5 shadow-apple-xl"
                    onMouseDown={(event) => event.stopPropagation()}
                >
                    <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                            <div className="ui-kicker-xs text-secondary">Modelos</div>
                            <h3 id="grammar-examples-title" className="mt-1 text-lg font-black text-primary">Começar por exemplo</h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setExamplesOpen(false)}
                            className="rounded-2xl p-2 text-secondary transition-colors hover:bg-surface-hover hover:text-primary"
                            aria-label="Fechar modelos de gramática"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {GRAMMAR_EXAMPLES.map((example) => (
                            <button
                                key={example.title}
                                type="button"
                                onClick={() => loadExample(example.source)}
                                className="group rounded-2xl border border-default/70 bg-surface-2/70 p-4 text-left transition-all hover:border-ios-purple/45 hover:bg-ios-purple/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-purple/35"
                                aria-label={`Carregar ${example.title}`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm font-black text-primary">{example.title}</span>
                                    <span className="rounded-full border border-default px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-secondary transition-colors group-hover:border-ios-purple/45 group-hover:text-ios-purple">
                                        usar
                                    </span>
                                </div>
                                <p className="mt-2 text-xs leading-relaxed text-secondary">{example.goal}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}
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
        <div data-testid="grammar-workspace" className="flex h-full min-h-0 flex-1 px-3 pb-3 sm:px-4 sm:pb-4 lg:px-5 lg:pb-5 2xl:px-6 2xl:pb-6">
            <div className="relative h-full min-h-0 w-full overflow-hidden rounded-[28px] border border-default bg-canvas shadow-apple-xl">
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

                    <main className="min-h-0 flex-1 overflow-y-auto p-4 pb-28 pt-24 custom-scrollbar lg:p-6 lg:pb-28 lg:pt-24">
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
                            <div data-testid="grammar-empty-stage" className="grid h-full min-h-[360px] place-items-center px-4 py-8">
                                <div className="max-w-lg rounded-[24px] border border-default bg-surface-1/90 px-7 py-8 text-center shadow-apple-lg">
                                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] bg-ios-purple/12 text-ios-purple">
                                        <FileText size={28} />
                                    </div>
                                    <h2 className="text-xl font-black text-primary">Pronto para derivar</h2>
                                    <p className="mt-2 text-sm leading-relaxed text-secondary">
                                        Siga o fluxo: editar regras, escolher exemplo, digitar palavra, derivar e ler por que a palavra foi aceita ou rejeitada.
                                    </p>
                                    <div className="mt-5 grid gap-2 text-left text-xs font-semibold text-secondary sm:grid-cols-2">
                                        {['Editar regras', 'Escolher exemplo', 'Digitar palavra', 'Derivar e revisar passos'].map((step, index) => (
                                            <div key={step} className="rounded-2xl border border-default bg-surface-2/70 px-3 py-2">
                                                <span className="mr-2 font-mono text-ios-purple">{index + 1}</span>
                                                {step}
                                            </div>
                                        ))}
                                    </div>
                                    {!isDesktopViewport && (
                                        <button
                                            type="button"
                                            onClick={() => setRailOpen(true)}
                                            className="mt-5 rounded-full bg-ios-purple px-4 py-2 text-xs font-black text-white shadow-lg"
                                        >
                                            Editar regras
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </main>
                </div>

                <div
                    data-testid="grammar-derivation-dock"
                    className="pointer-events-none absolute inset-x-4 bottom-4 z-30 lg:left-[calc(360px+1rem)] xl:left-[calc(380px+1rem)]"
                >
                    <div className="pointer-events-auto mx-auto w-full max-w-[820px]">
                        <div className="glass-card flex flex-col gap-2 rounded-[24px] border border-default/80 bg-surface-1/95 p-2 shadow-apple-xl lg:flex-row lg:items-center">
                            <div className="flex min-h-11 flex-1 items-center gap-2 rounded-[20px] border border-default bg-surface-2/70 px-3 py-2 shadow-inner">
                                <FileText size={16} className="text-secondary" />
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
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 lg:w-auto">
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
                                        className="inline-flex h-11 items-center gap-2 rounded-[18px] bg-ios-green px-4 text-xs font-black uppercase tracking-wide text-white shadow-lg shadow-green-500/20 transition-colors hover:bg-green-600"
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
                                        className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-default bg-surface-2 text-secondary transition-colors hover:bg-surface-hover hover:text-primary"
                                        aria-label="Limpar palavra e resultado"
                                    >
                                        <RotateCcw size={17} />
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
