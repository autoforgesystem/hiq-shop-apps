import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PART_UNIT_LABEL, getPart, getProduct, partCategoryLabel, partSku, parts } from "../data/catalog";
import { partPhoto } from "../data/images";
import type { Product } from "../data/types";
import { Gallery } from "../components/Gallery";
import { PartCard } from "../components/PartCard";
import { SpecTable } from "../components/SpecTable";
import { StickyAddToCart } from "../components/StickyAddToCart";
import { Breadcrumbs, Button, ButtonLink, EmptyState, PriceTag, Tbc } from "../components/ui";
import { IconMinus, IconPlus } from "../components/Icons";
import { useCommerce } from "../commerce/CommerceContext";
import { breadcrumbLd, useSeo } from "../lib/seo";
import { track } from "../lib/analytics";
import { SHOP_URL } from "../config/site";

/** Same limit as the API: tubing by the meter and reseller packs go above the 20 allowed for systems. */
const MAX_QTY = 500;

export default function PartDetail() {
  const { slug = "" } = useParams();
  const p = getPart(slug);
  const { add } = useCommerce();
  const [qtyText, setQtyText] = useState("1"); // what's typed; may be blank while editing
  const qty = Math.min(MAX_QTY, Math.max(1, Number(qtyText) || 1));
  useEffect(() => { setQtyText("1"); if (p) track("view_item", { item_id: partSku(p.slug), item_name: p.name, item_category: p.category }); }, [p?.slug]);
  useSeo({
    title: p ? p.name : "Part not found",
    description: p ? `${p.description} ${partCategoryLabel(p.category)} from HIQ Philippines.` : "This spare part could not be found.",
    path: `/parts/${slug}`,
    jsonLd: p ? [
      { "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.description, category: partCategoryLabel(p.category), url: `${SHOP_URL}/parts/${p.slug}`, ...(p.sku.includes("TBC") ? {} : { sku: p.sku }) },
      breadcrumbLd([{ name: "Spare parts", path: "/parts" }, { name: partCategoryLabel(p.category), path: `/parts?category=${p.category}` }, { name: p.name, path: `/parts/${p.slug}` }]),
    ] : undefined,
  });

  if (!p) return <div className="page py-16"><EmptyState title="We couldn't find that part" body="It may have been renamed or removed. Browse all spare parts instead." action={<ButtonLink to="/parts">Browse spare parts</ButtonLink>} /></div>;
  const fits = p.compatibleModels.map(getProduct).filter(Boolean) as Product[];
  const related = parts.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 4);
  const qtyLabel = p.unit === "meter" ? "Length (meters)" : p.unit === "pack" ? "Number of packs" : "Quantity";
  const addToCart = () => add(partSku(p.slug), qty);
  const step = (d: number) => setQtyText(String(Math.min(MAX_QTY, Math.max(1, qty + d))));

  return (
    <div className="pb-28 md:pb-0">
      <div className="page py-6">
        <Breadcrumbs items={[{ label: "Spare parts", to: "/parts" }, { label: partCategoryLabel(p.category), to: `/parts?category=${p.category}` }, { label: p.name }]} />
        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <Gallery key={p.slug} slots={p.images.length ? p.images.map((_, i) => partPhoto(p, i)) : [partPhoto(p)]} />
          <div>
            <p className="text-[15px] font-semibold text-hiq-blue">{partCategoryLabel(p.category)}</p>
            <h1 className="mt-2 text-[30px] sm:text-[38px]">{p.name}</h1>
            <p className="mt-1 text-[15px] text-slate-600">SKU {p.sku.includes("TBC") ? <Tbc>SKU TBC</Tbc> : p.sku}</p>
            {p.description && <p className="mt-4 text-lg text-slate-700">{p.description}</p>}
            <div className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <PriceTag price={p.price} size="lg" />{p.price != null && <span className="text-[15px] text-slate-600">{PART_UNIT_LABEL[p.unit]}</span>}
              <span className="ml-2 text-[15px] text-slate-600">Availability: <Tbc /></span>
            </div>

            <div className="mt-6">
              <p id="qty-label" className="mb-2 font-semibold">{qtyLabel}</p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-full ring-1 ring-slate-300" role="group" aria-labelledby="qty-label">
                  <button className="grid h-11 w-11 place-items-center" aria-label="Decrease quantity" onClick={() => step(-1)}><IconMinus size={18} /></button>
                  <input type="number" inputMode="numeric" min={1} max={MAX_QTY} value={qtyText} onChange={(e) => setQtyText(e.target.value.replace(/\D/g, ""))} onBlur={() => setQtyText(String(qty))} aria-labelledby="qty-label"
                    className="w-14 bg-transparent text-center font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                  <button className="grid h-11 w-11 place-items-center" aria-label="Increase quantity" onClick={() => step(1)}><IconPlus size={18} /></button>
                </div>
                <Button variant="primary" className="hidden h-12 px-8 text-base md:inline-flex" onClick={addToCart}>Add to cart</Button>
              </div>
              {p.unit === "meter" && <p className="mt-2 text-sm text-slate-600">Cut to length in one piece. For a full roll, see <Link to="/parts?category=hoses-tubing" className="link">hoses & tubing</Link>.</p>}
            </div>

            <div className="mt-6 rounded-card bg-hiq-sky p-4 text-[15px]">
              <p className="font-semibold">Fits</p>
              {fits.length ? (
                <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1">{fits.map((m) => <li key={m.slug}><Link to={`/product/${m.slug}`} className="link">{m.model}</Link></li>)}</ul>
              ) : p.compatibleModels.length ? (
                <p className="mt-1 text-slate-700">Selected HIQ models. <Link to="/contact" className="link">Ask us</Link> if it fits yours.</p>
              ) : (
                <p className="mt-1 text-slate-700">Standard systems that take this size. Check the size in the specifications, or <Link to="/contact" className="link">ask us</Link>.</p>
              )}
              {p.category === "filter-cartridges" && <p className="mt-2 text-slate-700">Looking for the filters made for your HIQ unit? <Link to="/filters" className="link">Find my filters</Link></p>}
            </div>
          </div>
        </div>
      </div>

      <div className="page grid gap-12 py-10 lg:grid-cols-[1fr_360px]">
        <section><h2 className="mb-4 text-2xl">Specifications</h2><SpecTable specs={p.specs} warranty={false} /></section>
        <aside className="h-fit space-y-4">
          <div className="rounded-card bg-hiq-sky p-5">
            <h2 className="text-lg">Buying in bulk?</h2>
            <p className="mt-1 text-[15px] text-slate-700">Resellers and installers can ask for pricing by the box.</p>
            <ButtonLink to="/business?interest=spare-parts#quote" variant="outline" className="mt-3">Request a bulk quote</ButtonLink>
          </div>
          <div className="rounded-card p-5 ring-1 ring-slate-200">
            <h2 className="text-lg">Want HIQ to fit it?</h2>
            <p className="mt-1 text-[15px] text-slate-700">A technician can check your system and replace the part.</p>
            <ButtonLink to="/service/book?service=maintenance" variant="outline" className="mt-3">Book a service visit</ButtonLink>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="bg-hiq-sky"><div className="page section">
          <h2 className="mb-6 text-2xl">More {partCategoryLabel(p.category).toLowerCase()}</h2>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{related.map((r) => <li key={r.slug}><PartCard p={r} /></li>)}</ul>
        </div></section>
      )}
      <StickyAddToCart name={qty > 1 ? `${qty} × ${p.name}` : p.name} price={p.price} label="Add to cart" onClick={addToCart} />
    </div>
  );
}
