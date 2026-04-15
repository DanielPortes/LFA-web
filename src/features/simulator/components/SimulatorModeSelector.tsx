import React from 'react';

interface SimulatorModeSelectorProps {
    mode: 'automaton' | 'grammar';
    onChange: (mode: 'automaton' | 'grammar') => void;
}

export const SimulatorModeSelector: React.FC<SimulatorModeSelectorProps> = ({
    mode,
    onChange
}) => (
    <div className="glass-panel pointer-events-auto flex flex-wrap items-center gap-2 rounded-2xl border border-default px-3 py-2 shadow-apple-md">
        <div className="inline-flex items-center gap-1 rounded-xl border border-default bg-surface-muted p-1">
            <button
                onClick={() => onChange('automaton')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    mode === 'automaton'
                        ? 'bg-ios-blue text-white shadow'
                        : 'text-secondary hover:bg-surface-hover'
                }`}
                aria-pressed={mode === 'automaton'}
            >
                {'Aut\u00f4mato'}
            </button>
            <button
                onClick={() => onChange('grammar')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    mode === 'grammar'
                        ? 'bg-ios-purple text-white shadow'
                        : 'text-secondary hover:bg-surface-hover'
                }`}
                aria-pressed={mode === 'grammar'}
            >
                {'Gram\u00e1tica'}
            </button>
        </div>
    </div>
);
