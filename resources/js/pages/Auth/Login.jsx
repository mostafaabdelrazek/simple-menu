import { Head, Link, usePage } from '@inertiajs/react';
import GoogleIcon from '../../components/GoogleIcon';
import FlashMessage from '../../components/FlashMessage';
import { UtensilsCrossed, ArrowLeft } from 'lucide-react';

export default function Login() {
    const { auth, demo_login_available } = usePage().props;

    if (auth?.user) {
        return (
            <div className="flex min-h-screen items-center justify-center px-4">
                <FlashMessage />
                <div className="text-center">
                    <p className="mb-4 text-stone-600">
                        You're already signed in as <strong>{auth.user.name}</strong>.
                    </p>
                    <Link href="/dashboard" className="font-medium text-amber-600 hover:underline">
                        Go to dashboard →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
            <Head title="Sign in" />
            <FlashMessage />

            <div className="w-full max-w-sm">
                <div className="mb-8 flex flex-col items-center text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white">
                        <UtensilsCrossed className="h-6 w-6" />
                    </span>
                    <h1 className="mt-4 text-2xl font-bold text-stone-900">SimpleMenu</h1>
                    <p className="mt-1 text-sm text-stone-600">Sign in to start creating your menu.</p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                    <a
                        href="/auth/google"
                        className="flex w-full items-center justify-center gap-3 rounded-lg border border-stone-300 bg-white px-4 py-3 font-medium text-stone-800 hover:bg-stone-50"
                    >
                        <GoogleIcon className="h-5 w-5" />
                        Continue with Google
                    </a>

                    <div className="my-4 flex items-center gap-3 text-xs text-stone-400">
                        <span className="h-px flex-1 bg-stone-200" />
                        or
                        <span className="h-px flex-1 bg-stone-200" />
                    </div>

                    <a
                        href="/auth/google"
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-3 font-medium text-white hover:bg-stone-800"
                    >
                        Login
                    </a>

                    {demo_login_available && (
                        <Link
                            href="/demo-login"
                            method="post"
                            as="button"
                            type="button"
                            className="mt-3 flex w-full items-center justify-center rounded-lg border border-dashed border-amber-400 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100"
                        >
                            Dev login — sign in as demo user
                        </Link>
                    )}
                </div>

                <Link href="/" className="mt-6 flex items-center justify-center gap-1 text-sm text-stone-500 hover:text-stone-800">
                    <ArrowLeft className="h-4 w-4" />
                    Back to home
                </Link>
            </div>
        </div>
    );
}