import type { Estado } from '../types';

type ControlPointOffset = { x: number; y: number };

const STATE_RADIUS = 28;

const getEdgeBasis = (source: Estado, target: Estado) => {
    const mx = (source.x + target.x) / 2;
    const my = (source.y + target.y) / 2;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const tx = dx / dist;
    const ty = dy / dist;

    const nx = -dy / dist;
    const ny = dx / dist;

    return { mx, my, tx, ty, nx, ny, dist };
};

/**
 * Returns mouse position relative to SVG
 */
export const getMousePos = (e: React.MouseEvent | MouseEvent | React.TouchEvent | TouchEvent, svgRef: SVGSVGElement | null) => {
    if (!svgRef) return { x: 0, y: 0 };
    const CTM = svgRef.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };

    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
    }

    return {
        x: (clientX - CTM.e) / CTM.a,
        y: (clientY - CTM.f) / CTM.d
    };
};

/**
 * Calculate a point along a quadratic Bezier curve
 */
export const getQuadraticXY = (t: number, sx: number, sy: number, cp1x: number, cp1y: number, ex: number, ey: number) => {
    return {
        x: (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cp1x + t * t * ex,
        y: (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cp1y + t * t * ey
    };
};

/**
 * Calculate the symmetric fallback control point for a curved edge.
 */
const calculateControlPointLegacy = (source: Estado, target: Estado, curvature: number) => {
    const mx = (source.x + target.x) / 2;
    const my = (source.y + target.y) / 2;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const nx = -dy / dist;
    const ny = dx / dist;

    return {
        x: mx + nx * curvature,
        y: my + ny * curvature
    };
};

export const calculateControlPoint = (
    source: Estado,
    target: Estado,
    curvature: number,
    controlPointOffset?: ControlPointOffset | null
) => {
    if (controlPointOffset !== undefined && controlPointOffset !== null) {
        const { mx, my, tx, ty, nx, ny } = getEdgeBasis(source, target);
        return {
            x: mx + (nx * controlPointOffset.x) + (tx * controlPointOffset.y),
            y: my + (ny * controlPointOffset.x) + (ty * controlPointOffset.y)
        };
    }

    return calculateControlPointLegacy(source, target, curvature);
};

export const calculateControlOffsetFromPoint = (
    source: Estado,
    target: Estado,
    point: { x: number; y: number }
): ControlPointOffset => {
    const { mx, my, tx, ty, nx, ny } = getEdgeBasis(source, target);

    const vecX = point.x - mx;
    const vecY = point.y - my;

    return {
        x: (vecX * nx) + (vecY * ny),
        y: (vecX * tx) + (vecY * ty)
    };
};

/**
 * Calculate intersection between a line and state circle edge
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
 * Generate the SVG path (d attribute) for a transition
 */
export const calculatePath = (
    source: Estado,
    target: Estado,
    curvature: number = 0,
    controlPointOffset?: ControlPointOffset | null
) => {
    const r = STATE_RADIUS;

    // Loop (Self-transition)
    if (source.id === target.id) {
        const x = source.x;
        const y = source.y;

        const baseSize = 40;
        const loopW = baseSize * (1 + Math.abs(curvature) / 100);
        const loopH = (baseSize + 10) * (1 + Math.abs(curvature) / 100);

        const angle = -Math.PI / 2; // Top

        const anchorX = x + r * Math.cos(angle);
        const anchorY = y + r * Math.sin(angle);

        return `M ${anchorX - 10} ${anchorY} C ${x - loopW} ${y - loopH}, ${x + loopW} ${y - loopH}, ${anchorX + 10} ${anchorY}`;
    }

    // Transition between different states
    const cp = calculateControlPoint(source, target, curvature, controlPointOffset);

    // Find exact point on target circle edge
    const end = getCircleIntersection(target.x, target.y, r + 4, cp.x, cp.y);

    // Find exact point on source circle edge
    const start = getCircleIntersection(source.x, source.y, r, cp.x, cp.y);

    return `M ${start.x} ${start.y} Q ${cp.x} ${cp.y} ${end.x} ${end.y}`;
};

/**
 * Calculate base label position
 */
export const getLabelPosition = (
    source: Estado,
    target: Estado,
    curvature: number = 0,
    controlPointOffset?: ControlPointOffset | null
) => {
    if (source.id === target.id) {
        const baseSize = 40;
        const loopH = (baseSize + 10) * (1 + Math.abs(curvature) / 100);
        return { x: source.x, y: source.y - loopH - 10 };
    }

    const cp = calculateControlPoint(source, target, curvature, controlPointOffset);
    return getQuadraticXY(0.5, source.x, source.y, cp.x, cp.y, target.x, target.y);
};
