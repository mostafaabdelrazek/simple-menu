import { Globe2, Lock } from 'lucide-react';
import { EXAMPLE_MENU, discountPercent, translated } from '../../lib/exampleMenu';
import { LOCALES } from '../../lib/constants';

function formatPrice(value) {
    const number = Number(value);

    return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(number)} ${EXAMPLE_MENU.currency}`;
}

/**
 * A scaled replica of the public menu page inside browser chrome.
 *
 * @param {object} props
 * @param {string} props.locale   Language shown in the preview.
 * @param {string} props.url      Address shown in the browser bar.
 * @param {number} props.active   Index of the category being previewed.
 * @param {Function} props.onLanguageChange  Makes the language pills interactive.
 * @param {Function} props.onCategoryChange  Makes the category pills interactive.
 */
export default function MenuBrowser({
    locale,
    languages,
    url,
    active = 0,
    onLanguageChange = null,
    onCategoryChange = null,
}) {
    const rtl = locale === 'ar';
    const category = EXAMPLE_MENU.categories[active] ?? EXAMPLE_MENU.categories[0];
    const visibleLanguages = languages ?? EXAMPLE_MENU.languages;
    const priceNote = {
        en: `All prices in ${EXAMPLE_MENU.currency}`,
        ar: `جميع الأسعار: ${EXAMPLE_MENU.currency}`,
        fr: `Tous les prix en ${EXAMPLE_MENU.currency}`,
    }[locale];

    return (
        <div className="overflow-hidden rounded-2xl bg-stone-950 shadow-2xl shadow-black/40 ring-1 ring-white/10">
            <div className="flex items-center gap-2 border-b border-stone-800 bg-stone-900 px-3 py-2.5">
                <span className="flex gap-1.5" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-stone-700" />
                    <span className="h-2.5 w-2.5 rounded-full bg-stone-700" />
                    <span className="h-2.5 w-2.5 rounded-full bg-stone-700" />
                </span>

                <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md bg-stone-950 px-2.5 py-1 text-[11px] text-stone-500">
                    <Lock className="h-2.5 w-2.5 shrink-0 text-emerald-500" />
                    <span className="truncate" dir="ltr">
                        {url ? url.replace(/^https?:\/\//, '') : 'menu.example.com'}
                    </span>
                </span>
            </div>

            <div dir={rtl ? 'rtl' : 'ltr'} className="bg-stone-950 px-4 pb-6 pt-3">
                <div className="flex items-center gap-2 border-b border-stone-800/70 pb-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-500 text-[9px] text-stone-950">
                        🍽
                    </span>
                    <span className="truncate text-[11px] font-semibold text-white">
                        {translated(EXAMPLE_MENU.name, locale)}
                    </span>

                    <span className="ms-auto flex items-center gap-0.5 rounded-md border border-stone-800 px-1 py-0.5">
                        <Globe2 className="h-2.5 w-2.5 text-stone-500" />
                        {visibleLanguages.map((code) =>
                            onLanguageChange ? (
                                <button
                                    key={code}
                                    type="button"
                                    onClick={() => onLanguageChange(code)}
                                    title={LOCALES[code]}
                                    className={`rounded px-1.5 py-px text-[8.5px] font-semibold transition ${
                                        code === locale ? 'bg-amber-500 text-white' : 'text-stone-500 hover:text-stone-300'
                                    }`}
                                >
                                    {code.toUpperCase()}
                                </button>
                            ) : (
                                <span
                                    key={code}
                                    className={`rounded px-1.5 py-px text-[8.5px] font-semibold ${
                                        code === locale ? 'bg-amber-500 text-white' : 'text-stone-500'
                                    }`}
                                >
                                    {code.toUpperCase()}
                                </span>
                            )
                        )}
                    </span>
                </div>

                <div className="px-2 pb-1 pt-5 text-center">
                    <p className="text-[8px] font-semibold uppercase tracking-[0.35em] text-amber-400">Menu</p>
                    <h3 className="mt-1.5 font-serif text-2xl font-semibold tracking-tight text-white">
                        {translated(EXAMPLE_MENU.menuName, locale)}
                    </h3>
                    <div className="mx-auto mt-2 flex items-center justify-center gap-2" aria-hidden="true">
                        <span className="h-px w-8 bg-linear-to-r from-transparent to-stone-600" />
                        <span className="h-1 w-1 rotate-45 bg-amber-500" />
                        <span className="h-px w-8 bg-linear-to-l from-stone-600 to-transparent" />
                    </div>
                    <p className="mt-2 text-[10px] text-stone-500">{priceNote}</p>
                </div>

                <div className="mt-4 flex gap-1.5 overflow-hidden px-2">
                    {EXAMPLE_MENU.categories.map((item, index) => (
                        <span
                            key={item.id}
                            className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[9px] font-medium transition ${
                                index === active
                                    ? 'border-amber-500/70 bg-amber-500/10 text-amber-300'
                                    : 'border-stone-800 bg-stone-900/60 text-stone-500'
                            }`}
                        >
                            {onCategoryChange ? (
                                <button type="button" onClick={() => onCategoryChange(index)} className="w-full">
                                    {translated(item.name, locale)}
                                </button>
                            ) : (
                                translated(item.name, locale)
                            )}
                        </span>
                    ))}
                </div>

                <div className="px-2 pt-5">
                    <div className="mb-3 flex items-center gap-2.5">
                        <span className="h-px flex-1 bg-linear-to-r from-transparent to-stone-700/70" />
                        <h4 className="text-xs font-semibold tracking-wide text-white">
                            {translated(category.name, locale)}
                        </h4>
                        <span className="h-px flex-1 bg-linear-to-l from-stone-700/70 to-transparent" />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        {category.items.map((item) => {
                            const percent = discountPercent(item);

                            return (
                                <article
                                    key={translated(item.name, 'en')}
                                    className="flex min-w-0 gap-2.5 rounded-xl border border-stone-800 bg-stone-900/60 p-2.5"
                                >
                                    <span
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-amber-500/20 to-amber-800/20 text-sm"
                                        aria-hidden="true"
                                    >
                                        {item.emoji}
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        {item.discountPrice && percent !== null && (
                                            <span className="mb-1 inline-flex items-center rounded-full bg-emerald-500/15 px-1.5 py-px text-[7px] font-bold text-emerald-400">
                                                −{percent}%
                                            </span>
                                        )}

                                        <div className="flex items-baseline gap-1.5">
                                            <span className="min-w-0 truncate text-[10.5px] font-medium text-stone-100">
                                                {translated(item.name, locale)}
                                            </span>
                                            <span
                                                className="h-px min-w-0 flex-1 border-b border-dotted border-stone-700"
                                                aria-hidden="true"
                                            />
                                            {!item.discountPrice && (
                                                <span className="shrink-0 text-[10.5px] font-semibold text-amber-300">
                                                    {formatPrice(item.price)}
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-0.5 line-clamp-2 text-[9px] leading-relaxed text-stone-400">
                                            {translated(item.description, locale)}
                                        </p>

                                        {item.discountPrice && (
                                            <div className="mt-1 flex items-center gap-1.5">
                                                <span className="text-[10.5px] font-semibold text-emerald-400">
                                                    {formatPrice(item.discountPrice)}
                                                </span>
                                                <span className="text-[9px] text-stone-500 line-through">
                                                    {formatPrice(item.price)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-5 border-t border-stone-800/70 pt-3 text-center text-[9px] text-stone-600">
                    Powered by <span className="text-stone-500">SimpleMenu</span>
                </div>
            </div>
        </div>
    );
}
