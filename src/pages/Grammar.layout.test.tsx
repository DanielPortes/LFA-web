import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UiSettingsProvider } from '../hooks/UiSettingsContext';
import { mockViewport } from '../test/browserMocks';
import { GrammarPage } from './Grammar';

const viewportMatrix = [
    { label: '390x844', width: 390, height: 844 },
    { label: '768x1024', width: 768, height: 1024 },
    { label: '1280x800', width: 1280, height: 800 },
    { label: '1440x900', width: 1440, height: 900 },
];

describe('GrammarPage layout', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    viewportMatrix.forEach(({ label, width, height }) => {
        it(`renderiza rail, stage vazio e dock inferior alinhado em ${label}`, () => {
            mockViewport({ width, height });

            render(
                <UiSettingsProvider>
                    <GrammarPage />
                </UiSettingsProvider>
            );

            expect(screen.getByText('Laboratório de gramáticas')).toBeInTheDocument();
            if (width < 1024) {
                fireEvent.click(screen.getByRole('button', { name: 'Abrir painel da gramática' }));
            }
            expect(screen.getByLabelText('Fonte da gramática')).toBeInTheDocument();
            expect(screen.getByText('Pronto para derivar')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Derivar/i })).toBeInTheDocument();
            expect(screen.getByLabelText('Palavra a ser derivada')).toBeInTheDocument();
        });
    });
});
