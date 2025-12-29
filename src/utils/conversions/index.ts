/**
 * Automaton conversions and operations
 * Modular implementation following SOLID principles
 *
 * @module conversions
 */

// Types
export type {
    ValidationIssue,
    DfaEquivalenceResult,
    ConversionStep,
    ConversionWithSteps,
    LanguageCheckResult,
    GrammarConversionResult,
    PdaToCfgResult
} from './types';

// Helpers
export {
    generateId,
    applyLayeredLayout,
    mergeTransitions,
    formatStateSet,
    wrapRegex,
    unionRegex,
    concatRegex,
    starRegex
} from './helpers';

// Alphabet
export { getAlphabet } from './alphabet';

// NFA to DFA conversion
export { nfaToDfa, nfaToDfaWithSteps } from './nfaToDfa';

// DFA minimization
export { minimizeDfa, minimizeDfaWithSteps } from './minimize';

// Epsilon elimination
export { eliminateEpsilonTransitions } from './epsilon';

// Regex to NFA
export { regexToNfa } from './regexToNfa';

// Representations
export {
    automatonToTuple,
    automatonToTransitionTable,
    automatonToGrammar,
    automatonToRegex,
    automatonToDot
} from './representations';

// Validation
export { validateAutomaton } from './validation';

// Equivalence and language checks
export {
    areDfaEquivalent,
    checkEmptiness,
    checkInclusion,
    checkEquivalence
} from './equivalence';

// Set operations
export {
    unionAutomata,
    concatenateAutomata,
    kleeneStarAutomaton,
    complementAutomaton,
    intersectionAutomata
} from './operations';

// Grammar conversions
export {
    regularGrammarToNfa,
    regularGrammarToDfa,
    cfgToPda,
    pdaToCfg
} from './grammarConversions';

// Transducers (Moore/Mealy)
export {
    mooreToMealy,
    mealyToMoore,
    verifyTransducerDeterminism
} from './transducers';
