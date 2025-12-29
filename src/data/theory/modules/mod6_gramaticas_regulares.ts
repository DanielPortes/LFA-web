import type { CourseModule } from '../../../types';

export const mod6: CourseModule = {
    id: 'mod6',
    title: 'Módulo 6: Gramáticas Regulares',
    lessons: [
        {
            id: 'l6-intro',
            title: 'Gramáticas Regulares',
            description: 'Outra forma de representar linguagens regulares.',
            content: [
                {
                    type: 'definition',
                    title: 'Definição',
                    content: 'Uma gramática regular (tipo 3) tem produções da forma A -> aB ou A -> a.'
                }
            ]
        }
    ]
};
