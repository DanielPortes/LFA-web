import React from 'react';
import { Focus, MousePointer2, Activity, CheckCircle2, XCircle } from 'lucide-react';
import { useUiSettings } from '../../hooks/UiSettingsContext';
import { Modal } from './Modal';
import { useToast } from './Toast';
import { runSelfCheck } from '../../utils/selfCheck';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ToggleRow = ({
    label,
    description,
    checked,
    onChange,
    icon
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
    icon: React.ReactNode;
}) => (
    <div className="flex items-center justify-between gap-4 py-3">
        <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-500">
                {icon}
            </div>
            <div>
                <div className="font-bold text-sm text-[var(--text-primary)]">{label}</div>
                <div className="text-xs text-[var(--text-secondary)]">{description}</div>
            </div>
        </div>
        <button
            onClick={() => onChange(!checked)}
            className={`w-12 h-7 rounded-full transition-colors relative ${
                checked ? 'bg-ios-blue' : 'bg-gray-300 dark:bg-gray-700'
            }`}
            aria-pressed={checked}
        >
            <span
                className={`absolute top-0.5 ${checked ? 'right-0.5' : 'left-0.5'} w-6 h-6 rounded-full bg-white shadow`}
            />
        </button>
    </div>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { focusMode, cursorEnabled, reduceMotion, effectiveReduceMotion, setFocusMode, setCursorEnabled, setReduceMotion } = useUiSettings();
    const { addToast } = useToast();

    const handleSelfCheck = () => {
        const results = runSelfCheck();
        const failed = results.filter(r => !r.ok);
        if (failed.length === 0) {
            addToast('Auto-testes: tudo OK', 'success');
        } else {
            addToast(`Auto-testes: ${failed.length} falha(s)`, 'error', 4000);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Preferências">
            <div className="space-y-6">
                <div className="space-y-2">
                    <ToggleRow
                        label="Modo foco"
                        description="Aumenta contraste e reduz transparências."
                        checked={focusMode}
                        onChange={setFocusMode}
                        icon={<Focus size={18} />}
                    />
                    <ToggleRow
                        label="Cursor customizado"
                        description="Desative para maior precisão ou acessibilidade."
                        checked={cursorEnabled}
                        onChange={setCursorEnabled}
                        icon={<MousePointer2 size={18} />}
                    />
                    <ToggleRow
                        label="Reduzir animações"
                        description={effectiveReduceMotion ? 'Ativo (inclui preferência do sistema).' : 'Desativa animações e efeitos pesados.'}
                        checked={reduceMotion}
                        onChange={setReduceMotion}
                        icon={<Activity size={18} />}
                    />
                </div>

                <div className="rounded-2xl border border-[var(--border-color)] p-4 flex items-center justify-between">
                    <div>
                        <div className="font-bold text-sm text-[var(--text-primary)]">Auto-testes rápidos</div>
                        <div className="text-xs text-[var(--text-secondary)]">Verifica lógica básica de autômatos e regex.</div>
                    </div>
                    <button
                        onClick={handleSelfCheck}
                        className="px-3 py-2 rounded-xl bg-ios-blue text-white text-xs font-bold hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                        <CheckCircle2 size={14} />
                        Rodar
                    </button>
                </div>

                <div className="text-xs text-gray-400 flex items-center gap-2">
                    <XCircle size={14} />
                    Alterações são salvas localmente neste dispositivo.
                </div>
            </div>
        </Modal>
    );
};
