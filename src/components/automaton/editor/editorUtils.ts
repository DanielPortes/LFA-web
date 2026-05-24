import type { AutomatoData, Transicao } from '../../../types';
import { isAP } from '../../../types';
import type { EditorPdaProps } from './types';

export const getEditorPdaProps = (data: AutomatoData): EditorPdaProps => {
    if (isAP(data)) {
        return {
            alfabetoPilha: data.alfabetoPilha,
            simboloInicialPilha: data.simboloInicialPilha,
            pdaAcceptance: data.pdaAcceptance,
        };
    }

    return {
        alfabetoPilha: undefined,
        simboloInicialPilha: undefined,
        pdaAcceptance: undefined,
    };
};

const firstInputSymbol = (symbol: string): string => {
    const trimmed = symbol.trim();
    if (!trimmed) return '';
    const beforeArrow = trimmed.split('->')[0]?.trim() ?? trimmed;
    const beforeComma = beforeArrow.split(',')[0]?.trim() ?? beforeArrow;
    const beforeOutput = beforeComma.split('/')[0]?.trim() ?? beforeComma;
    return beforeOutput || trimmed;
};

const normalizeTransitionForType = (transition: Transicao, tipo: AutomatoData['tipo']): Transicao => {
    const symbol = firstInputSymbol(transition.simbolo);
    const base = {
        id: transition.id,
        de: transition.de,
        para: transition.para,
        simbolo: symbol,
        curvatura: transition.curvatura,
        controlPoint: transition.controlPoint,
    };

    if (tipo === 'MT' || tipo === 'ALL') {
        const read = symbol || 'BLANK';
        return {
            ...base,
            simbolo: `${read} -> ${read}, R`,
            write: read,
            direction: 'R',
        };
    }

    return base;
};

export const normalizeAutomatonForType = (
    data: AutomatoData,
    nextTipo: AutomatoData['tipo'],
    pdaProps?: EditorPdaProps,
): AutomatoData => {
    const estados = data.estados.map((state) => ({
        ...state,
        output: nextTipo === 'Moore' ? state.output : undefined,
    }));
    const transicoes = data.transicoes.map((transition) => normalizeTransitionForType(transition, nextTipo));
    const base = {
        estados,
        transicoes,
        alfabeto: data.alfabeto,
        descricao: data.descricao,
    };

    if (nextTipo === 'AP') {
        return {
            ...base,
            tipo: 'AP',
            alfabetoPilha: pdaProps?.alfabetoPilha,
            simboloInicialPilha: pdaProps?.simboloInicialPilha ?? 'Z',
            pdaAcceptance: pdaProps?.pdaAcceptance ?? 'final',
        };
    }

    return {
        ...base,
        tipo: nextTipo,
    } as AutomatoData;
};
