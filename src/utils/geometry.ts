import type { Estado } from '../types';

/**
 * Retorna a posição do mouse relativa ao SVG.
 */
export const getMousePos = (e: React.MouseEvent | MouseEvent, svgRef: SVGSVGElement | null) => {
    if (!svgRef) return { x: 0, y: 0 };
    const CTM = svgRef.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };
    return {
        x: (e.clientX - CTM.e) / CTM.a,
        y: (e.clientY - CTM.f) / CTM.d
    };
};

/**
 * Calcula um ponto ao longo de uma curva quadrática de Bézier.
 */
export const getQuadraticXY = (t: number, sx: number, sy: number, cp1x: number, cp1y: number, ex: number, ey: number) => {
    return {
        x: (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cp1x + t * t * ex,
        y: (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cp1y + t * t * ey
    };
};

/**
 * Calcula o ponto de controle para criar a curvatura da aresta.
 */
export const calculateControlPoint = (source: Estado, target: Estado, curvature: number) => {
    const mx = (source.x + target.x) / 2;
    const my = (source.y + target.y) / 2;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    // Vetor normal unitário
    const nx = -dy / dist;
    const ny = dx / dist;

    // Aumentar curvatura se os estados estiverem muito próximos para evitar sobreposição visual
    const adjustedCurvature = dist < 100 && curvature !== 0 ? curvature * 1.5 : curvature;

    return {
        x: mx + nx * adjustedCurvature,
        y: my + ny * adjustedCurvature
    };
};

/**
 * Calcula a interseção entre uma linha (do ponto de controle) e a borda do círculo do estado.
 */
const getCircleIntersection = (centerX: number, centerY: number, radius: number, pointX: number, pointY: number) => {
    const dx = pointX - centerX;
    const dy = pointY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    return {
        x: centerX + (dx / dist) * radius,
        y: centerY + (dy / dist) * radius
    };
};

/**
 * Gera o caminho SVG (d) para a transição.
 */
export const calculatePath = (source: Estado, target: Estado, curvature: number = 0) => {
    const r = 28; // Raio do estado visual + padding

    // Loop (Auto-transição)
    if (source.id === target.id) {
        const x = source.x;
        const y = source.y;

        // Ajuste dinâmico baseado na curvatura (usada como offset de índice)
        const scale = 1 + Math.abs(curvature) / 60;
        const loopW = 40 * scale;
        const loopH = 50 * scale;
        const angle = -Math.PI / 2; // Topo

        // Ponto de ancoragem no círculo
        const anchorX = x + r * Math.cos(angle);
        const anchorY = y + r * Math.sin(angle);

        return `M ${anchorX - 10} ${anchorY} C ${x - loopW} ${y - loopH}, ${x + loopW} ${y - loopH}, ${anchorX + 10} ${anchorY}`;
    }

    // Transição entre estados distintos
    const cp = calculateControlPoint(source, target, curvature);

    // Encontrar ponto exato na borda do círculo de destino
    const end = getCircleIntersection(target.x, target.y, r + 4, cp.x, cp.y); // +4 para a ponta da seta não sobrepor a borda

    // Encontrar ponto exato na borda do círculo de origem
    const start = getCircleIntersection(source.x, source.y, r, cp.x, cp.y);

    return `M ${start.x} ${start.y} Q ${cp.x} ${cp.y} ${end.x} ${end.y}`;
};

export const getLabelPosition = (source: Estado, target: Estado, curvature: number = 0) => {
    if (source.id === target.id) {
        const scale = 1 + Math.abs(curvature) / 60;
        return { x: source.x, y: source.y - (50 * scale) - 15 };
    }

    const cp = calculateControlPoint(source, target, curvature);
    // T=0.5 é o ponto médio da curva
    return getQuadraticXY(0.5, source.x, source.y, cp.x, cp.y, target.x, target.y);
};