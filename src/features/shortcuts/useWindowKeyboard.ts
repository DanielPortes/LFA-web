import { useEffect, useRef, useState } from 'react';

interface UseWindowKeyboardOptions {
    enabled?: boolean;
    capture?: boolean;
    onKeyDown?: (event: KeyboardEvent) => void;
    onKeyUp?: (event: KeyboardEvent) => void;
    onBlur?: () => void;
}

export const useWindowKeyboard = ({
    enabled = true,
    capture = false,
    onKeyDown,
    onKeyUp,
    onBlur,
}: UseWindowKeyboardOptions) => {
    const keyDownRef = useRef(onKeyDown);
    const keyUpRef = useRef(onKeyUp);
    const blurRef = useRef(onBlur);

    useEffect(() => {
        keyDownRef.current = onKeyDown;
    }, [onKeyDown]);

    useEffect(() => {
        keyUpRef.current = onKeyUp;
    }, [onKeyUp]);

    useEffect(() => {
        blurRef.current = onBlur;
    }, [onBlur]);

    useEffect(() => {
        if (!enabled) return undefined;

        const keydownHandler = (event: KeyboardEvent) => keyDownRef.current?.(event);
        const keyupHandler = (event: KeyboardEvent) => keyUpRef.current?.(event);
        const blurHandler = () => blurRef.current?.();

        window.addEventListener('keydown', keydownHandler, capture);
        window.addEventListener('keyup', keyupHandler, capture);
        window.addEventListener('blur', blurHandler);

        return () => {
            window.removeEventListener('keydown', keydownHandler, capture);
            window.removeEventListener('keyup', keyupHandler, capture);
            window.removeEventListener('blur', blurHandler);
        };
    }, [capture, enabled]);
};

interface UseModifierKeyOptions {
    enabled?: boolean;
    capture?: boolean;
}

export const useModifierKey = (
    key: string,
    { enabled = true, capture = false }: UseModifierKeyOptions = {}
) => {
    const [pressed, setPressed] = useState(false);

    useWindowKeyboard({
        enabled,
        capture,
        onKeyDown: (event) => {
            if (event.key === key || event.code === key) {
                setPressed(true);
            }
        },
        onKeyUp: (event) => {
            if (event.key === key || event.code === key) {
                setPressed(false);
            }
        },
        onBlur: () => setPressed(false),
    });

    return pressed;
};
