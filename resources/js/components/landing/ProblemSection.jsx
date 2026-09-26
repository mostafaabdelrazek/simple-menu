import { X } from 'lucide-react';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

export default function ProblemSection({ copy }) {
    return (
        <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading eyebrow={copy.problem.eyebrow} title={copy.problem.title} />

                <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {copy.problem.items.map((item, index) => (
                        <Reveal key={item.title} delay={index * 60}>
                            <article className="h-full rounded-2xl border border-stone-200 bg-white p-5">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-stone-400">
                                    <X className="h-4 w-4" strokeWidth={2.5} />
                                </span>
                                <h3 className="mt-3 font-semibold tracking-tight text-stone-900">{item.title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{item.text}</p>
                            </article>
                        </Reveal>
                    ))}
                </div>

                <Reveal delay={80}>
                    <div className="relative mt-10 overflow-hidden rounded-3xl bg-stone-900 px-6 py-10 text-center sm:px-12">
                        <div
                            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(251,191,36,0.22),transparent_70%)]"
                            aria-hidden="true"
                        />
                        <div className="relative">
                            <h3 className="text-2xl font-bold tracking-tight text-balance text-white sm:text-3xl">
                                {copy.problem.solutionTitle}
                            </h3>
                            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-pretty text-stone-300">
                                {copy.problem.solutionText}
                            </p>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
