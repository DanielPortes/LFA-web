import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from '../../ui/Modal';

interface EditorGrammarImportModalProps {
    isOpen: boolean;
    grammarImportKind: 'regular' | 'cfg';
    grammarImportTarget: 'AFN' | 'AFD';
    grammarImportSource: string;
    grammarImportError: string | null;
    grammarImportWarnings: string[];
    onClose: () => void;
    onGrammarImportKindChange: (kind: 'regular' | 'cfg') => void;
    onGrammarImportTargetChange: (target: 'AFN' | 'AFD') => void;
    onGrammarImportSourceChange: (value: string) => void;
    onSubmit: () => void;
}

export const EditorGrammarImportModal: React.FC<EditorGrammarImportModalProps> = ({
    isOpen,
    grammarImportKind,
    grammarImportTarget,
    grammarImportSource,
    grammarImportError,
    grammarImportWarnings,
    onClose,
    onGrammarImportKindChange,
    onGrammarImportTargetChange,
    onGrammarImportSourceChange,
    onSubmit,
}) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Importar Gramática" className="max-w-2xl">
        <div className="space-y-4">
            <div className="flex gap-2 p-1 bg-surface-muted rounded-xl w-fit">
                <button
                    onClick={() => onGrammarImportKindChange('regular')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${grammarImportKind === 'regular' ? 'bg-white shadow text-black' : 'text-secondary'}`}
                >
                    Regular
                </button>
                <button
                    onClick={() => onGrammarImportKindChange('cfg')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${grammarImportKind === 'cfg' ? 'bg-white shadow text-black' : 'text-secondary'}`}
                >
                    Livre de Contexto
                </button>
            </div>

            {grammarImportKind === 'regular' && (
                <div className="flex gap-2 p-1 bg-surface-muted rounded-xl w-fit">
                    <button
                        onClick={() => onGrammarImportTargetChange('AFN')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${grammarImportTarget === 'AFN' ? 'bg-white shadow text-black' : 'text-secondary'}`}
                    >
                        AFN
                    </button>
                    <button
                        onClick={() => onGrammarImportTargetChange('AFD')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${grammarImportTarget === 'AFD' ? 'bg-white shadow text-black' : 'text-secondary'}`}
                    >
                        AFD
                    </button>
                </div>
            )}

            <div className="rounded-2xl border border-default bg-surface-2/70 px-4 py-3 text-xs leading-relaxed text-secondary">
                Converter substitui o autômato atual pelo modelo gerado. Use uma produção por linha e separe alternativas com <code className="font-mono">|</code>.
            </div>

            <textarea
                value={grammarImportSource}
                onChange={(event) => onGrammarImportSourceChange(event.target.value)}
                className="w-full h-48 bg-surface-muted border border-default rounded-xl p-3 font-mono text-sm"
                placeholder={grammarImportKind === 'regular' ? 'S -> aA | b' : 'S -> aSb | ε'}
                aria-label="Fonte da gramática"
            />

            {grammarImportError && (
                <div className="text-sm text-ios-red font-medium flex items-center gap-2">
                    <AlertCircle size={16} />
                    {grammarImportError}
                </div>
            )}

            {grammarImportWarnings.length > 0 && (
                <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                    {grammarImportWarnings.map((warning, index) => (
                        <div key={`${warning}-${index}`}>- {warning}</div>
                    ))}
                </div>
            )}

            <div className="flex justify-end gap-2">
                <button onClick={onSubmit} className="px-4 py-2 rounded-xl bg-ios-blue text-white text-sm font-bold hover:bg-blue-600 transition-colors">
                    Converter
                </button>
            </div>
        </div>
    </Modal>
);
