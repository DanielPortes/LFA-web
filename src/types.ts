import type { LucideIcon } from 'lucide-react';

export type Tab = 'home' | 'conteudo' | 'exercicios' | 'simulador';

export type Tool = 'pointer' | 'state' | 'transition' | 'delete';

export interface Estado {
    id: string;
    x: number;
    y: number;
    isFinal: boolean;
    isInicial: boolean;
    label: string;
}

export interface Transicao {
    id: string;
    de: string;
    para: string;
    simbolo: string;
    curvatura: number;
}

export interface AutomatoData {
    tipo: 'AFD' | 'AFN' | 'GR' | 'ER';
    estados: Estado[];
    transicoes: Transicao[];
    descricao?: string;
}

export interface Exercicio {
    id: number;
    pergunta: string;
    dica?: string;
    respostaTexto?: string;
    respostaAutomato?: AutomatoData;
    nivel: 'facil' | 'medio' | 'dificil';
}

export interface Topic {
    id: string;
    title: string;
    desc: string;
    icon: LucideIcon;
}

export interface SimulationStep {
    activeStates: string[];
    remainingInput: string;
    processedInput: string;
    status: 'running' | 'accepted' | 'rejected';
}

// --- Tipos para o Material Didático Rico ---

export interface ContentBlock {
    // Tipos estendidos para suportar didática avançada
    type: 'text' | 'definition' | 'theorem' | 'example' | 'list' | 'note' | 'algorithm' | 'warning' | 'math-tip';
    content: string | string[];
    title?: string;
    // Suporte para "Antes e Depois" (ex: Minimização)
    automatoRef?: AutomatoData;
    automatoRef2?: AutomatoData;
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