import type { AutomatoData } from '../types';

export const cloneAutomaton = (data: AutomatoData): AutomatoData => {
    if (typeof structuredClone === 'function') {
        return structuredClone(data);
    }

    return JSON.parse(JSON.stringify(data)) as AutomatoData;
};
