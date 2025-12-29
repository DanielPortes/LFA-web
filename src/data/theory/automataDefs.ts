import type { AutomatoData } from '../../types';

// ============================================================================
// BANCO DE AUTÔMATOS - ACERVO DIDÁTICO
// ============================================================================

// --- 1. AFD ---

export const afd_paridade: AutomatoData = {
    tipo: 'AFD',
    descricao: 'Reconhece número par de "a"s e par de "b"s.',
    estados: [
        { id: 'q0', label: 'PP', x: 200, y: 200, isFinal: true, isInicial: true },
        { id: 'q1', label: 'IP', x: 400, y: 200, isFinal: false, isInicial: false },
        { id: 'q2', label: 'PI', x: 200, y: 400, isFinal: false, isInicial: false },
        { id: 'q3', label: 'II', x: 400, y: 400, isFinal: false, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
        { id: 't2', de: 'q1', para: 'q0', simbolo: 'a', curvatura: 0 },
        { id: 't3', de: 'q0', para: 'q2', simbolo: 'b', curvatura: 0 },
        { id: 't4', de: 'q2', para: 'q0', simbolo: 'b', curvatura: 0 },
        { id: 't5', de: 'q1', para: 'q3', simbolo: 'b', curvatura: 0 },
        { id: 't6', de: 'q3', para: 'q1', simbolo: 'b', curvatura: 0 },
        { id: 't7', de: 'q2', para: 'q3', simbolo: 'a', curvatura: 0 },
        { id: 't8', de: 'q3', para: 'q2', simbolo: 'a', curvatura: 0 }
    ]
};

export const afd_termina_ab: AutomatoData = {
    tipo: 'AFD',
    descricao: 'Termina em "ab". Note o determinismo: se vier "a" quando já li "a", fico em "a".',
    estados: [
        { id: 'q0', label: 'Ini', x: 100, y: 200, isFinal: false, isInicial: true },
        { id: 'q1', label: 'A', x: 300, y: 200, isFinal: false, isInicial: false },
        { id: 'q2', label: 'AB', x: 500, y: 200, isFinal: true, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q0', simbolo: 'b', curvatura: -30 },
        { id: 't2', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
        { id: 't3', de: 'q1', para: 'q1', simbolo: 'a', curvatura: -30 },
        { id: 't4', de: 'q1', para: 'q2', simbolo: 'b', curvatura: 0 },
        { id: 't5', de: 'q2', para: 'q0', simbolo: 'b', curvatura: 40 },
        { id: 't6', de: 'q2', para: 'q1', simbolo: 'a', curvatura: 40 }
    ]
};

export const afd_substring_aa_ou_bb: AutomatoData = {
    tipo: 'AFD',
    descricao: 'Reconhece L = { w | w possui "aa" ou "bb" como subpalavra }.',
    estados: [
        { id: 'q0', label: 'q0', x: 120, y: 200, isFinal: false, isInicial: true },
        { id: 'q1', label: 'q1', x: 320, y: 160, isFinal: false, isInicial: false },
        { id: 'q2', label: 'q2', x: 320, y: 260, isFinal: false, isInicial: false },
        { id: 'qf', label: 'OK', x: 520, y: 210, isFinal: true, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
        { id: 't2', de: 'q0', para: 'q2', simbolo: 'b', curvatura: 0 },
        { id: 't3', de: 'q1', para: 'qf', simbolo: 'a', curvatura: 0 },
        { id: 't4', de: 'q1', para: 'q2', simbolo: 'b', curvatura: 20 },
        { id: 't5', de: 'q2', para: 'qf', simbolo: 'b', curvatura: 0 },
        { id: 't6', de: 'q2', para: 'q1', simbolo: 'a', curvatura: -20 },
        { id: 't7', de: 'qf', para: 'qf', simbolo: 'a,b', curvatura: -40 }
    ]
};

// --- 2. AFN ---

export const afn_termina_ab: AutomatoData = {
    tipo: 'AFN',
    descricao: 'Mesma linguagem (termina em "ab"), mas versão não determinística.',
    estados: [
        { id: 'q0', label: 'q0', x: 150, y: 200, isFinal: false, isInicial: true },
        { id: 'q1', label: 'q1', x: 350, y: 200, isFinal: false, isInicial: false },
        { id: 'q2', label: 'q2', x: 550, y: 200, isFinal: true, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q0', simbolo: 'a,b', curvatura: -30 },
        { id: 't2', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
        { id: 't3', de: 'q1', para: 'q2', simbolo: 'b', curvatura: 0 }
    ]
};

export const afne_blocos: AutomatoData = {
    tipo: 'AFN',
    descricao: 'AFN com ε. Une blocos de (a) + (bb) + (ccc).',
    estados: [
        { id: 'q0', label: 'Ini', x: 100, y: 250, isFinal: false, isInicial: true },
        { id: 'qa', label: 'A', x: 300, y: 100, isFinal: true, isInicial: false },
        { id: 'qb1', label: 'B1', x: 300, y: 250, isFinal: false, isInicial: false },
        { id: 'qb2', label: 'B2', x: 500, y: 250, isFinal: true, isInicial: false },
        { id: 'qc1', label: 'C1', x: 300, y: 400, isFinal: false, isInicial: false },
        { id: 'qc2', label: 'C2', x: 450, y: 400, isFinal: false, isInicial: false },
        { id: 'qc3', label: 'C3', x: 600, y: 400, isFinal: true, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'qa', simbolo: 'a', curvatura: 0 },
        { id: 't2', de: 'q0', para: 'qb1', simbolo: 'ε', curvatura: 0 },
        { id: 't3', de: 'qb1', para: 'qb2', simbolo: 'b', curvatura: 0 },
        { id: 't4', de: 'qb1', para: 'qb1', simbolo: 'b', curvatura: -20 },
        { id: 't5', de: 'q0', para: 'qc1', simbolo: 'ε', curvatura: 0 },
        { id: 't6', de: 'qc1', para: 'qc2', simbolo: 'c', curvatura: 0 },
        { id: 't7', de: 'qc2', para: 'qc3', simbolo: 'c', curvatura: 0 }
    ]
};

export const afne_a_antes_b: AutomatoData = {
    tipo: 'AFN',
    descricao: 'AFN-ε para L = { w | todo "a" antecede todo "b" } (a* b*).',
    estados: [
        { id: 'q0', label: 'q0', x: 180, y: 200, isFinal: false, isInicial: true },
        { id: 'qf', label: 'qf', x: 420, y: 200, isFinal: true, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q0', simbolo: 'a', curvatura: -30 },
        { id: 't2', de: 'q0', para: 'qf', simbolo: 'ε', curvatura: 0 },
        { id: 't3', de: 'qf', para: 'qf', simbolo: 'b', curvatura: 30 }
    ]
};

// --- 3. MINIMIZAÇÃO ---

export const min_antes: AutomatoData = {
    tipo: 'AFD',
    descricao: 'AFD não mínimo. q2 e q4 são equivalentes (levam aos mesmos lugares).',
    estados: [
        { id: 'A', label: 'A', x: 100, y: 200, isFinal: false, isInicial: true },
        { id: 'B', label: 'B', x: 300, y: 100, isFinal: false, isInicial: false },
        { id: 'C', label: 'C', x: 300, y: 300, isFinal: true, isInicial: false },
        { id: 'D', label: 'D', x: 500, y: 100, isFinal: false, isInicial: false },
        { id: 'E', label: 'E', x: 500, y: 300, isFinal: true, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'A', para: 'B', simbolo: '0', curvatura: 0 },
        { id: 't2', de: 'A', para: 'C', simbolo: '1', curvatura: 0 },
        { id: 't3', de: 'B', para: 'B', simbolo: '0', curvatura: -30 },
        { id: 't4', de: 'B', para: 'D', simbolo: '1', curvatura: 0 },
        { id: 't5', de: 'C', para: 'C', simbolo: '0', curvatura: 30 },
        { id: 't6', de: 'C', para: 'E', simbolo: '1', curvatura: 0 },
        { id: 't7', de: 'D', para: 'B', simbolo: '0', curvatura: 40 },
        { id: 't8', de: 'D', para: 'D', simbolo: '1', curvatura: -30 },
        { id: 't9', de: 'E', para: 'C', simbolo: '0', curvatura: 40 },
        { id: 't10', de: 'E', para: 'E', simbolo: '1', curvatura: 30 }
    ]
};

export const min_depois: AutomatoData = {
    tipo: 'AFD',
    descricao: 'AFD minimizado. B e D foram fundidos; C e E foram fundidos.',
    estados: [
        { id: 'A', label: 'A', x: 100, y: 200, isFinal: false, isInicial: true },
        { id: 'BD', label: 'B,D', x: 350, y: 100, isFinal: false, isInicial: false },
        { id: 'CE', label: 'C,E', x: 350, y: 300, isFinal: true, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'A', para: 'BD', simbolo: '0', curvatura: 0 },
        { id: 't2', de: 'A', para: 'CE', simbolo: '1', curvatura: 0 },
        { id: 't3', de: 'BD', para: 'BD', simbolo: '0,1', curvatura: -40 },
        { id: 't4', de: 'CE', para: 'CE', simbolo: '0,1', curvatura: 40 }
    ]
};

// --- 4. EXPRESSÕES REGULARES (Thompson) ---

export const er_thompson_a_ou_b: AutomatoData = {
    tipo: 'AFN',
    descricao: 'União (a + b). Paralelismo.',
    estados: [
        { id: 'i', label: 'i', x: 100, y: 200, isFinal: false, isInicial: true },
        { id: 'q1', label: 'q1', x: 250, y: 100, isFinal: false, isInicial: false },
        { id: 'q2', label: 'q2', x: 400, y: 100, isFinal: false, isInicial: false },
        { id: 'q3', label: 'q3', x: 250, y: 300, isFinal: false, isInicial: false },
        { id: 'q4', label: 'q4', x: 400, y: 300, isFinal: false, isInicial: false },
        { id: 'f', label: 'f', x: 550, y: 200, isFinal: true, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'i', para: 'q1', simbolo: 'ε', curvatura: 0 },
        { id: 't2', de: 'q1', para: 'q2', simbolo: 'a', curvatura: 0 },
        { id: 't3', de: 'q2', para: 'f', simbolo: 'ε', curvatura: 0 },
        { id: 't4', de: 'i', para: 'q3', simbolo: 'ε', curvatura: 0 },
        { id: 't5', de: 'q3', para: 'q4', simbolo: 'b', curvatura: 0 },
        { id: 't6', de: 'q4', para: 'f', simbolo: 'ε', curvatura: 0 }
    ]
};

export const er_thompson_fecho: AutomatoData = {
    tipo: 'AFN',
    descricao: 'Fecho de Kleene (a*). O loop e o "pulo".',
    estados: [
        { id: 'i', label: 'i', x: 150, y: 200, isFinal: false, isInicial: true },
        { id: 'q1', label: 'q1', x: 300, y: 200, isFinal: false, isInicial: false },
        { id: 'q2', label: 'q2', x: 450, y: 200, isFinal: false, isInicial: false },
        { id: 'f', label: 'f', x: 600, y: 200, isFinal: true, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'i', para: 'q1', simbolo: 'ε', curvatura: 0 },
        { id: 't2', de: 'q1', para: 'q2', simbolo: 'a', curvatura: 0 },
        { id: 't3', de: 'q2', para: 'q1', simbolo: 'ε', curvatura: -30 },
        { id: 't4', de: 'q2', para: 'f', simbolo: 'ε', curvatura: 0 },
        { id: 't5', de: 'i', para: 'f', simbolo: 'ε', curvatura: 40 }
    ]
};

export const afd_prefixo_ab: AutomatoData = {
    tipo: 'AFD',
    descricao: 'Aceita strings sobre {a,b} que começam com "ab".',
    estados: [
        { id: 'q0', label: 'Ini', x: 120, y: 200, isFinal: false, isInicial: true },
        { id: 'q1', label: 'A', x: 300, y: 200, isFinal: false, isInicial: false },
        { id: 'q2', label: 'OK', x: 480, y: 200, isFinal: true, isInicial: false },
        { id: 'qd', label: 'Erro', x: 300, y: 340, isFinal: false, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
        { id: 't2', de: 'q0', para: 'qd', simbolo: 'b', curvatura: 0 },
        { id: 't3', de: 'q1', para: 'q2', simbolo: 'b', curvatura: 0 },
        { id: 't4', de: 'q1', para: 'qd', simbolo: 'a', curvatura: 0 },
        { id: 't5', de: 'q2', para: 'q2', simbolo: 'a,b', curvatura: -40 },
        { id: 't6', de: 'qd', para: 'qd', simbolo: 'a,b', curvatura: 0 }
    ]
};

export const afd_substring_abb: AutomatoData = {
    tipo: 'AFD',
    descricao: 'Aceita strings que contêm a substring "abb".',
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
    ]
};

// --- 5. AUTÔMATO DE PILHA (AP) ---

export const ap_an_bn: AutomatoData = {
    tipo: 'AP',
    descricao: 'Reconhece a^n b^n com pilha. Empilha A para cada a e desempilha para cada b.',
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
        { id: 't3', de: 'q0', para: 'q1', simbolo: 'b, A -> ε', curvatura: 20 },
        { id: 't4', de: 'q1', para: 'q1', simbolo: 'b, A -> ε', curvatura: -30 },
        { id: 't5', de: 'q0', para: 'q2', simbolo: 'ε, Z -> ε', curvatura: 40 },
        { id: 't6', de: 'q1', para: 'q2', simbolo: 'ε, Z -> ε', curvatura: 40 }
    ]
};

// --- 6. GRAMÁTICA DE GRAFOS (PAC-MAN) ---

export const pacman_grafo_antes: AutomatoData = {
    tipo: 'AFD',
    descricao: 'Subgrafo inicial: Pac-Man em A e maçã em B.',
    estados: [
        { id: 'A', label: 'A', x: 140, y: 200, isFinal: false, isInicial: true },
        { id: 'B', label: 'B', x: 340, y: 200, isFinal: false, isInicial: false },
        { id: 'P', label: 'P', x: 140, y: 80, isFinal: false, isInicial: false },
        { id: 'M', label: 'M', x: 340, y: 80, isFinal: false, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'A', para: 'B', simbolo: 'c', curvatura: 0 },
        { id: 't2', de: 'B', para: 'A', simbolo: 'c', curvatura: 20 },
        { id: 't3', de: 'P', para: 'A', simbolo: 'em', curvatura: 0 },
        { id: 't4', de: 'M', para: 'B', simbolo: 'em', curvatura: 0 }
    ]
};

export const pacman_grafo_depois: AutomatoData = {
    tipo: 'AFD',
    descricao: 'Subgrafo reescrito: Pac-Man em B e maçã removida.',
    estados: [
        { id: 'A', label: 'A', x: 140, y: 200, isFinal: false, isInicial: true },
        { id: 'B', label: 'B', x: 340, y: 200, isFinal: false, isInicial: false },
        { id: 'P', label: 'P', x: 340, y: 80, isFinal: false, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'A', para: 'B', simbolo: 'c', curvatura: 0 },
        { id: 't2', de: 'B', para: 'A', simbolo: 'c', curvatura: 20 },
        { id: 't3', de: 'P', para: 'B', simbolo: 'em', curvatura: 0 }
    ]
};
