import { Head } from '@inertiajs/react';
import AdminLayout from '../../components/AdminLayout';
import Pagination from '../../components/Pagination';
import { Search } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function AdminRestaurants({ restaurants }) {
    function search(e) {
        e.preventDefault();
        const value = new FormData(e.target).get('search');

        router.get('/admin/restaurants', { search: value || undefined }, { preserveState: true, replace: true });
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
                            <th className="px-4 py-3">Created</th>
                            <th className="px-4 py-3">Public link</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {restaurants.data.map((restaurant) => (
                            <tr key={restaurant.id}>
                                <td className="px-4 py-3 font-medium text-stone-900">{restaurant.name}</td>
                                <td className="px-4 py-3 text-stone-600">{restaurant.owner}</td>
                                <td className="px-4 py-3 text-stone-600">{new Date(restaurant.created_at).toLocaleDateString()}</td>
                                <td className="px-4 py-3">
                                    <a href={restaurant.url} target="_blank" rel="noopener noreferrer" className="font-medium text-amber-600 hover:text-amber-700">
                                        View →
                                    </a>
                                </td>
                            </tr>
                        ))}
                        {restaurants.data.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-stone-400">
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