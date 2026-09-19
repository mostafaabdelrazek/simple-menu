import { Head, useForm } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import FlashMessage from '../../components/FlashMessage';

export default function Verify({ country_code, phone, dev_code }) {
    const { data, setData, post, processing, errors } = useForm({ code: '' });

    function submit(e) {
        e.preventDefault();
        post('/onboarding/phone/verify');
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-8">
            <Head title="Enter verification code" />
            <div className="w-full max-w-md">
                <FlashMessage />

                <div className="mb-6 flex flex-col items-center text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white">
                        <KeyRound className="h-6 w-6" />
                    </span>
                    <h1 className="mt-4 text-2xl font-bold text-stone-900">Enter the code</h1>
                    <p className="mt-1 text-sm text-stone-600">
                        We sent a 6-digit code to{' '}
                        <strong>
                            {country_code} {phone}
                        </strong>
                    </p>
                </div>

                {dev_code && (
                    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
                        Development code: <strong className="tracking-widest">{dev_code}</strong>
                    </div>
                )}

                <form onSubmit={submit} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                    <label htmlFor="code" className="mb-1 block text-sm font-medium text-stone-700">
                        Verification code
                    </label>
                    <input
                        id="code"
                        type="text"
                        value={data.code}
                        onChange={(e) => setData('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-center text-lg tracking-[0.5em] focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code}</p>}

                    <button
                        type="submit"
                        disabled={processing || data.code.length < 6}
                        className="mt-5 w-full rounded-lg bg-amber-500 px-4 py-3 font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
                    >
                        Verify & continue
                    </button>
                </form>
            </div>
        </div>
    );
}