import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { Menu as MenuIcon, UtensilsCrossed, X } from 'lucide-react';
import Cta from './Cta';
import LocaleMenu from './LocaleMenu';

export default function LandingNav({ copy, ctaUrl, locale, languages, rtl }) {
    const [open, setOpen] = useState(false);

    const links = [
        { href: '#how-it-works', label: copy.nav.how },
        { href: '#features', label: copy.nav.features },
        { href: '#faq', label: copy.nav.faq },
    ];

    useEffect(() => {
        function onKeyDown(event) {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        }

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    return (
        <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/85 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex shrink-0 items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-500/30">
                        <UtensilsCrossed className="h-[18px] w-[18px]" />
                    </span>
                    <span className="text-lg font-bold tracking-tight text-stone-900">SimpleMenu</span>
                </Link>

                <nav className="ms-auto hidden items-center gap-1 md:flex" aria-label="Main">
                    {links.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="ms-auto flex items-center gap-2 md:ms-0">
                    <LocaleMenu locale={locale} languages={languages} label={copy.nav.language} className="hidden sm:block" />
                    <Cta href={ctaUrl} size="md" rtl={rtl} className="hidden sm:inline-flex">
                        {copy.nav.cta}
                    </Cta>

                    <button
                        type="button"
                        onClick={() => setOpen((value) => !value)}
                        aria-expanded={open}
                        aria-controls="mobile-nav"
                        aria-label={copy.nav.menu}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-stone-700 transition hover:bg-stone-100 md:hidden"
                    >
                        {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            <div id="mobile-nav" hidden={!open} className="border-t border-stone-200 bg-white px-4 pb-5 pt-3 md:hidden">
                <nav className="flex flex-col" aria-label="Mobile">
                    {links.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="mt-3 flex items-center gap-2 border-t border-stone-100 pt-4 sm:hidden">
                    <Cta href={ctaUrl} size="md" rtl={rtl} className="flex-1">
                        {copy.nav.cta}
                    </Cta>
                    <LocaleMenu locale={locale} languages={languages} label={copy.nav.language} />
                </div>
            </div>
        </header>
    );
}
