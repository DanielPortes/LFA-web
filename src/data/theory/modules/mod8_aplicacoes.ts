import type { CourseModule } from '../../../types';
import { createLessonReference } from '../../bibliography';

const blauthCap2 = createLessonReference('blauth', 'Cap. 2');

export const mod8: CourseModule = {
    id: 'mod8',
    title: 'Módulo 8: Aplicações de Linguagens Regulares',
    lessons: [
        {
            id: 'l8-compiladores',
            title: 'Análise Léxica',
            description: 'Como expressões regulares e autômatos finitos aparecem no início de um compilador.',
            objectives: [
                { id: 'l8-lex-obj-1', text: 'Relacionar tokens de uma linguagem de programação a linguagens regulares.' },
                { id: 'l8-lex-obj-2', text: 'Entender por que o scanner pode ser implementado por autômatos finitos determinísticos.' }
            ],
            prerequisites: [
                'Expressões regulares.',
                'AFD, AFN e determinização.',
                'Operações sobre linguagens regulares.'
            ],
            keywords: ['análise léxica', 'token', 'scanner', 'expressão regular', 'AFD'],
            estimatedMinutes: 18,
            references: [blauthCap2],
            summary: [
                { id: 'l8-lex-sum-1', text: 'Cada classe de token pode ser descrita por uma expressão regular.' },
                { id: 'l8-lex-sum-2', text: 'O analisador léxico reconhece o maior prefixo válido e entrega uma sequência de tokens ao restante do compilador.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-05-24',
            content: [
                {
                    type: 'text',
                    content: 'O livro apresenta a análise léxica como uma aplicação direta de linguagens regulares. O programa-fonte é uma palavra longa, mas o compilador não quer tratá-la caractere por caractere para sempre: ele primeiro agrupa trechos em unidades significativas, como identificadores, números, operadores, delimitadores e palavras reservadas.'
                },
                {
                    type: 'definition',
                    title: 'Token',
                    content: 'Um token é uma classe reconhecida pelo analisador léxico. A palavra concreta lida no programa, como contador ou 123, é uma ocorrência dessa classe. A classe identificador, por exemplo, costuma ser especificada por uma expressão regular.'
                },
                {
                    type: 'example',
                    title: 'Especificações regulares típicas',
                    content: 'Identificadores podem ser descritos por uma letra seguida de letras ou dígitos. Números inteiros podem ser descritos por um dígito seguido de zero ou mais dígitos. Espaços e comentários também são linguagens regulares, embora muitas vezes sejam descartados pelo scanner.'
                },
                {
                    type: 'algorithm',
                    title: 'Fluxo de construção do scanner',
                    content: [
                        'Escreva uma expressão regular para cada classe de token.',
                        'Una as expressões em uma especificação única, preservando prioridade entre tokens quando necessário.',
                        'Converta as expressões em AFN, depois determinize para obter um AFD.',
                        'Use o AFD para ler o maior prefixo aceito e devolver o token correspondente.'
                    ]
                },
                {
                    type: 'checkpoint',
                    title: 'Por que AFD é suficiente?',
                    content: 'Porque tokens usuais são descritos por linguagens regulares. O scanner precisa reconhecer padrões locais e finitos; análise de estrutura aninhada, como blocos e expressões sintáticas, fica para gramáticas livres de contexto.'
                }
            ]
        },
        {
            id: 'l8-texto-protocolos',
            title: 'Texto, Protocolos e Padrões',
            description: 'Outras leituras do livro para o mesmo núcleo regular: reconhecer padrões finitos em sequências.',
            objectives: [
                { id: 'l8-text-obj-1', text: 'Reconhecer aplicações de autômatos finitos fora de compiladores.' },
                { id: 'l8-text-obj-2', text: 'Separar reconhecimento regular de problemas que exigem memória não limitada.' }
            ],
            prerequisites: [
                'Linguagens regulares.',
                'AFDs e expressões regulares.'
            ],
            keywords: ['processamento de texto', 'protocolos', 'padrões', 'linguagens regulares'],
            estimatedMinutes: 12,
            references: [blauthCap2],
            summary: [
                { id: 'l8-text-sum-1', text: 'O mesmo formalismo aparece em filtros de texto, validadores simples e protocolos com número finito de modos.' },
                { id: 'l8-text-sum-2', text: 'Quando a aplicação exige contagem arbitrária aninhada, é sinal de que saímos do domínio regular.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-05-24',
            content: [
                {
                    type: 'text',
                    content: 'A motivação aplicada do livro não depende de muitos exemplos diferentes: o ponto central é que várias tarefas computacionais podem ser vistas como reconhecimento de palavras sobre um alfabeto. Quando a informação necessária cabe em uma quantidade finita de estados, autômatos finitos e expressões regulares são naturais.'
                },
                {
                    type: 'list',
                    title: 'Aplicações no escopo regular',
                    content: [
                        'Busca e validação de padrões em texto.',
                        'Reconhecimento de tokens em linguagens de programação.',
                        'Modelagem de protocolos simples com modos finitos.',
                        'Filtros que dependem de prefixos, sufixos, paridade ou ocorrência de subcadeias.'
                    ]
                },
                {
                    type: 'warning',
                    title: 'Limite conceitual',
                    content: 'Um AFD não mantém uma pilha nem uma memória proporcional à entrada. Se a tarefa exige parear quantidades arbitrárias ou acompanhar aninhamento sem limite fixo, o modelo regular deixa de ser a ferramenta certa.'
                },
                {
                    type: 'summary',
                    title: 'Leitura operacional',
                    content: 'Use linguagens regulares quando o problema puder ser resolvido por um número finito de situações relevantes. Essa é a ponte entre a teoria de autômatos e aplicações práticas como scanners e validadores.'
                }
            ]
        }
    ]
};
