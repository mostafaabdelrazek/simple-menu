import { useMemo } from 'react';
import { encodeQr } from '../lib/qrcode';
import { qrPathData } from '../lib/qrSvg';

/**
 * Renders a real, scannable QR code as inline SVG.
 *
 * @param {string}  value       Text or URL to encode.
 * @param {string}  className   Classes for the <svg> element.
 * @param {number}  quiet       Quiet zone, in modules.
 * @param {string}  label       Accessible label.
 * @param {object}  innerRef    Ref forwarded to the <svg> element.
 */
export default function QrCode({ value, className = '', quiet = 2, label = 'QR code', innerRef }) {
    const code = useMemo(() => (value ? encodeQr(value) : null), [value]);
    const path = useMemo(() => qrPathData(code, quiet), [code, quiet]);

    if (!code) {
        return null;
    }

    const total = code.size + quiet * 2;

    return (
        <svg
            ref={innerRef}
            viewBox={`0 0 ${total} ${total}`}
            className={className}
            role="img"
            aria-label={label}
            shapeRendering="crispEdges"
        >
            <rect width={total} height={total} fill="#ffffff" />
            <path d={path} fill="#1c1917" />
        </svg>
    );
}
