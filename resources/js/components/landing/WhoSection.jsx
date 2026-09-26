import { Coffee, Martini, Store, UtensilsCrossed } from 'lucide-react';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

const ICONS = [UtensilsCrossed, Coffee, Store, Martini];

export default function WhoSection({ copy }) {
    return (
        <section className="py-20 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading eyebrow={copy.who.eyebrow} title={copy.who.title} subtitle={copy.who.subtitle} />

                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {copy.who.items.map((item, index) => {
                        const Icon = ICONS[index] ?? UtensilsCrossed;

                        return (
                            <Reveal key={item.title} delay={index * 70}>
                                <div className="flex h-full items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-700">
                                        <Icon className="h-[18px] w-[18px]" />
                                    </span>
                                    <div>
                                        <h3 className="font-semibold tracking-tight text-stone-900">{item.title}</h3>
                                        <p className="mt-1 text-sm leading-relaxed text-stone-600">{item.text}</p>
                                    </div>
                                </div>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
