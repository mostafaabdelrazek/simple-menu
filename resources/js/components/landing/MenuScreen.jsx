import { Globe2 } from 'lucide-react';
import { EXAMPLE_MENU, discountPercent, translated } from '../../lib/exampleMenu';
import { LOCALES } from '../../lib/constants';

function formatPrice(value) {
    const number = Number(value);

    return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(number)} ${EXAMPLE_MENU.currency}`;
}

/**
 * A faithful preview of the menu a guest sees after scanning the QR code.
 *
 * @param {object}  props
 * @param {string}  props.locale         Language currently displayed.
 * @param {array}   props.languages      Languages available in this menu.
 * @param {array}   props.categories     Categories to show.
 * @param {string}  props.activeCategory Category id used for the navigation pills.
 * @param {Function} props.onLanguageChange  Makes the language pills interactive.
 */
export default function MenuScreen({
    locale,
    languages,
    categories,
    activeCategory = null,
    onLanguageChange = null,
    dense = true,
}) {
    const rtl = locale === 'ar';
    const priceNote = {
        en: `All prices in ${EXAMPLE_MENU.currency}`,
        ar: `جميع الأسعار: ${EXAMPLE_MENU.currency}`,
        fr: `Tous les prix en ${EXAMPLE_MENU.currency}`,
    }[locale];

    return (
        <div dir={rtl ? 'rtl' : 'ltr'} className="flex h-full flex-col bg-stone-950 pt-7 text-stone-100">
            <div className="flex items-center gap-2 border-b border-stone-800/70 px-3 pb-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-[11px] text-stone-950">
                    🍽
                </span>
                <span className="truncate text-[11px] font-semibold">{translated(EXAMPLE_MENU.name, locale)}</span>

                {languages.length > 1 && (
                    <span className="ms-auto flex items-center gap-0.5 rounded-md border border-stone-800 bg-stone-900/80 px-1 py-0.5">
                        <Globe2 className="h-2.5 w-2.5 text-stone-500" />
                        {languages.map((code) =>
                            onLanguageChange ? (
                                <button
                                    key={code}
                                    type="button"
                                    onClick={() => onLanguageChange(code)}
                                    className={`rounded px-1 py-px text-[8px] font-semibold transition ${
                                        code === locale ? 'bg-amber-500 text-white' : 'text-stone-400 hover:text-stone-200'
                                    }`}
                                >
                                    {code.toUpperCase()}
                                </button>
                            ) : (
                                <span
                                    key={code}
                                    className={`rounded px-1 py-px text-[8px] font-semibold ${
                                        code === locale ? 'bg-amber-500 text-white' : 'text-stone-500'
                                    }`}
                                    title={LOCALES[code]}
                                >
                                    {code.toUpperCase()}
                                </span>
                            )
                        )}
                    </span>
                )}
            </div>

            {categories.length > 1 && (
                <div className="flex gap-1.5 overflow-hidden border-b border-stone-800/70 px-3 py-2">
                    {categories.map((category) => (
                        <span
                            key={category.id}
                            className={`shrink-0 rounded-full border px-2 py-0.5 text-[8.5px] font-medium ${
                                category.id === activeCategory || activeCategory === null
                                    ? 'border-amber-500/60 bg-amber-500/10 text-amber-300'
                                    : 'border-stone-800 bg-stone-900/60 text-stone-500'
                            }`}
                        >
                            {translated(category.name, locale)}
                        </span>
                    ))}
                </div>
            )}

            <div className="min-h-0 flex-1 overflow-hidden px-3 pt-4">
                <p className="text-center text-[7px] font-semibold uppercase tracking-[0.3em] text-amber-400">Menu</p>
                <h3 className="mt-1.5 text-center font-serif text-lg font-semibold tracking-tight text-white">
                    {translated(EXAMPLE_MENU.menuName, locale)}
                </h3>
                <div className="mx-auto mt-2 flex items-center justify-center gap-2" aria-hidden="true">
                    <span className="h-px w-6 bg-gradient-to-r from-transparent to-stone-600" />
                    <span className="h-1 w-1 rotate-45 bg-amber-500" />
                    <span className="h-px w-6 bg-gradient-to-l from-transparent to-stone-600" />
                </div>
                <p className="mt-1.5 text-center text-[8px] text-stone-500">{priceNote}</p>

                <div className="mt-3 space-y-2">
                    {categories.map((category) => (
                        <div key={category.id}>
                            <div className="mb-1.5 flex items-center gap-2">
                                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-stone-700/70" />
                                <span className="text-[9px] font-semibold tracking-wide text-white">
                                    {translated(category.name, locale)}
                                </span>
                                <span className="h-px flex-1 bg-gradient-to-l from-stone-700/70 to-transparent" />
                            </div>

                            <div className="space-y-1.5">
                                {category.items.slice(0, dense ? 2 : category.items.length).map((item) => {
                                    const percent = discountPercent(item);

                                    return (
                                        <article
                                            key={translated(item.name, 'en')}
                                            className="flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-900/60 p-1.5"
                                        >
                                            <span
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-amber-500/25 to-amber-800/25 text-sm"
                                                aria-hidden="true"
                                            >
                                                {item.emoji}
                                            </span>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="truncate text-[10px] font-medium text-stone-100">
                                                        {translated(item.name, locale)}
                                                    </span>
                                                    <span
                                                        className="h-px min-w-0 flex-1 border-b border-dotted border-stone-700"
                                                        aria-hidden="true"
                                                    />
                                                    {!item.discountPrice && (
                                                        <span className="shrink-0 text-[10px] font-semibold text-amber-300">
                                                            {formatPrice(item.price)}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="truncate text-[8.5px] text-stone-400">
                                                    {translated(item.description, locale)}
                                                </p>

                                                {item.discountPrice && (
                                                    <div className="mt-0.5 flex items-center gap-1.5">
                                                        <span className="text-[10px] font-semibold text-emerald-400">
                                                            {formatPrice(item.discountPrice)}
                                                        </span>
                                                        <span className="text-[8.5px] text-stone-500 line-through">
                                                            {formatPrice(item.price)}
                                                        </span>
                                                        {percent !== null && (
                                                            <span className="rounded-full bg-emerald-500/15 px-1 py-px text-[7px] font-bold text-emerald-400">
                                                                −{percent}%
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 border-t border-stone-800/70 pt-2 text-center text-[7.5px] text-stone-600">
                    Powered by <span className="text-stone-500">SimpleMenu</span>
                </div>
            </div>
        </div>
    );
}
