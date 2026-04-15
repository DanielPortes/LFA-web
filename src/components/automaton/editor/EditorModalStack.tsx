import React, { Suspense } from 'react';
import type { AutomatoData } from '../../../types';
import { DeleteConfirmDialog } from '../../ui';
import { SavedAutomataModal } from '../../ui/SavedAutomataModal';
import { Modal } from '../../ui/Modal';
import { TransitionTableModal } from '../TransitionTableModal';
import { EditorConversionModal } from './EditorConversionModal';
import { EditorGrammarImportModal } from './EditorGrammarImportModal';
import type { EditorConversionModalState } from './types';

interface EditorModalStackProps {
    lazyTemplatesGallery: React.ComponentType<{
        isOpen: boolean;
        onClose: () => void;
        onSelect: (data: AutomatoData) => void;
    }>;
    data: AutomatoData;
    showDeleteConfirm: boolean;
    showTemplates: boolean;
    showLibrary: boolean;
    showGrammarImport: boolean;
    showTableModal: boolean;
    conversionModal: EditorConversionModalState | null;
    grammarImportKind: 'regular' | 'cfg';
    grammarImportTarget: 'AFN' | 'AFD';
    grammarImportSource: string;
    grammarImportError: string | null;
    grammarImportWarnings: string[];
    onCloseDeleteConfirm: () => void;
    onConfirmDeleteAll: () => void;
    onCloseTemplates: () => void;
    onSelectTemplate: (data: AutomatoData) => void;
    onCloseTable: () => void;
    onChangeTableAutomaton: (data: AutomatoData) => void;
    onCloseLibrary: () => void;
    onLoadSavedAutomaton: (data: AutomatoData) => void;
    onCloseConversionModal: () => void;
    onApplyConversionAutomaton: (data: AutomatoData) => void;
    onCloseGrammarImport: () => void;
    onGrammarImportKindChange: (kind: 'regular' | 'cfg') => void;
    onGrammarImportTargetChange: (target: 'AFN' | 'AFD') => void;
    onGrammarImportSourceChange: (value: string) => void;
    onSubmitGrammarImport: () => void;
}

export const EditorModalStack: React.FC<EditorModalStackProps> = ({
    lazyTemplatesGallery: LazyTemplatesGallery,
    data,
    showDeleteConfirm,
    showTemplates,
    showLibrary,
    showGrammarImport,
    showTableModal,
    conversionModal,
    grammarImportKind,
    grammarImportTarget,
    grammarImportSource,
    grammarImportError,
    grammarImportWarnings,
    onCloseDeleteConfirm,
    onConfirmDeleteAll,
    onCloseTemplates,
    onSelectTemplate,
    onCloseTable,
    onChangeTableAutomaton,
    onCloseLibrary,
    onLoadSavedAutomaton,
    onCloseConversionModal,
    onApplyConversionAutomaton,
    onCloseGrammarImport,
    onGrammarImportKindChange,
    onGrammarImportTargetChange,
    onGrammarImportSourceChange,
    onSubmitGrammarImport,
}) => (
    <>
        <DeleteConfirmDialog
            isOpen={showDeleteConfirm}
            onClose={onCloseDeleteConfirm}
            onConfirm={onConfirmDeleteAll}
            itemCount={data.estados.length}
        />

        <Suspense fallback={(
            <Modal isOpen={showTemplates} onClose={onCloseTemplates} title="Templates" className="max-w-3xl">
                <div className="flex min-h-40 items-center justify-center text-sm text-secondary">
                    Carregando catálogo de templates...
                </div>
            </Modal>
        )}>
            <LazyTemplatesGallery
                isOpen={showTemplates}
                onClose={onCloseTemplates}
                onSelect={onSelectTemplate}
            />
        </Suspense>

        <TransitionTableModal isOpen={showTableModal} onClose={onCloseTable} automaton={data} onChange={onChangeTableAutomaton} />

        <SavedAutomataModal
            isOpen={showLibrary}
            onClose={onCloseLibrary}
            current={data}
            onLoad={onLoadSavedAutomaton}
        />

        <EditorConversionModal
            modal={conversionModal}
            onClose={onCloseConversionModal}
            onApplyAutomaton={onApplyConversionAutomaton}
        />

        <EditorGrammarImportModal
            isOpen={showGrammarImport}
            grammarImportKind={grammarImportKind}
            grammarImportTarget={grammarImportTarget}
            grammarImportSource={grammarImportSource}
            grammarImportError={grammarImportError}
            grammarImportWarnings={grammarImportWarnings}
            onClose={onCloseGrammarImport}
            onGrammarImportKindChange={onGrammarImportKindChange}
            onGrammarImportTargetChange={onGrammarImportTargetChange}
            onGrammarImportSourceChange={onGrammarImportSourceChange}
            onSubmit={onSubmitGrammarImport}
        />
    </>
);
