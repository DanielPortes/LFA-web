import React, { useState, useId } from 'react';
import { X, Circle, Binary, Type, Zap, ChevronRight, Play } from 'lucide-react';
import { automatonTemplates, templateCategories, type AutomatonTemplate } from '../../data/templates';
import type { AutomatoData } from '../../types';
import { useDialog } from '../../hooks/useDialog';

interface TemplatesGalleryProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (data: AutomatoData) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
    basic: <Circle size={16} />,
    binary: <Binary size={16} />,
    string: <Type size={16} />,
    advanced: <Zap size={16} />
};

export const TemplatesGallery: React.FC<TemplatesGalleryProps> = ({ isOpen, onClose, onSelect }) => {
    const [activeCategory, setActiveCategory] = useState<string>('basic');
    const [isAnimating, setIsAnimating] = useState(false);
    const titleId = useId();
    const dialogRef = useDialog(isOpen, onClose);

    React.useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredTemplates = automatonTemplates.filter(t => t.category === activeCategory);

    const handleSelect = (template: AutomatonTemplate) => {
        // Deep clone to avoid modifying original
        const data = JSON.parse(JSON.stringify(template.data));
        onSelect(data);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300
                    ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className={`
                relative w-full max-w-4xl max-h-[80vh] bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl
                transform transition-all duration-300 ease-out overflow-hidden flex
                ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
            `}>
                {/* Sidebar */}
                <div className="w-56 bg-gray-50 dark:bg-black/30 border-r border-gray-200 dark:border-white/10 p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 id={titleId} className="text-lg font-bold text-[var(--text-primary)]">Templates</h3>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <nav className="space-y-1">
                        {templateCategories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                                    ${activeCategory === cat.id
                                        ? 'bg-ios-blue text-white shadow-lg shadow-blue-500/20'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                                    }`}
                            >
                                {categoryIcons[cat.id]}
                                {cat.name}
                                {activeCategory === cat.id && <ChevronRight size={14} className="ml-auto" />}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/10">
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Selecione um template para começar rapidamente. Você pode modificar depois.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="grid gap-4 md:grid-cols-2">
                        {filteredTemplates.map(template => (
                            <button
                                key={template.id}
                                onClick={() => handleSelect(template)}
                                className="group text-left p-5 rounded-2xl border border-gray-200 dark:border-white/10
                                    bg-white dark:bg-white/5 hover:border-ios-blue dark:hover:border-ios-blue/50
                                    hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h4 className="font-bold text-[var(--text-primary)] group-hover:text-ios-blue transition-colors">
                                        {template.name}
                                    </h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                                        ${template.data.tipo === 'AFD'
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                        }`}>
                                        {template.data.tipo}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                                    {template.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <span>{template.data.estados.length} estados</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span>{template.data.transicoes.length} transições</span>
                                    </div>

                                    <div className="flex items-center gap-1 text-ios-blue text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Play size={12} fill="currentColor" />
                                        Usar
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {filteredTemplates.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <p>Nenhum template nesta categoria</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
