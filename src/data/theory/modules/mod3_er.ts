import type { CourseModule } from '../../../types';
import { createLessonReference } from '../../bibliography';
import { er_thompson_a_ou_b, er_thompson_fecho } from '../automataDefs';

const blauthCap5 = createLessonReference('blauth', 'Cap. 5');

export const mod3: CourseModule = {
    id: 'mod3',
    title: 'Módulo 3: Expressões Regulares (ER)',
    lessons: [
        {
            id: 'l3-def',
            title: 'Definição indutiva',
            description: 'A álgebra das linguagens regulares começa nos casos base e cresce por operadores.',
            objectives: [
                { id: 'l3-def-obj-1', text: 'Reconhecer os casos base e os operadores que geram novas ERs.' },
                { id: 'l3-def-obj-2', text: 'Ler uma ER como descrição de conjunto, não como mero padrão visual.' }
            ],
            prerequisites: [
                'Linguagens regulares e operações com linguagens.'
            ],
            keywords: ['ER', 'união', 'concatenação', 'estrela', 'linguagem denotada'],
            estimatedMinutes: 14,
            references: [blauthCap5],
            summary: [
                { id: 'l3-def-sum-1', text: 'Toda ER é construída indutivamente a partir de ∅, ε, símbolos e operadores.' },
                { id: 'l3-def-sum-2', text: 'A pergunta central é sempre qual linguagem a expressão denota.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-04-15',
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
            description: 'Transformando texto em máquina por blocos elementares ligados com ε.',
            objectives: [
                { id: 'l3-th-obj-1', text: 'Aplicar as regras de união, concatenação e fecho na construção de Thompson.' },
                { id: 'l3-th-obj-2', text: 'Entender por que a construção produz AFNs de tamanho linear.' }
            ],
            prerequisites: [
                'Definição indutiva de ER.',
                'AFN-ε e ε-fecho.'
            ],
            keywords: ['Thompson', 'ER para AFN', 'ε-transições'],
            estimatedMinutes: 17,
            references: [blauthCap5],
            summary: [
                { id: 'l3-th-sum-1', text: 'A construção de Thompson monta um AFN-ε bloco a bloco.' },
                { id: 'l3-th-sum-2', text: 'União, concatenação e estrela têm padrões fixos de ligação.' }
            ],
            status: 'canonical',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-04-15',
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
                    content: 'Note a transição de “pulo” do início para o fim e a de retorno para o loop.',
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
            description: 'Como ler e simplificar expressões regulares sem perder o sentido da linguagem.',
            objectives: [
                { id: 'l3-pr-obj-1', text: 'Aplicar corretamente a precedência entre estrela, concatenação e união.' },
                { id: 'l3-pr-obj-2', text: 'Usar identidades algébricas para simplificar ERs de forma segura.' }
            ],
            prerequisites: [
                'Definição indutiva de ER.'
            ],
            keywords: ['precedência', 'identidades', 'simplificação'],
            estimatedMinutes: 12,
            references: [blauthCap5],
            commonMistakes: [
                {
                    title: 'Ler concatenação implícita como se tivesse menor precedência',
                    explanation: 'Sem parênteses, a estrela vem primeiro, depois concatenação e por último união.',
                    correction: 'Se a leitura mental ficar ambígua, reescreva com parênteses antes de interpretar a linguagem.'
                }
            ],
            summary: [
                { id: 'l3-pr-sum-1', text: 'A ordem natural é: estrela, concatenação e união.' },
                { id: 'l3-pr-sum-2', text: 'Identidades ajudam a raciocinar, mas não existe uma “forma bonita” única obrigatória.' }
            ],
            exerciseRefs: ['er:7'],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-04-15',
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
                },
                {
                    type: 'comparison',
                    title: 'Três leituras que não podem se misturar',
                    content: [
                        'Estrela atua sobre o operando imediatamente anterior.',
                        'Concatenação prende blocos em sequência.',
                        'União deve ser lida por último, salvo parênteses explícitos.'
                    ]
                },
                {
                    type: 'mini-exercise',
                    title: 'Sufixo obrigatório',
                    content: 'Escreva uma ER para binários que terminam em 01 e só depois compare sua resposta com a forma mais enxuta.',
                    exerciseRef: 'er:7'
                }
            ]
        },
        {
            id: 'l3-elim',
            title: 'Eliminação de estados (AFD → ER)',
            description: 'Convertendo autômatos em expressões por composição de caminhos.',
            objectives: [
                { id: 'l3-elim-obj-1', text: 'Explicar a ideia de eliminar estados intermediários preservando a linguagem.' },
                { id: 'l3-elim-obj-2', text: 'Relacionar a técnica ao teorema de equivalência entre AFDs e ERs.' }
            ],
            prerequisites: [
                'AFDs e expressões regulares.',
                'Operações união, concatenação e estrela.'
            ],
            keywords: ['eliminação de estados', 'AFD para ER', 'Kleene'],
            estimatedMinutes: 15,
            references: [blauthCap5],
            summary: [
                { id: 'l3-elim-sum-1', text: 'Eliminar um estado significa condensar caminhos indiretos em um novo rótulo regular.' },
                { id: 'l3-elim-sum-2', text: 'A técnica fecha a equivalência entre autômatos e expressões regulares.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-04-15',
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
