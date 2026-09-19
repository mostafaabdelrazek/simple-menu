import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, UtensilsCrossed } from 'lucide-react';

export default function AppShell({ children }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    function logout() {
        router.post('/logout');
    }

    return (
        <div className="min-h-screen">
            <header className="border-b border-stone-200 bg-white">
                <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-2 font-semibold text-stone-900">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white">
                            <UtensilsCrossed className="h-5 w-5" />
                        </span>
                        SimpleMenu
                    </Link>

                    <div className="flex items-center gap-3">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="" className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
                        ) : (
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-200 text-sm font-semibold text-stone-700">
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </span>
                        )}
                        <span className="hidden text-sm text-stone-600 sm:block">{user?.name}</span>
                        <button
                            type="button"
                            onClick={logout}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Sign out</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        </div>
    );
}