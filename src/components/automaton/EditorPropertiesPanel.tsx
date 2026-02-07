import React, { useState, useEffect, useCallback } from 'react';
import { Settings, ChevronUp, ChevronDown } from 'lucide-react';
import type { AutomatoData, AutomatoTipo, APData } from '../../types';
import { isAP } from '../../types';
import { getAlphabet } from '../../utils/conversions';
import { splitSymbolTokens } from '../../utils/symbols';

interface EditorPropertiesPanelProps {
    data: AutomatoData;
    onChange: (data: AutomatoData) => void;
    readOnly?: boolean;
}

// Helper to safely get PDA properties
function getPdaProps(data: AutomatoData): {
    alfabetoPilha?: string[];
    simboloInicialPilha?: string;
    pdaAcceptance?: 'final' | 'empty' | 'both';
} {
    if (isAP(data)) {
        return {
            alfabetoPilha: data.alfabetoPilha,
            simboloInicialPilha: data.simboloInicialPilha,
            pdaAcceptance: data.pdaAcceptance,
        };
    }
    return {};
}

export const EditorPropertiesPanel: React.FC<EditorPropertiesPanelProps> = ({
    data,
    onChange,
    readOnly = false,
}) => {
    const [showProps, setShowProps] = useState(true);
    const [alphabetInput, setAlphabetInput] = useState('');
    const [isEditingAlphabet, setIsEditingAlphabet] = useState(false);
    const [stackAlphabetInput, setStackAlphabetInput] = useState('');
    const [isEditingStackAlphabet, setIsEditingStackAlphabet] = useState(false);
    const [stackStartSymbol, setStackStartSymbol] = useState('');
    const [isEditingStackStart, setIsEditingStackStart] = useState(false);

    const isPda = isAP(data);
    const pdaProps = getPdaProps(data);

    // Sync alphabet input with data
    useEffect(() => {
        if (isEditingAlphabet) return;
        const inferred =
            data.alfabeto && data.alfabeto.length > 0
                ? data.alfabeto
                : getAlphabet({ ...data, alfabeto: undefined });
        setAlphabetInput(inferred.join(', '));
    }, [data.alfabeto, data.transicoes, isEditingAlphabet, data]);

    // Sync stack alphabet input with data (only for PDA)
    useEffect(() => {
        if (isEditingStackAlphabet) return;
        if (!isPda) return;
        const inferred =
            pdaProps.alfabetoPilha && pdaProps.alfabetoPilha.length > 0
                ? pdaProps.alfabetoPilha
                : [];
        setStackAlphabetInput(inferred.join(', '));
    }, [pdaProps.alfabetoPilha, isEditingStackAlphabet, isPda]);

    // Sync stack start symbol with data (only for PDA)
    useEffect(() => {
        if (isEditingStackStart) return;
        if (!isPda) return;
        setStackStartSymbol(pdaProps.simboloInicialPilha ?? '');
    }, [pdaProps.simboloInicialPilha, isEditingStackStart, isPda]);

    const commitAlphabet = useCallback(
        (value: string) => {
            const tokens = splitSymbolTokens(value);
            if (tokens.length === 0) {
                onChange({ ...data, alfabeto: undefined });
            } else {
                onChange({ ...data, alfabeto: tokens });
            }
        },
        [data, onChange]
    );

    const commitStackAlphabet = useCallback(
        (value: string) => {
            if (!isPda) return;
            const tokens = splitSymbolTokens(value);
            const pdaData = data as APData;
            if (tokens.length === 0) {
                onChange({ ...pdaData, alfabetoPilha: undefined });
            } else {
                onChange({ ...pdaData, alfabetoPilha: tokens });
            }
        },
        [data, onChange, isPda]
    );

    const handleTypeChange = (nextTipo: AutomatoTipo) => {
        // Create base data without PDA-specific fields
        const baseData = {
            estados: data.estados,
            transicoes: data.transicoes,
            alfabeto: data.alfabeto,
            descricao: data.descricao,
        };

        if (nextTipo === 'AP') {
            const newData: APData = {
                ...baseData,
                tipo: 'AP',
                alfabetoPilha: pdaProps.alfabetoPilha,
                simboloInicialPilha: pdaProps.simboloInicialPilha ?? 'Z',
                pdaAcceptance: pdaProps.pdaAcceptance ?? 'final',
            };
            onChange(newData);
        } else {
            onChange({ ...baseData, tipo: nextTipo } as AutomatoData);
        }
    };

    const handleResetAlphabet = () => {
        setIsEditingAlphabet(false);
        const inferred = getAlphabet({ ...data, alfabeto: undefined });
        setAlphabetInput(inferred.join(', '));
        onChange({ ...data, alfabeto: undefined });
    };

    const handleStackStartChange = (value: string) => {
        if (!isPda) return;
        const pdaData = data as APData;
        onChange({
            ...pdaData,
            simboloInicialPilha: value.trim() || undefined,
        });
    };

    return (
        <div className="glass-panel p-1 rounded-2xl shadow-apple-md border border-default w-full animate-fade-in-up transition-all">
            <button
                onClick={() => setShowProps((p) => !p)}
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
                    {/* Type Selector */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-muted uppercase">
                            Tipo
                        </label>
                        <select
                            value={data.tipo}
                            onChange={(e) =>
                                handleTypeChange(e.target.value as AutomatoTipo)
                            }
                            disabled={readOnly}
                            className="w-full bg-surface-muted border border-default rounded-lg px-2 py-1.5 text-sm font-semibold outline-none focus:ring-2 ring-ios-blue/30"
                        >
                            <option value="AFD">AFD</option>
                            <option value="AFN">AFN</option>
                            <option value="AP">Automato com Pilha</option>
                            <option value="MT">Máquina de Turing</option>
                            <option value="ALL">Linearmente Limitado</option>
                            <option value="Moore">Máquina de Moore</option>
                            <option value="Mealy">Máquina de Mealy</option>
                        </select>
                    </div>

                    {/* Alphabet */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-muted uppercase">
                                Alfabeto
                            </label>
                            <button
                                onClick={handleResetAlphabet}
                                className="text-xs text-ios-blue hover:underline"
                            >
                                Auto
                            </button>
                        </div>
                        <input
                            value={alphabetInput}
                            onChange={(e) => setAlphabetInput(e.target.value)}
                            onFocus={() => setIsEditingAlphabet(true)}
                            onBlur={(e) => {
                                setIsEditingAlphabet(false);
                                commitAlphabet(e.target.value);
                            }}
                            className="w-full bg-surface-muted border border-default rounded-lg px-2 py-1.5 text-sm font-mono outline-none focus:ring-2 ring-ios-blue/30"
                            placeholder="ex: a, b"
                            disabled={readOnly}
                        />
                    </div>

                    {/* PDA-specific fields */}
                    {isPda && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-muted uppercase">
                                    Alfabeto Pilha
                                </label>
                                <input
                                    value={stackAlphabetInput}
                                    onChange={(e) =>
                                        setStackAlphabetInput(e.target.value)
                                    }
                                    onFocus={() => setIsEditingStackAlphabet(true)}
                                    onBlur={(e) => {
                                        setIsEditingStackAlphabet(false);
                                        commitStackAlphabet(e.target.value);
                                    }}
                                    className="w-full bg-surface-muted border border-default rounded-lg px-2 py-1.5 text-sm font-mono outline-none focus:ring-2 ring-ios-blue/30"
                                    placeholder="ex: Z, A"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-muted uppercase">
                                    Início Pilha
                                </label>
                                <input
                                    value={stackStartSymbol}
                                    onChange={(e) =>
                                        setStackStartSymbol(e.target.value)
                                    }
                                    onFocus={() => setIsEditingStackStart(true)}
                                    onBlur={(e) => {
                                        setIsEditingStackStart(false);
                                        handleStackStartChange(e.target.value);
                                    }}
                                    className="w-full bg-surface-muted border border-default rounded-lg px-2 py-1.5 text-sm font-mono outline-none focus:ring-2 ring-ios-blue/30"
                                    placeholder="ex: Z0"
                                />
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};


