import { Link, router, usePage } from '@inertiajs/react';
import { LayoutDashboard, LogOut, MenuSquare, Store, Users, UtensilsCrossed } from 'lucide-react';

const NAV = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/restaurants', label: 'Restaurants', icon: Store },
    { href: '/admin/menus', label: 'Menus', icon: MenuSquare },
];

export default function AdminLayout({ children, title }) {
    const { url, props } = usePage();
    const admin = props.auth?.admin;

    function isActive(item) {
        if (item.exact) return url === item.href;

        return url.startsWith(item.href);
    }

    function logout() {
        router.post('/admin/logout');
    }

    return (
        <div className="flex min-h-screen bg-stone-100">
            <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col border-r border-stone-200 bg-white">
                <div className="flex h-16 items-center gap-2 border-b border-stone-200 px-5 font-semibold text-stone-900">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white">
                        <UtensilsCrossed className="h-4 w-4" />
                    </span>
                    SimpleMenu
                    <span className="ml-auto rounded bg-stone-100 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase text-stone-500">
                        Admin
                    </span>
                </div>

                <nav className="flex-1 space-y-1 p-3">
                    {NAV.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                                isActive(item) ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
                            }`}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="border-t border-stone-200 p-3">
                    <div className="flex items-center justify-between px-2 py-1">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-stone-800">{admin?.name}</p>
                            <p className="truncate text-xs text-stone-500">{admin?.email}</p>
                        </div>
                        <button
                            type="button"
                            onClick={logout}
                            className="rounded-md p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </aside>

            <main className="ml-60 min-h-screen flex-1 px-8 py-8">
                {title && <h1 className="mb-6 text-2xl font-bold text-stone-900">{title}</h1>}
                {children}
            </main>
        </div>
    );
}