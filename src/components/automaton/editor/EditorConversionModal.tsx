import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { AutomatoData } from '../../../types';
import { Modal } from '../../ui/Modal';
import type { EditorConversionModalState } from './types';

interface EditorConversionModalProps {
    modal: EditorConversionModalState | null;
    onClose: () => void;
    onApplyAutomaton: (automaton: AutomatoData) => void;
}

export const EditorConversionModal: React.FC<EditorConversionModalProps> = ({
    modal,
    onClose,
    onApplyAutomaton,
}) => (
    <Modal isOpen={!!modal} onClose={onClose} title={modal?.title || 'Conversão'} className="max-w-3xl">
        <div className="space-y-6">
            {modal?.warnings && modal.warnings.length > 0 && (
                <div className="p-4 rounded-2xl bg-status-warning-soft border border-status-warning text-status-warning text-sm">
                    <div className="font-bold mb-2 flex items-center gap-2">
                        <AlertTriangle size={16} />
                        Avisos
                    </div>
                    <ul className="list-disc list-inside space-y-1 opacity-90">
                        {modal.warnings.map((warning, index) => <li key={index}>{warning}</li>)}
                    </ul>
                </div>
            )}

            {modal?.steps && (
                <div className="space-y-3">
                    {modal.steps.map((step, index) => (
                        <div key={index} className="flex gap-3 text-sm">
                            <div className="w-6 h-6 rounded-full bg-ios-blue/10 text-ios-blue flex items-center justify-center font-bold text-xs shrink-0">
                                {index + 1}
                            </div>
                            <div>
                                <span className="font-bold text-primary">{step.title}</span>{' '}
                                <span className="text-secondary">{step.detail}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modal?.outputText && (
                <pre className="p-4 rounded-xl bg-surface-muted font-mono text-xs overflow-auto max-h-64 border border-default">
                    {modal.outputText}
                </pre>
            )}

            {modal?.automaton && (
                <div className="rounded-2xl border border-default bg-surface-2/70 p-4 shadow-apple-sm">
                    <div className="ui-kicker-xs text-secondary">Resultado gerado</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <span className="badge badge-info">{modal.automaton.tipo}</span>
                        <span className="badge badge-neutral">{modal.automaton.estados.length} estados</span>
                        <span className="badge badge-neutral">{modal.automaton.transicoes.length} transições</span>
                    </div>
                    <p className="mt-3 text-xs font-semibold leading-relaxed text-secondary">
                        Substitui o autômato atual no canvas. Use Ctrl+Z para voltar e comparar com a versão anterior.
                    </p>
                </div>
            )}

            {modal?.automaton && (
                <div className="flex justify-end pt-4 border-t border-default">
                    <button
                        onClick={() => onApplyAutomaton(modal.automaton as AutomatoData)}
                        className="px-4 py-2 rounded-xl bg-ios-blue text-white text-sm font-bold hover:bg-blue-600 transition-colors"
                    >
                        Aplicar conversão
                    </button>
                </div>
            )}
        </div>
    </Modal>
);
