import { Palette } from 'lucide-react';
import {
    MENU_FONTS,
    THEME_FONTS,
    THEME_PRESETS,
    contrastRatio,
    isHexColor,
    menuThemeStyle,
    MIN_CONTRAST,
    normalizeTheme,
} from '../../lib/menuTheme';
import { useI18n } from '../../lib/i18n';

function ColorField({ id, label, value, onChange, error }) {
    return (
        <div>
            <label htmlFor={id} className="mb-1 block text-sm font-medium text-stone-700">
                {label}
            </label>
            <div className="flex items-center gap-2">
                <input
                    id={id}
                    type="color"
                    value={value}
                    onChange={(event) => onChange(event.target.value.toLowerCase())}
                    className="h-10 w-14 shrink-0 cursor-pointer rounded-lg border border-stone-300 bg-white p-1"
                />
                <input
                    type="text"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    spellCheck={false}
                    className={`w-full rounded-lg border px-3 py-2.5 font-mono text-sm uppercase focus:outline-none focus:ring-1 ${
                        isHexColor(value)
                            ? 'border-stone-300 focus:border-amber-500 focus:ring-amber-500'
                            : 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    }`}
                />
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

/**
 * Background, text colour and font for the public pages.
 *
 * The swatch preview is the point of this control: it is the only way an owner
 * can tell whether a light-on-dark combination is actually readable.
 */
export default function AppearancePicker({ theme, onChange, errors = {} }) {
    const { t } = useI18n();
    const current = normalizeTheme(theme);
    const ratio = contrastRatio(current.primary, current.background);
    const lowContrast = ratio < MIN_CONTRAST;

    function update(patch) {
        onChange({ ...current, ...patch });
    }

    return (
        <section className="space-y-4 rounded-xl border border-stone-200 bg-stone-50/60 p-4">
            <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                    <Palette className="h-4 w-4 text-amber-500" />
                    {t('wizard.appearance_title')}
                </h3>
                <p className="mt-1 text-sm text-stone-600">{t('wizard.appearance_hint')}</p>
            </div>

            <div>
                <p className="mb-1.5 text-xs font-medium text-stone-600">{t('wizard.theme_presets')}</p>
                <div className="flex flex-wrap gap-2">
                    {THEME_PRESETS.map((preset) => {
                        const active =
                            preset.background === current.background &&
                            preset.primary === current.primary &&
                            preset.font === current.font;

                        return (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => onChange({ ...preset })}
                                title={preset.id}
                                aria-pressed={active}
                                className={`h-8 w-8 rounded-full border-2 transition ${
                                    active ? 'border-amber-500 ring-2 ring-amber-200' : 'border-stone-300'
                                }`}
                                style={{ backgroundColor: preset.background }}
                            >
                                <span className="sr-only">{preset.id}</span>
                            </button>
                        );
                    })}
                    <button
                        type="button"
                        onClick={() => onChange({ ...normalizeTheme(null) })}
                        className="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-600 hover:bg-white"
                    >
                        {t('wizard.reset_theme')}
                    </button>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <ColorField
                    id="theme_background"
                    label={t('wizard.background_color')}
                    value={current.background}
                    onChange={(value) => update({ background: value })}
                    error={errors['menu.theme.background']}
                />
                <ColorField
                    id="theme_primary"
                    label={t('wizard.text_color')}
                    value={current.primary}
                    onChange={(value) => update({ primary: value })}
                    error={errors['menu.theme.primary']}
                />
            </div>

            <div>
                <p className="mb-1.5 text-xs font-medium text-stone-600">{t('wizard.font_family')}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {THEME_FONTS.map((font) => (
                        <button
                            key={font}
                            type="button"
                            onClick={() => update({ font })}
                            aria-pressed={current.font === font}
                            className={`rounded-lg border px-3 py-2 text-sm transition ${
                                current.font === font
                                    ? 'border-amber-500 bg-amber-50 text-amber-800'
                                    : 'border-stone-300 text-stone-700 hover:bg-white'
                            }`}
                            style={{ fontFamily: MENU_FONTS[font].stack }}
                        >
                            {t(MENU_FONTS[font].labelKey)}
                        </button>
                    ))}
                </div>
                {errors['menu.theme.font'] && <p className="mt-1 text-xs text-red-600">{errors['menu.theme.font']}</p>}
            </div>

            <div>
                <p className="mb-1.5 text-xs font-medium text-stone-600">{t('wizard.theme_preview')}</p>
                {/* The preview uses the same custom properties as the public
                    pages, so what the owner sees here is what guests get. */}
                <div
                    dir="auto"
                    className="menu-theme overflow-hidden rounded-xl border border-stone-200"
                    style={menuThemeStyle(current)}
                >
                    <div className="px-4 py-3 text-center">
                        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-[var(--menu-muted)]">
                            {t('public.menu_eyebrow')}
                        </p>
                        <p className="mt-1 text-lg font-semibold">Golden Cairo Grill</p>
                    </div>
                    <div className="border-t border-[var(--menu-line)] px-4 py-3">
                        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[var(--menu-muted)]">
                            Appetizers
                        </p>
                        <p className="mt-1 text-sm">Grilled Halloumi Plate</p>
                        <p className="text-xs text-[var(--menu-muted)]">Tomato, mint, olive oil</p>
                        <p className="mt-1 text-sm font-semibold text-[var(--menu-accent)]">120 EGP</p>
                    </div>
                </div>

                {lowContrast && <p className="mt-2 text-xs text-amber-700">{t('wizard.contrast_warning')}</p>}
            </div>
        </section>
    );
}
