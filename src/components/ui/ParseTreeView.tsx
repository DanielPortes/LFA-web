import React from 'react';
import type { GrammarTree } from '../../utils/grammar';
import type { BaseProps } from './types';

interface ParseTreeViewProps extends BaseProps {
    tree: GrammarTree;
}

const TreeNode = ({ node }: { node: GrammarTree }) => (
    <li className="relative pl-4">
        <div className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-mono font-bold bg-surface-muted border border-default text-primary">
            {node.symbol}
        </div>
        {node.children.length > 0 && (
            <ul className="ml-4 mt-2 space-y-2 border-l border-default pl-4">
                {node.children.map((child, idx) => (
                    <TreeNode key={`${child.symbol}-${idx}`} node={child} />
                ))}
            </ul>
        )}
    </li>
);

export const ParseTreeView: React.FC<ParseTreeViewProps> = ({ tree, className = '' }) => (
    <div className={`rounded-xl border border-default bg-surface-soft p-4 ${className}`}>
        <ul className="space-y-2">
            <TreeNode node={tree} />
        </ul>
    </div>
);
