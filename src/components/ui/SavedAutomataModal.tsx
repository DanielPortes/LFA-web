import React, { useEffect, useMemo, useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import type { AutomatoData } from '../../types';
import { Modal } from './Modal';
import type { ModalBaseProps } from './types';

interface SavedItem {
    id: string;
    name: string;
    createdAt: number;
    data: AutomatoData;
}

interface SavedAutomataModalProps extends ModalBaseProps {
    current: AutomatoData;
    onLoad: (data: AutomatoData) => void;
}

const STORAGE_KEY = 'lfa-automata-library';

const loadItems = (): SavedItem[] => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return [];
        const parsed = JSON.parse(saved) as SavedItem[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const saveItems = (items: SavedItem[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
        // ignore
    }
};

export const SavedAutomataModal: React.FC<SavedAutomataModalProps> = ({
    isOpen,
    onClose,
    current,
    onLoad
}) => {
    const [items, setItems] = useState<SavedItem[]>([]);
    const [name, setName] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setItems(loadItems());
        setName(current.descricao || 'Novo autômato');
    }, [isOpen, current.descricao]);

    const hasItems = items.length > 0;
    const sortedItems = useMemo(() => (
        [...items].sort((a, b) => b.createdAt - a.createdAt)
    ), [items]);

    const handleSave = () => {
        if (!name.trim()) return;
        const next: SavedItem = {
            id: crypto.randomUUID(),
            name: name.trim(),
            createdAt: Date.now(),
            data: current
        };
        const updated = [next, ...items];
        setItems(updated);
        saveItems(updated);
        setName(current.descricao || 'Novo autômato');
    };

    const handleLoad = (item: SavedItem) => {
        const clone = JSON.parse(JSON.stringify(item.data)) as AutomatoData;
        onLoad(clone);
        onClose();
    };

    const handleDelete = (id: string) => {
        const updated = items.filter(item => item.id !== id);
        setItems(updated);
        saveItems(updated);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Biblioteca de Autômatos">
            <div className="space-y-6">
                <div className="rounded-2xl border border-default p-4 flex flex-col gap-3">
                    <div className="ui-kicker text-secondary">Salvar autômato atual</div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nome do autômato"
                            className="flex-1 rounded-xl border border-default bg-surface-2 px-4 py-2 text-sm text-primary shadow-inner"
                        />
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 rounded-xl bg-ios-blue text-white text-xs font-bold hover:bg-blue-600 transition-colors"
                        >
                            Salvar
                        </button>
                    </div>
                </div>

                {hasItems ? (
                    <div className="space-y-3">
                        {sortedItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-default p-4 bg-surface-1">
                                <div>
                                    <div className="text-sm font-bold text-primary">{item.name}</div>
                                    <div className="text-xs text-muted">
                                        {new Date(item.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleLoad(item)}
                                        className="px-3 py-2 rounded-xl bg-ios-green text-white text-xs font-bold hover:bg-green-600 transition-colors flex items-center gap-2"
                                    >
                                        <Download size={14} />
                                        Carregar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 rounded-xl text-ios-red hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-default p-6 text-sm text-muted">
                        Nenhum autômato salvo ainda.
                    </div>
                )}
            </div>
        </Modal>
    );
};
