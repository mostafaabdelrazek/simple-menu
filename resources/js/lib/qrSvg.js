import { encodeQr } from './qrcode.js';

export const QR_FORMATS = ['png', 'svg', 'jpeg'];

/**
 * Collapse a QR module grid into a single SVG path.
 *
 * Horizontal runs of dark modules become one rectangle each, which keeps the
 * markup far smaller than one <rect> per module.
 *
 * @param {{ size: number, modules: number[][] }} code
 * @param {number} quiet Quiet zone, in modules.
 * @returns {string}
 */
export function qrPathData(code, quiet = 2) {
    if (!code) {
        return '';
    }

    let d = '';

    for (let y = 0; y < code.size; y++) {
        let x = 0;

        while (x < code.size) {
            if (!code.modules[y][x]) {
                x++;
                continue;
            }

            let run = 1;

            while (x + run < code.size && code.modules[y][x + run]) {
                run++;
            }

            d += `M${x + quiet} ${y + quiet}h${run}v1h-${run}z`;
            x += run;
        }
    }

    return d;
}

/**
 * A standalone, scalable SVG document for a value.
 *
 * Used for the on-page component, the print view, and the SVG download, so all
 * three always encode exactly the same code.
 *
 * @param {string} value
 * @param {{ quiet?: number, dark?: string, light?: string, label?: string, size?: number }} options
 * @returns {{ svg: string, width: number }|null}
 */
export function qrSvgDocument(value, options = {}) {
    const { quiet = 2, dark = '#1c1917', light = '#ffffff', label = 'QR code', size = 1024 } = options;

    if (!value) {
        return null;
    }

    const code = encodeQr(value);

    if (!code) {
        return null;
    }

    const total = code.size + quiet * 2;
    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${total} ${total}" ` +
        `role="img" aria-label="${escapeXml(label)}" shape-rendering="crispEdges">` +
        `<rect width="${total}" height="${total}" fill="${light}"/>` +
        `<path d="${qrPathData(code, quiet)}" fill="${dark}"/>` +
        `</svg>`;

    return { svg, width: total };
}

function escapeXml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
