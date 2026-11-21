import { Head, router } from '@inertiajs/react';
import { Check, Crown, Minus, CreditCard, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AppShell from '../../components/AppShell';
import FlashMessage from '../../components/FlashMessage';
import { useI18n } from '../../lib/i18n';

function PlanCard({ plan, current, gatewayEnabled }) {
    const { t } = useI18n();
    const [starting, setStarting] = useState(false);
    const isCurrent = plan.slug === current;
    const isFree = plan.price === 0;

    function checkout() {
        setStarting(true);
        router.post('/billing/checkout', { plan: plan.slug }, { onFinish: () => setStarting(false) });
    }

    return (
        <div className={`relative flex h-full flex-col rounded-2xl border bg-white p-6 ${
            plan.slug === 'pro' && !isCurrent
                ? 'border-amber-400 shadow-lg shadow-amber-500/10'
                : 'border-stone-200'
        }`}>
            {plan.slug === 'pro' && !isCurrent && (
                <span className="absolute -top-3 start-6 rounded-full bg-amber-500 px-3 py-0.5 text-xs font-semibold text-white">
                    {t('pricing.most_popular')}
                </span>
            )}

            <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-lg font-bold text-stone-900">{plan.name}</h3>
                {isCurrent && (
                    <span className="rounded-full bg-stone-900 px-2.5 py-0.5 text-xs font-medium text-white">
                        {t('pricing.current_badge')}
                    </span>
                )}
            </div>

            <p className="mt-2 text-2xl font-bold text-stone-900">
                {isFree ? t('pricing.price_free') : t('pricing.per_month', {
                    price: plan.price,
                    currency: plan.currency,
                })}
            </p>

            <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                {plan.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2 text-stone-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" strokeWidth={2.5} />
                        {highlight}
                    </li>
                ))}
            </ul>

            <div className="mt-6">
                {isCurrent ? (
                    <span className="block rounded-lg bg-stone-100 px-4 py-2.5 text-center text-sm font-semibold text-stone-500">
                        {isFree ? t('billing.free_cta') : t('billing.already_pro')}
                    </span>
                ) : isFree ? (
                    <span className="block rounded-lg bg-stone-100 px-4 py-2.5 text-center text-sm font-semibold text-stone-500">
                        {t('billing.change_cta')}
                    </span>
                ) : (
                    <button
                        type="button"
                        onClick={checkout}
                        disabled={starting}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60"
                    >
                        {starting ? <Minus className="h-4 w-4 animate-pulse" /> : gatewayEnabled ? <CreditCard className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
                        {t('billing.upgrade_cta')}
                    </button>
                )}
            </div>
        </div>
    );
}

export default function Billing({ plan, restaurants_used: used, restaurants_limit: limit, items_limit: itemsLimit, subscription, gateway_enabled: gatewayEnabled, plans }) {
    const { t } = useI18n();

    return (
        <AppShell>
            <Head title={t('billing.title')} />
            <FlashMessage />

            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900">{t('billing.heading')}</h1>
                    <p className="mt-1 text-sm text-stone-600">{t('billing.subtitle')}</p>
                </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-stone-200 bg-white p-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{t('billing.current_plan')}</p>
                    <div className="mt-2 flex items-center gap-2">
                        <Crown className={`h-6 w-6 ${plan === 'pro' ? 'text-amber-500' : 'text-stone-400'}`} />
                        <h2 className="text-2xl font-bold text-stone-900">
                            {plans.find((candidate) => candidate.slug === plan)?.name ?? plan}
                        </h2>
                    </div>

                    {subscription !== null ? (
                        <p className="mt-3 text-sm text-stone-600">
                            {subscription.status === 'trialing'
                                ? t('billing.subscription_trial', { date: subscription.trial_ends_at })
                                : t('billing.renew_at', { date: subscription.current_period_end })}
                        </p>
                    ) : (
                        <p className="mt-3 text-sm text-stone-600">{t('billing.no_subscription')}</p>
                    )}

                    <p className="mt-4 text-sm text-stone-600">
                        {plan === 'pro' ? t('billing.branding_off') : t('billing.branding_on')}
                    </p>

                    {subscription && subscription.status !== 'canceled' && (
                        <div className="mt-5 pt-4 border-t border-stone-200">
                            <button
                                type="button"
                                onClick={() => {
                                    if (
                                        !window.confirm(
                                            t('billing.cancel_confirm')
                                        )
                                    )
                                        return;
                                    router.post('/billing/cancel', {}, {
                                        onFinish: () => router.reload(),
                                    });
                                }}
                                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 transition"
                            >
                                <Trash2 className="h-4 w-4" />
                                {t('billing.cancel_subscription')}
                            </button>
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{t('billing.usage')}</p>

                    <dl className="mt-3 space-y-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                            <dt className="text-stone-600">{t('billing.restaurants_label')}</dt>
                            <dd className="font-semibold text-stone-900">
                                {limit === null
                                    ? t('billing.restaurants_no_limit', { count: used })
                                    : t('billing.restaurants', { count: used, limit })}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <dt className="text-stone-600">{t('billing.items_limit')}</dt>
                            <dd className="font-semibold text-stone-900">
                                {itemsLimit === null ? t('billing.unlimited') : itemsLimit}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {plans.map((candidate) => (
                    <PlanCard key={candidate.slug} plan={candidate} current={plan} gatewayEnabled={gatewayEnabled} />
                ))}
            </div>

            <p className="mt-6 text-center text-xs text-stone-500">
                {gatewayEnabled ? t('billing.gateway_note') : t('billing.trial_note', { days: 14 })}
            </p>
        </AppShell>
    );
}
