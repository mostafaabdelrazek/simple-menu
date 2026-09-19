import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ links }) {
    if (!links || links.length <= 3) return null;

    const prev = links[0];
    const next = links[links.length - 1];
    const pages = links.slice(1, -1);

    return (
        <nav className="mt-6 flex items-center gap-1">
            {prev.url && (
                <Link
                    href={prev.url}
                    preserveScroll
                    className="flex items-center gap-1 rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-white"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Link>
            )}

            {pages.map((link, i) => {
                const label = link.label.replace(/&laquo;|&raquo;/g, '').trim() || String(i + 1);

                if (!link.url && !link.active) {
                    return (
                        <span key={i} className="px-2 text-sm text-stone-400">
                            {label}
                        </span>
                    );
                }

                return (
                    <Link
                        key={i}
                        href={link.url ?? '#'}
                        preserveScroll
                        className={`rounded-md border px-3 py-1.5 text-sm ${
                            link.active
                                ? 'border-stone-900 bg-stone-900 text-white'
                                : 'border-stone-300 text-stone-700 hover:bg-white'
                        }`}
                    >
                        {label}
                    </Link>
                );
            })}

            {next.url && (
                <Link
                    href={next.url}
                    preserveScroll
                    className="flex items-center gap-1 rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-white"
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Link>
            )}
        </nav>
    );
}