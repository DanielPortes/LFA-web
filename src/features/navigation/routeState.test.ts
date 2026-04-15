import { describe, expect, it } from 'vitest';
import {
    areRouteStatesEqual,
    mergeRouteState,
    normalizeRouteState,
    parseRouteState,
    serializeRouteState,
} from './routeState';

describe('routeState', () => {
    it('normaliza campos de outras abas ao trocar de contexto', () => {
        expect(normalizeRouteState({
            tab: 'conteudo',
            moduleId: 'mod-1',
            lessonId: 'lesson-2',
            categoryId: 'afd',
            exerciseId: 3,
        })).toEqual({
            tab: 'conteudo',
            moduleId: 'mod-1',
            lessonId: 'lesson-2',
            categoryId: undefined,
            exerciseId: null,
            layout: undefined,
        });
    });

    it('força simulador quando a URL contém automaton compartilhado', () => {
        expect(parseRouteState('?tab=home&automaton=abc123')).toEqual({
            tab: 'simulador',
            moduleId: undefined,
            lessonId: undefined,
            categoryId: undefined,
            exerciseId: null,
            layout: undefined,
        });
    });

    it('serializa apenas os campos válidos da aba ativa', () => {
        expect(serializeRouteState({
            tab: 'exercicios',
            categoryId: 'afd',
            exerciseId: 7,
            moduleId: 'mod-1',
            lessonId: 'lesson-1',
            layout: 'side',
        })).toBe('tab=exercicios&cat=afd&ex=7&layout=side');
    });

    it('mescla patches limpando campos com null', () => {
        expect(mergeRouteState(
            {
                tab: 'conteudo',
                moduleId: 'mod-2',
                lessonId: 'lesson-4',
                categoryId: undefined,
                exerciseId: null,
                layout: 'bottom',
            },
            {
                tab: 'exercicios',
                moduleId: null,
                lessonId: null,
                categoryId: 'afn',
                exerciseId: 2,
            }
        )).toEqual({
            tab: 'exercicios',
            moduleId: undefined,
            lessonId: undefined,
            categoryId: 'afn',
            exerciseId: 2,
            layout: 'bottom',
        });
    });

    it('compara estados de rota sem falso positivo', () => {
        expect(areRouteStatesEqual(
            { tab: 'home', exerciseId: null },
            { tab: 'home', exerciseId: null }
        )).toBe(true);

        expect(areRouteStatesEqual(
            { tab: 'home', exerciseId: null },
            { tab: 'simulador', exerciseId: null }
        )).toBe(false);
    });
});
