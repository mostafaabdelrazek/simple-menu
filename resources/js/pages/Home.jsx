import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Globe2, MenuSquare, QrCode, UtensilsCrossed } from 'lucide-react';
import GoogleIcon from '../components/GoogleIcon';

export default function Home() {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-stone-50">
            <header className="border-b border-stone-200 bg-white/80 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                    <div className="flex items-center gap-2 font-semibold text-stone-900">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white">
                            <UtensilsCrossed className="h-5 w-5" />
                        </span>
                        SimpleMenu
                    </div>
                    <nav className="flex items-center gap-3 text-sm">
                        {auth?.user ? (
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600"
                            >
                                Go to dashboard
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <>
                                <a
                                    href="/admin/login"
                                    className="hidden rounded-md px-3 py-2 text-stone-500 hover:text-stone-900 sm:block"
                                >
                                    Admin
                                </a>
                                <a
                                    href="/auth/google"
                                    className="inline-flex items-center gap-2 rounded-md bg-stone-900 px-4 py-2 font-medium text-white hover:bg-stone-800"
                                >
                                    <GoogleIcon className="h-4 w-4 rounded-full bg-white" />
                                    Sign in with Google
                                </a>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <section className="mx-auto max-w-6xl px-4 py-20 text-center">
                <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-stone-900 sm:text-6xl">
                    Create a digital menu in minutes
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600">
                    Build a beautiful multilingual restaurant profile and menu, then share a single link with your
                    customers.
                </p>
                <div className="mt-8 flex justify-center">
                    {auth?.user ? (
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-600"
                        >
                            Start creating
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    ) : (
                        <a
                            href="/auth/google"
                            className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-6 py-3 font-semibold text-white hover:bg-stone-800"
                        >
                            <GoogleIcon className="h-5 w-5 rounded-full bg-white" />
                            Sign in with Google
                        </a>
                    )}
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 pb-20">
                <div className="grid gap-6 sm:grid-cols-3">
                    <div className="rounded-2xl border border-stone-200 bg-white p-6">
                        <Globe2 className="h-8 w-8 text-amber-500" />
                        <h3 className="mt-4 font-semibold text-stone-900">Multilingual by default</h3>
                        <p className="mt-1 text-sm text-stone-600">
                            Offer your menu in Arabic, English, and French. Visitors pick their language automatically.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-stone-200 bg-white p-6">
                        <MenuSquare className="h-8 w-8 text-amber-500" />
                        <h3 className="mt-4 font-semibold text-stone-900">Categories & items</h3>
                        <p className="mt-1 text-sm text-stone-600">
                            Organize items into categories, set prices and discounts, and attach photos.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-stone-200 bg-white p-6">
                        <QrCode className="h-8 w-8 text-amber-500" />
                        <h3 className="mt-4 font-semibold text-stone-900">One link, everything</h3>
                        <p className="mt-1 text-sm text-stone-600">
                            Share your restaurant profile and menu links anywhere — no app required.
                        </p>
                    </div>
                </div>
            </section>

            <footer className="border-t border-stone-200 py-8 text-center text-sm text-stone-500">
                © {new Date().getFullYear()} SimpleMenu
            </footer>
        </div>
    );
}