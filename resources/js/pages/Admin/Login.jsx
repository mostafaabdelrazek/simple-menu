import { Head, useForm } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/admin/login');
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
            <Head title="Admin sign in" />

            <div className="w-full max-w-sm">
                <div className="mb-6 flex flex-col items-center text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 text-white">
                        <ShieldCheck className="h-6 w-6" />
                    </span>
                    <h1 className="mt-4 text-2xl font-bold text-stone-900">Admin panel</h1>
                    <p className="mt-1 text-sm text-stone-500">Sign in to manage the platform.</p>
                </div>

                <form onSubmit={submit} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-stone-700">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="mb-4 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    {errors.email && <p className="mb-2 text-xs text-red-600">{errors.email}</p>}

                    <label htmlFor="password" className="mb-1 block text-sm font-medium text-stone-700">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />

                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-5 w-full rounded-lg bg-stone-900 px-4 py-3 font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
                    >
                        Sign in
                    </button>
                </form>
            </div>
        </div>
    );
}