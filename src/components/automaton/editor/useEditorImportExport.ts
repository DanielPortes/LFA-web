import { useRef, useCallback } from 'react';
import type { ChangeEvent, RefObject } from 'react';
import type { AutomatoData } from '../../../types';
import type { ToastContextType } from '../../ui/toast-context';
import type { EditorViewport, LoadAutomatonOptions } from './types';
import { generateShareUrl, copyToClipboard, exportAsSvg, exportAsPng, downloadFile, downloadDataUrl } from '../../../utils/sharing';
import { optimizeLoadedLayout } from '../../../utils/layout';

interface UseEditorImportExportOptions {
    data: AutomatoData;
    viewport: EditorViewport;
    canvasRef: RefObject<SVGSVGElement | null>;
    onLoadAutomaton: (data: AutomatoData) => void;
    fitToContent: () => void;
    addToast: ToastContextType['addToast'];
}

export const useEditorImportExport = ({
    data,
    viewport,
    canvasRef,
    onLoadAutomaton,
    fitToContent,
    addToast,
}: UseEditorImportExportOptions) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const normalizeLoadedAutomaton = useCallback((incoming: AutomatoData) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        const viewWidth = rect?.width || viewport.width || 800;
        const viewHeight = rect?.height || viewport.height || 600;
        const { states: optimizedStates, needsReposition } = optimizeLoadedLayout(
            incoming.estados,
            incoming.transicoes,
            viewWidth,
            viewHeight
        );

        return {
            normalized: { ...incoming, estados: optimizedStates } as AutomatoData,
            needsReposition,
        };
    }, [canvasRef, viewport.height, viewport.width]);

    const loadAutomatonIntoEditor = useCallback((incoming: AutomatoData, options?: LoadAutomatonOptions) => {
        const { normalized, needsReposition } = normalizeLoadedAutomaton(incoming);
        onLoadAutomaton(normalized);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                fitToContent();
            });
        });

        if (options?.quiet) return;

        if (needsReposition && options?.repositionMessage) {
            addToast(options.repositionMessage, 'info');
            return;
        }

        if (needsReposition) {
            addToast('Autômato carregado e ajustado na tela.', 'success');
            return;
        }

        if (options?.successMessage) {
            addToast(options.successMessage, 'success');
        }
    }, [addToast, fitToContent, normalizeLoadedAutomaton, onLoadAutomaton]);

    const exportData = useCallback(() => {
        const jsonString = JSON.stringify(data, null, 2);
        downloadFile(jsonString, `automato-${Date.now()}.json`, 'application/json');
        addToast('Autômato exportado como JSON.', 'success');
    }, [addToast, data]);

    const handleImport = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            try {
                const imported = JSON.parse(loadEvent.target?.result as string);
                if (!imported.estados || !imported.transicoes) {
                    addToast('Arquivo JSON inválido.', 'error');
                    return;
                }

                loadAutomatonIntoEditor(imported as AutomatoData, {
                    successMessage: 'Autômato importado com sucesso.',
                    repositionMessage: 'Autômato importado e reposicionado automaticamente.'
                });
            } catch (error) {
                if (error instanceof SyntaxError) {
                    addToast('Arquivo JSON malformado.', 'error');
                } else {
                    addToast('Erro ao processar arquivo.', 'error');
                }
            } finally {
                event.target.value = '';
            }
        };

        reader.readAsText(file);
    }, [addToast, loadAutomatonIntoEditor]);

    const handleShare = useCallback(async () => {
        const url = generateShareUrl(data);
        if (url.length > 1900) {
            addToast('Link muito longo. Use Exportar JSON.', 'warning', 4000);
        }

        const success = await copyToClipboard(url);
        if (success) {
            addToast('Link copiado!', 'success');
            return;
        }

        addToast('Erro ao copiar link', 'error');
    }, [addToast, data]);

    const handleExportSVG = useCallback(() => {
        if (!canvasRef.current) return;

        const svg = exportAsSvg(canvasRef.current);
        downloadFile(svg, `automato-${Date.now()}.svg`, 'image/svg+xml');
        addToast('Exportado como SVG', 'success');
    }, [addToast, canvasRef]);

    const handleExportPNG = useCallback(async () => {
        if (!canvasRef.current) return;

        try {
            const dataUrl = await exportAsPng(canvasRef.current);
            downloadDataUrl(dataUrl, `automato-${Date.now()}.png`);
            addToast('Exportado como PNG', 'success');
        } catch {
            addToast('Erro ao exportar PNG', 'error');
        }
    }, [addToast, canvasRef]);

    return {
        fileInputRef,
        normalizeLoadedAutomaton,
        loadAutomatonIntoEditor,
        exportData,
        handleImport,
        handleShare,
        handleExportSVG,
        handleExportPNG,
    };
};
