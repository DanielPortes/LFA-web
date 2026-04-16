import { axe } from 'jest-axe';

export const runAxe = (container: HTMLElement) => axe(container, {
    rules: {
        'color-contrast': { enabled: false },
    },
});
