import type { APData, AutomatoData } from '../../../types';
import type { ConversionStep } from '../../../utils/conversions';

export interface EditorViewState {
    zoom: number;
    pan: { x: number; y: number };
}

export interface EditorViewport {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface EditorPdaProps {
    alfabetoPilha?: APData['alfabetoPilha'];
    simboloInicialPilha?: APData['simboloInicialPilha'];
    pdaAcceptance?: APData['pdaAcceptance'];
}

export interface EditorConversionModalState {
    title: string;
    steps?: ConversionStep[];
    warnings?: string[];
    outputText?: string;
    automaton?: AutomatoData;
}

export interface LoadAutomatonOptions {
    successMessage?: string;
    quiet?: boolean;
    repositionMessage?: string;
}
