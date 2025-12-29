import type { CourseModule } from '../../../types';
import { afd_termina_ab, afn_termina_ab, afne_blocos, afne_a_antes_b } from '../automataDefs';

export const mod2: CourseModule = {
    id: 'mod2',
    title: 'Módulo 2: Não Determinismo (AFN)',
    lessons: [
        {
            id: 'l2-concept',
            title: 'O Poder do Não Determinismo',
            description: 'Estar em vários lugares ao mesmo tempo.',
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
                }
            ]
        },
        {
            id: 'l2-afne',
            title: 'Transições Vazias (AFN-ε)',
            description: 'Mudando de estado sem ler símbolo.',
            content: [
                {
                    type: 'definition',
                    title: 'Transição com ε',
                    content: 'No AFN-ε, o símbolo ε **não** pertence ao alfabeto Σ. A função de transição é δ: Q × (Σ ∪ {ε}) → 2^Q.'
                },
                {
                    type: 'definition',
                    title: 'FECHO-ε (função fecho vazio)',
                    content: 'FECHO-ε(q) é o menor conjunto que contém q e todos os estados atingíveis a partir de q usando apenas transições ε.'
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
                    title: 'Cálculo do FECHO-ε',
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
            title: 'Determinização (Construção de Subconjuntos)',
            description: 'Transformando AFN em AFD.',
            content: [
                {
                    type: 'text',
                    content: 'Cada estado do AFD corresponde a um conjunto de estados do AFN. O inicial é FECHO-ε do estado inicial do AFN.'
                },
                {
                    type: 'algorithm',
                    title: 'Algoritmo de construção de subconjuntos',
                    content: [
                        'Estado inicial: FECHO-ε({q0}).',
                        'Para cada conjunto S e símbolo a, compute Move(S, a).',
                        'Aplique FECHO-ε no resultado e crie novo estado.',
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
                }
            ]
        }
    ]
};
