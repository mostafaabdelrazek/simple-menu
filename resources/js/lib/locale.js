/**
 * Locale preference shared by the public pages and the signed-in app.
 *
 * The cookie is what LocaleResolver reads on the server; localStorage is a
 * convenience mirror so the choice survives a cookie-less first paint.
 */
export function rememberLocale(code) {
    document.cookie = `simplemenu_lang=${code};path=/;max-age=31536000;samesite=Lax`;

    try {
        localStorage.setItem('simplemenu_lang', code);
    } catch {
        // Storage unavailable; the cookie is enough.
    }
}
