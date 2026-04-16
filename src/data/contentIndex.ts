import type {
    CommonMistake,
    ContentBlock,
    CourseModule,
    Lesson,
    LessonReference,
    LessonSummaryPoint
} from '../types';

export interface SearchEntry {
    lessonId: string;
    moduleId: string;
    moduleTitle: string;
    lessonTitle: string;
    terms: string[];
    excerpt: string;
    tags: string[];
    searchableText: string;
}

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

export const normalizeForSearch = (value: string) =>
    normalizeWhitespace(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

const joinText = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value.join(' ') : value ?? '';

const extractReferencesText = (references: LessonReference[] | undefined) =>
    references?.flatMap((reference) => [
        reference.label,
        reference.citation,
        reference.locator ?? '',
        reference.note ?? ''
    ]) ?? [];

const extractSummaryText = (summary: LessonSummaryPoint[] | undefined) =>
    summary?.map((point) => point.text) ?? [];

const extractCommonMistakesText = (commonMistakes: CommonMistake[] | undefined) =>
    commonMistakes?.flatMap((mistake) => [
        mistake.title,
        mistake.explanation,
        mistake.correction
    ]) ?? [];

const extractBlockTerms = (block: ContentBlock): string[] => {
    const terms = [
        block.title ?? '',
        joinText(block.content)
    ];

    if (block.grammarTreeData) {
        terms.push(block.grammarTreeData.symbol);
    }

    return terms.filter(Boolean);
};

const buildExcerpt = (lesson: Lesson) => {
    const firstTextualBlock = lesson.content.find((block) =>
        typeof block.content === 'string' && normalizeWhitespace(block.content).length > 0
    );

    const baseText = typeof firstTextualBlock?.content === 'string'
        ? firstTextualBlock.content
        : lesson.description;

    const excerpt = normalizeWhitespace(baseText);
    return excerpt.length > 180 ? `${excerpt.slice(0, 177)}...` : excerpt;
};

export const buildContentIndex = (modules: CourseModule[]): SearchEntry[] =>
    modules.flatMap((module) => module.lessons.map((lesson) => {
        const terms = [
            module.title,
            lesson.title,
            lesson.description,
            ...(lesson.objectives?.map((objective) => objective.text) ?? []),
            ...(lesson.prerequisites ?? []),
            ...(lesson.keywords ?? []),
            ...extractReferencesText(lesson.references),
            ...extractCommonMistakesText(lesson.commonMistakes),
            ...extractSummaryText(lesson.summary),
            ...lesson.content.flatMap(extractBlockTerms)
        ]
            .map((term) => normalizeWhitespace(term))
            .filter(Boolean);

        return {
            lessonId: lesson.id,
            moduleId: module.id,
            moduleTitle: module.title,
            lessonTitle: lesson.title,
            terms,
            excerpt: buildExcerpt(lesson),
            tags: lesson.keywords ?? [],
            searchableText: terms.map(normalizeForSearch).join(' ')
        };
    }));
