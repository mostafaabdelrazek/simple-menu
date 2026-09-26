import { qrSvgDocument } from './qrSvg.js';

/**
 * Rasterise a QR value onto a white canvas.
 *
 * The canvas has to be painted white first: JPEG has no alpha channel, so a
 * transparent background would come out black and the code would not scan.
 *
 * @param {string} value
 * @param {number} size Pixels per side.
 * @param {{ dark?: string }} options
 * @returns {Promise<HTMLCanvasElement>}
 */
export function renderQrToCanvas(value, size = 1024, options = {}) {
    const document_ = qrSvgDocument(value, { ...options, size });

    if (!document_) {
        return Promise.reject(new Error('Unable to encode the QR code.'));
    }

    const canvas = window.document.createElement('canvas');

    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext('2d');

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, size, size);

    return new Promise((resolve, reject) => {
        const image = new Image();
        const encoded = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(document_.svg)}`;

        image.onload = () => {
            context.drawImage(image, 0, 0, size, size);
            resolve(canvas);
        };
        image.onerror = () => reject(new Error('Unable to render the QR code.'));
        image.src = encoded;
    });
}

/**
 * A filesystem-friendly name for a downloaded code.
 *
 * @param {string} url
 * @param {string} [name] Human label, preferred over the URL when present.
 * @returns {string}
 */
export function qrFileName(url, name) {
    const source = String(name ?? '').trim() || String(url ?? '').replace(/^https?:\/\//, '');

    const slug = source
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();

    return `${slug || 'simplemenu'}-qr`;
}

export function saveDataUrl(dataUrl, filename) {
    const link = window.document.createElement('a');

    link.download = filename;
    link.href = dataUrl;
    link.click();
}

export function saveBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');

    link.download = filename;
    link.href = url;
    link.click();

    // Revoking immediately can cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
