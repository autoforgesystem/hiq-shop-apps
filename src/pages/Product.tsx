import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { categoryLabel, filtersFor, getProduct, partsFor, products } from "../data/catalog";
import { productPhoto } from "../data/images";
import { Gallery } from "../components/Gallery";
import { Badge, Breadcrumbs, Button, ButtonLink, EmptyState, FiltrationChip, PriceTag, Tbc } from "../components/ui";
import { BuyRentToggle, type Mode } from "../components/BuyRentToggle";
import { WaterTestNotice } from "../components/WaterTestNotice";
import { SpecTable } from "../components/SpecTable";
import { FAQAccordion, faqLd } from "../components/FAQAccordion";
import { ProductCard } from "../components/ProductCard";
import { PartCard } from "../components/PartCard";
import { StickyAddToCart } from "../components/StickyAddToCart";
import { useCommerce } from "../commerce/CommerceContext";
import { IconCheck, IconWrench } from "../components/Icons";
import { breadcrumbLd, useSeo } from "../lib/seo";
import { track } from "../lib/analytics";
import { SHOP_URL } from "../config/site";
import { ARTICLES } from "../data/guide";
import { cx } from "../lib/format";

const STAGE_TEXT: Record<string, string> = {
  UF: "Ultrafiltration — for water that's already fairly well treated.",
  Nano: "Nano — finer than UF, and can help with harder water.",
  RO: "Reverse osmosis — the deepest purification; uses a pump and releases some wastewater.",
  UV: "An added ultraviolet stage built into this model.",
  Alkaline: "An optional alkaline stage.",
};

export default function ProductPage() {
  const { slug = "" } = useParams();
  const p = getProduct(slug);
  const nav = useNavigate();
  const { add } = useCommerce();
  const [config, setConfig] = useState(p?.configurations[0] ?? "");
  const [mode, setMode] = useState<Mode>("buy");
  const [install, setInstall] = useState(true);
  useEffect(() => { if (p) { setConfig(p.configurations[0]); track("view_item", { item_id: p.slug, item_name: p.model, item_category: p.category }); } }, [p?.slug]);

  const faqs = p ? [
    { q: `Which filtration should I choose for the ${p.model}?`, a: "It depends on your measured water quality. HIQ usually recommends UF for 0–150 ppm TDS, Nano for 151–190 ppm and RO above 190 ppm or for deep wells, and confirms with a water report or site visit." },
    { q: "Is installation included?", a: "HIQ's service department installs all purchased and rented direct-plumbed, bottleless systems. The installation fee is being confirmed [TBC]." },
    { q: "Can I rent instead of buying?", a: "Yes. Rental is a fixed monthly fee on a minimum two-year contract, with regular service and consumables included, subject to financial approval. Request a rental quote to get your price." },
  ] : [];
  useSeo({
    title: p ? `${p.model} ${categoryLabel(p.category).replace(/s$/, "")}` : "Product not found",
    description: p ? `${p.summary} Filtration: ${p.filtration.join(", ")}. Installation and service by HIQ Philippines.` : "This product could not be found.",
    path: `/product/${slug}`,
    jsonLd: p ? [
      { "@context": "https://schema.org", "@type": "Product", name: p.model, description: p.summary, brand: { "@type": "Brand", name: "HIQ" }, category: categoryLabel(p.category), url: `${SHOP_URL}/product/${p.slug}` },
      breadcrumbLd([{ name: "Shop", path: "/shop" }, { name: categoryLabel(p.category), path: `/shop/${p.category}` }, { name: p.model, path: `/product/${p.slug}` }]),
      faqLd(faqs),
    ] : undefined,
  });

  if (!p) return <div className="page py-16"><EmptyState title="We couldn't find that product" body="It may have been renamed. Browse the shop or search for your model." action={<ButtonLink to="/shop">Browse products</ButtonLink>} /></div>;
  const quote = p.channel === "quote";
  const tdsApplies = p.tdsLimit && /UF|Nano/.test(config);
  const pf = filtersFor(p.slug);
  const spareParts = partsFor(p.slug);
  const related = products.filter((x) => x.slug !== p.slug && x.channel === "shop" && (x.category === p.category || x.needs.some((n) => p.needs.includes(n)))).slice(0, 3);
  const guide = ARTICLES.filter((a) => a.published && a.related.includes(p.slug)).slice(0, 2);
  const cta = () => {
    if (quote) return nav(`/business?interest=${p.slug}#quote`);
    if (mode === "rent") return nav(`/rent?unit=${encodeURIComponent(p.model)}#request`);
    add(p.slug, 1, { configuration: config, installation: install ? "Yes" : "No" });
  };
  const ctaLabel = quote ? "Request a quote" : mode === "rent" ? "Request a rental quote" : "Add to cart";

  return (
    <div className="pb-28 md:pb-0">
      <div className="page py-6">
        <Breadcrumbs items={[{ label: "Shop", to: "/shop" }, { label: categoryLabel(p.category), to: quote ? "/business" : `/shop/${p.category}` }, { label: p.model }]} />
        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <Gallery key={p.slug} slots={p.images?.length ? p.images.map((_, i) => productPhoto(p, i))
            : [productPhoto(p), { label: `${p.model} installed in a kitchen`, alt: `${p.model} installed` }, { label: `${p.model} detail`, alt: `${p.model} detail` }]} />
          <div>
            <div className="flex flex-wrap gap-1.5">{p.filtration.map((f) => <FiltrationChip key={f} f={f} />)}</div>
            <h1 className="mt-3 text-[34px] sm:text-[42px]">{p.model}</h1>
            <p className="mt-1 text-[15px] text-slate-600">{categoryLabel(p.category)}</p>
            <p className="mt-4 text-lg text-slate-700">{p.summary}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3"><PriceTag price={p.price} size="lg" quote={quote} />{!quote && <span className="text-[15px] text-slate-600">Availability: <Tbc /></span>}</div>

            {p.configurations.length > 1 && (
              <fieldset className="mt-6">
                <legend className="mb-2 font-semibold">Filtration configuration</legend>
                <div className="flex flex-wrap gap-2" role="radiogroup">
                  {p.configurations.map((c) => (
                    <button key={c} role="radio" aria-checked={config === c} onClick={() => setConfig(c)}
                      className={cx("min-h-[44px] rounded-full px-4 text-[15px] font-semibold ring-1", config === c ? "bg-hiq-navy text-white ring-hiq-navy" : "bg-hiq-water/60 ring-hiq-water hover:ring-hiq-blue")}>{c}</button>
                  ))}
                </div>
              </fieldset>
            )}
            <div className="mt-4">{tdsApplies ? <WaterTestNotice limit={p.tdsLimit} /> : <WaterTestNotice compact />}</div>

            {!quote && (
              <div className="mt-6 space-y-4">
                <BuyRentToggle value={mode} onChange={setMode} />
                {mode === "rent" ? (
                  <p className="rounded-card bg-hiq-sky p-4 text-[15px]">Fixed monthly fee · minimum two-year contract · regular service and consumables included · priced by unit and number of users · subject to financial approval. Monthly fee: <Tbc>QUOTE</Tbc></p>
                ) : (
                  <label className="flex min-h-[56px] cursor-pointer items-center gap-3 rounded-card p-3 ring-1 ring-slate-200">
                    <input type="checkbox" className="h-5 w-5 accent-hiq-blue" checked={install} onChange={() => setInstall(!install)} />
                    <span className="flex-1"><span className="block font-semibold">Add professional installation by HIQ</span><span className="text-sm text-slate-600">Fee <span className="tbc">[TBC]</span> · HIQ calls to schedule</span></span>
                    <IconWrench className="text-hiq-blue" />
                  </label>
                )}
              </div>
            )}
            <div className="mt-6 hidden md:block"><Button variant={quote || mode === "rent" ? "secondary" : "primary"} className="h-12 px-8 text-base" onClick={cta}>{ctaLabel}</Button></div>
            <div className="mt-6 flex flex-wrap gap-2"><Badge><IconWrench size={14} />Installed and serviced by HIQ</Badge><Badge tone="slate">Warranty <span className="tbc ml-1">[TBC]</span></Badge></div>
          </div>
        </div>
      </div>

      <div className="page grid gap-12 py-12 lg:grid-cols-[1fr_360px]">
        <div className="space-y-12">
          <section><h2 className="mb-4 text-2xl">Why you'll like it</h2>
            <ul className="grid gap-3 sm:grid-cols-2">{p.highlights.map((h) => <li key={h} className="flex gap-2 text-[17px]"><IconCheck className="mt-0.5 shrink-0 text-hiq-blue" />{h}</li>)}</ul>
          </section>
          <section><h2 className="mb-4 text-2xl">How the filtration works</h2>
            <ol className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <li className="rounded-card bg-slate-100 p-4 sm:w-32"><p className="font-semibold">Your supply</p><p className="text-sm text-slate-600">Water in</p></li>
              {p.filtration.map((f) => <li key={f} className="flex-1 rounded-card bg-hiq-sky p-4 ring-1 ring-hiq-water"><FiltrationChip f={f} /><p className="mt-2 text-[15px] text-slate-700">{STAGE_TEXT[f]}</p></li>)}
              <li className="rounded-card bg-hiq-blue p-4 text-white sm:w-32"><p className="font-semibold">Your glass</p><p className="text-sm text-white/80">Filtered water out</p></li>
            </ol>
            <p className="mt-3 text-sm text-slate-600">Simplified diagram. Stage details for this model: <span className="tbc">[TBC]</span></p>
          </section>
          <section><h2 className="mb-4 text-2xl">Specifications</h2><SpecTable specs={p.specs} /></section>
          <section><h2 className="mb-3 text-2xl">Installation</h2>
            <p className="max-w-[68ch] text-[17px] text-slate-700">{quote ? "HIQ assesses your site and sizes the system before quoting." : `HIQ's service department installs the ${p.model}. Before installation, HIQ asks for a water-quality report or tests your water on a site visit.`} Installation fee and service areas: <span className="tbc">[TBC]</span></p>
            <Link to="/service" className="link mt-2 inline-block">Installation & service</Link>
          </section>
          {pf.length > 0 && (
            <section><h2 className="mb-4 text-2xl">Compatible filters and replacement schedule</h2>
              <ul className="divide-y divide-slate-200 rounded-card ring-1 ring-slate-200">{pf.map((f) => (
                <li key={f.name} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"><span><span className="font-semibold">{f.stage}</span><span className="block text-sm text-slate-600">{f.sku}</span></span><span className="text-sm">Every <span className="tbc">[TBC]</span> months</span></li>
              ))}</ul>
              <Link to={`/filters?model=${p.slug}`} className="link mt-3 inline-block">Shop filters for the {p.model}</Link>
            </section>
          )}
          {spareParts.length > 0 && (
            <section><h2 className="mb-4 text-2xl">Spare parts for the {p.model}</h2>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">{spareParts.slice(0, 6).map((sp) => <li key={sp.slug}><PartCard p={sp} /></li>)}</ul>
              <Link to={`/parts?model=${p.slug}`} className="link mt-3 inline-block">All spare parts for the {p.model}</Link>
            </section>
          )}
          <section><h2 className="mb-3 text-2xl">Warranty</h2><p className="text-[17px] text-slate-700">Warranty period: <Tbc>WARRANTY TBC</Tbc>. <Link to="/warranty-policy" className="link">Warranty policy</Link></p></section>
          <section><h2 className="mb-4 text-2xl">Questions</h2><FAQAccordion items={faqs} /></section>
        </div>
        <aside className="space-y-4">
          <div className="rounded-card bg-hiq-sky p-5"><h2 className="text-lg">Learn before you buy</h2>
            <ul className="mt-2 space-y-1">{(guide.length ? guide : ARTICLES.filter((a) => a.published).slice(0, 2)).map((a) => <li key={a.slug}><Link to={`/guide/${a.slug}`} className="link">{a.title}</Link></li>)}</ul>
          </div>
          <div className="rounded-card p-5 ring-1 ring-slate-200"><h2 className="text-lg">Still deciding?</h2><p className="mt-1 text-[15px] text-slate-700">Answer six questions and compare your matches.</p><ButtonLink to="/find-my-system" variant="outline" className="mt-3">Find My System</ButtonLink></div>
        </aside>
      </div>

      {related.length > 0 && <section className="bg-hiq-sky"><div className="page section"><h2 className="mb-6 text-2xl">Related products</h2><ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{related.map((r) => <li key={r.slug}><ProductCard p={r} /></li>)}</ul></div></section>}
      <StickyAddToCart name={p.model} price={p.price} label={ctaLabel} onClick={cta} />
    </div>
  );
}
