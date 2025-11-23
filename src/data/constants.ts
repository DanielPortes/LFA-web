import { Layers, Zap, Code, FileText, Split, Minimize2, Filter, Braces, ArrowRightLeft, Maximize, type LucideIcon } from 'lucide-react';
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
            dica: "Estados: q0 (ini), q1 (leu a), q2 (leu aa ou ab -> final). Lembre do estado de erro se começar com b.",
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
            }
        },
        {
            id: 2,
            nivel: 'medio',
            pergunta: "Construa o AFD para números binários divisíveis por 3.",
            dica: "Estados representam o resto da divisão por 3 (0, 1, 2). Ler 0: 2R mod 3. Ler 1: (2R+1) mod 3.",
            respostaTexto: "q0 (resto 0) -0-> q0, -1-> q1\nq1 (resto 1) -0-> q2, -1-> q0\nq2 (resto 2) -0-> q1, -1-> q2"
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
            respostaTexto: "q0(loop) -a-> q1 -b-> q2 -a-> q3(final)"
        },
        {
            id: 4,
            nivel: 'dificil',
            pergunta: "Converta o AFN do exercício anterior para AFD.",
            dica: "Faça a tabela de subconjuntos. Estado inicial {q0}. De {q0} lendo a vai para {q0, q1}.",
            respostaTexto: "Estados do AFD: {q0}, {q0, q1}, {q0, q2}, {q0, q1, q3}..."
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
            respostaTexto: "(b + ab)*(ε + a)"
        },
        {
            id: 6,
            nivel: 'medio',
            pergunta: "ER para paridade de 'a's (número par).",
            dica: "Os 'b's podem estar em qualquer lugar.",
            respostaTexto: "(b*ab*a)*b*" // Simplificado
        }
    ],

    // ========================================================================
    // EXERCÍCIOS - MINIMIZAÇÃO
    // ========================================================================
    minimizacao: [
        {
            id: 7,
            nivel: 'facil',
            pergunta: "Dois estados são equivalentes se...",
            respostaTexto: "Para qualquer entrada w, ambos levam a estados finais ou ambos levam a não-finais."
        },
        {
            id: 8,
            nivel: 'medio',
            pergunta: "Minimize o autômato: q0->q1(a), q1->q0(a). Ambos finais.",
            dica: "Se q0 e q1 são finais e reagem igual, eles viram um só.",
            respostaTexto: "Estado único {q0, q1} com loop em 'a'."
        }
    ],
    lex: [],
    afne: [],
    gr: [],
    moore_mealy: [],
    pumping: []
};