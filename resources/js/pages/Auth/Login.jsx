import { Head, Link, router, usePage } from '@inertiajs/react';
import GoogleIcon from '../../components/GoogleIcon';
import FlashMessage from '../../components/FlashMessage';
import { UtensilsCrossed, ArrowLeft, User as UserIcon } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { useState } from 'react';

export default function Login() {
    const { auth, demo_login_available, demo_users } = usePage().props;
    const { dir, t } = useI18n();
    const [selectedUser, setSelectedUser] = useState('');

    if (auth?.user) {
        return (
            <div dir={dir} className="flex min-h-screen items-center justify-center px-4">
                <FlashMessage />
                <div className="text-center">
                    <p className="mb-4 text-stone-600">
                        {t('auth.already_signed_in', { name: auth.user.name })}
                    </p>
                    <Link href="/dashboard" className="font-medium text-amber-600 hover:underline">
                        {t('auth.go_to_dashboard')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div dir={dir} className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
            <Head title={t('auth.title')} />
            <FlashMessage />

            <div className="w-full max-w-sm">
                <div className="mb-8 flex flex-col items-center text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white">
                        <UtensilsCrossed className="h-6 w-6" />
                    </span>
                    <h1 className="mt-4 text-2xl font-bold text-stone-900">{t('app.brand')}</h1>
                    <p className="mt-1 text-sm text-stone-600">{t('auth.subtitle')}</p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                    <a
                        href="/auth/google"
                        className="flex w-full items-center justify-center gap-3 rounded-lg bg-stone-900 px-4 py-3 font-medium text-white hover:bg-stone-800"
                    >
                        <GoogleIcon className="h-5 w-5" />
                        {t('auth.continue_google')}
                    </a>

                    <p className="mt-3 text-center text-xs text-stone-500">
                        {t('auth.google_hint')}
                    </p>

                    {demo_login_available && demo_users?.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-stone-200">
                            <label className="block text-xs font-semibold text-stone-500 mb-2 flex items-center gap-2">
                                <UserIcon className="h-3.5 w-3.5" />
                                {t('auth.login_as')}
                            </label>
                            <select
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            >
                                <option value="">{t('auth.select_user')}</option>
                                {demo_users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} — {user.email}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!selectedUser) return;
                                    router.post('/demo-login', { user_id: selectedUser });
                                }}
                                disabled={!selectedUser}
                                className={`mt-3 flex w-full items-center justify-center rounded-lg border border-dashed border-amber-400 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {t('auth.login_as_demo')}
                            </button>
                        </div>
                    )}

                    {demo_login_available && demo_users?.length === 0 && (
                        <button
                            type="button"
                            onClick={() => router.post('/demo-login')}
                            className="mt-3 flex w-full items-center justify-center rounded-lg border border-dashed border-amber-400 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100"
                        >
                            {t('auth.dev_login')}
                        </button>
                    )}
                </div>

                <Link href="/" className="mt-6 flex items-center justify-center gap-1 text-sm text-stone-500 hover:text-stone-800">
                    <ArrowLeft className="h-4 w-4" />
                    {t('auth.back_home')}
                </Link>
            </div>
        </div>
    );
}
