import { Check } from 'lucide-react';
import Cta from './Cta';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

export default function FreeSection({ copy, ctaUrl, rtl }) {
    return (
        <section className="relative isolate overflow-hidden bg-linear-to-b from-amber-50 via-amber-50/40 to-amber-50 py-20 sm:py-28">
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_50%_0%,rgba(245,158,11,0.28),transparent_70%)]"
                aria-hidden="true"
            />

            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
                <SectionHeading eyebrow={copy.free.eyebrow} title={copy.free.title} subtitle={copy.free.subtitle} />

                <div className="mt-12 grid gap-4 text-start sm:grid-cols-3">
                    {copy.free.points.map((point, index) => (
                        <Reveal key={point.title} delay={index * 80}>
                            <div className="h-full rounded-2xl border border-amber-200/70 bg-white/80 p-6 backdrop-blur-sm">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white">
                                    <Check className="h-4.5 w-4.5" strokeWidth={3} />
                                </span>
                                <h3 className="mt-4 font-semibold tracking-tight text-stone-900">{point.title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{point.text}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>

                <Reveal className="mt-12">
                    <div className="mx-auto flex max-w-xl flex-col items-center gap-3 sm:flex-row sm:justify-center">
                        <Cta href={ctaUrl} rtl={rtl} className="w-full sm:w-auto">
                            {copy.free.cta}
                        </Cta>
                        <a
                            href="#faq"
                            className="text-sm font-semibold text-stone-700 underline decoration-stone-300 underline-offset-4 transition hover:text-stone-900 hover:decoration-stone-500"
                        >
                            {copy.free.secondary}
                        </a>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
