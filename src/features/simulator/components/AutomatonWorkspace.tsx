import React from 'react';

interface AutomatonWorkspaceProps {
    editor: React.ReactNode;
    topBar: React.ReactNode;
    rightDock?: React.ReactNode;
    bottomDock: React.ReactNode;
    showRightDock: boolean;
}

export const AutomatonWorkspace: React.FC<AutomatonWorkspaceProps> = ({
    editor,
    topBar,
    rightDock,
    bottomDock,
    showRightDock
}) => (
    <div className="flex-1 min-h-0 px-3 pb-3">
        <div className={`mx-auto grid h-full min-h-0 max-w-[1500px] grid-cols-1 grid-rows-[auto,minmax(0,1fr),auto] gap-3 ${showRightDock ? 'lg:grid-cols-[minmax(0,1fr),22rem]' : ''}`}>
            <div className={`flex flex-wrap items-start gap-2 ${showRightDock ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                {topBar}
            </div>

            <div className={`min-h-0 overflow-hidden rounded-[32px] border border-default bg-app/50 shadow-apple-lg ${showRightDock ? 'lg:col-start-1 lg:row-start-2' : ''}`}>
                {editor}
            </div>

            {showRightDock && rightDock && (
                <aside className="min-h-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
                    <div className="h-full lg:max-h-full lg:overflow-y-auto lg:overflow-x-hidden lg:custom-scrollbar lg:pr-1">
                        {rightDock}
                    </div>
                </aside>
            )}

            <div className={`${showRightDock ? 'lg:col-start-1 lg:row-start-3' : ''}`}>
                {bottomDock}
            </div>
        </div>
    </div>
);
