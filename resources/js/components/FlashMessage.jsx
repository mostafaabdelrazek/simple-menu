import { usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function FlashMessage() {
    const { flash } = usePage().props;

    if (!flash?.success && !flash?.error) return null;

    const type = flash.error ? 'error' : 'success';
    const message = flash.error ?? flash.success;
    const classes =
        type === 'error'
            ? 'border-red-200 bg-red-50 text-red-800'
            : 'border-emerald-200 bg-emerald-50 text-emerald-800';
    const Icon = type === 'error' ? AlertCircle : CheckCircle2;

    return (
        <div className={`mb-4 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${classes}`}>
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{message}</span>
        </div>
    );
}