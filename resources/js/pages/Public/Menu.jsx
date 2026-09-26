import { useEffect, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import { ArrowUp, UtensilsCrossed } from 'lucide-react';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useI18n } from '../../lib/i18n';
import { menuThemeStyle } from '../../lib/menuTheme';

function formatPrice(value, currency) {
    const number = parseFloat(value);

    return `${new Intl.NumberFormat(undefined, { minimumFractionDigits: number % 1 === 0 ? 0 : 2 }).format(
        number
    )} ${currency}`;
}

function discountPercent(price, discountPrice) {
    const original = parseFloat(price);
    const discounted = parseFloat(discountPrice);

    if (!Number.isFinite(original) || !Number.isFinite(discounted) || original <= 0 || discounted >= original) {
        return null;
    }

    return Math.round((1 - discounted / original) * 100);
}

export default function Menu({ locale, ui_locale: uiLocale = 'en', languages, restaurant, menu, theme }) {
    // `locale` is the language the menu itself is written in; `ui_locale` is the
    // language the visitor asked for, and it owns the writing direction.
    const rtl = uiLocale === 'ar';
    const { t } = useI18n();
    const [showTop, setShowTop] = useState(false);
    const [active, setActive] = useState(0);
    const headerRef = useRef(null);
    const sectionRefs = useRef([]);

    useEffect(() => {
        let ticking = false;

        function measure() {
            ticking = false;

            setShowTop(window.scrollY > 640);

            const offset = headerRef.current?.offsetHeight ?? 96;

            let index = 0;

            for (let i = 0; i < sectionRefs.current.length; i++) {
                const node = sectionRefs.current[i];

                if (node && node.getBoundingClientRect().top - offset - 16 <= 0) {
                    index = i;
                } else {
                    break;
                }
            }

            setActive(index);
        }

        function onScroll() {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(measure);
            }
        }

        measure();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    function scrollTo(index) {
        const node = sectionRefs.current[index];

        if (!node) return;

        const offset = headerRef.current?.offsetHeight ?? 96;

        window.scrollTo({
            top: node.getBoundingClientRect().top + window.scrollY - offset - 16,
            behavior: 'smooth',
        });
    }

    return (
        <div
            dir={rtl ? 'rtl' : 'ltr'}
            className="menu-theme min-h-screen overflow-x-clip"
            style={menuThemeStyle(theme)}
        >
            <Head title={`${restaurant.name} — Menu`} />

            <div className="border-b border-[var(--menu-line)] bg-[var(--menu-scrim-top)] backdrop-blur">
                <div className="mx-auto max-w-3xl px-4 pb-3 pt-3">
                    <div className="flex items-center justify-between gap-3">
                        <a href={restaurant.url} className="flex min-w-0 items-center gap-2.5">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--menu-accent)] text-[var(--menu-bg)]">
                                <UtensilsCrossed className="h-4 w-4" />
                            </span>
                            <span className="truncate font-semibold">{restaurant.name}</span>
                        </a>
                        <LanguageSwitcher variant="dark" current={locale} languages={languages} />
                    </div>
                </div>
            </div>

            {menu.categories.length > 1 && (
                <nav
                    ref={headerRef}
                    className="sticky top-0 z-40 overflow-x-auto overflow-y-hidden border-b border-[var(--menu-line)] bg-[var(--menu-scrim-top)] backdrop-blur [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    aria-label={t('public.menu_sections')}
                >
                    <div className="mx-auto max-w-3xl px-4 py-2">
                        <div className="mx-auto flex w-max gap-2">
                            {menu.categories.map((category, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => scrollTo(i)}
                                    className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition ${
                                        active === i
                                            ? 'border-[var(--menu-accent)] bg-[var(--menu-accent-soft)] text-[var(--menu-accent)]'
                                            : 'border-[var(--menu-line)] bg-[var(--menu-surface)] text-[var(--menu-muted)] hover:border-[var(--menu-line-strong)] hover:text-[var(--menu-fg)]'
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>
            )}

            <main className="mx-auto max-w-3xl px-4 pb-24 pt-10">
                <div className="mb-12 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--menu-accent)]">
                        {t('public.menu_eyebrow')}
                    </p>
                    <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                        {menu.name || restaurant.name}
                    </h1>
                    <div className="mx-auto mt-4 flex items-center gap-3" aria-hidden="true">
                        <span className="h-px w-10 bg-gradient-to-r from-transparent to-[var(--menu-line-strong)]" />
                        <span className="h-1 w-1 rotate-45 bg-[var(--menu-accent)]" />
                        <span className="h-px w-10 bg-gradient-to-r from-[var(--menu-line-strong)] to-transparent" />
                    </div>
                    <p className="mt-4 text-sm text-[var(--menu-muted)]">
                        {t('public.all_prices', { currency: menu.currency })}
                    </p>
                </div>

                {menu.categories.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-[var(--menu-line)] py-16 text-center text-sm text-[var(--menu-muted)]">
                        {t('public.no_categories')}
                    </div>
                )}

                <div className="space-y-14">
                    {menu.categories.map((category, i) => (
                        <section
                            key={i}
                            ref={(node) => {
                                sectionRefs.current[i] = node;
                            }}
                            className="scroll-mt-28"
                        >
                            <div className="mb-5 flex items-center gap-3">
                                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--menu-line)]" />
                                <h2 className="text-lg font-semibold tracking-wide">{category.name}</h2>
                                <span className="h-px flex-1 bg-gradient-to-r from-[var(--menu-line)] to-transparent" />
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {category.items.map((item, j) => {
                                    const pct = discountPercent(item.price, item.discount_price);

                                    return (
                                        <article
                                            key={j}
                                            className="flex min-w-0 gap-3 overflow-hidden rounded-2xl border border-[var(--menu-line)] bg-[var(--menu-surface)] p-3 transition duration-300 hover:border-[var(--menu-accent)] hover:bg-[var(--menu-surface-strong)] hover:shadow-lg hover:shadow-black/20"
                                        >
                                            {item.image && (
                                                <span className="h-24 w-24 shrink-0 overflow-hidden rounded-xl ring-1 ring-[var(--menu-line)]">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-full w-full max-w-full object-cover transition duration-300 group-hover:scale-105"
                                                    />
                                                </span>
                                            )}

                                            <div className="min-w-0 flex-1">
                                                {item.discount_price && pct !== null && (
                                                    <span className="mb-1 inline-flex items-center rounded-full bg-[var(--menu-accent-soft)] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-[var(--menu-sale)]">
                                                        −{pct}%
                                                    </span>
                                                )}

                                                <div className="flex items-baseline gap-2">
                                                    <h3 className="min-w-0 truncate font-medium">{item.name}</h3>
                                                    <span
                                                        className="h-px min-w-0 flex-1 border-b border-dotted border-[var(--menu-line)]"
                                                        aria-hidden="true"
                                                    />
                                                    {!item.discount_price && (
                                                        <span className="shrink-0 whitespace-nowrap font-semibold text-[var(--menu-accent)]">
                                                            {formatPrice(item.price, menu.currency)}
                                                        </span>
                                                    )}
                                                </div>

                                                {item.description && (
                                                    <p className="mt-1 break-words line-clamp-2 text-sm text-[var(--menu-muted)]">
                                                        {item.description}
                                                    </p>
                                                )}

                                                {item.discount_price && (
                                                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                                        <span className="whitespace-nowrap font-semibold text-[var(--menu-sale)]">
                                                            {formatPrice(item.discount_price, menu.currency)}
                                                        </span>
                                                        <span className="whitespace-nowrap text-sm text-[var(--menu-faint)] line-through">
                                                            {formatPrice(item.price, menu.currency)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>

                <footer className="mt-16 border-t border-[var(--menu-line)] pt-6 text-center text-xs text-[var(--menu-faint)]">
                    <a
                        href={restaurant.url}
                        className="font-medium text-[var(--menu-muted)] transition hover:text-[var(--menu-accent)]"
                    >
                        {t('public.visit', { name: restaurant.name })}
                    </a>
                    <p className="mt-1">
                        {t('public.powered_by')}{' '}
                        <span className="text-[var(--menu-muted)]">SimpleMenu</span>
                    </p>
                </footer>
            </main>

            <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label={t('public.back_to_top')}
                className={`fixed bottom-6 end-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--menu-line-strong)] bg-[var(--menu-scrim-top)] text-[var(--menu-muted)] backdrop-blur transition hover:border-[var(--menu-accent)] hover:text-[var(--menu-accent)] ${
                    showTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
                }`}
            >
                <ArrowUp className={`h-4 w-4 ${rtl ? 'rotate-180' : ''}`} />
            </button>
        </div>
    );
}