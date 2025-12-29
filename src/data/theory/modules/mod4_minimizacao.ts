import type { CourseModule } from '../../../types';

export const mod4: CourseModule = {
    id: 'mod4',
    title: 'Módulo 4: Minimização de AFDs',
    lessons: [
        {
            id: 'l4-intro',
            title: 'Por que minimizar?',
            description: 'Autômatos menores, mesma linguagem.',
            content: [
                {
                    type: 'text',
                    content: 'O algoritmo de minimização funde estados equivalentes, gerando o AFD mínimo (único até renomeação).'
                },
                {
                    type: 'warning',
                    title: 'Pré-requisitos obrigatórios (Blauth)',
                    content: '1) Ser determinístico (AFD).\n2) Remover estados inacessíveis.\n3) Tornar a função de transição total.\n\nSe houver transições indefinidas, crie o estado de erro d e direcione todas as arestas faltantes para ele.'
                }
            ]
        },
        {
            id: 'l4-algo',
            title: 'Marcação e unificação',
            description: 'Identificando pares distinguíveis.',
            content: [
                {
                    type: 'algorithm',
                    title: 'Tabela de estados',
                    content: [
                        'Liste todos os pares {p, q}.',
                        'Marque os pares trivialmente não equivalentes (final vs. não final).',
                        'Para pares não marcados e cada símbolo a, verifique {δ(p,a), δ(q,a)}.',
                        'Se o destino estiver marcado, marque {p, q} e propague a marcação.'
                    ]
                },
                {
                    type: 'definition',
                    title: 'Unificação (Blauth)',
                    content: 'Os pares não marcados ao final são equivalentes e devem ser unificados (fundidos) em um único estado.'
                }
            ]
        }
    ]
};
