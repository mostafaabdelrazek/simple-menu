import { useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { ImagePlus, Loader2, X } from 'lucide-react';

export default function ImageInput({ value, onChange, folder = 'restaurants', label = 'Upload image' }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const csrfToken = usePage().props.csrf_token
        ?? document.querySelector('meta[name="csrf-token"]')?.content;

    async function handleFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        try {
            const response = await fetch('/uploads', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: formData,
            });

            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload.errors?.file?.[0] ?? payload.message ?? 'Upload failed.');
            }

            onChange({ url: payload.url, path: payload.path });
        } catch (err) {
            setError(err.message ?? 'Upload failed.');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    }

    function clear() {
        onChange(null);
        setError(null);
    }

    return (
        <div>
            {value ? (
                <div className="relative overflow-hidden rounded-lg border border-stone-300">
                    <img src={value.url} alt={label} className="h-28 w-full object-cover" />
                    <button
                        type="button"
                        onClick={clear}
                        className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-stone-600 shadow hover:bg-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="flex h-28 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-stone-300 text-stone-500 hover:border-amber-400 hover:text-amber-600"
                >
                    {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
                    <span className="text-xs">{uploading ? 'Uploading…' : label}</span>
                </button>
            )}
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}