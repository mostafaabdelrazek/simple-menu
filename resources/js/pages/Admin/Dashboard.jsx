import { Head } from '@inertiajs/react';
import { MenuSquare, Store, User, Users } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

export default function AdminDashboard({ stats }) {
    const cards = [
        { label: 'Admins', value: stats.admins, icon: User },
        { label: 'Users', value: stats.users, icon: Users },
        { label: 'Restaurants', value: stats.restaurants, icon: Store },
        { label: 'Menus', value: stats.menus, icon: MenuSquare },
    ];

    return (
        <AdminLayout title="Dashboard">
            <Head title="Admin dashboard" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <div key={card.label} className="rounded-2xl border border-stone-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-stone-500">{card.label}</span>
                            <card.icon className="h-5 w-5 text-stone-400" />
                        </div>
                        <p className="mt-2 text-3xl font-bold text-stone-900">{card.value}</p>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}