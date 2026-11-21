import { Head, Link, router } from '@inertiajs/react';
import { Check, Crown, UtensilsCrossed } from 'lucide-react';
import { useI18n } from '../lib/i18n';

export default function Pricing({ plans, current_plan: currentPlan, cta_url: ctaUrl }) {
    const { t, dir } = useI18n();

    return (
        <div dir={dir} className="min-h-screen bg-stone-50">
            <Head title={t('pricing.heading')} />

            <header className="border-b border-stone-200 bg-white">
                <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-2 font-semibold text-stone-900">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white">
                            <UtensilsCrossed className="h-5 w-5" />
                        </span>
                        SimpleMenu
                    </Link>
                    <Link href="/" className="text-sm font-medium text-stone-600 hover:text-stone-900">
                        {t('pricing.back_home')}
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 py-14">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                        {t('pricing.heading')}
                    </h1>
                    <p className="mx-auto mt-3 max-w-xl text-stone-600">{t('pricing.subtitle')}</p>
                </div>

                <div className="mt-10 grid gap-6 sm:grid-cols-2">
                    {plans.map((plan) => {
                        const isCurrent = currentPlan !== null && plan.slug === currentPlan;

                        return (
                            <div
                                key={plan.slug}
                                className={`relative flex flex-col rounded-2xl border bg-white p-7 ${
                                    plan.slug === 'pro'
                                        ? 'border-amber-400 shadow-lg shadow-amber-500/10'
                                        : 'border-stone-200'
                                }`}
                            >
                                {plan.slug === 'pro' && (
                                    <span className="absolute -top-3 start-6 rounded-full bg-amber-500 px-3 py-0.5 text-xs font-semibold text-white">
                                        {t('pricing.most_popular')}
                                    </span>
                                )}

                                <h2 className="text-xl font-bold text-stone-900">{plan.name}</h2>

                                <p className="mt-2 text-3xl font-bold text-stone-900">
                                    {plan.price === 0
                                        ? t('pricing.price_free')
                                        : t('pricing.per_month', { price: plan.price, currency: plan.currency })}
                                </p>

                                <ul className="mt-6 flex-1 space-y-3 text-sm">
                                    {plan.highlights.map((highlight) => (
                                        <li key={highlight} className="flex items-start gap-2.5 text-stone-700">
                                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" strokeWidth={2.5} />
                                            {highlight}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-8">
                                    {isCurrent ? (
                                        <span className="block rounded-lg bg-stone-100 px-4 py-2.5 text-center text-sm font-semibold text-stone-500">
                                            {t('pricing.current_badge')}
                                        </span>
                                    ) : ctaUrl ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (plan.slug === 'pro') {
                                                    router.post('/billing/checkout', { plan: plan.slug });
                                                } else {
                                                    window.location.href = ctaUrl;
                                                }
                                            }}
                                            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition ${
                                                plan.slug === 'pro' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-stone-900 hover:bg-stone-800'
                                            }`}
                                        >
                                            {plan.slug === 'pro' && <Crown className="h-4 w-4" />}
                                            {plan.slug === 'pro' ? t('pricing.choose_pro') : t('pricing.choose_free')}
                                        </button>
                                    ) : (
                                        <Link
                                            href="/login"
                                            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition ${
                                                plan.slug === 'pro' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-stone-900 hover:bg-stone-800'
                                            }`}
                                        >
                                            {plan.slug === 'pro' && <Crown className="h-4 w-4" />}
                                            {plan.slug === 'pro' ? t('pricing.choose_pro') : t('pricing.choose_free')}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <p className="mt-8 text-center text-xs text-stone-500">{t('pricing.footnote')}</p>
            </main>
        </div>
    );
}
