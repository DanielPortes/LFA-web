import type { CourseModule } from '../../../types';
import { pacman_grafo_antes, pacman_grafo_depois } from '../automataDefs';

export const mod8: CourseModule = {
    id: 'mod8',
    title: 'Módulo 8: Aplicações e Tópicos Avançados',
    lessons: [
        {
            id: 'l8-compiladores',
            title: 'Análise Léxica',
            description: 'O uso de AFDs em compiladores.',
            content: [
                {
                    type: 'text',
                    content: 'O analisador léxico (scanner) usa AFDs para quebrar o código-fonte em tokens (identificadores, números, palavras-chave).'
                }
            ]
        },
        {
            id: 'l8-grafos',
            title: 'Gramáticas de Grafos',
            description: 'Além de cadeias lineares.',
            content: [
                {
                    type: 'definition',
                    title: 'Gramática de grafos',
                    content: 'Assim como gramáticas de cadeias substituem um simbolo por uma sequência, gramáticas de grafos substituem um subgrafo por outro subgrafo, modelando estruturas complexas e sistemas concorrentes.'
                },
                {
                    type: 'example',
                    title: 'Sistemas de reescrita: o exemplo do Pac-Man',
                    content: 'Podemos modelar o jogo Pac-Man como uma linguagem de grafos. As regras de produção definem como o estado do jogo evolui.',
                    automatoRef: pacman_grafo_antes,
                    automatoRef2: pacman_grafo_depois
                },
                {
                    type: 'list',
                    title: 'Componentes do grafo-palavra',
                    content: [
                        'Nodos pretos: lugares do tabuleiro e caminhos possíveis.',
                        'Nodos com simbologia própria: entidades (Pac-Man, Fantasmas) conectadas ao tabuleiro.',
                        'Nodos brancos: descrevem a fase atual e o status do jogo.',
                        'Derivação: substituição de um subgrafo conforme uma regra (move, come, mata).'
                    ]
                }
            ]
        }
    ]
};

