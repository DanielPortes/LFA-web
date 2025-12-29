import React, { useState, useCallback } from 'react';
import { Play, Trash2, Plus, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import type { AutomatoData } from '../../types';
import { getEpsilonClosure, performStep } from '../../utils/automatonLogic';
import { tokenizeInput } from '../../utils/symbols';
import type { BaseProps } from './types';

interface TestCase {
    id: string;
    input: string;
    expected?: 'accept' | 'reject';
    result?: 'accepted' | 'rejected' | 'running';
}

interface BatchTestPanelProps extends BaseProps {
    automaton: AutomatoData;
    onClose: () => void;
}

export const BatchTestPanel: React.FC<BatchTestPanelProps> = ({ automaton, onClose, className = '' }) => {
    const [testCases, setTestCases] = useState<TestCase[]>([
        { id: '1', input: '', expected: 'accept' }
    ]);
    const [isRunning, setIsRunning] = useState(false);
    const [newInput, setNewInput] = useState('');

    const addTestCase = () => {
        if (!newInput.trim() && newInput !== '') return;
        setTestCases(prev => [
            ...prev,
            { id: Date.now().toString(), input: newInput, expected: 'accept' }
        ]);
        setNewInput('');
    };

    const removeTestCase = (id: string) => {
        setTestCases(prev => prev.filter(tc => tc.id !== id));
    };

    const updateTestCase = (id: string, updates: Partial<TestCase>) => {
        setTestCases(prev => prev.map(tc =>
            tc.id === id ? { ...tc, ...updates } : tc
        ));
    };

    const simulateString = useCallback((input: string): 'accepted' | 'rejected' => {
        const initialStates = automaton.estados.filter(e => e.isInicial).map(e => e.id);
        let currentStates = getEpsilonClosure(initialStates, automaton.transicoes);

        const tokens = tokenizeInput(input);
        for (const symbol of tokens) {
            currentStates = performStep(currentStates, symbol, automaton.transicoes);
            if (currentStates.length === 0) {
                return 'rejected';
            }
        }

        const hasFinal = currentStates.some(id =>
            automaton.estados.find(e => e.id === id)?.isFinal
        );

        return hasFinal ? 'accepted' : 'rejected';
    }, [automaton]);

    const runAllTests = async () => {
        setIsRunning(true);

        // Mark all as running
        setTestCases(prev => prev.map(tc => ({ ...tc, result: 'running' as const })));

        // Run tests with small delay for visual feedback
        for (let i = 0; i < testCases.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));

            const result = simulateString(testCases[i].input);
            setTestCases(prev => prev.map((tc, idx) =>
                idx === i ? { ...tc, result } : tc
            ));
        }

        setIsRunning(false);
    };

    const clearResults = () => {
        setTestCases(prev => prev.map(tc => ({ ...tc, result: undefined })));
    };

    const passedCount = testCases.filter(tc =>
        tc.result && (
            (tc.expected === 'accept' && tc.result === 'accepted') ||
            (tc.expected === 'reject' && tc.result === 'rejected')
        )
    ).length;

    const failedCount = testCases.filter(tc =>
        tc.result && (
            (tc.expected === 'accept' && tc.result === 'rejected') ||
            (tc.expected === 'reject' && tc.result === 'accepted')
        )
    ).length;

    const testedCount = testCases.filter(tc => tc.result && tc.result !== 'running').length;

    return (
        <div className={`glass-panel rounded-2xl overflow-hidden w-full max-w-sm ${className}`}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-default flex items-center justify-between">
                <h4 className="font-bold text-primary">Testes em Lote</h4>
                <button
                    onClick={onClose}
                    className="text-secondary hover:text-primary"
                >
                    <XCircle size={18} />
                </button>
            </div>

            {/* Stats */}
            {testedCount > 0 && (
                <div className="px-4 py-2 bg-surface-muted flex items-center gap-4 text-xs font-bold border-b border-default">
                    <span className="text-ios-green flex items-center gap-1">
                        <CheckCircle2 size={14} /> {passedCount} passou
                    </span>
                    <span className="text-ios-red flex items-center gap-1">
                        <XCircle size={14} /> {failedCount} falhou
                    </span>
                    <span className="text-muted ml-auto">
                        {testedCount}/{testCases.length}
                    </span>
                </div>
            )}

            {/* Test Cases List */}
            <div className="max-h-64 overflow-y-auto">
                {testCases.map((tc, idx) => (
                    <div
                        key={tc.id}
                        className="flex items-center gap-2 px-4 py-2 border-b border-default hover:bg-surface-muted"
                    >
                        <span className="w-6 text-xs text-muted font-mono">{idx + 1}.</span>

                        <input
                            type="text"
                            value={tc.input}
                            onChange={(e) => updateTestCase(tc.id, { input: e.target.value })}
                            placeholder="entrada..."
                            className="flex-1 bg-transparent border-none text-sm font-mono text-primary outline-none"
                            disabled={isRunning}
                        />

                        <select
                            value={tc.expected}
                            onChange={(e) => updateTestCase(tc.id, { expected: e.target.value as 'accept' | 'reject' })}
                            className="bg-transparent text-xs font-bold outline-none cursor-pointer"
                            disabled={isRunning}
                        >
                            <option value="accept" className="text-ios-green">Aceita</option>
                            <option value="reject" className="text-ios-red">Rejeita</option>
                        </select>

                        <div className="w-6 flex items-center justify-center">
                            {tc.result === 'running' ? (
                                <Loader2 size={14} className="text-ios-blue animate-spin" />
                            ) : tc.result === 'accepted' ? (
                                <CheckCircle2 size={14} className={
                                    tc.expected === 'accept' ? 'text-ios-green' : 'text-ios-red'
                                } />
                            ) : tc.result === 'rejected' ? (
                                <XCircle size={14} className={
                                    tc.expected === 'reject' ? 'text-ios-green' : 'text-ios-red'
                                } />
                            ) : null}
                        </div>

                        <button
                            onClick={() => removeTestCase(tc.id)}
                            disabled={isRunning}
                            className="p-1 text-muted hover:text-ios-red transition-colors disabled:opacity-30"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add new test */}
            <div className="px-4 py-2 border-b border-default flex items-center gap-2">
                <input
                    type="text"
                    value={newInput}
                    onChange={(e) => setNewInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTestCase()}
                    placeholder="Adicionar teste..."
                    className="flex-1 bg-transparent border-none text-sm font-mono text-primary outline-none placeholder-gray-400"
                    disabled={isRunning}
                />
                <button
                    onClick={addTestCase}
                    disabled={isRunning}
                    className="p-1.5 rounded-lg bg-ios-blue text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                    <Plus size={14} />
                </button>
            </div>

            {/* Actions */}
            <div className="px-4 py-3 flex gap-2">
                <button
                    onClick={runAllTests}
                    disabled={isRunning || testCases.length === 0}
                    className="flex-1 py-2 rounded-xl bg-ios-blue text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                    {isRunning ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Testando...
                        </>
                    ) : (
                        <>
                            <Play size={16} fill="currentColor" />
                            Executar Todos
                        </>
                    )}
                </button>

                {testedCount > 0 && (
                    <button
                        onClick={clearResults}
                        disabled={isRunning}
                        className="py-2 px-4 rounded-xl bg-surface-muted text-secondary font-bold text-sm hover:bg-surface-soft transition-colors disabled:opacity-50"
                    >
                        Limpar
                    </button>
                )}
            </div>
        </div>
    );
};
