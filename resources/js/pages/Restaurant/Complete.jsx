import { useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Download, UtensilsCrossed } from 'lucide-react';
import AppShell from '../../components/AppShell';
import CopyButton from '../../components/CopyButton';
import QrCode from '../../components/QrCode';

export default function Complete({ restaurant }) {
    const qrRef = useRef(null);
    const target = restaurant.menu_url || restaurant.profile_url;

    return (
        <AppShell>
            <Head title="Your menu is live!" />

            <div className="mx-auto max-w-lg text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                </span>
                <h1 className="mt-4 text-2xl font-bold text-stone-900">Your menu is live!</h1>
                <p className="mt-1 text-sm text-stone-600">
                    Share these links with your customers.
                </p>

                <Link
                    href="/dashboard"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
                >
                    <span className="inline-flex items-center gap-1">
                        <UtensilsCrossed className="h-4 w-4" />
                        Back to dashboard
                    </span>
                </Link>

                <div className="mt-8 grid gap-4">
                    <div className="rounded-2xl border border-stone-200 bg-white p-5 text-left">
                        <h2 className="text-sm font-semibold text-stone-900">Restaurant profile</h2>
                        <p className="mt-1 text-xs text-stone-500">
                            Full profile with your details and a &quot;View menu&quot; button.
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                            <code className="min-w-0 flex-1 truncate rounded-md bg-stone-100 px-3 py-2 text-xs text-stone-700">
                                {restaurant.profile_url}
                            </code>
                            <CopyButton text={restaurant.profile_url} label="Copy" />
                        </div>
                        <a
                            href={restaurant.profile_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block text-xs font-medium text-amber-600 hover:text-amber-700"
                        >
                            Open →
                        </a>
                    </div>

                    {restaurant.menu_url && (
                        <div className="rounded-2xl border border-stone-200 bg-white p-5 text-left">
                            <h2 className="text-sm font-semibold text-stone-900">Menu link</h2>
                            <p className="mt-1 text-xs text-stone-500">
                                Just the menu — perfect for QR codes or table tags.
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <code className="min-w-0 flex-1 truncate rounded-md bg-stone-100 px-3 py-2 text-xs text-stone-700">
                                    {restaurant.menu_url}
                                </code>
                                <CopyButton text={restaurant.menu_url} label="Copy" />
                            </div>
                            <a
                                href={restaurant.menu_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-block text-xs font-medium text-amber-600 hover:text-amber-700"
                            >
                                Open →
                            </a>
                        </div>
                    )}

                    {target && (
                        <div className="rounded-2xl border border-stone-200 bg-white p-5 text-left">
                            <h2 className="text-sm font-semibold text-stone-900">QR code</h2>
                            <p className="mt-1 text-xs text-stone-500">
                                Print it on your tables. Scanning it opens your menu — no app needed.
                            </p>

                            <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                                <div className="mx-auto rounded-2xl border border-stone-200 bg-white p-3 sm:mx-0">
                                    <QrCode
                                        innerRef={qrRef}
                                        value={target}
                                        className="h-40 w-40"
                                        label={`QR code for ${restaurant.name ?? 'your menu'}`}
                                    />
                                </div>

                                <div className="flex-1 space-y-2">
                                    <button
                                        type="button"
                                        onClick={() => downloadQr(qrRef.current, target)}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download PNG
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => printQr(qrRef.current, target)}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                                    >
                                        <UtensilsCrossed className="h-4 w-4" />
                                        Print table tents
                                    </button>
                                    <p className="text-xs leading-relaxed text-stone-500">
                                        The code always points to your live menu, so any change you make appears
                                        instantly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    );
}

const QR_SIZE = 1024;

function renderToCanvas(svg, size = QR_SIZE) {
    const canvas = document.createElement('canvas');

    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext('2d');

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, size, size);

    return new Promise((resolve, reject) => {
        const image = new Image();
        const encoded = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;

        image.onload = () => {
            context.drawImage(image, 0, 0, size, size);
            resolve(canvas);
        };
        image.onerror = () => reject(new Error('Unable to render the QR code.'));
        image.src = encoded;
    });
}

async function downloadQr(svg, url) {
    if (!svg) return;

    const canvas = await renderToCanvas(svg);
    const link = document.createElement('a');

    link.download = `${fileName(url)}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function printQr(svg, url) {
    if (!svg) return;

    const win = window.open('', '_blank', 'width=680,height=900');

    if (!win) return;

    const markup = new XMLSerializer().serializeToString(svg);

    win.document.write(
        `<!DOCTYPE html><html><head><title>${url}</title><style>
            body{margin:0;display:grid;place-items:center;min-height:100vh;font-family:system-ui,sans-serif;color:#1c1917}
            .tent{display:grid;gap:18px;justify-items:center;text-align:center;padding:40px}
            img{width:320px;height:320px}
            p{margin:0;font-size:15px;word-break:break-all;color:#57534e}
            @media print{@page{margin:12mm}}
        </style></head><body>
            <div class="tent">${markup}<p>${url}</p></div>
            <script>window.onload=()=>{window.print();window.close()}</script>
        </body></html>`
    );
    win.document.close();
}

function fileName(url) {
    const slug = String(url).replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/-+$/, '');

    return slug || 'simplemenu';
}
