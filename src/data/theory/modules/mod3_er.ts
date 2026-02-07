import type { CourseModule } from '../../../types';
import { er_thompson_a_ou_b, er_thompson_fecho } from '../automataDefs';

export const mod3: CourseModule = {
    id: 'mod3',
    title: 'Módulo 3: Expressões Regulares (ER)',
    lessons: [
        {
            id: 'l3-def',
            title: 'Definição indutiva',
            description: 'A álgebra das linguagens regulares.',
            content: [
                {
                    type: 'definition',
                    title: 'Casos base (Blauth)',
                    content: '1) ∅ é uma ER (linguagem vazia).\n2) ε é uma ER (linguagem com a palavra vazia).\n3) x ∈ Σ é uma ER.\n4) Se r e s são ER, então (r+s), (rs) e (r*) são ER.'
                },
                {
                    type: 'text',
                    content: 'O operador de união é representado por + (ex.: a+b).'
                },
                {
                    type: 'list',
                    title: 'Exemplos rápidos',
                    content: [
                        '(0+1)*1',
                        'a*b*',
                        '(ab+ba)*'
                    ]
                }
            ]
        },
        {
            id: 'l3-thompson',
            title: 'Algoritmo de Thompson (ER → AFN)',
            description: 'Transformando texto em máquina.',
            content: [
                {
                    type: 'text',
                    content: 'Podemos converter qualquer ER em um AFN-ε construindo blocos pequenos e colando com ε.'
                },
                {
                    type: 'example',
                    title: 'Bloco base: união (a+b)',
                    content: 'Cria-se um estado inicial novo que bifurca para as máquinas de "a" e "b".',
                    automatoRef: er_thompson_a_ou_b
                },
                {
                    type: 'example',
                    title: 'Bloco base: fecho (a*)',
                    content: 'Note a transicao de “pulo” do início para o fim e a de retorno para o loop.',
                    automatoRef: er_thompson_fecho
                },
                {
                    type: 'algorithm',
                    title: 'Regras de construção',
                    content: [
                        'União: novo início/fim e ε para cada submáquina.',
                        'Concatenação: ligue o fim de r ao início de s com ε.',
                        'Fecho: crie loop com ε e um caminho de pulo.'
                    ]
                },
                {
                    type: 'note',
                    title: 'Tamanho',
                    content: 'O AFN resultante tem tamanho linear na ER.'
                }
            ]
        },
        {
            id: 'l3-precedencia',
            title: 'Precedência e identidades',
            description: 'Regras de leitura correta.',
            content: [
                {
                    type: 'definition',
                    title: 'Precedência',
                    content: '1) Fecho (*)\n2) Concatenação\n3) União (+).\nUse parênteses para evitar ambiguidade.'
                },
                {
                    type: 'math-tip',
                    title: 'Identidades clássicas',
                    content: 'r + ∅ = r\nr·ε = r\n(r*)* = r*\nr* = ε + r·r*'
                },
                {
                    type: 'list',
                    title: 'Exercícios propostos',
                    content: [
                        'Simplifique (a+b)*a(a+b)*.',
                        'Escreva uma ER para binários que terminam em 01.',
                        'Escreva uma ER para palavras sem substring "aa".'
                    ]
                }
            ]
        },
        {
            id: 'l3-elim',
            title: 'Eliminação de estados (AFD → ER)',
            description: 'Convertendo automatos em ERs.',
            content: [
                {
                    type: 'text',
                    content: 'Adicione novo início e novo fim e elimine estados intermediários, combinando rótulos com união, concatenação e fecho.'
                },
                {
                    type: 'algorithm',
                    title: 'Passos da eliminação',
                    content: [
                        'Adicione novo início com ε para o início antigo.',
                        'Adicione novo fim com ε a partir dos finais antigos.',
                        'Escolha um estado intermediário e elimine-o.',
                        'Atualize rótulos combinando caminhos.',
                        'Repita até restarem apenas início e fim.'
                    ]
                },
                {
                    type: 'note',
                    title: 'Teorema de Kleene',
                    content: 'ERs e AFDs reconhecem as mesmas linguagens regulares.'
                }
            ]
        }
    ]
};

