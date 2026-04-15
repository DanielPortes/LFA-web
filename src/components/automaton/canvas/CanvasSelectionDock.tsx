import React from 'react';
import type { AutomatoData } from '../../../types';
import { EPSILON_SYMBOL } from '../../../utils/symbols';
import type { CanvasSelection } from './types';

interface CanvasSelectionDockProps {
    data: AutomatoData;
    selection: CanvasSelection | null;
    readOnly: boolean;
    contextMenuOpen: boolean;
    isDragging: boolean;
    selectionDockStyle?: React.CSSProperties;
    onChange: (data: AutomatoData) => void;
    isTuringMachine: boolean;
    turingRead: string;
    turingWrite: string;
    turingDir: 'L' | 'R' | 'S';
    onUpdateTuringTransition: (updates: { read?: string; write?: string; direction?: 'L' | 'R' | 'S' }) => void;
}

export const CanvasSelectionDock: React.FC<CanvasSelectionDockProps> = ({
    data,
    selection,
    readOnly,
    contextMenuOpen,
    isDragging,
    selectionDockStyle,
    onChange,
    isTuringMachine,
    turingRead,
    turingWrite,
    turingDir,
    onUpdateTuringTransition,
}) => {
    if (readOnly || !selection || contextMenuOpen || isDragging) return null;

    const selectedState = selection.type === 'state'
        ? data.estados.find((state) => state.id === selection.id) ?? null
        : null;
    const selectedTransition = selection.type === 'transition'
        ? data.transicoes.find((transition) => transition.id === selection.id) ?? null
        : null;

    return (
        <div
            className="absolute glass-dock px-6 py-3 rounded-2xl flex items-center gap-5 animate-scale-in z-50"
            style={selectionDockStyle ?? { left: '50%', top: '5rem', transform: 'translateX(-50%)' }}
        >
            {selection.type === 'state' ? (
                <>
                    <div className="flex flex-col gap-1">
                        <span className="ui-kicker-2xs text-muted">Nome</span>
                        <input
                            value={selectedState?.label ?? ''}
                            onChange={(event) => onChange({
                                ...data,
                                estados: data.estados.map((state) => (
                                    state.id === selection.id
                                        ? { ...state, label: event.target.value }
                                        : state
                                ))
                            })}
                            className="w-16 bg-transparent border-b border-default px-1 py-0.5 text-center font-bold text-sm outline-none focus:border-ios-blue text-primary"
                        />
                    </div>
                    {data.tipo === 'Moore' && (
                        <>
                            <div className="h-6 w-px bg-border"></div>
                            <div className="flex flex-col gap-1">
                                <span className="ui-kicker-2xs text-muted">Saída</span>
                                <input
                                    value={selectedState?.output ?? ''}
                                    onChange={(event) => onChange({
                                        ...data,
                                        estados: data.estados.map((state) => (
                                            state.id === selection.id
                                                ? { ...state, output: event.target.value }
                                                : state
                                        ))
                                    })}
                                    className="w-16 bg-transparent border-b border-default px-1 py-0.5 text-center font-mono font-bold text-sm outline-none focus:border-ios-blue text-primary"
                                    placeholder="ex: 0"
                                />
                            </div>
                        </>
                    )}
                    <div className="h-6 w-px bg-border"></div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onChange({
                                ...data,
                                estados: data.estados.map((state) => (
                                    state.id === selection.id
                                        ? { ...state, isInicial: !state.isInicial }
                                        : state
                                ))
                            })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                selectedState?.isInicial
                                    ? 'bg-ios-blue border-ios-blue text-white'
                                    : 'bg-transparent border-default text-secondary hover:bg-surface-muted'
                            }`}
                        >
                            Inicial
                        </button>
                        <button
                            onClick={() => onChange({
                                ...data,
                                estados: data.estados.map((state) => (
                                    state.id === selection.id
                                        ? { ...state, isFinal: !state.isFinal }
                                        : state
                                ))
                            })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                selectedState?.isFinal
                                    ? 'bg-ios-purple border-ios-purple text-white'
                                    : 'bg-transparent border-default text-secondary hover:bg-surface-muted'
                            }`}
                        >
                            Final
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex flex-col gap-1">
                    <span className="ui-kicker-2xs text-muted">
                        {isTuringMachine ? 'Leitura/Escrita' : (data.tipo === 'AP' ? 'Rótulo' : 'Símbolo(s)')}
                    </span>
                    {isTuringMachine ? (
                        <div className="flex gap-2 items-center">
                            <input
                                value={turingRead}
                                onChange={(event) => onUpdateTuringTransition({ read: event.target.value })}
                                className="w-20 bg-surface-muted rounded-md px-3 py-1.5 text-center font-mono font-bold text-sm outline-none focus:ring-2 ring-ios-blue/50 text-primary"
                                placeholder="leitura"
                                autoFocus
                            />
                            <span className="text-xs text-muted">-&gt;</span>
                            <input
                                value={turingWrite}
                                onChange={(event) => onUpdateTuringTransition({ write: event.target.value })}
                                className="w-20 bg-surface-muted rounded-md px-3 py-1.5 text-center font-mono font-bold text-sm outline-none focus:ring-2 ring-ios-blue/50 text-primary"
                                placeholder="escrita"
                            />
                            <select
                                value={turingDir}
                                onChange={(event) => onUpdateTuringTransition({ direction: event.target.value as 'L' | 'R' | 'S' })}
                                className="bg-surface-muted rounded-md px-2 py-1.5 text-xs font-bold text-primary outline-none"
                            >
                                <option value="L">L</option>
                                <option value="R">R</option>
                                <option value="S">S</option>
                            </select>
                        </div>
                    ) : (
                        <div className="flex gap-2 items-center">
                            <input
                                value={selectedTransition?.simbolo ?? ''}
                                onChange={(event) => onChange({
                                    ...data,
                                    transicoes: data.transicoes.map((transition) => (
                                        transition.id === selection.id
                                            ? { ...transition, simbolo: event.target.value }
                                            : transition
                                    ))
                                })}
                                className="w-32 bg-surface-muted rounded-md px-3 py-1.5 text-center font-mono font-bold text-sm outline-none focus:ring-2 ring-ios-blue/50 text-primary"
                                placeholder={data.tipo === 'AP' ? 'ex: a, Z -> AZ' : 'ex: a,b'}
                                autoFocus
                            />
                            <button
                                onClick={() => onChange({
                                    ...data,
                                    transicoes: data.transicoes.map((transition) => (
                                        transition.id === selection.id
                                            ? { ...transition, simbolo: EPSILON_SYMBOL }
                                            : transition
                                    ))
                                })}
                                className="px-2 py-1.5 rounded-md text-xs font-bold text-status-info bg-status-info-soft border border-status-info status-hover-info transition-colors"
                                title={`Inserir ${EPSILON_SYMBOL}`}
                            >
                                {EPSILON_SYMBOL}
                            </button>
                            {data.tipo === 'Mealy' && (
                                <input
                                    value={selectedTransition?.output ?? ''}
                                    onChange={(event) => onChange({
                                        ...data,
                                        transicoes: data.transicoes.map((transition) => (
                                            transition.id === selection.id
                                                ? { ...transition, output: event.target.value }
                                                : transition
                                        ))
                                    })}
                                    className="w-16 bg-surface-muted rounded-md px-3 py-1.5 text-center font-mono font-bold text-sm outline-none focus:ring-2 ring-ios-blue/50 text-primary"
                                    placeholder="saída"
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
