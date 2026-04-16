import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'node',
        environmentMatchGlobs: [
            ['src/**/*.{test,a11y}.tsx', 'jsdom'],
            ['src/hooks/useAutomatonSimulation.test.ts', 'jsdom'],
            ['src/components/automaton/canvas/useCanvasViewport.test.ts', 'jsdom'],
            ['src/components/automaton/editor/useEditorViewport.test.ts', 'jsdom'],
        ],
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['src/utils/**/*.ts', 'src/simulation/**/*.ts'],
        },
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    },
});
