import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, UtensilsCrossed } from 'lucide-react';
import AppShell from '../../components/AppShell';
import CopyButton from '../../components/CopyButton';

export default function Complete({ restaurant }) {
    return (
        <AppShell>
            <Head title="Your menu is live!" />

            <div className="mx-auto max-w-lg text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                </span>
                <h1 className="mt-4 text-2xl font-bold text-stone-900">Your menu is live!</h1>
                <p className="mt-1 text-sm text-stone-600">
                    Share these links with your customers.
                </p>

                <Link
                    href="/dashboard"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
                >
                    <span className="inline-flex items-center gap-1">
                        <UtensilsCrossed className="h-4 w-4" />
                        Back to dashboard
                    </span>
                </Link>

                <div className="mt-8 grid gap-4">
                    <div className="rounded-2xl border border-stone-200 bg-white p-5 text-left">
                        <h2 className="text-sm font-semibold text-stone-900">Restaurant profile</h2>
                        <p className="mt-1 text-xs text-stone-500">
                            Full profile with your details and a "View menu" button.
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                            <code className="min-w-0 flex-1 truncate rounded-md bg-stone-100 px-3 py-2 text-xs text-stone-700">
                                {restaurant.profile_url}
                            </code>
                            <CopyButton text={restaurant.profile_url} label="Copy" />
                        </div>
                        <a
                            href={restaurant.profile_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block text-xs font-medium text-amber-600 hover:text-amber-700"
                        >
                            Open →
                        </a>
                    </div>

                    {restaurant.menu_url && (
                        <div className="rounded-2xl border border-stone-200 bg-white p-5 text-left">
                            <h2 className="text-sm font-semibold text-stone-900">Menu link</h2>
                            <p className="mt-1 text-xs text-stone-500">
                                Just the menu — perfect for QR codes or table tags.
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <code className="min-w-0 flex-1 truncate rounded-md bg-stone-100 px-3 py-2 text-xs text-stone-700">
                                    {restaurant.menu_url}
                                </code>
                                <CopyButton text={restaurant.menu_url} label="Copy" />
                            </div>
                            <a
                                href={restaurant.menu_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-block text-xs font-medium text-amber-600 hover:text-amber-700"
                            >
                                Open →
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    );
}