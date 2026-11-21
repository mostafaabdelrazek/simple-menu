import { Head } from '@inertiajs/react';
import AdminLayout from '../../components/AdminLayout';
import Pagination from '../../components/Pagination';
import AdminRowActions from '../../components/AdminRowActions';
import { Search } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useI18n } from '../../lib/i18n';

export default function AdminRestaurants({ restaurants }) {
    const { t } = useI18n();

    function search(e) {
        e.preventDefault();
        const value = new FormData(e.target).get('search');

        router.get('/admin/restaurants', { search: value || undefined }, { preserveState: true, replace: true });
    }

    function statusBadge(suspended) {
        return suspended ? (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                {t('admin.moderation.suspended_badge')}
            </span>
        ) : (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Active</span>
        );
    }

    return (
        <AdminLayout title="Restaurants">
            <Head title="Restaurants" />
            <form onSubmit={search} className="mb-4 flex max-w-sm items-center gap-2">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <input
                        type="search"
                        name="search"
                        placeholder="Search restaurants…"
                        className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                </div>
                <button type="submit" className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800">
                    Search
                </button>
            </form>

            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                        <tr>
                            <th className="px-4 py-3">Restaurant</th>
                            <th className="px-4 py-3">Owner</th>
                            <th className="px-4 py-3">{t('admin.moderation.plan')}</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Created</th>
                            <th className="px-4 py-3">Public link</th>
                            <th className="px-4 py-3">{t('admin.mod_actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {restaurants.data.map((restaurant) => (
                            <tr key={restaurant.id}>
                                <td className="px-4 py-3 font-medium text-stone-900">{restaurant.name}</td>
                                <td className="px-4 py-3 text-stone-600">{restaurant.owner}</td>
                                <td className="px-4 py-3 text-stone-600">{restaurant.owner_plan}</td>
                                <td className="px-4 py-3">{statusBadge(restaurant.suspended)}</td>
                                <td className="px-4 py-3 text-stone-600">{new Date(restaurant.created_at).toLocaleDateString()}</td>
                                <td className="px-4 py-3">
                                    <a href={restaurant.url} target="_blank" rel="noopener noreferrer" className="font-medium text-amber-600 hover:text-amber-700">
                                        View →
                                    </a>
                                </td>
                                <td className="px-4 py-3">
                                    <AdminRowActions
                                        suspended={restaurant.suspended}
                                        endpoints={{
                                            suspend: `/admin/restaurants/${restaurant.id}/suspend`,
                                            restore: `/admin/restaurants/${restaurant.id}/restore`,
                                            destroy: `/admin/restaurants/${restaurant.id}`,
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                        {restaurants.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-10 text-center text-stone-400">
                                    No restaurants found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination links={restaurants.links} />
        </AdminLayout>
    );
}