import { Head, router, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import Pagination from '../../components/Pagination';

function SearchInput({ placeholder }) {
    const { url } = usePage();
    const params = new URLSearchParams(window.location.search);
    const current = params.get('search') ?? '';

    function submit(e) {
        e.preventDefault();
        const value = new FormData(e.target).get('search');

        router.get(url.split('?')[0], { search: value || undefined }, { preserveState: true, replace: true });
    }

    return (
        <form onSubmit={submit} className="mb-4 flex max-w-sm items-center gap-2">
            <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                    type="search"
                    name="search"
                    defaultValue={current}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
            </div>
            <button type="submit" className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800">
                Search
            </button>
        </form>
    );
}

export default function AdminUsers({ users }) {
    return (
        <AdminLayout title="Users">
            <Head title="Users" />
            <SearchInput placeholder="Search by name or email…" />

            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {users.data.map((user) => (
                            <tr key={user.id}>
                                <td className="px-4 py-3 font-medium text-stone-900">
                                    <span className="flex items-center gap-2">
                                        {user.avatar && <img src={user.avatar} alt="" className="h-7 w-7 rounded-full" referrerPolicy="no-referrer" />}
                                        {user.name}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-stone-600">{user.email}</td>
                                <td className="px-4 py-3 text-stone-600">
                                    {user.country_code ? `${user.country_code} ${user.phone ?? ''}` : '—'}
                                </td>
                                <td className="px-4 py-3 text-stone-600">{new Date(user.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        {users.data.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-stone-400">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination links={users.links} />
        </AdminLayout>
    );
}