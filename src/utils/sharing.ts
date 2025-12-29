import type { AutomatoData } from '../types';

/**
 * Compress and encode automaton data for URL sharing
 */
export function encodeAutomaton(data: AutomatoData): string {
    try {
        const json = JSON.stringify(data);
        // Use base64url encoding (URL-safe)
        const base64 = btoa(unescape(encodeURIComponent(json)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
        return base64;
    } catch (e) {
        console.error('Failed to encode automaton:', e);
        return '';
    }
}

/**
 * Decode automaton data from URL
 */
export function decodeAutomaton(encoded: string): AutomatoData | null {
    try {
        // Restore base64 padding and characters
        let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }
        const json = decodeURIComponent(escape(atob(base64)));
        return JSON.parse(json);
    } catch {
        return null;
    }
}

/**
 * Generate shareable URL for current automaton
 */
export function generateShareUrl(data: AutomatoData): string {
    const encoded = encodeAutomaton(data);
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?automaton=${encoded}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (e) {
        // Fallback for older browsers
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        } catch (e2) {
            console.error('Failed to copy to clipboard:', e2);
            return false;
        }
    }
}

/**
 * Get automaton from URL if present
 */
export function getAutomatonFromUrl(): AutomatoData | null {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('automaton');
    if (encoded) {
        return decodeAutomaton(encoded);
    }
    return null;
}

/**
 * Export automaton as SVG string
 */
export function exportAsSvg(svgElement: SVGSVGElement): string {
    const clone = svgElement.cloneNode(true) as SVGSVGElement;

    // Add necessary styles inline
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .fill-ios-blue { fill: #007AFF; }
        .fill-ios-green { fill: #34C759; }
        .fill-ios-purple { fill: #AF52DE; }
        .stroke-ios-blue { stroke: #007AFF; }
        .stroke-ios-green { stroke: #34C759; }
        text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    `;
    clone.insertBefore(styleElement, clone.firstChild);

    const rect = svgElement.getBoundingClientRect();
    const width = rect.width || svgElement.clientWidth || 800;
    const height = rect.height || svgElement.clientHeight || 600;

    const backgroundStyle = window.getComputedStyle(svgElement.parentElement ?? svgElement);
    const rawBg = backgroundStyle.backgroundColor;
    const backgroundColor = rawBg && rawBg !== 'rgba(0, 0, 0, 0)' && rawBg !== 'transparent' ? rawBg : '#FFFFFF';
    const gridColor = window.getComputedStyle(document.documentElement)
        .getPropertyValue('--grid-color')
        .trim() || 'rgba(0, 0, 0, 0.05)';

    const svgNs = 'http://www.w3.org/2000/svg';
    const defs = clone.querySelector('defs') ?? document.createElementNS(svgNs, 'defs');
    if (!clone.querySelector('defs')) {
        clone.insertBefore(defs, clone.firstChild);
    }

    const patternId = 'grid-pattern-export';
    const pattern = document.createElementNS(svgNs, 'pattern');
    pattern.setAttribute('id', patternId);
    pattern.setAttribute('width', '40');
    pattern.setAttribute('height', '40');
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');

    const gridPath = document.createElementNS(svgNs, 'path');
    gridPath.setAttribute('d', 'M 40 0 L 0 0 0 40');
    gridPath.setAttribute('fill', 'none');
    gridPath.setAttribute('stroke', gridColor);
    gridPath.setAttribute('stroke-width', '1');
    pattern.appendChild(gridPath);
    defs.appendChild(pattern);

    const backgroundRect = document.createElementNS(svgNs, 'rect');
    backgroundRect.setAttribute('x', '0');
    backgroundRect.setAttribute('y', '0');
    backgroundRect.setAttribute('width', width.toString());
    backgroundRect.setAttribute('height', height.toString());
    backgroundRect.setAttribute('fill', backgroundColor);

    const gridRect = document.createElementNS(svgNs, 'rect');
    gridRect.setAttribute('x', '0');
    gridRect.setAttribute('y', '0');
    gridRect.setAttribute('width', width.toString());
    gridRect.setAttribute('height', height.toString());
    gridRect.setAttribute('fill', `url(#${patternId})`);
    gridRect.setAttribute('opacity', '0.6');

    const insertTarget = clone.querySelector('g') || clone.lastChild;
    if (insertTarget) {
        clone.insertBefore(gridRect, insertTarget);
        clone.insertBefore(backgroundRect, gridRect);
    } else {
        clone.appendChild(backgroundRect);
        clone.appendChild(gridRect);
    }

    clone.setAttribute('width', width.toString());
    clone.setAttribute('height', height.toString());
    clone.setAttribute('viewBox', `0 0 ${width} ${height}`);
    clone.setAttribute('xmlns', svgNs);

    return new XMLSerializer().serializeToString(clone);
}

/**
 * Export automaton as PNG data URL
 */
export async function exportAsPng(svgElement: SVGSVGElement, scale = 2): Promise<string> {
    return new Promise((resolve, reject) => {
        const svgString = exportAsSvg(svgElement);
        const rect = svgElement.getBoundingClientRect();

        const canvas = document.createElement('canvas');
        canvas.width = rect.width * scale;
        canvas.height = rect.height * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
        }

        const img = new Image();
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        img.onload = () => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load SVG image'));
        };

        img.src = url;
    });
}

/**
 * Download file with given content
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Download data URL as file
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
