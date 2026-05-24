import type { CourseModule } from '../../../types';
import { createLessonReference } from '../../bibliography';
import { ap_an_bn } from '../automataDefs';

const blauthCap3 = createLessonReference('blauth', 'Cap. 3');

export const mod11: CourseModule = {
    id: 'mod11',
    title: 'Módulo 11: Autômatos de Pilha (AP)',
    lessons: [
        {
            id: 'l11-def',
            title: 'Definição de AP',
            description: 'Autômatos finitos com uma pilha como memória auxiliar.',
            objectives: [
                { id: 'l11-def-obj-1', text: 'Identificar entrada, estados, transições e alfabeto da pilha em um AP.' },
                { id: 'l11-def-obj-2', text: 'Interpretar rótulos de transição no formato de leitura, desempilhamento e empilhamento.' }
            ],
            prerequisites: [
                'AFD e AFN.',
                'Gramáticas livres de contexto.',
                'Notação de pilha.'
            ],
            keywords: ['AP', 'pilha', 'transição', 'LLC', 'aceitação'],
            estimatedMinutes: 22,
            references: [blauthCap3],
            summary: [
                { id: 'l11-def-sum-1', text: 'A pilha permite guardar uma quantidade não limitada de informação estruturada.' },
                { id: 'l11-def-sum-2', text: 'Cada transição pode ler entrada, consultar o topo da pilha e substituir esse topo por uma palavra.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-05-24',
            content: [
                {
                    type: 'text',
                    content: 'O autômato de pilha aparece no livro como o reconhecedor natural das linguagens livres de contexto. Ele preserva a leitura por estados, mas acrescenta uma pilha para registrar dependências como parênteses abertos ou quantidades que precisam ser comparadas depois.'
                },
                {
                    type: 'definition',
                    title: 'AP',
                    content: 'Um AP é especificado por seus alfabetos, estados, função de transição, estado inicial, estados finais e alfabeto da pilha. A transição depende do estado atual, do símbolo de entrada lido ou ε, e do símbolo no topo da pilha.'
                },
                {
                    type: 'definition',
                    title: 'Rótulo de transição',
                    content: 'No diagrama, um rótulo como (a, A, α) significa: leia a da entrada, remova A do topo da pilha e empilhe α. Quando a = ε, a transição não consome símbolo da entrada.'
                },
                {
                    type: 'note',
                    title: 'Por que a pilha muda o poder do modelo?',
                    content: 'Um AFD só lembra uma situação finita. Um AP consegue acumular símbolos na pilha e depois consumi-los, o que permite reconhecer estruturas balanceadas e correspondências de quantidade.'
                }
            ]
        },
        {
            id: 'l11-ex',
            title: 'Exemplo: a^n b^n',
            description: 'A pilha como contador estrutural para comparar dois blocos.',
            objectives: [
                { id: 'l11-ex-obj-1', text: 'Simular a pilha em uma palavra como aaabbb.' },
                { id: 'l11-ex-obj-2', text: 'Explicar por que o AP falha quando os blocos não têm o mesmo tamanho.' }
            ],
            prerequisites: [
                'Definição de AP.',
                'Linguagem { a^n b^n | n >= 0 }.'
            ],
            keywords: ['a^n b^n', 'empilhar', 'desempilhar', 'pilha'],
            estimatedMinutes: 18,
            references: [blauthCap3],
            summary: [
                { id: 'l11-ex-sum-1', text: 'Cada a empilha uma marca; cada b consome uma marca.' },
                { id: 'l11-ex-sum-2', text: 'A palavra é aceita quando a entrada termina e as marcas foram consumidas corretamente.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-05-24',
            content: [
                {
                    type: 'example',
                    title: 'AP para a^n b^n',
                    content: 'Na fase dos a, o AP empilha uma marca para cada símbolo lido. Ao entrar na fase dos b, ele desempilha uma marca por b. Se sobrar marca, faltou b; se faltar marca antes do fim, houve b demais.',
                    automatoRef: ap_an_bn
                },
                {
                    type: 'algorithm',
                    title: 'Simulação de aaabbb',
                    content: [
                        'Leia a, a, a e empilhe três marcas.',
                        'Ao ler o primeiro b, troque para a fase de desempilhamento.',
                        'Leia b, b, b e remova uma marca por vez.',
                        'Aceite se a entrada acabou e a pilha voltou à condição esperada.'
                    ]
                },
                {
                    type: 'checkpoint',
                    title: 'Onde a palavra falha?',
                    content: 'Em aaabb, sobra uma marca na pilha. Em aabbb, a pilha precisa desempilhar mais marcas do que foram empilhadas. Esses dois erros explicam o papel da pilha sem precisar decorar o desenho.'
                }
            ]
        },
        {
            id: 'l11-equivalencia',
            title: 'AP e GLC',
            description: 'A equivalência entre autômatos de pilha e gramáticas livres de contexto.',
            objectives: [
                { id: 'l11-eq-obj-1', text: 'Entender que APs e GLCs reconhecem a mesma classe de linguagens.' },
                { id: 'l11-eq-obj-2', text: 'Ler conversões como prova de equivalência de modelos, não como mera técnica algorítmica.' }
            ],
            prerequisites: [
                'GLC.',
                'AP.',
                'Derivação e aceitação.'
            ],
            keywords: ['equivalência', 'AP', 'GLC', 'conversão'],
            estimatedMinutes: 18,
            references: [blauthCap3],
            summary: [
                { id: 'l11-eq-sum-1', text: 'Toda GLC pode ser reconhecida por algum AP.' },
                { id: 'l11-eq-sum-2', text: 'Todo AP reconhece uma linguagem que pode ser gerada por alguma GLC.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-05-24',
            content: [
                {
                    type: 'text',
                    content: 'O livro conecta as duas visões de linguagens livres de contexto: a visão gerativa, por gramáticas, e a visão reconhecedora, por autômatos de pilha. Essa equivalência é uma das ideias centrais do capítulo.'
                },
                {
                    type: 'comparison',
                    title: 'Duas leituras da mesma classe',
                    content: [
                        'A GLC explica como construir palavras da linguagem.',
                        'O AP explica como reconhecer palavras da linguagem.',
                        'A equivalência garante que as duas descrições têm o mesmo poder expressivo.'
                    ]
                },
                {
                    type: 'note',
                    title: 'Intuição da conversão',
                    content: 'Para simular uma gramática, a pilha guarda variáveis ainda não expandidas. Para simular um AP por gramática, as variáveis descrevem trechos de computação que levam a pilha de uma configuração a outra.'
                }
            ]
        },
        {
            id: 'l11-aceitacao',
            title: 'Formas de Aceitação e Reconhecimento',
            description: 'Estado final, pilha vazia e algoritmos de reconhecimento associados às GLCs.',
            objectives: [
                { id: 'l11-acc-obj-1', text: 'Comparar aceitação por estado final e por pilha vazia.' },
                { id: 'l11-acc-obj-2', text: 'Relacionar APs a procedimentos de reconhecimento para LLCs.' }
            ],
            prerequisites: [
                'AP e GLC.',
                'Formas normais.'
            ],
            keywords: ['aceitação', 'estado final', 'pilha vazia', 'reconhecimento'],
            estimatedMinutes: 16,
            references: [blauthCap3],
            summary: [
                { id: 'l11-acc-sum-1', text: 'As formas de aceitação por estado final e por pilha vazia são equivalentes em poder.' },
                { id: 'l11-acc-sum-2', text: 'Reconhecimento de LLCs também pode ser estudado por algoritmos sobre gramáticas.' }
            ],
            status: 'reviewed',
            reviewedBy: 'Codex',
            lastReviewedAt: '2026-05-24',
            content: [
                {
                    type: 'list',
                    title: 'Duas formas',
                    content: [
                        'Aceitação por estado final: a entrada termina e o AP está em um estado final.',
                        'Aceitação por pilha vazia: a entrada termina e a pilha foi esvaziada conforme a convenção da máquina.',
                        'As duas formas podem ser convertidas uma na outra sem mudar a classe reconhecida.'
                    ]
                },
                {
                    type: 'note',
                    title: 'Reconhecimento de palavras',
                    content: 'Além de simular APs, o livro também situa algoritmos para verificar se uma palavra pertence a uma LLC, como CYK e Earley, quando a linguagem é dada por uma gramática.'
                },
                {
                    type: 'checkpoint',
                    title: 'Cuidados ao simular',
                    content: 'Sempre acompanhe três coisas ao mesmo tempo: símbolo de entrada consumido, estado atual e conteúdo da pilha. Ignorar qualquer uma delas costuma explicar respostas erradas em exercícios.'
                }
            ]
        }
    ]
};
