import type { CourseModule } from '../../../types';
import { createLessonReference } from '../../bibliography';

const blauthCap7 = createLessonReference('blauth', 'Cap. 7');

export const mod5: CourseModule = {
    id: 'mod5',
    title: 'Módulo 5: Propriedades das Linguagens Regulares',
    lessons: [
        {
            id: 'l5-fechamento',
            title: 'Fechamento das linguagens regulares',
            description: 'Uma classe forte de linguagens não é só a que tem exemplos; é a que preserva estrutura sob operações importantes.',
            objectives: [
                { id: 'l5-fech-obj-1', text: 'Reconhecer as principais operações sob as quais as linguagens regulares são fechadas.' },
                { id: 'l5-fech-obj-2', text: 'Escolher a estratégia de prova adequada: produto, complemento, composição ou argumento por ER.' }
            ],
            prerequisites: [
                'AFDs totais.',
                'Operações sobre linguagens.',
                'Produto de autômatos.'
            ],
            keywords: ['fechamento', 'produto', 'complemento', 'interseção', 'reverso'],
            estimatedMinutes: 16,
            references: [blauthCap7],
            summary: [
                { id: 'l5-fech-sum-1', text: 'Fechamento significa continuar dentro da classe depois de aplicar uma operação à linguagem.' },
                { id: 'l5-fech-sum-2', text: 'A prova costuma exibir uma construção explícita que reconhece a linguagem resultante.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-04-15',
            content: [
                {
                    type: 'list',
                    title: 'Fechamentos clássicos',
                    content: [
                        'União, interseção, complemento e diferença.',
                        'Concatenação, estrela de Kleene e reverso.',
                        'Homomorfismo e homomorfismo inverso.',
                        'Substituição por linguagens regulares.'
                    ]
                },
                {
                    type: 'algorithm',
                    title: 'Guia de prova por construção',
                    content: [
                        'Identifique qual operação está sendo aplicada à linguagem.',
                        'Escolha a construção correspondente: produto, inversão de finais, composição por ER ou transdutor.',
                        'Explique o papel dos estados finais e do estado inicial na nova máquina.',
                        'Conclua que a nova linguagem ainda é regular.'
                    ]
                },
                {
                    type: 'comparison',
                    title: 'Produto versus complemento',
                    content: [
                        'Interseção e união costumam pedir produto cartesiano.',
                        'Complemento pede AFD total e só então troca de finais por não finais.',
                        'Diferença pode ser tratada como interseção com complemento.'
                    ]
                },
                {
                    type: 'example',
                    title: 'Produto para interseção',
                    content: 'Dados AFDs M1 e M2, crie M com estados (q1, q2). O estado é final se q1 e q2 são finais. As transições seguem M1 e M2 em paralelo.'
                },
                {
                    type: 'checkpoint',
                    title: 'Escolha a ferramenta antes de provar',
                    content: 'Se a operação envolve aceitar simultaneamente duas condições, o produto costuma ser a primeira aposta. Se envolve negar uma linguagem, a primeira pergunta é se o AFD está totalizado.'
                }
            ]
        },
        {
            id: 'l5-pumping',
            title: 'Lema do bombeamento (RL)',
            description: 'O lema não prova regularidade; ele é um detector de impossibilidade quando usado contra a hipótese de regularidade.',
            objectives: [
                { id: 'l5-pump-obj-1', text: 'Montar a estrutura completa de uma prova por contradicão usando o lema do bombeamento.' },
                { id: 'l5-pump-obj-2', text: 'Escolher uma palavra w que force o trecho bombeável a cair na região crítica da linguagem.' }
            ],
            prerequisites: [
                'Prova por contradição.',
                'Noção de linguagem regular.',
                'Quantificadores da hipótese do lema.'
            ],
            keywords: ['lema do bombeamento', 'não regularidade', 'contradição', 'escolha de w'],
            estimatedMinutes: 20,
            references: [blauthCap7],
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
            lastReviewedAt: '2026-04-15',
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
                },
                {
                    type: 'summary',
                    title: 'Regra prática',
                    content: 'Escolha w para aprisionar y, use a restrição |xy| <= p para localizar o dano e bombeie para quebrar a propriedade central da linguagem.'
                }
            ]
        },
        {
            id: 'l5-pumping-cfl',
            title: 'Lema do bombeamento (CFL)',
            description: 'A versão para linguagens livres de contexto bombeia dois trechos, não um só, e por isso exige leitura ainda mais cuidadosa da estrutura da palavra.',
            objectives: [
                { id: 'l5-cfl-obj-1', text: 'Distinguir o lema para regulares do lema para livres de contexto.' },
                { id: 'l5-cfl-obj-2', text: 'Explicar por que bombear v e y simultaneamente pode quebrar dependências estruturais da linguagem.' }
            ],
            prerequisites: [
                'Lema do bombeamento para regulares.',
                'Noção de linguagem livre de contexto.'
            ],
            keywords: ['CFL', 'u v x y z', 'bombeamento duplo'],
            estimatedMinutes: 18,
            references: [blauthCap7],
            summary: [
                { id: 'l5-cfl-sum-1', text: 'No lema de CFL, os trechos bombeáveis são v e y, com |vxy| limitado por p.' },
                { id: 'l5-cfl-sum-2', text: 'O argumento costuma explorar o fato de v e y atingirem no máximo duas zonas críticas da palavra.' }
            ],
            exerciseRefs: ['cfg:4'],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-04-15',
            content: [
                {
                    type: 'theorem',
                    title: 'Enunciado',
                    content: 'Se L é CFL, existe p >= 1 tal que toda palavra w em L com |w| >= p pode ser escrita como w = u v x y z, com |vxy| <= p, |vy| >= 1, e para todo i >= 0, u v^i x y^i z pertence a L.'
                },
                {
                    type: 'algorithm',
                    title: 'Passo a passo',
                    content: [
                        'Assuma que L é CFL e fixe o p do lema.',
                        'Escolha w de forma que as regiões críticas da palavra fiquem bem separadas.',
                        'Analise qualquer decomposição uvxyz respeitando |vxy| <= p.',
                        'Mostre que bombear v e y simultaneamente quebra a propriedade estrutural da linguagem.'
                    ]
                },
                {
                    type: 'example',
                    title: 'Exemplo: L = { a^n b^n c^n | n >= 0 }',
                    content: 'Escolha w = a^p b^p c^p. Como v e y ocupam uma janela curta, eles atingem no máximo duas zonas, quebrando o equilíbrio entre os três blocos quando bombeados.'
                },
                {
                    type: 'checkpoint',
                    title: 'Diferença para RL',
                    content: 'Aqui não existe um único trecho y. A prova precisa acompanhar dois trechos que variam juntos, o que muda completamente a análise dos casos.'
                },
                {
                    type: 'mini-exercise',
                    title: 'Conexão com a prática discursiva',
                    content: 'Explique em uma frase por que a janela |vxy| <= p impede que v e y alcancem simultaneamente os três blocos de a^p b^p c^p.',
                    exerciseRef: 'cfg:4'
                }
            ]
        }
    ]
};
