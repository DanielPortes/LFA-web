import { describe, expect, it } from 'vitest';
import type { Estado } from '../types';
import { hasStateOverlaps, resolveDraggedStateCollisions } from './layout';

const states: Estado[] = [
    { id: 'q0', label: 'q0', x: 200, y: 200, isInicial: true, isFinal: false },
    { id: 'q1', label: 'q1', x: 200, y: 200, isInicial: false, isFinal: false },
    { id: 'q2', label: 'q2', x: 420, y: 200, isInicial: false, isFinal: true },
];

describe('layout collision helpers', () => {
    it('afasta estados recém-arrastados sem mover estados estáveis', () => {
        const resolved = resolveDraggedStateCollisions(states, new Set(['q1']));

        expect(hasStateOverlaps(resolved)).toBe(false);
        expect(resolved.find((state) => state.id === 'q0')).toMatchObject({ x: 200, y: 200 });
        expect(resolved.find((state) => state.id === 'q2')).toMatchObject({ x: 420, y: 200 });
        expect(resolved.find((state) => state.id === 'q1')).not.toMatchObject({ x: 200, y: 200 });
    });
});
