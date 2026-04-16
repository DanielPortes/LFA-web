import React, { useMemo } from 'react';
import { FileText } from 'lucide-react';
import { useUiSettings } from '../hooks/useUiSettings';
import { useGrammarSimulation } from '../hooks/useGrammarSimulation';
import { GrammarWorkspaceShell } from '../features/simulator';

export const GrammarPage: React.FC = () => {
    const {
        inputTokenization,
        inputSeparator,
    } = useUiSettings();

    const tokenizationConfig = useMemo(() => ({
        mode: inputTokenization,
        separator: inputSeparator
    }), [inputTokenization, inputSeparator]);

    const {
        grammarSource,
        grammarInput,
        grammarResult,
        grammarWarnings,
        grammarLimits,
        grammarStrategy,
        grammarTransform,
        setGrammarSource,
        setGrammarInput,
        setGrammarLimits,
        setGrammarStrategy,
        runDerivation,
        runTransform,
        clearTransform,
        clearResult
    } = useGrammarSimulation(tokenizationConfig);

    const headerContent = (
        <div className="glass-panel pointer-events-auto flex items-center gap-3 rounded-2xl border border-default bg-surface-1/90 px-4 py-3 shadow-apple-md">
            <div className="rounded-xl bg-ios-purple/10 p-2 text-ios-purple">
                <FileText size={16} />
            </div>
            <div>
                <div className="ui-kicker-xs text-primary">Laboratório de gramáticas</div>
                <div className="text-[11px] text-secondary">Derivação e transformações em área dedicada</div>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden pb-3 pt-20 animate-fade-in sm:pt-[5.5rem] lg:pt-24" data-native-cursor="true">
            <GrammarWorkspaceShell
                headerContent={headerContent}
                grammarSource={grammarSource}
                grammarInput={grammarInput}
                grammarWarnings={grammarWarnings}
                grammarStrategy={grammarStrategy}
                grammarLimits={grammarLimits}
                grammarResult={grammarResult}
                grammarTransform={grammarTransform}
                setGrammarSource={setGrammarSource}
                setGrammarInput={setGrammarInput}
                setGrammarStrategy={setGrammarStrategy}
                setGrammarLimits={setGrammarLimits}
                runDerivation={runDerivation}
                runTransform={runTransform}
                clearTransform={clearTransform}
                clearResult={clearResult}
            />
        </div>
    );
};
