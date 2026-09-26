import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Download, Loader2 } from 'lucide-react';
import { QR_FORMATS, qrSvgDocument } from '../lib/qrSvg';
import { useI18n } from '../lib/i18n';
import { qrFileName, renderQrToCanvas, saveBlob, saveDataUrl } from '../lib/qrDownload';

const FORMAT_MIME = { png: 'image/png', jpeg: 'image/jpeg', svg: 'image/svg+xml' };

/**
 * One button that downloads the QR code for a link, with the output format
 * (PNG, SVG, JPEG) chosen from a small menu instead of three separate buttons.
 *
 * `kind` keeps the restaurant code and the menu code from saving to the same
 * file name when both are downloaded in a row.
 */
export default function QrDownloadButton({ value, name, kind = null, className = '' }) {
    const { dir, t } = useI18n();
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(null);
    const [error, setError] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;

        function onPointerDown(event) {
            if (!containerRef.current?.contains(event.target)) {
                setOpen(false);
            }
        }

        function onKeyDown(event) {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    async function download(format) {
        setOpen(false);
        setError(false);
        setBusy(format);

        const base = qrFileName(value, kind ? `${name} ${kind}` : name);

        try {
            if (format === 'svg') {
                const document_ = qrSvgDocument(value, { size: 1024 });

                if (!document_) {
                    throw new Error('encode failed');
                }

                saveBlob(new Blob([document_.svg], { type: FORMAT_MIME.svg }), `${base}.svg`);
            } else {
                const canvas = await renderQrToCanvas(value, 1024);
                const dataUrl =
                    format === 'jpeg'
                        ? canvas.toDataURL(FORMAT_MIME.jpeg, 0.92)
                        : canvas.toDataURL(FORMAT_MIME.png);

                saveDataUrl(dataUrl, `${base}.${format}`);
            }
        } catch {
            setError(true);
        } finally {
            setBusy(null);
        }
    }

    if (!value) {
        return null;
    }

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                aria-haspopup="menu"
                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50"
            >
                {busy ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <Download className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">{busy ? t('qr.preparing') : t('qr.download')}</span>
                <span className="sm:hidden">QR</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
            </button>

            {open && (
                <div
                    role="menu"
                    className={`absolute top-full z-50 mt-1 w-36 overflow-hidden rounded-lg border border-stone-200 bg-white p-1 shadow-lg ${
                        dir === 'rtl' ? 'right-0' : 'left-0'
                    }`}
                >
                    {QR_FORMATS.map((format) => (
                        <button
                            key={format}
                            type="button"
                            role="menuitem"
                            onClick={() => download(format)}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-start text-xs font-medium uppercase text-stone-700 hover:bg-stone-100"
                        >
                            {format}
                        </button>
                    ))}
                </div>
            )}

            {error && <p className="absolute top-full z-50 mt-1 w-52 rounded-lg bg-red-50 p-2 text-xs text-red-700">{t('qr.failed')}</p>}
        </div>
    );
}
