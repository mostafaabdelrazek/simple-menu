import { useMemo } from 'react';
import { encodeQr } from '../lib/qrcode';

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

    const path = useMemo(() => {
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
    }, [code, quiet]);

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
