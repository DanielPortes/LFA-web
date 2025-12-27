import React from 'react';
import { AlertTriangle, XCircle, Info, CheckCircle2, ChevronRight, Lightbulb } from 'lucide-react';
import type { ValidationIssue } from '../../utils/conversions';
import type { AutomatoData } from '../../types';
import { getAlphabet } from '../../utils/conversions';

interface ValidationPanelProps {
    issues: ValidationIssue[];
    automaton: AutomatoData;
    onStateClick?: (stateId: string) => void;
}

const IssueIcon = ({ type }: { type: ValidationIssue['type'] }) => {
    switch (type) {
        case 'error':
            return <XCircle size={16} className="text-ios-red flex-shrink-0" />;
        case 'warning':
            return <AlertTriangle size={16} className="text-ios-orange flex-shrink-0" />;
        case 'info':
            return <Info size={16} className="text-ios-blue flex-shrink-0" />;
    }
};

export const ValidationPanel: React.FC<ValidationPanelProps> = ({ issues, automaton, onStateClick }) => {
    const alphabet = getAlphabet(automaton);
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;
    const infoCount = issues.filter(i => i.type === 'info').length;

    const isValid = errorCount === 0;

    return (
        <div className="glass-panel rounded-2xl overflow-hidden">
            {/* Header */}
            <div className={`px-4 py-3 flex items-center gap-3 border-b border-[var(--border-color)]
                ${isValid ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10'}`}>
                {isValid ? (
                    <CheckCircle2 size={20} className="text-ios-green" />
                ) : (
                    <XCircle size={20} className="text-ios-red" />
                )}
                <div className="flex-1">
                    <h4 className="font-bold text-sm text-[var(--text-primary)]">
                        {isValid ? 'Autômato Válido' : 'Problemas Encontrados'}
                    </h4>
                    <p className="text-xs text-gray-600">
                        {automaton.tipo} • {automaton.estados.length} estados • {automaton.transicoes.length} transições
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="px-4 py-3 flex gap-4 border-b border-[var(--border-color)] bg-gray-50/50 dark:bg-black/20">
                <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                        ${errorCount > 0 ? 'bg-ios-red text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                        {errorCount}
                    </div>
                    <span className="text-xs text-gray-600">Erros</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                        ${warningCount > 0 ? 'bg-ios-orange text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                        {warningCount}
                    </div>
                    <span className="text-xs text-gray-600">Avisos</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                        ${infoCount > 0 ? 'bg-ios-blue text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                        {infoCount}
                    </div>
                    <span className="text-xs text-gray-600">Info</span>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <Lightbulb size={14} className="text-gray-600" />
                    <span className="text-xs text-gray-600">
                        Σ = {'{' + alphabet.join(', ') + '}'}
                    </span>
                </div>
            </div>

            {/* Issues List */}
            <div className="max-h-64 overflow-y-auto">
                {issues.length === 0 ? (
                    <div className="p-6 text-center">
                        <CheckCircle2 size={32} className="text-ios-green mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Nenhum problema encontrado!</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-white/5">
                        {issues.map((issue, idx) => (
                            <li
                                key={idx}
                                className={`flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors
                                    ${issue.stateId ? 'cursor-pointer' : ''}`}
                                onClick={() => issue.stateId && onStateClick?.(issue.stateId)}
                            >
                                <IssueIcon type={issue.type} />
                                <span className="text-sm text-[var(--text-primary)] flex-1">
                                    {issue.message}
                                </span>
                                {issue.stateId && (
                                    <ChevronRight size={14} className="text-gray-600 flex-shrink-0" />
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
