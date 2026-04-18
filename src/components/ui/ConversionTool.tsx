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
                { id: 'nfa', label: 'AFN (Autômato Finito Não Determinístico)', type: 'automaton' },
                { id: 'dfa', label: 'AFD (Autômato Finito Determinístico)', type: 'automaton' },
                { id: 'pda', label: 'AP (Autômato de Pilha)', type: 'automaton' }, // For CFG
            ];
        } else if (sourceType === 'regex') {
            return [
                { id: 'nfa', label: 'AFN (Algoritmo de Thompson)', type: 'automaton' },
            ];
        } else if (sourceType === 'automaton') {
            const options = [
                { id: 'grammar', label: 'Gramática Regular / Livre de Contexto', type: 'grammar' },
                { id: 'regex', label: 'Expressão Regular', type: 'regex' },
            ];

            if (sourceAutomaton) {
                if (sourceAutomaton.tipo === 'AFN') {
                    options.push({ id: 'dfa', label: 'Converter para AFD', type: 'automaton' });
                    options.push({ id: 'enfa-nfa', label: 'Remover transições epsilon', type: 'automaton' });
                }
                if (sourceAutomaton.tipo === 'AFD') {
                    // Could add minimization here if available
                }
                if (sourceAutomaton.tipo === 'Moore') {
                    options.push({ id: 'mealy', label: 'Converter para Mealy', type: 'automaton' });
                }
                if (sourceAutomaton.tipo === 'Mealy') {
                    options.push({ id: 'moore', label: 'Converter para Moore', type: 'automaton' });
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
            <div className="overlay-surface w-[92vw] max-w-5xl h-[88vh] flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-default flex items-center justify-between bg-surface-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-status-accent-soft text-status-accent">
                            <ArrowRightLeft size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-primary">Conversor de Modelos</h3>
                            <p className="text-xs text-secondary">
                                Converta entre Gramáticas, Autômatos e Expressões Regulares
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg text-secondary hover:bg-surface-hover transition-colors">
                        <span className="sr-only">Fechar</span>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    
                    {/* Input Column */}
                    <div className="flex-1 border-r border-default flex flex-col min-w-0 bg-surface-1">
                        <div className="p-4 border-b border-default flex items-center justify-between">
                            <span className="ui-kicker text-secondary">Entrada</span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setSourceType('grammar')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${sourceType === 'grammar' ? 'bg-ios-purple text-white' : 'bg-surface-2 text-secondary hover:text-primary'}`}
                                    aria-pressed={sourceType === 'grammar'}
                                >
                                    Gramática
                                </button>
                                <button 
                                    onClick={() => setSourceType('regex')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${sourceType === 'regex' ? 'bg-ios-purple text-white' : 'bg-surface-2 text-secondary hover:text-primary'}`}
                                    aria-pressed={sourceType === 'regex'}
                                >
                                    Regex
                                </button>
                                <button 
                                    onClick={() => setSourceType('automaton')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${sourceType === 'automaton' ? 'bg-ios-purple text-white' : 'bg-surface-2 text-secondary hover:text-primary'}`}
                                    aria-pressed={sourceType === 'automaton'}
                                >
                                    Autômato
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto">
                            {sourceType === 'grammar' && (
                                <div className="h-full flex flex-col">
                                    <textarea
                                        value={sourceText}
                                        onChange={(e) => setSourceText(e.target.value)}
                                        placeholder="S -> a S b | eps"
                                        aria-label="Entrada de gramática"
                                        className="flex-1 w-full bg-surface-2 border border-default rounded-xl p-4 font-mono text-sm text-primary resize-none focus:ring-2 ring-purple-500/30 outline-none"
                                    />
                                    <p className="mt-2 text-xs text-secondary">
                                        Use 'eps' para epsilon. Ex: S -&gt; a A, A -&gt; b
                                    </p>
                                </div>
                            )}

                            {sourceType === 'regex' && (
                                <div className="h-full flex flex-col">
                                    <input
                                        type="text"
                                        value={sourceText}
                                        onChange={(e) => setSourceText(e.target.value)}
                                        placeholder="(a+b)*abb"
                                        aria-label="Entrada de expressão regular"
                                        className="w-full bg-surface-2 border border-default rounded-xl p-4 font-mono text-lg text-primary focus:ring-2 ring-purple-500/30 outline-none mb-4"
                                    />
                                    <div className="p-4 bg-surface-2 rounded-xl border border-default">
                                        <h4 className="font-bold text-sm text-primary mb-2">Sintaxe Suportada</h4>
                                        <ul className="text-xs text-secondary space-y-1 font-mono">
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
                                <div className="h-full flex flex-col">
                                    {sourceAutomaton ? (
                                        <div className="flex-1 relative overflow-hidden rounded-xl border border-default bg-canvas-surface dark:bg-black/20">
                                            <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded bg-black/10 backdrop-blur text-xs font-bold text-primary border border-white/10">
                                                {sourceAutomaton.tipo}
                                            </div>
                                            <AutomatonPreview data={sourceAutomaton} />
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-default rounded-xl">
                                            <Network className="w-12 h-12 text-secondary mb-4 opacity-50" />
                                            <p className="text-sm font-medium text-primary">Nenhum autômato selecionado</p>
                                            <p className="text-xs text-secondary mt-1">Abra esta ferramenta durante um exercício de autômato para importar automaticamente.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Column */}
                    <div className="w-64 border-r border-default bg-surface-2 flex flex-col p-4 gap-4 z-10">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider">Converter para</label>
                            {targetOptions.length > 0 ? (
                                targetOptions.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => {
                                            setTargetFormat(opt.id);
                                        }}
                                        className={`flex items-center gap-2 px-3 py-3 rounded-xl text-xs font-bold text-left transition-all border ${
                                            selectedTarget?.id === opt.id
                                                ? 'bg-ios-purple text-white border-status-accent shadow-lg shadow-purple-500/20'
                                                : 'bg-surface-1 text-primary border-transparent hover:border-default hover:bg-surface-2 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        {opt.type === 'grammar' ? <Type size={14} /> : 
                                         opt.type === 'regex' ? <Braces size={14} /> : 
                                         <Network size={14} />}
                                        {opt.label}
                                    </button>
                                ))
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
                                className="w-full py-3 rounded-xl bg-primary text-inverse font-bold text-sm shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                <ArrowRight size={16} />
                                Converter
                            </button>
                        </div>
                    </div>

                    {/* Output Column */}
                    <div className="flex-1 flex flex-col min-w-0 bg-surface-1">
                        <div className="p-4 border-b border-default flex items-center justify-between">
                            <span className="ui-kicker text-secondary">Resultado</span>
                            {(outputText || outputAutomaton) && (
                                <button
                                    onClick={copyOutput}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 text-xs font-bold text-primary border border-default transition-all"
                                >
                                    {copied ? <Check size={14} className="text-status-success" /> : <Copy size={14} />}
                                    {copied ? 'Copiado!' : 'Copiar'}
                                </button>
                            )}
                        </div>

                        <div className="flex-1 p-6 overflow-hidden relative">
                            {error ? (
                                <div
                                    className="flex items-start gap-3 p-4 rounded-xl bg-status-danger-soft border border-status-danger text-status-danger text-sm"
                                    role="alert"
                                >
                                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                    <div>
                                        <strong className="block font-bold mb-1">Erro na conversão</strong>
                                        {error}
                                    </div>
                                </div>
                            ) : outputAutomaton ? (
                                <div className="relative h-full overflow-hidden rounded-xl border border-default bg-canvas-surface dark:bg-black/20">
                                    <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded bg-black/10 backdrop-blur text-xs font-bold text-primary border border-white/10">
                                        {outputAutomaton.tipo}
                                    </div>
                                    <AutomatonPreview data={outputAutomaton} />
                                </div>
                            ) : outputText ? (
                                <textarea
                                    readOnly
                                    value={outputText}
                                    aria-label="Resultado da conversão"
                                    className="w-full h-full bg-surface-2 border border-default rounded-xl p-4 font-mono text-sm text-primary resize-none outline-none"
                                />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                    <ArrowRight className="w-12 h-12 text-secondary mb-4" />
                                    <p className="text-sm font-medium text-secondary">O resultado aparecerá aqui</p>
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


