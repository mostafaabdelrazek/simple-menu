import { Crown } from 'lucide-react';
import Cta from './Cta';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

function PlanCard({ plan, ctaUrl, rtl }) {
    return (
        <div className={`relative h-full rounded-2xl border bg-white/90 p-7 text-start backdrop-blur-sm ${
            plan.slug === 'pro'
                ? 'border-amber-400 shadow-lg shadow-amber-500/10'
                : 'border-amber-200/70'
        }`}>
            {plan.badge && (
                <span className="absolute -top-3 start-6 rounded-full bg-amber-500 px-3 py-0.5 text-xs font-semibold text-white">
                    {plan.badge}
                </span>
            )}

            <h3 className="text-lg font-bold tracking-tight text-stone-900">{plan.name}</h3>
            <p className="mt-1.5 text-sm font-semibold text-amber-600">{plan.price}</p>

            <ul className="mt-5 space-y-2.5 text-sm leading-relaxed">
                {plan.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2 text-stone-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
                        {bullet}
                    </li>
                ))}
            </ul>

            <div className="mt-6">
                {plan.slug === 'pro' ? (
                    <a
                        href="/pricing"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
                    >
                        <Crown className="h-4 w-4" />
                        {plan.cta}
                    </a>
                ) : (
                    <Cta href={ctaUrl} rtl={rtl} className="w-full">
                        {plan.cta}
                    </Cta>
                )}
            </div>
        </div>
    );
}

export default function PricingSection({ copy, ctaUrl, rtl }) {
    const cards = [
        { ...copy.pricing.cards.free, slug: 'free' },
        { ...copy.pricing.cards.pro, slug: 'pro' },
    ];

    return (
        <section id="pricing" className="relative isolate overflow-hidden bg-linear-to-b from-amber-50 via-amber-50/40 to-amber-50 py-20 sm:py-28">
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_50%_0%,rgba(245,158,11,0.28),transparent_70%)]"
                aria-hidden="true"
            />

            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
                <SectionHeading eyebrow={copy.pricing.eyebrow} title={copy.pricing.title} subtitle={copy.pricing.subtitle} />

                <div className="mt-12 grid gap-5 sm:grid-cols-2">
                    {cards.map((plan, index) => (
                        <Reveal key={plan.slug} delay={index * 80}>
                            <PlanCard plan={plan} ctaUrl={ctaUrl} rtl={rtl} />
                        </Reveal>
                    ))}
                </div>

                <Reveal className="mt-10">
                    <p className="text-sm text-stone-600">{copy.pricing.footnote}</p>
                </Reveal>
            </div>
        </section>
    );
}
