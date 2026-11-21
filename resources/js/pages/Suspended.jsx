import { Head, router } from '@inertiajs/react';
import { LogOut, ShieldAlert } from 'lucide-react';
import { useI18n } from '../lib/i18n';

export default function Suspended() {
    const { dir, t } = useI18n();

    return (
        <div dir={dir} className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
            <Head title={t('suspended.heading')} />

            <div className="max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                    <ShieldAlert className="h-7 w-7" />
                </span>

                <h1 className="mt-5 text-xl font-bold text-stone-900">{t('suspended.heading')}</h1>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{t('suspended.text')}</p>

                <button
                    type="button"
                    onClick={() => router.post('/logout')}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
                >
                    <LogOut className="h-4 w-4" />
                    {t('suspended.sign_out')}
                </button>
            </div>
        </div>
    );
}
