import { Check, Sparkles } from 'lucide-react';
import Cta from './Cta';
import MenuScreen from './MenuScreen';
import PhoneFrame from './PhoneFrame';
import QrTableCard from './QrTableCard';
import Reveal from './Reveal';
import { EXAMPLE_MENU } from '../../lib/exampleMenu';

const CHIPS = {
    en: ['Arabic · English · French', 'Works on any phone', 'Change prices yourself'],
    ar: ['عربية · إنجليزية · فرنسية', 'يعمل على أي جوّال', 'عدّل الأسعار بنفسك'],
    fr: ['Arabe · Anglais · Français', 'Fonctionne sur tout téléphone', 'Modifiez vos prix vous-même'],
};

export default function Hero({ copy, ctaUrl, exampleUrl, locale, rtl }) {
    const chips = CHIPS[locale] ?? CHIPS.en;
    const guestLocale = locale === 'fr' ? 'fr' : 'ar';
    const showUrl = exampleUrl ? exampleUrl.replace(/^https?:\/\//, '') : '';

    return (
        <section className="relative isolate overflow-hidden">
            <div
                className="pointer-events-none absolute inset-x-0 -top-40 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(251,191,36,0.28),transparent_70%)]"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.6),rgba(255,255,255,0))]"
                aria-hidden="true"
            />

            <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10 lg:pb-28 lg:pt-20 xl:gap-16">
                <div>
                    <Reveal>
                        <p className="inline-flex items-center gap-2 rounded-full bg-amber-100/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-800 ring-1 ring-amber-200">
                            <Sparkles className="h-3.5 w-3.5" />
                            {copy.hero.badge}
                        </p>
                    </Reveal>

                    <Reveal delay={60}>
                        <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-balance text-stone-900 sm:text-5xl lg:text-6xl">
                            {renderTitle(copy.hero.title, copy.hero.accent)}
                        </h1>
                    </Reveal>

                    <Reveal delay={120}>
                        <p className="mt-6 max-w-xl text-base leading-relaxed text-pretty text-stone-600 sm:text-lg">
                            {copy.hero.subtitle}
                        </p>
                    </Reveal>

                    <Reveal delay={180}>
                        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Cta href={ctaUrl} rtl={rtl} className="w-full sm:w-auto">
                                {copy.hero.primary}
                            </Cta>
                            <Cta href="#how-it-works" variant="secondary" rtl={rtl} icon={false} className="w-full sm:w-auto">
                                {copy.hero.secondary}
                            </Cta>
                        </div>

                        <p className="mt-4 text-sm text-stone-500">{copy.hero.note}</p>

                        <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
                            {chips.map((chip) => (
                                <li key={chip} className="flex items-center gap-1.5 text-sm text-stone-600">
                                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                        <Check className="h-3 w-3" strokeWidth={3} />
                                    </span>
                                    {chip}
                                </li>
                            ))}
                        </ul>
                    </Reveal>
                </div>

                <Reveal delay={120} className="relative">
                    <div
                        className="pointer-events-none absolute inset-0 -z-10 scale-95 rounded-[3rem] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(245,158,11,0.22),transparent_70%)] blur-2xl"
                        aria-hidden="true"
                    />

                    <div className="relative mx-auto flex w-full max-w-md justify-center lg:max-w-none">
                        <PhoneFrame className="relative z-10">
                            <MenuScreen
                                locale={locale}
                                languages={EXAMPLE_MENU.languages}
                                categories={EXAMPLE_MENU.categories.slice(0, 2)}
                                activeCategory={EXAMPLE_MENU.categories[0].id}
                            />
                        </PhoneFrame>

                        <div className="absolute -bottom-8 start-0 z-20 hidden sm:block lg:-start-6">
                            <QrTableCard
                                value={exampleUrl}
                                name={EXAMPLE_MENU.name.en}
                                caption={copy.qr.scanCaption ?? 'Scan to open the menu'}
                                url={showUrl}
                                className="-rotate-3"
                            />
                        </div>

                        <div className="absolute -end-6 top-24 z-20 hidden lg:block">
                            <div className="relative origin-top scale-[0.82] rotate-3">
                                <PhoneFrame tone="dark">
                                    <MenuScreen
                                        locale={guestLocale}
                                        languages={EXAMPLE_MENU.languages}
                                        categories={EXAMPLE_MENU.categories.slice(1, 2)}
                                        activeCategory={EXAMPLE_MENU.categories[1].id}
                                    />
                                </PhoneFrame>
                                <span className="absolute -bottom-1 start-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-stone-900 px-2.5 py-1 text-[10px] font-semibold text-white shadow-lg rtl:translate-x-1/2">
                                    {copy.languages.try}
                                </span>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

function renderTitle(title, accent) {
    if (!accent || !title.includes(accent)) {
        return title;
    }

    const [before, after] = title.split(accent);

    return (
        <>
            {before}
            <span className="text-amber-600">{accent}</span>
            {after}
        </>
    );
}
