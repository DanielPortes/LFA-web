import type { CourseModule } from '../../../types';
import { createLessonReference } from '../../bibliography';

const blauthCap2 = createLessonReference('blauth', 'Cap. 2');

export const mod9: CourseModule = {
    id: 'mod9',
    title: 'Módulo 9: Autômatos Finitos com Saída',
    lessons: [
        {
            id: 'l9-output',
            title: 'Máquinas de Mealy e Moore',
            description: 'Transdutores finitos: máquinas que produzem saída enquanto processam entrada.',
            objectives: [
                { id: 'l9-out-obj-1', text: 'Distinguir saída associada à transição e saída associada ao estado.' },
                { id: 'l9-out-obj-2', text: 'Entender por que essas máquinas não são aceitadores simples.' }
            ],
            prerequisites: [
                'AFD.',
                'Função programa.',
                'Palavras de entrada e saída.'
            ],
            keywords: ['Mealy', 'Moore', 'saída', 'transdutor', 'AFD'],
            estimatedMinutes: 20,
            references: [blauthCap2],
            summary: [
                { id: 'l9-out-sum-1', text: 'Em Mealy, a saída é gerada nas transições.' },
                { id: 'l9-out-sum-2', text: 'Em Moore, a saída é gerada nos estados.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-05-24',
            content: [
                {
                    type: 'text',
                    content: 'O livro apresenta autômatos finitos com saída como modificações dos autômatos determinísticos. Em vez de apenas aceitar ou rejeitar, a máquina lê uma palavra de entrada e produz uma palavra de saída.'
                },
                {
                    type: 'definition',
                    title: 'Máquina de Mealy',
                    content: 'Em uma Máquina de Mealy, a saída está associada às transições. Ao consumir um símbolo de entrada, a máquina muda de estado e escreve a saída definida para aquela transição.'
                },
                {
                    type: 'definition',
                    title: 'Máquina de Moore',
                    content: 'Em uma Máquina de Moore, a saída está associada aos estados. Ao visitar um estado, a máquina produz a palavra de saída vinculada a esse estado.'
                },
                {
                    type: 'comparison',
                    title: 'Diferença operacional',
                    content: [
                        'Mealy reage à combinação entre estado atual e símbolo lido.',
                        'Moore emite saída por estar em um estado.',
                        'Para a entrada vazia, Moore pode produzir a saída do estado inicial; Mealy não produz saída porque nenhuma transição foi executada.'
                    ]
                },
                {
                    type: 'example',
                    title: 'Aplicação no livro',
                    content: 'O livro usa máquinas com saída para modelar diálogos homem-máquina e também menciona o analisador léxico como caso em que classes de entrada podem gerar códigos de token.'
                }
            ]
        },
        {
            id: 'l9-equivalencia',
            title: 'Equivalência entre Moore e Mealy',
            description: 'Como um modelo pode simular o outro, com atenção especial à entrada vazia.',
            objectives: [
                { id: 'l9-eq-obj-1', text: 'Explicar a simulação de Moore por Mealy.' },
                { id: 'l9-eq-obj-2', text: 'Explicar a simulação de Mealy por Moore.' }
            ],
            prerequisites: [
                'Máquinas de Mealy.',
                'Máquinas de Moore.'
            ],
            keywords: ['equivalência', 'simulação', 'estado inicial', 'entrada vazia'],
            estimatedMinutes: 16,
            references: [blauthCap2],
            summary: [
                { id: 'l9-eq-sum-1', text: 'Moore pode ser simulada por Mealy deslocando saídas de estados para transições.' },
                { id: 'l9-eq-sum-2', text: 'Mealy pode ser simulada por Moore refinando estados conforme símbolos de saída.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-05-24',
            content: [
                {
                    type: 'note',
                    title: 'Entrada vazia',
                    content: 'A equivalência precisa tratar separadamente a palavra vazia, porque Moore pode gerar saída antes de qualquer símbolo ser lido, enquanto Mealy só gera saída ao executar uma transição.'
                },
                {
                    type: 'algorithm',
                    title: 'Moore para Mealy',
                    content: [
                        'Para cada transição que chega a um estado q, associe à transição a saída de q.',
                        'Use um estado auxiliar se for necessário representar a saída inicial de Moore.',
                        'Preserve a estrutura de mudança de estados.'
                    ]
                },
                {
                    type: 'algorithm',
                    title: 'Mealy para Moore',
                    content: [
                        'Separe estados conforme as saídas que podem ser produzidas ao chegar neles.',
                        'Associe a cada novo estado a saída correspondente.',
                        'Redirecione transições para os estados refinados.'
                    ]
                },
                {
                    type: 'checkpoint',
                    title: 'O que a simulação preserva',
                    content: 'A simulação deve preservar a relação entre palavra de entrada e palavra de saída. Não basta preservar apenas os estados alcançados.'
                }
            ]
        }
    ]
};
