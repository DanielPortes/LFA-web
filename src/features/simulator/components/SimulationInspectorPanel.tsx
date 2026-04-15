import React, { useEffect, useMemo, useState } from 'react';

export interface SimulationInspectorItem {
    id: string;
    label: string;
    content: React.ReactNode;
}

interface SimulationInspectorPanelProps {
    items: SimulationInspectorItem[];
    preferredItemId?: string;
}

export const SimulationInspectorPanel: React.FC<SimulationInspectorPanelProps> = ({
    items,
    preferredItemId,
}) => {
    const availableItems = useMemo(
        () => items.filter((item) => item.content !== null && item.content !== undefined),
        [items]
    );
    const [activeItemId, setActiveItemId] = useState<string | null>(availableItems[0]?.id ?? null);

    useEffect(() => {
        if (availableItems.length === 0) {
            setActiveItemId(null);
            return;
        }

        if (!activeItemId || !availableItems.some((item) => item.id === activeItemId)) {
            setActiveItemId(availableItems[0].id);
        }
    }, [activeItemId, availableItems]);

    useEffect(() => {
        if (!preferredItemId) return;
        if (!availableItems.some((item) => item.id === preferredItemId)) return;
        setActiveItemId(preferredItemId);
    }, [availableItems, preferredItemId]);

    if (availableItems.length === 0) return null;
    if (availableItems.length === 1) return <>{availableItems[0].content}</>;

    const activeItem = availableItems.find((item) => item.id === activeItemId) ?? availableItems[0];

    return (
        <div className="glass-panel rounded-[28px] border border-default bg-surface-1/90 p-3 shadow-apple-lg">
            <div className="mb-3 flex flex-wrap gap-2">
                {availableItems.map((item) => {
                    const active = item.id === activeItem.id;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveItemId(item.id)}
                            className={`rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-wide transition-colors ${
                                active
                                    ? 'border-ios-blue bg-ios-blue text-white shadow-sm'
                                    : 'border-default bg-surface-muted text-secondary hover:text-primary hover:bg-surface-hover'
                            }`}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </div>
            <div>{activeItem.content}</div>
        </div>
    );
};
