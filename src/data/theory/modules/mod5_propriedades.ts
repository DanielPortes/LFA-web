import type { CourseModule } from '../../../types';

export const mod5: CourseModule = {
    id: 'mod5',
    title: 'Modulo 5: Propriedades das Linguagens Regulares',
    lessons: [
        {
            id: 'l5-fechamento',
            title: 'Fechamento das linguagens regulares',
            description: 'Operacoes que preservam regularidade e como provar.',
            content: [
                {
                    type: 'list',
                    title: 'Fechamentos classicos',
                    content: [
                        'Uniao, intersecao, complemento, diferenca',
                        'Concatenacao, estrela de Kleene, reverso',
                        'Homomorfismo e homomorfismo inverso',
                        'Substituicao por linguagens regulares'
                    ]
                },
                {
                    type: 'algorithm',
                    title: 'Guia de prova por construcao',
                    content: [
                        'Mostre um construtor de automato para a operacao (produto, uniao, complemento).',
                        'Explique como os estados finais mudam.',
                        'Conclua que a linguagem resultante e regular.'
                    ]
                },
                {
                    type: 'example',
                    title: 'Produto para intersecao',
                    content: 'Dados AFDs M1 e M2, crie M com estados (q1, q2). O estado e final se q1 e q2 sao finais. As transicoes seguem as transicoes de M1 e M2 em paralelo.'
                }
            ]
        },
        {
            id: 'l5-pumping',
            title: 'Lema do bombeamento (RL)',
            description: 'Como provar que uma linguagem nao e regular.',
            content: [
                {
                    type: 'theorem',
                    title: 'Enunciado',
                    content: 'Se L e regular, existe p >= 1 tal que toda palavra w em L com |w| >= p pode ser escrita como w = xyz, com |xy| <= p, |y| >= 1, e para todo i >= 0, x y^i z pertence a L.'
                },
                {
                    type: 'algorithm',
                    title: 'Passo a passo (prova por contradicao)',
                    content: [
                        'Assuma que L e regular.',
                        'Considere o p do lema do bombeamento.',
                        'Escolha uma palavra w de L com |w| >= p que force o y a ficar em uma parte critica.',
                        'Mostre que para algum i (geralmente 0 ou 2) a palavra x y^i z sai de L.',
                        'Conclua que L nao e regular.'
                    ]
                },
                {
                    type: 'example',
                    title: 'Exemplo: L = { a^n b^n | n >= 0 }',
                    content: 'Escolha w = a^p b^p. Como |xy| <= p, o y fica em a^+. Bombeie i=0 e obtenha a^{p-|y|} b^p, que nao pertence a L.'
                },
                {
                    type: 'note',
                    title: 'Erros comuns',
                    content: 'Nao escolha w dependente de x,y. O adversario escolhe a decomposicao. Sua escolha deve funcionar para qualquer decomposicao valida.'
                }
            ]
        },
        {
            id: 'l5-pumping-cfl',
            title: 'Lema do bombeamento (CFL)',
            description: 'Versao para linguagens livres de contexto.',
            content: [
                {
                    type: 'theorem',
                    title: 'Enunciado',
                    content: 'Se L e CFL, existe p >= 1 tal que toda palavra w em L com |w| >= p pode ser escrita como w = u v x y z, com |vxy| <= p, |vy| >= 1, e para todo i >= 0, u v^i x y^i z pertence a L.'
                },
                {
                    type: 'algorithm',
                    title: 'Passo a passo',
                    content: [
                        'Assuma que L e CFL e pegue o p do lema.',
                        'Escolha w de forma que v e y fiquem em posicoes criticas.',
                        'Use i = 0 ou i = 2 para quebrar a propriedade da linguagem.',
                        'Conclua que L nao e CFL.'
                    ]
                },
                {
                    type: 'example',
                    title: 'Exemplo: L = { a^n b^n c^n | n >= 0 }',
                    content: 'Escolha w = a^p b^p c^p. Qualquer v e y bombeiam no maximo duas zonas, quebrando o equilibrio entre a, b e c.'
                }
            ]
        }
    ]
};
