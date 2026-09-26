import { Plus } from 'lucide-react';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

export default function Faq({ copy }) {
    return (
        <section id="faq" className="scroll-mt-24 bg-stone-50 py-20 sm:py-28">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <SectionHeading eyebrow={copy.faq.eyebrow} title={copy.faq.title} />

                <div className="mt-12 space-y-3">
                    {copy.faq.items.map((item, index) => (
                        <Reveal key={item.q} delay={index * 50}>
                            <details className="group rounded-2xl border border-stone-200 bg-white px-5 transition open:border-amber-300 open:shadow-md open:shadow-stone-900/5">
                                <summary className="flex cursor-pointer list-none items-center gap-4 py-4 text-start font-medium text-stone-900 marker:hidden [&::-webkit-details-marker]:hidden">
                                    <span className="flex-1">{item.q}</span>
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition group-open:rotate-45 group-open:bg-amber-500 group-open:text-white">
                                        <Plus className="h-4 w-4" />
                                    </span>
                                </summary>
                                <p className="pb-5 text-sm leading-relaxed text-stone-600">{item.a}</p>
                            </details>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
