import React from 'react';
import { GrammarWorkspace } from '../panels/GrammarWorkspace';

export type GrammarWorkspaceShellProps = React.ComponentProps<typeof GrammarWorkspace>;

export const GrammarWorkspaceShell: React.FC<GrammarWorkspaceShellProps> = (props) => (
    <GrammarWorkspace {...props} />
);
