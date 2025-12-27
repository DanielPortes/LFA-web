import type { Estado } from '../types';

type ControlPointOffset = { x: number; y: number };

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

    return { mx, my, tx, ty, nx, ny };
};

/**
 * Retorna a posição do mouse relativa ao SVG.
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
const calculateControlPointLegacy = (source: Estado, target: Estado, curvature: number) => {
    const mx = (source.x + target.x) / 2;
    const my = (source.y + target.y) / 2;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    // Vetor normal unitário
    const nx = -dy / dist;
    const ny = dx / dist;

    // Aumentar curvatura se os estados estiverem muito próximos para evitar sobreposição visual
    // Apenas se for auto-calculado (mas aqui estamos apenas computando XY dado C)
    // Se C for fornecido manualmente, obedecemos
    
    // Pequeno ajuste para evitar retas perfeitas sobrepondo label se curvature for muito pequena mas não zero
    const adjustedCurvature = curvature;

    return {
        x: mx + nx * adjustedCurvature,
        y: my + ny * adjustedCurvature
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
 * Reverse Engineering: Calculates the 'curvature' scalar based on a mouse position being used as a control point.
 * Used when dragging the curve handle.
 */
export const calculateCurvatureFromPoint = (source: Estado, target: Estado, point: { x: number, y: number }) => {
    const { mx, my, nx, ny } = getEdgeBasis(source, target);
    
    // Vector from Midpoint to Mouse
    const vecX = point.x - mx;
    const vecY = point.y - my;
    
    // Project vector onto normal (Dot Product)
    // Curvature is essentially the distance along the normal
    const curvature = vecX * nx + vecY * ny;
    
    return curvature;
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
export const calculatePath = (
    source: Estado,
    target: Estado,
    curvature: number = 0,
    controlPointOffset?: ControlPointOffset | null
) => {
    const r = 28; // Raio do estado visual + padding

    // Loop (Auto-transição)
    if (source.id === target.id) {
        const x = source.x;
        const y = source.y;

        // Ajuste dinâmico baseado na curvatura (usada como offset de índice)
        // Se curvature for muito grande, o loop cresce
        const baseSize = 40;
        
        // Loop padrão sempre para cima, curvatura ajusta rotação? 
        // Por simplicidade, curvatura ajusta "tamanho" ou "rotação"
        // Vamos usar curvatura para definir a rotação do loop ao redor do estado
        
        // Se curvature for padrão (loop automático), é -50, -25 etc.
        // Vamos manter lógica simples anterior se for negativo (auto), 
        // e se for editado (provavelmente valores maiores ou quebrados), tentamos algo melhor?
        // Por enquanto, manter lógica de 'tamanho' do loop
        
        const loopW = baseSize * (1 + Math.abs(curvature)/100);
        const loopH = (baseSize + 10) * (1 + Math.abs(curvature)/100);
        
        // Curvature também pode rodar o loop? Seria legal.
        // Vamos usar o sinal da curvatura para inverter o lado (cima/baixo)
        const dir = curvature >= 0 ? 1 : 1; // Loops sempre pra cima por enquanto pra nao quebrar layouts existentes
        
        const angle = -Math.PI / 2; // Topo

        const anchorX = x + r * Math.cos(angle);
        const anchorY = y + r * Math.sin(angle);

        return `M ${anchorX - 10} ${anchorY} C ${x - loopW} ${y - loopH * dir}, ${x + loopW} ${y - loopH * dir}, ${anchorX + 10} ${anchorY}`;
    }

    // Transição entre estados distintos
    const cp = calculateControlPoint(source, target, curvature, controlPointOffset);

    // Encontrar ponto exato na borda do círculo de destino
    const end = getCircleIntersection(target.x, target.y, r + 4, cp.x, cp.y); // +4 para a ponta da seta

    // Encontrar ponto exato na borda do círculo de origem
    const start = getCircleIntersection(source.x, source.y, r, cp.x, cp.y);

    return `M ${start.x} ${start.y} Q ${cp.x} ${cp.y} ${end.x} ${end.y}`;
};

export const getLabelPosition = (
    source: Estado,
    target: Estado,
    curvature: number = 0,
    controlPointOffset?: ControlPointOffset | null
) => {
    if (source.id === target.id) {
         // Se loop
         const baseSize = 40;
         const loopH = (baseSize + 10) * (1 + Math.abs(curvature)/100);
         return { x: source.x, y: source.y - loopH - 10 };
    }

    const cp = calculateControlPoint(source, target, curvature, controlPointOffset);
    // T=0.5 é o ponto médio da curva
    return getQuadraticXY(0.5, source.x, source.y, cp.x, cp.y, target.x, target.y);
};
