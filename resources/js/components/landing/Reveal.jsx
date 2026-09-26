import { useEffect, useRef, useState } from 'react';

/**
 * Fades content in the first time it enters the viewport.
 *
 * The hidden state is only applied once JavaScript is running, so the page
 * stays fully readable when scripts are blocked or fail.
 */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...props }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;

        document.documentElement.classList.add('reveal-ready');

        if (!node) {
            return;
        }

        if (typeof IntersectionObserver === 'undefined') {
            setVisible(true);

            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisible(true);
                        observer.disconnect();
                    }
                });
            },
            { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    return (
        <Tag
            ref={ref}
            data-reveal={visible ? 'shown' : 'hidden'}
            style={delay ? { transitionDelay: `${delay}ms` } : undefined}
            className={className}
            {...props}
        >
            {children}
        </Tag>
    );
}
