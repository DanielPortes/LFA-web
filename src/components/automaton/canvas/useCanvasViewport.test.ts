import { act, renderHook, waitFor } from '@testing-library/react';
import type { RefObject } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AutomatoData } from '../../../types';
import { useCanvasViewport } from './useCanvasViewport';

const baseData: AutomatoData = {
    tipo: 'AFD',
    estados: [
        { id: 'q0', label: 'q0', x: 120, y: 160, isInicial: true, isFinal: false },
        { id: 'q1', label: 'q1', x: 340, y: 220, isInicial: false, isFinal: true },
    ],
    transicoes: [],
};

const createSvgRef = () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.getBoundingClientRect = vi.fn(() => ({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: 800,
        bottom: 600,
        width: 800,
        height: 600,
        toJSON: () => ({}),
    }));
    document.body.appendChild(svg);
    return { current: svg } as RefObject<SVGSVGElement | null>;
};

const createContainerRef = () => {
    const container = document.createElement('div');
    container.getBoundingClientRect = vi.fn(() => ({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: 1000,
        bottom: 600,
        width: 1000,
        height: 600,
        toJSON: () => ({}),
    }));
    document.body.appendChild(container);
    return { current: container } as RefObject<HTMLDivElement | null>;
};

afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
});

describe('useCanvasViewport', () => {
    it('dispara fit to content no carregamento inicial quando o viewport ainda está no estado padrão', async () => {
        const onFitToContent = vi.fn();

        renderHook(() => useCanvasViewport({
            data: baseData,
            zoom: 1,
            svgRef: createSvgRef(),
            containerRef: createContainerRef(),
            onFitToContent,
            onFocusState: vi.fn(),
        }));

        await waitFor(() => {
            expect(onFitToContent).toHaveBeenCalledTimes(1);
        });
    });

    it('centraliza o estado focado e marca o foco como tratado', async () => {
        const onFocusState = vi.fn();
        const onPanChange = vi.fn();
        const onFocusHandled = vi.fn();

        renderHook(() => useCanvasViewport({
            data: baseData,
            zoom: 1,
            svgRef: createSvgRef(),
            containerRef: createContainerRef(),
            focusStateId: 'q1',
            onPanChange,
            onFocusHandled,
            onFocusState,
        }));

        await waitFor(() => {
            expect(onFocusState).toHaveBeenCalledWith({ type: 'state', id: 'q1' });
            expect(onPanChange).toHaveBeenCalledWith({ x: 60, y: 80 });
            expect(onFocusHandled).toHaveBeenCalledTimes(1);
        });
    });

    it('aplica zoom centrado no cursor ao receber wheel quando há callback de transform', async () => {
        const onTransformChange = vi.fn();
        const containerRef = createContainerRef();

        renderHook(() => useCanvasViewport({
            data: { ...baseData, estados: [] },
            zoom: 1,
            svgRef: createSvgRef(),
            containerRef,
            onTransformChange,
            onFocusState: vi.fn(),
        }));

        act(() => {
            containerRef.current?.dispatchEvent(new WheelEvent('wheel', {
                deltaY: -100,
                clientX: 500,
                clientY: 300,
                bubbles: true,
                cancelable: true,
            }));
        });

        await waitFor(() => {
            expect(onTransformChange).toHaveBeenCalledTimes(1);
        });

        const [nextZoom, nextPan] = onTransformChange.mock.calls[0] as [number, { x: number; y: number }];
        expect(nextZoom).toBeGreaterThan(1);
        expect(nextPan.x).toBeLessThan(0);
        expect(nextPan.y).toBeLessThan(0);
    });
});
