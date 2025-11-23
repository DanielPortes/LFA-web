import { Layers, Zap,  Code, FileText, Split, Minimize2, Filter, Braces, ArrowRightLeft, Maximize } from 'lucide-react';
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
        id: 'afn',
        title: 'Não-Determinismo (AFN/ε)',
        desc: 'Transições vazias e equivalência com AFDs.',
        icon: Zap
    },
    {
        id: 'er',
        title: 'Expressões Regulares',
        desc: 'Álgebra das linguagens e algoritmos de conversão.',
        icon: Code
    },
    {
        id: 'min',
        title: 'Minimização de Estados',
        desc: 'Algoritmo de indistinguibilidade e otimização.',
        icon: Minimize2
    },
    {
        id: 'gr',
        title: 'Gramáticas Regulares',
        desc: 'Gramáticas lineares e relação com autômatos.',
        icon: FileText
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
    },
    {
        id: 'glc',
        title: 'Linguagens Livres de Contexto',
        desc: 'GLC, Derivações e Ambiguidade.',
        icon: Split
    },
    {
        id: 'apn',
        title: 'Autômatos de Pilha',
        desc: 'Memória auxiliar para linguagens livres de contexto.',
        icon: Filter
    }
];

export const exerciciosDB: Record<string, Exercicio[]> = {
    fundamentos: [
        {
            id: 1,
            pergunta: "Seja Σ = {0, 1}. Qual a diferença entre ∅, {ε} e Σ*?",
            dica: "Pense em cardinalidade (quantos elementos tem no conjunto).",
            respostaTexto: "∅ é o conjunto vazio (0 elementos). {ε} é um conjunto contendo uma palavra de comprimento zero (1 elemento). Σ* é o conjunto infinito de todas as palavras possíveis formadas por 0 e 1."
        },
        {
            id: 2,
            pergunta: "Dada a linguagem L = {ab, c}, qual é o resultado de L² (concatenação de L com L)?",
            dica: "Combine cada elemento de L com cada elemento de L.",
            respostaTexto: "L² = L.L = {abab, abc, cab, cc}."
        }
    ],
    afd: [
        {
            id: 1,
            pergunta: "Construa um AFD sobre Σ={a,b} que aceite palavras com número ímpar de 'a's.",
            dica: "Use dois estados para representar a paridade (par/ímpar).",
            respostaTexto: "q0 (inicial, par), q1 (final, ímpar). q0 --a--> q1, q1 --a--> q0. Loops de 'b' em ambos.",
            respostaAutomato: {
                tipo: 'AFD',
                estados: [
                    { id: 'q0', label: 'Par', x: 200, y: 250, isFinal: false, isInicial: true },
                    { id: 'q1', label: 'Impar', x: 400, y: 250, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
                    { id: 't2', de: 'q1', para: 'q0', simbolo: 'a', curvatura: 0 },
                    { id: 't3', de: 'q0', para: 'q0', simbolo: 'b', curvatura: -30 },
                    { id: 't4', de: 'q1', para: 'q1', simbolo: 'b', curvatura: -30 }
                ]
            }
        },
        {
            id: 2,
            pergunta: "Construa um AFD que aceita palavras terminadas em 'abb'.",
            dica: "Os estados devem representar o progresso do sufixo: 'nada', 'vi a', 'vi ab', 'vi abb'.",
            respostaTexto: "q0 (inicial), q1 (leu a), q2 (leu ab), q3 (leu abb, final). Cuidado com os retornos se a sequência quebrar.",
            respostaAutomato: {
                tipo: 'AFD',
                estados: [
                    { id: 'q0', label: 'Ini', x: 100, y: 250, isFinal: false, isInicial: true },
                    { id: 'q1', label: 'A', x: 250, y: 250, isFinal: false, isInicial: false },
                    { id: 'q2', label: 'AB', x: 400, y: 250, isFinal: false, isInicial: false },
                    { id: 'q3', label: 'ABB', x: 550, y: 250, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
                    { id: 't2', de: 'q0', para: 'q0', simbolo: 'b', curvatura: -30 },
                    { id: 't3', de: 'q1', para: 'q1', simbolo: 'a', curvatura: -30 },
                    { id: 't4', de: 'q1', para: 'q2', simbolo: 'b', curvatura: 0 },
                    { id: 't5', de: 'q2', para: 'q1', simbolo: 'a', curvatura: 0 },
                    { id: 't6', de: 'q2', para: 'q3', simbolo: 'b', curvatura: 0 },
                    { id: 't7', de: 'q3', para: 'q1', simbolo: 'a', curvatura: 40 },
                    { id: 't8', de: 'q3', para: 'q0', simbolo: 'b', curvatura: 60 }
                ]
            }
        }
    ],
    afn: [
        {
            id: 1,
            pergunta: "AFN que aceita palavras contendo 'aba' ou 'bab'.",
            dica: "Use o não-determinismo para 'bifurcar' no início: um caminho tenta achar 'aba', o outro 'bab'.",
            respostaTexto: "q0 vai com 'a' para o ramo de cima e com 'b' para o ramo de baixo. Além de q0 ter loop de a,b.",
            respostaAutomato: {
                tipo: 'AFN',
                estados: [
                    { id: 'q0', label: 'q0', x: 150, y: 250, isFinal: false, isInicial: true },
                    { id: 'q1', label: 'a', x: 300, y: 150, isFinal: false, isInicial: false },
                    { id: 'q2', label: 'ab', x: 450, y: 150, isFinal: false, isInicial: false },
                    { id: 'q3', label: 'aba', x: 600, y: 150, isFinal: true, isInicial: false },
                    { id: 'q4', label: 'b', x: 300, y: 350, isFinal: false, isInicial: false },
                    { id: 'q5', label: 'ba', x: 450, y: 350, isFinal: false, isInicial: false },
                    { id: 'q6', label: 'bab', x: 600, y: 350, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'q0', para: 'q0', simbolo: 'a,b', curvatura: -30 },
                    { id: 't2', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
                    { id: 't3', de: 'q1', para: 'q2', simbolo: 'b', curvatura: 0 },
                    { id: 't4', de: 'q2', para: 'q3', simbolo: 'a', curvatura: 0 },
                    { id: 't5', de: 'q3', para: 'q3', simbolo: 'a,b', curvatura: 0 },
                    { id: 't6', de: 'q0', para: 'q4', simbolo: 'b', curvatura: 0 },
                    { id: 't7', de: 'q4', para: 'q5', simbolo: 'a', curvatura: 0 },
                    { id: 't8', de: 'q5', para: 'q6', simbolo: 'b', curvatura: 0 },
                    { id: 't9', de: 'q6', para: 'q6', simbolo: 'a,b', curvatura: 0 }
                ]
            }
        },
        {
            id: 2,
            pergunta: "Converta o AFN com ε: q0 --ε--> q1, q1 --a--> q2 (final) para AFD.",
            dica: "Calcule o Fecho-ε de q0. O estado inicial do AFD será esse conjunto.",
            respostaTexto: "Fecho-ε(q0) = {q0, q1}. Ao ler 'a', q1 vai para q2. Logo o estado {q0,q1} vai para {q2}."
        }
    ],
    er: [
        {
            id: 1,
            pergunta: "ER para identificadores Pascal (letra seguida de letras ou dígitos).",
            dica: "Use as classes [a-z] e [0-9].",
            respostaTexto: "l(l+d)* onde l = a..z e d = 0..9."
        },
        {
            id: 2,
            pergunta: "Simplifique a ER: (a + ε)*",
            dica: "Analise o que ela gera.",
            respostaTexto: "a*. (a+ε) gera 'a' ou 'vazio'. Repetir isso várias vezes é o mesmo que gerar qualquer quantidade de 'a's."
        },
        {
            id: 3,
            pergunta: "ER para palavras que NÃO terminam em 'b'.",
            dica: "Podem terminar em 'a' ou ser a palavra vazia.",
            respostaTexto: "ε + (a+b)*a"
        }
    ],
    gr: [
        {
            id: 1,
            pergunta: "Gere uma GR para L = a*bc*",
            dica: "Crie variáveis para cada parte da repetição.",
            respostaTexto: "S -> aS | B\nB -> bC\nC -> cC | ε"
        }
    ],
    moore_mealy: [
        {
            id: 1,
            pergunta: "Qual a diferença principal entre Máquina de Moore e Mealy?",
            dica: "Onde fica a saída?",
            respostaTexto: "Na máquina de Moore, a saída depende apenas do ESTADO atual (saída no nó). Na de Mealy, a saída depende do estado E da entrada (saída na transição)."
        },
        {
            id: 2,
            pergunta: "Projete uma Máquina de Mealy que inverte bits (0->1, 1->0).",
            dica: "Basta um estado.",
            respostaTexto: "Estado q0. Transição q0->q0 lendo 0 imprime 1. Transição q0->q0 lendo 1 imprime 0."
        }
    ],
    pumping: [
        {
            id: 1,
            pergunta: "Prove que L = { a^n b^n | n >= 0 } não é regular.",
            dica: "Use o Lema do Bombeamento. Escolha w = a^p b^p.",
            respostaTexto: "Se fosse regular, w = xyz com |xy|<=p e y não vazio. y consistiria apenas de 'a's. Ao bombear y² (xyyz), teríamos mais 'a's do que 'b's, saindo da linguagem. Contradição."
        }
    ],
    glc: [
        {
            id: 1,
            pergunta: "GLC para palíndromos sobre {a,b}.",
            dica: "A produção deve crescer para fora simetricamente.",
            respostaTexto: "S -> aSa | bSb | a | b | ε"
        },
        {
            id: 2,
            pergunta: "Mostre que S -> S+S | S*S | a é ambígua.",
            dica: "Tente derivar a+a*a de duas formas (árvores) diferentes.",
            respostaTexto: "Árvore 1: S+(S*S) -> a+(a*a). Árvore 2: (S+S)*S -> (a+a)*a. Como a precedência não está definida, há duas árvores para a mesma string."
        }
    ],
    apn: [
        {
            id: 1,
            pergunta: "Descreva um APN para L = { a^n b^n }.",
            dica: "Use a pilha para contar os 'a's.",
            respostaTexto: "1. Ler 'a', empilhar A.\n2. Ler 'b', desempilhar A.\n3. Se entrada vazia e pilha vazia (ou base), aceita."
        }
    ]
};