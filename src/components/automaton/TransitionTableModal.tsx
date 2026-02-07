import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { AutomatoData } from '../../types';
import { Modal } from '../ui/Modal';

interface TransitionTableModalProps {
    isOpen: boolean;
    onClose: () => void;
    automaton: AutomatoData;
    onChange: (data: AutomatoData) => void;
}

const generateId = (prefix: string) => `${prefix}_${crypto.randomUUID().slice(0, 8)}`;

export const TransitionTableModal: React.FC<TransitionTableModalProps> = ({
    isOpen,
    onClose,
    automaton,
    onChange
}) => {
    const states = automaton.estados;
    const isMealy = automaton.tipo === 'Mealy';

    const updateTransition = (id: string, updates: Partial<AutomatoData['transicoes'][number]>) => {
        onChange({
            ...automaton,
            transicoes: automaton.transicoes.map(t => t.id === id ? { ...t, ...updates } : t)
        });
    };

    const removeTransition = (id: string) => {
        onChange({
            ...automaton,
            transicoes: automaton.transicoes.filter(t => t.id !== id)
        });
    };

    const addTransition = () => {
        if (states.length === 0) return;
        const first = states[0];
        onChange({
            ...automaton,
            transicoes: [
                ...automaton.transicoes,
                {
                    id: generateId('t'),
                    de: first.id,
                    para: first.id,
                    simbolo: '',
                    curvatura: 0
                }
            ]
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Tabela de Transições" className="max-w-4xl">
            <div className="space-y-4">
                {states.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-default p-6 text-sm text-muted">
                        Adicione estados para criar transições.
                    </div>
                ) : (
                    <>
                        {automaton.tipo === 'AFN' && (
                            <div className="rounded-2xl border border-default bg-surface-muted px-4 py-3 text-xs text-secondary">
                                No AFN, múltiplas transições com o mesmo símbolo representam um conjunto de destinos (I': Q x Sigma -&gt; 2^Q).
                            </div>
                        )}
                        <div className="grid grid-cols-12 gap-3 ui-kicker text-secondary">
                            <div className={isMealy ? 'col-span-3' : 'col-span-4'}>De</div>
                            <div className={isMealy ? 'col-span-3' : 'col-span-4'}>Símbolo(s)</div>
                            {isMealy && <div className="col-span-2">Saída</div>}
                            <div className="col-span-3">Para</div>
                            <div className="col-span-1 text-right">Acoes</div>
                        </div>
                        <div className="space-y-2">
                            {automaton.transicoes.map(t => (
                                <div key={t.id} className="grid grid-cols-12 gap-3 items-center">
                                    <div className={isMealy ? 'col-span-3' : 'col-span-4'}>
                                        <select
                                            value={t.de}
                                            onChange={(e) => updateTransition(t.id, { de: e.target.value })}
                                            className="w-full rounded-xl border border-default bg-surface-2 px-3 py-2 text-sm text-primary shadow-inner"
                                        >
                                            {states.map(state => (
                                                <option key={state.id} value={state.id}>
                                                    {state.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={isMealy ? 'col-span-3' : 'col-span-4'}>
                                        <input
                                            value={t.simbolo}
                                            onChange={(e) => updateTransition(t.id, { simbolo: e.target.value })}
                                            placeholder="ex.: a,b ou eps"
                                            className="w-full rounded-xl border border-default bg-surface-2 px-3 py-2 text-sm font-mono text-primary shadow-inner"
                                        />
                                    </div>
                                    {isMealy && (
                                        <div className="col-span-2">
                                            <input
                                                value={t.output ?? ''}
                                                onChange={(e) => updateTransition(t.id, { output: e.target.value })}
                                                placeholder="ex.: 0"
                                                className="w-full rounded-xl border border-default bg-surface-2 px-3 py-2 text-sm font-mono text-primary shadow-inner"
                                            />
                                        </div>
                                    )}
                                    <div className="col-span-3">
                                        <select
                                            value={t.para}
                                            onChange={(e) => updateTransition(t.id, { para: e.target.value })}
                                            className="w-full rounded-xl border border-default bg-surface-2 px-3 py-2 text-sm text-primary shadow-inner"
                                        >
                                            {states.map(state => (
                                                <option key={state.id} value={state.id}>
                                                    {state.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        <button
                                            onClick={() => removeTransition(t.id)}
                                            className="p-2 rounded-lg text-status-danger status-hover-danger"
                                            title="Remover"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4 flex justify-end">
                            <button
                                onClick={addTransition}
                                className="px-4 py-2 rounded-xl bg-ios-blue text-white text-xs font-bold hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                                <Plus size={14} />
                                Adicionar transição
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};


