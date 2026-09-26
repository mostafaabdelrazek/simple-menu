import Cta from './Cta';
import Reveal from './Reveal';
import { EXAMPLE_MENU } from '../../lib/exampleMenu';

export default function FinalCta({ copy, ctaUrl, rtl }) {
    return (
        <section className="relative isolate overflow-hidden bg-stone-950 py-20 text-stone-100 sm:py-28">
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(251,191,36,0.22),transparent_65%)]"
                aria-hidden="true"
            />

            <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
                <Reveal>
                    <h2 className="text-3xl font-bold leading-tight tracking-tight text-balance text-white sm:text-5xl">
                        {copy.final.title}
                    </h2>
                </Reveal>

                <Reveal delay={80}>
                    <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-pretty text-stone-400">
                        {copy.final.subtitle}
                    </p>
                </Reveal>

                <Reveal delay={140}>
                    <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                        <Cta href={ctaUrl} variant="light" size="lg" rtl={rtl} className="w-full sm:w-auto">
                            {copy.final.cta}
                        </Cta>
                        <a
                            href="#how-it-works"
                            className="text-sm font-semibold text-stone-400 underline decoration-stone-700 underline-offset-4 transition hover:text-white hover:decoration-stone-400"
                        >
                            {copy.final.secondary}
                        </a>
                    </div>
                </Reveal>

                <Reveal delay={200}>
                    <p className="mt-7 text-sm text-stone-500">{copy.final.note}</p>
                </Reveal>
            </div>
        </section>
    );
}
