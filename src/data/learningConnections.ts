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
    'Módulo 0 • Fundamentos de linguagens': {
        moduleId: 'mod0',
        lessonId: 'l0-intro',
        label: 'Módulo 0 • Alfabetos, palavras e linguagens'
    },
    'Módulo 0 • Operações sobre linguagens': {
        moduleId: 'mod0',
        lessonId: 'l0-operacoes',
        label: 'Módulo 0 • Operações sobre linguagens'
    },
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
    'Módulo 2 • AFN-ε e fecho': {
        moduleId: 'mod2',
        lessonId: 'l2-afne',
        label: 'Módulo 2 • AFN-ε e ε-fecho'
    },
    'Módulo 2 • Determinização': {
        moduleId: 'mod2',
        lessonId: 'l2-subset',
        label: 'Módulo 2 • Construção de subconjuntos'
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
    'Módulo 4 • Minimização': {
        moduleId: 'mod4',
        lessonId: 'l4-intro',
        label: 'Módulo 4 • Ideia de minimização'
    },
    'Módulo 4 • Algoritmo de minimização': {
        moduleId: 'mod4',
        lessonId: 'l4-algo',
        label: 'Módulo 4 • Tabela de marcação'
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
    'Módulo 6 • Gramáticas regulares': {
        moduleId: 'mod6',
        lessonId: 'l6-intro',
        label: 'Módulo 6 • Gramáticas regulares'
    },
    'Módulo 8 • Léxico e aplicações': {
        moduleId: 'mod8',
        lessonId: 'l8-compiladores',
        label: 'Módulo 8 • Análise léxica'
    },
    'Módulo 9 • Moore e Mealy': {
        moduleId: 'mod9',
        lessonId: 'l9-output',
        label: 'Módulo 9 • Máquinas com saída'
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
    },
    'Módulo 11 • Autômato de pilha': {
        moduleId: 'mod11',
        lessonId: 'l11-def',
        label: 'Módulo 11 • Definição de AP'
    },
    'Módulo 12 • Máquinas de Turing': {
        moduleId: 'mod12',
        lessonId: 'l12-tm',
        label: 'Módulo 12 • Máquinas de Turing'
    },
    'Módulo 12 • Decidibilidade': {
        moduleId: 'mod12',
        lessonId: 'l12-reducoes',
        label: 'Módulo 12 • Decisão e reduções'
    },
    'Módulo 12 • Hierarquia de Chomsky': {
        moduleId: 'mod12',
        lessonId: 'l12-hierarquia',
        label: 'Módulo 12 • Hierarquia'
    }
};

export const categoryTheoryRefs: Record<string, string[]> = {
    fundamentos: ['Módulo 0 • Fundamentos de linguagens', 'Módulo 0 • Operações sobre linguagens'],
    afd: ['Módulo 1 • Definição formal de AFD', 'Módulo 1 • Estados como memória finita'],
    lex: ['Módulo 8 • Léxico e aplicações', 'Módulo 3 • Expressões regulares'],
    afn: ['Módulo 2 • Intuição do não-determinismo', 'Módulo 2 • Determinização'],
    afne: ['Módulo 2 • AFN-ε e fecho'],
    er: ['Módulo 3 • Expressões regulares', 'Módulo 3 • Padrões de prefixo e sufixo'],
    gr: ['Módulo 6 • Gramáticas regulares'],
    cfg: ['Módulo 10 • Derivações em GLC', 'Módulo 10 • Exemplo clássico a^n b^n'],
    pda: ['Módulo 11 • Autômato de pilha'],
    chomsky: ['Módulo 12 • Hierarquia de Chomsky'],
    turing: ['Módulo 12 • Máquinas de Turing', 'Módulo 12 • Decidibilidade'],
    minimizacao: ['Módulo 4 • Minimização', 'Módulo 4 • Algoritmo de minimização'],
    moore_mealy: ['Módulo 9 • Moore e Mealy'],
    pumping: ['Módulo 5 • Lema do bombeamento', 'Módulo 5 • Estratégia de escolha de w']
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

export const resolveCategoryTheoryRefs = (categoryId: string): ResolvedTheoryLink[] => (
    resolveTheoryRefs(categoryTheoryRefs[categoryId])
);
