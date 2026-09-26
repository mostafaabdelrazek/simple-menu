import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

const VARIANTS = {
    primary:
        'bg-stone-900 text-white shadow-lg shadow-stone-900/15 hover:bg-stone-800 hover:shadow-stone-900/25 focus-visible:outline-stone-900',
    light: 'bg-white text-stone-900 shadow-lg shadow-black/20 hover:bg-amber-50 focus-visible:outline-white',
    secondary:
        'bg-white text-stone-800 ring-1 ring-stone-300 hover:bg-stone-50 hover:ring-stone-400 focus-visible:outline-stone-500',
    ghost: 'text-stone-700 hover:text-stone-950 hover:bg-stone-100 focus-visible:outline-stone-500',
};

const SIZES = {
    md: 'px-5 py-3 text-sm sm:text-base',
    lg: 'px-6 py-3.5 text-base sm:text-lg',
};

/**
 * The landing page call to action.
 *
 * `href` pointing at the Google sign-in flow renders a plain anchor so the
 * redirect leaves the single page app; everything else stays a client visit.
 */
export default function Cta({ href, children, variant = 'primary', size = 'lg', rtl = false, className = '', icon = true }) {
    const classes = `group inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 ${
        VARIANTS[variant] ?? VARIANTS.primary
    } ${SIZES[size] ?? SIZES.lg} ${className}`;

    const content = (
        <>
            <span>{children}</span>
            {icon && <ArrowRight className={`h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 ${rtl ? 'rotate-180' : ''}`} />}
        </>
    );

    if (href.startsWith('/auth/')) {
        return (
            <a href={href} className={classes}>
                {content}
            </a>
        );
    }

    return (
        <Link href={href} className={classes}>
            {content}
        </Link>
    );
}
