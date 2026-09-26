import { Head, Link } from '@inertiajs/react';
import { ExternalLink, Pencil, Plus, Store } from 'lucide-react';
import AppShell from '../../components/AppShell';
import FlashMessage from '../../components/FlashMessage';
import CopyButton from '../../components/CopyButton';
import QrDownloadButton from '../../components/QrDownloadButton';
import { useI18n } from '../../lib/i18n';

export default function Dashboard({ restaurants }) {
    const { t } = useI18n();

    return (
        <AppShell>
            <Head title={t('dashboard.title')} />
            <FlashMessage />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900">{t('dashboard.heading')}</h1>
                    <p className="mt-1 text-sm text-stone-600">{t('dashboard.subtitle')}</p>
                </div>
                <Link
                    href="/restaurants/create"
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-white hover:bg-amber-600"
                >
                    <Plus className="h-5 w-5" />
                    {t('dashboard.new')}
                </Link>
            </div>

            {restaurants.length === 0 ? (
                <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-500">
                        <Store className="h-7 w-7" />
                    </span>
                    <h2 className="mt-4 text-lg font-semibold text-stone-900">{t('dashboard.empty_title')}</h2>
                    <p className="mt-1 max-w-sm text-sm text-stone-600">{t('dashboard.empty_text')}</p>
                    <Link
                        href="/restaurants/create"
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 font-semibold text-white hover:bg-amber-600"
                    >
                        <Plus className="h-5 w-5" />
                        {t('dashboard.empty_cta')}
                    </Link>
                </div>
            ) : (
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                    {restaurants.map((restaurant) => (
                        <div key={restaurant.id} className="rounded-2xl border border-stone-200 bg-white p-5">
                            <div className="flex items-center gap-3">
                                {restaurant.logo ? (
                                    <img
                                        src={restaurant.logo}
                                        alt={restaurant.name}
                                        className="h-11 w-11 rounded-xl object-cover"
                                    />
                                ) : (
                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                                        <Store className="h-6 w-6" />
                                    </span>
                                )}
                                <div className="min-w-0">
                                    <h3 className="truncate font-semibold text-stone-900">{restaurant.name}</h3>
                                    <div className="mt-0.5 flex items-center gap-3 text-xs text-stone-500">
                                        {t('dashboard.menu_count', { count: restaurant.menus.length })}
                                    </div>
                                </div>
                                <Link
                                    href={`/restaurants/${restaurant.slug}/edit`}
                                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:border-amber-400 hover:text-amber-700"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    {t('dashboard.edit')}
                                </Link>
                            </div>

                            <div className="mt-4 space-y-2 border-t border-stone-100 pt-4">
                                <div className="flex items-center justify-between gap-2">
                                    <a
                                        href={restaurant.profile_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex min-w-0 items-center gap-1 text-sm font-medium text-stone-700 hover:text-amber-600"
                                    >
                                        <ExternalLink className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{t('dashboard.profile_link')}</span>
                                    </a>
                                    <div className="flex shrink-0 items-center gap-1">
                                        <CopyButton text={restaurant.profile_url} />
                                        <QrDownloadButton
                                            value={restaurant.profile_url}
                                            name={restaurant.name}
                                            kind="restaurant"
                                        />
                                    </div>
                                </div>

                                {restaurant.menus.map((menu) => (
                                    <div
                                        key={menu.id}
                                        className="flex items-center justify-between gap-2 rounded-lg bg-stone-50 px-2 py-1.5"
                                    >
                                        <a
                                            href={menu.menu_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex min-w-0 items-center gap-1 text-sm text-stone-700 hover:text-amber-600"
                                        >
                                            <ExternalLink className="h-4 w-4 shrink-0" />
                                            <span className="truncate">
                                                {menu.name || t('dashboard.menu_fallback')} · {menu.currency}
                                            </span>
                                        </a>
                                        <div className="flex shrink-0 items-center gap-1">
                                            <CopyButton text={menu.menu_url} />
                                            <QrDownloadButton
                                                value={menu.menu_url}
                                                name={restaurant.name}
                                                kind="menu"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppShell>
    );
}
