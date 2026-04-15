import React from 'react';

interface EditorShellProps {
    leftToolbar?: React.ReactNode;
    rightPanel?: React.ReactNode;
    canvas: React.ReactNode;
    emptyState?: React.ReactNode;
    minimap?: React.ReactNode;
    bottomBar?: React.ReactNode;
    modals?: React.ReactNode;
}

export const EditorShell: React.FC<EditorShellProps> = ({
    leftToolbar,
    rightPanel,
    canvas,
    emptyState,
    minimap,
    bottomBar,
    modals,
}) => (
    <div className="relative grid h-full min-h-0 grid-cols-1 grid-rows-[auto,minmax(0,1fr),auto,auto] gap-3 bg-app p-3 lg:grid-cols-[auto,minmax(0,1fr),18rem] lg:grid-rows-[minmax(0,1fr),auto]">
        {leftToolbar && (
            <aside className="min-h-0 lg:row-span-2">
                {leftToolbar}
            </aside>
        )}

        <div className="relative min-h-[22rem] min-w-0 overflow-hidden rounded-[32px] border border-default bg-app shadow-apple-md lg:col-start-2">
            {emptyState}
            {canvas}
            {minimap}
        </div>

        {rightPanel && (
            <aside className="min-h-0 lg:col-start-3 lg:row-start-1">
                {rightPanel}
            </aside>
        )}

        {bottomBar && (
            <div className="lg:col-start-2 lg:row-start-2">
                {bottomBar}
            </div>
        )}

        {modals}
    </div>
);
