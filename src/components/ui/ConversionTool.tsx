import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
    ArrowRightLeft, 
    Copy, 
    Check, 
    Type,
    Braces,
    Network,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import type { AutomatoData } from '../../types';
import { 
    regularGrammarToNfa, 
    regularGrammarToDfa,
    cfgToPda, 
    pdaToCfg,
    mooreToMealy, 
    mealyToMoore,
    automatonToGrammar,
    automatonToRegex,
    nfaToDfa,
    eliminateEpsilonTransitions,
    regexToNfa
} from '../../utils/conversions';
import { AutomatonPreview } from '../automaton';

type ConversionType = 'grammar' | 'regex' | 'automaton';
type TargetOption = {
    id: string;
    label: string;
    description: string;
    type: ConversionType;
};

interface ConversionToolProps {
    isOpen: boolean;
    onClose: () => void;
    initialAutomaton?: AutomatoData | null;
    initialGrammar?: string;
    initialRegex?: string;
}

export const ConversionTool = ({
    isOpen,
    onClose,
    initialAutomaton,
    initialGrammar,
    initialRegex
}: ConversionToolProps) => {
    // Source State
    const [sourceType, setSourceType] = useState<ConversionType>('automaton');
    const [sourceText, setSourceText] = useState(''); // Grammar or Regex
    const [sourceAutomaton, setSourceAutomaton] = useState<AutomatoData | null>(null);

    // Target State
    const [targetFormat, setTargetFormat] = useState<string>('default'); // Specific format (e.g. DFA vs NFA)
    
    // Output State
    const [outputText, setOutputText] = useState('');
    const [outputAutomaton, setOutputAutomaton] = useState<AutomatoData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const prevInitialAutomatonIdRef = useRef<string | null>(null);

    // Initialize from props - only once per unique automaton
    useEffect(() => {
        // Create a stable identifier for the automaton
        const automatonId = initialAutomaton
            ? `${initialAutomaton.tipo}-${initialAutomaton.estados.length}-${initialAutomaton.transicoes.length}`
            : null;

        if (initialGrammar) {
            setSourceType('grammar');
            setSourceText(initialGrammar);
        } else if (initialRegex) {
            setSourceType('regex');
            setSourceText(initialRegex);
        } else if (initialAutomaton && automatonId !== prevInitialAutomatonIdRef.current) {
            prevInitialAutomatonIdRef.current = automatonId;
            setSourceType('automaton');
            setSourceAutomaton(initialAutomaton);
        }
    }, [initialAutomaton, initialGrammar, initialRegex]);

    // Available target formats based on source
    const targetOptions = useMemo(() => {
        if (sourceType === 'grammar') {
            return [
                { id: 'nfa', label: 'AFN', description: 'Construção a partir de gramática regular.', type: 'automaton' },
                { id: 'dfa', label: 'AFD', description: 'AFN convertido para forma determinística.', type: 'automaton' },
                { id: 'pda', label: 'AP', description: 'Autômato de pilha para gramática livre de contexto.', type: 'automaton' },
            ];
        } else if (sourceType === 'regex') {
            return [
                { id: 'nfa', label: 'AFN', description: 'Construção de Thompson.', type: 'automaton' },
            ];
        } else if (sourceType === 'automaton') {
            const options: TargetOption[] = [
                { id: 'grammar', label: 'Gramática', description: 'Regras equivalentes ao modelo atual.', type: 'grammar' },
                { id: 'regex', label: 'Expressão regular', description: 'Descrição algébrica da linguagem.', type: 'regex' },
            ];

            if (sourceAutomaton) {
                if (sourceAutomaton.tipo === 'AFN') {
                    options.push({ id: 'dfa', label: 'AFD', description: 'Determinização por subconjuntos.', type: 'automaton' });
                    options.push({ id: 'enfa-nfa', label: 'Sem ε', description: 'Remove transições vazias preservando linguagem.', type: 'automaton' });
                }
                if (sourceAutomaton.tipo === 'AFD') {
                    // Could add minimization here if available
                }
                if (sourceAutomaton.tipo === 'Moore') {
                    options.push({ id: 'mealy', label: 'Mealy', description: 'Saídas movidas para as transições.', type: 'automaton' });
                }
                if (sourceAutomaton.tipo === 'Mealy') {
                    options.push({ id: 'moore', label: 'Moore', description: 'Saídas movidas para os estados.', type: 'automaton' });
                }
            }
            return options;
        }
        return [];
    }, [sourceType, sourceAutomaton]);

    const selectedTarget = useMemo(() => {
        if (targetOptions.length === 0) return null;
        return targetOptions.find(option => option.id === targetFormat) ?? targetOptions[0];
    }, [targetOptions, targetFormat]);

    const sourceLabel = sourceType === 'grammar'
        ? 'Gramática'
        : sourceType === 'regex'
            ? 'Expressão regular'
            : sourceAutomaton?.tipo ?? 'Autômato';

    const hasOutput = Boolean(outputText || outputAutomaton);

    const handleConvert = () => {
        setError(null);
        setOutputText('');
        setOutputAutomaton(null);

        try {
            const selectedFormat = selectedTarget?.id ?? targetFormat;

            if (sourceType === 'grammar') {
                if (selectedFormat === 'nfa') {
                    const res = regularGrammarToNfa(sourceText);
                    if (res.error) throw new Error(res.error);
                    setOutputAutomaton(res.automaton!);
                } else if (selectedFormat === 'dfa') {
                    const res = regularGrammarToDfa(sourceText);
                    if (res.error) throw new Error(res.error);
                    setOutputAutomaton(res.automaton!);
                } else if (selectedFormat === 'pda') {
                    const res = cfgToPda(sourceText);
                    if (res.error) throw new Error(res.error);
                    setOutputAutomaton(res.automaton!);
                }
            } else if (sourceType === 'regex') {
                const nfa = regexToNfa(sourceText);
                setOutputAutomaton(nfa);
            } else if (sourceType === 'automaton' && sourceAutomaton) {
                if (selectedFormat === 'grammar') {
                    if (sourceAutomaton.tipo === 'AP') {
                        const res = pdaToCfg(sourceAutomaton);
                        if (res.error) throw new Error(res.error);
                        setOutputText(res.grammar!);
                    } else {
                        setOutputText(automatonToGrammar(sourceAutomaton));
                    }
                } else if (selectedFormat === 'regex') {
                    setOutputText(automatonToRegex(sourceAutomaton));
                } else if (selectedFormat === 'dfa') {
                    setOutputAutomaton(nfaToDfa(sourceAutomaton));
                } else if (selectedFormat === 'enfa-nfa') {
                    setOutputAutomaton(eliminateEpsilonTransitions(sourceAutomaton).automaton);
                } else if (selectedFormat === 'mealy') {
                    setOutputAutomaton(mooreToMealy(sourceAutomaton));
                } else if (selectedFormat === 'moore') {
                    setOutputAutomaton(mealyToMoore(sourceAutomaton));
                }
            }
        } catch (e) {
            setError((e as Error).message);
        }
    };

    const copyOutput = () => {
        const text = outputText || JSON.stringify(outputAutomaton, null, 2);
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen || typeof document === 'undefined') return null;

    return createPortal(
        <div className="overlay-backdrop animate-fade-in" onClick={onClose}>
            <div className="overlay-surface flex h-[88vh] w-[92vw] max-w-6xl flex-col animate-scale-in overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-default bg-surface-1 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-status-accent-soft p-2 text-status-accent">
                            <ArrowRightLeft size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-primary">Conversor</h3>
                            <p className="text-xs text-secondary">
                                Transforme a representação sem sair do exercício.
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-secondary transition-colors hover:bg-surface-hover">
                        <span className="sr-only">Fechar</span>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.15fr)_18rem_minmax(0,1fr)] overflow-hidden">
                    
                    {/* Input Column */}
                    <div className="flex min-w-0 flex-col border-r border-default bg-surface-1">
                        <div className="flex items-center justify-between gap-3 border-b border-default p-4">
                            <div>
                                <span className="ui-kicker text-secondary">Entrada</span>
                                <div className="mt-1 text-sm font-bold text-primary">{sourceLabel}</div>
                            </div>
                            <div className="flex rounded-full border border-default bg-surface-2 p-1">
                                <button 
                                    onClick={() => setSourceType('grammar')}
                                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${sourceType === 'grammar' ? 'bg-ios-purple text-white' : 'text-secondary hover:text-primary'}`}
                                    aria-pressed={sourceType === 'grammar'}
                                >
                                    Gramática
                                </button>
                                <button 
                                    onClick={() => setSourceType('regex')}
                                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${sourceType === 'regex' ? 'bg-ios-purple text-white' : 'text-secondary hover:text-primary'}`}
                                    aria-pressed={sourceType === 'regex'}
                                >
                                    Regex
                                </button>
                                <button 
                                    onClick={() => setSourceType('automaton')}
                                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${sourceType === 'automaton' ? 'bg-ios-purple text-white' : 'text-secondary hover:text-primary'}`}
                                    aria-pressed={sourceType === 'automaton'}
                                >
                                    Autômato
                                </button>
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto p-5">
                            {sourceType === 'grammar' && (
                                <div className="flex h-full flex-col">
                                    <textarea
                                        value={sourceText}
                                        onChange={(e) => setSourceText(e.target.value)}
                                        placeholder="S -> a S b | eps"
                                        aria-label="Entrada de gramática"
                                        className="w-full flex-1 resize-none rounded-2xl border border-default bg-surface-2 p-4 font-mono text-sm text-primary outline-none ring-purple-500/30 focus:ring-2"
                                    />
                                    <p className="mt-2 text-xs text-secondary">
                                        Use 'eps' para epsilon. Ex: S -&gt; a A, A -&gt; b
                                    </p>
                                </div>
                            )}

                            {sourceType === 'regex' && (
                                <div className="flex h-full flex-col">
                                    <input
                                        type="text"
                                        value={sourceText}
                                        onChange={(e) => setSourceText(e.target.value)}
                                        placeholder="(a+b)*abb"
                                        aria-label="Entrada de expressão regular"
                                        className="mb-4 w-full rounded-2xl border border-default bg-surface-2 p-4 font-mono text-lg text-primary outline-none ring-purple-500/30 focus:ring-2"
                                    />
                                    <div className="rounded-2xl border border-default bg-surface-2 p-4">
                                        <h4 className="mb-2 text-sm font-bold text-primary">Sintaxe suportada</h4>
                                        <ul className="space-y-1 font-mono text-xs text-secondary">
                                            <li>+ : União (ou |)</li>
                                            <li>* : Fecho de Kleene</li>
                                            <li>? : Opcional</li>
                                            <li>. : Concatenação (implícita)</li>
                                            <li>eps : Vazio</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {sourceType === 'automaton' && (
                                <div className="flex h-full flex-col">
                                    {sourceAutomaton ? (
                                        <div className="relative flex-1 overflow-hidden rounded-2xl border border-default bg-canvas-surface dark:bg-black/20">
                                            <div className="absolute left-3 top-3 z-10 rounded-full border border-white/10 bg-black/10 px-2.5 py-1 text-xs font-bold text-primary backdrop-blur">
                                                {sourceAutomaton.tipo}
                                            </div>
                                            <AutomatonPreview data={sourceAutomaton} />
                                        </div>
                                    ) : (
                                        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-default p-8 text-center">
                                            <Network className="mb-4 h-12 w-12 text-secondary opacity-50" />
                                            <p className="text-sm font-medium text-primary">Nenhum autômato selecionado</p>
                                            <p className="mt-1 text-xs text-secondary">Abra esta ferramenta durante um exercício de autômato para importar automaticamente.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Column */}
                    <div className="z-10 flex min-w-0 flex-col gap-4 border-r border-default bg-surface-2 p-4">
                        <div className="rounded-2xl border border-default bg-surface-1/70 p-3">
                            <div className="ui-kicker text-secondary">Fluxo</div>
                            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-primary">
                                <span className="max-w-[7rem] truncate">{sourceLabel}</span>
                                <ArrowRight size={14} className="text-secondary" />
                                <span className="min-w-0 truncate text-status-accent">{selectedTarget?.label ?? 'Destino'}</span>
                            </div>
                        </div>

                        <div className="flex min-h-0 flex-1 flex-col gap-2">
                            <label className="ui-kicker text-secondary">Destino</label>
                            {targetOptions.length > 0 ? (
                                <div className="min-h-0 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                                    {targetOptions.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => {
                                            setTargetFormat(opt.id);
                                        }}
                                        className={`flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition-all ${
                                            selectedTarget?.id === opt.id
                                                ? 'border-status-accent bg-status-accent-soft text-primary shadow-lg shadow-purple-500/10'
                                                : 'border-transparent bg-surface-1 text-primary hover:border-default hover:bg-surface-2 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <span className={`mt-0.5 rounded-xl p-2 ${
                                            selectedTarget?.id === opt.id
                                                ? 'bg-status-accent text-white'
                                                : 'bg-surface-2 text-secondary'
                                        }`}>
                                            {opt.type === 'grammar' ? <Type size={14} /> :
                                                opt.type === 'regex' ? <Braces size={14} /> :
                                                    <Network size={14} />}
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-sm font-bold">{opt.label}</span>
                                            <span className="mt-1 block text-xs leading-snug text-secondary">{opt.description}</span>
                                        </span>
                                    </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="surface-soft-panel rounded-xl border border-default p-3 text-center text-xs text-secondary dark:bg-white/5">
                                    Nenhuma conversão disponível para esta entrada.
                                </div>
                            )}
                        </div>

                        <div className="mt-auto">
                            <button
                                onClick={handleConvert}
                                disabled={targetOptions.length === 0}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-inverse shadow-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ArrowRight size={16} />
                                Gerar resultado
                            </button>
                        </div>
                    </div>

                    {/* Output Column */}
                    <div className="flex min-w-0 flex-col bg-surface-1">
                        <div className="flex items-center justify-between border-b border-default p-4">
                            <div>
                                <span className="ui-kicker text-secondary">Resultado</span>
                                <div className="mt-1 text-sm font-bold text-primary">
                                    {hasOutput ? selectedTarget?.label : 'Aguardando conversão'}
                                </div>
                            </div>
                            {hasOutput && (
                                <button
                                    onClick={copyOutput}
                                    className="flex items-center gap-1.5 rounded-lg border border-default bg-surface-2 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-surface-3"
                                >
                                    {copied ? <Check size={14} className="text-status-success" /> : <Copy size={14} />}
                                    {copied ? 'Copiado!' : 'Copiar'}
                                </button>
                            )}
                        </div>

                        <div className="relative flex-1 overflow-hidden p-5">
                            {error ? (
                                <div
                                    className="flex items-start gap-3 rounded-xl border border-status-danger bg-status-danger-soft p-4 text-sm text-status-danger"
                                    role="alert"
                                >
                                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                    <div>
                                        <strong className="mb-1 block font-bold">Erro na conversão</strong>
                                        {error}
                                    </div>
                                </div>
                            ) : outputAutomaton ? (
                                <div className="relative h-full overflow-hidden rounded-2xl border border-default bg-canvas-surface dark:bg-black/20">
                                    <div className="absolute left-3 top-3 z-10 rounded-full border border-white/10 bg-black/10 px-2.5 py-1 text-xs font-bold text-primary backdrop-blur">
                                        {outputAutomaton.tipo}
                                    </div>
                                    <AutomatonPreview data={outputAutomaton} />
                                </div>
                            ) : outputText ? (
                                <textarea
                                    readOnly
                                    value={outputText}
                                    aria-label="Resultado da conversão"
                                    className="h-full w-full resize-none rounded-2xl border border-default bg-surface-2 p-4 font-mono text-sm text-primary outline-none"
                                />
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-default bg-surface-2/40 p-8 text-center">
                                    <ArrowRight className="mb-4 h-10 w-10 text-secondary opacity-50" />
                                    <p className="text-sm font-bold text-primary">Escolha o destino e gere o resultado</p>
                                    <p className="mt-2 max-w-xs text-xs leading-relaxed text-secondary">
                                        O modelo convertido aparece aqui para inspeção ou cópia.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};


