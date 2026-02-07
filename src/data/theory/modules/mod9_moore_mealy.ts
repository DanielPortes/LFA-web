import type { CourseModule } from '../../../types';

export const mod9: CourseModule = {
    id: 'mod9',
    title: 'Módulo 9: Máquinas de Moore e Mealy',
    lessons: [
        {
            id: 'l9-output',
            title: 'Automatos com saída',
            description: 'Transdutores finitos.',
            content: [
                {
                    type: 'text',
                    content: 'Diferente dos aceitadores, as máquinas de Moore e Mealy produzem uma saída.'
                },
                {
                    type: 'definition',
                    title: 'Máquina de Mealy (sextupla)',
                    content: 'M = (Σ, Q, δ, q0, F, Δ), com δ: Q × Σ → Q × Δ*. A saída é gerada na transicao.'
                },
                {
                    type: 'definition',
                    title: 'Máquina de Moore (sétupla)',
                    content: 'M = (Σ, Q, δ, q0, F, Δ, δ_s), com δ_s: Q → Δ*. A saída é gerada no estado.'
                },
                {
                    type: 'note',
                    title: 'Diferença sutil (Blauth)',
                    content: 'Em Mealy, não há saída para a entrada vazia. Em Moore, a saída do estado inicial aparece mesmo com ε.'
                },
                {
                    type: 'example',
                    title: 'Exemplo clássico (Blauth)',
                    content: 'O livro usa um diálogo homem-máquina (criação e atualização de arquivos) para ilustrar Mealy.'
                }
            ]
        }
    ]
};

