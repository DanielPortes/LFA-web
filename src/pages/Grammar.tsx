import React, { useEffect, useMemo, useState } from 'react';
import { useUiSettings } from '../hooks/useUiSettings';
import { useGrammarSimulation } from '../hooks/useGrammarSimulation';
import { GrammarWorkspaceShell } from '../features/simulator';

export const GrammarPage: React.FC = () => {
    const [viewportHeight, setViewportHeight] = useState(() => {
        if (typeof window === 'undefined') return 720;
        return window.innerHeight;
    });
    const {
        inputTokenization,
        inputSeparator,
    } = useUiSettings();

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        const updateViewportHeight = () => setViewportHeight(window.innerHeight);
        updateViewportHeight();
        window.addEventListener('resize', updateViewportHeight);
        window.visualViewport?.addEventListener('resize', updateViewportHeight);
        return () => {
            window.removeEventListener('resize', updateViewportHeight);
            window.visualViewport?.removeEventListener('resize', updateViewportHeight);
        };
    }, []);

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

    return (
        <div
            className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden pb-3 pt-20 animate-fade-in sm:pt-[5.5rem] lg:pt-24"
            style={{ height: `${viewportHeight}px`, maxHeight: `${viewportHeight}px` }}
            data-native-cursor="true"
        >
            <GrammarWorkspaceShell
                headerContent={null}
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
