import type { CourseModule } from '../../../types';

export const mod7: CourseModule = {
    id: 'mod7',
    title: 'Módulo 7: Fechamentos e Decisão',
    lessons: [
        {
            id: 'l7-closure',
            title: 'Propriedades de Fechamento',
            description: 'O que as linguagens regulares preservam.',
            content: [
                {
                    type: 'list',
                    title: 'Fechamentos principais',
                    content: [
                        'União, intersecao e complemento.',
                        'Diferenca e simetria.',
                        'Concatenacao e fecho de Kleene.',
                        'Reverso (L^R).'
                    ]
                },
                {
                    type: 'note',
                    title: 'Construcao produto',
                    content: 'Uniao e intersecao usam o produto de AFDs. Complemento exige AFD total.'
                }
            ]
        },
        {
            id: 'l7-decision',
            title: 'Problemas de Decisão',
            description: 'Perguntas que podemos responder automaticamente.',
            content: [
                {
                    type: 'list',
                    title: 'Problemas decidiveis',
                    content: [
                        'Vazio: L = ∅?',
                        'Finitude: L é finita?',
                        'Pertencimento: w em L?',
                        'Equivalencia e inclusao.'
                    ]
                },
                {
                    type: 'text',
                    content: 'Ex: L é vazia se nenhum estado final é alcancavel do inicial.'
                },
                {
                    type: 'algorithm',
                    title: 'Procedimentos básicos',
                    content: [
                        'Vazio: procure estado final alcancavel.',
                        'Finitude: verifique ciclo alcancavel que chega a final.',
                        'Pertencimento: simule delta* na palavra.'
                    ]
                },
                {
                    type: 'note',
                    title: 'Equivalencia',
                    content: 'Para L1 = L2, teste se L1 delta L2 é vazia.'
                }]
        }
    ]
};
