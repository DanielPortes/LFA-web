import { Buffer } from 'node:buffer';
import type { Page } from '@playwright/test';

type SharedAutomaton = {
    tipo: string;
    estados: Array<{
        id: string;
        label: string;
        x: number;
        y: number;
        isInicial: boolean;
        isFinal: boolean;
    }>;
    transicoes: Array<{
        id: string;
        de: string;
        para: string;
        simbolo: string;
        curvatura?: number;
    }>;
    descricao?: string;
};

export const encodeAutomaton = (data: SharedAutomaton) =>
    Buffer.from(JSON.stringify(data), 'utf-8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

export const stabilizePage = async (page: Page) => {
    await page.addStyleTag({
        content: `
            *,
            *::before,
            *::after {
                animation-duration: 0s !important;
                animation-delay: 0s !important;
                transition-duration: 0s !important;
                transition-delay: 0s !important;
                scroll-behavior: auto !important;
                caret-color: transparent !important;
            }
        `,
    });
};
