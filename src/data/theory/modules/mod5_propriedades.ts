import type { CourseModule } from '../../../types';
import { createLessonReference } from '../../bibliography';

const blauthCap2 = createLessonReference('blauth', 'Cap. 2');

export const mod5: CourseModule = {
    id: 'mod5',
    title: 'Módulo 5: Propriedades das Linguagens Regulares',
    lessons: [
        {
            id: 'l5-fechamento',
            title: 'Fechamento das Linguagens Regulares',
            description: 'Uma classe forte de linguagens não é só a que tem exemplos; é a que preserva estrutura sob operações importantes.',
            objectives: [
                { id: 'l5-fech-obj-1', text: 'Reconhecer as operações de fechamento trabalhadas para linguagens regulares.' },
                { id: 'l5-fech-obj-2', text: 'Escolher entre produto, complemento, reversão ou argumento por expressão regular.' }
            ],
            prerequisites: [
                'AFDs totais.',
                'Operações sobre linguagens.',
                'Produto de autômatos.'
            ],
            keywords: ['fechamento', 'produto', 'complemento', 'interseção', 'reverso'],
            estimatedMinutes: 18,
            references: [blauthCap2],
            summary: [
                { id: 'l5-fech-sum-1', text: 'Fechamento significa continuar dentro da classe depois de aplicar uma operação.' },
                { id: 'l5-fech-sum-2', text: 'A prova costuma exibir uma construção explícita para a linguagem resultante.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-05-24',
            content: [
                {
                    type: 'text',
                    content: 'Depois de mostrar que autômatos finitos, expressões regulares e gramáticas regulares descrevem a mesma família de linguagens, o livro estuda o comportamento dessa família sob operações. A pergunta é sempre a mesma: se começamos com linguagens regulares, o resultado continua regular?'
                },
                {
                    type: 'list',
                    title: 'Fechamentos clássicos',
                    content: [
                        'União, interseção, complemento e diferença.',
                        'Concatenação e estrela de Kleene.',
                        'Reverso.'
                    ]
                },
                {
                    type: 'algorithm',
                    title: 'Guia de prova por construção',
                    content: [
                        'Identifique qual operação está sendo aplicada.',
                        'Escolha a construção correspondente: produto, troca de finais, composição de expressões ou reversão de transições.',
                        'Explique o estado inicial e os estados finais da nova representação.',
                        'Conclua que a linguagem resultante ainda é regular.'
                    ]
                },
                {
                    type: 'comparison',
                    title: 'Produto versus complemento',
                    content: [
                        'Interseção e união costumam pedir produto cartesiano de estados.',
                        'Complemento pede AFD total e só então troca de finais por não finais.',
                        'Diferença pode ser tratada como interseção com complemento.'
                    ]
                },
                {
                    type: 'example',
                    title: 'Produto para interseção',
                    content: 'Dados AFDs M1 e M2, crie M com estados (q1, q2). O estado é final quando q1 e q2 são finais. As transições seguem M1 e M2 em paralelo.'
                },
                {
                    type: 'checkpoint',
                    title: 'Escolha a ferramenta antes de provar',
                    content: 'Se a operação envolve aceitar simultaneamente duas condições, o produto costuma ser a primeira aposta. Se envolve negar uma linguagem, a primeira pergunta é se o AFD está totalizado.'
                }
            ]
        },
        {
            id: 'l5-decisao',
            title: 'Propriedades de Decisão em Regulares',
            description: 'Problemas que podem ser resolvidos mecanicamente para AFDs, AFNs, ERs e gramáticas regulares.',
            objectives: [
                { id: 'l5-dec-obj-1', text: 'Descrever procedimentos para vazio, finitude e equivalência em linguagens regulares.' },
                { id: 'l5-dec-obj-2', text: 'Relacionar decisão a construções já estudadas, como busca em grafo e minimização.' }
            ],
            prerequisites: [
                'AFD e AFN.',
                'Fechamento por complemento e interseção.',
                'Estados alcançáveis.'
            ],
            keywords: ['decisão', 'vazio', 'finitude', 'equivalência', 'alcançabilidade'],
            estimatedMinutes: 16,
            references: [blauthCap2],
            summary: [
                { id: 'l5-dec-sum-1', text: 'Vazio e finitude podem ser verificados por propriedades do grafo do autômato.' },
                { id: 'l5-dec-sum-2', text: 'Equivalência pode ser reduzida a diferença vazia ou a minimização.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-05-24',
            content: [
                {
                    type: 'list',
                    title: 'Problemas decidíveis',
                    content: [
                        'A linguagem aceita por um autômato é vazia?',
                        'A linguagem aceita é finita ou infinita?',
                        'Duas representações regulares descrevem a mesma linguagem?',
                        'Uma palavra específica pertence à linguagem?'
                    ]
                },
                {
                    type: 'algorithm',
                    title: 'Vazio',
                    content: [
                        'Marque os estados alcançáveis a partir do inicial.',
                        'Verifique se algum estado final é alcançável.',
                        'Se nenhum final for alcançável, a linguagem é vazia.'
                    ]
                },
                {
                    type: 'algorithm',
                    title: 'Finitude',
                    content: [
                        'Restrinja a análise aos estados alcançáveis.',
                        'Procure ciclo que consiga levar a algum estado final.',
                        'Se existir esse ciclo produtivo, a linguagem é infinita; caso contrário, é finita.'
                    ]
                },
                {
                    type: 'note',
                    title: 'Equivalência',
                    content: 'Para comparar L1 e L2, pode-se verificar se L1 - L2 e L2 - L1 são vazias. Outra leitura é minimizar os AFDs completos e comparar as estruturas resultantes.'
                }
            ]
        },
        {
            id: 'l5-pumping',
            title: 'Lema do Bombeamento para Regulares',
            description: 'O lema não prova regularidade; ele é um detector de impossibilidade quando usado contra a hipótese de regularidade.',
            objectives: [
                { id: 'l5-pump-obj-1', text: 'Montar a estrutura completa de uma prova por contradição usando o lema do bombeamento.' },
                { id: 'l5-pump-obj-2', text: 'Escolher uma palavra w que force o trecho bombeável a cair na região crítica da linguagem.' }
            ],
            prerequisites: [
                'Prova por contradição.',
                'Noção de linguagem regular.',
                'Quantificadores da hipótese do lema.'
            ],
            keywords: ['lema do bombeamento', 'não regularidade', 'contradição', 'escolha de w'],
            estimatedMinutes: 22,
            references: [blauthCap2],
            commonMistakes: [
                {
                    title: 'Escolher a decomposição em vez de analisá-la',
                    explanation: 'Quem escolhe w é você; quem escolhe x, y, z é o adversário, desde que respeite as restrições do lema.',
                    correction: 'Faça a prova funcionar para qualquer decomposição válida, não só para uma conveniente.'
                }
            ],
            summary: [
                { id: 'l5-pump-sum-1', text: 'A palavra w deve ser longa e estruturalmente rígida o bastante para aprisionar y em uma zona crítica.' },
                { id: 'l5-pump-sum-2', text: 'A contradição surge quando algum bombeamento tira a palavra da linguagem.' }
            ],
            exerciseRefs: ['pumping:15'],
            status: 'canonical',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-05-24',
            content: [
                {
                    type: 'theorem',
                    title: 'Enunciado',
                    content: 'Se L é regular, existe p >= 1 tal que toda palavra w em L com |w| >= p pode ser escrita como w = xyz, com |xy| <= p, |y| >= 1, e para todo i >= 0, x y^i z pertence a L.'
                },
                {
                    type: 'proof-outline',
                    title: 'Esqueleto da demonstração',
                    content: [
                        'Assuma que L é regular e fixe o comprimento de bombeamento p.',
                        'Escolha uma palavra w em L com |w| >= p e com estrutura rígida.',
                        'Considere uma decomposição arbitrária xyz obedecendo ao lema.',
                        'Use |xy| <= p para localizar y em uma região crítica da palavra.',
                        'Escolha i = 0 ou i = 2 para tirar x y^i z de L.',
                        'Conclua a contradição e negue a hipótese de regularidade.'
                    ]
                },
                {
                    type: 'example',
                    title: 'Exemplo: L = { a^n b^n | n >= 0 }',
                    content: 'Escolha w = a^p b^p. Como |xy| <= p, o bloco y fica em a^+. Bombeie i = 0 e obtenha a^{p-|y|} b^p, que não pertence a L.'
                },
                {
                    type: 'common-mistake',
                    title: 'Erro mais comum',
                    content: 'Não escolha w dependente de x, y e z. O lema quantifica a decomposição depois que a palavra já foi fixada.'
                },
                {
                    type: 'checkpoint',
                    title: 'Pergunta decisiva',
                    content: 'Na sua prova, a localização de y depende só das restrições |xy| <= p e |y| >= 1? Se depende de um caso específico inventado por você, a prova ainda não está sólida.'
                },
                {
                    type: 'mini-exercise',
                    title: 'Aplicação guiada',
                    content: 'Antes de abrir a solução discursiva, tente escrever sozinho a etapa em que você conclui que y contém apenas símbolos a em w = a^p b^p.',
                    exerciseRef: 'pumping:15'
                }
            ]
        }
    ]
};
