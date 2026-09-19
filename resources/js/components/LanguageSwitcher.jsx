import { Globe2 } from 'lucide-react';
import { LOCALES } from '../lib/constants';

export default function LanguageSwitcher({ current, languages, variant = 'light' }) {
    if (!languages || languages.length < 2) return null;

    const dark = variant === 'dark';

    function remember(lang) {
        document.cookie = `simplemenu_lang=${lang};path=/;max-age=31536000;samesite=Lax`;
        try {
            localStorage.setItem('simplemenu_lang', lang);
        } catch {
            // Storage unavailable; the cookie is enough.
        }
    }

    return (
        <div
            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 ${
                dark ? 'border-stone-700/70 bg-stone-900/70 backdrop-blur' : 'border-stone-200 bg-white'
            }`}
        >
            <Globe2 className="h-4 w-4 text-stone-400" />
            <div className="flex items-center gap-1">
                {languages.map((lang) => (
                    <button
                        key={lang}
                        type="button"
                        onClick={() => {
                            remember(lang);
                            const url = new URL(window.location.href);
                            url.searchParams.set('lang', lang);
                            window.location.href = url.toString();
                        }}
                        className={`rounded px-2 py-1 text-xs font-medium transition ${
                            lang === current
                                ? 'bg-amber-500 text-white'
                                : dark
                                  ? 'text-stone-300 hover:bg-stone-800 hover:text-white'
                                  : 'text-stone-600 hover:bg-stone-100'
                        }`}
                    >
                        {LOCALES[lang]}
                    </button>
                ))}
            </div>
        </div>
    );
}