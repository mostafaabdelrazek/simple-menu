import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import MenuBrowser from './MenuBrowser';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { EXAMPLE_MENU } from '../../lib/exampleMenu';

export default function ExampleMenu({ copy, exampleUrl, locale, rtl }) {
    const [language, setLanguage] = useState(locale);
    const [category, setCategory] = useState(0);

    return (
        <section className="relative isolate overflow-hidden bg-stone-950 py-20 text-stone-100 sm:py-28">
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_100%,rgba(251,191,36,0.14),transparent_70%)]"
                aria-hidden="true"
            />

            <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow={copy.example.eyebrow}
                    title={copy.example.title}
                    subtitle={copy.example.subtitle}
                    invert
                />

                <Reveal className="mt-14">
                    <MenuBrowser
                        locale={language}
                        languages={EXAMPLE_MENU.languages}
                        url={exampleUrl}
                        active={category}
                        onLanguageChange={setLanguage}
                        onCategoryChange={setCategory}
                    />
                </Reveal>

                <Reveal className="mt-8 text-center">
                    <p className="mx-auto max-w-2xl text-sm leading-relaxed text-stone-400">
                        {copy.example.disclaimer}
                    </p>

                    {exampleUrl && (
                        <a
                            href={exampleUrl}
                            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300 transition hover:text-amber-200"
                        >
                            {copy.example.link}
                            <ArrowUpRight className={`h-4 w-4 ${rtl ? 'rotate-[-90deg]' : ''}`} />
                        </a>
                    )}
                </Reveal>
            </div>
        </section>
    );
}
