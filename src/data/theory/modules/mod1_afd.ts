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
                    content: 'Um autômato finito determinístico é uma máquina abstrata com memória finita. Ele lê a palavra de entrada da esquerda para a direita, um símbolo por vez, e mantém apenas uma informação de controle: o estado atual. Essa limitação é justamente o que torna o modelo útil. Se a linguagem pode ser reconhecida lembrando apenas uma quantidade finita de informação, então há uma boa chance de ela ser regular.\n\nNo AFD, para cada estado e cada símbolo de entrada, existe exatamente uma próxima configuração de controle. Não há escolha, sorteio ou bifurcação: a computação é uma única trilha.'
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
                    type: 'text',
                    content: 'A função `δ` explica um único passo: estando em `q` e lendo `a`, para qual estado a máquina vai? A função estendida `δ̂` explica a palavra inteira: começando em `q0`, qual estado sobra depois que todos os símbolos foram consumidos? A decisão final só acontece depois do último símbolo. Estados finais não significam "pare agora"; eles significam "se a entrada terminar aqui, aceite".'
                },
                {
                    type: 'warning',
                    title: 'Condições de parada',
                    content: '1) Aceitação: fim da fita em estado final.\n2) Rejeição: fim da fita em estado não final.\n3) Em uma representação incompleta, uma transição ausente deve ser totalizada antes de certas provas e algoritmos.'
                },
                {
                    type: 'example',
                    title: 'Exemplo: paridade',
                    content: 'Este autômato controla se o número de `a`s e `b`s é par ou ímpar. Cada estado é uma fotografia da memória necessária: `PP` significa quantidade par de `a` e par de `b`; `IP` significa ímpar de `a` e par de `b`; `PI` significa par de `a` e ímpar de `b`; `II` significa ímpar de ambos. Ler `a` troca apenas a paridade de `a`; ler `b` troca apenas a paridade de `b`.',
                    automatoRef: afd_paridade
                },
                {
                    type: 'checkpoint',
                    title: 'Pergunta antes do simulador',
                    content: 'Teste mentalmente as palavras `ε`, `ab`, `aba` e `abba`. Em cada uma, acompanhe a paridade de `a` e de `b` antes de apertar Simular. Se a sua previsão divergir da máquina, o problema está na leitura da linguagem ou no significado dado ao estado.'
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
                    type: 'text',
                    content: 'A definição parece formal, mas ela descreve exatamente o movimento que você faz no diagrama. Para calcular `δ̂(q0, abaa)`, não tente olhar a palavra inteira de uma vez. Leia `a`, atualize o estado; leia `b`, atualize de novo; continue até a palavra acabar. A função estendida existe para transformar essa repetição em uma frase matemática curta.'
                },
                {
                    type: 'algorithm',
                    title: 'Simulação de uma palavra',
                    content: [
                        'Inicie em q0.',
                        'Para cada símbolo, aplique δ e avance o ponteiro.',
                        'No fim, aceite se o estado atual estiver em F.'
                    ]
                },
                {
                    type: 'example',
                    title: 'Rastreamento em um AFD de paridade',
                    content: 'Na palavra `abba`, começamos em `PP`. Ao ler `a`, vamos para `IP`; ao ler `b`, vamos para `II`; no segundo `b`, voltamos para `IP`; no último `a`, retornamos para `PP`. Como `PP` é final, a palavra é aceita. Esse tipo de rastreamento é a ponte entre a definição formal e o uso do simulador.',
                    automatoRef: afd_paridade
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
                    content: 'Projetar um AFD não é desenhar círculos ao acaso. Cada estado representa a memória mínima necessária para decidir a aceitação quando a entrada terminar. A pergunta correta é: "o que eu preciso lembrar do prefixo já lido para decidir o futuro da palavra?".\n\nEssa pergunta muda o desenho. Para paridade, lembramos restos módulo 2. Para prefixo fixo, lembramos quanto do prefixo foi confirmado. Para sufixo ou substring, lembramos o maior pedaço final já lido que ainda pode virar o padrão desejado.'
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
                    content: 'Considere `L1 = { w ∈ {a,b}* | w possui aa ou bb como subpalavra }`. Enquanto não encontramos duas letras iguais consecutivas, o autômato precisa lembrar qual foi o último símbolo. O estado `q1` representa "o último símbolo foi a"; `q2` representa "o último símbolo foi b"; `OK` representa "já encontrei aa ou bb". Depois de chegar em `OK`, qualquer continuação permanece aceita.',
                    automatoRef: afd_substring_aa_ou_bb
                },
                {
                    type: 'example',
                    title: 'Substring "abb"',
                    content: 'Para reconhecer palavras que contêm `abb`, os estados lembram o maior sufixo já visto que também é prefixo de `abb`. `q0` não guarda progresso; `q1` significa que o sufixo relevante é `a`; `q2` significa `ab`; `OK` significa que `abb` já apareceu. Se em `q2` lemos `a`, não voltamos para o nada: o novo sufixo útil é novamente `a`.',
                    automatoRef: afd_substring_abb
                },
                {
                    type: 'example',
                    title: 'Começa com "ab"',
                    content: 'Este exemplo mostra outro padrão: prefixo obrigatório. Depois de errar o primeiro ou o segundo símbolo, a palavra nunca mais pode começar com `ab`, então o estado de erro resume todos os prefixos irrecuperáveis.',
                    automatoRef: afd_prefixo_ab
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
                    type: 'proof-outline',
                    title: 'Como justificar que o desenho está correto',
                    content: [
                        'Declare o significado de cada estado em português claro.',
                        'Mostre que cada transição preserva esse significado depois de ler o próximo símbolo.',
                        'Conclua que os estados finais correspondem exatamente à propriedade da linguagem.'
                    ]
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
