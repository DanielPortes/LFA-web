import type { CourseModule } from '../../../types';
import { createLessonReference } from '../../bibliography';

const blauthCap1 = createLessonReference('blauth', 'Cap. 1');
const blauthCap2 = createLessonReference('blauth', 'Cap. 2');

export const mod0: CourseModule = {
    id: 'mod0',
    title: 'Módulo 0: Fundamentos (A Base)',
    lessons: [
        {
            id: 'l0-intro',
            title: 'Alfabetos e Linguagens',
            description: 'Antes de desenhar autômatos, precisamos definir a entrada e a linguagem com precisão.',
            objectives: [
                { id: 'l0-intro-obj-1', text: 'Distinguir alfabeto, palavra e linguagem formal.' },
                { id: 'l0-intro-obj-2', text: 'Interpretar corretamente ε, Σ* e ∅ em definições e provas.' },
                { id: 'l0-intro-obj-3', text: 'Ler descrições formais do tipo L = { w ∈ Σ* | ... }.' }
            ],
            prerequisites: [
                'Leitura básica de conjuntos e notação matemática elementar.'
            ],
            keywords: ['alfabeto', 'palavra', 'linguagem', 'Σ*', 'ε', '∅'],
            estimatedMinutes: 28,
            references: [blauthCap1],
            commonMistakes: [
                {
                    title: 'Confundir ε, {ε} e ∅',
                    explanation: 'ε é uma palavra, {ε} é uma linguagem com uma única palavra e ∅ é a linguagem vazia.',
                    correction: 'Sempre pergunte se o objeto em questão é símbolo, palavra ou conjunto de palavras.'
                }
            ],
            summary: [
                { id: 'l0-intro-sum-1', text: 'Linguagens são conjuntos de palavras sobre um alfabeto.' },
                { id: 'l0-intro-sum-2', text: 'Σ* representa todas as palavras finitas possíveis sobre Σ.' },
                { id: 'l0-intro-sum-3', text: 'A distinção entre ε, {ε} e ∅ é central em toda a disciplina.' }
            ],
            status: 'canonical',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-04-15',
            content: [
                {
                    type: 'text',
                    content: 'Linguagens Formais e Autômatos começam com uma pergunta simples: como descrever, sem ambiguidade, quais sequências de símbolos pertencem a uma linguagem? Em computação, essa pergunta aparece quando um compilador precisa reconhecer identificadores, quando uma ferramenta de busca interpreta um padrão, quando um protocolo decide se uma mensagem está bem formada ou quando um analisador sintático confere a estrutura de um programa.\n\nNesta disciplina, a palavra "linguagem" não é usada no sentido cotidiano de português, inglês ou comunicação humana. O foco é a **sintaxe**: a forma das palavras, a ordem dos símbolos e as regras que dizem o que pode ou não aparecer. A semântica, isto é, o significado dessas palavras, pode existir depois, mas aqui primeiro precisamos dominar a forma.'
                },
                {
                    type: 'definition',
                    title: 'Símbolo',
                    content: 'Entidade abstrata básica, não definida formalmente. É o “átomo” a partir do qual palavras e linguagens são formadas.'
                },
                {
                    type: 'text',
                    content: 'Pense em um símbolo como uma marca indivisível para o problema atual. Em um curso de compiladores, `a` pode ser uma letra, `id` pode ser um token inteiro e `+` pode ser um operador. A escolha do nível de detalhe depende do modelo que queremos estudar. Depois de escolher os símbolos, formamos palavras colocando esses símbolos em sequência finita; depois, uma linguagem é apenas um conjunto dessas palavras.'
                },
                {
                    type: 'list',
                    title: 'Três abordagens de estudo (Blauth)',
                    content: [
                        'Operacional (reconhecedor): autômatos finitos, de pilha e de Turing.',
                        'Axiomática (gerador): gramáticas.',
                        'Denotacional/funcional: expressões regulares.'
                    ]
                },
                {
                    type: 'definition',
                    title: 'Conceitos básicos',
                    content: '1. **Alfabeto (Σ):** conjunto finito de símbolos (pode ser vazio).\n2. **Palavra/cadeia (w):** sequência finita de símbolos de Σ.\n3. **Linguagem formal (L):** conjunto de palavras sobre um alfabeto.'
                },
                {
                    type: 'text',
                    content: 'A notação `L = { w ∈ Σ* | condição sobre w }` deve ser lida em duas partes. Antes da barra vertical está o universo de busca: palavras finitas construídas com símbolos de `Σ`. Depois da barra vem o filtro: a propriedade que decide se a palavra entra ou não na linguagem. Essa leitura evita um erro comum: tentar desenhar um autômato antes de saber exatamente qual propriedade ele precisa lembrar.'
                },
                {
                    type: 'math-tip',
                    title: 'Universo (Σ*) e vazio (ε)',
                    content: '• **ε:** palavra vazia (|ε| = 0).\n• **Σ*:** conjunto de TODAS as palavras sobre Σ.\n• **∅:** conjunto vazio (linguagem sem palavras).\n\nCuidado: {ε} ≠ ∅. O primeiro tem uma palavra (vazia), o segundo não tem nenhuma.'
                },
                {
                    type: 'example',
                    title: 'Exemplo de leitura: palavras com aa ou bb',
                    content: 'Se `Σ = {a, b}` e `L = { w ∈ Σ* | w possui aa ou bb como subpalavra }`, então `abaa` pertence a L porque termina com `aa`; `bba` pertence porque começa com `bb`; `abab` não pertence porque alterna símbolos e nunca contém duas letras iguais consecutivas. Observe que ainda não desenhamos uma máquina: primeiro entendemos a linguagem.'
                },
                {
                    type: 'definition',
                    title: 'Conjunto das partes (2^A)',
                    content: '2^A é o conjunto de todos os subconjuntos de A. Essa notação é usada, por exemplo, no contradomínio de δ em AFNs: δ: Q × Σ → 2^Q.'
                },
                {
                    type: 'note',
                    title: 'Linguagens além de cadeias',
                    content: 'A teoria moderna também trata linguagens planares, espaciais e n-dimensionais, indo além de cadeias unidimensionais.'
                },
                {
                    type: 'text',
                    content: 'Linguagens infinitas aparecem com frequência. O conjunto de todas as palavras sobre `{a, b}` é infinito, mesmo que o alfabeto tenha apenas dois símbolos. O conjunto dos palíndromos sobre `{a, b}` também é infinito: `ε`, `a`, `b`, `aa`, `bb`, `aba`, `abba` e assim por diante. A diferença é que `Σ*` aceita tudo; palíndromos aceitam apenas palavras que podem ser lidas igualmente da esquerda para a direita e da direita para a esquerda.'
                },
                {
                    type: 'definition',
                    title: 'Teorema e lema',
                    content: '• **Teorema:** proposição do tipo p → q cuja verdade é demonstrada.\n• **Lema:** teorema auxiliar com resultado útil para provar outro.'
                },
                {
                    type: 'list',
                    title: 'Vocabulário básico',
                    content: [
                        'Prefixo: x é prefixo de w se w = xy.',
                        'Sufixo: y é sufixo de w se w = xy.',
                        'Subpalavra (subcadeia): sequência contígua de símbolos em w.'
                    ]
                },
                {
                    type: 'note',
                    title: 'Leitura correta',
                    content: 'Ao escrever L = { w ∈ Σ* | ... }, explicite o alfabeto e o critério de aceitação.'
                },
                {
                    type: 'summary',
                    title: 'Como estudar esta trilha',
                    content: 'Leia cada definição procurando o objeto matemático envolvido: símbolo, palavra, linguagem, gramática ou máquina. Depois, tente produzir três palavras aceitas e três rejeitadas antes de usar o simulador. Esse hábito transforma a Trilha em um livro interativo: a máquina confirma uma hipótese que você já formulou.'
                }
            ]
        },
        {
            id: 'l0-matematica',
            title: 'Conjuntos, Relações e Funções',
            description: 'Ferramentas de matemática discreta usadas em LFA.',
            objectives: [
                { id: 'l0-mat-obj-1', text: 'Reconhecer relações de equivalência e de ordem em exemplos formais.' },
                { id: 'l0-mat-obj-2', text: 'Distinguir funções totais e parciais em definições de máquinas.' }
            ],
            prerequisites: [
                'Noções básicas de conjuntos e operações elementares.'
            ],
            keywords: ['relação', 'equivalência', 'ordem', 'função total', 'função parcial'],
            estimatedMinutes: 14,
            references: [blauthCap1],
            commonMistakes: [
                {
                    title: 'Ler toda função como total',
                    explanation: 'Em LFA, o tipo da função não basta para dizer se ela está definida em todos os pontos do domínio.',
                    correction: 'Verifique explicitamente se a definição exige totalidade ou se permite omissões.'
                }
            ],
            summary: [
                { id: 'l0-mat-sum-1', text: 'Relações de equivalência particionam conjuntos em classes.' },
                { id: 'l0-mat-sum-2', text: 'Ordens parciais e totais modelam comparabilidade entre elementos.' },
                { id: 'l0-mat-sum-3', text: 'Funções totais e parciais reaparecem nas definições de transição.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-04-15',
            content: [
                {
                    type: 'definition',
                    title: 'Relação de ordem',
                    content: 'Uma relação ≤ em A é uma ordem parcial se é **reflexiva**, **antissimétrica** e **transitiva**. Se todo par de elementos é comparável, a ordem é total.'
                },
                {
                    type: 'definition',
                    title: 'Relação de equivalência',
                    content: 'Uma relação ~ em A é uma equivalência se é **reflexiva**, **simétrica** e **transitiva**. Ela particiona A em classes de equivalência.'
                },
                {
                    type: 'definition',
                    title: 'Função parcial vs. total',
                    content: 'Uma função f: A → B é **total** se está definida para todo a ∈ A. É **parcial** quando pode faltar valor para alguns elementos. Em autômatos, a função programa δ pode ser total ou parcial, dependendo do modelo e da convenção adotada.'
                },
                {
                    type: 'math-tip',
                    title: 'Cardinalidade',
                    content: '• |A| indica o número de elementos de A.\n• Conjuntos finitos têm |A| ∈ ℕ.\n• Conjuntos infinitos não possuem cardinal finito.\n• ℵ₀ (alef-zero) é o cardinal de ℕ.'
                }
            ]
        },
        {
            id: 'l0-logica',
            title: 'Lógica e Demonstrações',
            description: 'Como argumentar com rigor matemático em definições, construções e provas.',
            objectives: [
                { id: 'l0-log-obj-1', text: 'Identificar proposições, conectivos e estruturas de implicação.' },
                { id: 'l0-log-obj-2', text: 'Escolher entre prova direta, contraposição, absurdo e indução.' }
            ],
            prerequisites: [
                'Leitura de proposições e símbolos lógicos básicos.'
            ],
            keywords: ['proposição', 'implicação', 'contraposição', 'absurdo', 'indução'],
            estimatedMinutes: 13,
            references: [blauthCap2],
            commonMistakes: [
                {
                    title: 'Escolher a técnica de prova sem olhar a estrutura do problema',
                    explanation: 'Muitos erros vêm de tentar indução quando a propriedade pede contraposição, ou absurdo quando basta construção direta.',
                    correction: 'Pergunte primeiro qual objeto varia: palavra, derivação, máquina ou hipótese lógica.'
                }
            ],
            summary: [
                { id: 'l0-log-sum-1', text: 'A forma lógica da afirmação ajuda a escolher a estratégia de prova.' },
                { id: 'l0-log-sum-2', text: 'Indução é especialmente frequente em comprimento de palavras e número de passos.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-04-15',
            content: [
                {
                    type: 'list',
                    title: 'Conceitos básicos',
                    content: [
                        'Proposição: enunciado que pode ser verdadeiro ou falso.',
                        'Tautologia: proposição sempre verdadeira.',
                        'Contradição: proposição sempre falsa.'
                    ]
                },
                {
                    type: 'list',
                    title: 'Conectivos lógicos',
                    content: [
                        '¬ (negação), ∧ (conjunção), ∨ (disjunção).',
                        '→ (implicação), ↔ (bicondicional).'
                    ]
                },
                {
                    type: 'list',
                    title: 'Técnicas de demonstração (Blauth)',
                    content: [
                        'Prova direta: assume as hipóteses e deriva a tese.',
                        'Contraposição: prova ¬q → ¬p para concluir p → q.',
                        'Redução ao absurdo: supõe o contrário e obtém contradição.',
                        'Indução matemática: base, hipótese indutiva e passo indutivo.'
                    ]
                }
            ]
        },
        {
            id: 'l0-operacoes',
            title: 'Operações com Linguagens',
            description: 'União, concatenação, fecho e potência como ferramentas de construção.',
            objectives: [
                { id: 'l0-op-obj-1', text: 'Calcular manualmente concatenações, uniões e potências de linguagens pequenas.' },
                { id: 'l0-op-obj-2', text: 'Distinguir operações sobre palavras de operações sobre linguagens.' }
            ],
            prerequisites: [
                'Alfabetos, palavras e linguagem formal.',
                'Noções básicas de conjuntos.'
            ],
            keywords: ['união', 'concatenação', 'fecho de Kleene', 'potência', 'L*'],
            estimatedMinutes: 16,
            references: [blauthCap1],
            commonMistakes: [
                {
                    title: 'Assumir que concatenação é comutativa',
                    explanation: 'L1L2 e L2L1 costumam gerar conjuntos diferentes porque a ordem das palavras importa.',
                    correction: 'Monte exemplos pequenos e compare explicitamente os resultados.'
                }
            ],
            summary: [
                { id: 'l0-op-sum-1', text: 'Operações em linguagens geram novas linguagens sobre o mesmo ou sobre alfabetos compatíveis.' },
                { id: 'l0-op-sum-2', text: 'L* sempre contém ε e concatenação não é comutativa.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-04-15',
            content: [
                {
                    type: 'definition',
                    title: 'Operações',
                    content: 'L1 ∪ L2, L1 ∩ L2, L1 − L2, L1·L2 (concatenação), L* (fecho) e L^k (potência).'
                },
                {
                    type: 'text',
                    content: 'Exemplo: L1 = {a, ab} e L2 = {b, bb}. Então L1·L2 = {ab, abb, abbb}.'
                },
                {
                    type: 'list',
                    title: 'Propriedades úteis',
                    content: [
                        'Concatenação não é comutativa.',
                        'L* sempre contém ε.',
                        'L1·(L2 ∪ L3) = L1·L2 ∪ L1·L3.'
                    ]
                },
                {
                    type: 'definition',
                    title: 'Concatenação sucessiva (w^n)',
                    content: 'Definição indutiva:\n• w^0 = ε (se w ≠ ε).\n• w^n = w^{n-1}w, para n > 0.\n\nNota técnica: w^n é indefinida quando w = ε e n = 0.'
                },
                {
                    type: 'note',
                    title: 'Dica',
                    content: 'Antes de operar, confira se os alfabetos são compatíveis.'
                }
            ]
        },
        {
            id: 'l0-representacao',
            title: 'Representações de Linguagens',
            description: 'A mesma linguagem pode ser descrita por propriedade, gramática, expressão regular ou autômato.',
            objectives: [
                { id: 'l0-rep-obj-1', text: 'Relacionar diferentes representações para a mesma linguagem.' },
                { id: 'l0-rep-obj-2', text: 'Preparar a transição para autômatos, gramáticas e expressões regulares.' }
            ],
            prerequisites: [
                'Alfabetos, palavras e operações com linguagens.'
            ],
            keywords: ['representação', 'propriedade', 'ER', 'autômato', 'gramática'],
            estimatedMinutes: 12,
            references: [blauthCap1],
            commonMistakes: [
                {
                    title: 'Tratar representação e linguagem como se fossem o mesmo objeto',
                    explanation: 'ER, autômatos e gramáticas são descrições; a linguagem é o conjunto abstrato de palavras.',
                    correction: 'Ao comparar modelos, pergunte sempre qual linguagem cada um denota ou reconhece.'
                }
            ],
            summary: [
                { id: 'l0-rep-sum-1', text: 'Linguagens equivalentes podem ter representações muito diferentes.' },
                { id: 'l0-rep-sum-2', text: 'Boa parte de LFA consiste em provar equivalência entre representações.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-04-15',
            content: [
                {
                    type: 'text',
                    content: 'Uma linguagem pode ser descrita por enumeração, por propriedade, por gramática, por expressão regular ou por autômato. Em LFA provamos equivalências entre essas formas.'
                },
                {
                    type: 'note',
                    title: 'Dica de estudo',
                    content: 'Escreva a mesma linguagem em pelo menos duas representações diferentes.'
                },
                {
                    type: 'list',
                    title: 'Exercícios propostos',
                    content: [
                        'Descreva por propriedade a linguagem dos binários divisíveis por 4.',
                        'Escreva em forma de conjunto a linguagem das palavras com exatamente dois símbolos a.',
                        'Transforme uma definição por propriedade em ER (quando possível).'
                    ]
                },
                {
                    type: 'definition',
                    title: 'Formas equivalentes',
                    content: 'Enumeração, propriedade, ER, gramática regular e autômato podem descrever a mesma linguagem.'
                },
                {
                    type: 'text',
                    content: 'Exemplo: L = { w ∈ {0,1}* | w termina em 01 } = (0+1)*01.'
                }
            ]
        },
        {
            id: 'l0-glossario',
            title: 'Glossário de símbolos (Blauth)',
            description: 'Notações essenciais usadas ao longo de toda a trilha.',
            objectives: [
                { id: 'l0-glo-obj-1', text: 'Reconhecer rapidamente a notação recorrente em autômatos, gramáticas e provas.' }
            ],
            prerequisites: [
                'Noções básicas de leitura formal.'
            ],
            keywords: ['δ', 'δ̂', 'Σ*', '⇒', '2^A', 'glossário'],
            estimatedMinutes: 8,
            references: [blauthCap1],
            summary: [
                { id: 'l0-glo-sum-1', text: 'Consultar a notação antes de avançar evita erros conceituais desnecessários.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-04-15',
            content: [
                {
                    type: 'math-tip',
                    title: 'Tabela resumida',
                    content: '• Σ: alfabeto de entrada.\n• Σ*: todas as palavras sobre Σ.\n• ε: palavra vazia (|ε| = 0).\n• ∅: conjunto vazio.\n• |w|: comprimento da palavra w.\n• 2^A: conjunto das partes de A.\n• δ: função programa (transição).\n• δ̂: função programa estendida.\n• ⇒, ⇒+: derivação (um ou mais passos).\n• L(G) = { w ∈ T* | S ⇒+ w }.\n• w^n: concatenação sucessiva.'
                }
            ]
        }
    ]
};
