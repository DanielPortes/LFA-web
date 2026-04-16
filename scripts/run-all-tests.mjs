import { spawnSync } from 'node:child_process';

const repoRoot = process.cwd();
const runner = ['scripts/run-vitest-files.mjs'];
const modes = ['logic', 'ui'];

for (const mode of modes) {
    const result = spawnSync(
        process.execPath,
        [...runner, mode],
        {
            cwd: repoRoot,
            stdio: 'inherit',
            env: process.env,
        }
    );

    if ((result.status ?? 1) !== 0) {
        process.exit(result.status ?? 1);
    }
}
