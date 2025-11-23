import type { CourseModule, AutomatoData } from '../types';

// ============================================================================
// BANCO DE AUTÔMATOS - EXEMPLOS DIDÁTICOS
// ============================================================================

// --- FUNDAMENTOS E AFD ---

const ex_AFD_Paridade: AutomatoData = {
    tipo: 'AFD',
    descricao: 'Reconhece palavras com número par de "a"s. O estado q0 representa "par" e q1 "ímpar".',
    estados: [
        { id: 'q0', label: 'Par', x: 200, y: 200, isFinal: true, isInicial: true },
        { id: 'q1', label: 'Ímpar', x: 400, y: 200, isFinal: false, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 30 },
        { id: 't2', de: 'q1', para: 'q0', simbolo: 'a', curvatura: 30 },
        { id: 't3', de: 'q0', para: 'q0', simbolo: 'b', curvatura: -40 },
        { id: 't4', de: 'q1', para: 'q1', simbolo: 'b', curvatura: -40 }
    ]
};

// --- ANÁLISE LÉXICA ---

const ex_AFD_Lexico: AutomatoData = {
    tipo: 'AFD',
    descricao: 'Reconhecedor de Tokens: Identificadores e Números. q3 é estado de erro implícito.',
    estados: [
        { id: 'q0', label: 'Início', x: 150, y: 200, isFinal: false, isInicial: true },
        { id: 'q1', label: 'ID', x: 350, y: 100, isFinal: true, isInicial: false },
        { id: 'q2', label: 'NUM', x: 350, y: 300, isFinal: true, isInicial: false },
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q1', simbolo: 'a..z', curvatura: 0 },
        { id: 't2', de: 'q0', para: 'q2', simbolo: '0..9', curvatura: 0 },
        { id: 't3', de: 'q1', para: 'q1', simbolo: 'a..z,0..9', curvatura: -30 },
        { id: 't4', de: 'q2', para: 'q2', simbolo: '0..9', curvatura: 30 }
    ]
};

// --- AFN E AFNe ---

const ex_AFNe_Fecho: AutomatoData = {
    tipo: 'AFN',
    descricao: 'Conceito de Fecho-ε. A partir de q0, sem ler nada, alcançamos {q0, q1, q2}.',
    estados: [
        { id: 'q0', label: 'q0', x: 150, y: 200, isFinal: false, isInicial: true },
        { id: 'q1', label: 'q1', x: 300, y: 100, isFinal: false, isInicial: false },
        { id: 'q2', label: 'q2', x: 300, y: 300, isFinal: true, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q1', simbolo: 'λ', curvatura: 0 },
        { id: 't2', de: 'q0', para: 'q2', simbolo: 'λ', curvatura: 0 },
        { id: 't3', de: 'q1', para: 'q1', simbolo: 'a', curvatura: -40 },
        { id: 't4', de: 'q2', para: 'q2', simbolo: 'b', curvatura: 40 }
    ]
};

// --- EXPRESSÕES REGULARES (ER) ---

const ex_ER_Thompson_Union: AutomatoData = {
    tipo: 'AFN',
    descricao: 'Construção de Thompson para (a + b). Note o paralelismo com transições vazias.',
    estados: [
        { id: 'q_in', label: 'Ini', x: 100, y: 200, isFinal: false, isInicial: true },
        { id: 'q_a1', label: 'A1', x: 250, y: 100, isFinal: false, isInicial: false },
        { id: 'q_a2', label: 'A2', x: 400, y: 100, isFinal: false, isInicial: false },
        { id: 'q_b1', label: 'B1', x: 250, y: 300, isFinal: false, isInicial: false },
        { id: 'q_b2', label: 'B2', x: 400, y: 300, isFinal: false, isInicial: false },
        { id: 'q_fin', label: 'Fim', x: 550, y: 200, isFinal: true, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'q_in', para: 'q_a1', simbolo: 'λ', curvatura: 0 },
        { id: 't2', de: 'q_in', para: 'q_b1', simbolo: 'λ', curvatura: 0 },
        { id: 't3', de: 'q_a1', para: 'q_a2', simbolo: 'a', curvatura: 0 },
        { id: 't4', de: 'q_b1', para: 'q_b2', simbolo: 'b', curvatura: 0 },
        { id: 't5', de: 'q_a2', para: 'q_fin', simbolo: 'λ', curvatura: 0 },
        { id: 't6', de: 'q_b2', para: 'q_fin', simbolo: 'λ', curvatura: 0 }
    ]
};

const ex_AFD_Eliminacao: AutomatoData = {
    tipo: 'ER',
    descricao: 'Método de Eliminação de Estados. Para remover q1, a transição q0->q2 ganha o rótulo "a.b".',
    estados: [
        { id: 'q0', label: 'q0', x: 150, y: 200, isFinal: false, isInicial: true },
        { id: 'q1', label: 'q1', x: 350, y: 200, isFinal: false, isInicial: false },
        { id: 'q2', label: 'q2', x: 550, y: 200, isFinal: true, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
        { id: 't2', de: 'q1', para: 'q2', simbolo: 'b', curvatura: 0 },
        { id: 't3', de: 'q1', para: 'q1', simbolo: 'c', curvatura: -40 }
    ]
};

// --- MINIMIZAÇÃO ---

const ex_AFD_Completo: AutomatoData = {
    tipo: 'AFD',
    descricao: 'Função Total: Adiciona-se o "Estado de Erro" (Lixo) para onde vão as transições indefinidas.',
    estados: [
        { id: 'q0', label: 'q0', x: 150, y: 200, isFinal: true, isInicial: true },
        { id: 'q_lixo', label: 'Lixo', x: 400, y: 200, isFinal: false, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q0', simbolo: 'a', curvatura: -30 },
        { id: 't2', de: 'q0', para: 'q_lixo', simbolo: 'b', curvatura: 0 },
        { id: 't3', de: 'q_lixo', para: 'q_lixo', simbolo: 'a,b', curvatura: -30 }
    ]
};

const ex_AFD_NaoMinimo: AutomatoData = {
    tipo: 'AFD',
    descricao: 'AFD não minimizado. q1 e q2 são equivalentes (indistinguíveis).',
    estados: [
        { id: 'q0', label: 'q0', x: 100, y: 200, isFinal: false, isInicial: true },
        { id: 'q1', label: 'q1', x: 300, y: 100, isFinal: true, isInicial: false },
        { id: 'q2', label: 'q2', x: 300, y: 300, isFinal: true, isInicial: false },
        { id: 'q3', label: 'q3', x: 500, y: 200, isFinal: false, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
        { id: 't2', de: 'q0', para: 'q2', simbolo: 'b', curvatura: 0 },
        { id: 't3', de: 'q1', para: 'q3', simbolo: 'a', curvatura: 0 },
        { id: 't4', de: 'q2', para: 'q3', simbolo: 'a', curvatura: 0 },
        { id: 't5', de: 'q3', para: 'q3', simbolo: 'a,b', curvatura: -40 }
    ]
};

// --- PROPRIEDADES (INTERSEÇÃO) ---
const ex_Produto_Cartesiano: AutomatoData = {
    tipo: 'AFD',
    descricao: 'Produto Cartesiano para Interseção. Estado é final só se (q, p) forem ambos finais.',
    estados: [
        { id: 'q0p0', label: 'q0,p0', x: 150, y: 150, isFinal: false, isInicial: true },
        { id: 'q1p0', label: 'q1,p0', x: 350, y: 150, isFinal: false, isInicial: false },
        { id: 'q0p1', label: 'q0,p1', x: 150, y: 350, isFinal: false, isInicial: false },
        { id: 'q1p1', label: 'q1,p1', x: 350, y: 350, isFinal: true, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'q0p0', para: 'q1p1', simbolo: 'a', curvatura: 0, },
        { id: 't2', de: 'q1p1', para: 'q0p0', simbolo: 'b', curvatura: 0, }
    ]
};

// --- DECIDIBILIDADE (NOVOS PARA P1) ---

const ex_Linguagem_Infinita: AutomatoData = {
    tipo: 'AFD',
    descricao: 'Linguagem Infinita: Existe um ciclo acessível em um caminho que leva a um estado final.',
    estados: [
        { id: 'q0', label: 'Ini', x: 150, y: 200, isFinal: false, isInicial: true },
        { id: 'q1', label: 'Ciclo', x: 300, y: 200, isFinal: false, isInicial: false },
        { id: 'q2', label: 'Fim', x: 450, y: 200, isFinal: true, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
        { id: 't2', de: 'q1', para: 'q1', simbolo: 'b', curvatura: -40 }, // O ciclo!
        { id: 't3', de: 'q1', para: 'q2', simbolo: 'a', curvatura: 0 }
    ]
};

const ex_Linguagem_Vazia: AutomatoData = {
    tipo: 'AFD',
    descricao: 'Linguagem Vazia: Não existe caminho de q0 até q2 (estado final inalcançável).',
    estados: [
        { id: 'q0', label: 'Ini', x: 150, y: 200, isFinal: false, isInicial: true },
        { id: 'q1', label: 'q1', x: 300, y: 200, isFinal: false, isInicial: false },
        { id: 'q2', label: 'Fim', x: 450, y: 200, isFinal: true, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
        { id: 't2', de: 'q1', para: 'q1', simbolo: 'b', curvatura: -30 }
        // Nenhuma transição chega em q2
    ]
};

// --- MATERIAL P2 (APENAS REFERÊNCIA) ---

const ex_GR_LinearDireita: AutomatoData = {
    tipo: 'GR',
    descricao: '[MATÉRIA P2] Gramática Regular: S -> aA | bB. A -> aS | ε. B -> b.',
    estados: [
        { id: 'S', label: 'S', x: 150, y: 200, isFinal: false, isInicial: true },
        { id: 'A', label: 'A', x: 350, y: 100, isFinal: true, isInicial: false },
        { id: 'B', label: 'B', x: 350, y: 300, isFinal: false, isInicial: false },
        { id: 'F', label: 'F', x: 500, y: 300, isFinal: true, isInicial: false }
    ],
    transicoes: [
        { id: 't1', de: 'S', para: 'A', simbolo: 'a', curvatura: 0 },
        { id: 't2', de: 'S', para: 'B', simbolo: 'b', curvatura: 0 },
        { id: 't3', de: 'A', para: 'S', simbolo: 'a', curvatura: -20 },
        { id: 't4', de: 'B', para: 'F', simbolo: 'b', curvatura: 0 }
    ]
};

// ============================================================================
// CONTEÚDO TEÓRICO - ESTRUTURA CURRICULAR P1 (DCC063)
// ============================================================================

export const courseModules: CourseModule[] = [
    {
        id: 'mod0',
        title: 'Módulo 0: Fundamentos (Revisão)',
        lessons: [
            {
                id: 'l0-sets',
                title: 'Teoria dos Conjuntos para LFA',
                description: 'A base matemática necessária: Alfabetos, Palavras e Linguagens.',
                content: [
                    {
                        type: 'text',
                        content: 'Meus jovens, antes de desenharmos máquinas, precisamos falar a língua delas: a Matemática Discreta. Em LFA, a precisão é tudo.'
                    },
                    {
                        type: 'definition',
                        title: 'Alfabeto (Σ) e Linguagem (L)',
                        content: '• **Alfabeto (Σ):** Conjunto finito e não vazio de símbolos. Ex: {0, 1}, {a, b}.\n• **Palavra (w):** Sequência finita de símbolos justapostos. Ex: 0101, aba.\n• **Palavra Vazia (ε ou λ):** Palavra de comprimento 0. (Nota: Blauth usa ε).\n• **Universo (Σ*):** Conjunto de TODAS as palavras possíveis sobre Σ, incluindo ε.\n• **Linguagem (L):** Qualquer subconjunto de Σ*.'
                    },
                    {
                        type: 'note',
                        title: 'Pegadinha de Prova',
                        content: 'Não confunda jamais:\n• ∅ (Conjunto vazio - Linguagem sem palavras, cardinalidade 0)\n• {ε} (Linguagem contendo apenas a palavra vazia - cardinalidade 1)\n• ε (A própria palavra vazia, comprimento 0)'
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
                id: 'l1-afd-def',
                title: 'O Autômato Finito Determinístico',
                description: 'Definição formal (Tupla) e Função Estendida.',
                content: [
                    {
                        type: 'definition',
                        title: 'A Quíntupla M = (Σ, Q, δ, q0, F)',
                        content: 'Para a prova, decorem a estrutura:\n1. **Σ:** Alfabeto de entrada.\n2. **Q:** Conjunto finito de estados.\n3. **δ:** Função de transição (Q × Σ → Q). É uma função parcial (pode não estar definida para tudo).\n4. **q0:** Estado inicial (q0 ∈ Q).\n5. **F:** Conjunto de estados finais (F ⊆ Q).'
                    },
                    {
                        type: 'theorem',
                        title: 'Função Programa Estendida (Pe ou δ̂)',
                        content: 'Como processar uma PALAVRA inteira, não só um símbolo? Definimos recursivamente (Pe: Q × Σ* → Q):\n\n1. **Base:** Pe(q, ε) = q\n   (Ler a palavra vazia não muda o estado).\n\n2. **Passo Indutivo:** Pe(q, aw) = Pe(δ(q, a), w)\n   (Consome o primeiro símbolo "a", muda de estado, e processa o resto "w").\n\nAceitação: Uma palavra w é aceita se Pe(q0, w) ∈ F.'
                    },
                    {
                        type: 'example',
                        title: 'Exemplo: Reconhecedor de Paridade',
                        content: 'Este autômato clássico distingue paridade de "a"s. Tente simular "aba" mentalmente usando a função estendida.',
                        automatoRef: ex_AFD_Paridade
                    }
                ]
            }
        ]
    },
    {
        id: 'mod_lex',
        title: 'Módulo 1.5: Análise Léxica (Aplicação)',
        lessons: [
            {
                id: 'l-lex-intro',
                title: 'O AFD em Compiladores',
                description: 'Como a teoria vira prática: Scanners e Tokens.',
                content: [
                    {
                        type: 'text',
                        content: 'A primeira fase de um compilador é o **Analisador Léxico** (Scanner). Ele usa a teoria de AFDs para agrupar caracteres em **Tokens** (Identificadores, Números, Palavras-chave).'
                    },
                    {
                        type: 'algorithm',
                        title: 'Algoritmo de Reconhecimento (Implementação)',
                        content: [
                            'Entrada: Palavra w e AFD M.',
                            '1. Estado atual = q0.',
                            '2. Para cada char c em w:',
                            '3.   Se δ(atual, c) existe, atual = δ(atual, c).',
                            '4.   Senão, Pare e Rejeite (ou vá para estado de Erro).',
                            '5. Se terminou a palavra e atual ∈ F, Aceite. Senão, Rejeite.'
                        ]
                    },
                    {
                        type: 'example',
                        title: 'Identificadores vs Números',
                        content: 'O autômato abaixo distingue variáveis (começam com letra) de números. Note o estado de erro implícito (se começar com número e vier letra, trava).',
                        automatoRef: ex_AFD_Lexico
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
                id: 'l2-afn-def',
                title: 'Autômato Finito Não-Determinístico',
                description: 'Poder expressivo vs Poder computacional.',
                content: [
                    {
                        type: 'definition',
                        title: 'AFN e AFNε',
                        content: 'A diferença crucial está na assinatura da função de transição:\n\n**AFD:** δ: Q × Σ → Q (Um destino único)\n**AFN:** δ: Q × Σ → 2^Q (Conjunto de destinos)\n**AFNε:** δ: Q × (Σ ∪ {ε}) → 2^Q (Permite transição espontânea)\n\nLembre-se para a prova: Todo AFN pode ser convertido em AFD. Eles têm o MESMO poder computacional (reconhecem a mesma classe de linguagens).'
                    },
                    {
                        type: 'definition',
                        title: 'Fecho-ε (Epsilon Closure)',
                        content: 'O conjunto de estados alcançáveis a partir de um estado `q` apenas seguindo transições ε.\n\n1. Base: q ∈ Fecho-ε(q).\n2. Indução: Se p ∈ Fecho-ε(q) e existe p --ε--> r, então r ∈ Fecho-ε(q).'
                    },
                    {
                        type: 'example',
                        title: 'Fecho-ε na Prática',
                        content: 'No autômato abaixo, Fecho-ε(q0) = {q0, q1, q2}. Isso significa que ao iniciar, a máquina já está "virtualmente" nesses três estados.',
                        automatoRef: ex_AFNe_Fecho
                    }
                ]
            },
            {
                id: 'l2-afn-conv',
                title: 'Conversão AFN -> AFD (Subset Construction)',
                description: 'O algoritmo clássico de prova da P1.',
                content: [
                    {
                        type: 'algorithm',
                        title: 'Construção de Subconjuntos',
                        content: [
                            '1. O conjunto de estados do AFD será o conjunto das partes de Q_AFN.',
                            '2. O estado inicial do AFD é q0_AFD = Fecho-ε({q0_AFN}).',
                            '3. Para cada estado criado S no AFD (que é um conjunto de estados originais) e cada símbolo "a":',
                            '4.   Calcule o conjunto destino: D = Union( δ_AFN(p, a) para todo p em S ).',
                            '5.   O novo estado será Fecho-ε(D).',
                            '6. Um estado do AFD é final se contiver pelo menos um estado final do AFN.'
                        ]
                    },
                    {
                        type: 'note',
                        title: 'Atenção na Prova!',
                        content: 'Sempre comece calculando o Fecho-ε do estado inicial. Se houver transições vazias saindo do inicial, o estado inicial do seu AFD resultante NÃO será apenas {q0}, mas sim todo o conjunto alcançável!'
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
                id: 'l3-er-def',
                title: 'Álgebra das Linguagens',
                description: 'Uma notação declarativa e compacta.',
                content: [
                    {
                        type: 'text',
                        content: 'ERs são equivalentes aos autômatos (Teorema de Kleene). Elas usam três operações básicas com precedência definida: 1. Fecho (*), 2. Concatenação (.), 3. União (+).'
                    },
                    {
                        type: 'list',
                        title: 'Identidades Úteis para Simplificação',
                        content: [
                            'R + ∅ = R',
                            'R.ε = R',
                            'R + R = R (Idempotência)',
                            '(R*)* = R*',
                            'R* = ε + R.R*',
                            'R(S + T) = RS + RT (Distributividade)'
                        ]
                    }
                ]
            },
            {
                id: 'l3-er-algo',
                title: 'ER -> Autômato (Algoritmo de Thompson)',
                description: 'Como transformar regex em código (máquina).',
                content: [
                    {
                        type: 'algorithm',
                        title: 'Construção de Thompson (Indutiva)',
                        content: [
                            'Base: Para símbolo "a", crie q_ini --a--> q_fim.',
                            'Indução:',
                            '• s + t (União): Novo inicial e final, ligando as máquinas em paralelo via ε.',
                            '• s.t (Concatenação): Liga o final de M_s ao inicial de M_t (via ε ou fusão).',
                            '• s* (Fecho): Novo inicial e final. Loops de retorno e "pulos" via ε.'
                        ]
                    },
                    {
                        type: 'example',
                        title: 'Thompson para (a + b)',
                        content: 'Visualização da União. Note como o não-determinismo simplifica a modelagem.',
                        automatoRef: ex_ER_Thompson_Union
                    }
                ]
            },
            {
                id: 'l3-afd-to-er',
                title: 'Autômato -> ER (Eliminação de Estados)',
                description: 'O caminho inverso: extrair a regex de um AFD.',
                content: [
                    {
                        type: 'text',
                        content: 'Para P1, o **Método de Eliminação de Estados** é frequentemente cobrado. A ideia é remover estados intermediários e compensar criando transições com Expressões Regulares nas arestas.'
                    },
                    {
                        type: 'algorithm',
                        title: 'Passo a Passo',
                        content: [
                            '1. Garanta que há apenas 1 estado inicial e 1 final (crie novos com ε se precisar).',
                            '2. Escolha um estado "q" intermediário para eliminar.',
                            '3. "Bypass": Para cada par (entrada, saída) de "q", crie um atalho direto.',
                            '4. Regra: Se temos A->q (R1), q->q (loop R2), q->B (R3), criamos A->B com o rótulo R1.(R2)*.R3.',
                            '5. Repita até sobrar apenas inicial e final.'
                        ]
                    },
                    {
                        type: 'example',
                        title: 'Conceito de Bypass',
                        content: 'Ao eliminar q1, a transição direta absorve o caminho antigo. Rótulo resultante: a.c*.b',
                        automatoRef: ex_AFD_Eliminacao
                    }
                ]
            }
        ]
    },
    {
        id: 'mod_props',
        title: 'Módulo 3.5: Técnicas de Construção (Foco P1)',
        lessons: [
            {
                id: 'l-props-reg',
                title: 'Construção via Operações Fechadas',
                description: 'Ferramentas vitais para construir autômatos complexos na prova.',
                content: [
                    {
                        type: 'text',
                        content: 'Atenção: A prova formal de propriedades de fechamento é matéria de P2, mas a **TÉCNICA DE CONSTRUÇÃO** é exigida na P1. Se a questão pede um autômato para "L1 e L2" (Interseção), você DEVE saber fazer o produto cartesiano.'
                    },
                    {
                        type: 'definition',
                        title: 'Interseção (L1 ∩ L2) - Produto Cartesiano',
                        content: 'Para aceitar "L1 E L2", constrói-se um autômato onde cada estado é um par (p, q).\n\n• Q = Q1 × Q2\n• δ((p,q), a) = (δ1(p,a), δ2(q,a))\n• F = F1 × F2 (Só é final se AMBOS componentes forem finais).\n\nSe fosse União, seria final se PELO MENOS UM fosse final.'
                    },
                    {
                        type: 'definition',
                        title: 'Complemento (L̅)',
                        content: 'Para aceitar "Tudo que NÃO é L":\n1. Pegue o AFD **Determinístico** e **Completo** (com estado de lixo/erro explícito).\n2. Inverta os estados: Finais viram Não-Finais e vice-versa.\n\nCuidado: Só funciona em AFD!'
                    },
                    {
                        type: 'example',
                        title: 'Esboço do Produto Cartesiano',
                        content: 'O autômato simula M1 e M2 simultaneamente. O estado é um par.',
                        automatoRef: ex_Produto_Cartesiano
                    }
                ]
            }
        ]
    },
    {
        id: 'mod4',
        title: 'Módulo 4: Minimização de AFD',
        lessons: [
            {
                id: 'l4-min-pre',
                title: 'Pré-Requisitos Obrigatórios',
                description: 'Não comece a tabela de minimização antes de verificar isso!',
                content: [
                    {
                        type: 'list',
                        title: 'As 3 Condições Vitais',
                        content: [
                            '1. **Determinístico:** O algoritmo só vale para AFD.',
                            '2. **Acessível:** Remova estados inalcançáveis a partir do inicial.',
                            '3. **TOTAL (Completo):** A função δ deve ser definida para todo par (estado, símbolo). Se faltar transição, crie um **Estado de Lixo** (ou Erro) e jogue as transições para lá.'
                        ]
                    },
                    {
                        type: 'example',
                        title: 'Função Total (Estado de Lixo)',
                        content: 'Na P1, se você esquecer de criar o estado de Lixo, sua tabela de minimização dará errado. Veja o exemplo abaixo:',
                        automatoRef: ex_AFD_Completo
                    }
                ]
            },
            {
                id: 'l4-min-algo',
                title: 'Algoritmo de Marcação (Table Filling)',
                description: 'O método de prova de indistinguibilidade.',
                content: [
                    {
                        type: 'text',
                        content: 'Dois estados p, q são indistinguíveis se nenhuma palavra consegue levar um para final e outro para não-final. Se são indistinguíveis, podemos fundi-los.'
                    },
                    {
                        type: 'algorithm',
                        title: 'Algoritmo de Minimização',
                        content: [
                            '1. Desenhe a tabela triangular de pares {p, q}.',
                            '2. Marque X se (p ∈ F e q ∉ F) ou vice-versa (Trivialmente diferentes).',
                            '3. Propagação: Para cada par {p, q} não marcado e símbolo "a":',
                            '   - Se {δ(p,a), δ(q,a)} já está marcado com X, MARQUE {p, q}.',
                            '4. Repita o passo 3 até que não seja possível marcar mais nada.',
                            '5. Os pares que sobraram sem marcação são equivalentes -> FUSÃO.'
                        ]
                    },
                    {
                        type: 'example',
                        title: 'Exemplo para Praticar',
                        content: 'Neste autômato, q1 e q2 são equivalentes. Na tabela, o par {q1, q2} nunca será marcado.',
                        automatoRef: ex_AFD_NaoMinimo
                    }
                ]
            }
        ]
    },
    {
        id: 'mod5_decid',
        title: 'Módulo 5: Decidibilidade (Essencial P1)',
        lessons: [
            {
                id: 'l5-empty',
                title: 'Problema do Vazio (L = ∅?)',
                description: 'Teoria e Algoritmo para decidir se a linguagem é vazia.',
                content: [
                    {
                        type: 'definition',
                        title: 'Teoria: Acessibilidade em Grafos',
                        content: 'Formalmente, uma linguagem regular é VAZIA se, e somente se, no grafo de transição do seu AFD, não existe nenhum caminho partindo do estado inicial q0 até qualquer estado final qf ∈ F.\n\nL = ∅ ⟺ Reach({q0}) ∩ F = ∅'
                    },
                    {
                        type: 'algorithm',
                        title: 'Algoritmo de Decisão',
                        content: [
                            '1. Entrada: AFD M.',
                            '2. Execute uma busca (Largura ou Profundidade) no grafo iniciando em q0.',
                            '3. Marque todos os estados visitados (Acessíveis).',
                            '4. Se nenhum estado final foi marcado, RETORNE "SIM" (É vazia).',
                            '5. Senão, RETORNE "NÃO".'
                        ]
                    },
                    {
                        type: 'example',
                        title: 'Exemplo de Linguagem Vazia',
                        content: 'Note que q2 (final) é inalcançável a partir de q0. O algoritmo detectaria isso ao não encontrar caminho.',
                        automatoRef: ex_Linguagem_Vazia
                    }
                ]
            },
            {
                id: 'l5-finite',
                title: 'Problema da Finitude (|L| < ∞?)',
                description: 'Como distinguir linguagens finitas de infinitas usando ciclos.',
                content: [
                    {
                        type: 'definition',
                        title: 'Teoria: Princípio da Casa dos Pombos',
                        content: 'Se um autômato tem N estados e aceita uma palavra w com comprimento |w| ≥ N, então ele obrigatoriamente passou por N+1 estados. Pelo princípio da casa dos pombos, algum estado se repetiu. Se um estado se repete, existe um CICLO. Se existe um ciclo num caminho de aceitação, podemos "bombear" esse ciclo infinitamente.'
                    },
                    {
                        type: 'theorem',
                        title: 'Teorema da Finitude',
                        content: 'Uma linguagem regular é INFINITA se, e somente se, seu AFD aceita alguma palavra w tal que:\n\nn ≤ |w| < 2n\n\n(Onde n é o número de estados). Graficamente: Se existe um ciclo acessível a partir do inicial e que consegue chegar a um estado final, a linguagem é infinita.'
                    },
                    {
                        type: 'algorithm',
                        title: 'Algoritmo de Decisão (Gráfico)',
                        content: [
                            '1. Remova estados inalcançáveis do inicial.',
                            '2. Remova estados que não alcançam nenhum final (Mortos).',
                            '3. No grafo restante, verifique se existe algum CICLO.',
                            '4. Se existir ciclo, L é INFINITA. Senão, é FINITA.'
                        ]
                    },
                    {
                        type: 'example',
                        title: 'Detectando o Infinito',
                        content: 'O ciclo em q1 (com "b") permite bombear "b" infinitamente (abb, abbb...). Logo, é infinita.',
                        automatoRef: ex_Linguagem_Infinita
                    }
                ]
            },
            {
                id: 'l5-equal',
                title: 'Problema da Equivalência (L1 = L2?)',
                description: 'Como provar que dois autômatos aceitam a mesma linguagem.',
                content: [
                    {
                        type: 'text',
                        content: 'Não podemos comparar os grafos visualmente, pois autômatos diferentes podem fazer a mesma coisa. Precisamos de invariantes matemáticos.'
                    },
                    {
                        type: 'theorem',
                        title: 'Teorema da Unicidade do AFD Mínimo',
                        content: 'Para qualquer linguagem regular L, existe um ÚNICO (a menos de isomorfismo) AFD mínimo que a aceita. Isso significa que se minimizarmos dois autômatos equivalentes, o resultado estrutural será IDÊNTICO.'
                    },
                    {
                        type: 'algorithm',
                        title: 'Algoritmo de Equivalência',
                        content: [
                            'Opção A (Via Minimização - Recomendado P1):',
                            '1. Minimize M1. Minimize M2.',
                            '2. Verifique se os grafos resultantes são isomorfos (têm a mesma forma e conexões, ignorando nomes).',
                            ' ',
                            'Opção B (Via Propriedades de Fechamento):',
                            '1. Construa a Diferença Simétrica: L3 = (L1 ∩ L2̅) ∪ (L1̅ ∩ L2).',
                            '2. Teste se L3 é VAZIA. Se for vazia, então L1 = L2.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'mod6_p2',
        title: '[MATÉRIA P2] Gramáticas e Transdutores',
        lessons: [
            {
                id: 'l6-warning',
                title: 'Aviso sobre P2',
                description: 'Este conteúdo não cai na prova do dia 24/11.',
                content: [
                    {
                        type: 'note',
                        title: 'Foco na P1',
                        content: 'Gramáticas Regulares (GR), Máquinas de Moore/Mealy, Autômatos de Pilha e o Lema do Bombeamento formal são tópicos da **P2 (12/01)**. Concentre-se nos módulos anteriores para garantir sua nota na P1!'
                    },
                    {
                        type: 'example',
                        title: 'Visualização de GR (Apenas Curiosidade)',
                        content: 'Isto é uma Gramática Regular visualizada como autômato. Estude isso em Janeiro.',
                        automatoRef: ex_GR_LinearDireita
                    }
                ]
            }
        ]
    }
];