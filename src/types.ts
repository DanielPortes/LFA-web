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
    tipo: 'AFD' | 'AFN' | 'GR' | 'ER'; // Added GR and ER types
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