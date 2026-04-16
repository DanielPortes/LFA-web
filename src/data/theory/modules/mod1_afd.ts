import type { CourseModule } from '../../../types';
import { createLessonReference } from '../../bibliography';
import { afd_paridade, afd_substring_aa_ou_bb, afd_substring_abb, afd_prefixo_ab } from '../automataDefs';

const blauthCap3 = createLessonReference('blauth', 'Cap. 3');

export const mod1: CourseModule = {
    id: 'mod1',
    title: 'Módulo 1: Autômatos Finitos Determinísticos (AFD)',
    lessons: [
        {
            id: 'l1-def',
            title: 'Autômato Finito Determinístico',
            description: 'O reconhecedor operacional mais clássico da teoria das linguagens regulares.',
            objectives: [
                { id: 'l1-def-obj-1', text: 'Ler a 5-upla de um AFD e interpretar o papel de cada componente.' },
                { id: 'l1-def-obj-2', text: 'Distinguir a definição clássica total da simplificação visual usada em alguns diagramas.' }
            ],
            prerequisites: [
                'Alfabetos, palavras e linguagem formal.',
                'Noções básicas de função total.'
            ],
            keywords: ['AFD', 'δ', 'estado inicial', 'estado final', 'sumidouro'],
            estimatedMinutes: 15,
            references: [blauthCap3],
            commonMistakes: [
                {
                    title: 'Tomar ausência de seta como parte da definição formal',
                    explanation: 'Em diagramas didáticos, omitimos às vezes o estado sumidouro, mas a definição clássica de AFD usa δ total.',
                    correction: 'Em provas de complemento e minimização, complete o autômato antes de raciocinar formalmente.'
                }
            ],
            summary: [
                { id: 'l1-def-sum-1', text: 'Um AFD é uma 5-upla com função de transição total sobre Q × Σ.' },
                { id: 'l1-def-sum-2', text: 'Diagramas podem omitir o sumidouro para reduzir ruído visual, mas isso não muda a definição formal.' }
            ],
            status: 'canonical',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-04-15',
            content: [
                {
                    type: 'text',
                    content: 'No AFD, para cada estado e cada símbolo de entrada, existe exatamente uma próxima configuração de controle.'
                },
                {
                    type: 'definition',
                    title: 'Quíntupla M = (Σ, Q, δ, q0, F)',
                    content: '• Σ: alfabeto de entrada.\n• Q: conjunto **finito** de estados.\n• δ: função programa (ou função de transição), δ: Q × Σ → Q.\n• q0: estado inicial.\n• F: conjunto de estados finais (F ⊆ Q).\n\nEm diagramas didáticos, uma transição omitida pode ser entendida como simplificação visual para uma ida implícita a um estado sumidouro.'
                },
                {
                    type: 'definition',
                    title: 'Aceitação',
                    content: 'Uma palavra w é aceita se δ̂(q0, w) ∈ F.'
                },
                {
                    type: 'warning',
                    title: 'Condições de parada',
                    content: '1) Aceitação: fim da fita em estado final.\n2) Rejeição: fim da fita em estado não final.\n3) Em uma representação incompleta, uma transição ausente deve ser totalizada antes de certas provas e algoritmos.'
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
            description: 'Como formalizar o processamento de uma palavra inteira símbolo por símbolo.',
            objectives: [
                { id: 'l1-delta-obj-1', text: 'Aplicar a definição indutiva de δ̂ em palavras curtas.' },
                { id: 'l1-delta-obj-2', text: 'Explicar por que δ̂ é só uma extensão conceitual de δ, não uma nova máquina.' }
            ],
            prerequisites: [
                'Definição formal de AFD.',
                'Leitura de indução simples em palavras.'
            ],
            keywords: ['δ̂', 'indução', 'processamento de palavra'],
            estimatedMinutes: 12,
            references: [blauthCap3],
            summary: [
                { id: 'l1-delta-sum-1', text: 'δ̂ resume o efeito de consumir toda a palavra a partir de um estado.' },
                { id: 'l1-delta-sum-2', text: 'A definição indutiva explicita a leitura símbolo por símbolo do AFD.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-04-15',
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
            description: 'Como construir AFDs de forma sistemática a partir da memória mínima necessária.',
            objectives: [
                { id: 'l1-proj-obj-1', text: 'Modelar estados como memória relevante do problema.' },
                { id: 'l1-proj-obj-2', text: 'Reconhecer padrões de projeto como paridade, prefixo, sufixo e substring.' }
            ],
            prerequisites: [
                'Definição formal de AFD.',
                'Função programa estendida.'
            ],
            keywords: ['projeto de estados', 'paridade', 'prefixo', 'sufixo', 'substring'],
            estimatedMinutes: 18,
            references: [blauthCap3],
            commonMistakes: [
                {
                    title: 'Criar estados demais sem interpretar o que cada um memoriza',
                    explanation: 'Quando o estado não representa memória útil, o autômato fica difícil de validar e de minimizar.',
                    correction: 'Dê sempre um significado verbal para cada estado antes de completar as transições.'
                }
            ],
            summary: [
                { id: 'l1-proj-sum-1', text: 'Projetar um AFD é escolher a memória mínima suficiente para decidir aceitação.' },
                { id: 'l1-proj-sum-2', text: 'Padrões clássicos de construção reaparecem em vários exercícios da disciplina.' }
            ],
            exerciseRefs: ['afd:1', 'afd:5'],
            status: 'canonical',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-04-15',
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
                },
                {
                    type: 'checkpoint',
                    title: 'Cheque a memória antes de desenhar',
                    content: 'Se a linguagem exige detectar uma substring fixa, seu estado precisa memorizar o maior sufixo útil já visto. Se exige paridade ou resto, o estado precisa codificar exatamente esse contador modular.'
                },
                {
                    type: 'mini-exercise',
                    title: 'Aplicação imediata',
                    content: 'Antes de abrir o gabarito, descreva verbalmente o significado de cada estado que você usaria para reconhecer palavras que contêm a substring "abb".',
                    exerciseRef: 'afd:5'
                }
            ]
        },
        {
            id: 'l1-completo',
            title: 'AFD Total e Estado de Erro',
            description: 'Como lidar com transições ausentes sem perder rigor formal.',
            objectives: [
                { id: 'l1-comp-obj-1', text: 'Totalizar um AFD com estado sumidouro.' },
                { id: 'l1-comp-obj-2', text: 'Explicar por que complemento exige totalização.' }
            ],
            prerequisites: [
                'Definição formal de AFD.',
                'Projeto de estados.'
            ],
            keywords: ['AFD total', 'estado de erro', 'complemento', 'sumidouro'],
            estimatedMinutes: 12,
            references: [blauthCap3],
            summary: [
                { id: 'l1-comp-sum-1', text: 'Completar um AFD significa definir transições para todos os símbolos em todos os estados.' },
                { id: 'l1-comp-sum-2', text: 'Sem totalização, o argumento formal para complemento fica incompleto.' }
            ],
            exerciseRefs: ['afd:1'],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-04-15',
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
                },
                {
                    type: 'checkpoint',
                    title: 'Pergunta de prova clássica',
                    content: 'Se um diagrama omite transições, você pode complementar diretamente trocando finais por não finais? Resposta curta: só depois de explicitar o estado sumidouro e totalizar δ.'
                }
            ]
        }
    ]
};
