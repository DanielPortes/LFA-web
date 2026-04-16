import { vi } from 'vitest';

type ViewportOptions = {
    width: number;
    height: number;
    reduceMotion?: boolean;
};

const createMediaQueryList = (query: string, matches: boolean): MediaQueryList => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
});

const evaluateMediaQuery = (query: string, options: ViewportOptions) => {
    const minWidthMatch = query.match(/\(min-width:\s*(\d+)px\)/);
    const maxWidthMatch = query.match(/\(max-width:\s*(\d+)px\)/);
    const reduceMotionMatch = query.includes('prefers-reduced-motion');

    const minWidthPass = !minWidthMatch || options.width >= Number(minWidthMatch[1]);
    const maxWidthPass = !maxWidthMatch || options.width <= Number(maxWidthMatch[1]);
    const reduceMotionPass = !reduceMotionMatch || Boolean(options.reduceMotion);

    return minWidthPass && maxWidthPass && reduceMotionPass;
};

export const mockViewport = ({ width, height, reduceMotion = false }: ViewportOptions) => {
    Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        writable: true,
        value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
        configurable: true,
        writable: true,
        value: height,
    });
    Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: vi.fn().mockImplementation((query: string) => createMediaQueryList(
            query,
            evaluateMediaQuery(query, { width, height, reduceMotion })
        )),
    });
};

export const mockResizeObserver = () => {
    Object.defineProperty(window, 'ResizeObserver', {
        configurable: true,
        writable: true,
        value: class {
            observe() {}
            disconnect() {}
            unobserve() {}
        },
    });
};

export const mockAnimationFrames = () =>
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
        callback(0);
        return 1;
    });
