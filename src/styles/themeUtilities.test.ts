/// <reference types="node" />

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const sourceRoot = join(process.cwd(), 'src');
const indexCssPath = join(sourceRoot, 'index.css');

const collectSourceFiles = (dir: string): string[] => {
    const entries = readdirSync(dir);
    const files: string[] = [];

    for (const entry of entries) {
        const path = join(dir, entry);
        const stat = statSync(path);

        if (stat.isDirectory()) {
            files.push(...collectSourceFiles(path));
            continue;
        }

        if (path === indexCssPath || !/\.(ts|tsx)$/.test(path)) {
            continue;
        }

        files.push(path);
    }

    return files;
};

describe('theme utility coverage', () => {
    it('declara no CSS as opacidades de superfície e borda usadas pelos componentes', () => {
        const css = readFileSync(indexCssPath, 'utf8');
        const usedUtilities = new Set<string>();
        const utilityPattern = /\b(?:bg-surface-[123]|border-default)\/\d+\b/g;

        for (const file of collectSourceFiles(sourceRoot)) {
            const source = readFileSync(file, 'utf8');
            const matches = source.matchAll(utilityPattern);
            for (const match of matches) {
                usedUtilities.add(match[0]);
            }
        }

        expect(usedUtilities.size).toBeGreaterThan(0);

        for (const utility of [...usedUtilities].sort()) {
            expect(css).toContain(`.${utility.replace('/', '\\/')}`);
        }
    });
});
