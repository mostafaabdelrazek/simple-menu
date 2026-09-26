import { Globe2 } from 'lucide-react';
import { LOCALES } from '../../lib/constants';

/**
 * Compact language switcher for the landing page.
 *
 * Built on <details> so it also works with JavaScript disabled, and it links to
 * the same page with a `lang` query parameter, which HomeController reads. The
 * preference is stored in the same cookie the rest of the app uses, so a
 * visitor who picks a language keeps it on public menus too.
 */
export default function LocaleMenu({ locale, languages, label, variant = 'light', className = '' }) {
    const dark = variant === 'dark';

    const shell = dark
        ? 'border-white/15 bg-white/10 text-stone-100 hover:bg-white/20'
        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50';

    return (
        <details className={`group relative ${className}`}>
            <summary
                className={`flex cursor-pointer list-none items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${shell} [&::-webkit-details-marker]:hidden`}
            >
                <Globe2 className="h-4 w-4 opacity-70" />
                <span className="uppercase">{locale}</span>
                <span className="sr-only">{label}</span>
            </summary>

            <div
                className={`absolute end-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border p-1 shadow-xl ${
                    dark ? 'border-white/15 bg-stone-900' : 'border-stone-200 bg-white'
                }`}
            >
                {languages.map((code) => (
                    <a
                        key={code}
                        href={`?lang=${code}`}
                        hrefLang={code}
                        lang={code}
                        onClick={() => rememberLocale(code)}
                        aria-current={code === locale ? 'true' : undefined}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                            dark
                                ? 'text-stone-200 hover:bg-white/10'
                                : 'text-stone-700 hover:bg-stone-100'
                        } ${code === locale ? (dark ? 'bg-white/10' : 'bg-amber-50') : ''}`}
                    >
                        <span>{LOCALES[code] ?? code}</span>
                        {code === locale && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                    </a>
                ))}
            </div>
        </details>
    );
}

export function rememberLocale(code) {
    document.cookie = `simplemenu_lang=${code};path=/;max-age=31536000;samesite=Lax`;

    try {
        localStorage.setItem('simplemenu_lang', code);
    } catch {
        // Storage unavailable; the cookie is enough.
    }
}
