import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CATEGORIES, NEEDS, products, shopProducts } from "../data/catalog";
import type { Product } from "../data/types";
import { ProductCard } from "../components/ProductCard";
import { Breadcrumbs, Button, ButtonLink, EmptyState, Select } from "../components/ui";
import { Modal } from "../components/Modal";
import { IconSliders, IconCompass } from "../components/Icons";
import { WaterTestNotice } from "../components/WaterTestNotice";
import { breadcrumbLd, useSeo } from "../lib/seo";
import { PhotoFrame } from "../components/PhotoFrame";
import { productPhoto } from "../data/images";

type Facets = { filtration: string[]; hotCold: boolean; install: string[]; use: string[]; channel: string[] };
const EMPTY: Facets = { filtration: [], hotCold: false, install: [], use: [], channel: [] };
const INSTALLS = ["Under the sink", "On the counter", "Freestanding", "Point of entry"];

function FacetPanel({ f, set, pool }: { f: Facets; set: (f: Facets) => void; pool: Product[] }) {
  const tog = (k: "filtration" | "install" | "use" | "channel", v: string) => set({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] });
  const Box = ({ k, v, label }: { k: "filtration" | "install" | "use" | "channel"; v: string; label?: string }) => (
    <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-[15px]">
      <input type="checkbox" className="h-5 w-5 accent-hiq-blue" checked={f[k].includes(v)} onChange={() => tog(k, v)} />{label ?? v}
    </label>
  );
  const installs = INSTALLS.filter((i) => pool.some((p) => p.install === i));
  return (
    <div className="space-y-6">
      <fieldset><legend className="mb-1 font-semibold">Price</legend><p className="text-sm text-slate-600">Price filters switch on once prices are confirmed.</p></fieldset>
      <fieldset><legend className="mb-1 font-semibold">Filtration type</legend>{["UF", "Nano", "RO", "UV"].map((v) => <Box key={v} k="filtration" v={v} />)}</fieldset>
      <fieldset><legend className="mb-1 font-semibold">Hot & cold</legend>
        <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-[15px]"><input type="checkbox" className="h-5 w-5 accent-hiq-blue" checked={f.hotCold} onChange={() => set({ ...f, hotCold: !f.hotCold })} />Hot & cold water</label>
      </fieldset>
      {installs.length > 1 && <fieldset><legend className="mb-1 font-semibold">Installation type</legend>{installs.map((v) => <Box key={v} k="install" v={v} />)}</fieldset>}
      <fieldset><legend className="mb-1 font-semibold">Home or office</legend><Box k="use" v="home" label="Home & condo" /><Box k="use" v="office" label="Office" /></fieldset>
      <fieldset><legend className="mb-1 font-semibold">Availability</legend><Box k="channel" v="shop" label="Buy or rent online" /><Box k="channel" v="quote" label="Quote only" />
        <p className="text-sm text-slate-600">Stock levels: <span className="tbc">[TBC]</span></p></fieldset>
    </div>
  );
}

export default function Shop() {
  const { category, need } = useParams();
  const [sp, setSp] = useSearchParams();
  const sort = sp.get("sort") ?? "featured";
  const [facets, setFacets] = useState<Facets>(EMPTY);
  const [drawer, setDrawer] = useState(false);
  const cat = CATEGORIES.find((c) => c.slug === category);
  const needInfo = NEEDS.find((n) => n.slug === need);

  const pool = useMemo(() => {
    if (cat) return products.filter((p) => p.category === cat.slug);
    if (needInfo) return products.filter((p) => p.needs.includes(needInfo.slug) && (needInfo.slug === "business" || p.channel === "shop"));
    return shopProducts;
  }, [cat, needInfo]);

  const list = useMemo(() => {
    let l = pool.filter((p) =>
      (!facets.filtration.length || facets.filtration.some((f) => p.filtration.includes(f as never))) &&
      (!facets.hotCold || p.hotCold) &&
      (!facets.install.length || facets.install.includes(p.install)) &&
      (!facets.use.length || facets.use.some((u) => (u === "home" ? p.needs.includes("home") || p.needs.includes("condo") : p.needs.includes("office")))) &&
      (!facets.channel.length || facets.channel.includes(p.channel)));
    const price = (p: Product) => p.price ?? Number.POSITIVE_INFINITY;
    if (sort === "price-asc") l = [...l].sort((a, b) => price(a) - price(b));
    if (sort === "price-desc") l = [...l].sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    if (sort === "featured" || sort === "best" || sort === "newest") l = [...l].sort((a, b) => (a.featured ?? 99) - (b.featured ?? 99));
    return l;
  }, [pool, facets, sort]);

  const title = cat?.label ?? (needInfo ? `Water systems for your ${needInfo.label.toLowerCase()}` : "All water filtration products");
  const intro = cat?.intro ?? (needInfo ? `Systems that suit a ${needInfo.label.toLowerCase()}. The right filtration still depends on your water, so HIQ checks it before installation.` : "Every HIQ system you can buy or rent online, plus replacement filters. Commercial and industrial systems are quote-only.");
  const path = cat ? `/shop/${cat.slug}` : needInfo ? `/shop/need/${needInfo.slug}` : "/shop";
  useSeo({ title, description: intro, path, jsonLd: breadcrumbLd([{ name: "Shop", path: "/shop" }, ...(cat || needInfo ? [{ name: title, path }] : [])]) });
  const active = facets.filtration.length + facets.install.length + facets.use.length + facets.channel.length + (facets.hotCold ? 1 : 0);

  if (category === "replacement-filters") {
    return (
      <div className="page py-8">
        <Breadcrumbs items={[{ label: "Shop", to: "/shop" }, { label: "Replacement filters" }]} />
        <h1 className="mt-4 text-[34px] sm:text-[44px]">Replacement filters</h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-700">{cat?.intro}</p>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {shopProducts.filter((p) => p.category !== "commercial" || p.slug === "hq9-high-flow").map((p) => (
            <li key={p.slug}><Link to={`/filters?model=${p.slug}`} className="block rounded-card bg-white p-3 ring-1 ring-slate-200 hover:ring-hiq-blue">
              <PhotoFrame slot={productPhoto(p)} ratio="aspect-square" /><span className="mt-2 block font-semibold">{p.model}</span><span className="text-sm text-slate-600">See filters</span>
            </Link></li>
          ))}
        </ul>
      </div>
    );
  }
  if (category && !cat) return <div className="page py-16"><EmptyState title="We couldn't find that category" body="It may have moved. Browse all products instead." action={<ButtonLink to="/shop">See all products</ButtonLink>} /></div>;

  return (
    <div className="page py-8">
      <Breadcrumbs items={[{ label: "Shop", to: cat || needInfo ? "/shop" : undefined }, ...(cat || needInfo ? [{ label: cat?.label ?? needInfo!.label }] : [])]} />
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-end">
        <div><h1 className="text-[34px] sm:text-[44px]">{title}</h1><p className="mt-3 max-w-2xl text-lg text-slate-700">{intro}</p></div>
        <Link to="/find-my-system" className="flex gap-3 rounded-card bg-hiq-sky p-4 ring-1 ring-hiq-water hover:ring-hiq-blue">
          <IconCompass className="mt-0.5 shrink-0 text-hiq-blue" /><span><span className="block font-semibold">Not sure? Find My System</span><span className="text-[15px] text-slate-700">Six questions about your space and your water.</span></span>
        </Link>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3 border-y border-slate-200 py-3">
        <button onClick={() => setDrawer(true)} className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 font-semibold ring-1 ring-slate-300 lg:hidden"><IconSliders size={18} />Filters{active ? ` (${active})` : ""}</button>
        <p className="hidden text-[15px] text-slate-600 lg:block" aria-live="polite">{list.length} product{list.length === 1 ? "" : "s"}</p>
        <label className="flex items-center gap-2 text-[15px]"><span className="hidden sm:inline">Sort by</span>
          <Select value={sort} onChange={(e) => setSp({ sort: e.target.value })} className="w-auto" aria-label="Sort products">
            <option value="featured">Featured</option><option value="best">Best selling</option><option value="price-asc">Price, low to high</option><option value="price-desc">Price, high to low</option><option value="newest">Newest</option>
          </Select>
        </label>
      </div>
      {(sort !== "featured") && <p className="mt-2 text-sm text-slate-600">Sales and price data aren't available yet, so this sort uses the featured order for now.</p>}

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block" aria-label="Filter products"><FacetPanel f={facets} set={setFacets} pool={pool} />
          {active > 0 && <button className="link mt-4" onClick={() => setFacets(EMPTY)}>Clear all filters</button>}
          <div className="mt-8"><WaterTestNotice compact /></div>
        </aside>
        <div>
          {list.length ? (
            <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3">{list.map((p) => <li key={p.slug}><ProductCard p={p} /></li>)}</ul>
          ) : (
            <EmptyState title="No products match these filters" body="Remove a filter to see more, or let us match a system to your water." action={<div className="flex justify-center gap-2"><Button variant="outline" onClick={() => setFacets(EMPTY)}>Clear filters</Button><ButtonLink to="/find-my-system">Find My System</ButtonLink></div>} />
          )}
        </div>
      </div>

      <Modal open={drawer} onClose={() => setDrawer(false)} title="Filter products" side="bottom">
        <FacetPanel f={facets} set={setFacets} pool={pool} />
        <div className="sticky bottom-0 -mx-5 mt-6 flex gap-2 border-t border-slate-200 bg-white px-5 py-3">
          <Button variant="outline" onClick={() => setFacets(EMPTY)}>Clear</Button>
          <Button variant="secondary" full onClick={() => setDrawer(false)}>Show {list.length} result{list.length === 1 ? "" : "s"}</Button>
        </div>
      </Modal>
    </div>
  );
}
