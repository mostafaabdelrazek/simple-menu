import { QrCode as QrIcon, Smartphone } from 'lucide-react';
import QrTableCard from './QrTableCard';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { EXAMPLE_MENU } from '../../lib/exampleMenu';

export default function QrSection({ copy, exampleUrl }) {
    const showUrl = exampleUrl ? exampleUrl.replace(/^https?:\/\//, '') : '';

    return (
        <section className="bg-stone-50 py-20 sm:py-28">
            <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-10 lg:px-8">
                <div>
                    <SectionHeading
                        eyebrow={copy.qr.eyebrow}
                        title={copy.qr.title}
                        subtitle={copy.qr.subtitle}
                        align="start"
                    />

                    <div className="mt-9 space-y-4">
                        {copy.qr.steps.map((step, index) => (
                            <Reveal key={step.title} delay={index * 70} className="flex gap-4">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-xs font-bold text-white">
                                    {index + 1}
                                </span>
                                <div>
                                    <h3 className="font-semibold text-stone-900">{step.title}</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-stone-600">{step.text}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>

                <Reveal delay={90}>
                    <div className="relative mx-auto flex w-full max-w-md flex-col items-center">
                        <div
                            className="pointer-events-none absolute inset-0 -z-10 scale-90 rounded-[2.5rem] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(245,158,11,0.25),transparent_70%)] blur-xl"
                            aria-hidden="true"
                        />

                        <div className="relative w-full overflow-hidden rounded-3xl bg-stone-900 p-6 shadow-2xl shadow-stone-900/20 sm:p-8">
                            <div
                                className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_0%,rgba(251,191,36,0.2),transparent_70%)]"
                                aria-hidden="true"
                            />

                            <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-end sm:justify-center">
                                <QrTableCard
                                    value={exampleUrl}
                                    name={EXAMPLE_MENU.name.en}
                                    caption={copy.qr.scanCaption}
                                    url={showUrl}
                                    className="-rotate-2"
                                />

                                <div className="flex flex-col items-center gap-2 text-center sm:-ms-6 sm:mb-4 sm:text-start">
                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber-300">
                                        <QrIcon className="h-3.5 w-3.5" />
                                        {copy.qr.dynamic}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber-300">
                                        <Smartphone className="h-3.5 w-3.5" />
                                        {copy.qr.noApp}
                                    </span>
                                </div>
                            </div>

                            <p className="relative mt-6 border-t border-white/10 pt-4 text-center text-xs text-stone-400">
                                {copy.qr.scanned}
                            </p>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
