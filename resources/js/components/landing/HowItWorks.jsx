import { Languages, QrCode, Utensils } from 'lucide-react';
import Cta from './Cta';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

const ICONS = [Utensils, Languages, QrCode];

export default function HowItWorks({ copy, ctaUrl, rtl }) {
    return (
        <section id="how-it-works" className="scroll-mt-24 border-y border-stone-200 bg-white/60 py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading eyebrow={copy.how.eyebrow} title={copy.how.title} subtitle={copy.how.subtitle} />

                <ol className="mt-14 grid gap-6 lg:grid-cols-3">
                    {copy.how.steps.map((step, index) => {
                        const Icon = ICONS[index] ?? Utensils;

                        return (
                            <Reveal as="li" key={step.title} delay={index * 90} className="relative">
                                <div className="h-full rounded-3xl border border-stone-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-stone-900/5">
                                    <div className="flex items-center justify-between">
                                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 text-white">
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <span className="font-serif text-4xl font-semibold text-stone-200">
                                            {index + 1}
                                        </span>
                                    </div>

                                    <h3 className="mt-5 text-xl font-semibold tracking-tight text-stone-900">
                                        {step.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-stone-600">{step.text}</p>
                                </div>

                                {index < copy.how.steps.length - 1 && (
                                    <span
                                        className="absolute -end-3 top-1/2 z-10 hidden -translate-y-1/2 text-stone-300 lg:block rtl:-rotate-180"
                                        aria-hidden="true"
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                )}
                            </Reveal>
                        );
                    })}
                </ol>

                <Reveal className="mt-12 text-center">
                    <Cta href={ctaUrl} rtl={rtl}>
                        {copy.how.cta}
                    </Cta>
                </Reveal>
            </div>
        </section>
    );
}
