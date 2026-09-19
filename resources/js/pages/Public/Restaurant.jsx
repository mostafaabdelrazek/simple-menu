import { Head } from '@inertiajs/react';
import { ArrowRight, MapPin, UtensilsCrossed } from 'lucide-react';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import SocialIcon from '../../components/SocialIcon';

export default function Restaurant({ locale, languages, restaurant, menus }) {
    const rtl = locale === 'ar';
    const primary = menus.length === 1 ? menus[0] : null;

    return (
        <div dir={rtl ? 'rtl' : 'ltr'} className="min-h-screen bg-stone-950 text-stone-100">
            <Head title={restaurant.name} />

            <header className="relative overflow-hidden">
                {restaurant.banner ? (
                    <div className="absolute inset-0">
                        <img src={restaurant.banner} alt="" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/50 to-stone-950" />
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-950">
                        <div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
                    </div>
                )}

                <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-6">
                    <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-amber-400/90">
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
                                className="h-24 w-24 rounded-2xl border border-white/10 object-cover shadow-2xl shadow-black/50"
                            />
                        ) : (
                            <span className="flex h-24 w-24 items-center justify-center rounded-2xl bg-amber-500 text-stone-950 shadow-2xl shadow-amber-500/25">
                                <UtensilsCrossed className="h-10 w-10" />
                            </span>
                        )}

                        <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            {restaurant.name}
                        </h1>

                        {restaurant.description && (
                            <p className="mt-3 max-w-xl text-base leading-relaxed text-stone-300">
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
                                        className="inline-flex items-center gap-1.5 rounded-full border border-stone-700/70 bg-stone-900/70 px-3 py-1.5 text-stone-300 backdrop-blur transition hover:border-amber-400/60 hover:text-amber-300"
                                    >
                                        <MapPin className="h-3.5 w-3.5 text-amber-400" />
                                        {restaurant.address || 'View on Google Maps'}
                                    </a>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-700/70 bg-stone-900/70 px-3 py-1.5 text-stone-300 backdrop-blur">
                                        <MapPin className="h-3.5 w-3.5 text-amber-400" />
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
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-700/70 bg-stone-900/70 text-stone-300 backdrop-blur transition hover:border-amber-400/60 hover:text-amber-300"
                                    >
                                        <SocialIcon name={link.icon || link.name} className="h-4 w-4" />
                                    </a>
                                ))}
                            </div>
                        )}

                        {primary && (
                            <a
                                href={primary.url}
                                className="group mt-9 inline-flex items-center gap-2 rounded-full bg-amber-500 px-7 py-3 font-semibold text-stone-950 shadow-lg shadow-amber-500/25 transition hover:bg-amber-400"
                            >
                                View menu
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
                        <p className="pb-1 text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
                            Menus
                        </p>
                        {menus.map((menu) => (
                            <a
                                key={menu.slug}
                                href={menu.url}
                                className="group flex items-center justify-between gap-4 rounded-2xl border border-stone-800 bg-stone-900/60 px-5 py-4 transition hover:border-amber-400/50 hover:bg-stone-900"
                            >
                                <span className="min-w-0">
                                    <span className="block font-semibold text-stone-100">{menu.name || 'Menu'}</span>
                                    <span className="mt-1 block text-xs text-stone-500">
                                        {menu.items_count} {menu.items_count === 1 ? 'item' : 'items'}
                                        {menu.currency ? ` · ${menu.currency}` : ''}
                                    </span>
                                </span>
                                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-700 text-stone-300 transition group-hover:border-amber-500 group-hover:bg-amber-500 group-hover:text-stone-950">
                                    <ArrowRight className={`h-4 w-4 ${rtl ? 'rotate-180' : ''}`} />
                                </span>
                            </a>
                        ))}
                    </div>
                )}
            </main>

            <footer className="pb-10 text-center text-xs text-stone-600">
                Powered by <span className="text-stone-500">{restaurant.name}</span>
            </footer>
        </div>
    );
}