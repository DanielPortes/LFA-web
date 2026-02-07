import React from 'react';
import { Focus, MousePointer2, Activity, CheckCircle2, XCircle, Grid3X3 } from 'lucide-react';
import { useUiSettings } from '../../hooks/useUiSettings';
import { Modal } from './Modal';
import { useToast } from './toast-context';
import { runSelfCheck } from '../../utils/selfCheck';
import type { ModalBaseProps } from './types';

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
            type="button"
            onClick={() => onChange(!checked)}
            className={`w-12 h-7 rounded-full transition-colors relative ${
                checked ? 'bg-ios-blue' : 'bg-surface-soft'
            }`}
            role="switch"
            aria-checked={checked}
            aria-label={`${label}: ${checked ? 'ativado' : 'desativado'}`}
        >
            <span
                className={`absolute top-0.5 ${checked ? 'right-0.5' : 'left-0.5'} w-6 h-6 rounded-full bg-white shadow`}
            />
        </button>
    </div>
);

export const SettingsModal: React.FC<ModalBaseProps> = ({ isOpen, onClose }) => {
    const {
        focusMode,
        cursorEnabled,
        reduceMotion,
        effectiveReduceMotion,
        snapToGrid,
        simulatorLayout,
        inputTokenization,
        inputSeparator,
        setFocusMode,
        setCursorEnabled,
        setReduceMotion,
        setSnapToGrid,
        setSimulatorLayout,
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
        <Modal isOpen={isOpen} onClose={onClose} title="Preferências">
            <div className="space-y-6">
                <div className="space-y-2">
                    <ToggleRow
                        label="Modo foco"
                        description="Aumenta contraste e reduz transparências visuais."
                        checked={focusMode}
                        onChange={setFocusMode}
                        icon={<Focus size={18} />}
                    />
                    <ToggleRow
                        label="Cursor customizado"
                        description="Desative para manter cursor nativo em toda a interface."
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
                    <ToggleRow
                        label="Ajustar à grade"
                        description="Mantém estados alinhados automaticamente no editor."
                        checked={snapToGrid}
                        onChange={setSnapToGrid}
                        icon={<Grid3X3 size={18} />}
                    />
                </div>

                <div className="rounded-2xl border border-default p-4 space-y-3">
                    <div className="ui-kicker text-secondary">Layout do simulador</div>
                    <div className="grid gap-3 md:grid-cols-[1fr]">
                        <div>
                            <label className="block ui-kicker-xs text-muted mb-1">Organização dos painéis</label>
                            <select
                                value={simulatorLayout}
                                onChange={(e) => setSimulatorLayout(e.target.value as 'bottom' | 'side' | 'top_side')}
                                className="w-full rounded-xl border border-default bg-surface-2 px-3 py-2 text-sm font-semibold text-primary shadow-inner"
                            >
                                <option value="bottom">Dock inferior</option>
                                <option value="side">Painel lateral</option>
                                <option value="top_side">Topo + lateral</option>
                            </select>
                        </div>
                    </div>
                    <div className="text-xs text-muted">
                        No mobile, o simulador mantém o dock inferior para melhor usabilidade.
                    </div>
                </div>

                <div className="rounded-2xl border border-default p-4 space-y-3">
                    <div className="ui-kicker text-secondary">Entrada do simulador</div>
                    <div className="grid gap-3 md:grid-cols-[1fr,1fr] items-center">
                        <div>
                            <label className="block ui-kicker-xs text-muted mb-1">Tokenização</label>
                            <select
                                value={inputTokenization}
                                onChange={(e) => setInputTokenization(e.target.value as 'auto' | 'char' | 'separator')}
                                className="w-full rounded-xl border border-default bg-surface-2 px-3 py-2 text-sm font-semibold text-primary shadow-inner"
                            >
                                <option value="auto">Auto (espaço ou caracteres)</option>
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
                    <div className="text-xs text-muted">
                        Use o modo "Separador" para símbolos multi-caractere sem espaços.
                    </div>
                </div>

                <div className="rounded-2xl border border-default p-4 flex items-center justify-between gap-3">
                    <div>
                        <div className="font-bold text-sm text-primary">Auto-testes rápidos</div>
                        <div className="text-xs text-secondary">Verifica lógica básica de autômatos e regex.</div>
                    </div>
                    <button
                        type="button"
                        onClick={handleSelfCheck}
                        className="px-3 py-2 rounded-xl bg-ios-blue text-white text-xs font-bold hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                        <CheckCircle2 size={14} />
                        Rodar
                    </button>
                </div>

                <div className="text-xs text-muted flex items-center gap-2">
                    <XCircle size={14} />
                    Alterações são salvas localmente neste dispositivo.
                </div>
            </div>
        </Modal>
    );
};


