import { Globe2, QrCode, Wallet } from 'lucide-react';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

const ICONS = [Globe2, QrCode, Wallet];

export default function FeatureStrip({ copy }) {
    return (
        <section id="features" className="scroll-mt-24 border-y border-stone-200 bg-white/60 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading title={copy.features.title} />

                <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {copy.features.items.map((item, index) => {
                        const Icon = ICONS[index] ?? Globe2;

                        return (
                            <Reveal key={item.title} delay={index * 80}>
                                <article className="group h-full rounded-2xl border border-stone-200 bg-white p-6 transition duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg hover:shadow-stone-900/5">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600 transition group-hover:bg-amber-500 group-hover:text-white">
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <h3 className="mt-4 text-lg font-semibold tracking-tight text-stone-900">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.text}</p>
                                </article>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
