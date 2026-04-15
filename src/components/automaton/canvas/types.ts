export interface CanvasSelection {
    type: 'state' | 'transition';
    id: string;
}

export interface CanvasContextMenuState {
    x: number;
    y: number;
    type: 'canvas' | 'state' | 'transition';
    targetId?: string;
}
