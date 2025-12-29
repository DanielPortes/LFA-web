import React from 'react';
import { Focus, MousePointer2, Activity, CheckCircle2, XCircle } from 'lucide-react';
import { useUiSettings } from '../../hooks/UiSettingsContext';
import { Modal } from './Modal';
import { useToast } from './Toast';
import { runSelfCheck } from '../../utils/selfCheck';
import type { ModalBaseProps } from './types';

interface SettingsModalProps extends ModalBaseProps {}

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
            <div className="p-2 rounded-xl bg-surface-muted text-secondary">
                {icon}
            </div>
            <div>
                <div className="font-bold text-sm text-primary">{label}</div>
                <div className="text-xs text-secondary">{description}</div>
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
    const {
        focusMode,
        cursorEnabled,
        reduceMotion,
        effectiveReduceMotion,
        inputTokenization,
        inputSeparator,
        setFocusMode,
        setCursorEnabled,
        setReduceMotion,
        setInputTokenization,
        setInputSeparator
    } = useUiSettings();
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
        <Modal isOpen={isOpen} onClose={onClose} title="Preferencias">
            <div className="space-y-6">
                <div className="space-y-2">
                    <ToggleRow
                        label="Modo foco"
                        description="Aumenta contraste e reduz transparencias."
                        checked={focusMode}
                        onChange={setFocusMode}
                        icon={<Focus size={18} />}
                    />
                    <ToggleRow
                        label="Cursor customizado"
                        description="Desative para maior precisao ou acessibilidade."
                        checked={cursorEnabled}
                        onChange={setCursorEnabled}
                        icon={<MousePointer2 size={18} />}
                    />
                    <ToggleRow
                        label="Reduzir animacoes"
                        description={effectiveReduceMotion ? 'Ativo (inclui preferencia do sistema).' : 'Desativa animacoes e efeitos pesados.'}
                        checked={reduceMotion}
                        onChange={setReduceMotion}
                        icon={<Activity size={18} />}
                    />
                </div>

                <div className="rounded-2xl border border-default p-4 space-y-3">
                    <div className="ui-kicker text-secondary">Entrada do simulador</div>
                    <div className="grid gap-3 md:grid-cols-[1fr,1fr] items-center">
                        <div>
                            <label className="block ui-kicker-xs text-muted mb-1">Tokenizacao</label>
                            <select
                                value={inputTokenization}
                                onChange={(e) => setInputTokenization(e.target.value as 'auto' | 'char' | 'separator')}
                                className="w-full rounded-xl border border-default bg-surface-2 px-3 py-2 text-sm font-semibold text-primary shadow-inner"
                            >
                                <option value="auto">Auto (espaco ou caracteres)</option>
                                <option value="char">Caractere a caractere</option>
                                <option value="separator">Separador customizado</option>
                            </select>
                        </div>
                        <div>
                            <label className="block ui-kicker-xs text-muted mb-1">Separador</label>
                            <input
                                value={inputSeparator}
                                onChange={(e) => setInputSeparator(e.target.value)}
                                disabled={inputTokenization !== 'separator'}
                                placeholder="ex: , ou |"
                                className="w-full rounded-xl border border-default bg-surface-2 px-3 py-2 text-sm font-mono text-primary shadow-inner disabled:opacity-60"
                            />
                        </div>
                    </div>
                    <div className="text-[11px] text-muted">
                        Use o modo "Separador" para simbolos multi-caractere sem espacos.
                    </div>
                </div>

                <div className="rounded-2xl border border-default p-4 flex items-center justify-between">
                    <div>
                        <div className="font-bold text-sm text-primary">Auto-testes rapidos</div>
                        <div className="text-xs text-secondary">Verifica logica basica de automatos e regex.</div>
                    </div>
                    <button
                        onClick={handleSelfCheck}
                        className="px-3 py-2 rounded-xl bg-ios-blue text-white text-xs font-bold hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                        <CheckCircle2 size={14} />
                        Rodar
                    </button>
                </div>

                <div className="text-xs text-muted flex items-center gap-2">
                    <XCircle size={14} />
                    Alteracoes sao salvas localmente neste dispositivo.
                </div>
            </div>
        </Modal>
    );
};
