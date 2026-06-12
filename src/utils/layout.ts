import type { Estado, Transicao } from '../types';

// ============================================================================
// CONSTANTS
// ============================================================================

const STATE_RADIUS = 28;
const LABEL_HEIGHT = 24;
const LABEL_PADDING = 8;
const MIN_STATE_SPACING = 130; // Increased from 100
const MIN_LABEL_STATE_SPACING = 15; // Increased from 8
const MIN_LABEL_LABEL_SPACING = 10; // Increased from 6
const MAX_LABEL_OFFSET_FROM_CURVE = 72;

// Layout constants
const REPULSION_FORCE = 15000;
const ANCHOR_FORCE = 0.08;
const DAMPING = 0.82;
const ITERATIONS = 120;
const EDGE_LENGTH = 180;

// ============================================================================
// BOUNDING BOX UTILITIES
// ============================================================================

interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Point {
    x: number;
    y: number;
}

interface LayoutBounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    width: number;
    height: number;
    cx: number;
    cy: number;
}

/**
 * Check if two axis-aligned bounding boxes overlap
 */
export const boxesOverlap = (a: BoundingBox, b: BoundingBox, padding = 0): boolean => {
    const aLeft = a.x - a.width / 2 - padding;
    const aRight = a.x + a.width / 2 + padding;
    const aTop = a.y - a.height / 2 - padding;
    const aBottom = a.y + a.height / 2 + padding;

    const bLeft = b.x - b.width / 2 - padding;
    const bRight = b.x + b.width / 2 + padding;
    const bTop = b.y - b.height / 2 - padding;
    const bBottom = b.y + b.height / 2 + padding;

    return !(aRight < bLeft || aLeft > bRight || aBottom < bTop || aTop > bBottom);
};

/**
 * Check if a rectangle overlaps with a circle
 */
export const boxOverlapsCircle = (
    box: BoundingBox,
    circleX: number,
    circleY: number,
    circleRadius: number,
    padding = 0
): boolean => {
    const halfW = box.width / 2;
    const halfH = box.height / 2;
    const r = circleRadius + padding;

    // Find the closest point on the rectangle to the circle center
    const closestX = Math.max(box.x - halfW, Math.min(circleX, box.x + halfW));
    const closestY = Math.max(box.y - halfH, Math.min(circleY, box.y + halfH));

    const dx = circleX - closestX;
    const dy = circleY - closestY;

    return dx * dx + dy * dy < r * r;
};

/**
 * Calculate distance between two points
 */
const distance = (p1: Point, p2: Point): number => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calculate distance from point to line segment
 */
const pointToSegmentDistance = (
    px: number, py: number,
    x1: number, y1: number,
    x2: number, y2: number
): number => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;

    if (lenSq === 0) return distance({ x: px, y: py }, { x: x1, y: y1 });

    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;

    return distance({ x: px, y: py }, { x: projX, y: projY });
};

// ============================================================================
// LABEL WIDTH CALCULATION
// ============================================================================

/**
 * Calculate label width based on text content
 */
export const calculateLabelWidth = (text: string): number => {
    if (!text) return 28;
    // Approximate character width for monospace font at 11px
    const charWidth = 7;
    const minWidth = 28;
    return Math.max(minWidth, text.length * charWidth + LABEL_PADDING * 2);
};

/**
 * Estimate label text for layout purposes
 */
const estimateLabelText = (t: Transicao): string => {
    let text = t.simbolo || '?';
    // Turing Machine heuristics
    if (t.write || t.direction) {
        text = `${t.simbolo}->${t.write || t.simbolo},${t.direction || 'R'}`;
    }
    // Mealy Machine heuristics
    else if (t.output) {
        text = `${t.simbolo} / ${t.output}`;
    }
    return text;
};

// ============================================================================
// STATE COLLISION DETECTION & RESOLUTION
// ============================================================================

/**
 * Check if any states overlap
 */
export const hasStateOverlaps = (states: Estado[], minSpacing = MIN_STATE_SPACING): boolean => {
    for (let i = 0; i < states.length; i++) {
        for (let j = i + 1; j < states.length; j++) {
            const dist = distance(states[i], states[j]);
            if (dist < minSpacing) return true;
        }
    }
    return false;
};

/**
 * Resolve state collisions by pushing overlapping states apart
 * Uses iterative relaxation algorithm
 */
export const resolveCollisions = (
    states: Estado[],
    minSpacing = MIN_STATE_SPACING
): Estado[] => {
    if (states.length < 2) return states;

    const result = states.map(s => ({ ...s }));
    let iterations = 0;
    const maxIterations = 50;
    let hasChanges = true;

    while (hasChanges && iterations < maxIterations) {
        hasChanges = false;
        iterations++;

        for (let i = 0; i < result.length; i++) {
            for (let j = i + 1; j < result.length; j++) {
                const a = result[i];
                const b = result[j];
                const dist = distance(a, b);

                if (dist < minSpacing) {
                    hasChanges = true;
                    const overlap = minSpacing - dist;

                    // Calculate push direction
                    let dx = b.x - a.x;
                    let dy = b.y - a.y;

                    // Handle exact overlap with random jitter
                    if (dist < 0.1) {
                        const angle = Math.random() * Math.PI * 2;
                        dx = Math.cos(angle);
                        dy = Math.sin(angle);
                    } else {
                        dx /= dist;
                        dy /= dist;
                    }

                    // Push both states apart equally
                    const push = (overlap / 2) + 2; // Extra 2px buffer
                    a.x -= dx * push;
                    a.y -= dy * push;
                    b.x += dx * push;
                    b.y += dy * push;
                }
            }
        }
    }

    return result.map(s => ({
        ...s,
        x: Math.round(s.x),
        y: Math.round(s.y)
    }));
};

const EXACT_OVERLAP_DIRECTIONS: Point[] = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: -Math.SQRT1_2, y: -Math.SQRT1_2 },
    { x: Math.SQRT1_2, y: -Math.SQRT1_2 },
    { x: -Math.SQRT1_2, y: Math.SQRT1_2 },
    { x: Math.SQRT1_2, y: Math.SQRT1_2 },
];

const chooseExactOverlapDirection = (
    candidate: Estado,
    allStates: Estado[],
    minSpacing: number
): Point => {
    let bestDirection = EXACT_OVERLAP_DIRECTIONS[0];
    let bestScore = -Infinity;

    for (const direction of EXACT_OVERLAP_DIRECTIONS) {
        const projected = {
            x: candidate.x + direction.x * minSpacing,
            y: candidate.y + direction.y * minSpacing,
        };
        const nearestDistance = allStates.reduce((nearest, state) => {
            if (state.id === candidate.id) return nearest;
            return Math.min(nearest, distance(projected, state));
        }, Infinity);

        if (nearestDistance > bestScore) {
            bestScore = nearestDistance;
            bestDirection = direction;
        }
    }

    return bestDirection;
};

/**
 * Resolve collisions caused by the latest drag without disturbing stable states.
 * This keeps mouse interaction cheap: only dragged nodes are relaxed on commit.
 */
export const resolveDraggedStateCollisions = (
    states: Estado[],
    draggedIds: ReadonlySet<string>,
    minSpacing = MIN_STATE_SPACING
): Estado[] => {
    if (states.length < 2 || draggedIds.size === 0) return states;

    const result = states.map((state) => ({ ...state }));
    const draggedIndexes = result
        .map((state, index) => (draggedIds.has(state.id) ? index : -1))
        .filter((index) => index >= 0);

    if (draggedIndexes.length === 0) return states;

    const maxIterations = Math.max(12, Math.min(80, draggedIndexes.length * result.length * 4));

    for (let iteration = 0; iteration < maxIterations; iteration++) {
        let moved = false;

        for (const draggedIndex of draggedIndexes) {
            const dragged = result[draggedIndex];

            for (let otherIndex = 0; otherIndex < result.length; otherIndex++) {
                if (otherIndex === draggedIndex) continue;

                const other = result[otherIndex];
                const dx = dragged.x - other.x;
                const dy = dragged.y - other.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist >= minSpacing) continue;

                const direction = dist < 0.001
                    ? chooseExactOverlapDirection(dragged, result, minSpacing)
                    : { x: dx / dist, y: dy / dist };
                const push = minSpacing - dist + 2;

                dragged.x += direction.x * push;
                dragged.y += direction.y * push;
                moved = true;
            }
        }

        if (!moved) break;
    }

    return result.map((state) => ({
        ...state,
        x: Math.round(state.x),
        y: Math.round(state.y),
    }));
};

// ============================================================================
// TRANSITION PATH ANALYSIS
// ============================================================================

interface TransitionPathInfo {
    id: string;
    sourceId: string;
    targetId: string;
    isLoop: boolean;
    midpoint: Point;
    controlPoint: Point;
    pathBounds: BoundingBox;
}

/**
 * Calculate information about transition paths for collision detection
 */
export const analyzeTransitionPaths = (
    transitions: Transicao[],
    states: Estado[]
): TransitionPathInfo[] => {
    const stateMap = new Map(states.map(s => [s.id, s]));
    const result: TransitionPathInfo[] = [];

    for (const t of transitions) {
        const source = stateMap.get(t.de);
        const target = stateMap.get(t.para);
        if (!source || !target) continue;

        const isLoop = t.de === t.para;

        if (isLoop) {
            // Loop path info
            result.push({
                id: t.id,
                sourceId: t.de,
                targetId: t.para,
                isLoop: true,
                midpoint: { x: source.x, y: source.y - 60 },
                controlPoint: { x: source.x, y: source.y - 80 },
                pathBounds: {
                    x: source.x,
                    y: source.y - 50,
                    width: 80,
                    height: 60
                }
            });
        } else {
            // Regular transition
            const mx = (source.x + target.x) / 2;
            const my = (source.y + target.y) / 2;

            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;

            // Normal vector
            const nx = -dy / dist;
            const ny = dx / dist;

            // Calculate control point based on curvature
            const curvature = t.curvatura || 0;
            const cpx = mx + nx * curvature;
            const cpy = my + ny * curvature;

            result.push({
                id: t.id,
                sourceId: t.de,
                targetId: t.para,
                isLoop: false,
                midpoint: { x: mx, y: my },
                controlPoint: { x: cpx, y: cpy },
                pathBounds: {
                    x: mx,
                    y: my,
                    width: Math.abs(dx) + Math.abs(curvature) * 2,
                    height: Math.abs(dy) + Math.abs(curvature) * 2
                }
            });
        }
    }

    return result;
};

// ============================================================================
// SMART CURVATURE CALCULATION
// ============================================================================

/**
 * Calculate optimal curvatures for all transitions to avoid overlaps
 * This considers:
 * - Bidirectional edges (should curve away from each other)
 * - Multiple parallel edges (should fan out)
 * - Edges passing through other states (should curve around)
 * - Label placement considerations
 */
export const calculateOptimalCurvatures = (
    transitions: Transicao[],
    states: Estado[]
): Map<string, number> => {
    const result = new Map<string, number>();
    const stateMap = new Map(states.map(s => [s.id, s]));

    // Group transitions by edge (considering direction)
    const edgeGroups = new Map<string, Transicao[]>();
    const reverseEdgeExists = new Map<string, boolean>();

    for (const t of transitions) {
        const key = `${t.de}->${t.para}`;
        const reverseKey = `${t.para}->${t.de}`;

        if (!edgeGroups.has(key)) edgeGroups.set(key, []);
        edgeGroups.get(key)!.push(t);

        if (edgeGroups.has(reverseKey)) {
            reverseEdgeExists.set(key, true);
            reverseEdgeExists.set(reverseKey, true);
        }
    }

    for (const t of transitions) {
        // Skip if manually controlled
        if (t.controlPoint !== undefined && t.controlPoint !== null) {
            result.set(t.id, t.curvatura);
            continue;
        }

        const source = stateMap.get(t.de);
        const target = stateMap.get(t.para);
        if (!source || !target) {
            result.set(t.id, 0);
            continue;
        }

        const isLoop = t.de === t.para;
        const key = `${t.de}->${t.para}`;
        const group = edgeGroups.get(key) || [];
        const index = group.indexOf(t);
        const count = group.length;
        const hasBidirectional = reverseEdgeExists.get(key) || false;
        const widestGroupLabel = group.reduce((widest, transition) => (
            Math.max(widest, calculateLabelWidth(estimateLabelText(transition)))
        ), calculateLabelWidth(estimateLabelText(t)));
        const labelAwareStep = clamp(widestGroupLabel * 0.22 + 18, 34, 72);

        if (isLoop) {
            // Loops: stack with enough room for long AP/MT labels.
            const baseCurve = -clamp(widestGroupLabel * 0.28 + 42, 56, 110);
            const step = clamp(widestGroupLabel * 0.18 + 28, 38, 70);
            result.set(t.id, baseCurve - index * step);
        } else if (hasBidirectional) {
            // Bidirectional: curve away from the straight line, keeping parallel labels separated.
            const baseCurve = clamp(widestGroupLabel * 0.2 + 36, 48, 92);
            const step = labelAwareStep;
            result.set(t.id, baseCurve + index * step);
        } else if (count > 1) {
            // Multiple parallel: fan out symmetrically with label-aware spacing.
            const spread = labelAwareStep;
            const center = (count - 1) / 2;
            result.set(t.id, (index - center) * spread);
        } else {
            // Single transition: Check if it needs to avoid other states
            const avoidanceCurve = calculateStateAvoidanceCurvature(source, target, states);
            result.set(t.id, avoidanceCurve);
        }
    }

    return result;
};

/**
 * Calculate curvature needed to avoid passing through other states
 */
const calculateStateAvoidanceCurvature = (
    source: Estado,
    target: Estado,
    allStates: Estado[]
): number => {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const edgeLength = Math.sqrt(dx * dx + dy * dy);

    if (edgeLength < 1) return 0;

    let maxCurvature = 0;

    for (const state of allStates) {
        if (state.id === source.id || state.id === target.id) continue;

        // Calculate distance from state center to the line segment
        const dist = pointToSegmentDistance(
            state.x, state.y,
            source.x, source.y,
            target.x, target.y
        );

        // If the line passes too close to a state, calculate needed curvature
        const threshold = STATE_RADIUS + 20;
        if (dist < threshold) {
            // Determine which side to curve to using cross product
            const cross = dx * (state.y - source.y) - dy * (state.x - source.x);
            const sign = cross > 0 ? 1 : -1;

            // Calculate curvature magnitude based on how close we are
            const curvatureMagnitude = (threshold - dist) * 1.5 + 25;
            const candidateCurvature = sign * curvatureMagnitude;

            // Take the largest needed curvature
            if (Math.abs(candidateCurvature) > Math.abs(maxCurvature)) {
                maxCurvature = candidateCurvature;
            }
        }
    }

    return maxCurvature;
};

// ============================================================================
// LABEL POSITIONING
// ============================================================================

interface LabelPlacement {
    x: number;
    y: number;
    width: number;
    height: number;
    transitionId: string;
}

/**
 * Calculate smart label positions that avoid overlapping with states and other labels
 */
export const calculateSmartLabelPositions = (
    transitions: Transicao[],
    states: Estado[],
    curvatures: Map<string, number>,
    labelTexts: Map<string, string>
): Map<string, { x: number; y: number }> => {
    const result = new Map<string, { x: number; y: number }>();
    const placedLabels: LabelPlacement[] = [];
    const stateMap = new Map(states.map(s => [s.id, s]));

    for (const t of transitions) {
        const source = stateMap.get(t.de);
        const target = stateMap.get(t.para);
        if (!source || !target) continue;

        const labelText = labelTexts.get(t.id) || t.simbolo || '?';
        const labelWidth = calculateLabelWidth(labelText);
        const curvature = curvatures.get(t.id) || 0;

        // Calculate base label position
        let basePos: Point;

        if (source.id === target.id) {
            // Loop: Position above
            const loopHeight = 50 + Math.abs(curvature) * 0.5;
            basePos = { x: source.x, y: source.y - loopHeight - 15 };
        } else {
            // Regular transition: follow the actual bezier midpoint, including manual control-point offsets.
            const cp = getTransitionControlPoint(source, target, t, curvature);
            basePos = {
                x: (source.x + 2 * cp.x + target.x) / 4,
                y: (source.y + 2 * cp.y + target.y) / 4
            };
        }

        // Try to find a position that doesn't overlap
        const resolvedPos = findNonOverlappingPosition(
            basePos,
            labelWidth,
            LABEL_HEIGHT,
            states,
            placedLabels,
            source,
            target
        );
        const finalPos = clampLabelOffset(basePos, resolvedPos, MAX_LABEL_OFFSET_FROM_CURVE);

        result.set(t.id, finalPos);
        placedLabels.push({
            x: finalPos.x,
            y: finalPos.y,
            width: labelWidth,
            height: LABEL_HEIGHT,
            transitionId: t.id
        });
    }

    return result;
};

const getTransitionControlPoint = (
    source: Estado,
    target: Estado,
    transition: Transicao,
    fallbackCurvature: number
): Point => {
    const mx = (source.x + target.x) / 2;
    const my = (source.y + target.y) / 2;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const tx = dx / dist;
    const ty = dy / dist;
    const nx = -dy / dist;
    const ny = dx / dist;

    if (transition.controlPoint) {
        return {
            x: mx + (nx * transition.controlPoint.x) + (tx * transition.controlPoint.y),
            y: my + (ny * transition.controlPoint.x) + (ty * transition.controlPoint.y)
        };
    }

    return {
        x: mx + nx * fallbackCurvature,
        y: my + ny * fallbackCurvature
    };
};

const clampLabelOffset = (anchor: Point, point: Point, maxDistance: number): Point => {
    const dx = point.x - anchor.x;
    const dy = point.y - anchor.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= maxDistance || dist <= 0.001) {
        return point;
    }

    const scale = maxDistance / dist;
    return {
        x: anchor.x + dx * scale,
        y: anchor.y + dy * scale
    };
};

/**
 * Find a position for a label that doesn't overlap with states or other labels
 */
const findNonOverlappingPosition = (
    basePos: Point,
    width: number,
    height: number,
    states: Estado[],
    placedLabels: LabelPlacement[],
    source: Estado,
    target: Estado
): Point => {
    const labelBox: BoundingBox = { x: basePos.x, y: basePos.y, width, height };

    // Check if base position is valid
    if (!hasOverlap(labelBox, states, placedLabels)) {
        return basePos;
    }

    // Calculate edge direction for offset trials
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    // Normal (perpendicular) direction
    const nx = -dy / dist;
    const ny = dx / dist;

    // Tangent (along edge) direction
    const tx = dx / dist;
    const ty = dy / dist;

    // Try perpendicular offsets first (most natural for curved edges)
    const perpOffsets = [15, -15, 25, -25, 35, -35, 45, -45];
    for (const offset of perpOffsets) {
        const testPos = {
            x: basePos.x + nx * offset,
            y: basePos.y + ny * offset
        };
        const testBox: BoundingBox = { ...testPos, width, height };
        if (!hasOverlap(testBox, states, placedLabels)) {
            return testPos;
        }
    }

    // Try tangent offsets
    const tangentOffsets = [20, -20, 35, -35];
    for (const offset of tangentOffsets) {
        const testPos = {
            x: basePos.x + tx * offset,
            y: basePos.y + ty * offset
        };
        const testBox: BoundingBox = { ...testPos, width, height };
        if (!hasOverlap(testBox, states, placedLabels)) {
            return testPos;
        }
    }

    // Try diagonal offsets
    const diagonalOffsets = [
        { dx: 20, dy: 15 }, { dx: -20, dy: 15 },
        { dx: 20, dy: -15 }, { dx: -20, dy: -15 },
        { dx: 30, dy: 25 }, { dx: -30, dy: 25 }
    ];
    for (const offset of diagonalOffsets) {
        const testPos = {
            x: basePos.x + offset.dx,
            y: basePos.y + offset.dy
        };
        const testBox: BoundingBox = { ...testPos, width, height };
        if (!hasOverlap(testBox, states, placedLabels)) {
            return testPos;
        }
    }

    // If all else fails, push away from the nearest colliding element
    return pushAwayFromCollision(basePos, width, height, states, placedLabels);
};

/**
 * Check if a label box overlaps with any state or placed label
 */
const hasOverlap = (
    box: BoundingBox,
    states: Estado[],
    placedLabels: LabelPlacement[]
): boolean => {
    // Check state overlaps
    for (const state of states) {
        if (boxOverlapsCircle(box, state.x, state.y, STATE_RADIUS, MIN_LABEL_STATE_SPACING)) {
            return true;
        }
    }

    // Check label overlaps
    for (const label of placedLabels) {
        const labelBox: BoundingBox = {
            x: label.x,
            y: label.y,
            width: label.width,
            height: label.height
        };
        if (boxesOverlap(box, labelBox, MIN_LABEL_LABEL_SPACING)) {
            return true;
        }
    }

    return false;
};

/**
 * Push a label away from the nearest collision
 */
const pushAwayFromCollision = (
    pos: Point,
    width: number,
    _height: number,
    states: Estado[],
    placedLabels: LabelPlacement[]
): Point => {
    let nearestDist = Infinity;
    let pushDir = { x: 0, y: -1 }; // Default: push up

    // Find nearest state
    for (const state of states) {
        const dist = distance(pos, state);
        if (dist < nearestDist) {
            nearestDist = dist;
            const dx = pos.x - state.x;
            const dy = pos.y - state.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            pushDir = { x: dx / d, y: dy / d };
        }
    }

    // Find nearest label
    for (const label of placedLabels) {
        const dist = distance(pos, label);
        if (dist < nearestDist) {
            nearestDist = dist;
            const dx = pos.x - label.x;
            const dy = pos.y - label.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            pushDir = { x: dx / d, y: dy / d };
        }
    }

    // Push away with enough distance
    const pushDistance = STATE_RADIUS + width / 2 + MIN_LABEL_STATE_SPACING + 5;
    return {
        x: pos.x + pushDir.x * pushDistance,
        y: pos.y + pushDir.y * pushDistance
    };
};

// ============================================================================
// AUTO LAYOUT
// ============================================================================

const clamp = (value: number, min: number, max: number): number => (
    Math.max(min, Math.min(max, value))
);

const createLayoutBounds = (width: number, height: number): LayoutBounds => {
    const safeWidth = Number.isFinite(width) && width > 100 ? width : 800;
    const safeHeight = Number.isFinite(height) && height > 100 ? height : 600;

    const leftInset = clamp(safeWidth * 0.12, 90, 190);
    const rightInset = clamp(safeWidth * 0.14, 110, 230);
    const topInset = clamp(safeHeight * 0.14, 88, 150);
    const bottomInset = clamp(safeHeight * 0.22, 128, 230);

    let minX = leftInset;
    let maxX = safeWidth - rightInset;
    let minY = topInset;
    let maxY = safeHeight - bottomInset;

    if (maxX - minX < MIN_STATE_SPACING * 2) {
        const mid = safeWidth / 2;
        minX = mid - MIN_STATE_SPACING;
        maxX = mid + MIN_STATE_SPACING;
    }

    if (maxY - minY < MIN_STATE_SPACING * 2) {
        const mid = safeHeight / 2;
        minY = mid - MIN_STATE_SPACING;
        maxY = mid + MIN_STATE_SPACING;
    }

    return {
        minX,
        maxX,
        minY,
        maxY,
        width: maxX - minX,
        height: maxY - minY,
        cx: (minX + maxX) / 2,
        cy: (minY + maxY) / 2,
    };
};

const buildGraphMaps = (states: Estado[], transitions: Transicao[]) => {
    const stateIds = new Set(states.map((state) => state.id));
    const incoming = new Map<string, string[]>();
    const outgoing = new Map<string, string[]>();

    states.forEach((state) => {
        incoming.set(state.id, []);
        outgoing.set(state.id, []);
    });

    transitions.forEach((transition) => {
        if (transition.de === transition.para) return;
        if (!stateIds.has(transition.de) || !stateIds.has(transition.para)) return;

        outgoing.get(transition.de)!.push(transition.para);
        incoming.get(transition.para)!.push(transition.de);
    });

    return { incoming, outgoing };
};

const chooseLayoutStarts = (
    states: Estado[],
    incoming: Map<string, string[]>
): string[] => {
    const initialStates = states.filter((state) => state.isInicial);
    if (initialStates.length > 0) return initialStates.map((state) => state.id);

    const sourceStates = states.filter((state) => (incoming.get(state.id) || []).length === 0);
    if (sourceStates.length > 0) return [sourceStates[0].id];

    return [states[0].id];
};

const computeShortestLayers = (
    starts: string[],
    outgoing: Map<string, string[]>
): Map<string, number> => {
    const layers = new Map<string, number>();
    const queue: string[] = [];

    starts.forEach((start) => {
        layers.set(start, 0);
        queue.push(start);
    });

    while (queue.length > 0) {
        const current = queue.shift()!;
        const currentLayer = layers.get(current) || 0;

        for (const next of outgoing.get(current) || []) {
            const nextLayer = currentLayer + 1;
            const previous = layers.get(next);
            if (previous !== undefined && previous <= nextLayer) continue;

            layers.set(next, nextLayer);
            queue.push(next);
        }
    }

    return layers;
};

const deriveLayerIndexes = (
    states: Estado[],
    transitions: Transicao[]
): Map<string, number> => {
    const { incoming, outgoing } = buildGraphMaps(states, transitions);
    const starts = chooseLayoutStarts(states, incoming);
    const shortestLayers = computeShortestLayers(starts, outgoing);
    const rawLayers = new Map<string, number>();
    const reachableMaxLayer = Math.max(0, ...shortestLayers.values());
    let disconnectedOffset = 0;

    states.forEach((state) => {
        const shortestLayer = shortestLayers.get(state.id);
        if (shortestLayer !== undefined) {
            rawLayers.set(state.id, shortestLayer);
            return;
        }

        rawLayers.set(state.id, reachableMaxLayer + 1 + disconnectedOffset);
        disconnectedOffset++;
    });

    states.forEach((state) => {
        const outgoingCount = (outgoing.get(state.id) || []).length;
        const shouldSitAfterPredecessors = state.isFinal || outgoingCount === 0;
        if (!shouldSitAfterPredecessors) return;

        const predecessorLayers = (incoming.get(state.id) || [])
            .map((previous) => rawLayers.get(previous))
            .filter((layer): layer is number => layer !== undefined);
        if (predecessorLayers.length === 0) return;

        const nextLayer = Math.max(...predecessorLayers) + 1;
        rawLayers.set(state.id, Math.max(rawLayers.get(state.id) || 0, nextLayer));
    });

    const uniqueLayers = [...new Set(rawLayers.values())].sort((a, b) => a - b);
    const compressedLayer = new Map(uniqueLayers.map((layer, index) => [layer, index]));

    return new Map(states.map((state) => [
        state.id,
        compressedLayer.get(rawLayers.get(state.id) || 0) || 0,
    ]));
};

const computeGridLayout = (states: Estado[], bounds: LayoutBounds): Estado[] => {
    const columns = Math.max(1, Math.ceil(Math.sqrt(states.length * (bounds.width / Math.max(bounds.height, 1)))));
    const rows = Math.max(1, Math.ceil(states.length / columns));
    const cellWidth = bounds.width / columns;
    const cellHeight = bounds.height / rows;

    return states.map((state, index) => {
        const row = Math.floor(index / columns);
        const column = index % columns;

        return {
            ...state,
            x: bounds.minX + cellWidth * (column + 0.5),
            y: bounds.minY + cellHeight * (row + 0.5),
        };
    });
};

const computeLayeredInitialLayout = (
    states: Estado[],
    transitions: Transicao[],
    bounds: LayoutBounds
): Estado[] => {
    const hasDirectedEdges = transitions.some((transition) => transition.de !== transition.para);
    if (!hasDirectedEdges) {
        return computeGridLayout(states, bounds);
    }

    const layerIndexes = deriveLayerIndexes(states, transitions);
    const layers = new Map<number, Estado[]>();
    states.forEach((state) => {
        const layer = layerIndexes.get(state.id) || 0;
        if (!layers.has(layer)) layers.set(layer, []);
        layers.get(layer)!.push(state);
    });

    const orderedLayerKeys = [...layers.keys()].sort((a, b) => a - b);
    if (orderedLayerKeys.length <= 1 && states.length > 1) {
        return computeGridLayout(states, bounds);
    }

    const originalIndex = new Map(states.map((state, index) => [state.id, index]));

    return orderedLayerKeys.flatMap((layerKey, layerOrder) => {
        const layerStates = [...(layers.get(layerKey) || [])].sort((a, b) => (
            (originalIndex.get(a.id) || 0) - (originalIndex.get(b.id) || 0)
        ));
        const x = orderedLayerKeys.length === 1
            ? bounds.cx
            : bounds.minX + (bounds.width * layerOrder) / (orderedLayerKeys.length - 1);
        const verticalGap = layerStates.length <= 1
            ? 0
            : Math.min(220, bounds.height / (layerStates.length - 1));

        return layerStates.map((state, rowIndex) => {
            const centeredRow = rowIndex - (layerStates.length - 1) / 2;
            const y = bounds.cy + centeredRow * verticalGap;

            return {
                ...state,
                x,
                y: clamp(y, bounds.minY, bounds.maxY),
            };
        });
    });
};

const relaxAroundAnchors = (
    states: Estado[],
    bounds: LayoutBounds,
    minSpacing: number
): Estado[] => {
    const nodes = states.map((state) => ({
        ...state,
        targetX: state.x,
        targetY: state.y,
        vx: 0,
        vy: 0,
    }));

    for (let iteration = 0; iteration < ITERATIONS; iteration++) {
        const temp = 1 - iteration / ITERATIONS;

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const a = nodes[i];
                const b = nodes[j];
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const distSq = Math.max(dx * dx + dy * dy, 0.1);
                const dist = Math.sqrt(distSq);
                const closeBoost = dist < minSpacing ? 2.5 : 1;
                const force = (REPULSION_FORCE * closeBoost * temp) / distSq;
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;

                if (Number.isFinite(fx) && Number.isFinite(fy)) {
                    a.vx -= fx;
                    a.vy -= fy;
                    b.vx += fx;
                    b.vy += fy;
                }
            }
        }

        for (const node of nodes) {
            node.vx += (node.targetX - node.x) * ANCHOR_FORCE * temp;
            node.vy += (node.targetY - node.y) * ANCHOR_FORCE * temp;

            node.x = clamp(node.x + node.vx, bounds.minX, bounds.maxX);
            node.y = clamp(node.y + node.vy, bounds.minY, bounds.maxY);
            node.vx *= DAMPING;
            node.vy *= DAMPING;
        }
    }

    return nodes.map((node) => ({
        ...node,
        x: node.x,
        y: node.y,
    }));
};

const resolveCollisionsInsideBounds = (
    states: Estado[],
    bounds: LayoutBounds,
    minSpacing: number
): Estado[] => {
    const result = states.map((state) => ({ ...state }));
    const maxIterations = 80;

    for (let iteration = 0; iteration < maxIterations; iteration++) {
        let moved = false;

        for (let i = 0; i < result.length; i++) {
            for (let j = i + 1; j < result.length; j++) {
                const a = result[i];
                const b = result[j];
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist >= minSpacing) continue;

                const direction = dist < 0.001
                    ? EXACT_OVERLAP_DIRECTIONS[(i + j + iteration) % EXACT_OVERLAP_DIRECTIONS.length]
                    : { x: dx / dist, y: dy / dist };
                const push = (minSpacing - dist) / 2 + 2;

                a.x = clamp(a.x - direction.x * push, bounds.minX, bounds.maxX);
                a.y = clamp(a.y - direction.y * push, bounds.minY, bounds.maxY);
                b.x = clamp(b.x + direction.x * push, bounds.minX, bounds.maxX);
                b.y = clamp(b.y + direction.y * push, bounds.minY, bounds.maxY);
                moved = true;
            }
        }

        if (!moved) break;
    }

    return result;
};

/**
 * Calculate a clean force-directed layout for the automaton
 */
export const computeAutoLayout = (
    states: Estado[],
    transitions: Transicao[],
    width: number,
    height: number
): Estado[] => {
    if (states.length === 0) return states;

    const safeWidth = Number.isFinite(width) && width > 100 ? width : 800;
    const safeHeight = Number.isFinite(height) && height > 100 ? height : 600;
    const bounds = createLayoutBounds(safeWidth, safeHeight);

    if (states.length === 1) {
        return [{
            ...states[0],
            x: Math.round(bounds.cx),
            y: Math.round(bounds.cy),
        }];
    }

    const minSpacing = Math.max(MIN_STATE_SPACING, Math.min(160, EDGE_LENGTH * 0.75));
    const initialLayout = computeLayeredInitialLayout(states, transitions, bounds);
    const relaxed = relaxAroundAnchors(initialLayout, bounds, minSpacing);
    const resolved = resolveCollisionsInsideBounds(relaxed, bounds, minSpacing);

    return resolved.map(({ id, label, isInicial, isFinal, output, x, y }) => ({
        id,
        label,
        isInicial,
        isFinal,
        ...(output === undefined ? {} : { output }),
        x: Math.round(Number.isFinite(x) ? x : bounds.cx),
        y: Math.round(Number.isFinite(y) ? y : bounds.cy),
    }));
};

// ============================================================================
// LAYOUT OPTIMIZATION FOR IMPORTS/TEMPLATES
// ============================================================================

/**
 * Optimize layout when loading from template or file
 */
export const optimizeLoadedLayout = (
    states: Estado[],
    transitions: Transicao[],
    viewportWidth: number,
    viewportHeight: number
): { states: Estado[]; needsReposition: boolean } => {
    if (states.length === 0) {
        return { states, needsReposition: false };
    }
    const safeWidth = Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : 0;
    const safeHeight = Number.isFinite(viewportHeight) && viewportHeight > 0 ? viewportHeight : 0;
    if (safeWidth === 0 || safeHeight === 0) {
        return { states, needsReposition: false };
    }

    // Check layout quality
    const hasOverlaps = hasStateOverlaps(states, MIN_STATE_SPACING - 20);
    const isOutOfBounds = checkOutOfBounds(states, safeWidth, safeHeight);
    const isTooSpread = checkTooSpread(states, safeWidth, safeHeight);
    const isTooClustered = checkTooClustered(states);

    if (!hasOverlaps && !isOutOfBounds && !isTooSpread && !isTooClustered) {
        return { states, needsReposition: false };
    }

    let optimizedStates = [...states];

    if (hasOverlaps || isTooClustered) {
        optimizedStates = computeAutoLayout(optimizedStates, transitions, safeWidth, safeHeight);
    }

    // Center and scale if needed
    if (isOutOfBounds || isTooSpread) {
        optimizedStates = centerAndFitLayout(optimizedStates, safeWidth, safeHeight);
    }

    return { states: optimizedStates, needsReposition: true };
};

const checkOutOfBounds = (states: Estado[], width: number, height: number): boolean => {
    const padding = STATE_RADIUS + 30;
    const minX = Math.min(...states.map(s => s.x));
    const maxX = Math.max(...states.map(s => s.x));
    const minY = Math.min(...states.map(s => s.y));
    const maxY = Math.max(...states.map(s => s.y));
    return (
        maxX < padding ||
        minX > width - padding ||
        maxY < padding ||
        minY > height - padding
    );
};

const checkTooSpread = (states: Estado[], width: number, height: number): boolean => {
    if (states.length < 2) return false;

    const minX = Math.min(...states.map(s => s.x));
    const maxX = Math.max(...states.map(s => s.x));
    const minY = Math.min(...states.map(s => s.y));
    const maxY = Math.max(...states.map(s => s.y));

    return (maxX - minX) > width * 1.5 || (maxY - minY) > height * 1.5;
};

const checkTooClustered = (states: Estado[]): boolean => {
    if (states.length < 3) return false;

    let closeCount = 0;
    for (let i = 0; i < states.length; i++) {
        for (let j = i + 1; j < states.length; j++) {
            if (distance(states[i], states[j]) < MIN_STATE_SPACING * 0.8) {
                closeCount++;
            }
        }
    }

    const totalPairs = (states.length * (states.length - 1)) / 2;
    return closeCount > totalPairs * 0.25;
};

const centerAndFitLayout = (states: Estado[], width: number, height: number): Estado[] => {
    if (states.length === 0) return states;

    const minX = Math.min(...states.map(s => s.x));
    const maxX = Math.max(...states.map(s => s.x));
    const minY = Math.min(...states.map(s => s.y));
    const maxY = Math.max(...states.map(s => s.y));

    const contentWidth = (maxX - minX) || 1;
    const contentHeight = (maxY - minY) || 1;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const padding = 100;
    const safeWidth = Math.max(width, padding * 2 + 1);
    const safeHeight = Math.max(height, padding * 2 + 1);
    const availableWidth = Math.max(1, safeWidth - padding * 2);
    const availableHeight = Math.max(1, safeHeight - padding * 2);

    const scaleX = availableWidth / contentWidth;
    const scaleY = availableHeight / contentHeight;
    const scale = Math.min(1, scaleX, scaleY);

    return states.map(s => ({
        ...s,
        x: Math.round(safeWidth / 2 + (s.x - centerX) * scale),
        y: Math.round(safeHeight / 2 + (s.y - centerY) * scale)
    }));
};
