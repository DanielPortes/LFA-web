import type { CourseModule } from '../../../types';

export const mod12: CourseModule = {
    id: 'mod12',
    title: 'Modulo 12: Hierarquia de Chomsky e Decidibilidade',
    lessons: [
        {
            id: 'l12-hierarquia',
            title: 'Hierarquia de Chomsky',
            description: 'Classes de linguagens e modelos.',
            content: [
                {
                    type: 'list',
                    title: 'Resumo (tipos)',
                    content: [
                        'Tipo 3: Regulares (AF / ER / gramatica linear).',
                        'Tipo 2: Livres de contexto (AP / GLC).',
                        'Tipo 1: Sensiveis ao contexto (ALL / gramatica sensivel ao contexto).',
                        'Tipo 0: Enumeraveis recursivamente (MT / gramatica irrestrita).'
                    ]
                },
                {
                    type: 'note',
                    title: 'Inclusoes proprias',
                    content: 'Regular < CFL < CSL < RE. Cada classe contem linguagens que nao pertencem a classe anterior.'
                },
                {
                    type: 'example',
                    title: 'Exemplos classicos',
                    content: 'Regular: { w | w termina em 01 }. CFL: { a^n b^n }. CSL: { a^n b^n c^n }. RE: linguagem do problema da parada.'
                }
            ]
        },
        {
            id: 'l12-tm',
            title: 'Maquinas de Turing e ALL',
            description: 'Modelo geral de computacao.',
            content: [
                {
                    type: 'definition',
                    title: 'Maquina de Turing (MT)',
                    content: 'Uma MT e uma 8-tupla M = (Sigma, Q, delta, q0, F, Gamma, START, BLANK).\n\nA fita usa alfabeto Gamma, a cabeca le e escreve, e delta decide o movimento (L, R, S).'
                },
                {
                    type: 'list',
                    title: 'Ideias-chave',
                    content: [
                        'Pode simular AFD, AP e gramaticas.',
                        'Define o conceito de algoritmo geral.',
                        'Aceitacao: a MT para em estado final.'
                    ]
                },
                {
                    type: 'definition',
                    title: 'ALL (automato linearmente limitado)',
                    content: 'E uma MT cuja cabeca nao pode sair da faixa ocupada pela palavra de entrada, delimitada por marcadores de inicio e fim.\n\nALL reconhece exatamente as linguagens sensiveis ao contexto.'
                }
            ]
        },
        {
            id: 'l12-reducoes',
            title: 'Reducao e provas de indecidibilidade',
            description: 'Ferramenta principal para limites computacionais.',
            content: [
                {
                    type: 'definition',
                    title: 'Reducao many-one (m-reducao)',
                    content: 'A linguagem A reduz a B (A <=m B) se existe uma funcao computavel f tal que x em A sse f(x) em B.'
                },
                {
                    type: 'algorithm',
                    title: 'Como provar indecidibilidade',
                    content: [
                        '1) Escolha um problema conhecido indecidivel (ex: HALT).',
                        '2) Construa uma reducao computavel para o problema alvo.',
                        '3) Mostre que um decisor do alvo implicaria um decisor do problema conhecido.',
                        '4) Conclua que o alvo e indecidivel.'
                    ]
                },
                {
                    type: 'example',
                    title: 'Ideia de reducao',
                    content: "Para mostrar que ACCEPT e indecidivel, reduzimos HALT: dado (M, w), construa M' que aceita apenas se M para em w."
                }
            ]
        },
        {
            id: 'l12-decid',
            title: 'Decidibilidade, RE vs R e Rice',
            description: 'O que pode ou nao ser resolvido.',
            content: [
                {
                    type: 'note',
                    title: 'Decidivel vs semidecidivel',
                    content: 'Decidivel (R): sempre termina com sim/nao. Semidecidivel (RE): termina apenas em instancias positivas.'
                },
                {
                    type: 'list',
                    title: 'RE vs R',
                    content: [
                        'R < RE. Existem linguagens RE que nao sao decidiveis.',
                        'Se L e RE, entao existe MT que aceita L.',
                        'Se L e decidivel, existe MT que sempre para e decide L.'
                    ]
                },
                {
                    type: 'theorem',
                    title: 'Teorema de Rice',
                    content: 'Toda propriedade nao-trivial sobre a linguagem reconhecida por uma MT e indecidivel.\n\nEx: "L(M) e vazia?", "L(M) e regular?" sao indecidiveis.'
                },
                {
                    type: 'warning',
                    title: 'Problemas indecidiveis classicos',
                    content: 'HALT (parada), ACCEPT (aceitacao), EMPTY (linguagem vazia), EQ (equivalencia de MT), PCP (Post Correspondence Problem).'
                },
                {
                    type: 'math-tip',
                    title: 'Fechamentos uteis',
                    content: 'RE e fechado por uniao e intersecao, mas nao por complemento. R e fechado por uniao, intersecao e complemento.'
                }
            ]
        }
    ]
};
