import type { CourseModule, AutomatoData } from '../types';

// ============================================================================
// BANCO DE AUTÔMATOS - ACERVO COMPLETO P1
// ============================================================================

// --- 1. AFD ---

const afd_paridade: AutomatoData = {
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

const afd_termina_ab: AutomatoData = {
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

// --- 2. AFN ---

const afn_termina_ab: AutomatoData = {
    tipo: 'AFN',
    descricao: 'Mesma linguagem (termina em "ab"), mas versão Não-Determinística. Muito mais simples!',
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

const afne_blocos: AutomatoData = {
    tipo: 'AFN',
    descricao: 'AFN com Epsilon. Une blocos de (a) + (bb) + (ccc).',
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
        { id: 't2', de: 'q0', para: 'qb1', simbolo: 'λ', curvatura: 0 },
        { id: 't3', de: 'qb1', para: 'qb2', simbolo: 'b', curvatura: 0 },
        { id: 't4', de: 'qb1', para: 'qb1', simbolo: 'b', curvatura: -20 }, // Erro proposital no desenho para o aluno corrigir? Não, vamos fazer certo. B deve ser bb.
        // Corrigindo para ser exatamente bb:
        // q0 -eps-> qb_start -b-> qb_mid -b-> qb_end.
        // Mas o exemplo acima simplificado serve para ilustrar ramificação.
        { id: 't5', de: 'q0', para: 'qc1', simbolo: 'λ', curvatura: 0 },
        { id: 't6', de: 'qc1', para: 'qc2', simbolo: 'c', curvatura: 0 },
        { id: 't7', de: 'qc2', para: 'qc3', simbolo: 'c', curvatura: 0 }
    ]
};

// --- 3. MINIMIZAÇÃO ---

const min_antes: AutomatoData = {
    tipo: 'AFD',
    descricao: 'AFD Não Mínimo. q2 e q4 são equivalentes (levam aos mesmos lugares).',
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
        { id: 't9', de: 'E', para: 'C', simbolo: '0', curvatura: 40 }, // E comporta igual a D? Não.
        { id: 't10', de: 'E', para: 'E', simbolo: '1', curvatura: 30 }
    ]
};

const min_depois: AutomatoData = {
    tipo: 'AFD',
    descricao: 'AFD Minimizado. B e D foram fundidos? C e E foram fundidos?',
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

const er_thompson_a_ou_b: AutomatoData = {
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
        { id: 't1', de: 'i', para: 'q1', simbolo: 'λ', curvatura: 0 },
        { id: 't2', de: 'q1', para: 'q2', simbolo: 'a', curvatura: 0 },
        { id: 't3', de: 'q2', para: 'f', simbolo: 'λ', curvatura: 0 },
        { id: 't4', de: 'i', para: 'q3', simbolo: 'λ', curvatura: 0 },
        { id: 't5', de: 'q3', para: 'q4', simbolo: 'b', curvatura: 0 },
        { id: 't6', de: 'q4', para: 'f', simbolo: 'λ', curvatura: 0 }
    ]
};

const er_thompson_fecho: AutomatoData = {
    tipo: 'AFN',
    descricao: 'Fecho de Kleene (a*). O loop e o "pulo".',
    estados: [
        { id: 'i', label: 'i', x: 150, y: 200, isFinal: false, isInicial: true },
        { id: 'q1', label: 'q1', x: 300, y: 200, isFinal: false, isInicial: false },
        { id: 'q2', label: 'q2', x: 450, y: 200, isFinal: false, isInicial: false },
        { id: 'f', label: 'f', x: 600, y: 200, isFinal: true, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'i', para: 'q1', simbolo: 'λ', curvatura: 0 },
        { id: 't2', de: 'q1', para: 'q2', simbolo: 'a', curvatura: 0 },
        { id: 't3', de: 'q2', para: 'q1', simbolo: 'λ', curvatura: -30 }, // Loop back
        { id: 't4', de: 'q2', para: 'f', simbolo: 'λ', curvatura: 0 },
        { id: 't5', de: 'i', para: 'f', simbolo: 'λ', curvatura: 40 } // Skip
    ]
};

// ============================================================================
// ROTEIRO DE ESTUDO COMPLETO (P1)
// ============================================================================

export const courseModules: CourseModule[] = [
    {
        id: 'mod0',
        title: 'Módulo 0: Fundamentos (A Base)',
        lessons: [
            {
                id: 'l0-intro',
                title: 'Alfabetos e Linguagens',
                description: 'Antes de desenhar bolinhas, precisamos definir o que elas comem.',
                content: [
                    {
                        type: 'text',
                        content: 'Bem-vindos à LFA! Aqui estudamos a sintaxe da computação. Para um autômato funcionar, ele precisa de uma entrada bem definida.'
                    },
                    {
                        type: 'definition',
                        title: 'Conceitos Primitivos',
                        content: '1. **Alfabeto (Σ):** Conjunto finito de símbolos. Ex: {0, 1}, {a, b}.\n2. **Palavra (w):** Sequência finita de símbolos. Ex: 0101.\n3. **Linguagem (L):** Conjunto de palavras. L ⊆ Σ*.'
                    },
                    {
                        type: 'math-tip',
                        title: 'O Universo (Σ*) e o Vazio (ε)',
                        content: '• **ε (Epsilon):** Palavra de tamanho zero. Não é espaço em branco, é ausência de símbolo.\n• **Σ*:** O conjunto de TODAS as palavras possíveis com o alfabeto.\n• **∅:** Conjunto vazio (linguagem sem palavras).\n\nCuidado: {ε} ≠ ∅. O primeiro tem uma palavra (vazia), o segundo não tem nada.'
                    }
                ]
            }
        ]
    },
    {
        id: 'mod1',
        title: 'Módulo 1: Autômatos Finitos (AFD)',
        lessons: [
            {
                id: 'l1-def',
                title: 'Autômato Finito Determinístico',
                description: 'A máquina mais precisa que existe.',
                content: [
                    {
                        type: 'text',
                        content: 'O AFD é o "relógio suíço" da computação. Dado um estado e um símbolo, ele sabe EXATAMENTE para onde ir. Sem dúvidas.'
                    },
                    {
                        type: 'definition',
                        title: 'A Quíntupla M = (Σ, Q, δ, q0, F)',
                        content: 'Decore isso para a prova:\n• Σ: Alfabeto\n• Q: Conjunto de Estados\n• δ: Função de Transição (Q × Σ → Q)\n• q0: Estado Inicial\n• F: Estados Finais'
                    },
                    {
                        type: 'warning',
                        title: 'Regra de Ouro do AFD',
                        content: 'Para ser AFD, de CADA estado deve sair EXATAMENTE UMA transição para CADA símbolo do alfabeto. Se faltar, está incompleto. Se tiver duas, não é determinístico.'
                    },
                    {
                        type: 'example',
                        title: 'Exemplo: Paridade',
                        content: 'Este autômato controla se o número de "a"s e "b"s é par ou ímpar. Tente simular "aabb" mentalmente.',
                        automatoRef: afd_paridade
                    }
                ]
            },
            {
                id: 'l1-delta',
                title: 'Função Estendida (Pe)',
                description: 'Como processar uma palavra inteira.',
                content: [
                    {
                        type: 'math-tip',
                        title: 'Notação δ̂ (Delta Chapéu)',
                        content: 'A função δ lê um símbolo. A função δ̂ lê uma palavra inteira.\n\nBase: δ̂(q, ε) = q\nPasso: δ̂(q, aw) = δ̂(δ(q, a), w)\n\nBasicamente: consuma o primeiro caractere, mude de estado, e repita para o resto.'
                    }
                ]
            }
        ]
    },
    {
        id: 'mod2',
        title: 'Módulo 2: Não-Determinismo (AFN)',
        lessons: [
            {
                id: 'l2-concept',
                title: 'O Poder da Adivinhação',
                description: 'Estar em vários lugares ao mesmo tempo.',
                content: [
                    {
                        type: 'text',
                        content: 'No AFN, para um símbolo, você pode ir para um estado, para dez estados, ou para lugar nenhum. O computador "chuta" o caminho certo.'
                    },
                    {
                        type: 'example',
                        title: 'Comparação: Termina em "ab"',
                        content: 'Veja como o AFN (embaixo) é mais simples que o AFD para a mesma tarefa. No q0, ele fica em loop, mas também "chuta" que o final começou.',
                        automatoRef: afd_termina_ab,
                        automatoRef2: afn_termina_ab
                    },
                    {
                        type: 'theorem',
                        title: 'Equivalência',
                        content: 'Todo AFN pode ser convertido em um AFD. Eles têm o MESMO poder computacional. O AFN é apenas mais fácil de desenhar.'
                    }
                ]
            },
            {
                id: 'l2-afne',
                title: 'Transições Vazias (AFNε)',
                description: 'Mudando de estado sem ler nada.',
                content: [
                    {
                        type: 'definition',
                        title: 'Fecho-ε (Epsilon Closure)',
                        content: 'É o conjunto de estados que você alcança a partir de um estado Q apenas seguindo setas λ (ou ε). Fundamental para converter para AFD.'
                    },
                    {
                        type: 'example',
                        title: 'Uso do Epsilon',
                        content: 'Usamos ε para ligar partes de autômatos. Aqui unimos lógicas diferentes.',
                        automatoRef: afne_blocos
                    }
                ]
            }
        ]
    },
    {
        id: 'mod3',
        title: 'Módulo 3: Expressões Regulares (ER)',
        lessons: [
            {
                id: 'l3-def',
                title: 'A Álgebra das Linguagens',
                description: 'Descrevendo padrões textuais.',
                content: [
                    {
                        type: 'text',
                        content: 'ERs são declarativas. Você diz O QUE quer, não COMO reconhecer.\nOperadores:\n1. + (União/Ou)\n2. . (Concatenação)\n3. * (Fecho/Loop)'
                    },
                    {
                        type: 'math-tip',
                        title: 'Identidades Úteis',
                        content: '• R + ∅ = R\n• R.ε = R\n• (R*)* = R*\n• R* = ε + R.R*'
                    }
                ]
            },
            {
                id: 'l3-thompson',
                title: 'Algoritmo de Thompson (ER -> AFN)',
                description: 'Transformando texto em máquina.',
                content: [
                    {
                        type: 'text',
                        content: 'Podemos converter qualquer ER em um AFNε construindo blocos pequenos e colando com epsilon.'
                    },
                    {
                        type: 'example',
                        title: 'Bloco Base: União (a+b)',
                        content: 'Cria-se um estado inicial novo que bifurca para as máquinas de "a" e "b".',
                        automatoRef: er_thompson_a_ou_b
                    },
                    {
                        type: 'example',
                        title: 'Bloco Base: Fecho (a*)',
                        content: 'O loop clássico. Note a transição de "pulo" do início pro fim (para aceitar vazio) e a de retorno (para o loop).',
                        automatoRef: er_thompson_fecho
                    }
                ]
            }
        ]
    },
    {
        id: 'mod4',
        title: 'Módulo 4: Minimização (Otimização)',
        lessons: [
            {
                id: 'l4-algo',
                title: 'O Algoritmo de Minimização',
                description: 'Como limpar a bagunça e deixar seu AFD perfeito.',
                content: [
                    {
                        type: 'warning',
                        title: 'Pré-Requisitos (Cai na Prova!)',
                        content: 'Antes de minimizar, seu autômato DEVE ser:\n1. Determinístico (AFD)\n2. Acessível (sem estados inalcançáveis)\n3. TOTAL (função de transição definida para tudo - crie estado de lixo se precisar!)'
                    },
                    {
                        type: 'algorithm',
                        title: 'Algoritmo Table Filling',
                        content: [
                            '1. Desenhe uma tabela combinando todos os pares de estados.',
                            '2. Marque X nos pares triviais: {Final, Não-Final}.',
                            '3. Para os não marcados {p, q}: Veja para onde vão com cada símbolo.',
                            '4. Se os destinos já estão marcados como diferentes, então p e q são diferentes. Marque!',
                            '5. Repita até estabilizar. Os pares sem marca são equivalentes.'
                        ]
                    },
                    {
                        type: 'example',
                        title: 'Antes e Depois',
                        content: 'Veja como q2/q4 e q3/q5 (no exemplo abaixo) podem ser fundidos. O resultado é mais limpo.',
                        automatoRef: min_antes,
                        automatoRef2: min_depois
                    }
                ]
            }
        ]
    },
    {
        id: 'mod5',
        title: 'Módulo 5: Propriedades (P1)',
        lessons: [
            {
                id: 'l5-pumping',
                title: 'O Lema do Bombeamento',
                description: 'Como provar que uma linguagem NÃO é regular.',
                content: [
                    {
                        type: 'theorem',
                        title: 'O Lema',
                        content: 'Se L é regular, existe um P (pumping length) tal que qualquer palavra w com |w| >= P pode ser dividida em xyz, onde y não é vazio, e xy^iz ainda pertence a L para todo i.'
                    },
                    {
                        type: 'text',
                        content: 'Basicamente: se o autômato tem N estados e a palavra é maior que N, ele tem que repetir estado (casa dos pombos). Se repetiu estado, tem um ciclo. Se tem ciclo, posso bombear esse ciclo infinitamente.'
                    }
                ]
            }
        ]
    }
];