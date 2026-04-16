import type { LessonReference } from '../types';

export interface BibliographyEntry {
    id: string;
    shortLabel: string;
    fullCitation: string;
    note?: string;
}

export const bibliography: Record<string, BibliographyEntry> = {
    blauth: {
        id: 'blauth',
        shortLabel: 'Blauth Menezes',
        fullCitation: 'MENEZES, Paulo Blauth. Linguagens Formais e Autômatos.',
        note: 'Fonte-base principal da trilha de estudo.'
    }
};

export const createLessonReference = (
    id: keyof typeof bibliography,
    locator?: string,
    note?: string
): LessonReference => {
    const entry = bibliography[id];

    return {
        id: entry.id,
        label: entry.shortLabel,
        citation: entry.fullCitation,
        locator,
        note: note ?? entry.note
    };
};
