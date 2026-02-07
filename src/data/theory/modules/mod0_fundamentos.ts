import type { CourseModule } from '../../../types';

export const mod0: CourseModule = {
    id: 'mod0',
    title: 'Módulo 0: Fundamentos (A Base)',
    lessons: [
        {
            id: 'l0-intro',
            title: 'Alfabetos e Linguagens',
            description: 'Antes de desenhar automatos, precisamos definir a entrada.',
            content: [
                {
                    type: 'text',
                    content: 'Bem-vindos a LFA! Estudamos a sintaxe da computação e como descrever linguagens de forma precisa.'
                },
                {
                    type: 'definition',
                    title: 'Simbolo',
                    content: 'Entidade abstrata básica, não definida formalmente. É o “átomo” a partir do qual palavras e linguagens são formadas.'
                },
                {
                    type: 'list',
                    title: 'Três abordagens de estudo (Blauth)',
                    content: [
                        'Operacional (reconhecedor): automatos finitos, de pilha e de Turing.',
                        'Axiomática (gerador): gramáticas.',
                        'Denotacional/funcional: expressões regulares.'
                    ]
                },
                {
                    type: 'definition',
                    title: 'Conceitos básicos',
                    content: '1. **Alfabeto (Σ):** conjunto finito de simbolos (pode ser vazio).\n2. **Palavra/cadeia (w):** sequência finita de simbolos de Σ.\n3. **Linguagem formal (L):** conjunto de palavras sobre um alfabeto.'
                },
                {
                    type: 'math-tip',
                    title: 'Universo (Σ*) e vazio (ε)',
                    content: '• **ε:** palavra vazia (|ε| = 0).\n• **Σ*:** conjunto de TODAS as palavras sobre Σ.\n• **∅:** conjunto vazio (linguagem sem palavras).\n\nCuidado: {ε} ≠ ∅. O primeiro tem uma palavra (vazia), o segundo não tem nenhuma.'
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
                    content: 'Linguagens infinitas aparecem com frequência. Exemplo clássico: o conjunto de palíndromos sobre {a, b}.'
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
                        'Subpalavra (subcadeia): sequência contígua de simbolos em w.'
                    ]
                },
                {
                    type: 'note',
                    title: 'Leitura correta',
                    content: 'Ao escrever L = { w ∈ Σ* | ... }, explicite o alfabeto e o critério de aceitação.'
                }
            ]
        },
        {
            id: 'l0-matematica',
            title: 'Conjuntos, Relações e Funções',
            description: 'Ferramentas de matemática discreta usadas em LFA.',
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
                    content: 'Uma função f: A → B é **total** se está definida para todo a ∈ A. É **parcial** quando pode faltar valor para alguns elementos. Em automatos, a função programa δ é parcial.'
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
            description: 'Como argumentar com rigor matemático.',
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
            description: 'União, concatenação, fecho e potência.',
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
            description: 'A mesma linguagem, formas diferentes.',
            content: [
                {
                    type: 'text',
                    content: 'Uma linguagem pode ser descrita por enumeração, por propriedade, por gramática, por expressão regular ou por automato. Em LFA provamos equivalências entre essas formas.'
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
                        'Escreva em forma de conjunto a linguagem das palavras com exatamente dois simbolos a.',
                        'Transforme uma definição por propriedade em ER (quando possível).'
                    ]
                },
                {
                    type: 'definition',
                    title: 'Formas equivalentes',
                    content: 'Enumeração, propriedade, ER, gramática regular e automato podem descrever a mesma linguagem.'
                },
                {
                    type: 'text',
                    content: 'Exemplo: L = { w ∈ {0,1}* | w termina em 01 } = (0+1)*01.'
                }
            ]
        },
        {
            id: 'l0-glossario',
            title: 'Glossário de simbolos (Blauth)',
            description: 'Notações essenciais usadas no livro.',
            content: [
                {
                    type: 'math-tip',
                    title: 'Tabela resumida',
                    content: '• Σ: alfabeto de entrada.\n• Σ*: todas as palavras sobre Σ.\n• ε: palavra vazia (|ε| = 0).\n• ∅: conjunto vazio.\n• |w|: comprimento da palavra w.\n• 2^A: conjunto das partes de A.\n• δ: função programa (transicao).\n• δ̂: função programa estendida.\n• ⇒, ⇒+: derivação (um ou mais passos).\n• L(G) = { w ∈ T* | S ⇒+ w }.\n• w^n: concatenação sucessiva.'
                }
            ]
        }
    ]
};

