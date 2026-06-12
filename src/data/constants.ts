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

const pedagogicalExerciseData: Record<string, Partial<Exercicio>> = {
    afd_1: {
        dicas: [
            {
                id: 'afd-1-h1',
                level: 1,
                text: 'Separe as situações essenciais: ainda não leu nada, leu um primeiro símbolo válido mas ainda falta comprimento, já satisfaz a condição e caiu em erro sem possibilidade de recuperação.'
            },
            {
                id: 'afd-1-h2',
                level: 2,
                text: 'Se a palavra começa com b, nenhuma continuação pode fazê-la voltar para a linguagem. Isso sugere um estado sumidouro.'
            },
            {
                id: 'afd-1-h3',
                level: 3,
                text: 'Depois que a palavra começa com a e alcança tamanho 2, qualquer símbolo adicional preserva a aceitação.'
            }
        ],
        estrategia: 'Converta cada restrição do enunciado em memória finita. O autômato precisa lembrar se o primeiro símbolo foi válido e se o comprimento mínimo já foi atingido. A combinação dessas duas informações determina os estados.',
        guidedSolution: [
            {
                id: 'afd-1-step-1',
                title: 'Mapeie a memória necessária',
                explanation: 'Antes de ler símbolos, a palavra ainda não começou. Após ler o primeiro a, a condição do prefixo foi satisfeita, mas ainda falta atingir tamanho 2.',
                expectedStudentAction: 'Nomear estados para início, progresso parcial, aceitação e erro.',
                checkpointQuestion: 'Qual estado representa "começou com a, mas ainda só tem comprimento 1"?'
            },
            {
                id: 'afd-1-step-2',
                title: 'Feche os casos impossíveis',
                explanation: 'Se o primeiro símbolo for b, a palavra nunca mais poderá começar com a. Esse ramo precisa ir para um estado sumidouro com loops em todo o alfabeto.',
                expectedStudentAction: 'Adicionar o estado de erro e completar as transições faltantes.'
            },
            {
                id: 'afd-1-step-3',
                title: 'Valide com exemplos curtos',
                explanation: 'Palavras aa e ab devem aceitar; a deve rejeitar; b e ba devem ir para o erro.',
                expectedStudentAction: 'Simular manualmente as entradas de teste antes de finalizar o desenho.'
            }
        ],
        commonMistakes: [
            {
                id: 'afd-1-m1',
                title: 'Marcar o estado após o primeiro a como final',
                symptom: 'O autômato passa a aceitar a palavra a, embora o comprimento mínimo seja 2.',
                correction: 'O primeiro estado após ler a ainda não é final; só o estado alcançado após o segundo símbolo deve aceitar.'
            },
            {
                id: 'afd-1-m2',
                title: 'Omitir o estado sumidouro',
                symptom: 'A função de transição fica parcial ou o comportamento em palavras iniciadas por b fica indefinido.',
                correction: 'Inclua um estado de erro com loops em a e b para manter o AFD total.'
            }
        ],
        metadata: {
            learningGoal: 'Modelar simultaneamente uma restrição de prefixo e uma restrição de comprimento mínimo em um AFD total.',
            pattern: 'construction',
            prerequisites: [
                'Estado inicial e estados finais',
                'Função de transição total',
                'Estado sumidouro'
            ],
            theoryRefs: [
                'Módulo 1 • Definição formal de AFD',
                'Módulo 1 • Estados como memória finita'
            ],
            recommendation: 'required'
        }
    },
    afd_5: {
        dicas: [
            {
                id: 'afd-5-h1',
                level: 1,
                text: 'Cada estado deve representar quanto do padrão abb já foi reconhecido como sufixo da leitura atual.'
            },
            {
                id: 'afd-5-h2',
                level: 2,
                text: 'Use quatro estados conceituais: nenhum progresso, já viu a, já viu ab e padrão completo.'
            },
            {
                id: 'afd-5-h3',
                level: 3,
                text: 'Se você está no estado ab e lê a, não volta para o início: esse novo a pode ser o começo de outra ocorrência de abb.'
            }
        ],
        estrategia: 'Ataque o problema como reconhecimento de padrão. Em vez de guardar toda a palavra, guarde apenas o maior sufixo que ainda pode evoluir para abb. Isso produz um AFD pequeno e correto.',
        guidedSolution: [
            {
                id: 'afd-5-step-1',
                title: 'Defina os estados de progresso',
                explanation: 'Comece com um estado inicial sem progresso. Depois crie estados para os prefixos relevantes do padrão: a e ab.',
                expectedStudentAction: 'Descrever verbalmente o significado de cada estado antes de desenhar flechas.'
            },
            {
                id: 'afd-5-step-2',
                title: 'Trate as sobreposições do padrão',
                explanation: 'Algumas leituras mantêm progresso parcial. Por exemplo, ao ler a depois de ab, você ainda tem um sufixo a útil.',
                expectedStudentAction: 'Completar as transições pensando em sufixo relevante, não em "reiniciar sempre".',
                checkpointQuestion: 'Para onde vai o estado ab ao ler a?'
            },
            {
                id: 'afd-5-step-3',
                title: 'Absorva após encontrar abb',
                explanation: 'Como a linguagem pede "conter" a substring, depois que abb aparece a palavra já deve permanecer aceita.',
                expectedStudentAction: 'Adicionar loops no estado final para a e b.'
            }
        ],
        commonMistakes: [
            {
                id: 'afd-5-m1',
                title: 'Voltar ao início cedo demais',
                symptom: 'O autômato perde ocorrências sobrepostas e rejeita palavras como aabb.',
                correction: 'Reaproveite o maior sufixo que ainda pode iniciar o padrão, em vez de reiniciar sem análise.'
            },
            {
                id: 'afd-5-m2',
                title: 'Fazer o estado final sair da aceitação',
                symptom: 'Palavras como abba deixam de ser aceitas após reconhecer abb.',
                correction: 'Depois de encontrar a substring, mantenha o autômato em um estado final absorvente.'
            }
        ],
        metadata: {
            learningGoal: 'Usar o maior sufixo relevante para construir AFDs de busca de substring.',
            pattern: 'construction',
            prerequisites: [
                'Leitura de padrões por estados',
                'Noção de prefixo e sufixo',
                'AFD total'
            ],
            theoryRefs: [
                'Módulo 1 • AFD para padrões',
                'Módulo 3 • Linguagens definidas por substring'
            ],
            recommendation: 'required'
        }
    },
    afn_3: {
        dicas: [
            {
                id: 'afn-3-h1',
                level: 1,
                text: 'Como a palavra pode ter qualquer prefixo antes de terminar em aba, um estado inicial com loop em a e b é um bom começo.'
            },
            {
                id: 'afn-3-h2',
                level: 2,
                text: 'A não-determinização aparece quando você lê a no estado inicial: você pode continuar no loop e também apostar que esse a inicia o sufixo final.'
            },
            {
                id: 'afn-3-h3',
                level: 3,
                text: 'Depois de entrar no caminho q1 -> q2 -> q3, não deve haver transições extras: a aceitação só vale se a leitura terminar exatamente em aba.'
            }
        ],
        estrategia: 'Use o AFN para adivinhar onde o sufixo final começa. Um ramo continua lendo prefixos arbitrários, enquanto outro ramo tenta consumir exatamente aba até o fim da entrada.',
        guidedSolution: [
            {
                id: 'afn-3-step-1',
                title: 'Modele o prefixo livre',
                explanation: 'No estado inicial, a palavra ainda pode estar em qualquer ponto antes do sufixo final, então a e b devem fazer loop.',
                expectedStudentAction: 'Criar um estado inicial com loop em todo o alfabeto.'
            },
            {
                id: 'afn-3-step-2',
                title: 'Abra o ramo que aposta no sufixo',
                explanation: 'Ao ler um a no estado inicial, um ramo pode continuar no loop e outro pode seguir para o caminho que reconhece aba.',
                expectedStudentAction: 'Adicionar a transição que inicia o padrão final.'
            },
            {
                id: 'afn-3-step-3',
                title: 'Garanta aceitação só no fim',
                explanation: 'O estado final deve ser alcançado após ler exatamente aba como sufixo, sem consumir símbolos extras depois.',
                expectedStudentAction: 'Conferir com exemplos como aba, aaba, baba e abba.'
            }
        ],
        commonMistakes: [
            {
                id: 'afn-3-m1',
                title: 'Transformar o AFN em AFD sem perceber',
                symptom: 'O desenho usa apenas um caminho possível por símbolo e perde a ideia de aposta no início do sufixo.',
                correction: 'Permita que do estado inicial a leitura de a gere mais de uma continuação.'
            },
            {
                id: 'afn-3-m2',
                title: 'Aceitar palavras que apenas contêm aba',
                symptom: 'O autômato aceita ababa mesmo quando a última ocorrência não coincide com o final controlado do ramo escolhido.',
                correction: 'O caminho que reconhece aba não deve voltar ao loop inicial depois de começar o sufixo.'
            }
        ],
        metadata: {
            learningGoal: 'Explorar a ideia de aposta não determinística para reconhecer um sufixo fixo.',
            pattern: 'construction',
            prerequisites: [
                'Diferença entre AFD e AFN',
                'Não-determinismo como múltiplos ramos',
                'Sufixo de palavra'
            ],
            theoryRefs: [
                'Módulo 2 • Intuição do não-determinismo',
                'Módulo 2 • AFN para padrões'
            ],
            recommendation: 'required'
        }
    },
    er_7: {
        dicas: [
            {
                id: 'er-7-h1',
                level: 1,
                text: 'Quando o enunciado diz "termina em 01", pense em prefixo livre seguido de um sufixo fixo.'
            },
            {
                id: 'er-7-h2',
                level: 2,
                text: 'O prefixo livre sobre {0,1} pode ser representado por (0|1)*.'
            },
            {
                id: 'er-7-h3',
                level: 3,
                text: 'Depois de escrever o prefixo livre, concatene 01 no final sem colocar estrela depois dele.'
            }
        ],
        estrategia: 'Decomponha a linguagem em duas partes: qualquer prefixo binário e o sufixo obrigatório 01. Em ER, isso quase sempre vira "prefixo livre" concatenado com um bloco final fixo.',
        guidedSolution: [
            {
                id: 'er-7-step-1',
                title: 'Escreva o prefixo livre',
                explanation: 'Antes do sufixo 01, a palavra pode conter qualquer sequência de 0 e 1, inclusive vazia.',
                expectedStudentAction: 'Representar esse prefixo por (0|1)*.'
            },
            {
                id: 'er-7-step-2',
                title: 'Prenda o final da palavra',
                explanation: 'A concatenação com 01 força os dois últimos símbolos da palavra.',
                expectedStudentAction: 'Concatenar o bloco 01 ao prefixo livre.',
                checkpointQuestion: 'Sua expressão ainda aceitaria uma palavra terminada em 001? E em 010?'
            }
        ],
        commonMistakes: [
            {
                id: 'er-7-m1',
                title: 'Colocar 01 no começo da expressão',
                symptom: 'A expressão passa a descrever palavras que começam com 01, não palavras que terminam com 01.',
                correction: 'O bloco obrigatório precisa aparecer no fim da concatenação.'
            },
            {
                id: 'er-7-m2',
                title: 'Permitir símbolos depois do sufixo',
                symptom: 'Expressões como (0|1)*01(0|1)* também aceitam palavras que apenas contêm 01 em algum ponto.',
                correction: 'Use somente (0|1)*01 para fixar o sufixo.'
            }
        ],
        metadata: {
            learningGoal: 'Traduzir uma restrição de sufixo em expressão regular por decomposição entre prefixo livre e bloco final.',
            pattern: 'construction',
            prerequisites: [
                'União em ER',
                'Concatenação em ER',
                'Fecho de Kleene'
            ],
            theoryRefs: [
                'Módulo 3 • Expressões regulares',
                'Módulo 3 • Padrões de prefixo e sufixo'
            ],
            recommendation: 'required'
        }
    },
    cfg_2: {
        dicas: [
            {
                id: 'cfg-2-h1',
                level: 1,
                text: 'Cada uso de S -> a S b acrescenta um a à esquerda e um b à direita da derivação.'
            },
            {
                id: 'cfg-2-h2',
                level: 2,
                text: 'Para chegar em aabb, você precisa aplicar a produção recursiva exatamente duas vezes.'
            },
            {
                id: 'cfg-2-h3',
                level: 3,
                text: 'Depois das duas expansões, substitua o S restante por eps para encerrar a derivação.'
            }
        ],
        estrategia: 'Conte quantos pares a...b a palavra alvo exige. Como aabb tem dois a no início e dois b no final, a produção recursiva precisa ser usada duas vezes antes de fechar com eps.',
        guidedSolution: [
            {
                id: 'cfg-2-step-1',
                title: 'Observe a estrutura da palavra alvo',
                explanation: 'A palavra aabb tem dois símbolos a seguidos de dois símbolos b. Cada expansão recursiva adiciona exatamente esse tipo de moldura.',
                expectedStudentAction: 'Decidir quantas vezes aplicar S -> a S b.'
            },
            {
                id: 'cfg-2-step-2',
                title: 'Faça as expansões recursivas',
                explanation: 'A primeira expansão produz a S b. A segunda expansão, sobre o S interno, produz a a S b b.',
                expectedStudentAction: 'Escrever a sequência parcial S => a S b => a a S b b.'
            },
            {
                id: 'cfg-2-step-3',
                title: 'Feche com eps',
                explanation: 'Quando o miolo já não precisa gerar mais símbolos, substitua S por eps e simplifique a palavra final.',
                expectedStudentAction: 'Concluir a derivação como a a eps b b => aabb.'
            }
        ],
        commonMistakes: [
            {
                id: 'cfg-2-m1',
                title: 'Encerrar cedo demais',
                symptom: 'Ao trocar S por eps após uma única expansão, a derivação termina em ab, não em aabb.',
                correction: 'Conte quantos pares externos a palavra exige antes de aplicar eps.'
            },
            {
                id: 'cfg-2-m2',
                title: 'Perder o S interno na escrita',
                symptom: 'A sequência de derivação salta etapas e fica sem justificar de onde surgiram os símbolos.',
                correction: 'Mantenha o não terminal S visível até a etapa em que ele realmente for substituído por eps.'
            }
        ],
        metadata: {
            learningGoal: 'Praticar derivação em GLC entendendo o papel da recursão e da produção base.',
            pattern: 'simulation',
            prerequisites: [
                'Gramática livre de contexto',
                'Derivação passo a passo',
                'Produção base com eps'
            ],
            theoryRefs: [
                'Módulo 10 • Derivações em GLC',
                'Módulo 10 • Exemplo clássico a^n b^n'
            ],
            recommendation: 'required'
        }
    },
    pumping_15: {
        dicas: [
            {
                id: 'pumping-15-h1',
                level: 1,
                text: 'Comece por contradição: suponha que L seja regular e fixe o comprimento de bombeamento p.'
            },
            {
                id: 'pumping-15-h2',
                level: 2,
                text: 'Escolha uma palavra de L longa e rigidamente estruturada, como a^p b^p.'
            },
            {
                id: 'pumping-15-h3',
                level: 3,
                text: 'Como |xy| <= p, o trecho y fica inteiramente no bloco de a. Ao bombear i = 0 ou i = 2, o número de a muda mas o de b não.'
            }
        ],
        estrategia: 'Siga o esqueleto padrão do lema do bombeamento: hipótese de regularidade, escolha da palavra w, análise de uma decomposição arbitrária xyz sob as restrições do lema e escolha de um bombeamento que produza contradição.',
        guidedSolution: [
            {
                id: 'pumping-15-step-1',
                title: 'Fixe a hipótese e a palavra',
                explanation: 'Assuma que L é regular. Então existe um p tal que toda palavra de comprimento pelo menos p pode ser escrita como xyz obedecendo ao lema. Escolha w = a^p b^p.',
                expectedStudentAction: 'Escrever explicitamente a hipótese de regularidade e a palavra escolhida.'
            },
            {
                id: 'pumping-15-step-2',
                title: 'Use a restrição |xy| <= p',
                explanation: 'Os primeiros p símbolos de w são todos a. Logo, x e y estão completamente dentro do bloco inicial de a.',
                expectedStudentAction: 'Concluir que y = a^k para algum k > 0.',
                checkpointQuestion: 'Por que y não pode conter um símbolo b?'
            },
            {
                id: 'pumping-15-step-3',
                title: 'Bombeie e produza a contradição',
                explanation: 'Se você escolher i = 0, a palavra fica com menos a do que b. Se escolher i = 2, ela fica com mais a do que b. Em ambos os casos, sai de L.',
                expectedStudentAction: 'Aplicar um valor de i e explicar por que a palavra resultante não pertence à linguagem.'
            },
            {
                id: 'pumping-15-step-4',
                title: 'Feche a prova',
                explanation: 'Como a decomposição arbitrária prevista pelo lema leva sempre a uma palavra fora de L após bombeamento, a hipótese de regularidade é falsa.',
                expectedStudentAction: 'Concluir formalmente que L não é regular.'
            }
        ],
        commonMistakes: [
            {
                id: 'pumping-15-m1',
                title: 'Escolher a decomposição xyz livremente',
                symptom: 'A prova trata um caso específico de decomposição e ignora que o lema exige considerar qualquer decomposição válida.',
                correction: 'Você escolhe a palavra w, mas a decomposição xyz deve ser tratada como arbitrária dentro das restrições do lema.'
            },
            {
                id: 'pumping-15-m2',
                title: 'Deixar y atravessar a fronteira entre a e b',
                symptom: 'A argumentação esquece a condição |xy| <= p e admite y contendo símbolos b.',
                correction: 'Use explicitamente o fato de que os p primeiros símbolos são todos a para concluir que y está inteiramente no primeiro bloco.'
            }
        ],
        metadata: {
            learningGoal: 'Estruturar uma prova completa pelo lema do bombeamento para mostrar que uma linguagem não é regular.',
            pattern: 'proof',
            prerequisites: [
                'Enunciado do lema do bombeamento',
                'Prova por contradição',
                'Quantificadores da demonstração'
            ],
            theoryRefs: [
                'Módulo 5 • Lema do bombeamento',
                'Módulo 5 • Estratégia de escolha de w'
            ],
            recommendation: 'required'
        }
    }
};

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
            respostaTexto: 'Sim. A concatenação de dois conjuntos finitos é finita, pois há no máximo |L1|*|L2| palavras.'
        },
        {
            id: 6,
            nivel: 'dificil',
            pergunta: 'Descreva por propriedade a linguagem dos binários divisíveis por 4.',
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
            respostaTexto: 'L* permite zero ou mais concatenações (inclui ε). L+ permite uma ou mais (exclui ε).'
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
            respostaTexto: 'Qualquer concatenação de palavras de L1 também é concatenação de palavras de L2, pois L1 subset L2.'
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
            ...pedagogicalExerciseData.afd_1,
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
            dica: 'Dois estados: último foi a ou não. Estado final quando último = a.',
            respostaTexto: 'q0 (último não-a) -a-> q1, -b-> q0; q1 (último a) -a-> q1, -b-> q0.',
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
            ...pedagogicalExerciseData.afd_5,
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
            respostaTexto: 'Quatro estados: 0b,1b,2b (finais), erro (não final).',
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
            pergunta: 'Construa um AFD para números binários divisíveis por 4.',
            dica: 'Basta rastrear os dois últimos bits; aceite quando terminar com 00 (incluindo 0).',
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
            pergunta: 'Construa um AFD para L = { w | w começa e termina com o mesmo símbolo }.',
            dica: 'Memorize o primeiro símbolo e acompanhe o último.',
            respostaTexto: 'Use estados para primeiro=a/primeiro=b e se o último coincide.'
        },
        {
            id: 11,
            nivel: 'medio',
            pergunta: 'Construa um AFD para L = { w | w não contém a substring "bb" }.',
            dica: 'Use um estado que lembra se o último símbolo foi b, e um estado de erro.',
            respostaTexto: 'q0 (último não-b) -a-> q0, -b-> q1; q1 -a-> q0, -b-> erro; erro loop.',
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
            pergunta: 'Reconheça identificadores maiúsculos: [A-Z][A-Z0-9_]*',
            dica: 'Comece com letra maiúscula e permita letras, dígitos e _.',
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
            pergunta: 'Reconheça hexadecimal: 0x[0-9a-fA-F]+',
            dica: 'Exige prefixo 0x e ao menos um dígito hex.',
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
            pergunta: 'Reconheça inteiros com sinal: [+-]?(0|[1-9][0-9]*)',
            dica: 'Sinal opcional, sem zeros à esquerda.',
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
            pergunta: 'Reconheça ponto flutuante: [+-]?[0-9]+.[0-9]+(e[+-]?[0-9]+)?',
            dica: 'Obrigatório ponto e parte fracionária; expoente opcional.',
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
            pergunta: 'Reconheça o operador relacional: ==, !=, <=, >=, <, >',
            dica: 'Se começa com = ou !, precisa de segundo =.',
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
            ...pedagogicalExerciseData.afn_3,
            dica: "Loop no q0 com a,b. Transicao q0->q1 com 'a' para começar o padrão.",
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
            pergunta: 'AFN para palavras que contêm a substring "ab".',
            dica: 'Loop em q0 com a,b e chute o início do padrão.',
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
            dica: 'Use união de dois AFNs simples.',
            respostaTexto: 'Um ramo para prefixo a e outro para sufixo b, ambos a partir do inicial.'
        },
        {
            id: 9,
            nivel: 'dificil',
            pergunta: 'Descreva o processo de conversão de um AFN para AFD.',
            dica: 'Use subconjuntos de estados.',
            respostaTexto: 'Cada estado do AFD representa um conjunto de estados do AFN; estados finais são conjuntos que contêm um final.'
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
            dica: 'Use ε para ligar repetição do bloco ab.',
            respostaTexto: 'Bloco a->b com ε de retorno e ε de pulo para aceitar ε.'
        },
        {
            id: 13,
            nivel: 'medio',
            pergunta: 'AFN-ε para L = a? b* (a opcional).',
            dica: 'Use uma transição ε para pular o a.',
            respostaTexto: 'Inicial tem ε para caminho sem a e transição a para caminho com a; ambos vão para loop de b.'
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
            ...pedagogicalExerciseData.er_7,
            dica: 'Use (0|1)* como prefixo.',
            respostaTexto: '(0|1)*01',
            testes: [
                { input: '01', expected: 'accept' },
                { input: '101', expected: 'accept' },
                { input: '1101', expected: 'accept' },
                { input: '', expected: 'reject' },
                { input: '0', expected: 'reject' },
                { input: '10', expected: 'reject' },
                { input: '010', expected: 'reject' }
            ]
        },
        {
            id: 8,
            nivel: 'facil',
            pergunta: 'ER para palavras que contêm "ab".',
            dica: 'Prefixo livre, depois ab, depois sufixo livre.',
            respostaTexto: '(a|b)*ab(a|b)*'
        },
        {
            id: 9,
            nivel: 'medio',
            pergunta: 'ER para palavras que começam com a e terminam com b.',
            dica: 'Um a no início e um b no fim.',
            respostaTexto: 'a(a|b)*b'
        },
        {
            id: 10,
            nivel: 'medio',
            pergunta: 'ER para palavras de tamanho múltiplo de 3 sobre {a,b}.',
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
            pergunta: 'ER para palavras que não contêm "bb".',
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
            pergunta: "Escreva uma gramática regular para L = { w | w termina em 'ab' }.",
            dica: 'Pense em um não-terminal que garante o sufixo.',
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
            pergunta: "Gramática regular para L = { w | w tem número par de 'a' }.",
            dica: 'Dois estados: par e ímpar; b faz loop.',
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
            pergunta: 'Gramática regular para L = (ab)*.',
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
            pergunta: 'Gramática regular para L = 0*1*.',
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
            pergunta: 'Gramática regular para palavras que terminam em 01.',
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
            pergunta: 'Gramática regular para palavras com número par de b.',
            dica: 'Use dois não-terminais para contar b par/ímpar.',
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
            pergunta: 'Gramática regular para palavras de tamanho múltiplo de 3 sobre {a,b}.',
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
            pergunta: 'Quando dois estados são distinguíveis?',
            respostaTexto: 'Quando existe uma palavra w que leva um a final e outro a não-final.'
        },
        {
            id: 10,
            nivel: 'medio',
            pergunta: 'Explique por que estados inalcançáveis podem ser removidos antes da minimização.',
            respostaTexto: 'Eles nunca são visitados a partir do inicial, logo não afetam a linguagem.'
        },
        {
            id: 11,
            nivel: 'medio',
            pergunta: 'Qual a primeira etapa do algoritmo de tabela?',
            respostaTexto: 'Marcar todos os pares (final, não-final) como distinguíveis.'
        },
        {
            id: 12,
            nivel: 'medio',
            pergunta: 'Em um AFD total, o estado de erro pode ser removido?',
            respostaTexto: 'Não, pois ele garante transições definidas; removendo, o AFD deixa de ser total.'
        },
        {
            id: 13,
            nivel: 'dificil',
            pergunta: 'Explique por que minimização não depende da rotulagem dos estados.',
            respostaTexto: 'A minimização depende apenas da equivalência comportamental, não dos nomes.'
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
            pergunta: 'Como converter uma máquina de Mealy em Moore?',
            respostaTexto: 'Divida estados quando saídas diferentes ocorrem em transições que entram no mesmo estado.'
        },
        {
            id: 16,
            nivel: 'medio',
            pergunta: 'Em Moore, a saída depende de quê?',
            respostaTexto: 'Somente do estado atual.'
        },
        {
            id: 17,
            nivel: 'medio',
            pergunta: 'Em Mealy, a saída pode mudar quando?',
            respostaTexto: 'No momento da transição, lendo o símbolo.'
        },
        {
            id: 18,
            nivel: 'dificil',
            pergunta: 'Explique por que Mealy pode usar menos estados que Moore.',
            respostaTexto: 'Como a saída depende da transição, não é necessário duplicar estados para representar saídas diferentes.'
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
            ...pedagogicalExerciseData.pumping_15,
            dica: 'Escolha w = a^p b^p e bombeie dentro do bloco de a.',
            respostaTexto: 'Assuma regular e pegue w = a^p b^p. Ao bombear a^k com k>0, o número de a muda e o de b não, então a palavra sai de L. Contradição.'
        },
        {
            id: 16,
            nivel: 'medio',
            pergunta: 'Use o lema para mostrar que L = { 0^n 1^n | n >= 0 } não é regular.',
            dica: 'Bombeie dentro do bloco de 0s.',
            respostaTexto: 'Escolha w = 0^p 1^p e bombeie os 0s; a quantidade de 0s muda e a de 1s não.'
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
            dica: 'Use w = 0^p 1^p 0^p 1^p ou argumento de divisão.',
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
            respostaTexto: 'Porque o lema só dá uma condição necessária; linguagens não-regulares também podem satisfazer.'
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
            dica: 'Use uma produção recursiva que empilha a e desempilha b.',
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
            pergunta: 'Dada a gramática S -> a S b | eps, derive aabb.',
            ...pedagogicalExerciseData.cfg_2,
            respostaTexto: 'S => a S b => a a S b b => a a b b.',
            mode: 'text'
        },
        {
            id: 3,
            nivel: 'medio',
            pergunta: 'A gramática S -> S S | a é ambígua? Justifique com uma palavra.',
            respostaTexto: 'Sim. A palavra "aa" tem duas árvores de derivação distintas: (S S) e (S (S)).',
            mode: 'text'
        },
        {
            id: 4,
            nivel: 'dificil',
            pergunta: 'Explique por que a linguagem { a^n b^n c^n | n >= 0 } não é livre de contexto.',
            dica: 'Use o lema do bombeamento para CFL ou interseção com regular.',
            respostaTexto: 'Qualquer bombeamento quebra a igualdade entre os três blocos; logo não é CFL.',
            mode: 'text'
        },
        {
            id: 5,
            nivel: 'medio',
            pergunta: 'Escreva uma GLC para palíndromos de comprimento par sobre {a,b}.',
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
            dica: 'Empilhe um símbolo para cada a e desempilhe para cada b. Configure a pilha inicial como Z.',
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
            pergunta: 'Qual a diferença entre aceitar por estado final e por pilha vazia?',
            respostaTexto: 'Estado final depende do estado alcançado; pilha vazia depende do conteúdo da pilha. São equivalentes em poder, mas não sempre na mesma máquina.',
            mode: 'text'
        },
        {
            id: 3,
            nivel: 'medio',
            pergunta: 'Explique como um AP pode reconhecer palíndromos sobre {a,b}.',
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
            pergunta: 'O problema da parada é decidível? Explique.',
            respostaTexto: 'Não. O problema da parada é indecidível para máquinas de Turing.',
            mode: 'text'
        },
        {
            id: 2,
            nivel: 'medio',
            pergunta: 'Qual a diferença entre decidível e semidecidível?',
            respostaTexto: 'Decidível sempre termina com sim/não; semidecidível pode não terminar em instâncias negativas.',
            mode: 'text'
        },
        {
            id: 3,
            nivel: 'dificil',
            pergunta: 'Explique por que a equivalência de máquinas de Turing é indecidível.',
            respostaTexto: 'Reduz-se do problema da parada: se fosse decidível, resolveríamos a parada por redução.',
            mode: 'text'
        },
        {
            id: 4,
            nivel: 'facil',
            pergunta: 'Construa uma MT que aceita palavras binárias que terminam em 1.',
            dica: 'Use uma transição START -> START, R no estado inicial. Varra a entrada até BLANK e aceite se o último símbolo lido for 1.',
            respostaTexto: 'Uma MT que varre até o fim e aceita se o último símbolo for 1.',
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

