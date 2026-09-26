import { useState } from 'react';
import { Check } from 'lucide-react';
import MenuScreen from './MenuScreen';
import PhoneFrame from './PhoneFrame';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { EXAMPLE_MENU } from '../../lib/exampleMenu';
import { LOCALES } from '../../lib/constants';

export default function LanguageShowcase({ copy, locale }) {
    const [active, setActive] = useState(locale);
    const rtl = active === 'ar';
    const categories = EXAMPLE_MENU.categories.slice(0, 2);

    return (
        <section className="relative isolate overflow-hidden bg-stone-950 py-20 text-stone-100 sm:py-28">
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(251,191,36,0.16),transparent_70%)]"
                aria-hidden="true"
            />

            <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8">
                <div>
                    <SectionHeading
                        eyebrow={copy.languages.eyebrow}
                        title={copy.languages.title}
                        subtitle={copy.languages.subtitle}
                        align="start"
                        invert
                    />

                    <ul className="mt-9 space-y-5">
                        {copy.languages.points.map((point, index) => (
                            <Reveal as="li" key={point.title} delay={index * 80} className="flex gap-3.5">
                                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
                                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                </span>
                                <div>
                                    <h3 className="font-semibold text-white">{point.title}</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-stone-400">{point.text}</p>
                                </div>
                            </Reveal>
                        ))}
                    </ul>
                </div>

                <Reveal delay={100} className="flex flex-col items-center">
                    <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
                        {EXAMPLE_MENU.languages.map((code) => (
                            <button
                                key={code}
                                type="button"
                                onClick={() => setActive(code)}
                                aria-pressed={code === active}
                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                    code === active
                                        ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                                        : 'bg-white/5 text-stone-300 ring-1 ring-white/10 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {LOCALES[code]}
                            </button>
                        ))}
                    </div>

                    <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                        {copy.languages.try}
                    </p>

                    <PhoneFrame>
                        <MenuScreen
                            locale={active}
                            languages={EXAMPLE_MENU.languages}
                            categories={categories}
                            activeCategory={categories[0].id}
                            onLanguageChange={setActive}
                        />
                    </PhoneFrame>

                    <p className="mt-5 max-w-xs text-center text-sm text-stone-500" dir={rtl ? 'rtl' : 'ltr'}>
                        {translatedName(active)} — {translatedCategory(active)}
                    </p>
                </Reveal>
            </div>
        </section>
    );
}

function translatedName(locale) {
    return EXAMPLE_MENU.name[locale] ?? EXAMPLE_MENU.name.en;
}

function translatedCategory(locale) {
    return (EXAMPLE_MENU.categories[0].name[locale] ?? EXAMPLE_MENU.categories[0].name.en) +
        ' · ' +
        (EXAMPLE_MENU.categories[0].items[0].name[locale] ?? EXAMPLE_MENU.categories[0].items[0].name.en);
}
