import type { AutomatoData } from '../types';

export interface AutomatonTemplate {
    id: string;
    name: string;
    description: string;
    category: 'basic' | 'binary' | 'string' | 'advanced';
    data: AutomatoData;
}

export const automatonTemplates: AutomatonTemplate[] = [
    // Basic Templates
    {
        id: 'empty',
        name: 'Vazio',
        description: 'Canvas em branco para criar seu autômato',
        category: 'basic',
        data: {
            tipo: 'AFD',
            estados: [],
            transicoes: [],
            descricao: 'Novo Autômato'
        }
    },
    {
        id: 'single-state',
        name: 'Estado Único',
        description: 'Um único estado inicial e final',
        category: 'basic',
        data: {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: 'q0', x: 300, y: 200, isFinal: true, isInicial: true }
            ],
            transicoes: [],
            descricao: 'Aceita apenas ε'
        }
    },
    {
        id: 'two-states',
        name: 'Dois Estados',
        description: 'Template básico com dois estados',
        category: 'basic',
        data: {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: 'q0', x: 200, y: 200, isFinal: false, isInicial: true },
                { id: 'q1', label: 'q1', x: 400, y: 200, isFinal: true, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 }
            ],
            descricao: 'Aceita "a"'
        }
    },

    // Binary Language Templates
    {
        id: 'even-zeros',
        name: 'Número Par de 0s',
        description: 'Aceita strings binárias com número par de zeros',
        category: 'binary',
        data: {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: 'Par', x: 200, y: 200, isFinal: true, isInicial: true },
                { id: 'q1', label: 'Ímpar', x: 400, y: 200, isFinal: false, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q1', simbolo: '0', curvatura: 30 },
                { id: 't2', de: 'q1', para: 'q0', simbolo: '0', curvatura: 30 },
                { id: 't3', de: 'q0', para: 'q0', simbolo: '1', curvatura: -40 },
                { id: 't4', de: 'q1', para: 'q1', simbolo: '1', curvatura: -40 }
            ],
            descricao: 'L = { w | w tem número par de 0s }'
        }
    },
    {
        id: 'div-by-3',
        name: 'Divisível por 3',
        description: 'Números binários divisíveis por 3',
        category: 'binary',
        data: {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: 'r=0', x: 200, y: 200, isFinal: true, isInicial: true },
                { id: 'q1', label: 'r=1', x: 400, y: 120, isFinal: false, isInicial: false },
                { id: 'q2', label: 'r=2', x: 400, y: 280, isFinal: false, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q0', simbolo: '0', curvatura: -40 },
                { id: 't2', de: 'q0', para: 'q1', simbolo: '1', curvatura: 0 },
                { id: 't3', de: 'q1', para: 'q2', simbolo: '0', curvatura: 30 },
                { id: 't4', de: 'q1', para: 'q0', simbolo: '1', curvatura: 30 },
                { id: 't5', de: 'q2', para: 'q1', simbolo: '0', curvatura: 30 },
                { id: 't6', de: 'q2', para: 'q2', simbolo: '1', curvatura: -40 }
            ],
            descricao: 'L = { w | valor binário de w mod 3 = 0 }'
        }
    },
    {
        id: 'ends-01',
        name: 'Termina em 01',
        description: 'Strings binárias que terminam em 01',
        category: 'binary',
        data: {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: 'q0', x: 150, y: 200, isFinal: false, isInicial: true },
                { id: 'q1', label: 'q1', x: 300, y: 200, isFinal: false, isInicial: false },
                { id: 'q2', label: 'q2', x: 450, y: 200, isFinal: true, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q0', simbolo: '1', curvatura: -40 },
                { id: 't2', de: 'q0', para: 'q1', simbolo: '0', curvatura: 0 },
                { id: 't3', de: 'q1', para: 'q1', simbolo: '0', curvatura: -40 },
                { id: 't4', de: 'q1', para: 'q2', simbolo: '1', curvatura: 0 },
                { id: 't5', de: 'q2', para: 'q0', simbolo: '1', curvatura: 40 },
                { id: 't6', de: 'q2', para: 'q1', simbolo: '0', curvatura: 40 }
            ],
            descricao: 'L = { w | w termina em 01 }'
        }
    },

    // String Language Templates
    {
        id: 'starts-with-a',
        name: 'Começa com "a"',
        description: 'Strings sobre {a,b} que começam com "a"',
        category: 'string',
        data: {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: 'q0', x: 150, y: 200, isFinal: false, isInicial: true },
                { id: 'q1', label: 'q1', x: 350, y: 200, isFinal: true, isInicial: false },
                { id: 'q2', label: 'erro', x: 250, y: 350, isFinal: false, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
                { id: 't2', de: 'q0', para: 'q2', simbolo: 'b', curvatura: 0 },
                { id: 't3', de: 'q1', para: 'q1', simbolo: 'a,b', curvatura: -40 },
                { id: 't4', de: 'q2', para: 'q2', simbolo: 'a,b', curvatura: -40 }
            ],
            descricao: 'L = { w | w começa com a }'
        }
    },
    {
        id: 'contains-ab',
        name: 'Contém "ab"',
        description: 'Strings que contêm a substring "ab"',
        category: 'string',
        data: {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: 'q0', x: 150, y: 200, isFinal: false, isInicial: true },
                { id: 'q1', label: 'q1', x: 300, y: 200, isFinal: false, isInicial: false },
                { id: 'q2', label: 'q2', x: 450, y: 200, isFinal: true, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
                { id: 't2', de: 'q0', para: 'q0', simbolo: 'b', curvatura: -40 },
                { id: 't3', de: 'q1', para: 'q1', simbolo: 'a', curvatura: -40 },
                { id: 't4', de: 'q1', para: 'q2', simbolo: 'b', curvatura: 0 },
                { id: 't5', de: 'q2', para: 'q2', simbolo: 'a,b', curvatura: -40 }
            ],
            descricao: 'L = { w | w contém "ab" }'
        }
    },
    {
        id: 'no-consecutive-a',
        name: 'Sem "aa"',
        description: 'Strings sem dois "a"s consecutivos',
        category: 'string',
        data: {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: 'q0', x: 150, y: 200, isFinal: true, isInicial: true },
                { id: 'q1', label: 'q1', x: 350, y: 200, isFinal: true, isInicial: false },
                { id: 'q2', label: 'erro', x: 500, y: 200, isFinal: false, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
                { id: 't2', de: 'q0', para: 'q0', simbolo: 'b', curvatura: -40 },
                { id: 't3', de: 'q1', para: 'q2', simbolo: 'a', curvatura: 0 },
                { id: 't4', de: 'q1', para: 'q0', simbolo: 'b', curvatura: 30 },
                { id: 't5', de: 'q2', para: 'q2', simbolo: 'a,b', curvatura: -40 }
            ],
            descricao: 'L = { w | w não contém "aa" }'
        }
    },

    // Advanced Templates
    {
        id: 'nfa-ends-ab',
        name: 'AFN: Termina em "ab"',
        description: 'AFN não-determinístico para strings terminadas em "ab"',
        category: 'advanced',
        data: {
            tipo: 'AFN',
            estados: [
                { id: 'q0', label: 'q0', x: 150, y: 200, isFinal: false, isInicial: true },
                { id: 'q1', label: 'q1', x: 300, y: 200, isFinal: false, isInicial: false },
                { id: 'q2', label: 'q2', x: 450, y: 200, isFinal: true, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q0', simbolo: 'a,b', curvatura: -40 },
                { id: 't2', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
                { id: 't3', de: 'q1', para: 'q2', simbolo: 'b', curvatura: 0 }
            ],
            descricao: 'AFN: L = { w | w termina em "ab" }'
        }
    },
    {
        id: 'afn-epsilon',
        name: 'AFN-ε: União',
        description: 'AFN com transições épsilon (a* | b*)',
        category: 'advanced',
        data: {
            tipo: 'AFN',
            estados: [
                { id: 'q0', label: 'q0', x: 150, y: 200, isFinal: false, isInicial: true },
                { id: 'q1', label: 'q1', x: 300, y: 120, isFinal: true, isInicial: false },
                { id: 'q2', label: 'q2', x: 300, y: 280, isFinal: true, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q1', simbolo: 'ε', curvatura: 0 },
                { id: 't2', de: 'q0', para: 'q2', simbolo: 'ε', curvatura: 0 },
                { id: 't3', de: 'q1', para: 'q1', simbolo: 'a', curvatura: -40 },
                { id: 't4', de: 'q2', para: 'q2', simbolo: 'b', curvatura: -40 }
            ],
            descricao: 'AFN-ε: L = a* ∪ b*'
        }
    },
    {
        id: 'palindrome-even',
        name: 'Palíndromos (tamanho 2)',
        description: 'Aceita palíndromos de tamanho exatamente 2',
        category: 'advanced',
        data: {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: 'q0', x: 150, y: 200, isFinal: false, isInicial: true },
                { id: 'qa', label: 'qa', x: 300, y: 120, isFinal: false, isInicial: false },
                { id: 'qb', label: 'qb', x: 300, y: 280, isFinal: false, isInicial: false },
                { id: 'qf', label: 'OK', x: 450, y: 200, isFinal: true, isInicial: false },
                { id: 'qe', label: 'erro', x: 550, y: 350, isFinal: false, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'qa', simbolo: 'a', curvatura: 0 },
                { id: 't2', de: 'q0', para: 'qb', simbolo: 'b', curvatura: 0 },
                { id: 't3', de: 'qa', para: 'qf', simbolo: 'a', curvatura: 0 },
                { id: 't4', de: 'qa', para: 'qe', simbolo: 'b', curvatura: 0 },
                { id: 't5', de: 'qb', para: 'qe', simbolo: 'a', curvatura: 0 },
                { id: 't6', de: 'qb', para: 'qf', simbolo: 'b', curvatura: 0 },
                { id: 't7', de: 'qf', para: 'qe', simbolo: 'a,b', curvatura: 0 },
                { id: 't8', de: 'qe', para: 'qe', simbolo: 'a,b', curvatura: -40 }
            ],
            descricao: 'L = { aa, bb }'
        }
    }
];

export const templateCategories = [
    { id: 'basic', name: 'Básicos', icon: 'Circle' },
    { id: 'binary', name: 'Binários', icon: 'Binary' },
    { id: 'string', name: 'Strings', icon: 'Type' },
    { id: 'advanced', name: 'Avançados', icon: 'Zap' }
];
