import React from 'react';
import { DerivationTreeVisualizer } from '../../../components/ui';
import type { GrammarResult, GrammarTransformResult } from '../../../hooks/useGrammarSimulation';
import { FileText, Play, RotateCcw, ListOrdered, Sparkles, BookOpen, Quote, Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface GrammarWorkspaceProps {
    modeSelector: React.ReactNode;
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

export const GrammarWorkspace: React.FC<GrammarWorkspaceProps> = ({
    modeSelector,
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
    clearResult
}) => {
    return (
        <div className="flex-1 min-h-0 relative z-0 overflow-hidden bg-canvas" data-native-cursor="true">
            <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

            {/* Top Floating Bar: Mode and Stats */}
            <div className="pointer-events-none absolute inset-x-3 top-2 md:top-3 z-30">
                <div className="mx-auto w-full max-w-[1450px] flex flex-wrap items-start justify-between gap-2 px-16 md:px-20">
                    <div className="pointer-events-auto flex flex-wrap gap-2 items-start">
                        {modeSelector}
                        <div className="glass-panel px-3 py-2 rounded-2xl text-muted flex items-center gap-2 shadow-apple-md border border-default">
                            <span className="badge badge-accent">GLC</span>
                            <span className="text-[11px] font-bold text-secondary">Livre de Contexto</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="relative h-full overflow-hidden flex flex-col lg:flex-row">
                {/* Editor Sidebar */}
                <aside className="w-full lg:w-[400px] p-4 pt-20 lg:pt-20 lg:h-full overflow-y-auto custom-scrollbar z-10 space-y-4">
                    <div className="glass-panel rounded-[32px] p-6 shadow-apple-md border border-default space-y-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-ios-blue/10 text-ios-blue">
                                    <BookOpen size={20} />
                                </div>
                                <h2 className="ui-kicker text-primary font-bold">Gramática</h2>
                            </div>
                            <div className="flex gap-1.5">
                                <button
                                    onClick={() => setGrammarSource('S -> a S b | eps')}
                                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase bg-surface-muted hover:bg-surface-hover transition-all text-secondary border border-default/50"
                                >
                                    aⁿbⁿ
                                </button>
                                <button
                                    onClick={() => setGrammarSource('S -> a S a | b S b | a | b | eps')}
                                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase bg-surface-muted hover:bg-surface-hover transition-all text-secondary border border-default/50"
                                >
                                    Palin.
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[11px] text-muted font-medium px-1 flex items-center gap-1.5">
                                <Info size={12} />
                                Formato: <code className="bg-black/5 dark:bg-white/5 px-1 rounded font-bold">S -&gt; a S b | eps</code>
                            </p>
                            <textarea
                                value={grammarSource}
                                onChange={(e) => setGrammarSource(e.target.value)}
                                className="w-full h-72 rounded-2xl border border-default bg-surface-2/50 p-4 font-mono text-sm text-primary shadow-inner outline-none focus:ring-2 ring-ios-blue/30 transition-all resize-none"
                                placeholder="S -> a S b | eps"
                            />
                        </div>

                        {grammarWarnings.length > 0 && (
                            <div className="rounded-2xl border border-status-warning/30 bg-status-warning-soft/50 p-4 text-[11px] text-status-warning leading-relaxed animate-fade-in">
                                <p className="font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <AlertTriangle size={12} /> Avisos
                                </p>
                                {grammarWarnings.map((warn, idx) => (
                                    <div key={`${warn}-${idx}`} className="flex gap-2 mb-1 last:mb-0">
                                        <span className="opacity-50">•</span> {warn}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-3 pt-2">
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-black uppercase text-muted tracking-widest px-1">Passos</label>
                                <input
                                    type="number"
                                    value={grammarLimits.maxSteps}
                                    onChange={(e) => setGrammarLimits({ ...grammarLimits, maxSteps: Number(e.target.value) })}
                                    className="w-full rounded-xl border border-default bg-surface-muted/50 px-3 py-2 text-xs font-mono font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-black uppercase text-muted tracking-widest px-1">Fila</label>
                                <input
                                    type="number"
                                    value={grammarLimits.maxQueue}
                                    onChange={(e) => setGrammarLimits({ ...grammarLimits, maxQueue: Number(e.target.value) })}
                                    className="w-full rounded-xl border border-default bg-surface-muted/50 px-3 py-2 text-xs font-mono font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-black uppercase text-muted tracking-widest px-1">Símbolos</label>
                                <input
                                    type="number"
                                    value={grammarLimits.maxSymbols}
                                    onChange={(e) => setGrammarLimits({ ...grammarLimits, maxSymbols: Number(e.target.value) })}
                                    className="w-full rounded-xl border border-default bg-surface-muted/50 px-3 py-2 text-xs font-mono font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Transformations Panel */}
                    <div className="glass-panel rounded-[32px] p-6 shadow-apple-md border border-default space-y-5">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-ios-purple/10 text-ios-purple">
                                <Sparkles size={20} />
                            </div>
                            <h3 className="ui-kicker text-primary font-bold">Transformações</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => runTransform('epsilon')} className="btn-transform">ε-remover</button>
                            <button onClick={() => runTransform('unit')} className="btn-transform">Unitárias</button>
                            <button onClick={() => runTransform('cnf')} className="btn-transform">Forma CNF</button>
                            <button onClick={() => runTransform('gnf')} className="btn-transform">Forma GNF</button>
                        </div>

                        {grammarTransform && (
                            <div className="mt-2 rounded-[24px] border border-ios-purple/20 bg-ios-purple/5 p-5 animate-scale-in">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black text-ios-purple uppercase tracking-widest">{grammarTransform.title}</span>
                                    <button onClick={clearTransform} className="text-muted hover:text-primary transition-colors p-1 rounded-lg hover:bg-surface-soft"><RotateCcw size={14}/></button>
                                </div>
                                {grammarTransform.warnings && grammarTransform.warnings.length > 0 && (
                                    <div className="text-[10px] text-status-warning mb-3 font-bold bg-status-warning-soft/30 p-2 rounded-lg">
                                        {grammarTransform.warnings.join(', ')}
                                    </div>
                                )}
                                <div className="max-h-52 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                                    {grammarTransform.steps.map((step, idx) => (
                                        <div key={idx} className="text-[11px] text-secondary leading-relaxed bg-surface-1/80 p-3 rounded-xl border border-default/40 shadow-sm">
                                            <span className="font-black text-ios-purple/60 mr-2">{idx + 1}.</span> {step}
                                        </div>
                                    ))}
                                    {grammarTransform.output && (
                                        <pre className="mt-3 p-4 rounded-xl bg-black/5 dark:bg-white/5 font-mono text-[11px] text-primary whitespace-pre-wrap border border-default/30 shadow-inner">
                                            {grammarTransform.output}
                                        </pre>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Results View */}
                <main className="flex-1 p-4 lg:p-6 pt-2 lg:pt-20 overflow-y-auto custom-scrollbar">
                    {grammarResult ? (
                        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-32">
                            <div className="glass-panel rounded-[40px] p-8 shadow-apple-lg border border-default relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    {grammarResult.status === 'accepted' ? <Sparkles size={120}/> : <FileText size={120}/>}
                                </div>

                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shadow-lg ${
                                            grammarResult.status === 'accepted' ? 'bg-ios-green text-white shadow-green-500/20' : 'bg-ios-red text-white shadow-red-500/20'
                                        }`}>
                                            {grammarResult.status === 'accepted' ? <CheckCircle2 size={32}/> : <XCircle size={32}/>}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-primary tracking-tight">
                                                {grammarResult.status === 'accepted' ? 'Palavra Aceita' : 'Palavra Rejeitada'}
                                            </h2>
                                            <p className="text-base text-secondary font-mono bg-surface-muted/50 px-3 py-1 rounded-lg inline-block mt-1">
                                                "{grammarInput}"
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={clearResult} 
                                        className="p-3 rounded-2xl hover:bg-surface-soft text-muted hover:text-primary transition-all active:scale-95 border border-default/50"
                                        title="Limpar resultados"
                                    >
                                        <RotateCcw size={24}/>
                                    </button>
                                </div>

                                {grammarResult.reason && (
                                    <div className="mb-8 p-5 rounded-2xl bg-surface-muted/30 border border-default/60 text-[13px] text-secondary leading-relaxed italic flex items-start gap-3">
                                        <Quote size={18} className="text-muted opacity-40 shrink-0 mt-1" />
                                        <p>{grammarResult.reason}</p>
                                    </div>
                                )}

                                {grammarResult.tree && (
                                    <div className="mb-10">
                                        <div className="flex items-center gap-2 ui-kicker text-muted mb-4 px-2">
                                            <Sparkles size={14} className="text-ios-purple" />
                                            Visualização da Árvore
                                        </div>
                                        <div className="h-[500px] rounded-[40px] border-2 border-default bg-surface-2/30 overflow-hidden relative shadow-inner group">
                                            <DerivationTreeVisualizer tree={grammarResult.tree} steps={grammarResult.steps} autoPlay={true} />
                                            <div className="absolute top-4 right-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[10px] font-black uppercase bg-black/60 text-white px-3 py-1.5 rounded-full backdrop-blur-md">Interativo</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 ui-kicker text-muted px-2">
                                        <ListOrdered size={14} className="text-ios-blue" />
                                        Passos da Derivação
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {grammarResult.steps.map((step, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl bg-surface-1/50 border border-default shadow-sm hover:shadow-md transition-shadow">
                                                <span className="w-7 h-7 rounded-xl bg-surface-strong flex items-center justify-center text-[11px] font-black text-secondary font-mono shadow-inner border border-default/20">{idx}</span>
                                                <span className="text-sm font-mono font-bold text-primary truncate">{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center p-6">
                            <div className="max-w-md text-center p-12 glass-panel rounded-[56px] border-2 border-default/50 animate-fade-in shadow-apple-xl">
                                <div className="w-24 h-24 rounded-[40px] bg-ios-purple/10 text-ios-purple flex items-center justify-center mx-auto mb-8 shadow-inner">
                                    <FileText size={48} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-2xl font-black text-primary mb-3 tracking-tight">Pronto para derivar</h3>
                                <p className="text-sm text-secondary leading-relaxed font-medium opacity-80">
                                    Insira uma gramática no painel lateral e digite a palavra que deseja testar no campo inferior para visualizar o processo de derivação.
                                </p>
                                <div className="mt-8 flex justify-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-ios-purple/30"></div>
                                    <div className="w-2 h-2 rounded-full bg-ios-purple/20"></div>
                                    <div className="w-2 h-2 rounded-full bg-ios-purple/10"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Bottom Controls Bar (Consistent with Automaton) */}
            <div className="pointer-events-none absolute inset-x-3 bottom-3 z-30">
                <div className="mx-auto w-full max-w-[1450px]">
                    <div className="glass-card p-3 md:p-4 rounded-[32px] flex flex-col lg:flex-row lg:items-center gap-3 pointer-events-auto shadow-apple-xl border border-default/80 backdrop-blur-2xl">
                        
                        {/* Input Area */}
                        <div className="flex w-full lg:flex-1 items-center bg-surface-soft rounded-2xl px-4 py-1.5 border border-default focus-within:ring-2 focus-within:ring-ios-purple/30 transition-all">
                            <FileText size={18} className="text-muted mr-3" />
                            <input
                                value={grammarInput}
                                onChange={(e) => setGrammarInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && runDerivation()}
                                placeholder="Digite a palavra para testar (ex: a a b b)..."
                                className="flex-1 bg-transparent border-none outline-none text-sm font-mono font-bold py-2 text-primary placeholder:text-muted placeholder:opacity-50 min-w-0"
                            />
                            <div className="flex items-center gap-2 ml-2">
                                <div className="flex items-center bg-surface-muted rounded-xl p-1 border border-default/50">
                                    <button
                                        onClick={() => setGrammarStrategy('leftmost')}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                                            grammarStrategy === 'leftmost' ? 'bg-ios-blue text-white shadow-sm' : 'text-secondary hover:text-primary'
                                        }`}
                                    >
                                        Esquerda
                                    </button>
                                    <button
                                        onClick={() => setGrammarStrategy('rightmost')}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                                            grammarStrategy === 'rightmost' ? 'bg-ios-purple text-white shadow-sm' : 'text-secondary hover:text-primary'
                                        }`}
                                    >
                                        Direita
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:block w-px h-10 bg-border/60 mx-1"></div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 w-full lg:w-auto">
                            <button
                                onClick={runDerivation}
                                className="flex-1 lg:flex-none px-10 py-3 rounded-2xl bg-ios-green text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 active:scale-95"
                            >
                                <Play size={18} fill="currentColor" />
                                Derivar
                            </button>
                            <button
                                onClick={() => { setGrammarInput(''); clearResult(); }}
                                className="p-3 rounded-2xl bg-surface-muted text-secondary hover:text-ios-red hover:bg-ios-red/10 transition-all border border-default/50"
                                title="Limpar resultados"
                            >
                                <RotateCcw size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .btn-transform {
                    @apply px-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-default bg-surface-2/50 hover:bg-ios-purple hover:text-white hover:border-ios-purple hover:shadow-lg hover:shadow-ios-purple/20 transition-all active:scale-95 text-secondary;
                }
            `}</style>
        </div>
    );
};
