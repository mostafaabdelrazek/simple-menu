export default function SectionHeading({ eyebrow, title, subtitle, align = 'center', invert = false, className = '' }) {
    const alignment = align === 'center' ? 'text-center' : 'text-start';

    return (
        <div className={`${alignment} ${className}`}>
            {eyebrow && (
                <p
                    className={`text-xs font-semibold uppercase tracking-[0.28em] ${
                        invert ? 'text-amber-300/90' : 'text-amber-600'
                    }`}
                >
                    {eyebrow}
                </p>
            )}

            <h2
                className={`mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1] ${
                    invert ? 'text-white' : 'text-stone-900'
                }`}
            >
                {title}
            </h2>

            {subtitle && (
                <p
                    className={`mt-4 text-base leading-relaxed text-pretty sm:text-lg ${
                        invert ? 'text-stone-300' : 'text-stone-600'
                    } ${align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-2xl'}`}
                >
                    {subtitle}
                </p>
            )}
        </div>
    );
}
