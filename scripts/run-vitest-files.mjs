import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = process.cwd();
const srcRoot = join(repoRoot, 'src');
const vitestEntrypoint = join(repoRoot, 'node_modules', 'vitest', 'vitest.mjs');
const mode = process.argv[2];
const maxOldSpaceSize = process.env.TEST_MAX_OLD_SPACE_SIZE?.trim()
    || (process.env.CI ? '6144' : '3072');

const domBackedTsTests = new Set([
    'src/components/automaton/canvas/useCanvasViewport.test.ts',
    'src/components/automaton/editor/useEditorViewport.test.ts',
    'src/hooks/useAutomatonSimulation.test.ts',
]);

if (!['logic', 'ui', 'a11y'].includes(mode)) {
    console.error('Modo inválido. Use "logic", "ui" ou "a11y".');
    process.exit(1);
}

const files = [];

const normalizePath = (filePath) => filePath.replace(/\\/g, '/');
const isAccessibilityTest = (filePath) => filePath.endsWith('.a11y.test.tsx');
const isUiTest = (filePath) => filePath.endsWith('.test.tsx') && !isAccessibilityTest(filePath);
const isLogicTest = (filePath) => filePath.endsWith('.test.ts');

const shouldInclude = (relativePath) => {
    if (mode === 'a11y') {
        return isAccessibilityTest(relativePath);
    }

    if (mode === 'ui') {
        return isUiTest(relativePath) || domBackedTsTests.has(relativePath);
    }

    return isLogicTest(relativePath) && !domBackedTsTests.has(relativePath);
};

const walk = (directory) => {
    for (const entry of readdirSync(directory)) {
        const fullPath = join(directory, entry);
        const stats = statSync(fullPath);

        if (stats.isDirectory()) {
            walk(fullPath);
            continue;
        }

        const repoRelativePath = normalizePath(relative(repoRoot, fullPath));

        if (!shouldInclude(repoRelativePath)) continue;
        files.push(repoRelativePath);
    }
};

walk(srcRoot);
files.sort((a, b) => a.localeCompare(b));

if (files.length === 0) {
    console.error(`Nenhum arquivo encontrado para o modo "${mode}".`);
    process.exit(1);
}

const environment = mode === 'logic' ? 'node' : 'jsdom';

const result = spawnSync(
    process.execPath,
    [
        `--max-old-space-size=${maxOldSpaceSize}`,
        vitestEntrypoint,
        'run',
        '--environment',
        environment,
        '--pool=threads',
        '--maxWorkers=1',
        ...files,
    ],
    {
        cwd: repoRoot,
        stdio: 'inherit',
        env: process.env,
    }
);

process.exit(result.status ?? 1);
