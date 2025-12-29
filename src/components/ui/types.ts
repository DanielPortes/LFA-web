import type { CSSProperties, ReactNode } from 'react';

export interface BaseProps {
    className?: string;
    style?: CSSProperties;
}

export interface WithChildren {
    children: ReactNode;
}

export interface ModalBaseProps {
    isOpen: boolean;
    onClose: () => void;
}
