import { Link } from '@inertiajs/react';
import { UtensilsCrossed } from 'lucide-react';
import LocaleMenu from './LocaleMenu';
import { rememberLocale } from '../../lib/locale';
import { LOCALES } from '../../lib/constants';

export default function LandingFooter({ copy, locale, languages }) {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-stone-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <Link href="/" className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white">
                                <UtensilsCrossed className="h-[18px] w-[18px]" />
                            </span>
                            <span className="text-lg font-bold tracking-tight text-stone-900">SimpleMenu</span>
                        </Link>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone-600">{copy.footer.tagline}</p>
                    </div>

                    <nav aria-label={copy.footer.product}>
                        <h2 className="text-sm font-semibold tracking-wide text-stone-900">{copy.footer.product}</h2>
                        <ul className="mt-4 space-y-2.5">
                            <li>
                                <a href="#features" className="text-sm text-stone-600 transition hover:text-stone-900">
                                    {copy.footer.features}
                                </a>
                            </li>
                            <li>
                                <a href="#how-it-works" className="text-sm text-stone-600 transition hover:text-stone-900">
                                    {copy.footer.how}
                                </a>
                            </li>
                            <li>
                                <a href="#faq" className="text-sm text-stone-600 transition hover:text-stone-900">
                                    {copy.footer.faq}
                                </a>
                            </li>
                        </ul>
                    </nav>

                    <div>
                        <h2 className="text-sm font-semibold tracking-wide text-stone-900">{copy.footer.language}</h2>
                        <ul className="mt-4 space-y-2.5">
                            {languages.map((code) => (
                                <li key={code}>
                                    <a
                                        href={`/?lang=${code}`}
                                        onClick={() => rememberLocale(code)}
                                        className={`text-sm transition hover:text-stone-900 ${
                                            code === locale ? 'font-semibold text-stone-900' : 'text-stone-600'
                                        }`}
                                    >
                                        {LOCALES[code] ?? code}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold tracking-wide text-stone-900">{copy.footer.help}</h2>
                        <div className="mt-4">
                            <LocaleMenu locale={locale} languages={languages} label={copy.footer.language} />
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-stone-200 pt-6 text-center sm:flex-row sm:text-start">
                    <p className="text-xs text-stone-500">
                        © {year} SimpleMenu. {copy.footer.rights}
                    </p>
                </div>
            </div>
        </footer>
    );
}
