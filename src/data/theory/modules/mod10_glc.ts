import type { CourseModule } from '../../../types';
import { createLessonReference } from '../../bibliography';

const blauthCap3 = createLessonReference('blauth', 'Cap. 3');

export const mod10: CourseModule = {
    id: 'mod10',
    title: 'Módulo 10: Linguagens Livres de Contexto',
    lessons: [
        {
            id: 'l10-def',
            title: 'Gramáticas Livres de Contexto',
            description: 'Variáveis, terminais, produções e linguagem gerada.',
            objectives: [
                { id: 'l10-def-obj-1', text: 'Ler uma GLC como 4-upla G = (V, T, P, S).' },
                { id: 'l10-def-obj-2', text: 'Distinguir variável, terminal, produção, sentença e forma sentencial.' }
            ],
            prerequisites: [
                'Gramáticas regulares.',
                'Derivação em gramáticas.',
                'Notação de linguagens.'
            ],
            keywords: ['GLC', 'variável', 'terminal', 'produção', 'sentença'],
            estimatedMinutes: 24,
            references: [blauthCap3],
            exerciseRefs: ['cfg:1'],
            summary: [
                { id: 'l10-def-sum-1', text: 'Em uma GLC, cada produção tem uma única variável no lado esquerdo.' },
                { id: 'l10-def-sum-2', text: 'A linguagem gerada contém as palavras terminais deriváveis a partir do símbolo inicial.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-05-24',
            content: [
                {
                    type: 'text',
                    content: 'O livro passa das linguagens regulares para as linguagens livres de contexto quando uma memória finita deixa de ser suficiente. A forma típica é uma estrutura com partes que podem crescer dentro de outras partes: expressões aritméticas, parênteses balanceados e linguagens como { a^n b^n | n >= 0 }.'
                },
                {
                    type: 'definition',
                    title: 'GLC',
                    content: 'Uma gramática livre de contexto é uma 4-upla G = (V, T, P, S), em que V é o conjunto de variáveis, T é o conjunto de terminais, P é o conjunto de produções e S é o símbolo inicial. Em cada produção, o lado esquerdo contém exatamente uma variável.'
                },
                {
                    type: 'definition',
                    title: 'Linguagem gerada',
                    content: 'A linguagem gerada por G é L(G) = { w em T* | S =>* w }. Ou seja, partimos de S, aplicamos produções e aceitamos apenas as cadeias finais formadas somente por terminais.'
                },
                {
                    type: 'example',
                    title: 'Exemplo: a^n b^n',
                    content: 'A gramática S -> aSb | ε gera ε, ab, aabb, aaabbb e assim por diante. Cada uso de S -> aSb cria um par correspondente; a produção S -> ε encerra a derivação.'
                },
                {
                    type: 'interactive-grammar',
                    title: 'Derivação visual: aabb',
                    content: 'A árvore abaixo mostra a palavra aabb na gramática S -> aSb | ε.',
                    grammarTreeData: {
                        symbol: 'S',
                        children: [
                            { symbol: 'a', children: [] },
                            {
                                symbol: 'S',
                                children: [
                                    { symbol: 'a', children: [] },
                                    {
                                        symbol: 'S',
                                        children: [
                                            { symbol: 'ε', children: [] }
                                        ]
                                    },
                                    { symbol: 'b', children: [] }
                                ]
                            },
                            { symbol: 'b', children: [] }
                        ]
                    }
                }
            ]
        },
        {
            id: 'l10-deriv',
            title: 'Derivações, Árvores e Ambiguidade',
            description: 'Como acompanhar a geração de palavras e quando uma gramática permite mais de uma leitura.',
            objectives: [
                { id: 'l10-der-obj-1', text: 'Comparar derivação à esquerda, derivação à direita e árvore de derivação.' },
                { id: 'l10-der-obj-2', text: 'Reconhecer ambiguidade por árvores distintas para a mesma palavra.' }
            ],
            prerequisites: [
                'Definição de GLC.',
                'Relação de derivação.'
            ],
            keywords: ['derivação', 'árvore', 'ambiguidade', 'sentença'],
            estimatedMinutes: 22,
            references: [blauthCap3],
            exerciseRefs: ['cfg:2', 'cfg:3'],
            summary: [
                { id: 'l10-der-sum-1', text: 'A árvore registra a estrutura hierárquica da derivação, independentemente da ordem de expansão.' },
                { id: 'l10-der-sum-2', text: 'Ambiguidade ocorre quando uma palavra tem duas árvores de derivação distintas.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-05-24',
            content: [
                {
                    type: 'algorithm',
                    title: 'Derivação à esquerda',
                    content: [
                        'S => a S b',
                        '=> a a S b b',
                        '=> a a b b'
                    ]
                },
                {
                    type: 'algorithm',
                    title: 'Derivação à direita',
                    content: [
                        'S => a S b',
                        '=> a S b b',
                        '=> a a b b'
                    ]
                },
                {
                    type: 'note',
                    title: 'Árvore de derivação',
                    content: 'A árvore mostra como cada variável é expandida. A raiz é o símbolo inicial, os nodos internos são variáveis e as folhas formam a palavra gerada quando lidas da esquerda para a direita.'
                },
                {
                    type: 'warning',
                    title: 'Ambiguidade',
                    content: 'Uma gramática é ambígua quando existe pelo menos uma palavra com duas árvores de derivação distintas. Em linguagens de programação, isso é grave porque a árvore normalmente determina a interpretação da frase.'
                },
                {
                    type: 'example',
                    title: 'Expressões aritméticas',
                    content: 'Uma gramática sem precedência explícita pode permitir duas leituras para a mesma expressão, como uma árvore em que a soma acontece antes da multiplicação e outra em que a multiplicação acontece antes da soma.'
                }
            ]
        },
        {
            id: 'l10-simplificacao',
            title: 'Simplificação de GLC',
            description: 'Remoção de produções vazias, unitárias e símbolos inúteis antes das formas normais.',
            objectives: [
                { id: 'l10-simp-obj-1', text: 'Remover símbolos que não contribuem para palavras terminais.' },
                { id: 'l10-simp-obj-2', text: 'Preparar uma GLC para transformações formais preservando a linguagem essencial.' }
            ],
            prerequisites: [
                'Derivações em GLC.',
                'Noção de símbolo anulável e alcançável.'
            ],
            keywords: ['simplificação', 'ε-produção', 'unitária', 'símbolo inútil'],
            estimatedMinutes: 20,
            references: [blauthCap3],
            summary: [
                { id: 'l10-simp-sum-1', text: 'Simplificar não é mudar a linguagem desejada; é remover ruído estrutural da gramática.' },
                { id: 'l10-simp-sum-2', text: 'As etapas clássicas tratam símbolos inúteis, produções vazias e produções unitárias.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-05-24',
            content: [
                {
                    type: 'algorithm',
                    title: 'Símbolos inúteis',
                    content: [
                        'Encontre variáveis que geram alguma cadeia de terminais.',
                        'Remova variáveis não geradoras e produções que dependem delas.',
                        'A partir de S, encontre símbolos alcançáveis.',
                        'Remova símbolos e produções não alcançáveis.'
                    ]
                },
                {
                    type: 'algorithm',
                    title: 'Produções vazias',
                    content: [
                        'Encontre as variáveis anuláveis, isto é, que derivam ε.',
                        'Para cada produção, gere alternativas omitindo ocorrências anuláveis quando isso preservar a estrutura.',
                        'Se o símbolo inicial gerar ε, trate esse caso separadamente com um novo inicial.'
                    ]
                },
                {
                    type: 'algorithm',
                    title: 'Produções unitárias',
                    content: [
                        'Identifique pares A =>* B formados apenas por passos unitários.',
                        'Copie para A as produções não unitárias de B.',
                        'Remova produções do tipo A -> B.'
                    ]
                },
                {
                    type: 'checkpoint',
                    title: 'Ordem importa',
                    content: 'Ao simplificar, acompanhe sempre qual linguagem deve ser preservada. Em especial, a palavra vazia precisa de cuidado quando pertence à linguagem original.'
                }
            ]
        },
        {
            id: 'l10-normal',
            title: 'Formas Normais',
            description: 'Forma Normal de Chomsky e Forma Normal de Greibach como representações disciplinadas de GLC.',
            objectives: [
                { id: 'l10-norm-obj-1', text: 'Reconhecer a forma das produções em FNC e FNG.' },
                { id: 'l10-norm-obj-2', text: 'Entender por que formas normais ajudam provas e algoritmos.' }
            ],
            prerequisites: [
                'Simplificação de GLC.',
                'Derivações e árvores.'
            ],
            keywords: ['FNC', 'FNG', 'Chomsky', 'Greibach', 'CYK'],
            estimatedMinutes: 20,
            references: [blauthCap3],
            summary: [
                { id: 'l10-norm-sum-1', text: 'Na FNC, produções ficam essencialmente em A -> BC ou A -> a.' },
                { id: 'l10-norm-sum-2', text: 'Na FNG, produções começam por um terminal, seguido de zero ou mais variáveis.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-05-24',
            content: [
                {
                    type: 'algorithm',
                    title: 'FNC: roteiro',
                    content: [
                        'Crie um novo símbolo inicial quando necessário.',
                        'Elimine produções vazias, unitárias e símbolos inúteis.',
                        'Substitua terminais em produções longas por variáveis auxiliares.',
                        'Binarize produções longas até obter regras do tipo A -> BC.'
                    ]
                },
                {
                    type: 'algorithm',
                    title: 'FNG: roteiro',
                    content: [
                        'Ordene as variáveis.',
                        'Substitua produções que começam por variável por expansões equivalentes.',
                        'Elimine recursão à esquerda quando aparecer.',
                        'Garanta produções do tipo A -> aα, em que a é terminal e α é sequência de variáveis.'
                    ]
                },
                {
                    type: 'math-tip',
                    title: 'Por que usar formas normais?',
                    content: 'A FNC facilita algoritmos de reconhecimento como CYK. A FNG dá uma estrutura previsível para derivações e é útil em provas sobre gramáticas livres de contexto.'
                }
            ]
        },
        {
            id: 'l10-propriedades',
            title: 'Propriedades das Linguagens Livres de Contexto',
            description: 'Bombeamento, fechamentos, limites e reconhecimento por algoritmos.',
            objectives: [
                { id: 'l10-prop-obj-1', text: 'Aplicar o lema do bombeamento para mostrar que uma linguagem não é livre de contexto.' },
                { id: 'l10-prop-obj-2', text: 'Distinguir fechamentos válidos de não fechamentos em LLCs.' }
            ],
            prerequisites: [
                'GLC e AP.',
                'Provas por contradição.',
                'Formas normais.'
            ],
            keywords: ['bombeamento', 'LLC', 'fechamento', 'CYK', 'Earley'],
            estimatedMinutes: 28,
            references: [blauthCap3],
            exerciseRefs: ['cfg:4'],
            summary: [
                { id: 'l10-prop-sum-1', text: 'O lema de bombeamento para LLCs bombeia dois trechos da palavra simultaneamente.' },
                { id: 'l10-prop-sum-2', text: 'LLCs têm bons algoritmos de reconhecimento, mas não preservam todos os fechamentos das regulares.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-05-24',
            content: [
                {
                    type: 'theorem',
                    title: 'Lema do bombeamento para LLC',
                    content: 'Se L é livre de contexto, existe p >= 1 tal que toda palavra w em L com |w| >= p pode ser escrita como w = u v x y z, com |vxy| <= p, |vy| >= 1, e para todo i >= 0, u v^i x y^i z pertence a L.'
                },
                {
                    type: 'example',
                    title: 'Exemplo: L = { a^n b^n c^n | n >= 0 }',
                    content: 'Escolha w = a^p b^p c^p. Como vxy tem comprimento limitado por p, os trechos bombeáveis alcançam no máximo duas regiões vizinhas. Ao bombear, o equilíbrio entre os três blocos é quebrado.'
                },
                {
                    type: 'list',
                    title: 'Fechamentos e limites',
                    content: [
                        'LLCs são fechadas por união, concatenação e estrela.',
                        'LLCs não são fechadas, em geral, por interseção nem por complemento.',
                        'A interseção de uma LLC com uma linguagem regular continua livre de contexto.'
                    ]
                },
                {
                    type: 'list',
                    title: 'Problemas de decisão',
                    content: [
                        'Pertinência pode ser decidida por algoritmos como CYK e Earley.',
                        'Vazio, finitude e infinitude também são decidíveis para GLCs.',
                        'Ambiguidade geral de GLCs não tem o mesmo comportamento simples dos problemas anteriores.'
                    ]
                },
                {
                    type: 'checkpoint',
                    title: 'Diferença para regulares',
                    content: 'No lema regular existe um único trecho bombeável. Em LLCs, dois trechos variam juntos, e a prova precisa considerar onde eles podem cair dentro da palavra.'
                }
            ]
        }
    ]
};
