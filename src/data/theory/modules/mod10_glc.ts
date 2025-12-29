import type { CourseModule } from '../../../types';

export const mod10: CourseModule = {
    id: 'mod10',
    title: 'Modulo 10: Gramaticas Livres de Contexto',
    lessons: [
        {
            id: 'l10-def',
            title: 'Definicao de GLC',
            description: 'Variaveis, terminais e producoes.',
            content: [
                {
                    type: 'definition',
                    title: 'GLC',
                    content: 'Uma GLC e uma 4-tupla G = (V, T, P, S), onde V sao variaveis, T sao terminais (V inter T = vazio), P sao producoes e S e o simbolo inicial.\n\nEm uma GLC, o lado esquerdo de cada producao tem exatamente uma variavel.'
                },
                {
                    type: 'definition',
                    title: 'Producoes e linguagem gerada',
                    content: 'Usamos A -> beta para escrever producoes. A linguagem gerada e L(G) = { w em T* | S =>* w }.'
                },
                {
                    type: 'list',
                    title: 'Intuicao',
                    content: [
                        'Variaveis representam estruturas em construcao.',
                        'Producoes substituem variaveis por cadeias.',
                        'Cadeias finais sao feitas apenas de terminais.'
                    ]
                },
                {
                    type: 'interactive-grammar',
                    title: 'Visualização Interativa: a^n b^n',
                    content: 'Experimente a derivação da palavra "aabb" na gramática S -> aSb | ε. Use os controles abaixo para ver a árvore crescer passo a passo.',
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
            title: 'Derivacoes e arvores',
            description: 'Como acompanhar a geracao de palavras.',
            content: [
                {
                    type: 'algorithm',
                    title: 'Derivacao a esquerda (exemplo)',
                    content: [
                        'S => a S b',
                        '=> a a S b b',
                        '=> a a b b'
                    ]
                },
                {
                    type: 'algorithm',
                    title: 'Derivacao a direita (exemplo)',
                    content: [
                        'S => a S b',
                        '=> a S b b',
                        '=> a a b b'
                    ]
                },
                {
                    type: 'note',
                    title: 'Arvore de derivacao',
                    content: 'A arvore mostra como cada variavel e expandida.\n- Raiz: simbolo inicial.\n- Nodos internos: variaveis.\n- Folhas: terminais ou eps.'
                },
                {
                    type: 'warning',
                    title: 'Ambiguidade',
                    content: 'Uma gramatica e ambigua se uma palavra possui duas arvores distintas. Exemplo: S -> S S | a gera "aa" de duas formas.'
                }
            ]
        },
        {
            id: 'l10-transform',
            title: 'Transformacoes e formas normais',
            description: 'Eliminacoes, CNF e GNF aplicadas.',
            content: [
                {
                    type: 'list',
                    title: 'Remocao de producoes eps',
                    content: [
                        'Encontre variaveis anulaveis (que geram eps).',
                        'Para cada producao, gere combinacoes removendo anulaveis.',
                        'Se o simbolo inicial for anulavel, crie S0 -> S | eps.'
                    ]
                },
                {
                    type: 'list',
                    title: 'Remocao de unitarias',
                    content: [
                        'Encontre pares A =>* B onde ambos sao variaveis.',
                        'Para cada par A -> B, copie todas as producoes nao-unitarias de B para A.',
                        'Remova producoes do tipo A -> B.'
                    ]
                },
                {
                    type: 'list',
                    title: 'Remocao de simbolos inuteis',
                    content: [
                        'Remova variaveis que nao geram cadeias de terminais (nao geradoras).',
                        'Remova variaveis e producoes nao alcancaveis a partir de S.'
                    ]
                },
                {
                    type: 'algorithm',
                    title: 'CNF (Chomsky) - passos',
                    content: [
                        '1) Garanta S nao aparece no lado direito (crie S0 -> S).',
                        '2) Elimine eps e unitarias.',
                        '3) Substitua terminais em producoes longas por novas variaveis (A -> a).',
                        '4) Binarize producoes: A -> B C.'
                    ]
                },
                {
                    type: 'algorithm',
                    title: 'GNF (Greibach) - passos',
                    content: [
                        '1) Ordene as variaveis.',
                        '2) Substitua producoes que iniciam com variavel pela expansao dela.',
                        '3) Elimine recursao a esquerda, se necessario.',
                        '4) Garanta A -> a alpha, com a terminal e alpha possivelmente vazia.'
                    ]
                },
                {
                    type: 'math-tip',
                    title: 'Por que usar CNF/GNF?',
                    content: 'CNF facilita o algoritmo CYK de pertencimento. GNF facilita derivacoes top-down e provas por inducoes estruturais.'
                }
            ]
        }
    ]
};
