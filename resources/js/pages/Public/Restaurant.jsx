import { Head } from '@inertiajs/react';
import { ArrowRight, MapPin, UtensilsCrossed } from 'lucide-react';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import SocialIcon from '../../components/SocialIcon';
import { useI18n } from '../../lib/i18n';
import { menuThemeStyle } from '../../lib/menuTheme';

export default function Restaurant({ locale, ui_locale: uiLocale = 'en', languages, restaurant, menus, theme }) {
    // `locale` is the language the restaurant content is written in; `ui_locale`
    // is what the visitor asked for, and it owns the writing direction.
    const rtl = uiLocale === 'ar';
    const { t } = useI18n();
    const primary = menus.length === 1 ? menus[0] : null;

    return (
        <div
            dir={rtl ? 'rtl' : 'ltr'}
            className="menu-theme min-h-screen"
            style={menuThemeStyle(theme)}
        >
            <Head title={restaurant.name} />

            <header className="relative overflow-hidden">
                {restaurant.banner ? (
                    <div className="absolute inset-0">
                        <img src={restaurant.banner} alt="" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-b from-[var(--menu-scrim-top)] via-[var(--menu-scrim-mid)] to-[var(--menu-bg)]" />
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--menu-surface)] to-[var(--menu-bg)]">
                        <div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--menu-accent-soft)] blur-3xl" />
                    </div>
                )}

                <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-6">
                    <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-[var(--menu-accent)]">
                            <UtensilsCrossed className="h-4 w-4" />
                            SimpleMenu
                        </span>
                        <LanguageSwitcher variant="dark" current={locale} languages={languages} />
                    </div>

                    <div className="mt-14 flex flex-col items-center text-center">
                        {restaurant.logo ? (
                            <img
                                src={restaurant.logo}
                                alt={restaurant.name}
                                className="h-24 w-24 rounded-2xl border border-[var(--menu-line-strong)] object-cover shadow-2xl shadow-black/40"
                            />
                        ) : (
                            <span className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[var(--menu-accent)] text-[var(--menu-bg)] shadow-2xl shadow-black/30">
                                <UtensilsCrossed className="h-10 w-10" />
                            </span>
                        )}

                        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                            {restaurant.name}
                        </h1>

                        {restaurant.description && (
                            <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--menu-muted)]">
                                {restaurant.description}
                            </p>
                        )}

                        {(restaurant.address || restaurant.maps_url) && (
                            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
                                {restaurant.maps_url ? (
                                    <a
                                        href={restaurant.maps_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--menu-line-strong)] bg-[var(--menu-scrim-mid)] px-3 py-1.5 text-[var(--menu-fg)] backdrop-blur transition hover:border-[var(--menu-accent)] hover:text-[var(--menu-accent)]"
                                    >
                                        <MapPin className="h-3.5 w-3.5 text-[var(--menu-accent)]" />
                                        {restaurant.address || t('public.view_on_maps')}
                                    </a>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--menu-line-strong)] bg-[var(--menu-scrim-mid)] px-3 py-1.5 text-[var(--menu-fg)] backdrop-blur">
                                        <MapPin className="h-3.5 w-3.5 text-[var(--menu-accent)]" />
                                        {restaurant.address}
                                    </span>
                                )}
                            </div>
                        )}

                        {restaurant.social_links.length > 0 && (
                            <div className="mt-5 flex items-center justify-center gap-2">
                                {restaurant.social_links.map((link, i) => (
                                    <a
                                        key={i}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={link.name}
                                        title={link.name}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--menu-line-strong)] bg-[var(--menu-scrim-mid)] text-[var(--menu-fg)] backdrop-blur transition hover:border-[var(--menu-accent)] hover:text-[var(--menu-accent)]"
                                    >
                                        <SocialIcon name={link.icon || link.name} className="h-4 w-4" />
                                    </a>
                                ))}
                            </div>
                        )}

                        {primary && (
                            <a
                                href={primary.url}
                                className="group mt-9 inline-flex items-center gap-2 rounded-full bg-[var(--menu-accent)] px-7 py-3 font-semibold text-[var(--menu-bg)] shadow-lg shadow-black/30 transition hover:opacity-90"
                            >
                                {t('public.view_menu')}
                                <ArrowRight
                                    className={`h-4 w-4 transition group-hover:translate-x-0.5 ${rtl ? 'rotate-180' : ''}`}
                                />
                            </a>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-4 pb-24">
                {menus.length > 1 && (
                    <div className="space-y-3">
                        <p className="pb-1 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--menu-muted)]">
                            {t('public.menus')}
                        </p>
                        {menus.map((menu) => (
                            <a
                                key={menu.slug}
                                href={menu.url}
                                className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--menu-line)] bg-[var(--menu-surface)] px-5 py-4 transition hover:border-[var(--menu-accent)] hover:bg-[var(--menu-surface-strong)]"
                            >
                                <span className="min-w-0">
                                    <span className="block font-semibold">{menu.name || t('public.menu_fallback')}</span>
                                    <span className="mt-1 block text-xs text-[var(--menu-muted)]">
                                        {t('public.item_count', menu.items_count, { count: menu.items_count })}
                                        {menu.currency ? ` · ${menu.currency}` : ''}
                                    </span>
                                </span>
                                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--menu-line-strong)] text-[var(--menu-fg)] transition group-hover:border-[var(--menu-accent)] group-hover:bg-[var(--menu-accent)] group-hover:text-[var(--menu-bg)]">
                                    <ArrowRight className={`h-4 w-4 ${rtl ? 'rotate-180' : ''}`} />
                                </span>
                            </a>
                        ))}
                    </div>
                )}
            </main>

            <footer className="pb-10 text-center text-xs text-[var(--menu-faint)]">
                {t('public.powered_by')} <span className="text-[var(--menu-muted)]">{restaurant.name}</span>
            </footer>
        </div>
    );
}