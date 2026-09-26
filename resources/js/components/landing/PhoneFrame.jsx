/** Phone shell used by the landing page mockups. */
export default function PhoneFrame({ children, className = '', tone = 'dark' }) {
    return (
        <div
            className={`relative w-[248px] rounded-[2.25rem] p-[10px] shadow-2xl shadow-stone-900/25 ring-1 ring-stone-900/10 sm:w-[268px] ${
                tone === 'dark' ? 'bg-stone-950' : 'bg-stone-900'
            } ${className}`}
        >
            <div className="relative overflow-hidden rounded-[1.75rem] bg-stone-950">
                <div className="absolute inset-x-0 top-0 z-20 flex h-7 items-center justify-between px-4 text-[9px] font-medium text-stone-400">
                    <span>9:41</span>
                    <span className="absolute start-1/2 top-1.5 h-4 w-16 -translate-x-1/2 rounded-full bg-stone-900 rtl:translate-x-1/2" />
                    <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-stone-500" />
                        <span className="h-1.5 w-3 rounded-[2px] bg-stone-500" />
                    </span>
                </div>

                <div className="h-[498px] overflow-hidden sm:h-[538px]">{children}</div>
            </div>
        </div>
    );
}
