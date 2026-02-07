export type SimulatorLayout = 'bottom' | 'side' | 'top_side';

export const SIMULATOR_LAYOUT_VALUES: SimulatorLayout[] = ['bottom', 'side', 'top_side'];

export const isSimulatorLayout = (value: string | null): value is SimulatorLayout =>
    value !== null && SIMULATOR_LAYOUT_VALUES.includes(value as SimulatorLayout);
