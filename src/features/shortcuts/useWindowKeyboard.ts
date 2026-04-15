import { useEffect, useState } from 'react';

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
    useEffect(() => {
        if (!enabled) return undefined;

        const keydownHandler = (event: KeyboardEvent) => onKeyDown?.(event);
        const keyupHandler = (event: KeyboardEvent) => onKeyUp?.(event);
        const blurHandler = () => onBlur?.();

        if (onKeyDown) window.addEventListener('keydown', keydownHandler, { capture });
        if (onKeyUp) window.addEventListener('keyup', keyupHandler, { capture });
        if (onBlur) window.addEventListener('blur', blurHandler);

        return () => {
            if (onKeyDown) window.removeEventListener('keydown', keydownHandler, { capture });
            if (onKeyUp) window.removeEventListener('keyup', keyupHandler, { capture });
            if (onBlur) window.removeEventListener('blur', blurHandler);
        };
    }, [capture, enabled, onBlur, onKeyDown, onKeyUp]);
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
