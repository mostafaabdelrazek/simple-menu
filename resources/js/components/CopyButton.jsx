import { useState } from 'react';
import { Copy } from 'lucide-react';
import { useI18n } from '../lib/i18n';

export default function CopyButton({ text, label }) {
    const { t } = useI18n();
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            const input = document.createElement('input');
            input.value = text;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            input.remove();
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <button
            type="button"
            onClick={handleCopy}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50"
        >
            <Copy className="h-3.5 w-3.5" />
            {copied ? t('common.copied') : (label ?? t('common.copy'))}
        </button>
    );
}
