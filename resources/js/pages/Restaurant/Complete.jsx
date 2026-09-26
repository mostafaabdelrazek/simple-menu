import { useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, UtensilsCrossed } from 'lucide-react';
import AppShell from '../../components/AppShell';
import CopyButton from '../../components/CopyButton';
import QrCode from '../../components/QrCode';
import QrDownloadButton from '../../components/QrDownloadButton';
import { useI18n } from '../../lib/i18n';

export default function Complete({ restaurant }) {
    const { t } = useI18n();
    const qrRef = useRef(null);
    const target = restaurant.menu_url || restaurant.profile_url;

    return (
        <AppShell>
            <Head title={t('complete.title')} />

            <div className="mx-auto max-w-lg text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                </span>
                <h1 className="mt-4 text-2xl font-bold text-stone-900">{t('complete.title')}</h1>
                <p className="mt-1 text-sm text-stone-600">{t('complete.subtitle')}</p>

                <Link
                    href="/dashboard"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
                >
                    <span className="inline-flex items-center gap-1">
                        <UtensilsCrossed className="h-4 w-4" />
                        {t('complete.back')}
                    </span>
                </Link>

                <div className="mt-8 grid gap-4 text-start">
                    <div className="rounded-2xl border border-stone-200 bg-white p-5">
                        <h2 className="text-sm font-semibold text-stone-900">{t('complete.profile_title')}</h2>
                        <p className="mt-1 text-xs text-stone-500">{t('complete.profile_hint')}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <code className="min-w-0 flex-1 truncate rounded-md bg-stone-100 px-3 py-2 text-xs text-stone-700">
                                {restaurant.profile_url}
                            </code>
                            <CopyButton text={restaurant.profile_url} />
                            <QrDownloadButton
                                value={restaurant.profile_url}
                                name={restaurant.name}
                                kind="restaurant"
                            />
                        </div>
                        <a
                            href={restaurant.profile_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block text-xs font-medium text-amber-600 hover:text-amber-700"
                        >
                            {t('complete.open')}
                        </a>
                    </div>

                    {restaurant.menu_url && (
                        <div className="rounded-2xl border border-stone-200 bg-white p-5">
                            <h2 className="text-sm font-semibold text-stone-900">{t('complete.menu_title')}</h2>
                            <p className="mt-1 text-xs text-stone-500">{t('complete.menu_hint')}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <code className="min-w-0 flex-1 truncate rounded-md bg-stone-100 px-3 py-2 text-xs text-stone-700">
                                    {restaurant.menu_url}
                                </code>
                                <CopyButton text={restaurant.menu_url} />
                                <QrDownloadButton value={restaurant.menu_url} name={restaurant.name} kind="menu" />
                            </div>
                            <a
                                href={restaurant.menu_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-block text-xs font-medium text-amber-600 hover:text-amber-700"
                            >
                                {t('complete.open')}
                            </a>
                        </div>
                    )}

                    {target && (
                        <div className="rounded-2xl border border-stone-200 bg-white p-5">
                            <h2 className="text-sm font-semibold text-stone-900">{t('complete.qr_title')}</h2>
                            <p className="mt-1 text-xs text-stone-500">{t('complete.qr_hint')}</p>

                            <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                                <div className="mx-auto rounded-2xl border border-stone-200 bg-white p-3 sm:mx-0">
                                    <QrCode
                                        innerRef={qrRef}
                                        value={target}
                                        className="h-40 w-40"
                                        label={t('complete.qr_label', { name: restaurant.name ?? '' })}
                                    />
                                </div>

                                <div className="flex-1 space-y-2">
                                    <button
                                        type="button"
                                        onClick={() => printQr(qrRef.current, target)}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                                    >
                                        <UtensilsCrossed className="h-4 w-4" />
                                        {t('complete.print_tents')}
                                    </button>
                                    <p className="text-xs leading-relaxed text-stone-500">{t('complete.qr_note')}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    );
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
