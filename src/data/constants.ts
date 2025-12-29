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
        id: 'cfg',
        title: 'Gramáticas Livres de Contexto',
        desc: 'Derivações, árvores e ambiguidade.',
        icon: Braces
    },
    {
        id: 'pda',
        title: 'Autômatos de Pilha',
        desc: 'Reconhecimento de linguagens não regulares.',
        icon: Layers
    },
    {
        id: 'chomsky',
        title: 'Hierarquia de Chomsky',
        desc: 'Classes de linguagens (Tipos 0 a 3). Inclui o Autômato Linearmente Limitado (ALL) no Tipo 1.',
        icon: Split
    },
    {
        id: 'turing',
        title: 'Máquinas de Turing',
        desc: 'Decidibilidade e limites computacionais.',
        icon: Maximize
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
    // EXERCICIOS - FUNDAMENTOS
    // ========================================================================
    fundamentos: [
        {
            id: 1,
            nivel: 'facil',
            pergunta: 'Liste todas as palavras de tamanho <= 2 sobre Sigma = {a,b}.',
            respostaTexto: 'Sigma^0 = {ε}, Sigma^1 = {a, b}, Sigma^2 = {aa, ab, ba, bb}.'
        },
        {
            id: 2,
            nivel: 'facil',
            pergunta: 'Explique a diferença entre {ε} e ∅',
            respostaTexto: '{ε} contém a palavra vazia; ∅ não contém nenhuma palavra.'
        },
        {
            id: 3,
            nivel: 'medio',
            pergunta: 'Seja L = { w em {0,1}* | |w| é par }. L contém ε? Justifique.',
            respostaTexto: 'Sim. ε tem comprimento 0, que é par.'
        },
        {
            id: 4,
            nivel: 'medio',
            pergunta: 'Mostre que L* = {ε} ∪ L.L*.',
            respostaTexto: 'Toda palavra em L* é concatenação de zero (ε) ou mais elementos de L.'
        },
        {
            id: 5,
            nivel: 'dificil',
            pergunta: 'Dado L1 e L2 finitas, L1.L2 é finita? Prove.',
            respostaTexto: 'Sim. A concatenação de dois conjuntos finitos é finita, pois ha no máximo |L1|*|L2| palavras.'
        },
        {
            id: 6,
            nivel: 'dificil',
            pergunta: 'Descreva por propriedade a linguagem dos binários divisiveis por 4.',
            respostaTexto: 'L = { w em {0,1}* | w representa número binário com sufixo 00 }.'
        },
        {
            id: 7,
            nivel: 'facil',
            pergunta: 'Liste Sigma^3 para Sigma = {0,1}.',
            respostaTexto: 'Sigma^3 = {000, 001, 010, 011, 100, 101, 110, 111}.'
        },
        {
            id: 8,
            nivel: 'facil',
            pergunta: 'Para w = abba, liste todos os prefixos e sufixos.',
            respostaTexto: 'Prefixos: {ε, a, ab, abb, abba}. Sufixos: {ε, a, ba, bba, abba}.'
        },
        {
            id: 9,
            nivel: 'medio',
            pergunta: 'Explique a diferença entre L* e L+.',
            respostaTexto: 'L* permite zero ou mais concatenacoes (inclui ε). L+ permite uma ou mais (exclui ε).' 
        },
        {
            id: 10,
            nivel: 'medio',
            pergunta: 'D? um exemplo mostrando que (L1 U L2)* != L1* U L2*.',
            respostaTexto: 'Se L1={a}, L2={b}, então (L1 U L2)* = {a,b}* mas L1* U L2* = a* U b*.'
        },
        {
            id: 11,
            nivel: 'medio',
            pergunta: 'Defina o reverso L^R e calcule para L = {ab, ba}.',
            respostaTexto: 'L^R = {ba, ab} (reverte cada palavra).'
        },
        {
            id: 12,
            nivel: 'dificil',
            pergunta: 'Mostre que se L1 subset L2 então L1* subset L2*.',
            respostaTexto: 'Qualquer concatenação de palavras de L1 também e concatenação de palavras de L2, pois L1 subset L2.'
        }
    ],
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
        },
        {
            id: 4,
            nivel: 'facil',
            pergunta: 'Construa um AFD para L = { w em {a,b}* | w termina com a }.',
            dica: 'Dois estados: ultimo foi a ou nao. Estado final quando ultimo = a.',
            respostaTexto: 'q0 (ultimo nao-a) -a-> q1, -b-> q0; q1 (ultimo a) -a-> q1, -b-> q0.',
            testes: [
                { input: 'a', expected: 'accept' },
                { input: 'ba', expected: 'accept' },
                { input: 'aba', expected: 'accept' },
                { input: 'b', expected: 'reject' },
                { input: 'abb', expected: 'reject' },
                { input: '', expected: 'reject' }
            ]
        },
        {
            id: 5,
            nivel: 'medio',
            pergunta: 'Construa um AFD para L = { w | w contém a substring "abb" }.',
            dica: 'Estados lembram o maior sufixo que pode iniciar "abb".',
            respostaTexto: 'Use estados para: nenhum, "a", "ab", e aceito ("abb" visto).',
            testes: [
                { input: 'abb', expected: 'accept' },
                { input: 'aabb', expected: 'accept' },
                { input: 'ab', expected: 'reject' },
                { input: 'abba', expected: 'accept' },
                { input: 'baba', expected: 'reject' }
            ]
        },
        {
            id: 6,
            nivel: 'medio',
            pergunta: 'Construa um AFD para L = { w | w tem exatamente um "a" }.',
            dica: 'Estados: 0 a, 1 a, 2+ a (erro).',
            respostaTexto: 'q0 (0 a) -a-> q1, -b-> q0; q1 (1 a) -a-> q2, -b-> q1; q2 (>=2 a) loop.',
            testes: [
                { input: 'a', expected: 'accept' },
                { input: 'ba', expected: 'accept' },
                { input: 'bbab', expected: 'accept' },
                { input: '', expected: 'reject' },
                { input: 'aa', expected: 'reject' },
                { input: 'baba', expected: 'reject' }
            ]
        },
        {
            id: 7,
            nivel: 'medio',
            pergunta: 'Construa um AFD para L = { w | w tem no máximo dois "b" }.',
            dica: 'Estados contam b: 0, 1, 2, e erro (>=3).',
            respostaTexto: 'Quatro estados: 0b,1b,2b (finais), erro (nao final).',
            testes: [
                { input: '', expected: 'accept' },
                { input: 'b', expected: 'accept' },
                { input: 'abb', expected: 'accept' },
                { input: 'bbab', expected: 'reject' },
                { input: 'bbb', expected: 'reject' }
            ]
        },
        {
            id: 8,
            nivel: 'medio',
            pergunta: 'Construa um AFD para L = { w em {0,1}* | |w| mod 3 = 0 }.',
            dica: 'Use 3 estados para restos 0,1,2 do comprimento.',
            respostaTexto: 'q0 (resto 0) -0,1-> q1; q1 -0,1-> q2; q2 -0,1-> q0.',
            testes: [
                { input: '', expected: 'accept' },
                { input: '0', expected: 'reject' },
                { input: '10', expected: 'reject' },
                { input: '101', expected: 'accept' },
                { input: '111000', expected: 'accept' }
            ]
        },
        {
            id: 9,
            nivel: 'medio',
            pergunta: 'Construa um AFD para números binários divisiveis por 4.',
            dica: 'Basta rastrear os dois ultimos bits; aceite quando terminar com 00 (incluindo 0).',
            respostaTexto: 'Estados representam os sufixos possíveis: q0 (start/0), q1 (1), q2 (10), q3 (00/aceita).',
            testes: [
                { input: '0', expected: 'accept' },
                { input: '100', expected: 'accept' },
                { input: '10100', expected: 'accept' },
                { input: '1', expected: 'reject' },
                { input: '10', expected: 'reject' }
            ]
        },
        {
            id: 10,
            nivel: 'dificil',
            pergunta: 'Construa um AFD para L = { w | w comeca e termina com o mesmo símbolo }.',
            dica: 'Memorize o primeiro símbolo e acompanhe o ultimo.',
            respostaTexto: 'Use estados para primeiro=a/primeiro=b e se o ultimo coincide.'
        },
        {
            id: 11,
            nivel: 'medio',
            pergunta: 'Construa um AFD para L = { w | w não contém a substring "bb" }.',
            dica: 'Use um estado que lembra se o ultimo símbolo foi b, e um estado de erro.',
            respostaTexto: 'q0 (ultimo nao-b) -a-> q0, -b-> q1; q1 -a-> q0, -b-> erro; erro loop.',
            testes: [
                { input: '', expected: 'accept' },
                { input: 'aab', expected: 'accept' },
                { input: 'aba', expected: 'accept' },
                { input: 'bb', expected: 'reject' },
                { input: 'abbb', expected: 'reject' }
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
        },
        {
            id: 11,
            nivel: 'facil',
            pergunta: 'Reconheca identificadores maiusculos: [A-Z][A-Z0-9_]*',
            dica: 'Comece com letra maiuscula e permita letras, digitos e _.',
            respostaTexto: 'Ex.: ABC, A1, A_B válidos; aA e 1A inválidos.',
            testes: [
                { input: 'ABC', expected: 'accept' },
                { input: 'A1', expected: 'accept' },
                { input: 'A_B', expected: 'accept' },
                { input: 'aA', expected: 'reject' },
                { input: '1A', expected: 'reject' }
            ]
        },
        {
            id: 12,
            nivel: 'medio',
            pergunta: 'Reconheca hexadecimal: 0x[0-9a-fA-F]+',
            dica: 'Exige prefixo 0x e ao menos um digito hex.',
            respostaTexto: 'Ex.: 0x1A, 0xff aceitos; 0x, x1 rejeitados.',
            testes: [
                { input: '0x1A', expected: 'accept' },
                { input: '0xff', expected: 'accept' },
                { input: '0x', expected: 'reject' },
                { input: 'x1', expected: 'reject' }
            ]
        },
        {
            id: 13,
            nivel: 'medio',
            pergunta: 'Reconheca inteiros com sinal: [+-]?(0|[1-9][0-9]*)',
            dica: 'Sinal opcional, sem zeros a esquerda.',
            respostaTexto: 'Ex.: +7, -2, 0 aceitos; 00, +01 rejeitados.',
            testes: [
                { input: '+7', expected: 'accept' },
                { input: '-2', expected: 'accept' },
                { input: '0', expected: 'accept' },
                { input: '+01', expected: 'reject' },
                { input: '00', expected: 'reject' }
            ]
        },
        {
            id: 14,
            nivel: 'dificil',
            pergunta: 'Reconheca ponto flutuante: [+-]?[0-9]+\.[0-9]+(e[+-]?[0-9]+)?',
            dica: 'Obrigatorio ponto e parte fracionaria; expoente opcional.',
            respostaTexto: 'Ex.: 3.14, -0.5, 2.0e10 aceitos; 3., .5 rejeitados.',
            testes: [
                { input: '3.14', expected: 'accept' },
                { input: '-0.5', expected: 'accept' },
                { input: '2.0e10', expected: 'accept' },
                { input: '3.', expected: 'reject' },
                { input: '.5', expected: 'reject' }
            ]
        },
        {
            id: 15,
            nivel: 'medio',
            pergunta: 'Reconheca o operador relacional: ==, !=, <=, >=, <, >',
            dica: 'Se comeca com = ou !, precisa de segundo =.',
            respostaTexto: 'Tokens: ==, !=, <=, >=, <, >.'
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
        },
        {
            id: 5,
            nivel: 'facil',
            pergunta: 'AFN para palavras que contém a substring "ab".',
            dica: 'Loop em q0 com a,b e chute o inicio do padrao.',
            respostaTexto: 'q0 loop em a,b; transição q0 -a-> q1 -b-> q2(final).'
        },
        {
            id: 6,
            nivel: 'medio',
            pergunta: 'AFN para palavras que terminam em "ba".',
            dica: 'Como termina em "ba", chute quando ler b.',
            respostaTexto: 'q0 loop em a,b; q0 -b-> q1 -a-> q2(final).'
        },
        {
            id: 7,
            nivel: 'medio',
            pergunta: 'Construa um AFN para L = a* b* (a e depois b).',
            dica: 'Permita ficar em a e depois mudar para b com uma transição.',
            respostaTexto: 'q0 loop em a; q0 -b-> q1; q1 loop em b; q0 e q1 finais.'
        },
        {
            id: 8,
            nivel: 'medio',
            pergunta: 'AFN para L = { w | w inicia com a ou termina com b }.',
            dica: 'Use uniao de dois AFNs simples.',
            respostaTexto: 'Um ramo para prefixo a e outro para sufixo b, ambos a partir do inicial.'
        },
        {
            id: 9,
            nivel: 'dificil',
            pergunta: 'Descreva o processo de conversao de um AFN para AFD.',
            dica: 'Use subconjuntos de estados.',
            respostaTexto: 'Cada estado do AFD representa um conjunto de estados do AFN; estados finais são conjuntos que contém um final.'
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
        },
        {
            id: 12,
            nivel: 'medio',
            pergunta: 'Construa um AFN-ε para L = (ab)*.',
            dica: 'Use ε para ligar repeticao do bloco ab.',
            respostaTexto: 'Bloco a->b com ε de retorno e ε de pulo para aceitar ε.'
        },
        {
            id: 13,
            nivel: 'medio',
            pergunta: 'AFN-ε para L = a? b* (a opcional).',
            dica: 'Use uma transição ε para pular o a.',
            respostaTexto: 'Inicial tem ε para caminho sem a e transição a para caminho com a; ambos vao para loop de b.'
        },
        {
            id: 14,
            nivel: 'dificil',
            pergunta: 'AFN-ε para L = (a|b)*abb.',
            dica: 'Combine um loop com um bloco final abb via ε.',
            respostaTexto: 'Loop em a,b e ε para um caminho que reconhece abb.'
        },
        {
            id: 15,
            nivel: 'medio',
            pergunta: 'Explique como eliminar transições ε de um AFN.',
            dica: 'Use fecho-ε.',
            respostaTexto: 'Calcule fecho-ε de cada estado e atualize transições; estados finais são aqueles cujo fecho contém final.'
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
            respostaTexto: '(b|ab)*(ε|a)',
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
        },
        {
            id: 7,
            nivel: 'facil',
            pergunta: 'ER para binários que terminam em 01.',
            dica: 'Use (0|1)* como prefixo.',
            respostaTexto: '(0|1)*01'
        },
        {
            id: 8,
            nivel: 'facil',
            pergunta: 'ER para palavras que contém "ab".',
            dica: 'Prefixo livre, depois ab, depois sufixo livre.',
            respostaTexto: '(a|b)*ab(a|b)*'
        },
        {
            id: 9,
            nivel: 'medio',
            pergunta: 'ER para palavras que comecam com a e terminam com b.',
            dica: 'Um a no inicio e um b no fim.',
            respostaTexto: 'a(a|b)*b'
        },
        {
            id: 10,
            nivel: 'medio',
            pergunta: 'ER para palavras de tamanho multiplo de 3 sobre {a,b}.',
            dica: 'Agrupe blocos de 3.',
            respostaTexto: '((a|b)(a|b)(a|b))*'
        },
        {
            id: 11,
            nivel: 'medio',
            pergunta: 'ER para palavras com exatamente um a.',
            dica: 'b* antes e depois do a.',
            respostaTexto: 'b*ab*'
        },
        {
            id: 12,
            nivel: 'dificil',
            pergunta: 'ER para palavras que não contém "bb".',
            dica: 'Depois de b deve vir a ou fim.',
            respostaTexto: '(a|ba)*(ε|b)'
        }
    ],

    // ========================================================================
    // EXERCÍCIOS - GRAMÁTICA
    // ========================================================================
            gr: [
        {
            id: 12,
            nivel: 'facil',
            pergunta: "Escreva uma gramatica regular para L = { w | w termina em 'ab' }.",
            dica: 'Pense em um nao-terminal que garante o sufixo.',
            respostaTexto: 'S -> a A | b S\nA -> b | a A',
            mode: 'grammar',
            testes: [
                { input: 'ab', expected: 'accept' },
                { input: 'aab', expected: 'accept' },
                { input: 'bab', expected: 'accept' },
                { input: 'aaab', expected: 'accept' },
                { input: '', expected: 'reject' },
                { input: 'a', expected: 'reject' },
                { input: 'ba', expected: 'reject' },
                { input: 'abb', expected: 'reject' }
            ]
        },
        {
            id: 13,
            nivel: 'medio',
            pergunta: "Gramatica regular para L = { w | w tem numero par de 'a' }.",
            dica: 'Dois estados: par e impar; b faz loop.',
            respostaTexto: 'S -> b S | a A | eps\nA -> b A | a S',
            mode: 'grammar',
            testes: [
                { input: '', expected: 'accept' },
                { input: 'b', expected: 'accept' },
                { input: 'aa', expected: 'accept' },
                { input: 'aba', expected: 'accept' },
                { input: 'a', expected: 'reject' },
                { input: 'ab', expected: 'reject' }
            ]
        },
        {
            id: 14,
            nivel: 'facil',
            pergunta: 'Gramatica regular para L = (ab)*.',
            dica: 'Alterna entre produzir a e b.',
            respostaTexto: 'S -> a A | eps\nA -> b S',
            mode: 'grammar',
            testes: [
                { input: '', expected: 'accept' },
                { input: 'ab', expected: 'accept' },
                { input: 'abab', expected: 'accept' },
                { input: 'a', expected: 'reject' },
                { input: 'aba', expected: 'reject' },
                { input: 'abb', expected: 'reject' }
            ]
        },
        {
            id: 15,
            nivel: 'facil',
            pergunta: 'Gramatica regular para L = 0*1*.',
            dica: 'Fase de 0s e depois fase de 1s.',
            respostaTexto: 'S -> 0 S | A\nA -> 1 A | eps',
            mode: 'grammar',
            testes: [
                { input: '', expected: 'accept' },
                { input: '0', expected: 'accept' },
                { input: '111', expected: 'accept' },
                { input: '0011', expected: 'accept' },
                { input: '10', expected: 'reject' },
                { input: '010', expected: 'reject' }
            ]
        },
        {
            id: 16,
            nivel: 'medio',
            pergunta: 'Gramatica regular para palavras que terminam em 01.',
            dica: 'Garanta o sufixo 01.',
            respostaTexto: 'S -> 0 S | 1 S | 0 A\nA -> 1',
            mode: 'grammar',
            testes: [
                { input: '01', expected: 'accept' },
                { input: '001', expected: 'accept' },
                { input: '101', expected: 'accept' },
                { input: '', expected: 'reject' },
                { input: '1', expected: 'reject' },
                { input: '10', expected: 'reject' }
            ]
        },
        {
            id: 17,
            nivel: 'medio',
            pergunta: 'Gramatica regular para palavras com numero par de b.',
            dica: 'Use dois nao-terminais para contar b par/impar.',
            respostaTexto: 'S -> a S | b A | eps\nA -> a A | b S',
            mode: 'grammar',
            testes: [
                { input: '', expected: 'accept' },
                { input: 'bb', expected: 'accept' },
                { input: 'abba', expected: 'accept' },
                { input: 'b', expected: 'reject' },
                { input: 'abb', expected: 'reject' }
            ]
        },
        {
            id: 18,
            nivel: 'dificil',
            pergunta: 'Gramatica regular para palavras de tamanho multiplo de 3 sobre {a,b}.',
            dica: 'Ciclo de 3 producoes.',
            respostaTexto: 'S -> a A | b A | eps\nA -> a B | b B\nB -> a S | b S',
            mode: 'grammar',
            testes: [
                { input: '', expected: 'accept' },
                { input: 'aba', expected: 'accept' },
                { input: 'bbb', expected: 'accept' },
                { input: 'aabbaa', expected: 'accept' },
                { input: 'a', expected: 'reject' },
                { input: 'ab', expected: 'reject' },
                { input: 'abab', expected: 'reject' }
            ]
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
        },
        {
            id: 9,
            nivel: 'facil',
            pergunta: 'Quando dois estados são distinguiveis?',
            respostaTexto: 'Quando existe uma palavra w que leva um a final e outro a nao-final.'
        },
        {
            id: 10,
            nivel: 'medio',
            pergunta: 'Explique por que estados inalcancaveis podem ser removidos antes da minimizacao.',
            respostaTexto: 'Eles nunca são visitados a partir do inicial, logo não afetam a linguagem.'
        },
        {
            id: 11,
            nivel: 'medio',
            pergunta: 'Qual a primeira etapa do algoritmo de tabela?',
            respostaTexto: 'Marcar todos os pares (final, nao-final) como distinguiveis.'
        },
        {
            id: 12,
            nivel: 'medio',
            pergunta: 'Em um AFD total, o estado de erro pode ser removido?',
            respostaTexto: 'Nao, pois ele garante transições definidas; removendo, o AFD deixa de ser total.'
        },
        {
            id: 13,
            nivel: 'dificil',
            pergunta: 'Explique por que minimizacao não depende da rotulagem dos estados.',
            respostaTexto: 'A minimizacao depende apenas da equivalência comportamental, não dos nomes.'
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
        },
        {
            id: 15,
            nivel: 'medio',
            pergunta: 'Como converter uma maquina de Mealy em Moore?',
            respostaTexto: 'Divida estados quando saidas diferentes ocorrem em transições que entram no mesmo estado.'
        },
        {
            id: 16,
            nivel: 'medio',
            pergunta: 'Em Moore, a saida depende de que?',
            respostaTexto: 'Somente do estado atual.'
        },
        {
            id: 17,
            nivel: 'medio',
            pergunta: 'Em Mealy, a saida pode mudar quando?',
            respostaTexto: 'No momento da transição, lendo o símbolo.'
        },
        {
            id: 18,
            nivel: 'dificil',
            pergunta: 'Explique por que Mealy pode usar menos estados que Moore.',
            respostaTexto: 'Como a saida depende da transição, não e necessario duplicar estados para representar saidas diferentes.'
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
        },
        {
            id: 16,
            nivel: 'medio',
            pergunta: 'Use o lema para mostrar que L = { 0^n 1^n | n >= 0 } não é regular.',
            dica: 'Bombeie dentro do bloco de 0s.',
            respostaTexto: 'Escolha w = 0^p 1^p e bombeie os 0s; a quantidade de 0s muda e a de 1s nao.'
        },
        {
            id: 17,
            nivel: 'dificil',
            pergunta: 'Use o lema para mostrar que L = { a^n b^n c^n | n >= 0 } não é regular.',
            dica: 'Bombeie apenas em um dos blocos.',
            respostaTexto: 'Qualquer bombeamento altera um bloco e quebra a igualdade entre quantidades.'
        },
        {
            id: 18,
            nivel: 'dificil',
            pergunta: 'Mostre que L = { ww | w em {0,1}* } não é regular.',
            dica: 'Use w = 0^p 1^p 0^p 1^p ou argumento de divisao.',
            respostaTexto: 'Bombeando dentro do primeiro bloco, a metade esquerda muda sem alterar a direita.'
        },
        {
            id: 19,
            nivel: 'dificil',
            pergunta: 'Mostre que L = { a^n b^m a^n | n,m >= 0 } não é regular.',
            dica: 'Bombeie nos a iniciais.',
            respostaTexto: 'Bombeamento nos a iniciais quebra o espelho do final.'
        },
        {
            id: 20,
            nivel: 'medio',
            pergunta: 'Explique por que o lema não serve para provar que uma linguagem é regular.',
            respostaTexto: 'Porque o lema só da uma condição necessaria; linguagens nao-regulares também podem satisfazer.'
        }
    ],

    // ========================================================================
    // EXERCÍCIOS - GLC (CFG)
    // ========================================================================
            cfg: [
        {
            id: 1,
            nivel: 'facil',
            pergunta: 'Escreva uma GLC para L = { a^n b^n | n >= 0 }.',
            dica: 'Use uma producao recursiva que empilha a e desempilha b.',
            respostaTexto: 'S -> a S b | eps',
            mode: 'grammar',
            testes: [
                { input: '', expected: 'accept' },
                { input: 'ab', expected: 'accept' },
                { input: 'aabb', expected: 'accept' },
                { input: 'aaabbb', expected: 'accept' },
                { input: 'aab', expected: 'reject' },
                { input: 'abb', expected: 'reject' }
            ]
        },
        {
            id: 2,
            nivel: 'medio',
            pergunta: 'Dada a gramatica S -> a S b | eps, derive aabb.',
            respostaTexto: 'S => a S b => a a S b b => a a b b.',
            mode: 'text'
        },
        {
            id: 3,
            nivel: 'medio',
            pergunta: 'A gramatica S -> S S | a e ambigua? Justifique com uma palavra.',
            respostaTexto: 'Sim. A palavra "aa" tem duas arvores de derivacao distintas: (S S) e (S (S)).',
            mode: 'text'
        },
        {
            id: 4,
            nivel: 'dificil',
            pergunta: 'Explique por que a linguagem { a^n b^n c^n | n >= 0 } nao e livre de contexto.',
            dica: 'Use o lema do bombeamento para CFL ou intersecao com regular.',
            respostaTexto: 'Qualquer bombeamento quebra a igualdade entre os tres blocos; logo nao e CFL.',
            mode: 'text'
        },
        {
            id: 5,
            nivel: 'medio',
            pergunta: 'Escreva uma GLC para palindromos de comprimento par sobre {a,b}.',
            dica: 'Produza a mesma letra nas extremidades e use eps como base.',
            respostaTexto: 'S -> a S a | b S b | eps',
            mode: 'grammar',
            testes: [
                { input: '', expected: 'accept' },
                { input: 'aa', expected: 'accept' },
                { input: 'abba', expected: 'accept' },
                { input: 'baab', expected: 'accept' },
                { input: 'a', expected: 'reject' },
                { input: 'aba', expected: 'reject' }
            ]
        }
    ],
// ========================================================================
    // EXERCÍCIOS - AUTÔMATOS DE PILHA (AP)
    // ========================================================================
            pda: [
        {
            id: 1,
            nivel: 'facil',
            pergunta: 'Construa um AP que reconhece L = { a^n b^n | n >= 0 }.',
            dica: 'Empilhe um simbolo para cada a e desempilhe para cada b. Configure a pilha inicial como Z.',
            respostaTexto: 'Empilhe para cada a e desempilhe para cada b; aceite por pilha vazia ou estado final.',
            mode: 'automaton',
            tipo: 'AP',
            testes: [
                { input: '', expected: 'accept' },
                { input: 'ab', expected: 'accept' },
                { input: 'aabb', expected: 'accept' },
                { input: 'aaabbb', expected: 'accept' },
                { input: 'aab', expected: 'reject' },
                { input: 'abb', expected: 'reject' }
            ]
        },
        {
            id: 2,
            nivel: 'medio',
            pergunta: 'Qual a diferenca entre aceitar por estado final e por pilha vazia?',
            respostaTexto: 'Estado final depende do estado alcancado; pilha vazia depende do conteudo da pilha. Sao equivalentes em poder, mas nao sempre na mesma maquina.',
            mode: 'text'
        },
        {
            id: 3,
            nivel: 'medio',
            pergunta: 'Explique como um AP pode reconhecer palindromos sobre {a,b}.',
            respostaTexto: 'Empilhe a primeira metade, use eps para adivinhar o meio e depois desempilhe comparando com a segunda metade.',
            mode: 'text'
        }
    ],
// ========================================================================
    // EXERCÍCIOS - HIERARQUIA DE CHOMSKY
    // ========================================================================
    chomsky: [
        {
            id: 1,
            nivel: 'facil',
            pergunta: 'Classifique L = { a^n b^n | n ≥ 0 } na hierarquia de Chomsky.',
            respostaTexto: 'É tipo 2 (livre de contexto), não regular.'
        },
        {
            id: 2,
            nivel: 'medio',
            pergunta: 'Classifique a gramática S -> a S b | ε.',
            respostaTexto: 'É uma gramática livre de contexto (tipo 2).'
        },
        {
            id: 3,
            nivel: 'medio',
            pergunta: 'Dê um exemplo de linguagem tipo 1 (sensível ao contexto).',
            respostaTexto: 'L = { a^n b^n c^n | n ≥ 0 } é um exemplo clássico.'
        }
    ],

    // ========================================================================
    // EXERCÍCIOS - MÁQUINAS DE TURING / DECIDIBILIDADE
    // ========================================================================
            turing: [
        {
            id: 1,
            nivel: 'medio',
            pergunta: 'O problema da parada e decidivel? Explique.',
            respostaTexto: 'Nao. O problema da parada e indecidivel para maquinas de Turing.',
            mode: 'text'
        },
        {
            id: 2,
            nivel: 'medio',
            pergunta: 'Qual a diferenca entre decidivel e semi-decidivel?',
            respostaTexto: 'Decidivel sempre termina com sim/nao; semi-decidivel pode nao terminar em instancias negativas.',
            mode: 'text'
        },
        {
            id: 3,
            nivel: 'dificil',
            pergunta: 'Explique por que a equivalencia de maquinas de Turing e indecidivel.',
            respostaTexto: 'Reduz-se do problema da parada: se fosse decidivel, resolveriamos a parada por reducao.',
            mode: 'text'
        },
        {
            id: 4,
            nivel: 'facil',
            pergunta: 'Construa uma MT que aceita palavras binarias que terminam em 1.',
            dica: 'Use uma transicao START -> START, R no estado inicial. Varra a entrada ate BLANK e aceite se o ultimo simbolo lido for 1.',
            respostaTexto: 'Uma MT que varre ate o fim e aceita se o ultimo simbolo for 1.',
            mode: 'automaton',
            tipo: 'MT',
            testes: [
                { input: '1', expected: 'accept' },
                { input: '101', expected: 'accept' },
                { input: '001', expected: 'accept' },
                { input: '', expected: 'reject' },
                { input: '0', expected: 'reject' },
                { input: '10', expected: 'reject' }
            ]
        }
    ]
};
