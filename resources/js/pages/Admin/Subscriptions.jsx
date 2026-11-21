import { Head, router } from '@inertiajs/react';
import { Gift, Search } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Pagination from '../../components/Pagination';
import { useI18n } from '../../lib/i18n';

const STATUS_COLORS = {
    active: 'bg-green-100 text-green-700',
    trialing: 'bg-sky-100 text-sky-700',
    pending: 'bg-stone-100 text-stone-600',
    canceled: 'bg-red-100 text-red-600',
};

export default function AdminSubscriptions({ subscriptions, plans }) {
    const { t } = useI18n();
    const [granting, setGranting] = useState(false);

    function search(e) {
        e.preventDefault();
        const value = new FormData(e.target).get('search');

        router.get('/admin/subscriptions', { search: value || undefined }, { preserveState: true, replace: true });
    }

    function grant(e) {
        e.preventDefault();
        const data = new FormData(e.target);

        router.post('/admin/subscriptions', {
            email: data.get('email'),
            plan: data.get('plan'),
            months: data.get('months') || undefined,
        }, {
            onStart: () => setGranting(true),
            onFinish: () => setGranting(false),
        });
    }

    function cancel(subscription) {
        if (!window.confirm('Cancel this subscription?')) return;

        router.post(`/admin/subscriptions/${subscription.id}/cancel`);
    }

    return (
        <AdminLayout title="Subscriptions">
            <Head title="Subscriptions" />

            <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <form onSubmit={search} className="flex max-w-sm items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                        <input
                            type="search"
                            name="search"
                            placeholder="Search by user name or email…"
                            className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                    </div>
                    <button type="submit" className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800">
                        Search
                    </button>
                </form>

                <form onSubmit={grant} className="flex flex-wrap items-end gap-2 rounded-lg border border-stone-200 bg-white p-3">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-stone-500">
                        <Gift className="h-3.5 w-3.5" />
                        Grant a plan
                    </span>
                    <input
                        type="email"
                        name="email"
                        required
                        placeholder={t('admin.subscriptions.grant_email')}
                        className="w-40 rounded-lg border border-stone-300 px-2 py-1.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <select
                        name="plan"
                        className="rounded-lg border border-stone-300 px-2 py-1.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                        {plans.map((plan) => (
                            <option key={plan.slug} value={plan.slug}>
                                {plan.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        name="months"
                        min="1"
                        max="24"
                        placeholder="Months"
                        className="w-20 rounded-lg border border-stone-300 px-2 py-1.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                        type="submit"
                        disabled={granting}
                        className="rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
                    >
                        Grant
                    </button>
                </form>
            </div>

            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                        <tr>
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Plan</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Renews / ends</th>
                            <th className="px-4 py-3">Gateway</th>
                            <th className="px-4 py-3">Created</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {subscriptions.data.map((subscription) => (
                            <tr key={subscription.id}>
                                <td className="px-4 py-3">
                                    <span className="block font-medium text-stone-900">{subscription.user?.name ?? '—'}</span>
                                    <span className="block text-xs text-stone-500">{subscription.user?.email}</span>
                                </td>
                                <td className="px-4 py-3 font-medium text-stone-900">{subscription.plan}</td>
                                <td className="px-4 py-3">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[subscription.status] ?? 'bg-stone-100 text-stone-600'}`}>
                                        {subscription.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-stone-600">
                                    {subscription.current_period_end ?? subscription.trial_ends_at ?? '—'}
                                </td>
                                <td className="px-4 py-3 text-stone-600">{subscription.gateway ?? '—'}</td>
                                <td className="px-4 py-3 text-stone-600">{subscription.created_at}</td>
                                <td className="px-4 py-3">
                                    {subscription.status !== 'canceled' && (
                                        <button
                                            type="button"
                                            onClick={() => cancel(subscription)}
                                            className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {subscriptions.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-10 text-center text-stone-400">
                                    No subscriptions found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination links={subscriptions.links} />
        </AdminLayout>
    );
}
