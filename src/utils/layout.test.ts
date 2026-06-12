import { describe, expect, it } from 'vitest';
import type { Estado, Transicao } from '../types';
import { computeAutoLayout, hasStateOverlaps, optimizeLoadedLayout, resolveDraggedStateCollisions } from './layout';

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

describe('computeAutoLayout', () => {
    it('espalha um AP linear comprimido pela largura útil do canvas', () => {
        const pdaStates: Estado[] = [
            { id: 'q0', label: 'q0', x: 690, y: 620, isInicial: true, isFinal: false },
            { id: 'q1', label: 'q1', x: 660, y: 460, isInicial: false, isFinal: false },
            { id: 'qf', label: 'qf', x: 500, y: 500, isInicial: false, isFinal: true },
        ];
        const pdaTransitions: Transicao[] = [
            { id: 't1', de: 'q0', para: 'q1', simbolo: 'a, Z -> AZ', curvatura: 0 },
            { id: 't2', de: 'q0', para: 'q1', simbolo: 'a, A -> AA', curvatura: 0 },
            { id: 't3', de: 'q1', para: 'q1', simbolo: 'b, A -> eps', curvatura: 0 },
            { id: 't4', de: 'q1', para: 'qf', simbolo: 'eps, Z -> eps', curvatura: 0 },
            { id: 't5', de: 'q0', para: 'qf', simbolo: 'eps, Z -> eps', curvatura: 0 },
        ];

        const layouted = computeAutoLayout(pdaStates, pdaTransitions, 1160, 790);
        const byId = new Map(layouted.map((state) => [state.id, state]));
        const xs = layouted.map((state) => state.x);
        const ys = layouted.map((state) => state.y);

        expect(hasStateOverlaps(layouted, 120)).toBe(false);
        expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(1160 * 0.5);
        expect(Math.max(...ys)).toBeLessThan(790 - 110);
        expect(Math.min(...ys)).toBeGreaterThan(90);
        expect(byId.get('q0')!.x).toBeLessThan(byId.get('q1')!.x);
        expect(byId.get('q1')!.x).toBeLessThan(byId.get('qf')!.x);
    });

    it('usa largura e altura úteis em autômatos médios, sem empilhar tudo no centro', () => {
        const mediumStates: Estado[] = Array.from({ length: 9 }, (_, index) => ({
            id: `q${index}`,
            label: `q${index}`,
            x: 500 + (index % 3) * 18,
            y: 360 + Math.floor(index / 3) * 18,
            isInicial: index === 0,
            isFinal: index === 8,
        }));
        const mediumTransitions: Transicao[] = [
            { id: 't01', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
            { id: 't02', de: 'q0', para: 'q2', simbolo: 'b', curvatura: 0 },
            { id: 't13', de: 'q1', para: 'q3', simbolo: 'a', curvatura: 0 },
            { id: 't14', de: 'q1', para: 'q4', simbolo: 'b', curvatura: 0 },
            { id: 't25', de: 'q2', para: 'q5', simbolo: 'a', curvatura: 0 },
            { id: 't36', de: 'q3', para: 'q6', simbolo: 'a', curvatura: 0 },
            { id: 't47', de: 'q4', para: 'q7', simbolo: 'b', curvatura: 0 },
            { id: 't58', de: 'q5', para: 'q8', simbolo: 'a', curvatura: 0 },
            { id: 't67', de: 'q6', para: 'q7', simbolo: 'b', curvatura: 0 },
            { id: 't78', de: 'q7', para: 'q8', simbolo: 'a', curvatura: 0 },
        ];

        const layouted = computeAutoLayout(mediumStates, mediumTransitions, 1280, 820);
        const xs = layouted.map((state) => state.x);
        const ys = layouted.map((state) => state.y);

        expect(hasStateOverlaps(layouted, 112)).toBe(false);
        expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(1280 * 0.55);
        expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(820 * 0.32);
        expect(Math.min(...xs)).toBeGreaterThanOrEqual(90);
        expect(Math.max(...xs)).toBeLessThanOrEqual(1280 - 90);
        expect(Math.min(...ys)).toBeGreaterThanOrEqual(90);
        expect(Math.max(...ys)).toBeLessThanOrEqual(820 - 140);
    });

    it('reorganiza layouts carregados quando o automático detecta cluster ruim', () => {
        const clusteredStates: Estado[] = [
            { id: 'q0', label: 'q0', x: 500, y: 400, isInicial: true, isFinal: false },
            { id: 'q1', label: 'q1', x: 520, y: 420, isInicial: false, isFinal: false },
            { id: 'qf', label: 'qf', x: 540, y: 440, isInicial: false, isFinal: true },
        ];
        const transitions: Transicao[] = [
            { id: 't1', de: 'q0', para: 'q1', simbolo: 'a, Z -> AZ', curvatura: 0 },
            { id: 't2', de: 'q1', para: 'qf', simbolo: 'eps, Z -> eps', curvatura: 0 },
        ];

        const { states: optimized, needsReposition } = optimizeLoadedLayout(
            clusteredStates,
            transitions,
            1160,
            790
        );
        const xs = optimized.map((state) => state.x);

        expect(needsReposition).toBe(true);
        expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(1160 * 0.5);
        expect(hasStateOverlaps(optimized, 120)).toBe(false);
    });

    it('mantém o fluxo principal estável quando existem ciclos de retorno', () => {
        const cyclicStates: Estado[] = [
            { id: 'q0', label: 'q0', x: 0, y: 0, isInicial: true, isFinal: false },
            { id: 'q1', label: 'q1', x: 0, y: 0, isInicial: false, isFinal: false },
            { id: 'q2', label: 'q2', x: 0, y: 0, isInicial: false, isFinal: false },
            { id: 'qf', label: 'qf', x: 0, y: 0, isInicial: false, isFinal: true },
        ];
        const transitions: Transicao[] = [
            { id: 't01', de: 'q0', para: 'q1', simbolo: 'a', curvatura: 0 },
            { id: 't12', de: 'q1', para: 'q2', simbolo: 'a', curvatura: 0 },
            { id: 't21', de: 'q2', para: 'q1', simbolo: 'b', curvatura: 0 },
            { id: 't2f', de: 'q2', para: 'qf', simbolo: 'eps', curvatura: 0 },
        ];

        const layouted = computeAutoLayout(cyclicStates, transitions, 1000, 700);
        const byId = new Map(layouted.map((state) => [state.id, state]));

        expect(byId.get('q0')!.x).toBeLessThan(byId.get('q1')!.x);
        expect(byId.get('q1')!.x).toBeLessThan(byId.get('q2')!.x);
        expect(byId.get('q2')!.x).toBeLessThan(byId.get('qf')!.x);
    });
});
