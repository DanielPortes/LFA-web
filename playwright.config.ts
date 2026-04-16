import { defineConfig } from '@playwright/test';

const isCI = Boolean(process.env.CI);

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: isCI,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    reporter: 'list',
    workers: isCI ? 2 : 1,
    expect: {
        timeout: 10_000,
    },
    use: {
        baseURL: 'http://127.0.0.1:4173',
        colorScheme: 'light',
        reducedMotion: 'reduce',
        trace: isCI ? 'retain-on-failure' : 'off',
        screenshot: 'only-on-failure',
        video: isCI ? 'retain-on-failure' : 'off',
    },
    projects: [
        {
            name: 'mobile-390',
            use: { viewport: { width: 390, height: 844 } },
        },
        {
            name: 'tablet-768',
            use: { viewport: { width: 768, height: 1024 } },
        },
        {
            name: 'desktop-1280',
            use: { viewport: { width: 1280, height: 800 } },
        },
        {
            name: 'desktop-1440',
            use: { viewport: { width: 1440, height: 900 } },
        },
    ],
    webServer: {
        command: 'npm run dev -- --host 127.0.0.1 --port 4173',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: !isCI,
        timeout: 120_000,
    },
});
