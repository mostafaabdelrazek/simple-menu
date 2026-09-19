import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    ChevronDown,
    Globe2,
    ListPlus,
    Loader2,
    LocateFixed,
    MapPin,
    Plus,
    Sparkles,
    Trash2,
    UtensilsCrossed,
} from 'lucide-react';
import { CURRENCIES, LOCALES } from '../../lib/constants';
import AppShell from '../../components/AppShell';
import FlashMessage from '../../components/FlashMessage';
import ImageInput from '../../components/ImageInput';
import SocialIcon from '../../components/SocialIcon';

const DEFAULT_SOCIALS = [
    { name: 'facebook', url: '', icon: 'facebook' },
    { name: 'tiktok', url: '', icon: 'tiktok' },
    { name: 'instagram', url: '', icon: 'instagram' },
];

const STEPS = ['Restaurant', 'Menu', 'Categories', 'Items', 'Generate'];

function syncTranslations(locales, existing = {}) {
    const next = {};

    for (const locale of locales) {
        next[locale] = { name: '', description: '', ...(existing[locale] ?? {}) };
    }

    return next;
}

function emptyItem(locales) {
    return {
        translations: Object.fromEntries(locales.map((locale) => [locale, { name: '', description: '' }])),
        price: '',
        discount_price: '',
        image: null,
    };
}

function inferIcon(name, url) {
    const haystack = `${name} ${url}`.toLowerCase();

    if (haystack.includes('whatsapp')) return 'whatsapp';
    if (haystack.includes('tiktok')) return 'tiktok';
    if (haystack.includes('instagram')) return 'instagram';
    if (haystack.includes('facebook') || haystack.includes('fb.')) return 'facebook';
    if (haystack.includes('x.com') || haystack.includes('twitter')) return 'x';
    if (haystack.includes('maps')) return 'globe';

    return 'link';
}

export default function Wizard({
    supported_locales: supportedLocales,
    default_social_links: defaultSocialLinks,
    is_editing = false,
    restaurant_slug = null,
    existing = null,
}) {
    const [step, setStep] = useState(0);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const [restaurant, setRestaurant] = useState(
        existing?.restaurant
            ?? {
                  languages: ['en'],
                  translations: { en: { name: '', description: '' } },
                  social_links: (defaultSocialLinks ?? DEFAULT_SOCIALS).map((s) => ({ ...s })),
                  latitude: '',
                  longitude: '',
                  maps_url: '',
                  address: '',
                  banner: null,
                  logo: null,
              }
    );

    const [menu, setMenu] = useState(
        existing?.menu
            ?? {
                  name: '',
                  currency: 'EGP',
                  languages: ['en'],
              }
    );

    const [categories, setCategories] = useState(
        existing?.categories?.length
            ? existing.categories
            : [{ translations: { en: { name: '' } }, items: [emptyItem(['en'])] }]
    );

    const [expandedCategory, setExpandedCategory] = useState(0);

    function setRestaurantLanguages(locales) {
        setRestaurant((prev) => ({
            ...prev,
            languages: locales,
            translations: syncTranslations(locales, prev.translations),
        }));
        setMenu((prev) => ({
            ...prev,
            languages: prev.languages.filter((l) => locales.includes(l)),
        }));
    }

    function setMenuLanguages(locales) {
        const next = restaurant.languages.filter((l) => locales.includes(l));
        if (next.length === 0) return;

        setMenu((prev) => ({ ...prev, languages: next }));

        setCategories((prev) =>
            prev.map((category) => ({
                ...category,
                translations: syncTranslations(next, category.translations),
                items: category.items.map((item) => ({
                    ...item,
                    translations: syncTranslations(next, item.translations),
                })),
            }))
        );
    }

    function updateRestaurantTranslation(locale, field, value) {
        setRestaurant((prev) => ({
            ...prev,
            translations: {
                ...prev.translations,
                [locale]: { ...prev.translations[locale], [field]: value },
            },
        }));
    }

    function updateSocialLink(index, field, value) {
        setRestaurant((prev) => {
            const social_links = prev.social_links.map((link, i) => (i === index ? { ...link, [field]: value } : link));

            return { ...prev, social_links };
        });
    }

    function addCustomLink() {
        setRestaurant((prev) => ({
            ...prev,
            social_links: [
                ...prev.social_links,
                { name: '', url: '', icon: 'link' },
            ],
        }));
    }

    function removeSocialLink(index) {
        setRestaurant((prev) => ({
            ...prev,
            social_links: prev.social_links.filter((_, i) => i !== index),
        }));
    }

    function addCategory() {
        setCategories((prev) => [...prev, { translations: syncTranslations(menu.languages), items: [] }]);
        setExpandedCategory(categories.length);
    }

    function updateCategory(index, field, value) {
        setCategories((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
    }

    function updateCategoryTranslation(index, locale, field, value) {
        setCategories((prev) =>
            prev.map((c, i) =>
                i === index
                    ? { ...c, translations: { ...c.translations, [locale]: { ...c.translations[locale], [field]: value } } }
                    : c
            )
        );
    }

    function addItem(categoryIndex) {
        setCategories((prev) =>
            prev.map((c, i) => (i === categoryIndex ? { ...c, items: [...c.items, emptyItem(menu.languages)] } : c))
        );
    }

    function updateItem(categoryIndex, itemIndex, field, value) {
        setCategories((prev) =>
            prev.map((c, i) =>
                i === categoryIndex
                    ? { ...c, items: c.items.map((item, j) => (j === itemIndex ? { ...item, [field]: value } : item)) }
                    : c
            )
        );
    }

    function updateItemTranslation(categoryIndex, itemIndex, locale, field, value) {
        setCategories((prev) =>
            prev.map((c, i) =>
                i === categoryIndex
                    ? {
                          ...c,
                          items: c.items.map((item, j) =>
                              j === itemIndex
                                  ? {
                                        ...item,
                                        translations: {
                                            ...item.translations,
                                            [locale]: { ...item.translations[locale], [field]: value },
                                        },
                                    }
                                  : item
                          ),
                      }
                    : c
            )
        );
    }

    function removeItem(categoryIndex, itemIndex) {
        setCategories((prev) =>
            prev.map((c, i) =>
                i === categoryIndex ? { ...c, items: c.items.filter((_, j) => j !== itemIndex) } : c
            )
        );
    }

    function removeCategory(index) {
        setCategories((prev) => prev.filter((_, i) => i !== index));
        setExpandedCategory((prev) => Math.max(0, prev - 1));
    }

    function validateStep(current) {
        const next = {};

        if (current === 0) {
            if (restaurant.languages.length === 0) next.languages = 'Select at least one language.';
            for (const locale of restaurant.languages) {
                if (!restaurant.translations[locale]?.name.trim()) {
                    next[`name_${locale}`] = `Please set the restaurant name in ${LOCALES[locale]}.`;
                }
            }
        }

        if (current === 1) {
            if (menu.languages.length === 0) next.menu_languages = 'Select at least one language for the menu.';
            if (!menu.currency) next.currency = 'Select a currency.';
        }

        if (current === 2) {
            if (categories.length === 0) next.categories = 'Add at least one category.';
            categories.forEach((category, i) => {
                for (const locale of menu.languages) {
                    if (!category.translations[locale]?.name.trim()) {
                        next[`cat_${i}_${locale}`] = `Category name required in ${LOCALES[locale]}.`;
                    }
                }
            });
        }

        if (current === 3) {
            const itemsMissing = categories.some(
                (c) => c.items.length === 0
            );
            if (itemsMissing) {
                next.items = 'Tip: every category should contain at least one item.';
            }
        }

        setErrors(next);

        return Object.keys(next).length === 0;
    }

    function goNext() {
        if (!validateStep(step)) return;
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }

    function goBack() {
        setStep((s) => Math.max(s - 1, 0));
    }

    function detectLocation() {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const latitude = String(pos.coords.latitude);
                const longitude = String(pos.coords.longitude);

                setRestaurant((prev) => ({
                    ...prev,
                    latitude,
                    longitude,
                    maps_url: `https://www.google.com/maps?q=${latitude},${longitude}`,
                }));
            },
            () => {
                // The user denied access; they can paste a Google Maps link instead.
            }
        );
    }

    function submit() {
        const social_links = restaurant.social_links
            .filter((link) => link.url.trim() !== '' && link.name.trim() !== '')
            .map((link) => ({
                name: link.name.trim(),
                url: link.url.trim(),
                icon: inferIcon(link.name, link.url),
            }));

        const payload = {
            restaurant: {
                languages: restaurant.languages,
                translations: restaurant.translations,
                social_links,
                latitude: restaurant.latitude !== '' ? Number(restaurant.latitude) : null,
                longitude: restaurant.longitude !== '' ? Number(restaurant.longitude) : null,
                maps_url: restaurant.maps_url?.trim() || null,
                address: restaurant.address || null,
                banner: restaurant.banner?.path ?? null,
                logo: restaurant.logo?.path ?? null,
            },
            menu: {
                name: menu.name || null,
                currency: menu.currency,
                languages: menu.languages,
            },
            categories: categories.map((category) => ({
                translations: category.translations,
                items: category.items.map((item) => ({
                    price: Number(item.price),
                    discount_price: item.discount_price !== '' ? Number(item.discount_price) : null,
                    image: item.image?.path ?? null,
                    translations: item.translations,
                })),
            })),
        };

        setSubmitting(true);

        const url = is_editing ? `/restaurants/${restaurant_slug}` : '/restaurants';
        const options = {
            onError: (errs) => {
                setErrors(errs);
                setSubmitting(false);
            },
            onFinish: () => {
                // Redirect on success is handled by the server response.
            },
        };

        if (is_editing) {
            router.put(url, payload, options);
        } else {
            router.post(url, payload, options);
        }
    }

    const toward_end = step === STEPS.length - 1;

    return (
        <AppShell>
            <Head title={is_editing ? 'Edit your menu' : 'Create your restaurant'} />
            <FlashMessage />

            <div className="mx-auto max-w-3xl">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-stone-900">
                        {is_editing ? 'Edit your menu' : 'Create your menu'}
                    </h1>
                </div>

                {/* Stepper */}
                <ol className="mb-8 flex items-center gap-2 overflow-x-auto pb-1">
                    {STEPS.map((label, i) => (
                        <li key={label} className="flex shrink-0 items-center gap-2">
                            <button
                                type="button"
                                onClick={() => i < step && setStep(i)}
                                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                                    i === step
                                        ? 'bg-amber-500 text-white'
                                        : i < step
                                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                          : 'bg-stone-100 text-stone-400'
                                }`}
                            >
                                {i < step ? <Check className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
                                <span className="hidden sm:inline">{label}</span>
                            </button>
                            {i < STEPS.length - 1 && <span className="h-px w-4 bg-stone-200" />}
                        </li>
                    ))}
                </ol>

                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                    {step === 0 && (
                        <section className="space-y-6">
                            <div>
                                <h2 className="flex items-center gap-2 font-semibold text-stone-900">
                                    <Globe2 className="h-5 w-5 text-amber-500" />
                                    Supported languages
                                </h2>
                                <p className="mt-1 text-sm text-stone-600">
                                    Customers can switch between these languages on your public pages.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {supportedLocales.map((locale) => {
                                        const active = restaurant.languages.includes(locale);

                                        return (
                                            <button
                                                key={locale}
                                                type="button"
                                                onClick={() =>
                                                    setRestaurantLanguages(
                                                        active
                                                            ? restaurant.languages.filter((l) => l !== locale)
                                                            : [...restaurant.languages, locale]
                                                    )
                                                }
                                                className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                                                    active
                                                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                        : 'border-stone-300 text-stone-600 hover:border-stone-400'
                                                }`}
                                            >
                                                {LOCALES[locale]}
                                            </button>
                                        );
                                    })}
                                </div>
                                {(errors.languages || errors.name_en) && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.languages ?? errors.name_en}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {restaurant.languages.map((locale) => (
                                    <fieldset key={locale}>
                                        <legend className="mb-1 text-sm font-medium text-stone-700">
                                            Name · {LOCALES[locale]}
                                        </legend>
                                        <input
                                            type="text"
                                            value={restaurant.translations[locale]?.name ?? ''}
                                            onChange={(e) => updateRestaurantTranslation(locale, 'name', e.target.value)}
                                            placeholder={locale === 'en' ? 'Golden Fork Restaurant' : locale === 'ar' ? 'مطعم الشوكة الذهبية' : 'Restaurant La Fourchette Dorée'}
                                            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                        />
                                        {(errors[`name_${locale}`] || errors.name_en) && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors[`name_${locale}`] ?? errors.name_en}
                                            </p>
                                        )}
                                    </fieldset>
                                ))}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {restaurant.languages.map((locale) => (
                                    <fieldset key={locale}>
                                        <legend className="mb-1 text-sm font-medium text-stone-700">
                                            Description (optional) · {LOCALES[locale]}
                                        </legend>
                                        <textarea
                                            rows={3}
                                            value={restaurant.translations[locale]?.description ?? ''}
                                            onChange={(e) => updateRestaurantTranslation(locale, 'description', e.target.value)}
                                            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                        />
                                    </fieldset>
                                ))}
                            </div>

                            <div>
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                                    <MapPin className="h-4 w-4 text-amber-500" />
                                    Main branch location
                                </h3>
                                <div className="mt-3 grid gap-3">
                                    <div>
                                        <input
                                            type="text"
                                            value={restaurant.address}
                                            onChange={(e) => setRestaurant({ ...restaurant, address: e.target.value })}
                                            placeholder="Street address (optional)"
                                            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <input
                                                type="url"
                                                value={restaurant.maps_url}
                                                onChange={(e) => setRestaurant({ ...restaurant, maps_url: e.target.value })}
                                                placeholder="https://maps.google.com/?q=... (optional)"
                                                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                            />
                                            <p className="mt-1 text-xs text-stone-500">
                                                Paste a Google Maps link from &quot;Share &gt; Copy link&quot;.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={detectLocation}
                                            className="inline-flex items-center justify-center gap-1 self-start rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-600 hover:bg-stone-50"
                                        >
                                            <LocateFixed className="h-4 w-4" />
                                            Use my location
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <h3 className="mb-2 text-sm font-semibold text-stone-900">Logo</h3>
                                    <ImageInput value={restaurant.logo} onChange={(v) => setRestaurant({ ...restaurant, logo: v })} label="Upload logo" />
                                </div>
                                <div>
                                    <h3 className="mb-2 text-sm font-semibold text-stone-900">Banner</h3>
                                    <ImageInput value={restaurant.banner} onChange={(v) => setRestaurant({ ...restaurant, banner: v })} folder="restaurants" label="Upload banner" />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-stone-900">Social media</h3>
                                <p className="mt-1 text-sm text-stone-600">
                                    Add links to your pages — leave fields empty to skip. Empty fields are ignored.
                                </p>
                                <div className="mt-3 space-y-3">
                                    {restaurant.social_links.map((link, i) => (
                                        <div key={i} className="flex items-center gap-2 rounded-lg border border-stone-200 p-2">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                                                <SocialIcon name={link.icon || link.name} className="h-4 w-4" />
                                            </span>
                                            <input
                                                type="text"
                                                value={link.name}
                                                onChange={(e) => updateSocialLink(i, 'name', e.target.value)}
                                                placeholder="Link name"
                                                className="w-28 rounded-md border border-stone-300 px-2 py-2 text-sm focus:border-amber-500 focus:outline-none"
                                                readOnly={i < 3}
                                            />
                                            <input
                                                type="url"
                                                value={link.url}
                                                onChange={(e) => updateSocialLink(i, 'url', e.target.value)}
                                                placeholder="https://..."
                                                className="min-w-0 flex-1 rounded-md border border-stone-300 px-2 py-2 text-sm focus:border-amber-500 focus:outline-none"
                                            />
                                            {i >= 3 && (
                                                <button type="button" onClick={() => removeSocialLink(i)} className="rounded-md p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={addCustomLink}
                                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add custom link
                                </button>
                            </div>
                        </section>
                    )}

                    {step === 1 && (
                        <section className="space-y-6">
                            <div>
                                <h2 className="flex items-center gap-2 font-semibold text-stone-900">
                                    <UtensilsCrossed className="h-5 w-5 text-amber-500" />
                                    Menu setup
                                </h2>
                                <p className="mt-1 text-sm text-stone-600">
                                    Choose the menu currency and the languages that will appear on the menu.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="currency" className="mb-1 block text-sm font-medium text-stone-700">
                                        Currency *
                                    </label>
                                    <select
                                        id="currency"
                                        value={menu.currency}
                                        onChange={(e) => setMenu({ ...menu, currency: e.target.value })}
                                        className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                    >
                                        {CURRENCIES.map((cur) => (
                                            <option key={cur.code} value={cur.code}>
                                                {cur.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.currency && <p className="mt-1 text-xs text-red-600">{errors.currency}</p>}
                                </div>

                                <div>
                                    <label htmlFor="menu_name" className="mb-1 block text-sm font-medium text-stone-700">
                                        Menu name (optional)
                                    </label>
                                    <input
                                        id="menu_name"
                                        type="text"
                                        value={menu.name}
                                        onChange={(e) => setMenu({ ...menu, name: e.target.value })}
                                        placeholder="e.g. Main Menu"
                                        className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-stone-700">
                                    Menu languages (within restaurant languages) *
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {restaurant.languages.map((locale) => {
                                        const active = menu.languages.includes(locale);

                                        return (
                                            <button
                                                key={locale}
                                                type="button"
                                                onClick={() =>
                                                    setMenuLanguages(
                                                        active
                                                            ? menu.languages.filter((l) => l !== locale)
                                                            : [...menu.languages, locale]
                                                    )
                                                }
                                                className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                                                    active
                                                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                        : 'border-stone-300 text-stone-600 hover:border-stone-400'
                                                }`}
                                            >
                                                {LOCALES[locale]}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.menu_languages && <p className="mt-1 text-xs text-red-600">{errors.menu_languages}</p>}
                            </div>
                        </section>
                    )}

                    {step === 2 && (
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="flex items-center gap-2 font-semibold text-stone-900">
                                        <ListPlus className="h-5 w-5 text-amber-500" />
                                        Menu categories
                                    </h2>
                                    <p className="mt-1 text-sm text-stone-600">
                                        Group your items — e.g. Appetizers, Mains, Drinks.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={addCategory}
                                    className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add category
                                </button>
                            </div>

                            {errors.categories && <p className="text-xs text-red-600">{errors.categories}</p>}

                            {categories.map((category, i) => (
                                <div key={i} className="rounded-xl border border-stone-200">
                                    <button
                                        type="button"
                                        onClick={() => setExpandedCategory(expandedCategory === i ? -1 : i)}
                                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                                    >
                                        <span className="text-sm font-medium text-stone-800">
                                            Category {i + 1}
                                            {category.translations[menu.languages[0]]?.name && (
                                                <span className="ml-2 text-stone-500">
                                                    — {category.translations[menu.languages[0]].name}
                                                </span>
                                            )}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            {categories.length > 1 && (
                                                <span
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeCategory(i);
                                                    }}
                                                    className="rounded-md p-1 text-stone-400 hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </span>
                                            )}
                                            <ChevronDown
                                                className={`h-4 w-4 text-stone-400 transition ${expandedCategory === i ? '' : '-rotate-90'}`}
                                            />
                                        </span>
                                    </button>

                                    {expandedCategory === i && (
                                        <div className="space-y-3 border-t border-stone-100 p-4">
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {menu.languages.map((locale) => (
                                                    <div key={locale}>
                                                        <label className="mb-1 block text-xs font-medium text-stone-600">
                                                            Name · {LOCALES[locale]}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={category.translations[locale]?.name ?? ''}
                                                            onChange={(e) => updateCategoryTranslation(i, locale, 'name', e.target.value)}
                                                            placeholder={locale === 'ar' ? 'مقبلات' : locale === 'fr' ? 'Entrées' : 'Appetizers'}
                                                            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                                                        />
                                                        {errors[`cat_${i}_${locale}`] && (
                                                            <p className="mt-1 text-xs text-red-600">{errors[`cat_${i}_${locale}`]}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </section>
                    )}

                    {step === 3 && (
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="flex items-center gap-2 font-semibold text-stone-900">
                                        <Sparkles className="h-5 w-5 text-amber-500" />
                                        Menu items
                                    </h2>
                                    <p className="mt-1 text-sm text-stone-600">
                                        Add dishes to each category with translated names and prices.
                                    </p>
                                </div>
                            </div>

                            {errors.items && <p className="text-xs text-red-600">{errors.items}</p>}

                            {categories.map((category, categoryIndex) => (
                                <div key={categoryIndex} className="rounded-xl border border-stone-200 p-4">
                                    <h3 className="mb-3 font-medium text-stone-800">
                                        {category.translations[menu.languages[0]]?.name || `Category ${categoryIndex + 1}`}
                                    </h3>

                                    <div className="space-y-4">
                                        {category.items.map((item, itemIndex) => (
                                            <div key={itemIndex} className="rounded-lg border border-stone-100 bg-stone-50/60 p-4">
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    {menu.languages.map((locale) => (
                                                        <div key={locale}>
                                                            <label className="mb-1 block text-xs font-medium text-stone-600">
                                                                Name · {LOCALES[locale]}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={item.translations[locale]?.name ?? ''}
                                                                onChange={(e) => updateItemTranslation(categoryIndex, itemIndex, locale, 'name', e.target.value)}
                                                                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                    {menu.languages.map((locale) => (
                                                        <div key={locale}>
                                                            <label className="mb-1 block text-xs font-medium text-stone-600">
                                                                Description · {LOCALES[locale]}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={item.translations[locale]?.description ?? ''}
                                                                onChange={(e) => updateItemTranslation(categoryIndex, itemIndex, locale, 'description', e.target.value)}
                                                                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-3 grid gap-3 sm:grid-cols-4">
                                                    <div className="sm:col-span-1">
                                                        <label className="mb-1 block text-xs font-medium text-stone-600">Price *</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.price}
                                                            onChange={(e) => updateItem(categoryIndex, itemIndex, 'price', e.target.value)}
                                                            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-1">
                                                        <label className="mb-1 block text-xs font-medium text-stone-600">Discount price</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.discount_price}
                                                            onChange={(e) => updateItem(categoryIndex, itemIndex, 'discount_price', e.target.value)}
                                                            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <label className="mb-1 block text-xs font-medium text-stone-600">Image</label>
                                                        <div className="h-full">
                                                            <ImageInput value={item.image} onChange={(v) => updateItem(categoryIndex, itemIndex, 'image', v)} folder="menus" label="Item photo (optional)" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-2 flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(categoryIndex, itemIndex)}
                                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-stone-500 hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Remove item
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => addItem(categoryIndex)}
                                        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add item
                                    </button>
                                </div>
                            ))}
                        </section>
                    )}

                    {step === 4 && (
                        <section className="space-y-6">
                            <div className="text-center">
                                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                                    <Sparkles className="h-6 w-6" />
                                </span>
                                <h2 className="mt-4 text-xl font-bold text-stone-900">{is_editing ? 'Review changes' : 'Ready to publish'}</h2>
                                <p className="mt-1 text-sm text-stone-600">
                                    {is_editing
                                        ? "We'll update your restaurant, menu, and public links."
                                        : "We'll create your restaurant, menu, and two public links."}
                                </p>
                            </div>

                            <div className="rounded-xl border border-stone-200 divide-y divide-stone-100">
                                <div className="flex justify-between px-4 py-3 text-sm">
                                    <span className="text-stone-500">Restaurant</span>
                                    <span className="font-medium text-stone-900">
                                        {restaurant.translations[menu.languages[0]]?.name}
                                    </span>
                                </div>
                                <div className="flex justify-between px-4 py-3 text-sm">
                                    <span className="text-stone-500">Languages</span>
                                    <span className="font-medium text-stone-900">
                                        {restaurant.languages.map((l) => LOCALES[l]).join(', ')}
                                    </span>
                                </div>
                                <div className="flex justify-between px-4 py-3 text-sm">
                                    <span className="text-stone-500">Currency</span>
                                    <span className="font-medium text-stone-900">{menu.currency}</span>
                                </div>
                                <div className="flex justify-between px-4 py-3 text-sm">
                                    <span className="text-stone-500">Categories</span>
                                    <span className="font-medium text-stone-900">{categories.length}</span>
                                </div>
                                <div className="flex justify-between px-4 py-3 text-sm">
                                    <span className="text-stone-500">Items</span>
                                    <span className="font-medium text-stone-900">
                                        {categories.reduce((sum, c) => sum + c.items.length, 0)}
                                    </span>
                                </div>
                            </div>

                            {Object.keys(errors).length > 0 && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    Something went wrong: {Object.values(errors).join(' ')}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={submit}
                                disabled={submitting}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3 font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
                            >
                                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                                {submitting
                                    ? (is_editing ? 'Saving changes…' : 'Creating your menu…')
                                    : (is_editing ? 'Save changes' : 'Generate menu & links')}
                            </button>
                        </section>
                    )}
                </div>

                <div className="mt-6 flex items-center justify-between">
                    {step > 0 ? (
                        <button
                            type="button"
                            onClick={goBack}
                            disabled={submitting}
                            className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </button>
                    ) : (
                        <span />
                    )}

                    {!toward_end && (
                        <button
                            type="button"
                            onClick={goNext}
                            className="inline-flex items-center gap-1 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800"
                        >
                            Continue
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </AppShell>
    );
}