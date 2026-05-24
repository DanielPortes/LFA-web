import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UiSettingsContext, type UiSettings } from '../../hooks/uiSettingsStore';
import { ToastContext } from './toast-context';
import { SettingsModal } from './SettingsModal';

const settings: UiSettings = {
    focusMode: false,
    reduceMotion: false,
    effectiveReduceMotion: false,
    snapToGrid: false,
    simulatorLayout: 'bottom',
    inputTokenization: 'auto',
    inputSeparator: '',
    setFocusMode: vi.fn(),
    setReduceMotion: vi.fn(),
    setSnapToGrid: vi.fn(),
    setSimulatorLayout: vi.fn(),
    setInputTokenization: vi.fn(),
    setInputSeparator: vi.fn(),
};

const renderSettingsModal = () => render(
    <ToastContext.Provider value={{ addToast: vi.fn(), removeToast: vi.fn() }}>
        <UiSettingsContext.Provider value={settings}>
            <SettingsModal isOpen={true} onClose={vi.fn()} />
        </UiSettingsContext.Provider>
    </ToastContext.Provider>
);

describe('SettingsModal', () => {
    it('mantém diagnósticos internos fora das preferências do aluno', () => {
        renderSettingsModal();

        expect(screen.getByRole('dialog', { name: 'Preferências' })).toBeInTheDocument();
        expect(screen.queryByText('Auto-testes rápidos')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Rodar' })).not.toBeInTheDocument();
    });

    it('não oferece cursor customizado quando o app usa o cursor nativo do sistema', () => {
        renderSettingsModal();

        expect(screen.queryByText('Cursor customizado')).not.toBeInTheDocument();
        expect(screen.queryByRole('switch', { name: /Cursor customizado/ })).not.toBeInTheDocument();
    });
});
