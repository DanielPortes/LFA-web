import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = process.cwd();
const srcRoot = join(repoRoot, 'src');
const vitestEntrypoint = join(repoRoot, 'node_modules', 'vitest', 'vitest.mjs');
const mode = process.argv[2];
const maxOldSpaceSize = process.env.TEST_MAX_OLD_SPACE_SIZE?.trim()
    || (process.env.CI ? '6144' : '3072');

const suffix = mode === 'ui'
    ? '.test.tsx'
    : mode === 'logic'
        ? '.test.ts'
        : mode === 'a11y'
            ? '.a11y.test.tsx'
        : null;

if (!suffix) {
    console.error('Modo inválido. Use "logic", "ui" ou "a11y".');
    process.exit(1);
}

const files = [];

const walk = (directory) => {
    for (const entry of readdirSync(directory)) {
        const fullPath = join(directory, entry);
        const stats = statSync(fullPath);

        if (stats.isDirectory()) {
            walk(fullPath);
            continue;
        }

        if (!fullPath.endsWith(suffix)) continue;
        files.push(relative(repoRoot, fullPath));
    }
};

walk(srcRoot);
files.sort((a, b) => a.localeCompare(b));

if (files.length === 0) {
    console.error(`Nenhum arquivo ${suffix} encontrado.`);
    process.exit(1);
}

const result = spawnSync(
    process.execPath,
    [
        `--max-old-space-size=${maxOldSpaceSize}`,
        vitestEntrypoint,
        'run',
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
