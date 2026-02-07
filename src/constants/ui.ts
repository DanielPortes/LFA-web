/**
 * UI constants and configuration values
 *
 * @module constants/ui
 */

// Canvas constants
export const CANVAS = {
    GRID_SIZE: 40,
    STATE_RADIUS: 28,
    MIN_STATE_SPACING: 96,
    DEFAULT_ZOOM: 1,
    MIN_ZOOM: 0.25,
    MAX_ZOOM: 4,
    ZOOM_SENSITIVITY: 0.002
} as const;

// Animation timing
export const ANIMATION = {
    FAST: 150,
    BASE: 250,
    SLOW: 400,
    TOAST_DURATION: 3000
} as const;

// Simulation defaults
export const SIMULATION = {
    DEFAULT_SPEED: 1000,
    MIN_SPEED: 100,
    MAX_SPEED: 2000,
    SPEED_STEP: 100
} as const;

// Grammar limits
export const GRAMMAR = {
    MAX_STEPS: 20,
    MAX_QUEUE: 2000,
    MAX_SYMBOLS: 20
} as const;

// Turing machine limits
export const TURING = {
    MAX_STEPS: 500,
    DETECT_LOOPS: true
} as const;

// Layout constants
export const LAYOUT = {
    SPACING_X: 180,
    SPACING_Y: 120,
    MAX_ORPHANS_PER_COLUMN: 5
} as const;

// Z-index layers
export const Z_INDEX = {
    CANVAS: 1,
    TOOLBAR: 10,
    DOCK: 20,
    MODAL_BACKDROP: 90,
    MODAL: 100,
    TOAST: 110,
    CURSOR: 1000
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    XXL: 1536
} as const;

// Simulator mode constants
export const SIMULATOR_MODE = {
    AUTOMATON: 'automaton',
    GRAMMAR: 'grammar',
} as const;

export type SimulatorModeType = typeof SIMULATOR_MODE[keyof typeof SIMULATOR_MODE];

// Tokenization mode constants
export const TOKENIZATION_MODE = {
    AUTO: 'auto',
    CHAR: 'char',
    SEPARATOR: 'separator',
} as const;

export type TokenizationModeType = typeof TOKENIZATION_MODE[keyof typeof TOKENIZATION_MODE];

// Derivation strategy constants
export const DERIVATION_STRATEGY = {
    LEFTMOST: 'leftmost',
    RIGHTMOST: 'rightmost',
} as const;

export type DerivationStrategyType = typeof DERIVATION_STRATEGY[keyof typeof DERIVATION_STRATEGY];

// Element types for selection/interaction
export const ELEMENT_TYPE = {
    STATE: 'state',
    TRANSITION: 'transition',
    NONE: null,
} as const;

// Validation issue types
export const VALIDATION_TYPE = {
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
} as const;

export type ValidationTypeValue = typeof VALIDATION_TYPE[keyof typeof VALIDATION_TYPE];

// Theme constants
export const THEME = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
} as const;

export type ThemeType = typeof THEME[keyof typeof THEME];
