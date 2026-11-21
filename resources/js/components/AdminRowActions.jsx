import { router } from '@inertiajs/react';
import { ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';
import { useI18n } from '../lib/i18n';

function confirmThen(message, action) {
    if (!window.confirm(message)) return;
    action();
}

/**
 * The suspend / restore / delete controls shared by the admin tables.
 * Suspensions are reversible; deletes are final, so they confirm twice.
 */
export default function AdminRowActions({ endpoints, suspended = false }) {
    const { t } = useI18n();

    const buttonClass = 'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition';

    return (
        <span className="inline-flex items-center gap-1.5">
            {suspended ? (
                <button
                    type="button"
                    onClick={() => router.post(endpoints.restore)}
                    title={t('admin.moderation.restore')}
                    className={`${buttonClass} bg-green-50 text-green-700 hover:bg-green-100`}
                >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t('admin.moderation.restore')}
                </button>
            ) : (
                <button
                    type="button"
                    onClick={() =>
                        confirmThen(t('admin.moderation.confirm_suspend'), () => router.post(endpoints.suspend))}
                    title={t('admin.moderation.suspend')}
                    className={`${buttonClass} bg-amber-50 text-amber-700 hover:bg-amber-100`}
                >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    {t('admin.moderation.suspend')}
                </button>
            )}
            <button
                type="button"
                onClick={() =>
                    confirmThen(t('admin.moderation.confirm_delete'), () => router.delete(endpoints.destroy))}
                title={t('admin.moderation.delete')}
                className={`${buttonClass} bg-red-50 text-red-600 hover:bg-red-100`}
            >
                <Trash2 className="h-3.5 w-3.5" />
                {t('admin.moderation.delete')}
            </button>
        </span>
    );
}
