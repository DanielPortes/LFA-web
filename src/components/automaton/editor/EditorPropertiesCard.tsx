import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import type { AutomatoData } from '../../../types';
import type { EditorPdaProps } from './types';

interface EditorPropertiesCardProps {
    data: AutomatoData;
    pdaProps: EditorPdaProps;
    readOnly?: boolean;
    showProps: boolean;
    alphabetInput: string;
    stackAlphabetInput: string;
    stackStartSymbol: string;
    onToggleProps: () => void;
    onTypeChange: (nextTipo: AutomatoData['tipo']) => void;
    onAutoAlphabet: () => void;
    onAlphabetInputChange: (value: string) => void;
    onAlphabetFocus: () => void;
    onAlphabetCommit: (value: string) => void;
    onStackAlphabetInputChange: (value: string) => void;
    onStackAlphabetFocus: () => void;
    onStackAlphabetCommit: (value: string) => void;
    onStackStartChange: (value: string) => void;
    onStackStartFocus: () => void;
    onStackStartCommit: (value: string) => void;
}

const PDA_ACCEPTANCE_LABELS = {
    final: 'estado final',
    empty: 'pilha vazia',
    both: 'estado final ou pilha vazia',
} satisfies Record<NonNullable<EditorPdaProps['pdaAcceptance']>, string>;

const MACHINE_ROLE_COPY = {
    AFD: 'Autômato finito determinístico: uma escolha por símbolo. Se você criar não determinismo, o simulador muda para AFN automaticamente.',
    AFN: 'Autômato finito não determinístico: permite múltiplos caminhos e transições ε. Se ficar determinístico, o simulador volta para AFD.',
    AP: 'Usa uma pilha como memória auxiliar; escolha este modelo para linguagens livres de contexto e transições no formato a, Z -> AZ.',
    MT: 'Usa fita, leitura, escrita e movimento do cabeçote; escolha para algoritmos e linguagens recursivamente enumeráveis.',
    ALL: 'Máquina de Turing com fita limitada pela entrada; escolha para estudar linguagens sensíveis ao contexto.',
    Moore: 'Transdutor com saída nos estados; escolha quando a resposta depende do estado alcançado.',
    Mealy: 'Transdutor com saída nas transições; escolha quando a resposta depende da aresta percorrida.',
    GR: 'Gramática regular: use quando a representação principal for por produções, não por estados e transições.',
    ER: 'Expressão regular: use quando a representação principal for uma fórmula de padrões sobre cadeias.',
} satisfies Record<AutomatoData['tipo'], string>;

const MACHINE_TYPE_GROUPS: Array<{
    label: string;
    options: Array<{ value: AutomatoData['tipo']; label: string; shortLabel: string }>;
}> = [
    {
        label: 'Autômatos finitos',
        options: [
            { value: 'AFD', label: 'AFD', shortLabel: 'AFD' },
            { value: 'AFN', label: 'AFN', shortLabel: 'AFN' },
        ],
    },
    {
        label: 'Memória auxiliar',
        options: [
            { value: 'AP', label: 'Autômato com Pilha', shortLabel: 'AP' },
            { value: 'MT', label: 'Máquina de Turing', shortLabel: 'MT' },
            { value: 'ALL', label: 'Linearmente Limitado', shortLabel: 'ALL' },
        ],
    },
    {
        label: 'Transdutores',
        options: [
            { value: 'Moore', label: 'Máquina de Moore', shortLabel: 'Moore' },
            { value: 'Mealy', label: 'Máquina de Mealy', shortLabel: 'Mealy' },
        ],
    },
];

const MACHINE_TYPE_OPTIONS = MACHINE_TYPE_GROUPS.flatMap((group) => group.options);

export const EditorPropertiesCard: React.FC<EditorPropertiesCardProps> = ({
    data,
    pdaProps,
    readOnly = false,
    showProps,
    alphabetInput,
    stackAlphabetInput,
    stackStartSymbol,
    onToggleProps,
    onTypeChange,
    onAutoAlphabet,
    onAlphabetInputChange,
    onAlphabetFocus,
    onAlphabetCommit,
    onStackAlphabetInputChange,
    onStackAlphabetFocus,
    onStackAlphabetCommit,
    onStackStartChange,
    onStackStartFocus,
    onStackStartCommit,
}) => {
    const [typeMenuOpen, setTypeMenuOpen] = useState(false);
    const [typeMenuPosition, setTypeMenuPosition] = useState<React.CSSProperties | null>(null);
    const typeButtonRef = useRef<HTMLButtonElement | null>(null);
    const selectedType = MACHINE_TYPE_OPTIONS.find((option) => option.value === data.tipo);

    useLayoutEffect(() => {
        if (!typeMenuOpen || !typeButtonRef.current || typeof window === 'undefined') return;

        const updatePosition = () => {
            const rect = typeButtonRef.current?.getBoundingClientRect();
            if (!rect) return;
            const width = Math.max(288, rect.width);
            const viewportGap = 12;
            const left = Math.min(
                Math.max(viewportGap, rect.right - width),
                window.innerWidth - width - viewportGap
            );
            const top = Math.min(rect.bottom + 8, window.innerHeight - 320);

            setTypeMenuPosition({ left, top, width });
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [typeMenuOpen]);

    return (
        <div className="glass-panel p-1 rounded-2xl shadow-apple-md border border-default w-full animate-fade-in-up transition-all">
            <button
                onClick={onToggleProps}
                className="w-full flex items-center justify-between p-3 text-secondary hover:bg-surface-hover rounded-xl transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Settings size={16} />
                    <span className="ui-kicker">Propriedades</span>
                </div>
                {showProps ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

        {showProps && (
            <div className="px-3 pb-3 pt-1 space-y-3 animate-scale-in origin-top">
                <div className="space-y-2 rounded-2xl border border-default/60 bg-surface-muted/25 p-3">
                    <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-bold text-muted uppercase">Família de máquina</label>
                        <span className="rounded-full border border-default bg-surface-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-secondary">
                            muda regras
                        </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-secondary">
                        Define quais regras o simulador usa para validar transições, executar entradas e mostrar ferramentas.
                    </p>
                    <div className="relative">
                        <button
                            ref={typeButtonRef}
                            type="button"
                            onClick={() => setTypeMenuOpen((open) => !open)}
                            disabled={readOnly}
                            className="flex w-full items-center justify-between gap-3 rounded-xl border border-default bg-surface-muted px-3 py-2 text-left text-sm font-bold text-primary outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ios-blue/30 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-haspopup="listbox"
                            aria-expanded={typeMenuOpen}
                            aria-label="Selecionar família de máquina"
                        >
                            <span className="min-w-0 truncate">{selectedType?.label ?? data.tipo}</span>
                            <ChevronDown size={14} className={`shrink-0 text-secondary transition-transform ${typeMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {typeMenuOpen && typeMenuPosition && typeof document !== 'undefined' && createPortal(
                            <div
                                role="listbox"
                                aria-label="Famílias de máquina"
                                className="fixed z-[140] max-h-[320px] overflow-y-auto rounded-2xl border border-ios-blue/70 bg-surface-1 p-2 shadow-apple-xl ring-1 ring-ios-blue/20 custom-scrollbar"
                                style={typeMenuPosition}
                            >
                                {MACHINE_TYPE_GROUPS.map((group) => (
                                    <div key={group.label} className="space-y-1 py-1">
                                        <div className="px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-muted">
                                            {group.label}
                                        </div>
                                        {group.options.map((option) => {
                                            const selected = option.value === data.tipo;

                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    role="option"
                                                    aria-selected={selected}
                                                    onClick={() => {
                                                        onTypeChange(option.value);
                                                        setTypeMenuOpen(false);
                                                    }}
                                                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold transition-colors ${
                                                        selected
                                                            ? 'bg-ios-blue text-white'
                                                            : 'text-primary hover:bg-surface-hover'
                                                    }`}
                                                >
                                                    <span className="min-w-0 truncate">{option.label}</span>
                                                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${
                                                        selected
                                                            ? 'border-white/35 bg-white/15 text-white'
                                                            : 'border-default bg-surface-muted text-secondary'
                                                    }`}>
                                                        {option.shortLabel}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>,
                            document.body
                        )}
                    </div>
                    <p className="rounded-xl border border-default/50 bg-surface-1/70 px-3 py-2 text-[11px] leading-relaxed text-secondary">
                        {MACHINE_ROLE_COPY[data.tipo]}
                    </p>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-muted uppercase">Alfabeto</label>
                        <button onClick={onAutoAlphabet} className="text-xs text-ios-blue hover:underline">
                            Auto
                        </button>
                    </div>
                    <input
                        value={alphabetInput}
                        onChange={(event) => onAlphabetInputChange(event.target.value)}
                        onFocus={onAlphabetFocus}
                        onBlur={(event) => onAlphabetCommit(event.target.value)}
                        className="w-full bg-surface-muted border border-default rounded-lg px-2 py-1.5 text-sm font-mono outline-none focus:ring-2 ring-ios-blue/30"
                        placeholder="ex: a, b"
                        disabled={readOnly}
                    />
                </div>

                {data.tipo === 'AP' && (
                    <>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-muted uppercase">Alfabeto Pilha</label>
                            <input
                                value={stackAlphabetInput}
                                onChange={(event) => onStackAlphabetInputChange(event.target.value)}
                                onFocus={onStackAlphabetFocus}
                                onBlur={(event) => onStackAlphabetCommit(event.target.value)}
                                className="w-full bg-surface-muted border border-default rounded-lg px-2 py-1.5 text-sm font-mono outline-none focus:ring-2 ring-ios-blue/30"
                                placeholder="ex: Z, A"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-muted uppercase">Início Pilha</label>
                            <input
                                value={stackStartSymbol}
                                onChange={(event) => onStackStartChange(event.target.value)}
                                onFocus={onStackStartFocus}
                                onBlur={(event) => onStackStartCommit(event.target.value)}
                                className="w-full bg-surface-muted border border-default rounded-lg px-2 py-1.5 text-sm font-mono outline-none focus:ring-2 ring-ios-blue/30"
                                placeholder="ex: Z0"
                            />
                        </div>

                        {pdaProps.pdaAcceptance && (
                            <p className="text-[11px] text-muted leading-relaxed">
                                Modo de aceitação atual: <span className="font-semibold text-secondary">{PDA_ACCEPTANCE_LABELS[pdaProps.pdaAcceptance]}</span>
                            </p>
                        )}
                    </>
                )}
            </div>
        )}
    </div>
    );
};
