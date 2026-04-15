import React from 'react';
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
}) => (
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
                <div className="space-y-1">
                    <label className="text-xs font-bold text-muted uppercase">Tipo</label>
                    <select
                        value={data.tipo}
                        onChange={(event) => onTypeChange(event.target.value as AutomatoData['tipo'])}
                        disabled={readOnly}
                        className="w-full bg-surface-muted border border-default rounded-lg px-2 py-1.5 text-sm font-semibold outline-none focus:ring-2 ring-ios-blue/30"
                    >
                        <option value="AFD">AFD</option>
                        <option value="AFN">AFN</option>
                        <option value="AP">Autômato com Pilha</option>
                        <option value="MT">Máquina de Turing</option>
                        <option value="ALL">Linearmente Limitado</option>
                        <option value="Moore">Máquina de Moore</option>
                        <option value="Mealy">Máquina de Mealy</option>
                    </select>
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
                                Modo de aceitação atual: <span className="font-semibold text-secondary">{pdaProps.pdaAcceptance}</span>
                            </p>
                        )}
                    </>
                )}
            </div>
        )}
    </div>
);
