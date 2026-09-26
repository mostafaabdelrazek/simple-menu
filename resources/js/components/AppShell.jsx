import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, UtensilsCrossed } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { rememberLocale } from '../lib/locale';

function AppLocaleSwitcher() {
    const { locale, supportedLocales, locales, t } = useI18n();

    function switchTo(code) {
        if (code === locale) return;

        rememberLocale(code);
        router.get(window.location.pathname, { lang: code }, { preserveScroll: true, preserveState: false });
    }

    return (
        <div
            className="inline-flex items-center rounded-md border border-stone-200 bg-white p-0.5"
            role="group"
            aria-label={t('app.language')}
        >
            {supportedLocales.map((code) => (
                <button
                    key={code}
                    type="button"
                    onClick={() => switchTo(code)}
                    lang={code}
                    aria-current={code === locale ? 'true' : undefined}
                    className={`rounded px-2 py-1 text-xs font-semibold transition ${
                        code === locale
                            ? 'bg-amber-500 text-white'
                            : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                >
                    {locales[code] ?? code}
                </button>
            ))}
        </div>
    );
}

export default function AppShell({ children }) {
    const { auth } = usePage().props;
    const { dir, locale, t } = useI18n();
    const user = auth?.user;

    function logout() {
        router.post('/logout');
    }

    return (
        <div dir={dir} lang={locale} className="min-h-screen">
            <header className="border-b border-stone-200 bg-white">
                <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
                    <Link href="/" className="flex items-center gap-2 font-semibold text-stone-900">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white">
                            <UtensilsCrossed className="h-5 w-5" />
                        </span>
                        {t('app.brand')}
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <AppLocaleSwitcher />

                        {user?.avatar ? (
                            <img src={user.avatar} alt="" className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
                        ) : (
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-200 text-sm font-semibold text-stone-700">
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </span>
                        )}
                        <span className="hidden max-w-[10rem] truncate text-sm text-stone-600 sm:block">
                            {user?.name}
                        </span>
                        <button
                            type="button"
                            onClick={logout}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">{t('app.sign_out')}</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        </div>
    );
}
