import type { CourseModule } from '../../../types';
import { createLessonReference } from '../../bibliography';
import { grafo_pacman_conclusao } from '../automataDefs';

const blauthCap4 = createLessonReference('blauth', 'Cap. 4');

export const mod12: CourseModule = {
    id: 'mod12',
    title: 'Módulo 12: Máquinas de Turing e Hierarquia de Chomsky',
    lessons: [
        {
            id: 'l12-tm',
            title: 'Máquinas de Turing',
            description: 'O modelo geral de computação usado pelo livro para discutir linguagens enumeráveis e algoritmos.',
            objectives: [
                { id: 'l12-tm-obj-1', text: 'Identificar fita, cabeçote, unidade de controle, alfabeto da fita e função de transição.' },
                { id: 'l12-tm-obj-2', text: 'Entender a Máquina de Turing como formalização de procedimento mecânico.' }
            ],
            prerequisites: [
                'Autômatos finitos.',
                'Autômatos de pilha.',
                'Gramáticas formais.'
            ],
            keywords: ['Máquina de Turing', 'fita', 'cabeçote', 'programa', 'Church'],
            estimatedMinutes: 24,
            references: [blauthCap4],
            summary: [
                { id: 'l12-tm-sum-1', text: 'A MT generaliza a ideia de autômato ao permitir leitura, escrita e movimento sobre uma fita.' },
                { id: 'l12-tm-sum-2', text: 'O modelo serve como base formal para o que chamamos de algoritmo.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-05-24',
            content: [
                {
                    type: 'text',
                    content: 'Depois de autômatos finitos e autômatos de pilha, o livro apresenta a Máquina de Turing como um modelo mais geral. A máquina tem uma fita dividida em células, uma cabeça que lê e escreve símbolos, uma unidade de controle com estados e um programa que determina a próxima ação.'
                },
                {
                    type: 'definition',
                    title: 'Estrutura da Máquina de Turing',
                    content: 'Uma MT pode ser descrita por uma tupla com alfabeto de entrada, conjunto de estados, função de transição, estado inicial, estados finais, alfabeto da fita, marcador inicial e símbolo branco. A transição indica o novo estado, o símbolo escrito e o movimento do cabeçote.'
                },
                {
                    type: 'list',
                    title: 'Componentes essenciais',
                    content: [
                        'Fita: memória de trabalho da máquina.',
                        'Cabeçote: lê o símbolo atual, escreve outro símbolo e se move.',
                        'Estados: registram a situação finita do controle.',
                        'Função programa: determina escrita, movimento e próximo estado.'
                    ]
                },
                {
                    type: 'note',
                    title: 'Hipótese de Church',
                    content: 'A motivação do livro é ligar Máquina de Turing e algoritmo: tudo que pode ser efetivamente computado por um procedimento mecânico pode ser computado por uma Máquina de Turing.'
                }
            ]
        },
        {
            id: 'l12-reducoes',
            title: 'Linguagens Recursivas e Enumeráveis',
            description: 'Classificação computacional das linguagens por Máquinas de Turing, sem introduzir tópicos externos ao livro.',
            objectives: [
                { id: 'l12-re-obj-1', text: 'Distinguir linguagem recursiva de linguagem enumerável recursivamente.' },
                { id: 'l12-re-obj-2', text: 'Entender por que aceitar e decidir são exigências diferentes.' }
            ],
            prerequisites: [
                'Máquinas de Turing.',
                'Conceito de linguagem aceita por uma máquina.'
            ],
            keywords: ['recursiva', 'enumerável recursivamente', 'decidível', 'aceitação'],
            estimatedMinutes: 22,
            references: [blauthCap4],
            summary: [
                { id: 'l12-re-sum-1', text: 'Linguagens recursivas são decididas por MTs que sempre param.' },
                { id: 'l12-re-sum-2', text: 'Linguagens enumeráveis recursivamente são aceitas por MTs, mas a máquina pode não parar nas palavras fora da linguagem.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-05-24',
            content: [
                {
                    type: 'definition',
                    title: 'Linguagem enumerável recursivamente',
                    content: 'Uma linguagem é enumerável recursivamente quando existe uma Máquina de Turing que aceita exatamente as palavras da linguagem. Para palavras que não pertencem à linguagem, a máquina pode rejeitar ou simplesmente continuar executando.'
                },
                {
                    type: 'definition',
                    title: 'Linguagem recursiva',
                    content: 'Uma linguagem é recursiva quando existe uma Máquina de Turing que decide a linguagem: para toda entrada, a máquina para e responde corretamente se a palavra pertence ou não pertence à linguagem.'
                },
                {
                    type: 'comparison',
                    title: 'Aceitar versus decidir',
                    content: [
                        'Aceitar exige parar nas palavras que pertencem à linguagem.',
                        'Decidir exige parar em todas as palavras.',
                        'Toda linguagem recursiva é enumerável recursivamente, mas o inverso não vale em geral.'
                    ]
                },
                {
                    type: 'note',
                    title: 'Intuição do limite',
                    content: 'O livro usa essa diferença para mostrar que existem linguagens fora do alcance de algoritmos decisores. A mensagem importante para a Trilha é conceitual: nem toda pergunta sobre palavras e máquinas pode ser resolvida por um algoritmo que sempre termina.'
                }
            ]
        },
        {
            id: 'l12-sensiveis',
            title: 'Gramáticas Irrestritas, Sensíveis ao Contexto e ALL',
            description: 'As classes acima das livres de contexto na hierarquia apresentada pelo livro.',
            objectives: [
                { id: 'l12-sens-obj-1', text: 'Relacionar gramáticas irrestritas a linguagens enumeráveis recursivamente.' },
                { id: 'l12-sens-obj-2', text: 'Relacionar gramáticas sensíveis ao contexto a autômatos linearmente limitados.' }
            ],
            prerequisites: [
                'Gramáticas livres de contexto.',
                'Máquinas de Turing.'
            ],
            keywords: ['gramática irrestrita', 'sensível ao contexto', 'ALL', 'tipo 0', 'tipo 1'],
            estimatedMinutes: 20,
            references: [blauthCap4],
            summary: [
                { id: 'l12-sens-sum-1', text: 'Gramáticas irrestritas correspondem ao nível mais geral da hierarquia.' },
                { id: 'l12-sens-sum-2', text: 'Gramáticas sensíveis ao contexto ficam abaixo delas e são reconhecidas por autômatos linearmente limitados.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-05-24',
            content: [
                {
                    type: 'definition',
                    title: 'Gramática irrestrita',
                    content: 'Em uma gramática irrestrita, as produções podem reescrever cadeias com variáveis de forma mais geral do que nas gramáticas livres de contexto. Esse é o formalismo gramatical associado às linguagens enumeráveis recursivamente.'
                },
                {
                    type: 'definition',
                    title: 'Gramática sensível ao contexto',
                    content: 'Uma gramática sensível ao contexto restringe as produções para não diminuir o comprimento da palavra, salvo convenções específicas para a palavra vazia. Ela descreve uma classe maior que as livres de contexto e menor que as irrestritas.'
                },
                {
                    type: 'definition',
                    title: 'Autômato linearmente limitado',
                    content: 'Um ALL é uma Máquina de Turing cuja cabeça não pode ultrapassar a região delimitada pela palavra de entrada. Ele reconhece exatamente as linguagens sensíveis ao contexto.'
                },
                {
                    type: 'example',
                    title: 'Exemplo de separação',
                    content: 'A linguagem { a^n b^n c^n | n >= 0 } não é livre de contexto, mas é sensível ao contexto. Ela exige comparar três quantidades arbitrárias, algo que uma única pilha não controla de forma suficiente.'
                }
            ]
        },
        {
            id: 'l12-hierarquia',
            title: 'Hierarquia de Chomsky',
            description: 'Organização final das classes, modelos e gramáticas trabalhadas no livro.',
            objectives: [
                { id: 'l12-h-obj-1', text: 'Localizar cada modelo de máquina na classe de linguagem correspondente.' },
                { id: 'l12-h-obj-2', text: 'Ler a hierarquia como sequência de aumento de poder expressivo.' }
            ],
            prerequisites: [
                'Linguagens regulares.',
                'Linguagens livres de contexto.',
                'Máquinas de Turing e ALL.'
            ],
            keywords: ['Chomsky', 'tipo 3', 'tipo 2', 'tipo 1', 'tipo 0'],
            estimatedMinutes: 18,
            references: [blauthCap4],
            summary: [
                { id: 'l12-h-sum-1', text: 'Tipo 3: regulares; Tipo 2: livres de contexto; Tipo 1: sensíveis ao contexto; Tipo 0: enumeráveis recursivamente.' },
                { id: 'l12-h-sum-2', text: 'Cada nível acrescenta poder expressivo e muda o modelo reconhecedor adequado.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-05-24',
            content: [
                {
                    type: 'list',
                    title: 'Classes e modelos',
                    content: [
                        'Tipo 3: linguagens regulares, expressões regulares, gramáticas regulares e autômatos finitos.',
                        'Tipo 2: linguagens livres de contexto, gramáticas livres de contexto e autômatos de pilha.',
                        'Tipo 1: linguagens sensíveis ao contexto, gramáticas sensíveis ao contexto e ALL.',
                        'Tipo 0: linguagens enumeráveis recursivamente, gramáticas irrestritas e Máquinas de Turing.'
                    ]
                },
                {
                    type: 'comparison',
                    title: 'Inclusões próprias',
                    content: [
                        'Toda linguagem regular é livre de contexto, mas nem toda livre de contexto é regular.',
                        'Toda linguagem livre de contexto é sensível ao contexto, mas nem toda sensível ao contexto é livre de contexto.',
                        'Toda linguagem sensível ao contexto é enumerável recursivamente, mas há linguagens enumeráveis recursivamente fora dela.'
                    ]
                },
                {
                    type: 'summary',
                    title: 'Fechamento conceitual do livro',
                    content: 'A Trilha termina mostrando que autômatos, gramáticas e expressões não são assuntos isolados. Eles são representações complementares de classes de linguagens, cada uma com poder, limitações e algoritmos próprios.'
                }
            ]
        },
        {
            id: 'l12-conclusoes',
            title: 'Conclusões e Linguagens Não Lineares',
            description: 'O fechamento do livro: limites da hierarquia, aplicações e a ilustração de Gramáticas de Grafos.',
            objectives: [
                { id: 'l12-conc-obj-1', text: 'Entender por que a hierarquia de Chomsky não resolve todos os interesses práticos de linguagens.' },
                { id: 'l12-conc-obj-2', text: 'Reconhecer Gramáticas de Grafos como perspectiva final apresentada pelo livro, sem tratá-las como núcleo do curso.' }
            ],
            prerequisites: [
                'Hierarquia de Chomsky.',
                'GLC, AP e linguagens sensíveis ao contexto.'
            ],
            keywords: ['conclusões', 'linguagens não lineares', 'gramáticas de grafos', 'PacMan'],
            estimatedMinutes: 18,
            references: [blauthCap4],
            summary: [
                { id: 'l12-conc-sum-1', text: 'O livro encerra discutindo limites práticos das classes estudadas.' },
                { id: 'l12-conc-sum-2', text: 'Gramáticas de Grafos aparecem como ilustração de linguagens não lineares e tema que transcende o objetivo da publicação.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-05-24',
            content: [
                {
                    type: 'text',
                    content: 'Nas conclusões, o livro retoma as quatro classes básicas e observa que a Teoria das Linguagens Formais oferece ferramentas para descrever sintaxe, processos de análise e limitações algorítmicas. Ao mesmo tempo, nem toda linguagem de programação se encaixa de forma confortável nas classes estudadas.'
                },
                {
                    type: 'list',
                    title: 'Limites práticos apontados pelo livro',
                    content: [
                        'Algumas verificações de linguagens de programação exigem memória além das livres de contexto.',
                        'O poder sensível ao contexto pode ser excessivo e pouco prático para certas tarefas.',
                        'Problemas como ambiguidade, igualdade de LLCs e tratamento de informação semântica mostram limites importantes.'
                    ]
                },
                {
                    type: 'note',
                    title: 'Linguagens não lineares',
                    content: 'O livro cita linguagens bi, tri e n-dimensionais como perspectivas futuras, com aplicações em imagens, tradução e outros domínios. Esse tema é apresentado como abertura, não como desenvolvimento completo.'
                },
                {
                    type: 'example',
                    title: 'Gramáticas de Grafos',
                    content: 'A ideia básica é análoga às gramáticas de cadeias: uma produção substitui uma estrutura por outra. A diferença é que a palavra agora pode ser um grafo, e a derivação substitui subgrafos.',
                    automatoRef: grafo_pacman_conclusao,
                    disableSimulation: true
                },
                {
                    type: 'summary',
                    title: 'Como ler esta seção',
                    content: 'Esta aula existe porque o livro termina com essa perspectiva. Ela não adiciona uma nova teoria completa à Trilha; apenas preserva o fechamento conceitual e visual do material de referência.'
                }
            ]
        }
    ]
};
