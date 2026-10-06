import { PriceTag, Button } from "./ui";
/** Replaces the bottom nav on product pages (mobile). */
export function StickyAddToCart({ name, price, label, onClick }: { name: string; price: number | null; label: string; onClick: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur md:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{name}</p><PriceTag price={price} /></div>
        <Button variant="primary" onClick={onClick}>{label}</Button>
      </div>
    </div>
  );
}
