import type { CourseModule } from '../../../types';
import { ap_an_bn } from '../automataDefs';

export const mod11: CourseModule = {
    id: 'mod11',
    title: 'Módulo 11: Autômatos de Pilha (AP)',
    lessons: [
        {
            id: 'l11-def',
            title: 'Definição de AP',
            description: 'Extensão dos autômatos finitos com memória.',
            content: [
                {
                    type: 'definition',
                    title: 'AP',
                    content: 'Um AP é uma 6-upla M = (Σ, Q, δ, q0, F, V), onde V é o alfabeto auxiliar (da pilha).'
                },
                {
                    type: 'definition',
                    title: 'Notação de transição (Blauth)',
                    content: 'No grafo, usa-se (a, A, α):\n• a: símbolo lido da fita.\n• A: símbolo desempilhado.\n• α: palavra empilhada.'
                },
                {
                    type: 'note',
                    title: 'Formas de aceitação',
                    content: 'O livro usa aceitação por estado final como padrão, mas menciona a equivalência com aceitação por pilha vazia.'
                }
            ]
        },
        {
            id: 'l11-ex',
            title: 'Exemplo: a^n b^n',
            description: 'Pilha para contar e comparar.',
            content: [
                {
                    type: 'example',
                    title: 'AP para a^n b^n',
                    content: 'Empilhe um A para cada a; ao ler b, desempilhe. Aceite quando a pilha esvaziar.',
                    automatoRef: ap_an_bn
                },
                {
                    type: 'note',
                    title: 'Ponto-chave',
                    content: 'A pilha guarda a quantidade de a para garantir a mesma quantidade de b.'
                }
            ]
        },
        {
            id: 'l11-aceitacao',
            title: 'Formas de aceitação',
            description: 'Estado final vs. pilha vazia.',
            content: [
                {
                    type: 'list',
                    title: 'Duas formas',
                    content: [
                        'Aceitação por estado final.',
                        'Aceitação por pilha vazia.',
                        'As duas formas são equivalentes em poder.'
                    ]
                },
                {
                    type: 'note',
                    title: 'Dica de prova',
                    content: 'Transforme um AP de um tipo no outro adicionando estados auxiliares.'
                }
            ]
        }
    ]
};
