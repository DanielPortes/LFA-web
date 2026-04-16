import React from 'react';

interface EditorShellProps {
    leftToolbar?: React.ReactNode;
    rightPanel?: React.ReactNode;
    canvas: React.ReactNode;
    emptyState?: React.ReactNode;
    minimap?: React.ReactNode;
    bottomBar?: React.ReactNode;
    modals?: React.ReactNode;
    compact?: boolean;
    overlays?: React.ReactNode;
}

export const EditorShell: React.FC<EditorShellProps> = ({
    leftToolbar,
    rightPanel,
    canvas,
    emptyState,
    minimap,
    bottomBar,
    modals,
    compact = false,
    overlays,
}) => (
    <div
        className={`relative h-full min-h-0 ${
            compact ? 'bg-transparent' : 'bg-app/5 p-3 lg:p-4'
        }`}
    >
        <div className={`relative min-h-0 overflow-hidden ${compact ? 'h-full min-h-[18rem]' : 'h-full min-h-[22rem] rounded-[28px] bg-canvas/35'}`}>
            {emptyState}
            {canvas}
            {minimap}
            {overlays}
        </div>

        {!compact && leftToolbar && (
            <aside className="pointer-events-none absolute left-4 top-4 z-20 flex">
                <div className="pointer-events-auto">{leftToolbar}</div>
            </aside>
        )}

        {!compact && rightPanel && (
            <aside className="pointer-events-none absolute bottom-20 right-4 top-4 z-20 hidden lg:block">
                <div className="pointer-events-auto h-full w-[18rem] max-h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {rightPanel}
                </div>
            </aside>
        )}

        {!compact && bottomBar && (
            <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20">
                <div className="pointer-events-auto flex justify-center">{bottomBar}</div>
            </div>
        )}

        {modals}
    </div>
);
