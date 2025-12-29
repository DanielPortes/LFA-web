import type { LucideIcon } from 'lucide-react';

export type Tab = 'home' | 'conteudo' | 'exercicios' | 'simulador';

export type Tool = 'pointer' | 'state' | 'transition' | 'delete';

export type AutomatoTipo = 'AFD' | 'AFN' | 'AP' | 'GR' | 'ER' | 'MT' | 'ALL' | 'Moore' | 'Mealy';

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
    simbolo: string; // Entrada para todos. Em Mealy: "entrada / saida". Em MT: "leitura"
    curvatura: number;
    controlPoint?: { x: number; y: number } | null;
    
    // Propriedades Específicas
    write?: string;     // Para MT: Símbolo a escrever
    direction?: 'L' | 'R' | 'S'; // Para MT: Esquerda, Direita, Stay (Ficar)
    output?: string;    // Para Mealy (alternativo ao parse da string)
}

export interface AutomatoData {
    tipo: AutomatoTipo;
    estados: Estado[];
    transicoes: Transicao[];
    alfabeto?: string[];
    alfabetoPilha?: string[];
    simboloInicialPilha?: string;
    pdaAcceptance?: 'final' | 'empty' | 'both';
    descricao?: string;
}

export interface TestCase {
    input: string;
    expected: 'accept' | 'reject';
}

export interface Exercicio {
    id: number;
    pergunta: string;
    dica?: string;
    respostaTexto?: string;
    respostaAutomato?: AutomatoData;
    testes?: TestCase[];
    nivel: 'facil' | 'medio' | 'dificil';
    mode?: 'automaton' | 'regex' | 'text' | 'grammar';
    tipo?: AutomatoTipo;
}

export interface Topic {
    id: string;
    title: string;
    desc: string;
    icon: LucideIcon;
}

export interface SimulationStep {
    activeStates: string[];
    remainingInput: string[];
    processedInput: string[];
    status: 'running' | 'accepted' | 'rejected';
    symbol?: string;
    fromStates?: string[];
    usedTransitions?: string[];
    directTargets?: string[];
    activeConfigs?: { stateId: string; stack: string[] }[];
    pdaEdges?: { from: string; to: string; transitionId?: string }[];
    output?: string[];
    outputStatus?: 'ok' | 'ambiguous';
    
    // TM Specific
    tape?: Record<number, string>;
    headPos?: number;
}

// --- Tipos para o Material Didático Rico ---

export interface GrammarTree {
    symbol: string;
    children: GrammarTree[];
}

export interface ContentBlock {
    // Tipos estendidos para suportar didática avançada
    type: 'text' | 'definition' | 'theorem' | 'example' | 'list' | 'note' | 'algorithm' | 'warning' | 'math-tip' | 'interactive-grammar';
    content: string | string[];
    title?: string;
    // Suporte para "Antes e Depois" (ex: Minimização)
    automatoRef?: AutomatoData;
    automatoRef2?: AutomatoData;
    grammarTreeData?: GrammarTree;
}

export interface Lesson {
    id: string;
    title: string;
    description: string;
    content: ContentBlock[];
}

export interface CourseModule {
    id: string;
    title: string;
    lessons: Lesson[];
}
