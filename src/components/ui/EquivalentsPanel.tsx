import React, { useState, useMemo, useCallback } from 'react';
import {
    RefreshCcw,
    Code2,
    FileText,
    Binary,
    GitBranch,
    Minimize2,
    Zap,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    AlertCircle,
    Sparkles,
    Eye,
} from 'lucide-react';
import type { AutomatoData } from '../../types';
import { isAP, isMT, isALL, isMoore, isMealy } from '../../types';
import {
    automatonToRegex,
    automatonToGrammar,
    automatonToTuple,
    automatonToDot,
    nfaToDfa,
    minimizeDfa,
    eliminateEpsilonTransitions,
    getAlphabet,
} from '../../utils/conversions';
import { cn } from '../../utils/cn';

interface EquivalentsPanelProps {
    data: AutomatoData;
    onLoadEquivalent?: (data: AutomatoData) => void;
}


const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, [text]);

    return (
        <button
            onClick={handleCopy}
            className={cn(
                'p-1.5 rounded-lg transition-all',
                copied
                    ? 'bg-ios-green/20 text-ios-green'
                    : 'text-muted hover:bg-surface-hover hover:text-primary'
            )}
            title={copied ? 'Copiado!' : 'Copiar'}
        >
            {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
    );
};

const ExpandableSection: React.FC<{
    title: string;
    icon: React.ElementType;
    description: string;
    content: string | null;
    error?: string;
    onLoadAutomaton?: () => void;
    category: 'representation' | 'conversion';
}> = ({ title, icon: Icon, description, content, error, onLoadAutomaton, category }) => {
    const [expanded, setExpanded] = useState(false);

    const categoryColor =
        category === 'representation'
            ? 'text-ios-blue bg-ios-blue/10'
            : 'text-ios-purple bg-ios-purple/10';

    return (
        <div className="border border-default rounded-xl overflow-hidden bg-surface-soft">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-3 hover:bg-surface-hover transition-colors"
            >
                <div className="flex items-center gap-2">
                    <div className={cn('p-1.5 rounded-lg', categoryColor)}>
                        <Icon size={14} />
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-semibold text-primary">{title}</div>
                        <div className="text-xs text-muted">{description}</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {error && (
                        <span className="text-xs text-ios-orange flex items-center gap-1">
                            <AlertCircle size={12} />
                            N/A
                        </span>
                    )}
                    {expanded ? (
                        <ChevronUp size={16} className="text-muted" />
                    ) : (
                        <ChevronDown size={16} className="text-muted" />
                    )}
                </div>
            </button>

            {expanded && (
                <div className="border-t border-default p-3 bg-surface-muted animate-scale-in origin-top">
                    {error ? (
                        <div className="flex items-center gap-2 rounded-lg border border-default bg-surface-soft px-3 py-2 text-xs text-secondary">
                            <AlertCircle size={14} className="text-ios-orange" />
                            {error}
                        </div>
                    ) : content ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-muted uppercase">
                                    Resultado
                                </span>
                                <div className="flex items-center gap-1">
                                    {onLoadAutomaton && (
                                        <button
                                            onClick={onLoadAutomaton}
                                            className="p-1.5 rounded-lg text-muted hover:bg-surface-hover hover:text-ios-blue transition-all flex items-center gap-1 text-xs font-semibold"
                                            title="Carregar no editor"
                                        >
                                            <Eye size={14} />
                                            Visualizar
                                        </button>
                                    )}
                                    <CopyButton text={content} />
                                </div>
                            </div>
                            <pre className="text-xs font-mono text-secondary bg-surface-soft p-3 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-64 custom-scrollbar border border-default">
                                {content}
                            </pre>
                        </div>
                    ) : (
                        <div className="text-xs text-muted">Nenhum resultado disponível</div>
                    )}
                </div>
            )}
        </div>
    );
};

export const EquivalentsPanel: React.FC<EquivalentsPanelProps> = ({
    data,
    onLoadEquivalent,
}) => {
    const [activeTab, setActiveTab] = useState<'representations' | 'conversions'>('representations');

    // Check if automaton type supports conversions
    const isPda = isAP(data);
    const isTuring = isMT(data) || isALL(data);
    const isTransducer = isMoore(data) || isMealy(data);
    const supportsRegularConversions = !isPda && !isTuring && !isTransducer;
    const isNfa = data.tipo === 'AFN';
    const isDfa = data.tipo === 'AFD';

    // Compute equivalents lazily with useMemo
    const equivalents = useMemo(() => {
        const results: {
            regex: { value: string | null; error?: string };
            grammar: { value: string | null; error?: string };
            tuple: { value: string | null; error?: string };
            dot: { value: string | null; error?: string };
            dfa: { value: AutomatoData | null; error?: string };
            minimized: { value: AutomatoData | null; error?: string };
            noEpsilon: { value: AutomatoData | null; error?: string };
        } = {
            regex: { value: null },
            grammar: { value: null },
            tuple: { value: null },
            dot: { value: null },
            dfa: { value: null },
            minimized: { value: null },
            noEpsilon: { value: null },
        };

        // Only compute if we have states
        if (data.estados.length === 0) {
            return results;
        }

        // Regex
        if (supportsRegularConversions) {
            try {
                results.regex.value = automatonToRegex(data);
            } catch (err) {
                results.regex.error = err instanceof Error ? err.message : 'Erro desconhecido';
            }
        } else {
            results.regex.error = 'Não suportado para este tipo de autômato';
        }

        // Grammar
        if (supportsRegularConversions) {
            try {
                results.grammar.value = automatonToGrammar(data);
            } catch (err) {
                results.grammar.error = err instanceof Error ? err.message : 'Erro desconhecido';
            }
        } else {
            results.grammar.error = 'Não suportado para este tipo de autômato';
        }

        // 5-tuple
        if (!isPda) {
            try {
                results.tuple.value = automatonToTuple(data);
            } catch (err) {
                results.tuple.error = err instanceof Error ? err.message : 'Erro desconhecido';
            }
        } else {
            results.tuple.error = 'Usar 7-tupla para AP';
        }

        // DOT format
        try {
            results.dot.value = automatonToDot(data);
        } catch (err) {
            results.dot.error = err instanceof Error ? err.message : 'Erro desconhecido';
        }

        // NFA to DFA
        if (isNfa) {
            try {
                results.dfa.value = nfaToDfa(data);
            } catch (err) {
                results.dfa.error = err instanceof Error ? err.message : 'Erro desconhecido';
            }
        } else if (isDfa) {
            results.dfa.error = 'Já é um AFD';
        } else {
            results.dfa.error = 'Não aplicável';
        }

        // Minimized DFA
        if (isDfa) {
            try {
                results.minimized.value = minimizeDfa(data);
            } catch (err) {
                results.minimized.error = err instanceof Error ? err.message : 'Erro desconhecido';
            }
        } else if (isNfa) {
            // First convert to DFA, then minimize
            try {
                const dfaResult = nfaToDfa(data);
                results.minimized.value = minimizeDfa(dfaResult);
            } catch (err) {
                results.minimized.error = err instanceof Error ? err.message : 'Erro desconhecido';
            }
        } else {
            results.minimized.error = 'Não aplicável';
        }

        // Eliminate epsilon transitions
        if ((isNfa || isDfa) && data.transicoes.some(t =>
            t.simbolo.includes('ε') || t.simbolo.includes('eps') || t.simbolo === ''
        )) {
            try {
                const result = eliminateEpsilonTransitions(data);
                results.noEpsilon.value = result.automaton;
            } catch (err) {
                results.noEpsilon.error = err instanceof Error ? err.message : 'Erro desconhecido';
            }
        } else if (supportsRegularConversions) {
            results.noEpsilon.error = 'Não há ε-transições';
        } else {
            results.noEpsilon.error = 'Não aplicável';
        }

        return results;
    }, [data, supportsRegularConversions, isNfa, isDfa, isPda]);

    const handleLoadAutomaton = useCallback(
        (automaton: AutomatoData | null) => {
            if (automaton && onLoadEquivalent) {
                onLoadEquivalent(automaton);
            }
        },
        [onLoadEquivalent]
    );

    const formatAutomatonAsText = (automaton: AutomatoData | null): string | null => {
        if (!automaton) return null;
        return JSON.stringify(automaton, null, 2);
    };

    const conversionSections = [
        {
            title: 'AFN → AFD',
            icon: Zap,
            description: 'Conversão por construção de subconjuntos',
            content: formatAutomatonAsText(equivalents.dfa.value),
            automaton: equivalents.dfa.value,
        },
        {
            title: 'AFD Minimizado',
            icon: Minimize2,
            description: 'Estados equivalentes colapsados',
            content: formatAutomatonAsText(equivalents.minimized.value),
            automaton: equivalents.minimized.value,
        },
        {
            title: 'Sem ε-transições',
            icon: RefreshCcw,
            description: 'Eliminação de transições vazias',
            content: formatAutomatonAsText(equivalents.noEpsilon.value),
            automaton: equivalents.noEpsilon.value,
        },
    ].filter((section) => section.content);

    return (
        <div className="glass-panel p-4 rounded-2xl shadow-apple-md border border-default animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-ios-purple to-ios-blue text-white">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h3 className="font-bold text-primary">Equivalentes</h3>
                        <p className="text-xs text-muted">
                            Representações e conversões em tempo real
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted">
                    <RefreshCcw size={12} />
                    Automático
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-surface-muted rounded-xl mb-4">
                <button
                    onClick={() => setActiveTab('representations')}
                    className={cn(
                        'flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                        activeTab === 'representations'
                            ? 'bg-ios-blue text-white shadow'
                            : 'text-secondary hover:bg-surface-hover'
                    )}
                >
                    <Code2 size={14} className="inline mr-1" />
                    Representações
                </button>
                <button
                    onClick={() => setActiveTab('conversions')}
                    className={cn(
                        'flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                        activeTab === 'conversions'
                            ? 'bg-ios-purple text-white shadow'
                            : 'text-secondary hover:bg-surface-hover'
                    )}
                >
                    <GitBranch size={14} className="inline mr-1" />
                    Conversões
                </button>
            </div>

            {/* Info Banner */}
            {!supportsRegularConversions && (
                <div className="mb-4 p-3 rounded-xl bg-ios-orange/10 border border-ios-orange/20 text-xs text-ios-orange flex items-start gap-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <div>
                        <span className="font-semibold">Tipo limitado:</span>{' '}
                        {isPda && 'Autômatos com Pilha não suportam conversão para regex/gramática regular.'}
                        {isTuring && 'Máquinas de Turing não suportam conversões regulares.'}
                        {isTransducer && 'Transdutores (Moore/Mealy) não suportam conversões regulares.'}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                {activeTab === 'representations' && (
                    <>
                        <ExpandableSection
                            title="Expressão Regular"
                            icon={Code2}
                            description="Regex equivalente usando eliminação de estados"
                            content={equivalents.regex.value}
                            error={equivalents.regex.error}
                            category="representation"
                        />
                        <ExpandableSection
                            title="Gramática Regular"
                            icon={FileText}
                            description="Gramática linear à direita equivalente"
                            content={equivalents.grammar.value}
                            error={equivalents.grammar.error}
                            category="representation"
                        />
                        <ExpandableSection
                            title="5-Tupla Formal"
                            icon={Binary}
                            description="Definição formal M = (Q, Σ, δ, q₀, F)"
                            content={equivalents.tuple.value}
                            error={equivalents.tuple.error}
                            category="representation"
                        />
                        <ExpandableSection
                            title="Formato DOT"
                            icon={GitBranch}
                            description="Graphviz DOT para visualização externa"
                            content={equivalents.dot.value}
                            error={equivalents.dot.error}
                            category="representation"
                        />
                    </>
                )}

                {activeTab === 'conversions' && (
                    conversionSections.length > 0 ? (
                        <>
                            {conversionSections.map((section) => (
                                <ExpandableSection
                                    key={section.title}
                                    title={section.title}
                                    icon={section.icon}
                                    description={section.description}
                                    content={section.content}
                                    onLoadAutomaton={() => handleLoadAutomaton(section.automaton)}
                                    category="conversion"
                                />
                            ))}
                        </>
                    ) : (
                        <div className="rounded-xl border border-dashed border-default bg-surface-soft p-4 text-xs leading-relaxed text-secondary">
                            Nenhuma conversão aplicável para este tipo de autômato.
                        </div>
                    )
                )}
            </div>

            {/* Stats */}
            <div className="mt-4 pt-3 border-t border-default">
                <div className="flex items-center justify-between text-xs text-muted">
                    <span>
                        {data.estados.length} estados • {data.transicoes.length} transições
                    </span>
                    <span>
                        Σ = {'{'}
                        {getAlphabet(data).join(', ') || 'vazio'}
                        {'}'}
                    </span>
                </div>
            </div>
        </div>
    );
};


