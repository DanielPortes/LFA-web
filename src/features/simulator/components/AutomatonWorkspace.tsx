import React from 'react';

interface AutomatonWorkspaceProps {
    editor: React.ReactNode;
    topBar: React.ReactNode;
    rightDock?: React.ReactNode;
    bottomDock: React.ReactNode;
    showRightDock: boolean;
    variant?: 'page' | 'modal';
}

export const AutomatonWorkspace: React.FC<AutomatonWorkspaceProps> = ({
    editor,
    topBar,
    rightDock,
    bottomDock,
    showRightDock,
    variant = 'page'
}) => (
    <div
        data-testid="simulator-workspace"
        className={variant === 'modal'
            ? 'flex-1 min-h-0'
            : 'flex-1 min-h-0 px-3 pb-3 sm:px-4 sm:pb-4 lg:px-5 lg:pb-5 2xl:px-6 2xl:pb-6'}
    >
        <div
            className={`relative h-full overflow-hidden rounded-[28px] border border-default bg-canvas shadow-apple-xl ${
                variant === 'modal'
                    ? 'min-h-0'
                    : 'min-h-[calc(100dvh-92px)] sm:min-h-[calc(100dvh-104px)] lg:min-h-[calc(100dvh-116px)]'
            }`}
        >
            <div className="absolute inset-0 min-h-0">
                {editor}
            </div>

            <div className="pointer-events-auto absolute left-4 top-4 z-30 flex max-w-[420px] flex-col gap-2">
                {topBar}
            </div>

            {showRightDock && rightDock && (
                <aside className="pointer-events-none absolute bottom-4 right-4 top-4 z-30 hidden md:block">
                    <div className="pointer-events-auto h-full max-h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
                        {rightDock}
                    </div>
                </aside>
            )}

            <div className="pointer-events-none absolute inset-x-4 bottom-4 z-30">
                <div className="pointer-events-auto mx-auto w-full max-w-[1040px]">
                    {bottomDock}
                </div>
            </div>
        </div>
    </div>
);
