import type { LucideIcon } from 'lucide-react';

// ============================================================================
// Constants (Magic Strings -> Enums/Constants)
// ============================================================================

export const AutomatoTipos = {
    AFD: 'AFD',
    AFN: 'AFN',
    AP: 'AP',
    GR: 'GR',
    ER: 'ER',
    MT: 'MT',
    ALL: 'ALL',
    Moore: 'Moore',
    Mealy: 'Mealy',
} as const;

export type AutomatoTipo = typeof AutomatoTipos[keyof typeof AutomatoTipos];

export const ToolTypes = {
    POINTER: 'pointer',
    STATE: 'state',
    TRANSITION: 'transition',
    DELETE: 'delete',
} as const;

export type Tool = typeof ToolTypes[keyof typeof ToolTypes];

export const TabTypes = {
    HOME: 'home',
    CONTEUDO: 'conteudo',
    EXERCICIOS: 'exercicios',
    SIMULADOR: 'simulador',
    GRAMATICA: 'gramatica',
} as const;

export type Tab = typeof TabTypes[keyof typeof TabTypes];

export const SimulationStatus = {
    RUNNING: 'running',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
} as const;

export type SimulationStatusType = typeof SimulationStatus[keyof typeof SimulationStatus];

export const PdaAcceptanceMode = {
    FINAL: 'final',
    EMPTY: 'empty',
    BOTH: 'both',
} as const;

export type PdaAcceptanceType = typeof PdaAcceptanceMode[keyof typeof PdaAcceptanceMode];

export const TuringDirection = {
    LEFT: 'L',
    RIGHT: 'R',
    STAY: 'S',
} as const;

export type TuringDirectionType = typeof TuringDirection[keyof typeof TuringDirection];

// ============================================================================
// Base Types
// ============================================================================

export interface Estado {
    id: string;
    x: number;
    y: number;
    isFinal: boolean;
    isInicial: boolean;
    label: string;
    output?: string; // Para Máquina de Moore
}

export interface Transicao {
    id: string;
    de: string;
    para: string;
    simbolo: string;
    curvatura: number;
    controlPoint?: { x: number; y: number } | null;

    // MT specific (can also be parsed from simbolo)
    write?: string;
    direction?: TuringDirectionType;
    // Mealy specific (alternative to parsing from simbolo)
    output?: string;
}

// ============================================================================
// Discriminated Union: AutomatoData
// ============================================================================

/** Base properties shared by all automaton types */
interface BaseAutomato {
    estados: Estado[];
    transicoes: Transicao[];
    descricao?: string;
    alfabeto?: string[];
}

/** Deterministic Finite Automaton */
export interface AFDData extends BaseAutomato {
    tipo: 'AFD';
}

/** Non-deterministic Finite Automaton */
export interface AFNData extends BaseAutomato {
    tipo: 'AFN';
}

/** Pushdown Automaton (with stack) */
export interface APData extends BaseAutomato {
    tipo: 'AP';
    alfabetoPilha?: string[];
    simboloInicialPilha?: string;
    pdaAcceptance?: PdaAcceptanceType;
}

/** Regular Grammar */
export interface GRData extends BaseAutomato {
    tipo: 'GR';
}

/** Regular Expression */
export interface ERData extends BaseAutomato {
    tipo: 'ER';
}

/** Turing Machine */
export interface MTData extends BaseAutomato {
    tipo: 'MT';
}

/** Linear Bounded Automaton */
export interface ALLData extends BaseAutomato {
    tipo: 'ALL';
}

/** Moore Machine */
export interface MooreData extends BaseAutomato {
    tipo: 'Moore';
}

/** Mealy Machine */
export interface MealyData extends BaseAutomato {
    tipo: 'Mealy';
}

/** Discriminated Union type for all automaton types */
export type AutomatoData =
    | AFDData
    | AFNData
    | APData
    | GRData
    | ERData
    | MTData
    | ALLData
    | MooreData
    | MealyData;

// ============================================================================
// Type Guards
// ============================================================================

export function isAFD(data: AutomatoData): data is AFDData {
    return data.tipo === AutomatoTipos.AFD;
}

export function isAFN(data: AutomatoData): data is AFNData {
    return data.tipo === AutomatoTipos.AFN;
}

export function isAP(data: AutomatoData): data is APData {
    return data.tipo === AutomatoTipos.AP;
}

export function isMT(data: AutomatoData): data is MTData {
    return data.tipo === AutomatoTipos.MT;
}

export function isALL(data: AutomatoData): data is ALLData {
    return data.tipo === AutomatoTipos.ALL;
}

export function isMoore(data: AutomatoData): data is MooreData {
    return data.tipo === AutomatoTipos.Moore;
}

export function isMealy(data: AutomatoData): data is MealyData {
    return data.tipo === AutomatoTipos.Mealy;
}

export function isTuringLike(data: AutomatoData): data is MTData | ALLData {
    return data.tipo === AutomatoTipos.MT || data.tipo === AutomatoTipos.ALL;
}

export function isTransducer(data: AutomatoData): data is MooreData | MealyData {
    return data.tipo === AutomatoTipos.Moore || data.tipo === AutomatoTipos.Mealy;
}

export function isFiniteAutomaton(data: AutomatoData): data is AFDData | AFNData {
    return data.tipo === AutomatoTipos.AFD || data.tipo === AutomatoTipos.AFN;
}

// ============================================================================
// Simulation Types
// ============================================================================

export interface SimulationStep {
    activeStates: string[];
    remainingInput: string[];
    processedInput: string[];
    status: SimulationStatusType;
    symbol?: string;
    fromStates?: string[];
    usedTransitions?: string[];
    directTargets?: string[];
    // PDA specific
    activeConfigs?: PdaConfiguration[];
    pdaEdges?: PdaEdge[];
    // Transducer specific
    output?: string[];
    outputStatus?: 'ok' | 'ambiguous';
    // TM specific
    tape?: Record<number, string>;
    headPos?: number;
}

export interface PdaConfiguration {
    stateId: string;
    stack: string[];
}

export interface PdaEdge {
    from: string;
    to: string;
    transitionId?: string;
}

// ============================================================================
// Exercise Types
// ============================================================================

export interface TestCase {
    input: string;
    expected: 'accept' | 'reject';
}

export const ExerciseLevel = {
    EASY: 'facil',
    MEDIUM: 'medio',
    HARD: 'dificil',
} as const;

export type ExerciseLevelType = typeof ExerciseLevel[keyof typeof ExerciseLevel];

export const ExerciseMode = {
    AUTOMATON: 'automaton',
    REGEX: 'regex',
    TEXT: 'text',
    GRAMMAR: 'grammar',
} as const;

export type ExerciseModeType = typeof ExerciseMode[keyof typeof ExerciseMode];

export const ExercisePattern = {
    CONSTRUCTION: 'construction',
    SIMULATION: 'simulation',
    CONVERSION: 'conversion',
    PROOF: 'proof',
    DEBUGGING: 'debugging',
    CLASSIFICATION: 'classification',
} as const;

export type ExercisePatternType = typeof ExercisePattern[keyof typeof ExercisePattern];

export interface ExerciseHint {
    id: string;
    level: 1 | 2 | 3;
    text: string;
}

export interface ExerciseCommonMistake {
    id: string;
    title: string;
    symptom: string;
    correction: string;
}

export interface GuidedSolutionStep {
    id: string;
    title: string;
    explanation: string;
    expectedStudentAction?: string;
    checkpointQuestion?: string;
}

export interface ExerciseMetadata {
    learningGoal: string;
    pattern: ExercisePatternType;
    prerequisites?: string[];
    theoryRefs?: string[];
    recommendation?: 'required' | 'recommended' | 'challenge';
}

export interface Exercicio {
    id: number;
    pergunta: string;
    dica?: string;
    dicas?: ExerciseHint[];
    estrategia?: string;
    respostaTexto?: string;
    respostaAutomato?: AutomatoData;
    guidedSolution?: GuidedSolutionStep[];
    commonMistakes?: ExerciseCommonMistake[];
    metadata?: ExerciseMetadata;
    testes?: TestCase[];
    nivel: ExerciseLevelType;
    mode?: ExerciseModeType;
    tipo?: AutomatoTipo;
}

// ============================================================================
// UI Types
// ============================================================================

export interface Topic {
    id: string;
    title: string;
    desc: string;
    icon: LucideIcon;
}

// ============================================================================
// Content Types
// ============================================================================

export interface GrammarTree {
    symbol: string;
    children: GrammarTree[];
}

export const LessonStatus = {
    DRAFT: 'draft',
    REVIEWED: 'reviewed',
    CANONICAL: 'canonical',
} as const;

export type LessonStatusType = typeof LessonStatus[keyof typeof LessonStatus];

export interface LessonReference {
    id: string;
    label: string;
    citation: string;
    locator?: string;
    note?: string;
}

export interface CommonMistake {
    title: string;
    explanation: string;
    correction: string;
}

export interface LessonObjective {
    id: string;
    text: string;
}

export interface LessonSummaryPoint {
    id: string;
    text: string;
}

export const ContentBlockType = {
    TEXT: 'text',
    DEFINITION: 'definition',
    THEOREM: 'theorem',
    EXAMPLE: 'example',
    LIST: 'list',
    NOTE: 'note',
    ALGORITHM: 'algorithm',
    WARNING: 'warning',
    MATH_TIP: 'math-tip',
    INTERACTIVE_GRAMMAR: 'interactive-grammar',
    COMPARISON: 'comparison',
    PROOF_OUTLINE: 'proof-outline',
    COMMON_MISTAKE: 'common-mistake',
    CHECKPOINT: 'checkpoint',
    MINI_EXERCISE: 'mini-exercise',
    EXERCISE_SOLUTION_STEP: 'exercise-solution-step',
    REFERENCE: 'reference',
    SUMMARY: 'summary',
} as const;

export type ContentBlockTypeValue = typeof ContentBlockType[keyof typeof ContentBlockType];

export interface ContentBlock {
    type: ContentBlockTypeValue;
    content: string | string[];
    title?: string;
    exerciseRef?: string;
    automatoRef?: AutomatoData;
    automatoRef2?: AutomatoData;
    disableSimulation?: boolean;
    grammarTreeData?: GrammarTree;
}

export interface Lesson {
    id: string;
    title: string;
    description: string;
    objectives?: LessonObjective[];
    prerequisites?: string[];
    keywords?: string[];
    estimatedMinutes?: number;
    references?: LessonReference[];
    commonMistakes?: CommonMistake[];
    summary?: LessonSummaryPoint[];
    exerciseRefs?: string[];
    status?: LessonStatusType;
    lastReviewedAt?: string;
    reviewedBy?: string;
    content: ContentBlock[];
}

export interface CourseModule {
    id: string;
    title: string;
    lessons: Lesson[];
}

// ============================================================================
// Helper Types for Creating Automata
// ============================================================================

export type CreateAutomatoOptions<T extends AutomatoTipo> =
    T extends 'AFD' ? Omit<AFDData, 'tipo'> :
    T extends 'AFN' ? Omit<AFNData, 'tipo'> :
    T extends 'AP' ? Omit<APData, 'tipo'> :
    T extends 'MT' ? Omit<MTData, 'tipo'> :
    T extends 'ALL' ? Omit<ALLData, 'tipo'> :
    T extends 'Moore' ? Omit<MooreData, 'tipo'> :
    T extends 'Mealy' ? Omit<MealyData, 'tipo'> :
    Omit<BaseAutomato, 'tipo'>;

/** Factory function to create typed automata */
export function createAutomaton<T extends AutomatoTipo>(
    tipo: T,
    options: CreateAutomatoOptions<T>
): AutomatoData {
    return { tipo, ...options } as AutomatoData;
}

// ============================================================================
// Compatibilidade de dados serializados
// ============================================================================

/**
 * @deprecated Use a união discriminada AutomatoData nas áreas novas.
 * Mantido apenas para desserialização de payloads antigos.
 */
export interface LegacyAutomatoData {
    tipo: AutomatoTipo;
    estados: Estado[];
    transicoes: Transicao[];
    alfabeto?: string[];
    alfabetoPilha?: string[];
    simboloInicialPilha?: string;
    pdaAcceptance?: PdaAcceptanceType;
    descricao?: string;
}

/** Normaliza payloads antigos para o formato tipado atual. */
export function fromLegacy(data: LegacyAutomatoData): AutomatoData {
    switch (data.tipo) {
        case 'AP':
            return {
                tipo: 'AP',
                estados: data.estados,
                transicoes: data.transicoes,
                alfabeto: data.alfabeto,
                alfabetoPilha: data.alfabetoPilha,
                simboloInicialPilha: data.simboloInicialPilha,
                pdaAcceptance: data.pdaAcceptance,
                descricao: data.descricao,
            };
        default:
            return {
                tipo: data.tipo,
                estados: data.estados,
                transicoes: data.transicoes,
                alfabeto: data.alfabeto,
                descricao: data.descricao,
            } as AutomatoData;
    }
}
