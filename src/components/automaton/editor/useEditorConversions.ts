import { useState, useCallback } from 'react';
import type { AutomatoData } from '../../../types';
import type { ToastContextType } from '../../ui/toast-context';
import type { EditorConversionModalState, LoadAutomatonOptions } from './types';
import {
    nfaToDfaWithSteps,
    minimizeDfaWithSteps,
    eliminateEpsilonTransitions,
    regularGrammarToNfa,
    regularGrammarToDfa,
    cfgToPda,
    mooreToMealy,
    mealyToMoore,
} from '../../../utils/conversions';

interface UseEditorConversionsOptions {
    data: AutomatoData;
    addToast: ToastContextType['addToast'];
    loadAutomatonIntoEditor: (incoming: AutomatoData, options?: LoadAutomatonOptions) => void;
}

export const useEditorConversions = ({
    data,
    addToast,
    loadAutomatonIntoEditor,
}: UseEditorConversionsOptions) => {
    const [conversionModal, setConversionModal] = useState<EditorConversionModalState | null>(null);
    const [showGrammarImport, setShowGrammarImport] = useState(false);
    const [grammarImportKind, setGrammarImportKind] = useState<'regular' | 'cfg'>('regular');
    const [grammarImportTarget, setGrammarImportTarget] = useState<'AFN' | 'AFD'>('AFN');
    const [grammarImportSource, setGrammarImportSource] = useState('');
    const [grammarImportError, setGrammarImportError] = useState<string | null>(null);
    const [grammarImportWarnings, setGrammarImportWarnings] = useState<string[]>([]);

    const openConversionModal = useCallback((payload: EditorConversionModalState) => {
        setConversionModal(payload);
    }, []);

    const handleConvertToDFA = useCallback(() => {
        try {
            const result = nfaToDfaWithSteps(data);
            openConversionModal({
                title: 'Determinizar (AFN → AFD)',
                steps: result.steps,
                automaton: result.automaton,
            });
        } catch {
            addToast('Erro na conversão', 'error');
        }
    }, [addToast, data, openConversionModal]);

    const handleEliminateEpsilon = useCallback(() => {
        try {
            const result = eliminateEpsilonTransitions(data);
            openConversionModal({
                title: 'Remoção de eps',
                steps: result.steps,
                automaton: result.automaton,
            });
        } catch {
            addToast('Erro na conversão', 'error');
        }
    }, [addToast, data, openConversionModal]);

    const handleMinimizeDfa = useCallback(() => {
        try {
            const result = minimizeDfaWithSteps(data);
            if (result.isMinimal && !result.needsCompletion) {
                addToast('AFD já está minimizado', 'info');
                openConversionModal({ title: 'Minimização de AFD', steps: result.steps });
                return;
            }

            if (result.isMinimal && result.needsCompletion) {
                addToast('AFD já é mínimo, mas está incompleto', 'info');
                openConversionModal({
                    title: 'Minimização de AFD',
                    steps: result.steps,
                    automaton: result.automaton,
                });
                return;
            }

            openConversionModal({
                title: 'Minimização de AFD',
                steps: result.steps,
                automaton: result.automaton,
            });
        } catch {
            addToast('Erro na minimização', 'error');
        }
    }, [addToast, data, openConversionModal]);

    const handleMooreToMealy = useCallback(() => {
        const converted = mooreToMealy(data);
        openConversionModal({
            title: 'Moore → Mealy',
            steps: [{ title: 'Conversão', detail: 'OK' }],
            automaton: converted,
        });
    }, [data, openConversionModal]);

    const handleMealyToMoore = useCallback(() => {
        const converted = mealyToMoore(data);
        openConversionModal({
            title: 'Mealy → Moore',
            steps: [{ title: 'Conversão', detail: 'OK' }],
            automaton: converted,
        });
    }, [data, openConversionModal]);

    const handleGrammarImport = useCallback(() => {
        const source = grammarImportSource.trim();
        if (!source) {
            setGrammarImportError('Informe a gramática.');
            return;
        }

        if (grammarImportKind === 'regular') {
            const result = grammarImportTarget === 'AFD' ? regularGrammarToDfa(source) : regularGrammarToNfa(source);
            if (!result.automaton) {
                setGrammarImportError(result.error || 'Erro');
                return;
            }

            setGrammarImportWarnings(result.warnings ?? []);
            setGrammarImportError(null);
            loadAutomatonIntoEditor(result.automaton, { quiet: true });
            setShowGrammarImport(false);
            addToast('Gramática convertida', 'success');
            return;
        }

        const result = cfgToPda(source);
        if (!result.automaton) {
            setGrammarImportError(result.error || 'Erro');
            return;
        }

        setGrammarImportWarnings(result.warnings ?? []);
        setGrammarImportError(null);
        loadAutomatonIntoEditor(result.automaton, { quiet: true });
        setShowGrammarImport(false);
        addToast('GLC convertida', 'success');
    }, [addToast, grammarImportKind, grammarImportSource, grammarImportTarget, loadAutomatonIntoEditor]);

    return {
        conversionModal,
        setConversionModal,
        showGrammarImport,
        setShowGrammarImport,
        grammarImportKind,
        setGrammarImportKind,
        grammarImportTarget,
        setGrammarImportTarget,
        grammarImportSource,
        setGrammarImportSource,
        grammarImportError,
        setGrammarImportError,
        grammarImportWarnings,
        setGrammarImportWarnings,
        handleConvertToDFA,
        handleEliminateEpsilon,
        handleMinimizeDfa,
        handleMooreToMealy,
        handleMealyToMoore,
        handleGrammarImport,
    };
};
