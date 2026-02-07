import { useEffect, useRef } from 'react';

const getFocusableElements = (container: HTMLElement | null) => {
    if (!container) return [];
    const selectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
    ];
    return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(',')));
};

export const useDialog = (isOpen: boolean, onClose: () => void) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;

        const previouslyFocused = document.activeElement as HTMLElement | null;
        const focusables = getFocusableElements(dialogRef.current);
        const first = focusables[0] || dialogRef.current;
        first?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCloseRef.current();
                return;
            }

            if (e.key !== 'Tab') return;

            const updatedFocusables = getFocusableElements(dialogRef.current);
            if (updatedFocusables.length === 0) {
                e.preventDefault();
                return;
            }

            const currentIndex = updatedFocusables.indexOf(document.activeElement as HTMLElement);
            const lastIndex = updatedFocusables.length - 1;

            if (e.shiftKey) {
                if (currentIndex <= 0) {
                    updatedFocusables[lastIndex].focus();
                    e.preventDefault();
                }
            } else if (currentIndex === lastIndex) {
                updatedFocusables[0].focus();
                e.preventDefault();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            previouslyFocused?.focus();
        };
    }, [isOpen]);

    return dialogRef;
};
