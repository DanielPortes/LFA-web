import { Layers, Zap, Code, FileText, Split, Filter, Braces, ArrowRightLeft, Maximize } from 'lucide-react';
import type { Exercicio, Topic } from '../types';

export const topicos: Topic[] = [
    {
        id: 'fundamentos',
        title: 'Fundamentos & Conjuntos',
        desc: 'Base matemática, Alfabetos, Palavras e Linguagens.',
        icon: Braces
    },
    {
        id: 'afd',
        title: 'Autômatos Finitos (AFD)',
        desc: 'Definição formal, diagramas e processamento determinístico.',
        icon: Layers
    },
    {
        id: 'lex',
        title: 'Definição Léxica',
        desc: 'Aplicações práticas em compiladores e tokens.',
        icon: FileText
    },
    {
        id: 'afn',
        title: 'Não-Determinismo (AFN)',
        desc: 'Múltiplos caminhos e processamento paralelo abstrato.',
        icon: Zap
    },
    {
        id: 'afne',
        title: 'Transições Vazias (AFNε)',
        desc: 'O poder do silêncio (ε) e conversões.',
        icon: Filter
    },
    {
        id: 'er',
        title: 'Expressões Regulares',
        desc: 'Padrões de texto e equivalência com autômatos.',
        icon: Code
    },
    {
        id: 'gr',
        title: 'Gramáticas Regulares',
        desc: 'Regras de produção para linguagens regulares.',
        icon: Split
    },
    {
        id: 'moore_mealy',
        title: 'Máquinas de Moore e Mealy',
        desc: 'Autômatos com saída (Transdutores).',
        icon: ArrowRightLeft
    },
    {
        id: 'pumping',
        title: 'Lema do Bombeamento',
        desc: 'Provando que linguagens não são regulares.',
        icon: Maximize
    }
];

export const exerciciosDB: Record<string, Exercicio[]> = {
    // ========================================================================
    // EXERCÍCIOS - AFD
    // ========================================================================
    afd: [
        {
            id: 1,
            nivel: 'facil',
            pergunta: "Construa um AFD para L = { w | w começa com 'a' e tem tamanho >= 2 }.",
            dica: 'Estados: q0 (ini), q1 (leu a), q2 (leu aa ou ab → final). Lembre do estado de erro se começar com b.',
            respostaAutomato: {
                tipo: 'AFD',
                estados: [
                    { id: 'q0', label: 'Ini', x: 100, y: 200, isFinal: false, isInicial: true },
                    { id: 'q1', label: 'q1', x: 250, y: 200, isFinal: false, isInicial: false },
                    { id: 'q2', label: 'Fim', x: 400, y: 200, isFinal: true, isInicial: false },
                    { id: 'err', label: 'Erro', x: 250, y: 350, isFinal: false, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
                    { id: 't2', de: 'q0', para: 'err', simbolo: 'b', curvatura: 0 },
                    { id: 't3', de: 'q1', para: 'q2', simbolo: 'a,b', curvatura: 0 },
                    { id: 't4', de: 'q2', para: 'q2', simbolo: 'a,b', curvatura: -30 },
                    { id: 't5', de: 'err', para: 'err', simbolo: 'a,b', curvatura: 0 }
                ]
            },
            testes: [
                { input: 'aa', expected: 'accept' },
                { input: 'ab', expected: 'accept' },
                { input: 'aaa', expected: 'accept' },
                { input: 'abab', expected: 'accept' },
                { input: 'a', expected: 'reject' },
                { input: 'b', expected: 'reject' },
                { input: 'ba', expected: 'reject' },
                { input: '', expected: 'reject' }
            ]
        },
        {
            id: 2,
            nivel: 'medio',
            pergunta: 'Construa o AFD para números binários divisíveis por 3.',
            dica: 'Estados representam o resto da divisão por 3 (0, 1, 2). Ler 0: 2R mod 3. Ler 1: (2R+1) mod 3.',
            respostaTexto: 'q0 (resto 0) -0-> q0, -1-> q1\nq1 (resto 1) -0-> q2, -1-> q0\nq2 (resto 2) -0-> q1, -1-> q2',
            testes: [
                { input: '0', expected: 'accept' },
                { input: '11', expected: 'accept' },
                { input: '110', expected: 'accept' },
                { input: '1001', expected: 'accept' },
                { input: '1', expected: 'reject' },
                { input: '10', expected: 'reject' },
                { input: '100', expected: 'reject' },
                { input: '111', expected: 'reject' }
            ]
        },
        {
            id: 3,
            nivel: 'facil',
            pergunta: "Construa um AFD para L = { w | w tem número par de 'a' }.",
            dica: "Use dois estados: par e ímpar. 'b' faz loop.",
            respostaTexto: "q0 (par) -a-> q1, -b-> q0\nq1 (ímpar) -a-> q0, -b-> q1",
            testes: [
                { input: '', expected: 'accept' },
                { input: 'b', expected: 'accept' },
                { input: 'aa', expected: 'accept' },
                { input: 'aba', expected: 'accept' },
                { input: 'a', expected: 'reject' },
                { input: 'ab', expected: 'reject' },
                { input: 'baa', expected: 'reject' }
            ]
        }
    ],

    // ========================================================================
    // EXERCÍCIOS - LÉXICO
    // ========================================================================
    lex: [
        {
            id: 9,
            nivel: 'facil',
            pergunta: 'Reconheça identificadores minúsculos: [a-z][a-z0-9_]*',
            dica: "Comece com letra, depois permita letra, dígito e '_'.",
            respostaTexto: 'Ex.: a, ab, a1, a_b são válidos; 1a não é.',
            testes: [
                { input: 'a', expected: 'accept' },
                { input: 'abc', expected: 'accept' },
                { input: 'a1', expected: 'accept' },
                { input: 'a_b', expected: 'accept' },
                { input: '1a', expected: 'reject' },
                { input: '_a', expected: 'reject' },
                { input: '', expected: 'reject' }
            ]
        },
        {
            id: 10,
            nivel: 'medio',
            pergunta: 'Reconheça inteiros decimais: 0 ou [1-9][0-9]*',
            dica: 'Não aceite zeros à esquerda (exceto o próprio 0).',
            respostaTexto: 'Ex.: 0, 7, 42 aceitos; 00, 01 rejeitados.',
            testes: [
                { input: '0', expected: 'accept' },
                { input: '7', expected: 'accept' },
                { input: '42', expected: 'accept' },
                { input: '00', expected: 'reject' },
                { input: '01', expected: 'reject' },
                { input: 'a1', expected: 'reject' },
                { input: '', expected: 'reject' }
            ]
        }
    ],

    // ========================================================================
    // EXERCÍCIOS - AFN
    // ========================================================================
    afn: [
        {
            id: 3,
            nivel: 'facil',
            pergunta: "AFN para palavras terminadas em 'aba'.",
            dica: "Loop no q0 com a,b. Transição q0->q1 com 'a' para começar o padrão.",
            respostaTexto: 'q0(loop) -a-> q1 -b-> q2 -a-> q3(final)',
            testes: [
                { input: 'aba', expected: 'accept' },
                { input: 'aaba', expected: 'accept' },
                { input: 'baba', expected: 'accept' },
                { input: 'ab', expected: 'reject' },
                { input: 'abba', expected: 'reject' }
            ]
        },
        {
            id: 4,
            nivel: 'dificil',
            pergunta: 'Converta o AFN do exercício anterior para AFD.',
            dica: 'Faça a tabela de subconjuntos. Estado inicial {q0}. De {q0} lendo a vai para {q0, q1}.',
            respostaTexto: 'Estados do AFD: {q0}, {q0, q1}, {q0, q2}, {q0, q1, q3}...'
        }
    ],

    // ========================================================================
    // EXERCÍCIOS - AFNε
    // ========================================================================
    afne: [
        {
            id: 11,
            nivel: 'medio',
            pergunta: 'Construa um AFNε para L = { a } ∪ { bb } ∪ { ccc }.',
            dica: 'Use um estado inicial com transições ε para três caminhos.',
            respostaTexto: 'Um ramo para a, outro para bb e outro para ccc, todos a partir do início via ε.',
            respostaAutomato: {
                tipo: 'AFN',
                estados: [
                    { id: 'i', label: 'i', x: 80, y: 200, isFinal: false, isInicial: true },
                    { id: 'a0', label: 'a0', x: 200, y: 80, isFinal: false, isInicial: false },
                    { id: 'a1', label: 'a1', x: 320, y: 80, isFinal: true, isInicial: false },
                    { id: 'b0', label: 'b0', x: 200, y: 200, isFinal: false, isInicial: false },
                    { id: 'b1', label: 'b1', x: 320, y: 200, isFinal: false, isInicial: false },
                    { id: 'b2', label: 'b2', x: 440, y: 200, isFinal: true, isInicial: false },
                    { id: 'c0', label: 'c0', x: 200, y: 320, isFinal: false, isInicial: false },
                    { id: 'c1', label: 'c1', x: 320, y: 320, isFinal: false, isInicial: false },
                    { id: 'c2', label: 'c2', x: 440, y: 320, isFinal: false, isInicial: false },
                    { id: 'c3', label: 'c3', x: 560, y: 320, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'i', para: 'a0', simbolo: 'ε', curvatura: 0 },
                    { id: 't2', de: 'i', para: 'b0', simbolo: 'ε', curvatura: 0 },
                    { id: 't3', de: 'i', para: 'c0', simbolo: 'ε', curvatura: 0 },
                    { id: 't4', de: 'a0', para: 'a1', simbolo: 'a', curvatura: 0 },
                    { id: 't5', de: 'b0', para: 'b1', simbolo: 'b', curvatura: 0 },
                    { id: 't6', de: 'b1', para: 'b2', simbolo: 'b', curvatura: 0 },
                    { id: 't7', de: 'c0', para: 'c1', simbolo: 'c', curvatura: 0 },
                    { id: 't8', de: 'c1', para: 'c2', simbolo: 'c', curvatura: 0 },
                    { id: 't9', de: 'c2', para: 'c3', simbolo: 'c', curvatura: 0 }
                ]
            },
            testes: [
                { input: 'a', expected: 'accept' },
                { input: 'bb', expected: 'accept' },
                { input: 'ccc', expected: 'accept' },
                { input: '', expected: 'reject' },
                { input: 'b', expected: 'reject' },
                { input: 'cc', expected: 'reject' },
                { input: 'ab', expected: 'reject' }
            ]
        }
    ],

    // ========================================================================
    // EXERCÍCIOS - ER
    // ========================================================================
    er: [
        {
            id: 5,
            nivel: 'facil',
            pergunta: "ER para palavras que não contêm 'aa'.",
            dica: "Todo 'a' deve ser seguido de 'b' ou ser o fim.",
            respostaTexto: '(b + ab)*(ε + a)',
            testes: [
                { input: '', expected: 'accept' },
                { input: 'a', expected: 'accept' },
                { input: 'b', expected: 'accept' },
                { input: 'ab', expected: 'accept' },
                { input: 'aba', expected: 'accept' },
                { input: 'aa', expected: 'reject' },
                { input: 'aab', expected: 'reject' },
                { input: 'baa', expected: 'reject' }
            ]
        },
        {
            id: 6,
            nivel: 'medio',
            pergunta: "ER para paridade de 'a's (número par).",
            dica: "Os 'b's podem estar em qualquer lugar.",
            respostaTexto: '(b*ab*a)*b*',
            testes: [
                { input: '', expected: 'accept' },
                { input: 'b', expected: 'accept' },
                { input: 'bb', expected: 'accept' },
                { input: 'aa', expected: 'accept' },
                { input: 'abba', expected: 'accept' },
                { input: 'a', expected: 'reject' },
                { input: 'ab', expected: 'reject' },
                { input: 'baa', expected: 'reject' }
            ]
        }
    ],

    // ========================================================================
    // EXERCÍCIOS - GRAMÁTICA
    // ========================================================================
    gr: [
        {
            id: 12,
            nivel: 'facil',
            pergunta: "Escreva uma gramática regular para L = { w | w termina em 'ab' }.",
            dica: 'Pense em um não-terminal que garante o sufixo.',
            respostaTexto: 'S -> aA | bS\nA -> b | aA'
        },
        {
            id: 13,
            nivel: 'medio',
            pergunta: "Gramática regular para L = { w | w tem número par de 'a' }.",
            dica: 'Dois estados: par e ímpar; b faz loop.',
            respostaTexto: 'S -> bS | aA | ε\nA -> bA | aS'
        }
    ],

    // ========================================================================
    // EXERCÍCIOS - MINIMIZAÇÃO
    // ========================================================================
    minimizacao: [
        {
            id: 7,
            nivel: 'facil',
            pergunta: 'Dois estados são equivalentes se...',
            respostaTexto: 'Para qualquer entrada w, ambos levam a estados finais ou ambos levam a não-finais.'
        },
        {
            id: 8,
            nivel: 'medio',
            pergunta: "Minimize o autômato: q0->q1(a), q1->q0(a). Ambos finais.",
            dica: 'Se q0 e q1 são finais e reagem igual, eles viram um só.',
            respostaTexto: "Estado único {q0, q1} com loop em 'a'."
        }
    ],

    // ========================================================================
    // EXERCÍCIOS - MOORE/MEALY
    // ========================================================================
    moore_mealy: [
        {
            id: 14,
            nivel: 'facil',
            pergunta: 'Explique a diferença entre máquinas de Moore e Mealy.',
            respostaTexto: 'Moore produz saída por estado; Mealy produz saída por transição. Em Moore a saída muda quando o estado muda, em Mealy a saída pode mudar no mesmo símbolo.'
        }
    ],

    // ========================================================================
    // EXERCÍCIOS - LEMA DO BOMBEAMENTO
    // ========================================================================
    pumping: [
        {
            id: 15,
            nivel: 'medio',
            pergunta: 'Use o lema do bombeamento para mostrar que L = { a^n b^n | n ≥ 0 } não é regular.',
            dica: 'Escolha w = a^p b^p e bombeie dentro do bloco de a.',
            respostaTexto: 'Assuma regular e pegue w = a^p b^p. Ao bombear a^k com k>0, o número de a muda e o de b não, então a palavra sai de L. Contradição.'
        }
    ]
};
