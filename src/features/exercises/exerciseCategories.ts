import type { CategoryConfig } from './types';

export const exerciseCategories: CategoryConfig[] = [
    { id: 'fundamentos', label: 'Fundamentos', mode: 'text' },
    { id: 'afd', label: 'AFDs', tipo: 'AFD', mode: 'automaton' },
    { id: 'lex', label: 'Léxico', tipo: 'AFD', mode: 'automaton' },
    { id: 'afn', label: 'AFNs', tipo: 'AFN', mode: 'automaton' },
    { id: 'afne', label: 'AFN-eps', tipo: 'AFN', mode: 'automaton' },
    { id: 'er', label: 'Regex', mode: 'regex' },
    { id: 'gr', label: 'Gramática Regular', mode: 'grammar' },
    { id: 'cfg', label: 'GLC', mode: 'grammar' },
    { id: 'pda', label: 'Autômato de Pilha', tipo: 'AP', mode: 'automaton' },
    { id: 'chomsky', label: 'Chomsky', mode: 'text' },
    { id: 'turing', label: 'Turing', tipo: 'MT', mode: 'automaton' },
    { id: 'minimizacao', label: 'Minimização', mode: 'text' },
    { id: 'moore_mealy', label: 'Moore/Mealy', mode: 'text' },
    { id: 'pumping', label: 'Bombeamento', mode: 'text' }
];
