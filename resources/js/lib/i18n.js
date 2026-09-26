import { usePage } from '@inertiajs/react';
import { LOCALES } from './constants';

const PLACEHOLDER = /:([a-z_]+)/gi;

/**
 * Resolve one translation line.
 *
 * Mirrors Laravel's JSON translation syntax: `{0}`, `{1}` and `[2,*]` pick a
 * plural branch, `:name` placeholders are replaced, and any key missing from
 * the active locale falls back to English before falling back to the key.
 *
 * @param {Record<string, string>} dictionary
 * @param {string} key
 * @param {Record<string, string|number>} replacements
 * @returns {string}
 */
export function translate(dictionary, key, replacements = {}) {
    const line = dictionary?.[key] ?? key;
    const chosen =
        line.includes('|') && replacements.count !== undefined
            ? pickPlural(line, Number(replacements.count))
            : line;

    return chosen.replace(PLACEHOLDER, (match, name) =>
        name in replacements ? String(replacements[name]) : match
    );
}

function pickPlural(line, count) {
    const segments = line.split('|');

    for (const segment of segments) {
        const exact = segment.match(/^\{(\d+)\}\s?([\s\S]*)$/);

        if (exact) {
            if (Number(exact[1]) === count) {
                return exact[2];
            }

            continue;
        }

        const range = segment.match(/^\[(\d+),(\d+|\*)\]\s?([\s\S]*)$/);

        if (range) {
            const min = Number(range[1]);
            const max = range[2] === '*' ? Infinity : Number(range[2]);

            if (count >= min && count <= max) {
                return range[3];
            }

            continue;
        }

        return segment;
    }

    return segments[segments.length - 1] ?? line;
}

/**
 * Translation helpers for the signed-in app.
 *
 * The dictionary and the active locale are shared by HandleInertiaRequests, so
 * a language switch only needs a page reload.
 */
export function useI18n() {
    const { locale, translations } = usePage().props;
    const active = activeDictionary(translations, locale);

    return {
        locale: locale ?? 'en',
        dir: locale === 'ar' ? 'rtl' : 'ltr',
        isRtl: locale === 'ar',
        locales: LOCALES,
        supportedLocales: Object.keys(LOCALES),
        t: (key, replacements) => translate(active, key, replacements),
    };
}

/**
 * HandleInertiaRequests shares one flat dictionary — the active locale's — while
 * tests and the landing page may share a map keyed by locale, so both shapes
 * have to resolve to the same set of lines.
 */
function activeDictionary(translations, locale) {
    if (!translations) {
        return {};
    }

    return translations[locale] ?? translations[locale?.split('-')[0]] ?? translations.en ?? translations;
}
