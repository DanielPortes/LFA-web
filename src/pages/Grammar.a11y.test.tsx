import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UiSettingsProvider } from '../hooks/UiSettingsContext';
import { runAxe } from '../test/axe';
import { mockViewport } from '../test/browserMocks';
import { GrammarPage } from './Grammar';

describe('GrammarPage accessibility', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('mantém a aba de gramática sem violações críticas', async () => {
        mockViewport({ width: 1280, height: 800, reduceMotion: true });

        const { container } = render(
            <UiSettingsProvider>
                <GrammarPage />
            </UiSettingsProvider>
        );

        expect(screen.getByLabelText('Fonte da gramática')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Derivar' })).toBeInTheDocument();
        expect(await runAxe(container)).toHaveNoViolations();
    });
});
