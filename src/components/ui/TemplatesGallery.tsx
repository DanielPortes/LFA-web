import React, { useState } from 'react';
import { Circle, Binary, Type, Zap, ChevronRight, Play } from 'lucide-react';
import { automatonTemplates, templateCategories, type AutomatonTemplate } from '../../data/templates';
import type { AutomatoData } from '../../types';
import { Modal } from './Modal';
import type { ModalBaseProps } from './types';

interface TemplatesGalleryProps extends ModalBaseProps {
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

    const filteredTemplates = automatonTemplates.filter(t => t.category === activeCategory);

    const handleSelect = (template: AutomatonTemplate) => {
        // Deep clone to avoid modifying original
        const data = JSON.parse(JSON.stringify(template.data));
        onSelect(data);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Templates" className="max-w-4xl">
            <div className="flex flex-col sm:flex-row gap-6 -m-2">
                {/* Sidebar */}
                <div className="sm:w-48 flex-shrink-0">
                    <nav className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0">
                        {templateCategories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                                    ${activeCategory === cat.id
                                        ? 'bg-ios-blue text-white shadow-lg shadow-blue-500/20'
                                        : 'text-secondary hover:bg-surface-muted'
                                    }`}
                            >
                                {categoryIcons[cat.id]}
                                {cat.name}
                                {activeCategory === cat.id && <ChevronRight size={14} className="ml-auto hidden sm:block" />}
                            </button>
                        ))}
                    </nav>

                    <p className="hidden sm:block text-xs text-muted leading-relaxed mt-4 pt-4 border-t border-default">
                        Selecione um template para começar rapidamente.
                    </p>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="grid gap-3 sm:grid-cols-2">
                        {filteredTemplates.map(template => (
                            <button
                                key={template.id}
                                onClick={() => handleSelect(template)}
                                className="group text-left p-4 rounded-2xl border border-default
                                    bg-surface-1 hover:border-ios-blue dark:hover:border-ios-blue/50
                                    hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-bold text-sm text-primary group-hover:text-ios-blue transition-colors">
                                        {template.name}
                                    </h4>
                                    <span className={`badge uppercase flex-shrink-0 ${
                                        template.data.tipo === 'AFD' ? 'badge-info' : 'badge-accent'
                                    }`}>
                                        {template.data.tipo}
                                    </span>
                                </div>

                                <p className="text-xs text-muted mb-3 leading-relaxed line-clamp-2">
                                    {template.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] text-muted">
                                        <span>{template.data.estados.length} estados</span>
                                        <span className="w-1 h-1 rounded-full bg-border"></span>
                                        <span>{template.data.transicoes.length} trans.</span>
                                    </div>

                                    <div className="flex items-center gap-1 rounded-full border border-ios-blue/20 bg-ios-blue/10 px-2 py-1 text-xs font-bold text-ios-blue transition-colors group-hover:bg-ios-blue group-hover:text-white">
                                        <Play size={12} fill="currentColor" />
                                        Usar template
                                    </div>
                                </div>
                                <div className="mt-3 text-[10px] font-semibold text-secondary">
                                    Substitui o canvas atual.
                                </div>
                            </button>
                        ))}
                    </div>

                    {filteredTemplates.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-48 text-muted">
                            <p>Nenhum template nesta categoria</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};
