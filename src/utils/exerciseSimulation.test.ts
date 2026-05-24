import { describe, expect, it } from 'vitest';
import { simplePDA } from '../test/fixtures';
import { simulateWithTrace } from './exerciseSimulation';

describe('exerciseSimulation', () => {
    it('inclui configurações de pilha no traço de AP para explicar falhas e passos', () => {
        const { trace } = simulateWithTrace(simplePDA, 'ab');

        expect(trace[0]).toMatchObject({
            symbol: 'a',
            fromStacks: [['Z']],
            toStacks: [['A', 'Z']],
        });
        expect(trace[1]).toMatchObject({
            symbol: 'b',
            fromStacks: [['A', 'Z']],
            toStacks: [['Z']],
        });
    });
});
