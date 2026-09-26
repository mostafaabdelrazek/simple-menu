import { Head } from '@inertiajs/react';
import ExampleMenu from '../components/landing/ExampleMenu';
import Faq from '../components/landing/Faq';
import FeatureStrip from '../components/landing/FeatureStrip';
import FinalCta from '../components/landing/FinalCta';
import FreeSection from '../components/landing/FreeSection';
import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';
import LanguageShowcase from '../components/landing/LanguageShowcase';
import LandingFooter from '../components/landing/LandingFooter';
import LandingNav from '../components/landing/LandingNav';
import ProblemSection from '../components/landing/ProblemSection';
import QrSection from '../components/landing/QrSection';
import WhoSection from '../components/landing/WhoSection';
import { landingCopy } from '../lib/landingCopy';
import { LOCALES } from '../lib/constants';

export default function Home({ locale = 'en', cta_url: ctaUrl, languages, example_menu_url: exampleUrl }) {
    const active = languages?.length ? languages : ['ar', 'en', 'fr'];
    const resolved = LOCALES[locale] ? locale : 'en';
    const copy = landingCopy(resolved);
    const rtl = resolved === 'ar';
    const url = exampleUrl ?? window.location.origin;

    return (
        <div dir={rtl ? 'rtl' : 'ltr'} className="bg-stone-50 font-sans text-stone-900 antialiased">
            <Head>
                <title>{copy.meta.title}</title>
                <meta name="description" content={copy.meta.description} />
                <link rel="canonical" href={window.location.origin} />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="SimpleMenu" />
                <meta property="og:title" content={copy.meta.title} />
                <meta property="og:description" content={copy.meta.description} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={copy.meta.title} />
                <meta name="twitter:description" content={copy.meta.description} />
                <meta name="theme-color" content="#fafaf9" />
            </Head>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'WebApplication',
                        name: 'SimpleMenu',
                        url: window.location.origin,
                        applicationCategory: 'BusinessApplication',
                        operatingSystem: 'Any',
                        description: copy.meta.description,
                        inLanguage: active,
                        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                    }),
                }}
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: copy.faq.items.map((item) => ({
                            '@type': 'Question',
                            name: item.q,
                            acceptedAnswer: { '@type': 'Answer', text: item.a },
                        })),
                    }),
                }}
            />

            <LandingNav copy={copy} ctaUrl={ctaUrl} locale={resolved} languages={active} rtl={rtl} />

            <main>
                <Hero copy={copy} ctaUrl={ctaUrl} exampleUrl={exampleUrl} locale={resolved} rtl={rtl} />
                <FeatureStrip copy={copy} />
                <ProblemSection copy={copy} />
                <HowItWorks copy={copy} ctaUrl={ctaUrl} rtl={rtl} />
                <LanguageShowcase copy={copy} locale={resolved} />
                <QrSection copy={copy} exampleUrl={exampleUrl} />
                <FreeSection copy={copy} ctaUrl={ctaUrl} rtl={rtl} />
                <WhoSection copy={copy} />
                <ExampleMenu copy={copy} exampleUrl={exampleUrl} locale={resolved} rtl={rtl} />
                <Faq copy={copy} />
                <FinalCta copy={copy} ctaUrl={ctaUrl} rtl={rtl} />
            </main>

            <LandingFooter copy={copy} locale={resolved} languages={active} />
        </div>
    );
}
