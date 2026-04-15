import type { AutomatoData } from '../../../types';
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
