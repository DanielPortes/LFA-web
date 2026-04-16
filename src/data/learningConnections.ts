import { exerciciosDB } from './constants';

export interface ResolvedExerciseLink {
    ref: string;
    categoryId: string;
    categoryLabel: string;
    exerciseId: number;
    question: string;
    level: 'facil' | 'medio' | 'dificil';
}

export interface ResolvedTheoryLink {
    ref: string;
    moduleId: string;
    lessonId: string;
    label: string;
}

const exerciseCategoryLabels: Record<string, string> = {
    fundamentos: 'Fundamentos',
    afd: 'AFDs',
    lex: 'Léxico',
    afn: 'AFNs',
    afne: 'AFN-ε',
    er: 'Regex',
    gr: 'Gramática Regular',
    cfg: 'GLC',
    pda: 'Autômato de Pilha',
    chomsky: 'Chomsky',
    turing: 'Turing',
    minimizacao: 'Minimização',
    moore_mealy: 'Moore/Mealy',
    pumping: 'Bombeamento'
};

const theoryReferenceTargets: Record<string, Omit<ResolvedTheoryLink, 'ref'>> = {
    'Módulo 1 • Definição formal de AFD': {
        moduleId: 'mod1',
        lessonId: 'l1-def',
        label: 'Módulo 1 • Autômato Finito Determinístico'
    },
    'Módulo 1 • Estados como memória finita': {
        moduleId: 'mod1',
        lessonId: 'l1-projeto',
        label: 'Módulo 1 • Projeto de AFDs'
    },
    'Módulo 1 • AFD para padrões': {
        moduleId: 'mod1',
        lessonId: 'l1-projeto',
        label: 'Módulo 1 • Projeto de AFDs'
    },
    'Módulo 2 • Intuição do não-determinismo': {
        moduleId: 'mod2',
        lessonId: 'l2-concept',
        label: 'Módulo 2 • O poder do não determinismo'
    },
    'Módulo 2 • AFN para padrões': {
        moduleId: 'mod2',
        lessonId: 'l2-concept',
        label: 'Módulo 2 • O poder do não determinismo'
    },
    'Módulo 3 • Expressões regulares': {
        moduleId: 'mod3',
        lessonId: 'l3-def',
        label: 'Módulo 3 • Definição indutiva'
    },
    'Módulo 3 • Padrões de prefixo e sufixo': {
        moduleId: 'mod3',
        lessonId: 'l3-precedencia',
        label: 'Módulo 3 • Precedência e identidades'
    },
    'Módulo 3 • Linguagens definidas por substring': {
        moduleId: 'mod3',
        lessonId: 'l3-precedencia',
        label: 'Módulo 3 • Precedência e identidades'
    },
    'Módulo 5 • Lema do bombeamento': {
        moduleId: 'mod5',
        lessonId: 'l5-pumping',
        label: 'Módulo 5 • Lema do bombeamento (RL)'
    },
    'Módulo 5 • Estratégia de escolha de w': {
        moduleId: 'mod5',
        lessonId: 'l5-pumping',
        label: 'Módulo 5 • Lema do bombeamento (RL)'
    },
    'Módulo 10 • Derivações em GLC': {
        moduleId: 'mod10',
        lessonId: 'l10-deriv',
        label: 'Módulo 10 • Derivações e árvores'
    },
    'Módulo 10 • Exemplo clássico a^n b^n': {
        moduleId: 'mod10',
        lessonId: 'l10-def',
        label: 'Módulo 10 • Definição de GLC'
    }
};

const parseExerciseRef = (ref: string) => {
    const [categoryId, exerciseId] = ref.split(':');
    const normalizedId = Number(exerciseId);

    if (!categoryId || Number.isNaN(normalizedId)) {
        return null;
    }

    return { categoryId, exerciseId: normalizedId };
};

export const resolveExerciseRefs = (refs: string[] | undefined): ResolvedExerciseLink[] => {
    if (!refs || refs.length === 0) {
        return [];
    }

    return refs.flatMap((ref) => {
        const parsed = parseExerciseRef(ref);
        if (!parsed) {
            return [];
        }

        const exercise = exerciciosDB[parsed.categoryId]?.find((entry) => entry.id === parsed.exerciseId);
        if (!exercise) {
            return [];
        }

        return [{
            ref,
            categoryId: parsed.categoryId,
            categoryLabel: exerciseCategoryLabels[parsed.categoryId] ?? parsed.categoryId,
            exerciseId: exercise.id,
            question: exercise.pergunta,
            level: exercise.nivel
        }];
    });
};

export const resolveTheoryRefs = (refs: string[] | undefined): ResolvedTheoryLink[] => {
    if (!refs || refs.length === 0) {
        return [];
    }

    return refs.flatMap((ref) => {
        const resolved = theoryReferenceTargets[ref];
        if (!resolved) {
            return [];
        }

        return [{ ref, ...resolved }];
    });
};
