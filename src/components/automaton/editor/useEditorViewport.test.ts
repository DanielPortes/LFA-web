import { act, renderHook, waitFor } from '@testing-library/react';
import type { RefObject } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Estado } from '../../../types';
import { useEditorViewport } from './useEditorViewport';

const states: Estado[] = [
    { id: 'q0', label: 'q0', x: -100, y: -50, isInicial: true, isFinal: false },
    { id: 'q1', label: 'q1', x: 300, y: 150, isInicial: false, isFinal: true },
];

const createCanvasRef = (width = 1200, height = 800) => {
    const canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    canvas.getBoundingClientRect = vi.fn(() => ({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: width,
        bottom: height,
        width,
        height,
        toJSON: () => ({}),
    }));
    document.body.appendChild(canvas);
    return { current: canvas } as RefObject<SVGSVGElement | null>;
};

afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
});

describe('useEditorViewport', () => {
    it('calcula fit to content estável para estados com coordenadas negativas e positivas', () => {
        const onViewStateChange = vi.fn();
        const canvasRef = createCanvasRef();
        const { result } = renderHook(() => useEditorViewport({
            canvasRef,
            states,
            onViewStateChange,
        }));

        act(() => {
            result.current.fitToContent();
        });

        const [nextZoom, nextPan] = onViewStateChange.mock.calls[0] as [number, { x: number; y: number }];
        expect(nextZoom).toBeCloseTo(1.33, 2);
        expect(nextPan.x).toBeCloseTo(466.67, 1);
        expect(nextPan.y).toBeCloseTo(333.33, 1);
    });

    it('executa fit automaticamente quando recebe um novo fitRequestToken', async () => {
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
            callback(0);
            return 1;
        });
        const onViewStateChange = vi.fn();
        const canvasRef = createCanvasRef(960, 720);
        const { rerender } = renderHook(
            ({ fitRequestToken }) => useEditorViewport({
                canvasRef,
                states,
                onViewStateChange,
                fitRequestToken,
            }),
            {
                initialProps: { fitRequestToken: 1 },
            }
        );

        rerender({ fitRequestToken: 2 });

        await waitFor(() => {
            expect(onViewStateChange).toHaveBeenCalled();
        });
    });

    it('não recalcula a câmera automaticamente quando apenas a posição de um estado muda', async () => {
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
            callback(0);
            return 1;
        });
        const canvasRef = createCanvasRef(960, 720);
        const movedStates: Estado[] = [
            states[0],
            { ...states[1], x: 900, y: 420 },
        ];

        const { result, rerender } = renderHook(
            ({ currentStates }) => useEditorViewport({
                canvasRef,
                states: currentStates,
            }),
            {
                initialProps: { currentStates: states },
            }
        );

        act(() => {
            result.current.fitToContent();
        });

        const fittedPan = result.current.pan;
        const fittedZoom = result.current.zoom;

        await act(async () => {
            rerender({ currentStates: movedStates });
            await Promise.resolve();
        });

        expect(result.current.pan).toEqual(fittedPan);
        expect(result.current.zoom).toBe(fittedZoom);
    });

    it('mantém pan para deltas mínimos e atualiza zoom no modo não controlado', () => {
        const canvasRef = createCanvasRef();
        const { result } = renderHook(() => useEditorViewport({
            canvasRef,
            states: [],
        }));

        act(() => {
            result.current.handlePanChange({ x: 0.2, y: 0.2 });
            result.current.handleZoomChange(1.4);
        });

        expect(result.current.pan).toEqual({ x: 0, y: 0 });
        expect(result.current.zoom).toBe(1.4);
    });
});
