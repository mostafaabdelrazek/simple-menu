/**
 * Menu theming.
 *
 * A menu stores three choices — background, text colour and font family — and
 * the public pages render them through CSS custom properties so a single
 * inline style restyles the whole page.
 */

export const MENU_FONTS = {
    sans: {
        labelKey: 'wizard.font_sans',
        stack: "'Instrument Sans', 'IBM Plex Sans Arabic', ui-sans-serif, system-ui, sans-serif",
    },
    serif: {
        labelKey: 'wizard.font_serif',
        stack: "'Instrument Serif', 'IBM Plex Sans Arabic', ui-serif, Georgia, serif",
    },
    system: {
        labelKey: 'wizard.font_system',
        stack: "system-ui, -apple-system, 'Segoe UI', 'IBM Plex Sans Arabic', sans-serif",
    },
    mono: {
        labelKey: 'wizard.font_mono',
        stack: "ui-monospace, 'SFMono-Regular', Menlo, 'IBM Plex Sans Arabic', monospace",
    },
};

export const THEME_FONTS = Object.keys(MENU_FONTS);

export const DEFAULT_THEME = { background: '#0c0a09', primary: '#f5f5f4', font: 'sans' };

/**
 * Ready-made combinations, so an owner can get a good-looking menu in one tap.
 */
export const THEME_PRESETS = [
    { id: 'midnight', background: '#0c0a09', primary: '#f5f5f4', font: 'sans' },
    { id: 'espresso', background: '#1c1917', primary: '#fef3c7', font: 'serif' },
    { id: 'olive', background: '#1a1c16', primary: '#e7e5d4', font: 'system' },
    { id: 'ocean', background: '#0f172a', primary: '#e0f2fe', font: 'sans' },
    { id: 'linen', background: '#faf7f0', primary: '#1c1917', font: 'serif' },
    { id: 'paper', background: '#ffffff', primary: '#171717', font: 'system' },
    { id: 'blush', background: '#fdf2f8', primary: '#500724', font: 'sans' },
    { id: 'sand', background: '#fef3c7', primary: '#451a03', font: 'mono' },
];

export function normalizeTheme(theme) {
    const background = isHexColor(theme?.background) ? theme.background : DEFAULT_THEME.background;
    const primary = isHexColor(theme?.primary) ? theme.primary : DEFAULT_THEME.primary;
    const font = THEME_FONTS.includes(theme?.font) ? theme.font : DEFAULT_THEME.font;

    return { background, primary, font };
}

export function isHexColor(value) {
    return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
}

/**
 * The inline custom properties that drive a themed page.
 *
 * @param {{ background: string, primary: string, font: string }} theme
 * @returns {Record<string, string>}
 */
export function menuThemeStyle(theme) {
    const { background, primary, font } = normalizeTheme(theme);
    const dark = relativeLuminance(background) < 0.4;

    return {
        '--menu-bg': background,
        '--menu-fg': primary,
        '--menu-font': MENU_FONTS[font].stack,
        // The accent has to stay readable on both dark and light backgrounds.
        '--menu-accent': dark ? '#fbbf24' : '#b45309',
        '--menu-accent-soft': dark ? 'rgba(251, 191, 36, 0.14)' : 'rgba(180, 83, 9, 0.10)',
        '--menu-sale': dark ? '#34d399' : '#047857',
    };
}

/**
 * WCAG contrast ratio between two hex colours, 1 (invisible) to 21.
 *
 * @param {string} foreground
 * @param {string} background
 * @returns {number}
 */
export function contrastRatio(foreground, background) {
    const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
    const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));

    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Below this ratio body text starts to be uncomfortable to read.
 */
export const MIN_CONTRAST = 4.5;

function relativeLuminance(color) {
    if (!isHexColor(color)) {
        return 0;
    }

    const channels = [1, 3, 5].map((offset) => {
        const value = parseInt(color.slice(offset, offset + 2), 16) / 255;

        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}
