import type { CourseModule } from '../../../types';
import { createLessonReference } from '../../bibliography';

const blauthCap6 = createLessonReference('blauth', 'Cap. 6');

export const mod4: CourseModule = {
    id: 'mod4',
    title: 'Módulo 4: Minimização de AFDs',
    lessons: [
        {
            id: 'l4-intro',
            title: 'Por que minimizar?',
            description: 'Minimizar não é enfeite algorítmico: é explicitar quando dois estados têm exatamente o mesmo comportamento futuro.',
            objectives: [
                { id: 'l4-intro-obj-1', text: 'Explicar por que o AFD mínimo preserva a linguagem e elimina redundância comportamental.' },
                { id: 'l4-intro-obj-2', text: 'Reconhecer por que inacessibilidade e falta de totalização atrapalham a minimização.' }
            ],
            prerequisites: [
                'Definição formal de AFD.',
                'Estado sumidouro e totalização.',
                'Leitura de palavras via δ̂.'
            ],
            keywords: ['minimização', 'equivalência de estados', 'inalcançáveis', 'estado de erro'],
            estimatedMinutes: 14,
            references: [blauthCap6],
            commonMistakes: [
                {
                    title: 'Minimizar antes de limpar o automato',
                    explanation: 'Estados inacessíveis e omissões de transição poluem a análise e podem induzir fusões erradas.',
                    correction: 'Primeiro remova inacessíveis e totalize o AFD; só depois aplique o algoritmo de equivalência.'
                }
            ],
            summary: [
                { id: 'l4-intro-sum-1', text: 'Dois estados são equivalentes quando nenhum sufixo de entrada consegue distingui-los quanto à aceitação.' },
                { id: 'l4-intro-sum-2', text: 'A limpeza prévia do AFD é parte do processo, não detalhe cosmético.' }
            ],
            exerciseRefs: ['minimizacao:8', 'minimizacao:12'],
            status: 'canonical',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-04-15',
            content: [
                {
                    type: 'text',
                    content: 'O algoritmo de minimização funde estados equivalentes, gerando o AFD mínimo, único até renomeação dos estados.'
                },
                {
                    type: 'definition',
                    title: 'Equivalência de estados',
                    content: 'Estados p e q são equivalentes quando, para toda palavra w, a leitura de w a partir de p e de q termina simultaneamente em aceitação ou rejeição.'
                },
                {
                    type: 'warning',
                    title: 'Pré-requisitos obrigatórios',
                    content: '1) O autômato precisa ser determinístico.\n2) Estados inacessíveis devem ser removidos.\n3) A função de transição deve estar totalizada.\n\nSe houver transições indefinidas, crie o estado de erro d e direcione para ele todas as arestas faltantes.'
                },
                {
                    type: 'common-mistake',
                    title: 'Armadilha frequente',
                    content: 'Trocar finais por não finais para complementar antes de totalizar ou comparar estados antes de remover inacessíveis produz argumentos formais incompletos.'
                },
                {
                    type: 'checkpoint',
                    title: 'Pergunta de sanidade',
                    content: 'Se dois estados nunca são visitados a partir do inicial, eles devem influenciar o AFD mínimo? Não. Primeiro remova o que é inalcançável; depois compare o comportamento do que realmente sobra.'
                },
                {
                    type: 'mini-exercise',
                    title: 'Prática imediata',
                    content: 'Revise um AFD qualquer e anote duas perguntas antes de tentar fundir estados: há estado inalcançável? há transição faltante?',
                    exerciseRef: 'minimizacao:12'
                }
            ]
        },
        {
            id: 'l4-algo',
            title: 'Marcação e unificação',
            description: 'O algoritmo trabalha por distinção progressiva: primeiro separa o óbvio, depois propaga essa diferença pelo resto da máquina.',
            objectives: [
                { id: 'l4-algo-obj-1', text: 'Executar a tabela de marcação para pares de estados de um AFD.' },
                { id: 'l4-algo-obj-2', text: 'Justificar por que pares não marcados no final podem ser fundidos.' }
            ],
            prerequisites: [
                'Equivalência de estados.',
                'AFD já limpo e total.'
            ],
            keywords: ['tabela de marcação', 'pares distinguíveis', 'unificação'],
            estimatedMinutes: 17,
            references: [blauthCap6],
            commonMistakes: [
                {
                    title: 'Parar a análise depois da primeira marcação',
                    explanation: 'O algoritmo exige propagação: um par pode virar distinguível porque seus sucessores já foram marcados.',
                    correction: 'Revisite os pares não marcados até estabilizar a tabela.'
                }
            ],
            summary: [
                { id: 'l4-algo-sum-1', text: 'Final versus não final é só o ponto de partida da distinção.' },
                { id: 'l4-algo-sum-2', text: 'O fechamento do algoritmo ocorre quando nenhuma nova marcação aparece.' }
            ],
            exerciseRefs: ['minimizacao:8', 'minimizacao:11'],
            status: 'canonical',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-04-15',
            content: [
                {
                    type: 'algorithm',
                    title: 'Tabela de estados',
                    content: [
                        'Liste todos os pares {p, q} com p diferente de q.',
                        'Marque imediatamente pares final vs. não final.',
                        'Para cada par não marcado e cada símbolo a, olhe {δ(p, a), δ(q, a)}.',
                        'Se algum destino já estiver marcado, marque {p, q}.',
                        'Repita até a tabela estabilizar.'
                    ]
                },
                {
                    type: 'proof-outline',
                    title: 'Por que a propagação funciona?',
                    content: [
                        'Se um sufixo distingue os destinos de p e q após ler a, então a seguido desse sufixo distingue p e q.',
                        'Logo, a distinção de sucessores sobe um nível e contamina o par atual.',
                        'Ao final, só permanecem não marcados os pares sem testemunha de distinção.'
                    ]
                },
                {
                    type: 'definition',
                    title: 'Unificação',
                    content: 'Os pares não marcados ao final são equivalentes e devem ser fundidos em um único estado do AFD mínimo.'
                },
                {
                    type: 'checkpoint',
                    title: 'Leitura correta da tabela',
                    content: 'Um par não marcado no meio do processo ainda não está aprovado para fusão. Ele só pode ser fundido depois que nenhuma nova marcação surgir.'
                },
                {
                    type: 'mini-exercise',
                    title: 'Teste de compreensão',
                    content: 'Pegue um par formado por um estado final e um não final. Esse par precisa mesmo de análise dos sucessores? Não: ele já nasce distinguível.',
                    exerciseRef: 'minimizacao:8'
                },
                {
                    type: 'summary',
                    title: 'Regra operacional',
                    content: 'Marque o que é obviamente diferente, propague a diferença pelos sucessores e una apenas o que resistir ao processo inteiro.'
                }
            ]
        }
    ]
};
