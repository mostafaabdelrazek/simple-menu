import { Head, useForm } from '@inertiajs/react';
import { ShieldCheck, UtensilsCrossed } from 'lucide-react';
import { COUNTRY_CODES } from '../../lib/constants';
import FlashMessage from '../../components/FlashMessage';
import { useI18n } from '../../lib/i18n';

export default function Phone() {
    const { dir, t } = useI18n();
    const { data, setData, post, processing, errors } = useForm({
        country_code: '+20',
        phone: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/onboarding/phone');
    }

    return (
        <div dir={dir} className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-8">
            <Head title={t('onboarding.phone_title')} />
            <div className="w-full max-w-md">
                <FlashMessage />

                <div className="mb-6 flex flex-col items-center text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white">
                        {<UtensilsCrossed className="h-6 w-6" />}
                    </span>
                    <h1 className="mt-4 text-2xl font-bold text-stone-900">{t('onboarding.phone_heading')}</h1>
                    <p className="mt-1 text-sm text-stone-600">{t('onboarding.phone_hint')}</p>
                </div>

                <form onSubmit={submit} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                    <label htmlFor="country_code" className="mb-1 block text-sm font-medium text-stone-700">
                        {t('onboarding.country_code')}
                    </label>
                    <select
                        id="country_code"
                        value={data.country_code}
                        onChange={(e) => setData('country_code', e.target.value)}
                        className="mb-4 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                        {COUNTRY_CODES.map((country) => (
                            <option key={country.code} value={country.code}>
                                {country.label}
                            </option>
                        ))}
                    </select>

                    <label htmlFor="phone" className="mb-1 block text-sm font-medium text-stone-700">
                        {t('onboarding.phone_number')}
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        placeholder="1XXXXXXXXX"
                        inputMode="numeric"
                        className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                    {errors.country_code && <p className="mt-1 text-xs text-red-600">{errors.country_code}</p>}

                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3 font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
                    >
                        <ShieldCheck className="h-5 w-5" />
                        {t('onboarding.send_code')}
                    </button>
                </form>

                <p className="mt-4 text-center text-xs text-stone-400">{t('onboarding.dev_hint')}</p>
            </div>
        </div>
    );
}