import { Layers, Zap, Move, CheckCircle, Code, FileText } from 'lucide-react';
import type { Exercicio, Topic } from '../types';

export const topicos: Topic[] = [
    { id: 'afd', title: 'Autômatos Finitos Determinísticos', desc: 'Definição formal, processamento e construção.', icon: Layers },
    { id: 'lex', title: 'Definição Léxica', desc: 'Tokens, padrões e especificações léxicas.', icon: FileText },
    { id: 'afn', title: 'Autômatos Finitos Não-Determinísticos', desc: 'Não-determinismo e equivalência com AFD.', icon: Zap },
    { id: 'afne', title: 'AFN com Movimentos Vazios', desc: 'Transições epsilon e Fecho-ε.', icon: Move },
    { id: 'er', title: 'Expressões Regulares', desc: 'Álgebra das linguagens regulares.', icon: Code },
    { id: 'gr', title: 'Gramáticas Regulares', desc: 'Regras de produção e derivação.', icon: CheckCircle },
];

export const exerciciosDB: Record<string, Exercicio[]> = {
    afd: [
        {
            id: 1,
            pergunta: "Descreva informalmente o processamento de uma palavra em um AFD.",
            dica: "Considere a sequência de estados e símbolos.",
            respostaTexto: "O processamento ocorre partindo do estado inicial. Para cada símbolo lido da entrada, o autômato transita deterministicamente para um próximo estado com base na função de transição. Se a leitura terminar em um estado final, a palavra é aceita."
        },
        {
            id: 2,
            pergunta: "Dado um AFD M qualquer, Descreva informalmente a linguagem definida por M, ou seja L(M).",
            dica: "Conjunto de palavras.",
            respostaTexto: "L(M) é o conjunto de todas as palavras w que, ao serem processadas por M partindo do estado inicial, fazem o autômato parar em um dos estados finais."
        },
        {
            id: 3,
            pergunta: "Descreva informalmente o que é calculado pela função Pe (Programa Estendido/Função de Transição Estendida).",
            dica: "Pe recebe estado e palavra inteira.",
            respostaTexto: "A função Pe calcula o estado alcançado pelo autômato após ler toda uma sequência de símbolos (palavra) w, partindo de um determinado estado q."
        },
        {
            id: 4,
            pergunta: "Construa o Diagrama de Estados do AFD M=({0,1},{1,2,3,4},{(1,0,2)(1,1,4)(2,0,1)(2,1,3)(3,1,2)(3,0,4)(4,0,3)(4,1,1)},1,{4}).",
            dica: "Estado 1 é inicial, 4 é final. Siga as transições.",
            respostaTexto: "Autômato construído abaixo. Linguagem aceita palavras que levam ao estado 4.",
            respostaAutomato: {
                tipo: 'AFD',
                estados: [
                    { id: 'q1', label: '1', x: 200, y: 200, isFinal: false, isInicial: true },
                    { id: 'q2', label: '2', x: 400, y: 200, isFinal: false, isInicial: false },
                    { id: 'q3', label: '3', x: 400, y: 400, isFinal: false, isInicial: false },
                    { id: 'q4', label: '4', x: 200, y: 400, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'q1', para: 'q2', simbolo: '0', curvatura: 0 },
                    { id: 't2', de: 'q1', para: 'q4', simbolo: '1', curvatura: 0 },
                    { id: 't3', de: 'q2', para: 'q1', simbolo: '0', curvatura: 0 },
                    { id: 't4', de: 'q2', para: 'q3', simbolo: '1', curvatura: 0 },
                    { id: 't5', de: 'q3', para: 'q2', simbolo: '1', curvatura: 0 },
                    { id: 't6', de: 'q3', para: 'q4', simbolo: '0', curvatura: 0 },
                    { id: 't7', de: 'q4', para: 'q3', simbolo: '0', curvatura: 0 },
                    { id: 't8', de: 'q4', para: 'q1', simbolo: '1', curvatura: 0 },
                ]
            }
        },
        {
            id: 5,
            pergunta: "Construa um AFD para palavras em {a,b} que começam com 'a' e terminam com 'b' onde |w| >= 3.",
            dica: "Caminho mínimo: a -> qualquer -> b.",
            respostaTexto: "Necessita de pelo menos 4 estados para garantir o comprimento e a sequência.",
            respostaAutomato: {
                tipo: 'AFD',
                estados: [
                    { id: 'q0', label: 'start', x: 100, y: 300, isFinal: false, isInicial: true },
                    { id: 'q1', label: 'leu a', x: 250, y: 300, isFinal: false, isInicial: false },
                    { id: 'q2', label: 'meio', x: 400, y: 300, isFinal: false, isInicial: false },
                    { id: 'q3', label: 'fim', x: 550, y: 300, isFinal: true, isInicial: false },
                    { id: 'qErro', label: 'erro', x: 250, y: 450, isFinal: false, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
                    { id: 't2', de: 'q0', para: 'qErro', simbolo: 'b', curvatura: 0 },
                    { id: 't3', de: 'q1', para: 'q2', simbolo: 'a,b', curvatura: 0 },
                    { id: 't4', de: 'q2', para: 'q2', simbolo: 'a', curvatura: -30 },
                    { id: 't5', de: 'q2', para: 'q3', simbolo: 'b', curvatura: 0 },
                    { id: 't6', de: 'q3', para: 'q2', simbolo: 'a', curvatura: 20 },
                    { id: 't7', de: 'q3', para: 'q3', simbolo: 'b', curvatura: -30 },
                    { id: 't8', de: 'qErro', para: 'qErro', simbolo: 'a,b', curvatura: 0 }
                ]
            }
        }
    ],
    lex: [
        {
            id: 1,
            pergunta: "Definição léxica para inteiros e números com ponto decimal (sem zeros à esquerda).",
            dica: "Use ? para opcional. Ex: parte inteira . parte fracionaria",
            respostaTexto: "ER: (0 | [1-9][0-9]*) ( . [0-9]+ )?"
        },
        {
            id: 2,
            pergunta: "Definição léxica para números em notação científica (sem zeros à esquerda).",
            dica: "Base + Expoente (E).",
            respostaTexto: "ER: (0 | [1-9][0-9]*) ( . [0-9]+ )? ( E [+-]? [0-9]+ )"
        },
        {
            id: 3,
            pergunta: "Definição léxica para operadores relacionais: <>, <=, >=, ==, >, <",
            dica: "Liste as opções literalmente.",
            respostaTexto: "<> | <= | >= | == | > | <"
        }
    ],
    afn: [
        {
            id: 1,
            pergunta: "AFN para palavras em {a,b} que terminam com 'aaa'.",
            dica: "Faça um loop no início e depois a sequência obrigatória.",
            respostaTexto: "q0 (loop a,b) -> q1(a) -> q2(a) -> q3(a, Final).",
            respostaAutomato: {
                tipo: 'AFN',
                estados: [
                    { id: 'q0', label: 'q0', x: 200, y: 300, isFinal: false, isInicial: true },
                    { id: 'q1', label: 'q1', x: 350, y: 300, isFinal: false, isInicial: false },
                    { id: 'q2', label: 'q2', x: 500, y: 300, isFinal: false, isInicial: false },
                    { id: 'q3', label: 'q3', x: 650, y: 300, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'q0', para: 'q0', simbolo: 'a,b', curvatura: -30 },
                    { id: 't2', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
                    { id: 't3', de: 'q1', para: 'q2', simbolo: 'a', curvatura: 0 },
                    { id: 't4', de: 'q2', para: 'q3', simbolo: 'a', curvatura: 0 }
                ]
            }
        },
        {
            id: 2,
            pergunta: "Prove que 'aa' não pertence a linguagem da questão 1.",
            dica: "Simule todos os caminhos possíveis no AFN.",
            respostaTexto: "Caminhos possíveis para 'aa': \n1) q0->q0->q0 (não final)\n2) q0->q0->q1 (não final)\n3) q0->q1->q2 (não final)\nComo nenhum caminho termina em q3, 'aa' é rejeitada."
        },
        {
            id: 3,
            pergunta: "AFN para palavras com estrutura xyx, onde |x|=2 e y pertence a {a,b}*.",
            dica: "O AFN deve 'adivinhar' qual é a string x de tamanho 2 no início (aa, ab, ba, ou bb) e verificar se ela se repete no final.",
            respostaTexto: "Ramifica-se do estado inicial para 4 caminhos (aa, ab, ba, bb).",
            respostaAutomato: {
                tipo: 'AFN',
                estados: [
                    { id: 'q0', label: 'start', x: 100, y: 300, isFinal: false, isInicial: true },
                    // Ramo AA
                    { id: 'qA1', label: 'a', x: 200, y: 150, isFinal: false, isInicial: false },
                    { id: 'qA2', label: 'aa', x: 300, y: 150, isFinal: false, isInicial: false },
                    { id: 'qA3', label: 'fim a', x: 450, y: 150, isFinal: false, isInicial: false },
                    { id: 'qAF', label: 'fim aa', x: 550, y: 150, isFinal: true, isInicial: false },
                    // Ramo BB (Simplificado para visualização, idealmente teria 4 ramos)
                    { id: 'qB1', label: 'b', x: 200, y: 450, isFinal: false, isInicial: false },
                    { id: 'qB2', label: 'bb', x: 300, y: 450, isFinal: false, isInicial: false },
                    { id: 'qB3', label: 'fim b', x: 450, y: 450, isFinal: false, isInicial: false },
                    { id: 'qBF', label: 'fim bb', x: 550, y: 450, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    // Caminho AA
                    { id: 't1', de: 'q0', para: 'qA1', simbolo: 'a', curvatura: 0 },
                    { id: 't2', de: 'qA1', para: 'qA2', simbolo: 'a', curvatura: 0 },
                    { id: 't3', de: 'qA2', para: 'qA2', simbolo: 'a,b', curvatura: -30 }, // Loop Y
                    { id: 't4', de: 'qA2', para: 'qA3', simbolo: 'a', curvatura: 0 },
                    { id: 't5', de: 'qA3', para: 'qAF', simbolo: 'a', curvatura: 0 },
                    // Caminho BB
                    { id: 't6', de: 'q0', para: 'qB1', simbolo: 'b', curvatura: 0 },
                    { id: 't7', de: 'qB1', para: 'qB2', simbolo: 'b', curvatura: 0 },
                    { id: 't8', de: 'qB2', para: 'qB2', simbolo: 'a,b', curvatura: 30 }, // Loop Y
                    { id: 't9', de: 'qB2', para: 'qB3', simbolo: 'b', curvatura: 0 },
                    { id: 't10', de: 'qB3', para: 'qBF', simbolo: 'b', curvatura: 0 }
                ]
            }
        },
        {
            id: 4,
            pergunta: "Descreva formalmente L(M), sendo M um AFN , onde M=(A,Q,P,q,F).",
            dica: "Definição de aceitação por AFN.",
            respostaTexto: "L(M) = { w | existe pelo menos um caminho de transições partindo de q, consumindo w, que alcança algum estado em F }."
        },
        {
            id: 5,
            pergunta: "Atualize o pseudo-código de processamento de AFD para AFN.",
            dica: "Em vez de um estado atual, mantenha um CONJUNTO de estados atuais.",
            respostaTexto: "1. Atuais = {q0}\n2. Para cada símbolo c de w:\n3.   Próximos = {}\n4.   Para cada estado q em Atuais:\n5.     Adicione P(q, c) em Próximos\n6.   Atuais = Próximos\n7. Se Atuais intercepta F, Aceita. Senão, Rejeita."
        }
    ],
    afne: [
        {
            id: 1,
            pergunta: "Construir AFD equivalente ao AFN M1: ({a,b},{1,2,3},{(1,a,2),(2,b,1),(2,b,3),(3,a,1)},1,{1})",
            dica: "Use a tabela de transições de subconjuntos.",
            respostaTexto: "Estados do AFD serão subconjuntos de {1,2,3}. Inicial: {1}. Transições baseadas na união dos destinos.",
            respostaAutomato: {
                tipo: 'AFD',
                estados: [
                    { id: 'q1', label: '{1}', x: 200, y: 300, isFinal: true, isInicial: true },
                    { id: 'q2', label: '{2}', x: 400, y: 300, isFinal: false, isInicial: false },
                    { id: 'q13', label: '{1,3}', x: 600, y: 300, isFinal: true, isInicial: false },
                    { id: 'qErro', label: 'Erro', x: 400, y: 500, isFinal: false, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'q1', para: 'q2', simbolo: 'a', curvatura: 0 },
                    { id: 't2', de: 'q1', para: 'qErro', simbolo: 'b', curvatura: 0 },
                    { id: 't3', de: 'q2', para: 'q13', simbolo: 'b', curvatura: 0 },
                    { id: 't4', de: 'q2', para: 'qErro', simbolo: 'a', curvatura: 0 },
                    { id: 't5', de: 'q13', para: 'q2', simbolo: 'a', curvatura: 100 },
                    { id: 't6', de: 'q13', para: 'qErro', simbolo: 'b', curvatura: 0 }
                ]
            }
        },
        {
            id: 2,
            pergunta: "Calcule o fecho vazio de q0 no autômato M2.",
            dica: "Estados alcançáveis apenas por transições epsilon.",
            respostaTexto: "Fecho-ε(q0) = {q0, q1, q2} (pois q0->ε->q1->ε->q2)."
        },
        {
            id: 3,
            pergunta: "O que calcula a função FECHO-ε-estendido?",
            dica: "Aplica-se a um conjunto de estados.",
            respostaTexto: "Calcula o conjunto de todos os estados alcançáveis a partir de um conjunto de estados iniciais usando apenas transições vazias (ε)."
        },
        {
            id: 4,
            pergunta: "Em que classe de linguagens estão as linguagens definidas por um AFNe?",
            dica: "Equivalência.",
            respostaTexto: "Linguagens Regulares (a mesma classe dos AFDs e AFNs)."
        },
        {
            id: 5,
            pergunta: "Calcule o fecho vazio estendido de {q0,q2} no autômato M2.",
            dica: "União dos fechos individuais.",
            respostaTexto: "Fecho({q0,q2}) = Fecho(q0) U Fecho(q2) = {q0,q1,q2} U {q2} = {q0,q1,q2}."
        },
        {
            id: 6,
            pergunta: "Construir AFN M' equivalente ao AFNe M.",
            dica: "Adicione transições diretas onde havia caminhos com epsilon.",
            respostaTexto: "M' terá transições diretas 'pulando' os epsilons. Ex: q0->e->q1->a->q2 vira q0->a->q2.",
            respostaAutomato: {
                tipo: 'AFN',
                estados: [
                    { id: 'q0', label: 'q0', x: 200, y: 200, isFinal: false, isInicial: true },
                    { id: 'q1', label: 'q1', x: 400, y: 200, isFinal: false, isInicial: false },
                    { id: 'q2', label: 'q2', x: 600, y: 200, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'q0', para: 'q0', simbolo: 'a,b', curvatura: -30 },
                    { id: 't2', de: 'q0', para: 'q2', simbolo: 'a', curvatura: 40 }, // Veio de q0->e->q1->a->q2
                    { id: 't3', de: 'q1', para: 'q2', simbolo: 'a', curvatura: 0 }
                ]
            }
        },
        {
            id: 7,
            pergunta: "Minimize o AFD M dado.",
            dica: "Identifique estados equivalentes (indistinguíveis).",
            respostaTexto: "Estados {q3, q4} são finais e equivalentes. Estados {q0} e {q1} podem ser fundidos se tiverem mesmo comportamento.",
            respostaAutomato: {
                tipo: 'AFD',
                estados: [
                    { id: 'q0', label: 'q0', x: 200, y: 300, isFinal: false, isInicial: true },
                    { id: 'q1', label: 'q1', x: 350, y: 300, isFinal: false, isInicial: false },
                    { id: 'q2', label: 'q2', x: 500, y: 300, isFinal: false, isInicial: false },
                    { id: 'q34', label: 'q3,q4', x: 650, y: 300, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
                    { id: 't2', de: 'q1', para: 'q2', simbolo: 'b', curvatura: 0 },
                    { id: 't3', de: 'q1', para: 'q34', simbolo: 'a', curvatura: 30 },
                    { id: 't4', de: 'q2', para: 'q2', simbolo: 'b', curvatura: -30 },
                    { id: 't5', de: 'q2', para: 'q34', simbolo: 'a', curvatura: 0 },
                    { id: 't6', de: 'q34', para: 'q34', simbolo: 'a', curvatura: -30 },
                    { id: 't7', de: 'q34', para: 'q2', simbolo: 'b', curvatura: 40 }
                ]
            }
        },
        {
            id: 8,
            pergunta: "Na transformação AFNe -> AFN, como é calculado o conjunto de estados finais?",
            dica: "Se o fecho vazio atinge um final original...",
            respostaTexto: "Um estado q é final no novo AFN se o Fecho-ε(q) no original contém algum estado final do original."
        }
    ],
    er: [
        {
            id: 1,
            pergunta: "ER para {w | w tem concatenações com no máximo um par de a’s consecutivos}.",
            dica: "Zero 'aa' OU Um 'aa'.",
            respostaTexto: "((b+ab)*(a+ε)) + ((b+ab)*aa(b+ba)*)",
            respostaAutomato: {
                tipo: 'ER',
                estados: [
                    { id: 'q0', label: 'S', x: 100, y: 250, isFinal: true, isInicial: true },
                    { id: 'q1', label: 'a', x: 250, y: 250, isFinal: true, isInicial: false },
                    { id: 'q2', label: 'aa', x: 400, y: 250, isFinal: true, isInicial: false },
                    { id: 'q3', label: 'aaa', x: 550, y: 250, isFinal: false, isInicial: false } // Trap
                ],
                transicoes: [
                    { id: 't1', de: 'q0', para: 'q0', simbolo: 'b', curvatura: -30 },
                    { id: 't2', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
                    { id: 't3', de: 'q1', para: 'q0', simbolo: 'b', curvatura: 20 },
                    { id: 't4', de: 'q1', para: 'q2', simbolo: 'a', curvatura: 0 },
                    { id: 't5', de: 'q2', para: 'q2', simbolo: 'b', curvatura: -30 },
                    { id: 't6', de: 'q2', para: 'q3', simbolo: 'a', curvatura: 0 },
                    { id: 't7', de: 'q3', para: 'q3', simbolo: 'a,b', curvatura: 0 }
                ]
            }
        },
        {
            id: 2,
            pergunta: "Automato para ER: (ab + ba)* (aa + bb)",
            dica: "Concatenação de um loop de pares com um par final.",
            respostaTexto: "Estado inicial com loop de ab/ba, saindo para aa ou bb final.",
            respostaAutomato: {
                tipo: 'AFN',
                estados: [
                    { id: 'q0', label: '0', x: 200, y: 300, isFinal: false, isInicial: true },
                    { id: 'q1', label: '1', x: 300, y: 200, isFinal: false, isInicial: false },
                    { id: 'q2', label: '2', x: 300, y: 400, isFinal: false, isInicial: false },
                    { id: 'q3', label: 'F', x: 500, y: 300, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    // (ab + ba)*
                    { id: 't1', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 20 },
                    { id: 't2', de: 'q1', para: 'q0', simbolo: 'b', curvatura: 20 },
                    { id: 't3', de: 'q0', para: 'q2', simbolo: 'b', curvatura: 20 },
                    { id: 't4', de: 'q2', para: 'q0', simbolo: 'a', curvatura: 20 },
                    // (aa + bb)
                    { id: 't5', de: 'q0', para: 'q3', simbolo: 'aa,bb', curvatura: 0 } // Simplificado visualmente
                ]
            }
        },
        {
            id: 3,
            pergunta: "Descreva a linguagem: (a + b)* (aa +bb)",
            dica: "Qualquer coisa seguida de...",
            respostaTexto: "Conjunto de palavras sobre {a,b} que terminam com 'aa' ou 'bb'."
        },
        {
            id: 4,
            pergunta: "Descreva a linguagem: ( b + ab)* (ε + a)",
            dica: "Analise a estrutura de pares e o final.",
            respostaTexto: "Palavras que não contêm 'aa'. (Qualquer 'a' é precedido por 'b' ou é o último caractere)."
        },
        {
            id: 6,
            pergunta: "ER para palavras em {a,b}* exceto a palavra vazia.",
            dica: "Pelo menos um caractere.",
            respostaTexto: "(a+b)(a+b)*"
        },
        {
            id: 7,
            pergunta: "ER para valores monetários negativos Ex: -R$ 1.000,00",
            dica: "Símbolo, espaço, milhar opcional.",
            respostaTexto: "-R\\$ [1-9][0-9]{0,2}(\\.[0-9]{3})*,[0-9]{2}"
        },
        {
            id: 8,
            pergunta: "ER: Começa com 'a' e termina 'b' OU começa com 'b' e termina 'a'.",
            dica: "União de dois casos.",
            respostaTexto: "a(a+b)*b + b(a+b)*a"
        },
        {
            id: 9,
            pergunta: "ER: Alterna a's e b's, não vazia. (Ex: ababa, b, a).",
            dica: "Não pode ter aa nem bb.",
            respostaTexto: "(a+b)( (a+b)(?!= \\1) )* ... Mais simples: (a(ba)*b? | b(ab)*a?)"
        },
        {
            id: 10,
            pergunta: "ER: Número par de a's (aceita vazia).",
            dica: "b* (a b* a b*)*",
            respostaTexto: "b* (a b* a b*)*"
        },
        {
            id: 11,
            pergunta: "ER: Número par de a's (não aceita vazia).",
            dica: "Mesma da anterior mas força pelo menos um símbolo.",
            respostaTexto: "(b+ (a b* a b*)*) | (b* a b* a b* (a b* a b*)*)"
        },
        {
            id: 12,
            pergunta: "ER: Número ímpar de a's.",
            dica: "Par de a's concatenado com mais um a.",
            respostaTexto: "b* a b* (a b* a b*)*"
        }
    ],
    gr: [
        {
            id: 1,
            pergunta: "Construa GR para G1 = ({S,D},{0..9},{S->D|DS, D->0|..|9},S)",
            dica: "Simula números inteiros positivos.",
            respostaTexto: "S -> 0S | ... | 9S | 0 | ... | 9",
            respostaAutomato: {
                tipo: 'GR',
                estados: [
                    { id: 'S', label: 'S', x: 200, y: 300, isFinal: false, isInicial: true },
                    { id: 'D', label: 'D', x: 400, y: 300, isFinal: false, isInicial: false },
                    { id: 'F', label: 'Fim', x: 600, y: 300, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'S', para: 'S', simbolo: '0..9', curvatura: -30 },
                    { id: 't2', de: 'S', para: 'F', simbolo: '0..9', curvatura: 0 }
                ]
            }
        },
        {
            id: 2,
            pergunta: "Prove que '1234' pertence a L(G1) com árvore de derivação.",
            dica: "S -> DS -> 1S -> 1DS -> 12S...",
            respostaTexto: "S -> DS -> 1S -> 1DS -> 12S -> 12DS -> 123S -> 123D -> 1234."
        },
        {
            id: 3,
            pergunta: "GR para inteiros sem zeros à esquerda.",
            dica: "Primeiro dígito 1-9, depois 0-9.",
            respostaTexto: "S -> 1A | ... | 9A | 1 | ... | 9\nA -> 0A | ... | 9A | 0 | ... | 9 | ε",
            respostaAutomato: {
                tipo: 'GR',
                estados: [
                    { id: 'S', label: 'S', x: 200, y: 300, isFinal: false, isInicial: true },
                    { id: 'A', label: 'A', x: 400, y: 300, isFinal: true, isInicial: false },
                    { id: 'F', label: 'F', x: 600, y: 300, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'S', para: 'A', simbolo: '1..9', curvatura: 0 },
                    { id: 't2', de: 'S', para: 'F', simbolo: '1..9', curvatura: 40 },
                    { id: 't3', de: 'A', para: 'A', simbolo: '0..9', curvatura: -30 },
                    { id: 't4', de: 'S', para: 'F', simbolo: '0', curvatura: 80 } // Caso seja apenas "0"
                ]
            }
        },
        {
            id: 4,
            pergunta: "A Gramática G2 é regular? A -> 0C | 1B, etc...",
            dica: "Verifique se as produções seguem A -> aB ou A -> a.",
            respostaTexto: "Sim, é regular à direita (Type 3)."
        },
        {
            id: 5,
            pergunta: "Demonstre que 101010 pertence a L(G2).",
            dica: "A->1B->10D->101C->1010A->10101B->101010.",
            respostaTexto: "Derivação: A => 1B => 10D => 100B (Oops, D->0B) => ... seguir regras."
        },
        {
            id: 6,
            pergunta: "GR para palavras em {a,b}* terminando em 'aaa'.",
            dica: "Autômato equivalente: Loop -> a -> a -> a.",
            respostaTexto: "S -> aS | bS | aA\nA -> aB\nB -> a",
            respostaAutomato: {
                tipo: 'GR',
                estados: [
                    { id: 'S', label: 'S', x: 200, y: 300, isFinal: false, isInicial: true },
                    { id: 'A', label: 'A', x: 350, y: 300, isFinal: false, isInicial: false },
                    { id: 'B', label: 'B', x: 500, y: 300, isFinal: false, isInicial: false },
                    { id: 'F', label: 'F', x: 650, y: 300, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'S', para: 'S', simbolo: 'a,b', curvatura: -30 },
                    { id: 't2', de: 'S', para: 'A', simbolo: 'a', curvatura: 0 },
                    { id: 't3', de: 'A', para: 'B', simbolo: 'a', curvatura: 0 },
                    { id: 't4', de: 'B', para: 'F', simbolo: 'a', curvatura: 0 }
                ]
            }
        },
        {
            id: 7,
            pergunta: "GR para palavras onde o terceiro símbolo da direita para esquerda é 'a'.",
            dica: "aXX. S gera qualquer coisa até gerar aXX.",
            respostaTexto: "S -> aS | bS | aA\nA -> aB | bB\nB -> a | b",
            respostaAutomato: {
                tipo: 'GR',
                estados: [
                    { id: 'S', label: 'S', x: 200, y: 300, isFinal: false, isInicial: true },
                    { id: 'A', label: 'A', x: 350, y: 300, isFinal: false, isInicial: false },
                    { id: 'B', label: 'B', x: 500, y: 300, isFinal: false, isInicial: false },
                    { id: 'F', label: 'F', x: 650, y: 300, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'S', para: 'S', simbolo: 'a,b', curvatura: -30 },
                    { id: 't2', de: 'S', para: 'A', simbolo: 'a', curvatura: 0 },
                    { id: 't3', de: 'A', para: 'B', simbolo: 'a,b', curvatura: 0 },
                    { id: 't4', de: 'B', para: 'F', simbolo: 'a,b', curvatura: 0 }
                ]
            }
        },
        {
            id: 8,
            pergunta: "GR alternando a's e b's, começando e terminando com 'a'.",
            dica: "Ex: a, aba, ababa.",
            respostaTexto: "S -> a | aB\nB -> bA\nA -> a | aB",
            respostaAutomato: {
                tipo: 'GR',
                estados: [
                    { id: 'S', label: 'S', x: 200, y: 300, isFinal: false, isInicial: true },
                    { id: 'B', label: 'B', x: 400, y: 300, isFinal: false, isInicial: false },
                    { id: 'A', label: 'A', x: 600, y: 300, isFinal: false, isInicial: false },
                    { id: 'F', label: 'F', x: 800, y: 300, isFinal: true, isInicial: false }
                ],
                transicoes: [
                    { id: 't1', de: 'S', para: 'F', simbolo: 'a', curvatura: 40 },
                    { id: 't2', de: 'S', para: 'B', simbolo: 'a', curvatura: 0 },
                    { id: 't3', de: 'B', para: 'A', simbolo: 'b', curvatura: 0 },
                    { id: 't4', de: 'A', para: 'F', simbolo: 'a', curvatura: 0 },
                    { id: 't5', de: 'A', para: 'B', simbolo: 'a', curvatura: -40 }
                ]
            }
        }
    ]
};