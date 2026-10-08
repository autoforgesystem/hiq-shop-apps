import { Link } from "react-router-dom";
import { useCommerce } from "../commerce/CommerceContext";
import { Button, ButtonLink, EmptyState, PriceTag, Tbc } from "../components/ui";
import { IconMinus, IconPlus, IconFilter } from "../components/Icons";
import { useSeo } from "../lib/seo";
import { track } from "../lib/analytics";
import { formatPHP } from "../lib/format";
import { getProduct, filtersFor, partFromSku, PART_UNIT_LABEL } from "../data/catalog";

export default function Cart() {
  const { lines, setQty, remove, adapter } = useCommerce();
  useSeo({ title: "Your cart", description: "Review your HIQ cart.", path: "/cart", noindex: true });
  const allPriced = lines.every((l) => l.unitPrice != null);
  const subtotal = lines.reduce((n, l) => n + (l.unitPrice ?? 0) * l.qty, 0);
  const systemsWithFilters = lines.map((l) => getProduct(l.sku)).filter((p) => p && filtersFor(p.slug).length);
  if (!lines.length) return <div className="page py-12"><h1 className="mb-6 text-[34px]">Your cart</h1><EmptyState title="Your cart is empty" body="Find a system for your home or office, or order filters for the unit you already have." action={<div className="flex flex-wrap justify-center gap-2"><ButtonLink to="/shop" variant="primary">Shop Water Filters</ButtonLink><ButtonLink to="/filters" variant="outline">Find my filters</ButtonLink></div>} /></div>;
  return (
    <div className="page py-10">
      <h1 className="text-[34px]">Your cart</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-slate-200 rounded-card ring-1 ring-slate-200">
          {lines.map((l) => { const part = partFromSku(l.sku); return (
            <li key={l.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{getProduct(l.sku) ? <Link to={`/product/${l.sku}`} className="hover:text-hiq-blue">{l.name}</Link>
                  : part ? <Link to={`/parts/${part.slug}`} className="hover:text-hiq-blue">{l.name}</Link> : l.name}</p>
                {part && part.unit !== "piece" && <p className="text-sm text-slate-600">Quantity in {part.unit === "meter" ? "meters" : "packs"} · price {PART_UNIT_LABEL[part.unit]}</p>}
                {l.options && <p className="text-sm text-slate-600">{Object.entries(l.options).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>}
                {l.options?.installation === "Yes" && <p className="text-sm text-slate-600">Installation add-on: <span className="tbc">[TBC]</span></p>}
              </div>
              <div className="flex items-center rounded-full ring-1 ring-slate-300" role="group" aria-label={`Quantity of ${l.name}`}>
                <button className="grid h-11 w-11 place-items-center" aria-label="Decrease quantity" onClick={() => setQty(l.id, l.qty - 1)}><IconMinus size={18} /></button>
                <span className="w-8 text-center font-semibold" aria-live="polite">{l.qty}</span>
                <button className="grid h-11 w-11 place-items-center" aria-label="Increase quantity" onClick={() => setQty(l.id, l.qty + 1)}><IconPlus size={18} /></button>
              </div>
              <div className="w-28 text-right"><PriceTag price={l.unitPrice} /></div>
              <button onClick={() => remove(l.id)} className="min-h-[44px] text-sm text-slate-600 underline">Remove</button>
            </li>
          ); })}
        </ul>
        <aside className="h-fit space-y-4 rounded-card bg-hiq-sky p-5 lg:sticky lg:top-24">
          <dl className="space-y-2 text-[15px]">
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-semibold">{allPriced ? formatPHP(subtotal) : <Tbc>PRICE TBC</Tbc>}</dd></div>
            <div className="flex justify-between"><dt>Delivery</dt><dd><Tbc /></dd></div>
            <div className="flex justify-between"><dt>Installation</dt><dd>Confirmed by HIQ</dd></div>
          </dl>
          <Button variant="primary" full onClick={() => { track("begin_checkout", { items: lines.length }); adapter.goToCheckout(); }}>Checkout</Button>
          <p className="text-sm text-slate-600">Guest checkout available. Pay by card, GCash, Maya or online banking.</p>
          {systemsWithFilters.length > 0 && <div className="flex gap-2 rounded-lg bg-white p-3 text-[15px]"><IconFilter className="shrink-0 text-hiq-blue" /><span>Add replacement filters now? <Link to={`/filters?model=${systemsWithFilters[0]!.slug}`} className="link">See filters for the {systemsWithFilters[0]!.model}</Link></span></div>}
        </aside>
      </div>
    </div>
  );
}
