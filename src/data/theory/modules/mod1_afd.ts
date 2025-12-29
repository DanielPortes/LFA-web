import type { CourseModule } from '../../../types';
import { afd_paridade, afd_substring_aa_ou_bb, afd_substring_abb, afd_prefixo_ab } from '../automataDefs';

export const mod1: CourseModule = {
    id: 'mod1',
    title: 'Módulo 1: Autômatos Finitos (AFD)',
    lessons: [
        {
            id: 'l1-def',
            title: 'Autômato Finito Determinístico',
            description: 'O reconhecedor operacional mais preciso.',
            content: [
                {
                    type: 'text',
                    content: 'No AFD, para cada estado e cada símbolo de entrada, existe no máximo uma transição possível.'
                },
                {
                    type: 'definition',
                    title: 'Quíntupla M = (Σ, Q, δ, q0, F)',
                    content: '• Σ: alfabeto de entrada.\n• Q: conjunto **finito** de estados.\n• δ: função programa (ou função de transição), δ: Q × Σ → Q (parcial).\n• q0: estado inicial.\n• F: conjunto de estados finais (F ⊆ Q).\n\nComo δ é parcial, pode faltar transição para algum símbolo; nessa situação, o autômato trava e rejeita.'
                },
                {
                    type: 'definition',
                    title: 'Aceitação',
                    content: 'Uma palavra w é aceita se δ̂(q0, w) ∈ F.'
                },
                {
                    type: 'warning',
                    title: 'Condições de parada (Blauth)',
                    content: '1) Aceitação: fim da fita em estado final.\n2) Rejeição por estado: fim da fita em estado não final.\n3) Rejeição por indefinição: a função δ não está definida para algum símbolo.'
                },
                {
                    type: 'example',
                    title: 'Exemplo: paridade',
                    content: 'Este autômato controla se o número de "a"s e "b"s é par ou ímpar.',
                    automatoRef: afd_paridade
                }
            ]
        },
        {
            id: 'l1-delta',
            title: 'Função Programa Estendida (δ̂)',
            description: 'Como processar uma palavra inteira.',
            content: [
                {
                    type: 'math-tip',
                    title: 'Definição indutiva',
                    content: 'Base: δ̂(q, ε) = q.\nPasso: δ̂(q, aw) = δ̂(δ(q, a), w).\n\nConsuma o primeiro símbolo, mude de estado e repita.'
                },
                {
                    type: 'algorithm',
                    title: 'Simulação de uma palavra',
                    content: [
                        'Inicie em q0.',
                        'Para cada símbolo, aplique δ e avance o ponteiro.',
                        'No fim, aceite se o estado atual estiver em F.'
                    ]
                }
            ]
        },
        {
            id: 'l1-projeto',
            title: 'Projeto de AFDs',
            description: 'Como construir AFDs de forma sistemática.',
            content: [
                {
                    type: 'text',
                    content: 'Cada estado representa a memória mínima necessária para decidir a aceitação.'
                },
                {
                    type: 'list',
                    title: 'Padrões de projeto',
                    content: [
                        'Prefixo fixo: estados representam quanto do prefixo foi lido.',
                        'Sufixo fixo: estados representam o maior sufixo relevante.',
                        'Paridade/módulo: estados representam resto.',
                        'Evitar substring proibida: use estado de erro.'
                    ]
                },
                {
                    type: 'example',
                    title: 'Exemplo (Blauth): aa ou bb',
                    content: 'L1 = { w | w possui aa ou bb como subpalavra }. Os estados q1 e q2 memorizam o símbolo anterior.',
                    automatoRef: afd_substring_aa_ou_bb
                },
                {
                    type: 'example',
                    title: 'Substring "abb"',
                    content: 'Estados lembram o maior sufixo que pode iniciar "abb".',
                    automatoRef: afd_substring_abb
                },
                {
                    type: 'algorithm',
                    title: 'Passos de construção',
                    content: [
                        'Defina o alfabeto e a propriedade da linguagem.',
                        'Descubra a memória mínima que precisa ser guardada.',
                        'Crie estados que representem essa memória.',
                        'Complete transições e teste palavras pequenas.'
                    ]
                }
            ]
        },
        {
            id: 'l1-completo',
            title: 'AFD Total e Estado de Erro',
            description: 'Como lidar com transições ausentes.',
            content: [
                {
                    type: 'text',
                    content: 'Um AFD total possui transições definidas para todos os símbolos do alfabeto.'
                },
                {
                    type: 'warning',
                    title: 'Estado de erro',
                    content: 'O estado de erro não é final e apenas faz loop. Ele garante δ total.'
                },
                {
                    type: 'example',
                    title: 'Começa com "ab"',
                    content: 'Se a palavra não inicia com "ab", cai no erro.',
                    automatoRef: afd_prefixo_ab
                },
                {
                    type: 'algorithm',
                    title: 'Como completar um AFD',
                    content: [
                        'Liste todos os símbolos do alfabeto.',
                        'Para cada estado, verifique transições faltantes.',
                        'Crie um estado de erro (sink).',
                        'Direcione todas as faltantes para o estado de erro.'
                    ]
                },
                {
                    type: 'note',
                    title: 'Complemento',
                    content: 'Para obter o complemento, basta inverter finais, mas apenas em AFDs totais.'
                }
            ]
        }
    ]
};
