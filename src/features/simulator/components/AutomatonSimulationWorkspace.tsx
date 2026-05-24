import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { regexToNfa } from '../../../utils/conversions';
import { inferAutomatonKind } from '../../../utils/automatonKind';
import type { AutomatoData } from '../../../types';
import { useToast } from '../../../components/ui';
import { useUiSettings } from '../../../hooks/useUiSettings';
import { useAutomatonSimulation } from '../../../hooks/useAutomatonSimulation';
import { isActivatableTarget, isEditableTarget, isTargetWithin, useWindowKeyboard } from '../../shortcuts';
import { AutomatonEditor } from '../../../components/automaton/AutomatonEditor';
import { AutomatonWorkspace } from './AutomatonWorkspace';
import { RegexImportCard } from './RegexImportCard';
import { SimulationControlsDock } from './SimulationControlsDock';
import { SimulationDock } from './SimulationDock';
import { SimulationHistoryPanel } from './SimulationHistoryPanel';
import { SimulatorStatusBar } from './SimulatorStatusBar';
import { SimulationTapePanel } from './SimulationTapePanel';
import { SimulationWarningsPanel } from './SimulationWarningsPanel';

interface AutomatonSimulationWorkspaceProps {
    data: AutomatoData;
    onChange: (data: AutomatoData) => void;
    resetToken?: number;
    variant?: 'page' | 'modal';
    returnToExerciseLabel?: string | null;
    onReturnToExercise?: () => void;
}

export const AutomatonSimulationWorkspace: React.FC<AutomatonSimulationWorkspaceProps> = ({
    data,
    onChange,
    resetToken,
    variant = 'page',
    returnToExerciseLabel,
    onReturnToExercise
}) => {
    const [isDesktopViewport, setIsDesktopViewport] = useState(() => {
        if (typeof window === 'undefined') return true;
        return window.matchMedia('(min-width: 1024px)').matches;
    });
    const [viewState, setViewState] = useState({ zoom: 1, pan: { x: 0, y: 0 } });
    const [fitRequestToken, setFitRequestToken] = useState(0);
    const [inputString, setInputString] = useState('');
    const [regexImport, setRegexImport] = useState('');
    const [regexImportError, setRegexImportError] = useState<string | null>(null);
    const [showRegexImport, setShowRegexImport] = useState(false);
    const [inspectorOpen, setInspectorOpen] = useState(false);
    const [hasRequestedSimulationView, setHasRequestedSimulationView] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const regexImportErrorId = useId();

    const { addToast } = useToast();
    const {
        inputTokenization,
        inputSeparator,
        setInputTokenization,
        setInputSeparator
    } = useUiSettings();
    const tokenizationConfig = useMemo(() => ({
        mode: inputTokenization,
        separator: inputSeparator
    }), [inputSeparator, inputTokenization]);
    const inferredKind = useMemo(() => inferAutomatonKind(data), [data]);
    const effectiveData = useMemo<AutomatoData>(() => (
        inferredKind.runtimeType === data.tipo
            ? data
            : { ...data, tipo: inferredKind.runtimeType } as AutomatoData
    ), [data, inferredKind.runtimeType]);

    const requestCanvasCenter = useCallback(() => {
        setViewState({ zoom: 1, pan: { x: 0, y: 0 } });
        setFitRequestToken((value) => value + 1);
    }, []);

    useEffect(() => {
        if (inferredKind.runtimeType === data.tipo) return;
        onChange(effectiveData);
    }, [data.tipo, effectiveData, inferredKind.runtimeType, onChange]);

    useEffect(() => {
        if (resetToken === undefined) return;

        setInputString('');
        setRegexImport('');
        setRegexImportError(null);
        setShowRegexImport(false);
        setInspectorOpen(effectiveData.tipo === 'AP');
        setHasRequestedSimulationView(false);
        requestAnimationFrame(() => requestCanvasCenter());
    }, [effectiveData.tipo, requestCanvasCenter, resetToken]);

    const handleViewStateChange = useCallback((zoom: number, pan: { x: number; y: number }) => {
        setViewState((prev) => {
            const zoomDelta = Math.abs(prev.zoom - zoom);
            const panDelta = Math.abs(prev.pan.x - pan.x) + Math.abs(prev.pan.y - pan.y);
            if (zoomDelta < 0.001 && panDelta < 0.5) return prev;
            return { zoom, pan };
        });
    }, []);

    const {
        simulationState,
        isPlaying,
        speed,
        history,
        activeTransitions,
        inputTokens,
        alphabet,
        invalidSymbols,
        hasInvalidInput,
        isPda,
        isTuring,
        isAll,
        isMoore,
        isMealy,
        stateLabelMap,
        setSpeed,
        setIsPlaying,
        resetSimulation,
        step,
        stepBack
    } = useAutomatonSimulation(
        effectiveData,
        inputString,
        tokenizationConfig
    );

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const media = window.matchMedia('(min-width: 1024px)');
        const onChangeViewport = (event: MediaQueryListEvent) => setIsDesktopViewport(event.matches);
        setIsDesktopViewport(media.matches);
        media.addEventListener('change', onChangeViewport);

        return () => media.removeEventListener('change', onChangeViewport);
    }, []);

    useEffect(() => {
        resetSimulation(false);
    }, [inputTokens, resetSimulation]);

    useEffect(() => {
        if (isPda) {
            setInspectorOpen(true);
        }
    }, [isPda]);

    const revealSimulationView = useCallback(() => {
        setInspectorOpen(true);
        setHasRequestedSimulationView(true);
    }, []);

    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setInputString(event.target.value);
    }, []);

    const clearInput = useCallback(() => {
        setInputString('');
        resetSimulation(true);
        inputRef.current?.focus();
    }, [resetSimulation]);

    const useEmptyInputAlias = useCallback(() => {
        setInputString('eps');
        resetSimulation(true);
        inputRef.current?.focus();
    }, [resetSimulation]);

    const handleRegexImport = useCallback(() => {
        const trimmed = regexImport.trim();
        if (!trimmed) return;

        try {
            const nfa = regexToNfa(trimmed);
            onChange(nfa);
            setRegexImportError(null);
            setShowRegexImport(false);
            requestAnimationFrame(() => requestCanvasCenter());
            addToast('Regex convertida para AFN', 'success');
        } catch {
            setRegexImportError('Regex inválida');
        }
    }, [addToast, onChange, regexImport, requestCanvasCenter]);

    const canStartSimulation = !hasInvalidInput && (inputTokens.length === 0 || alphabet.length > 0 || isTuring || isAll);

    useWindowKeyboard({
        onKeyDown: (event) => {
            const target = event.target;

            if (target === inputRef.current) {
                if (event.key === 'Enter' && !event.repeat) {
                    inputRef.current?.blur();
                    if (canStartSimulation) {
                        revealSimulationView();
                        resetSimulation();
                        setIsPlaying(true);
                    }
                }
                return;
            }

            if (isEditableTarget(target)) return;
            if (isActivatableTarget(target)) return;
            if (isTargetWithin(target, '[data-automaton-editor="true"]')) return;

            switch (event.code) {
                case 'Space':
                    if (event.repeat) break;
                    event.preventDefault();
                    if (canStartSimulation) {
                        const shouldStartFromBeginning = !simulationState || simulationState.status !== 'running';
                        if (shouldStartFromBeginning) {
                            revealSimulationView();
                            resetSimulation();
                            setIsPlaying(true);
                        } else {
                            setIsPlaying(!isPlaying);
                        }
                    }
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    if (canStartSimulation) {
                        revealSimulationView();
                        setIsPlaying(false);
                        if (!simulationState || simulationState.status !== 'running') {
                            resetSimulation();
                            break;
                        }
                        step();
                    }
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    stepBack();
                    break;
                case 'KeyR':
                    event.preventDefault();
                    resetSimulation();
                    break;
                default:
                    break;
            }
        }
    });

    const formatStateList = useCallback((ids: string[] | undefined) => {
        if (!ids || ids.length === 0) return 'vazio';
        return ids.map((id) => stateLabelMap.get(id) || id).join(', ');
    }, [stateLabelMap]);

    const stepCount = simulationState?.processedInput.length || 0;
    const totalSteps = inputTokens.length;
    const rawSimulationStatus = simulationState?.status ?? 'idle';
    const hasTerminalResult = rawSimulationStatus === 'accepted' || rawSimulationStatus === 'rejected';
    const hasAlphabetForInput = inputTokens.length === 0 || alphabet.length > 0 || isTuring || isAll;
    const canPlay = !hasInvalidInput && hasAlphabetForInput;
    const canStepForward = canPlay && simulationState?.status === 'running';
    const hasSimulationProgress = !!simulationState && (history.length > 1 || stepCount > 0 || hasTerminalResult);
    const simulationStatus = hasSimulationProgress ? rawSimulationStatus : 'idle';
    const displayedSimulationState = simulationState && !hasSimulationProgress
        ? { ...simulationState, activeStates: [] }
        : simulationState;
    const simulationStatusLabel = simulationStatus === 'accepted'
        ? 'aceita'
        : simulationStatus === 'rejected'
            ? 'rejeitada'
            : simulationStatus === 'running'
                ? 'rodando'
                : 'pronta';
    const disableReason = hasInvalidInput
        ? `Entrada contém símbolos fora do alfabeto: ${invalidSymbols.join(', ')}.`
        : !hasAlphabetForInput
            ? 'Defina o alfabeto de entrada no autômato antes de iniciar a simulação.'
            : null;

    const topBar = (
        <div className="flex flex-wrap items-center gap-2">
            {onReturnToExercise && (
                <button
                    type="button"
                    onClick={onReturnToExercise}
                    className="glass-panel inline-flex items-center gap-2 rounded-2xl border border-default px-3 py-2 text-[11px] font-black text-secondary shadow-apple-md transition-colors hover:bg-surface-hover hover:text-primary"
                >
                    <ArrowLeft size={14} />
                    <span>{returnToExerciseLabel ? `Voltar · ${returnToExerciseLabel}` : 'Voltar ao exercício'}</span>
                </button>
            )}
            <SimulatorStatusBar
                automatonType={inferredKind.displayType}
                stateCount={effectiveData.estados.length}
                transitionCount={effectiveData.transicoes.length}
                simulationStatus={simulationStatus}
                hasSimulationProgress={hasSimulationProgress}
            />
        </div>
    );

    const regexImportPanel = showRegexImport ? (
        <div className="pointer-events-auto max-w-[480px]">
            <RegexImportCard
                value={regexImport}
                error={regexImportError}
                errorId={regexImportErrorId}
                onChange={(value) => {
                    setRegexImport(value);
                    setRegexImportError(null);
                }}
                onImport={handleRegexImport}
                onClose={() => setShowRegexImport(false)}
            />
        </div>
    ) : (
        <div className="pointer-events-auto">
            <button
                onClick={() => setShowRegexImport(true)}
                className="glass-panel inline-flex items-center gap-2 rounded-full border border-default bg-surface-1/90 px-3 py-1.5 text-left shadow-apple-sm transition-all hover:bg-surface-1 hover:shadow-apple-md"
                aria-label="Abrir importação rápida Regex para AFN"
            >
                <div className="rounded-full bg-ios-blue/10 p-1 text-ios-blue">
                    <Sparkles size={13} />
                </div>
                <span className="text-xs font-bold text-primary">Regex → AFN</span>
                <span className="hidden text-[11px] text-secondary sm:inline">Importar ER</span>
            </button>
        </div>
    );

    const tapePanel = (
        <SimulationTapePanel
            data={effectiveData}
            inputTokens={inputTokens}
            history={history}
            simulationState={displayedSimulationState}
            simulationStatus={simulationStatus}
            isTuring={isTuring}
            isAll={isAll}
            isMoore={isMoore}
            isMealy={isMealy}
            isPda={isPda}
            stepCount={stepCount}
            totalSteps={totalSteps}
        />
    );

    const warningsPanel = (
        <SimulationWarningsPanel
            disableReason={disableReason}
            hasInvalidInput={hasInvalidInput}
            isPda={isPda}
        />
    );

    const detailsPanel = (
        <SimulationHistoryPanel
            showDetails={inspectorOpen}
            history={history}
            alphabet={alphabet}
            formatStateList={formatStateList}
        />
    );

    const controlsBar = (
        <SimulationControlsDock
            inputRef={inputRef}
            inputString={inputString}
            onInputChange={handleInputChange}
            inputTokenization={inputTokenization}
            inputSeparator={inputSeparator}
            setInputTokenization={setInputTokenization}
            setInputSeparator={setInputSeparator}
            clearInput={clearInput}
            useEmptyInputAlias={useEmptyInputAlias}
            hasInvalidInput={hasInvalidInput}
            isPlaying={isPlaying}
            canPlay={canPlay}
            canStepForward={canStepForward}
            historyLength={history.length}
            speed={speed}
            simulationState={simulationState}
            hasSimulationProgress={hasSimulationProgress}
            isDesktopViewport={isDesktopViewport}
            isTuring={isTuring}
            stepCount={stepCount}
            totalSteps={totalSteps}
            inspectorOpen={inspectorOpen}
            onToggleInspector={() => setInspectorOpen((value) => !value)}
            onPlay={() => {
                revealSimulationView();
                if (!simulationState || simulationState.status !== 'running') {
                    resetSimulation();
                }
                setIsPlaying(true);
            }}
            onPause={() => setIsPlaying(false)}
            onStep={() => {
                revealSimulationView();
                if (!simulationState || simulationState.status !== 'running') {
                    resetSimulation();
                    return;
                }
                step();
            }}
            onStepBack={stepBack}
            onReset={() => resetSimulation()}
            onResetToEditor={() => resetSimulation(true)}
            onSpeedChange={setSpeed}
        />
    );

    return (
        <>
            <div className="sr-only" aria-live="polite">
                {`Simulação ${simulationStatusLabel}. ${effectiveData.estados.length} estados, ${effectiveData.transicoes.length} transições. ${
                    displayedSimulationState?.activeStates.length
                        ? `Estados ativos: ${formatStateList(displayedSimulationState.activeStates)}.`
                        : 'Nenhum estado ativo.'
                }`}
            </div>
            <SimulationDock
                desktopInspector={isDesktopViewport}
                inspectorOpen={inspectorOpen}
                onCloseInspector={() => setInspectorOpen(false)}
                regexImportPanel={regexImportPanel}
                warningsPanel={warningsPanel}
                detailsPanel={detailsPanel}
                tapePanel={tapePanel}
                controlsBar={controlsBar}
                disableReason={disableReason}
                isPda={isPda}
                showWarningsPanel={Boolean(disableReason || isPda)}
                showDetailsPanel={history.length > 1 || hasSimulationProgress}
                showTapePanel={inputTokens.length > 0 || isTuring || isPda || hasRequestedSimulationView || hasSimulationProgress}
            >
                {({ rightDock, bottomDock }) => (
                    <AutomatonWorkspace
                        variant={variant}
                        editor={(
                            <AutomatonEditor
                                data={effectiveData}
                                onChange={onChange}
                                activeStates={displayedSimulationState?.activeStates}
                                activeTransitions={activeTransitions}
                                readOnly={hasSimulationProgress}
                                viewState={viewState}
                                onViewStateChange={handleViewStateChange}
                                compact
                                compactVariant="workspace"
                                fitRequestToken={fitRequestToken}
                                hideCompactInspectorLauncher={isDesktopViewport && inspectorOpen}
                            />
                        )}
                        topBar={topBar}
                        showRightDock={isDesktopViewport && inspectorOpen}
                        rightDock={rightDock}
                        bottomDock={bottomDock}
                    />
                )}
            </SimulationDock>
        </>
    );
};
