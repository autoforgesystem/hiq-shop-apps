import { useLocation } from "react-router-dom";
import { useCompare } from "./CompareContext";
import { getProduct } from "../data/catalog";
import { ButtonLink } from "./ui";
import { IconClose } from "./Icons";

export function CompareTray() {
  const { items, toggle, clear } = useCompare();
  const { pathname } = useLocation();
  if (!items.length || pathname === "/compare" || !/^\/(shop|product)/.test(pathname)) return null;
  return (
    <aside aria-label="Compare tray" className="fixed inset-x-3 bottom-[84px] z-40 mx-auto max-w-2xl rounded-2xl bg-hiq-navy p-3 text-white shadow-lift md:bottom-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold">Compare ({items.length}/3)</span>
        {items.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 rounded-full bg-white/10 py-1 pl-3 pr-1 text-sm">
            {getProduct(s)?.model}
            <button onClick={() => toggle(s)} aria-label={`Remove ${getProduct(s)?.model}`} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/20"><IconClose size={16} /></button>
          </span>
        ))}
        <div className="ml-auto flex gap-2">
          <button onClick={clear} className="min-h-[44px] px-3 text-sm underline underline-offset-4">Clear</button>
          <ButtonLink to="/compare" variant="secondary" className="bg-white !text-hiq-navy hover:bg-hiq-sky">Compare now</ButtonLink>
        </div>
      </div>
    </aside>
  );
}
