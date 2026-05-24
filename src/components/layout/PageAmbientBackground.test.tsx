// @vitest-environment jsdom

import { act, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../hooks/ThemeContext';
import { UiSettingsProvider } from '../../hooks/UiSettingsContext';
import { UI_SETTINGS_STORAGE_KEY } from '../../hooks/uiSettingsStore';
import { mockViewport } from '../../test/browserMocks';
import type { Tab } from '../../types';
import { PageAmbientBackground } from './PageAmbientBackground';

const THEME_STORAGE_KEY = 'lfa-theme';

type RenderAmbientOptions = {
    tab?: Tab;
    theme?: 'light' | 'dark';
    transitionKey?: number;
    viewport?: {
        width: number;
        height: number;
        reduceMotion?: boolean;
    };
    settings?: Partial<{
        focusMode: boolean;
        reduceMotion: boolean;
        snapToGrid: boolean;
        simulatorLayout: 'bottom' | 'side' | 'top_side';
        inputTokenization: 'auto' | 'char' | 'separator';
        inputSeparator: string;
    }>;
};

const defaultSettings = {
    focusMode: false,
    reduceMotion: false,
    snapToGrid: false,
    simulatorLayout: 'bottom' as const,
    inputTokenization: 'auto' as const,
    inputSeparator: ' ',
};

const getAmbientElement = () => document.querySelector('.page-ambient') as HTMLElement | null;

const renderAmbient = ({
    tab = 'home',
    theme = 'light',
    transitionKey = 0,
    viewport = { width: 1280, height: 800, reduceMotion: false },
    settings = {}
}: RenderAmbientOptions = {}) => {
    mockViewport(viewport);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.localStorage.setItem(UI_SETTINGS_STORAGE_KEY, JSON.stringify({
        ...defaultSettings,
        ...settings
    }));

    return render(
        <UiSettingsProvider>
            <ThemeProvider>
                <PageAmbientBackground tab={tab} transitionKey={transitionKey} />
            </ThemeProvider>
        </UiSettingsProvider>
    );
};

describe('PageAmbientBackground', () => {
    afterEach(() => {
        window.localStorage.clear();
        document.documentElement.className = '';
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('aplica presets distintos para tema claro e escuro', () => {
        const lightRender = renderAmbient({ theme: 'light' });
        let ambient = getAmbientElement();

        expect(ambient).not.toBeNull();
        expect(ambient!.style.getPropertyValue('--ambient-base')).toContain('#eaf4ff');
        expect(ambient!.style.getPropertyValue('--ambient-orb-b')).toContain('56, 214, 255');
        expect(parseFloat(ambient!.style.getPropertyValue('--ambient-intensity'))).toBeGreaterThanOrEqual(0.7);

        lightRender.unmount();

        renderAmbient({ theme: 'dark' });
        ambient = getAmbientElement();

        expect(ambient).not.toBeNull();
        expect(ambient!.style.getPropertyValue('--ambient-base')).toContain('#071422');
        expect(ambient!.style.getPropertyValue('--ambient-orb-b')).toContain('24, 214, 255');
        expect(parseFloat(ambient!.style.getPropertyValue('--ambient-intensity'))).toBeGreaterThanOrEqual(0.58);
    });

    it('fica estático quando reduce motion está ativo', () => {
        renderAmbient({
            viewport: { width: 1280, height: 800, reduceMotion: true }
        });

        expect(getAmbientElement()).toHaveClass('is-static');
    });

    it('mantém estático o fundo nas páginas longas fora da home', () => {
        renderAmbient({ tab: 'conteudo' });

        expect(getAmbientElement()).toHaveClass('is-static');
    });

    it('reduz a intensidade no focus mode sem congelar o fundo', () => {
        const defaultRender = renderAmbient({ theme: 'light' });
        const baselineIntensity = parseFloat(getAmbientElement()!.style.getPropertyValue('--ambient-intensity'));

        defaultRender.unmount();

        renderAmbient({
            theme: 'light',
            settings: { focusMode: true }
        });

        const ambient = getAmbientElement();
        const focusIntensity = parseFloat(ambient!.style.getPropertyValue('--ambient-intensity'));

        expect(focusIntensity).toBeLessThan(baselineIntensity);
        expect(ambient).not.toHaveClass('is-static');
    });

    it('marca a transição temporária quando a aba muda', () => {
        vi.useFakeTimers();
        renderAmbient({ transitionKey: 1 });

        const ambient = getAmbientElement();
        expect(ambient).toHaveClass('is-transitioning');

        act(() => {
            vi.advanceTimersByTime(760);
        });

        expect(getAmbientElement()).not.toHaveClass('is-transitioning');
    });
});
