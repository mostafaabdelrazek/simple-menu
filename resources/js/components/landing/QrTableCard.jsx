import QrCode from '../QrCode';

/** A printed table tent: the QR code a guest scans to open the menu. */
export default function QrTableCard({ value, name, caption, url, className = '' }) {
    return (
        <div
            className={`w-[184px] rounded-2xl bg-white p-3 text-center shadow-xl shadow-stone-900/20 ring-1 ring-stone-900/5 ${className}`}
        >
            <p className="truncate text-[11px] font-bold tracking-tight text-stone-900">{name}</p>

            <div className="mx-auto mt-2 w-fit rounded-xl bg-white p-1.5 ring-1 ring-stone-200">
                <QrCode value={value} className="h-[104px] w-[104px]" label={`${caption}`} />
            </div>

            <p className="mt-2 text-[10px] font-semibold text-stone-700">{caption}</p>
            {url && <p className="mt-0.5 truncate text-[8px] text-stone-400">{url.replace(/^https?:\/\//, '')}</p>}
        </div>
    );
}
