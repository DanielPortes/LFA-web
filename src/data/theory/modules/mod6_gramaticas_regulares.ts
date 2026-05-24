import type { CourseModule } from '../../../types';
import { createLessonReference } from '../../bibliography';

const blauthCap2 = createLessonReference('blauth', 'Cap. 2');

export const mod6: CourseModule = {
    id: 'mod6',
    title: 'Módulo 6: Gramáticas Regulares',
    lessons: [
        {
            id: 'l6-intro',
            title: 'Gramáticas Lineares e Regulares',
            description: 'A representação axiomática das linguagens regulares no livro.',
            objectives: [
                { id: 'l6-intro-obj-1', text: 'Distinguir gramática linear à direita, à esquerda e versões unitárias.' },
                { id: 'l6-intro-obj-2', text: 'Ler gramáticas regulares como formalismo gerador equivalente a autômatos finitos.' }
            ],
            prerequisites: [
                'Gramáticas formais.',
                'Linguagens regulares.',
                'Autômatos finitos.'
            ],
            keywords: ['gramática regular', 'linear à direita', 'linear à esquerda', 'tipo 3'],
            estimatedMinutes: 22,
            references: [blauthCap2],
            summary: [
                { id: 'l6-intro-sum-1', text: 'Uma gramática regular é uma gramática linear.' },
                { id: 'l6-intro-sum-2', text: 'A variável, quando aparece no lado direito, fica sempre em uma extremidade da produção.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-05-24',
            content: [
                {
                    type: 'text',
                    content: 'O livro introduz gramáticas regulares depois de apresentar autômatos finitos e expressões regulares. A intenção é mostrar a terceira leitura da mesma classe: autômatos reconhecem, expressões denotam e gramáticas geram.'
                },
                {
                    type: 'definition',
                    title: 'Gramáticas lineares',
                    content: 'Em uma gramática linear, o lado direito de cada produção contém no máximo uma variável. Se essa variável aparece sempre à direita dos terminais, a gramática é linear à direita; se aparece sempre à esquerda, é linear à esquerda.'
                },
                {
                    type: 'list',
                    title: 'Formas usadas no livro',
                    content: [
                        'GLD: produções do tipo A -> wB ou A -> w.',
                        'GLE: produções do tipo A -> Bw ou A -> w.',
                        'GLUD: versão linear unitária à direita, com w de tamanho no máximo 1.',
                        'GLUE: versão linear unitária à esquerda, também com w de tamanho no máximo 1.'
                    ]
                },
                {
                    type: 'definition',
                    title: 'Gramática regular',
                    content: 'Uma gramática regular é qualquer gramática linear. A linguagem gerada por uma gramática regular G é denotada por L(G) ou GERA(G).'
                },
                {
                    type: 'example',
                    title: 'Exemplo: a(ba)*',
                    content: 'Uma forma linear à direita para a linguagem a(ba)* usa S -> aA e A -> baA | ε. A cada passo, a variável permanece na extremidade direita, mantendo a gramática dentro da classe regular.'
                }
            ]
        },
        {
            id: 'l6-equivalencia',
            title: 'Equivalência com Autômatos Finitos',
            description: 'Como transformar gramáticas regulares em autômatos finitos e autômatos em gramáticas.',
            objectives: [
                { id: 'l6-eq-obj-1', text: 'Construir um AF a partir de uma gramática regular unitária à direita.' },
                { id: 'l6-eq-obj-2', text: 'Construir uma gramática regular a partir de um AFD.' }
            ],
            prerequisites: [
                'Gramáticas lineares.',
                'AFD e função programa.',
                'Derivação.'
            ],
            keywords: ['equivalência', 'AF', 'gramática regular', 'construção'],
            estimatedMinutes: 24,
            references: [blauthCap2],
            summary: [
                { id: 'l6-eq-sum-1', text: 'Toda linguagem gerada por gramática regular é reconhecida por algum autômato finito.' },
                { id: 'l6-eq-sum-2', text: 'Toda linguagem regular pode ser gerada por alguma gramática regular.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-05-24',
            content: [
                {
                    type: 'algorithm',
                    title: 'Gramática regular para AF',
                    content: [
                        'Use as variáveis como estados do autômato.',
                        'Adicione um estado final qf quando uma produção gerar apenas terminal ou ε.',
                        'Para A -> aB, crie transição de A para B rotulada por a.',
                        'Para A -> a, crie transição de A para qf rotulada por a.'
                    ]
                },
                {
                    type: 'algorithm',
                    title: 'AFD para gramática regular',
                    content: [
                        'Crie uma variável para cada estado do AFD.',
                        'Crie uma produção inicial que leva ao estado inicial.',
                        'Para cada transição δ(qi, a) = qk, crie qi -> a qk.',
                        'Para cada estado final qf, adicione qf -> ε.'
                    ]
                },
                {
                    type: 'note',
                    title: 'Leitura da prova',
                    content: 'As construções não são apenas receitas: elas mostram que derivar uma palavra na gramática e percorrer um caminho no autômato são duas descrições do mesmo fenômeno.'
                },
                {
                    type: 'checkpoint',
                    title: 'Conservação da linguagem',
                    content: 'Ao converter, confira sempre se o símbolo inicial e as condições de parada foram preservados. Erros nesses dois pontos mudam a linguagem mesmo quando as transições parecem corretas.'
                }
            ]
        }
    ]
};
