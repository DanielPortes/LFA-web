import type { CourseModule } from '../../../types';
import { createLessonReference } from '../../bibliography';
import { afd_termina_ab, afn_termina_ab, afne_blocos, afne_a_antes_b } from '../automataDefs';

const blauthCap4 = createLessonReference('blauth', 'Cap. 4');

export const mod2: CourseModule = {
    id: 'mod2',
    title: 'Módulo 2: Não Determinismo (AFN e AFN-ε)',
    lessons: [
        {
            id: 'l2-concept',
            title: 'O poder do não determinismo',
            description: 'Aceitar por existência de caminho muda a forma de modelar a linguagem, não a sua definição.',
            objectives: [
                { id: 'l2-concept-obj-1', text: 'Explicar por que não determinismo não é aleatoriedade.' },
                { id: 'l2-concept-obj-2', text: 'Interpretar δ: Q × Σ → 2^Q como conjunto de possibilidades ativas.' }
            ],
            prerequisites: [
                'Definição formal de AFD.',
                'Conjunto das partes 2^Q.'
            ],
            keywords: ['AFN', 'não determinismo', '2^Q', 'aceitação por existência'],
            estimatedMinutes: 14,
            references: [blauthCap4],
            commonMistakes: [
                {
                    title: 'Achar que um caminho morto invalida a palavra',
                    explanation: 'No AFN basta existir um caminho aceito; outros caminhos podem travar ou rejeitar.',
                    correction: 'Avalie a aceitação olhando o conjunto de computações possíveis, não um único percurso.'
                }
            ],
            summary: [
                { id: 'l2-concept-sum-1', text: 'O AFN aceita se existir pelo menos um caminho compatível que termine em estado final.' },
                { id: 'l2-concept-sum-2', text: 'O uso de 2^Q representa múltiplos próximos estados possíveis para o mesmo símbolo.' }
            ],
            exerciseRefs: ['afn:3'],
            status: 'canonical',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-04-15',
            content: [
                {
                    type: 'definition',
                    title: 'Função de transição do AFN',
                    content: 'No AFN, δ: Q × Σ → 2^Q. Para um estado e um símbolo, a saída é um conjunto de possíveis estados.'
                },
                {
                    type: 'text',
                    content: 'Intuição do Blauth: é como se houvesse uma multiplicação da unidade de controle, processando caminhos em paralelo e de forma independente, sem compartilhar recursos.'
                },
                {
                    type: 'example',
                    title: 'Comparação: termina em "ab"',
                    content: 'Veja como o AFN é mais simples que o AFD para a mesma tarefa.',
                    automatoRef: afd_termina_ab,
                    automatoRef2: afn_termina_ab
                },
                {
                    type: 'definition',
                    title: 'Aceitação em AFN',
                    content: 'Uma palavra é aceita se existe pelo menos um caminho que termina em estado final.'
                },
                {
                    type: 'theorem',
                    title: 'Equivalência',
                    content: 'Todo AFN pode ser convertido em um AFD. Eles reconhecem as mesmas linguagens.'
                },
                {
                    type: 'checkpoint',
                    title: 'Leitura correta da aceitação',
                    content: 'Ao simular um AFN, não pergunte "qual caminho ele escolheu?". Pergunte "existe pelo menos um caminho que chegou a estado final ao consumir toda a palavra?".'
                },
                {
                    type: 'mini-exercise',
                    title: 'Teste a ideia de aposta',
                    content: 'Projete um AFN para palavras terminadas em "aba" pensando em qual momento o autômato pode "apostar" que começou o sufixo final.',
                    exerciseRef: 'afn:3'
                }
            ]
        },
        {
            id: 'l2-afne',
            title: 'Transições vazias (AFN-ε)',
            description: 'Mudando de estado sem consumir símbolo de entrada.',
            objectives: [
                { id: 'l2-afne-obj-1', text: 'Calcular ε-fecho de estados ou conjuntos de estados.' },
                { id: 'l2-afne-obj-2', text: 'Entender por que ε-transições simplificam composições de máquinas.' }
            ],
            prerequisites: [
                'Não determinismo em AFNs.',
                'Conjunto das partes.'
            ],
            keywords: ['AFN-ε', 'ε-fecho', 'transição vazia'],
            estimatedMinutes: 15,
            references: [blauthCap4],
            summary: [
                { id: 'l2-afne-sum-1', text: 'ε não pertence ao alfabeto de entrada; ele rotula saltos internos da máquina.' },
                { id: 'l2-afne-sum-2', text: 'O ε-fecho reúne todos os estados alcançáveis sem ler símbolos.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-04-15',
            content: [
                {
                    type: 'definition',
                    title: 'Transição com ε',
                    content: 'No AFN-ε, o símbolo ε **não** pertence ao alfabeto Σ. A função de transição é δ: Q × (Σ ∪ {ε}) → 2^Q.'
                },
                {
                    type: 'definition',
                    title: 'ε-fecho',
                    content: 'ε-fecho(q) é o menor conjunto que contém q e todos os estados atingíveis a partir de q usando apenas transições ε.'
                },
                {
                    type: 'example',
                    title: 'Uso do ε',
                    content: 'Usamos ε para ligar partes de autômatos e compor linguagens.',
                    automatoRef: afne_blocos
                },
                {
                    type: 'example',
                    title: 'Exemplo do livro',
                    content: 'L7 = { w | todo símbolo "a" antecede todo símbolo "b" }.',
                    automatoRef: afne_a_antes_b
                },
                {
                    type: 'algorithm',
                    title: 'Cálculo do ε-fecho',
                    content: [
                        'Inicie com o conjunto {q}.',
                        'Enquanto houver transição ε para um novo estado, inclua-o.',
                        'Pare quando o conjunto não mudar.'
                    ]
                }
            ]
        },
        {
            id: 'l2-subset',
            title: 'Determinização (construção de subconjuntos)',
            description: 'Como reempacotar o não determinismo em estados determinísticos.',
            objectives: [
                { id: 'l2-subset-obj-1', text: 'Construir o estado inicial do AFD como ε-fecho do inicial do AFN.' },
                { id: 'l2-subset-obj-2', text: 'Interpretar cada estado do AFD como conjunto de possibilidades do AFN.' }
            ],
            prerequisites: [
                'AFN e AFN-ε.',
                'Conjunto das partes 2^Q.'
            ],
            keywords: ['determinização', 'subconjuntos', 'ε-fecho', 'AFN para AFD'],
            estimatedMinutes: 16,
            references: [blauthCap4],
            commonMistakes: [
                {
                    title: 'Achar que o AFD resultante simula um caminho só',
                    explanation: 'Cada estado do AFD representa um subconjunto de estados ativos do AFN original.',
                    correction: 'Leia os rótulos dos estados como memória condensada de vários caminhos ao mesmo tempo.'
                }
            ],
            summary: [
                { id: 'l2-subset-sum-1', text: 'Determinizar é trocar conjuntos de estados ativos por um único estado do AFD.' },
                { id: 'l2-subset-sum-2', text: 'O custo potencial é exponencial: até 2^n estados.' }
            ],
            exerciseRefs: ['afn:4'],
            status: 'canonical',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-04-15',
            content: [
                {
                    type: 'text',
                    content: 'Cada estado do AFD corresponde a um conjunto de estados do AFN. O inicial é ε-fecho do estado inicial do AFN.'
                },
                {
                    type: 'algorithm',
                    title: 'Algoritmo de construção de subconjuntos',
                    content: [
                        'Estado inicial: ε-fecho({q0}).',
                        'Para cada conjunto S e símbolo a, compute Move(S, a).',
                        'Aplique ε-fecho no resultado e crie novo estado.',
                        'Um conjunto é final se contém algum estado final do AFN.'
                    ]
                },
                {
                    type: 'note',
                    title: 'Explosão de estados',
                    content: 'Um AFN com n estados pode gerar um AFD com até 2^n estados.'
                },
                {
                    type: 'text',
                    content: 'Exemplo: se Move({q0,q1}, a) = {q1,q2}, o novo estado do AFD é {q1,q2}.'
                },
                {
                    type: 'checkpoint',
                    title: 'Interpretação do novo estado',
                    content: 'Quando surge um estado como {q1, q2}, ele não representa indecisão do algoritmo. Ele representa a consolidação exata dos caminhos do AFN que permanecem vivos após a leitura do símbolo.'
                }
            ]
        }
    ]
};
