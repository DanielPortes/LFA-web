import type { AutomatoData } from '../types';

export interface AutomatonTemplate {
    id: string;
    name: string;
    description: string;
    category: 'basic' | 'binary' | 'string' | 'advanced' | 'turing' | 'transducer';
    data: AutomatoData;
}

export const automatonTemplates: AutomatonTemplate[] = [
    // Basic Templates
    {
        id: 'empty',
        name: 'Vazio',
        description: 'Canvas em branco para criar seu automato',
        category: 'basic',
        data: {
            tipo: 'AFD',
            estados: [],
            transicoes: [],
            descricao: 'Novo Automato'
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
            descricao: 'Aceita apenas eps'
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


    {
        id: 'basic-loop',
        name: 'Loop Unico',
        description: 'Um estado com loop em a,b (aceita tudo)',
        category: 'basic',
        data: {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: 'q0', x: 300, y: 200, isFinal: true, isInicial: true }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q0', simbolo: 'a,b', curvatura: -40 }
            ],
            descricao: 'L = {a,b}*'
        }
    },
    {
        id: 'basic-sink',
        name: 'Estado de Erro d',
        description: 'Template com estado de erro (d)',
        category: 'basic',
        data: {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: 'q0', x: 220, y: 200, isFinal: true, isInicial: true },
                { id: 'qd', label: 'erro', x: 420, y: 200, isFinal: false, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q0', simbolo: 'a', curvatura: -30 },
                { id: 't2', de: 'q0', para: 'qd', simbolo: 'b', curvatura: 0 },
                { id: 't3', de: 'qd', para: 'qd', simbolo: 'a,b', curvatura: -40 }
            ],
            descricao: 'Aceita a*'
        }
    },
    {
        id: 'basic-chain-3',
        name: 'Cadeia 3 Estados',
        description: 'Template linear com tres estados',
        category: 'basic',
        data: {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: 'q0', x: 150, y: 200, isFinal: false, isInicial: true },
                { id: 'q1', label: 'q1', x: 320, y: 200, isFinal: false, isInicial: false },
                { id: 'q2', label: 'q2', x: 490, y: 200, isFinal: true, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
                { id: 't2', de: 'q1', para: 'q2', simbolo: 'b', curvatura: 0 }
            ],
            descricao: 'Aceita "ab"'
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


    {
        id: 'even-ones',
        name: 'Par de 1s',
        description: 'Numero par de 1s em strings binarias',
        category: 'binary',
        data: {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: 'Par', x: 200, y: 200, isFinal: true, isInicial: true },
                { id: 'q1', label: 'Ímpar', x: 400, y: 200, isFinal: false, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q1', simbolo: '1', curvatura: 30 },
                { id: 't2', de: 'q1', para: 'q0', simbolo: '1', curvatura: 30 },
                { id: 't3', de: 'q0', para: 'q0', simbolo: '0', curvatura: -40 },
                { id: 't4', de: 'q1', para: 'q1', simbolo: '0', curvatura: -40 }
            ],
            descricao: 'L = { w | w tem número par de 1s }'
        }
    },
    {
        id: 'ends-00',
        name: 'Termina em 00',
        description: 'Strings binarias que terminam em 00',
        category: 'binary',
        data: {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: 'q0', x: 150, y: 200, isFinal: false, isInicial: true },
                { id: 'q1', label: 'q1', x: 320, y: 200, isFinal: false, isInicial: false },
                { id: 'q2', label: 'q2', x: 490, y: 200, isFinal: true, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q1', simbolo: '0', curvatura: 0 },
                { id: 't2', de: 'q0', para: 'q0', simbolo: '1', curvatura: -40 },
                { id: 't3', de: 'q1', para: 'q2', simbolo: '0', curvatura: 0 },
                { id: 't4', de: 'q1', para: 'q0', simbolo: '1', curvatura: 40 },
                { id: 't5', de: 'q2', para: 'q2', simbolo: '0', curvatura: -40 },
                { id: 't6', de: 'q2', para: 'q0', simbolo: '1', curvatura: 40 }
            ],
            descricao: 'L = { w | w termina em 00 }'
        }
    },
    {
        id: 'length-even',
        name: 'Comprimento Par',
        description: 'Strings binarias com tamanho par',
        category: 'binary',
        data: {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: 'Par', x: 200, y: 200, isFinal: true, isInicial: true },
                { id: 'q1', label: 'Ímpar', x: 400, y: 200, isFinal: false, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q1', simbolo: '0,1', curvatura: 30 },
                { id: 't2', de: 'q1', para: 'q0', simbolo: '0,1', curvatura: 30 }
            ],
            descricao: 'L = { w | |w| é par }'
        }
    },
    {
        id: 'contains-11',
        name: 'Contem 11',
        description: 'Strings binarias que contém a substring 11',
        category: 'binary',
        data: {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: 'q0', x: 150, y: 200, isFinal: false, isInicial: true },
                { id: 'q1', label: 'q1', x: 320, y: 200, isFinal: false, isInicial: false },
                { id: 'q2', label: 'OK', x: 490, y: 200, isFinal: true, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q0', simbolo: '0', curvatura: -40 },
                { id: 't2', de: 'q0', para: 'q1', simbolo: '1', curvatura: 0 },
                { id: 't3', de: 'q1', para: 'q2', simbolo: '1', curvatura: 0 },
                { id: 't4', de: 'q1', para: 'q0', simbolo: '0', curvatura: 40 },
                { id: 't5', de: 'q2', para: 'q2', simbolo: '0,1', curvatura: -40 }
            ],
            descricao: 'L = { w | w contém 11 }'
        }
    },
    {
        id: 'div-by-4',
        name: 'Divisivel por 4',
        description: 'Numero binário divisivel por 4',
        category: 'binary',
        data: {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: 'r=0', x: 180, y: 200, isFinal: true, isInicial: true },
                { id: 'q1', label: 'r=1', x: 360, y: 120, isFinal: false, isInicial: false },
                { id: 'q2', label: 'r=2', x: 360, y: 280, isFinal: false, isInicial: false },
                { id: 'q3', label: 'r=3', x: 540, y: 200, isFinal: false, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q0', simbolo: '0', curvatura: -40 },
                { id: 't2', de: 'q0', para: 'q1', simbolo: '1', curvatura: 0 },
                { id: 't3', de: 'q1', para: 'q2', simbolo: '0', curvatura: 0 },
                { id: 't4', de: 'q1', para: 'q3', simbolo: '1', curvatura: 30 },
                { id: 't5', de: 'q2', para: 'q0', simbolo: '0', curvatura: 40 },
                { id: 't6', de: 'q2', para: 'q1', simbolo: '1', curvatura: 0 },
                { id: 't7', de: 'q3', para: 'q2', simbolo: '0', curvatura: 40 },
                { id: 't8', de: 'q3', para: 'q3', simbolo: '1', curvatura: -40 }
            ],
            descricao: 'L = { w | valor binário mod 4 = 0 }'
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


    {
        id: 'ends-with-a',
        name: 'Termina com a',
        description: 'Strings sobre {a,b} que terminam em a',
        category: 'string',
        data: {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: 'q0', x: 170, y: 200, isFinal: false, isInicial: true },
                { id: 'q1', label: 'q1', x: 350, y: 200, isFinal: true, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
                { id: 't2', de: 'q0', para: 'q0', simbolo: 'b', curvatura: -40 },
                { id: 't3', de: 'q1', para: 'q1', simbolo: 'a', curvatura: -40 },
                { id: 't4', de: 'q1', para: 'q0', simbolo: 'b', curvatura: 40 }
            ],
            descricao: 'L = { w | w termina em a }'
        }
    },
    {
        id: 'starts-with-ab',
        name: 'Comeca com ab',
        description: 'Strings sobre {a,b} que comecam com ab',
        category: 'string',
        data: {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: 'q0', x: 130, y: 200, isFinal: false, isInicial: true },
                { id: 'q1', label: 'q1', x: 300, y: 200, isFinal: false, isInicial: false },
                { id: 'q2', label: 'OK', x: 470, y: 200, isFinal: true, isInicial: false },
                { id: 'qd', label: 'erro', x: 300, y: 330, isFinal: false, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
                { id: 't2', de: 'q0', para: 'qd', simbolo: 'b', curvatura: 0 },
                { id: 't3', de: 'q1', para: 'q2', simbolo: 'b', curvatura: 0 },
                { id: 't4', de: 'q1', para: 'qd', simbolo: 'a', curvatura: 0 },
                { id: 't5', de: 'q2', para: 'q2', simbolo: 'a,b', curvatura: -40 },
                { id: 't6', de: 'qd', para: 'qd', simbolo: 'a,b', curvatura: -40 }
            ],
            descricao: 'L = { w | w comeca com ab }'
        }
    },
    {
        id: 'contains-abb',
        name: 'Contem abb',
        description: 'Strings que contém a substring abb',
        category: 'string',
        data: {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: 'q0', x: 120, y: 200, isFinal: false, isInicial: true },
                { id: 'q1', label: 'q1', x: 300, y: 200, isFinal: false, isInicial: false },
                { id: 'q2', label: 'q2', x: 480, y: 200, isFinal: false, isInicial: false },
                { id: 'q3', label: 'OK', x: 660, y: 200, isFinal: true, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
                { id: 't2', de: 'q0', para: 'q0', simbolo: 'b', curvatura: -40 },
                { id: 't3', de: 'q1', para: 'q1', simbolo: 'a', curvatura: -40 },
                { id: 't4', de: 'q1', para: 'q2', simbolo: 'b', curvatura: 0 },
                { id: 't5', de: 'q2', para: 'q1', simbolo: 'a', curvatura: 30 },
                { id: 't6', de: 'q2', para: 'q3', simbolo: 'b', curvatura: 0 },
                { id: 't7', de: 'q3', para: 'q3', simbolo: 'a,b', curvatura: -40 }
            ],
            descricao: 'L = { w | w contém abb }'
        }
    },
    {
        id: 'exactly-one-a',
        name: 'Exatamente um a',
        description: 'Strings com exatamente um simbolo a',
        category: 'string',
        data: {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: '0a', x: 170, y: 200, isFinal: false, isInicial: true },
                { id: 'q1', label: '1a', x: 350, y: 200, isFinal: true, isInicial: false },
                { id: 'q2', label: '>=2a', x: 520, y: 200, isFinal: false, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
                { id: 't2', de: 'q0', para: 'q0', simbolo: 'b', curvatura: -40 },
                { id: 't3', de: 'q1', para: 'q2', simbolo: 'a', curvatura: 0 },
                { id: 't4', de: 'q1', para: 'q1', simbolo: 'b', curvatura: -40 },
                { id: 't5', de: 'q2', para: 'q2', simbolo: 'a,b', curvatura: -40 }
            ],
            descricao: 'L = { w | w tem exatamente um a }'
        }
    },
    {
        id: 'no-bb',
        name: 'Sem bb',
        description: 'Strings sem dois b consecutivos',
        category: 'string',
        data: {
            tipo: 'AFD',
            estados: [
                { id: 'q0', label: 'q0', x: 150, y: 200, isFinal: true, isInicial: true },
                { id: 'q1', label: 'q1', x: 340, y: 200, isFinal: true, isInicial: false },
                { id: 'q2', label: 'erro', x: 520, y: 200, isFinal: false, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q1', simbolo: 'b', curvatura: 0 },
                { id: 't2', de: 'q0', para: 'q0', simbolo: 'a', curvatura: -40 },
                { id: 't3', de: 'q1', para: 'q2', simbolo: 'b', curvatura: 0 },
                { id: 't4', de: 'q1', para: 'q0', simbolo: 'a', curvatura: 30 },
                { id: 't5', de: 'q2', para: 'q2', simbolo: 'a,b', curvatura: -40 }
            ],
            descricao: 'L = { w | w não contém bb }'
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
        name: 'AFN-eps: União',
        description: 'AFN com transicoes épsilon (a* | b*)',
        category: 'advanced',
        data: {
            tipo: 'AFN',
            estados: [
                { id: 'q0', label: 'q0', x: 150, y: 200, isFinal: false, isInicial: true },
                { id: 'q1', label: 'q1', x: 300, y: 120, isFinal: true, isInicial: false },
                { id: 'q2', label: 'q2', x: 300, y: 280, isFinal: true, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q1', simbolo: 'eps', curvatura: 0 },
                { id: 't2', de: 'q0', para: 'q2', simbolo: 'eps', curvatura: 0 },
                { id: 't3', de: 'q1', para: 'q1', simbolo: 'a', curvatura: -40 },
                { id: 't4', de: 'q2', para: 'q2', simbolo: 'b', curvatura: -40 }
            ],
            descricao: 'AFN-eps: L = a* U b*'
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
    },
    {
        id: 'nfa-contains-ab',
        name: 'AFN: Contem ab',
        description: 'AFN para substring ab',
        category: 'advanced',
        data: {
            tipo: 'AFN',
            estados: [
                { id: 'q0', label: 'q0', x: 150, y: 200, isFinal: false, isInicial: true },
                { id: 'q1', label: 'q1', x: 320, y: 200, isFinal: false, isInicial: false },
                { id: 'q2', label: 'OK', x: 500, y: 200, isFinal: true, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q0', simbolo: 'a,b', curvatura: -40 },
                { id: 't2', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
                { id: 't3', de: 'q1', para: 'q2', simbolo: 'b', curvatura: 0 },
                { id: 't4', de: 'q2', para: 'q2', simbolo: 'a,b', curvatura: -40 }
            ],
            descricao: 'AFN: L = { w | w contém ab }'
        }
    },
    {
        id: 'nfa-ends-ba',
        name: 'AFN: Termina em ba',
        description: 'AFN para strings terminadas em ba',
        category: 'advanced',
        data: {
            tipo: 'AFN',
            estados: [
                { id: 'q0', label: 'q0', x: 150, y: 200, isFinal: false, isInicial: true },
                { id: 'q1', label: 'q1', x: 320, y: 200, isFinal: false, isInicial: false },
                { id: 'q2', label: 'q2', x: 500, y: 200, isFinal: true, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q0', simbolo: 'a,b', curvatura: -40 },
                { id: 't2', de: 'q0', para: 'q1', simbolo: 'b', curvatura: 0 },
                { id: 't3', de: 'q1', para: 'q2', simbolo: 'a', curvatura: 0 }
            ],
            descricao: 'AFN: L = { w | w termina em ba }'
        }
    },
    {
        id: 'afn-eps-ab-star',
        name: 'AFN-eps: (ab)*',
        description: 'AFN com eps para repeticao de ab',
        category: 'advanced',
        data: {
            tipo: 'AFN',
            estados: [
                { id: 'i', label: 'i', x: 120, y: 200, isFinal: false, isInicial: true },
                { id: 'q1', label: 'q1', x: 260, y: 200, isFinal: false, isInicial: false },
                { id: 'q2', label: 'q2', x: 400, y: 200, isFinal: false, isInicial: false },
                { id: 'f', label: 'f', x: 540, y: 200, isFinal: true, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'i', para: 'f', simbolo: 'eps', curvatura: 40 },
                { id: 't2', de: 'i', para: 'q1', simbolo: 'eps', curvatura: 0 },
                { id: 't3', de: 'q1', para: 'q2', simbolo: 'a', curvatura: 0 },
                { id: 't4', de: 'q2', para: 'f', simbolo: 'b', curvatura: 0 },
                { id: 't5', de: 'f', para: 'q1', simbolo: 'eps', curvatura: -40 }
            ],
            descricao: 'AFN-eps: L = (ab)*'
        }
    },
    {
        id: 'afn-eps-optional-a',
        name: 'AFN-eps: aepsb*',
        description: 'AFN com eps para a opcional',
        category: 'advanced',
        data: {
            tipo: 'AFN',
            estados: [
                { id: 'i', label: 'i', x: 150, y: 200, isFinal: false, isInicial: true },
                { id: 'a', label: 'a', x: 300, y: 140, isFinal: false, isInicial: false },
                { id: 'b', label: 'b', x: 300, y: 260, isFinal: true, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'i', para: 'b', simbolo: 'eps', curvatura: 0 },
                { id: 't2', de: 'i', para: 'a', simbolo: 'a', curvatura: 0 },
                { id: 't3', de: 'a', para: 'b', simbolo: 'eps', curvatura: 0 },
                { id: 't4', de: 'b', para: 'b', simbolo: 'b', curvatura: -40 }
            ],
            descricao: 'AFN-eps: L = aeps b*'
        }
    },
    {
        id: 'pda-anbn',
        name: 'AP: a^n b^n',
        description: 'Automato de pilha para a^n b^n',
        category: 'advanced',
        data: {
            tipo: 'AP',
            descricao: 'Pilha para contar a e comparar b',
            alfabeto: ['a', 'b'],
            alfabetoPilha: ['Z', 'A'],
            simboloInicialPilha: 'Z',
            pdaAcceptance: 'empty',
            estados: [
                { id: 'q0', label: 'q0', x: 120, y: 200, isFinal: false, isInicial: true },
                { id: 'q1', label: 'q1', x: 320, y: 200, isFinal: false, isInicial: false },
                { id: 'q2', label: 'qf', x: 520, y: 200, isFinal: true, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q0', simbolo: 'a, Z -> AZ', curvatura: -30 },
                { id: 't2', de: 'q0', para: 'q0', simbolo: 'a, A -> AA', curvatura: -10 },
                { id: 't3', de: 'q0', para: 'q1', simbolo: 'b, A -> eps', curvatura: 20 },
                { id: 't4', de: 'q1', para: 'q1', simbolo: 'b, A -> eps', curvatura: -30 },
                { id: 't5', de: 'q0', para: 'q2', simbolo: 'eps, Z -> eps', curvatura: 40 },
                { id: 't6', de: 'q1', para: 'q2', simbolo: 'eps, Z -> eps', curvatura: 40 }
            ]
        }
    },

    {
        id: 'mt-anbncn',
        name: 'MT: a^n b^n c^n',
        description: 'Máquina de Turing para a^n b^n c^n',
        category: 'turing',
        data: {
            tipo: 'MT',
            alfabeto: ['a', 'b', 'c'],
            estados: [
                { id: 'q0', label: 'q0', x: 100, y: 200, isFinal: false, isInicial: true },
                { id: 'q1', label: 'q1', x: 250, y: 200, isFinal: false, isInicial: false },
                { id: 'q2', label: 'q2', x: 400, y: 200, isFinal: false, isInicial: false },
                { id: 'q3', label: 'q3', x: 550, y: 200, isFinal: false, isInicial: false },
                { id: 'q4', label: 'q4', x: 400, y: 350, isFinal: false, isInicial: false },
                { id: 'qf', label: 'qf', x: 700, y: 200, isFinal: true, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q1', simbolo: 'a -> A, R', curvatura: 0, write: 'A', direction: 'R' },
                { id: 't2', de: 'q1', para: 'q1', simbolo: 'a -> a, R', curvatura: -30, write: 'a', direction: 'R' },
                { id: 't3', de: 'q1', para: 'q1', simbolo: 'B -> B, R', curvatura: 30, write: 'B', direction: 'R' },
                { id: 't4', de: 'q1', para: 'q2', simbolo: 'b -> B, R', curvatura: 0, write: 'B', direction: 'R' },
                { id: 't5', de: 'q2', para: 'q2', simbolo: 'b -> b, R', curvatura: -30, write: 'b', direction: 'R' },
                { id: 't6', de: 'q2', para: 'q2', simbolo: 'C -> C, R', curvatura: 30, write: 'C', direction: 'R' },
                { id: 't7', de: 'q2', para: 'q3', simbolo: 'c -> C, L', curvatura: 0, write: 'C', direction: 'L' },
                { id: 't8', de: 'q3', para: 'q3', simbolo: 'a -> a, L', curvatura: 0, write: 'a', direction: 'L' },
                { id: 't9', de: 'q3', para: 'q3', simbolo: 'b -> b, L', curvatura: 0, write: 'b', direction: 'L' },
                { id: 't10', de: 'q3', para: 'q3', simbolo: 'B -> B, L', curvatura: 0, write: 'B', direction: 'L' },
                { id: 't11', de: 'q3', para: 'q3', simbolo: 'C -> C, L', curvatura: 0, write: 'C', direction: 'L' },
                { id: 't12', de: 'q3', para: 'q0', simbolo: 'A -> A, R', curvatura: 40, write: 'A', direction: 'R' },
                { id: 't13', de: 'q0', para: 'q4', simbolo: 'B -> B, R', curvatura: 0, write: 'B', direction: 'R' },
                { id: 't14', de: 'q4', para: 'q4', simbolo: 'B -> B, R', curvatura: -30, write: 'B', direction: 'R' },
                { id: 't15', de: 'q4', para: 'q4', simbolo: 'C -> C, R', curvatura: 30, write: 'C', direction: 'R' },
                { id: 't16', de: 'q4', para: 'qf', simbolo: 'BLANK -> BLANK, S', curvatura: 0, write: 'BLANK', direction: 'S' }
            ],
            descricao: 'Reconhece a linguagem a^n b^n c^n usando marcadores.'
        }
    },
    {
        id: 'mt-binary-inc',
        name: 'MT: Incremento Binário',
        description: 'Adiciona 1 a um número binário',
        category: 'turing',
        data: {
            tipo: 'MT',
            alfabeto: ['0', '1'],
            estados: [
                { id: 'q0', label: 'go_end', x: 150, y: 200, isFinal: false, isInicial: true },
                { id: 'q1', label: 'add', x: 350, y: 200, isFinal: false, isInicial: false },
                { id: 'qf', label: 'done', x: 550, y: 200, isFinal: true, isInicial: false }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q0', simbolo: '0 -> 0, R', curvatura: -30, write: '0', direction: 'R' },
                { id: 't2', de: 'q0', para: 'q0', simbolo: '1 -> 1, R', curvatura: 30, write: '1', direction: 'R' },
                { id: 't3', de: 'q0', para: 'q1', simbolo: 'BLANK -> BLANK, L', curvatura: 0, write: 'BLANK', direction: 'L' },
                { id: 't4', de: 'q1', para: 'q1', simbolo: '1 -> 0, L', curvatura: -30, write: '0', direction: 'L' },
                { id: 't5', de: 'q1', para: 'qf', simbolo: '0 -> 1, S', curvatura: 0, write: '1', direction: 'S' },
                { id: 't6', de: 'q1', para: 'qf', simbolo: 'BLANK -> 1, S', curvatura: 40, write: '1', direction: 'S' }
            ],
            descricao: 'Lê binário, vai até o fim, soma 1 com carry.'
        }
    },
    {
        id: 'moore-mod3',
        name: 'Moore: Resto mod 3',
        description: 'Imprime o resto da divisão por 3',
        category: 'transducer',
        data: {
            tipo: 'Moore',
            alfabeto: ['0', '1'],
            estados: [
                { id: 'q0', label: 'r=0', x: 200, y: 200, isFinal: true, isInicial: true, output: '0' },
                { id: 'q1', label: 'r=1', x: 400, y: 120, isFinal: true, isInicial: false, output: '1' },
                { id: 'q2', label: 'r=2', x: 400, y: 280, isFinal: true, isInicial: false, output: '2' }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q0', simbolo: '0', curvatura: -30 },
                { id: 't2', de: 'q0', para: 'q1', simbolo: '1', curvatura: 0 },
                { id: 't3', de: 'q1', para: 'q2', simbolo: '0', curvatura: 30 },
                { id: 't4', de: 'q1', para: 'q0', simbolo: '1', curvatura: 30 },
                { id: 't5', de: 'q2', para: 'q1', simbolo: '0', curvatura: 30 },
                { id: 't6', de: 'q2', para: 'q2', simbolo: '1', curvatura: -30 }
            ],
            descricao: 'Saída associada ao estado representa o resto atual.'
        }
    },
    {
        id: 'mealy-complement',
        name: 'Mealy: Complemento de 1',
        description: 'Inverte bits (0->1, 1->0)',
        category: 'transducer',
        data: {
            tipo: 'Mealy',
            alfabeto: ['0', '1'],
            estados: [
                { id: 'q0', label: 'start', x: 300, y: 200, isFinal: true, isInicial: true }
            ],
            transicoes: [
                { id: 't1', de: 'q0', para: 'q0', simbolo: '0', output: '1', curvatura: -30 },
                { id: 't2', de: 'q0', para: 'q0', simbolo: '1', output: '0', curvatura: 30 }
            ],
            descricao: 'Transicoes rotuladas como entrada/saída.'
        }
    }
];

export const templateCategories = [
    { id: 'basic', name: 'Basicos', icon: 'Circle' },
    { id: 'binary', name: 'Binarios', icon: 'Binary' },
    { id: 'string', name: 'Strings', icon: 'Type' },
    { id: 'transducer', name: 'Transdutores', icon: 'Cpu' },
    { id: 'turing', name: 'Turing', icon: 'HardDrive' },
    { id: 'advanced', name: 'Avancados', icon: 'Zap' }
];




