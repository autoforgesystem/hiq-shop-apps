import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PART_CATEGORIES, getProduct, parts, products } from "../data/catalog";
import type { PartCategory } from "../data/types";
import { PartCard } from "../components/PartCard";
import { Breadcrumbs, ButtonLink, EmptyState, Input, Select } from "../components/ui";
import { breadcrumbLd, useSeo } from "../lib/seo";
import { cx } from "../lib/format";

export default function Parts() {
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState("");
  const category = PART_CATEGORIES.find((c) => c.slug === sp.get("category"));
  const model = getProduct(sp.get("model") ?? "");
  const setParam = (k: string, v: string) => { const n = new URLSearchParams(sp); if (v) n.set(k, v); else n.delete(k); setSp(n, { replace: true }); };
  useSeo({
    title: category ? `${category.label} for water filters` : "Spare parts, fittings and tubing for water filters",
    description: category?.intro ?? "Fittings, tubing, faucets, valves, housings and general-purpose filter cartridges for water filtration systems, from HIQ Philippines.",
    path: category ? `/parts?category=${category.slug}` : "/parts",
    jsonLd: breadcrumbLd([{ name: "Spare parts", path: "/parts" }, ...(category ? [{ name: category.label, path: `/parts?category=${category.slug}` }] : [])]),
  });

  const counts = useMemo(() => new Map(PART_CATEGORIES.map((c) => [c.slug, parts.filter((p) => p.category === c.slug).length])), [parts]);
  // Only models that some part is listed for, so the filter never leads to an empty page.
  const models = useMemo(() => products.filter((m) => parts.some((p) => p.compatibleModels.includes(m.slug))), [parts, products]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return parts.filter((p) =>
      (!category || p.category === category.slug) &&
      (!model || p.compatibleModels.includes(model.slug)) &&
      (!s || [p.name, p.sku, p.description, ...Object.values(p.specs)].join(" ").toLowerCase().includes(s)));
  }, [category, model, q, parts]);

  const chip = (slug: PartCategory | "", label: string, n: number) => (
    <li key={slug || "all"}>
      <button onClick={() => setParam("category", slug)} aria-pressed={(category?.slug ?? "") === slug}
        className={cx("inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 text-[15px] font-semibold ring-1",
          (category?.slug ?? "") === slug ? "bg-hiq-navy text-white ring-hiq-navy" : "bg-white ring-slate-300 hover:ring-hiq-blue")}>
        {label}<span className="text-sm font-normal opacity-75">{n}</span>
      </button>
    </li>
  );

  return (
    <div className="page py-8">
      <Breadcrumbs items={[{ label: "Spare parts", to: category ? "/parts" : undefined }, ...(category ? [{ label: category.label }] : [])]} />
      <h1 className="mt-4 text-[34px] sm:text-[44px]">{category ? category.label : "Spare parts"}</h1>
      <p className="mt-2 max-w-[68ch] text-[17px] text-slate-700">
        {category?.intro ?? "Fittings, tubing, faucets, valves, housings and general-purpose filter cartridges. Each size is listed separately, so check your tube or thread size before ordering."}
      </p>
      {(!category || category.slug === "filter-cartridges") && (
        <p className="mt-3 text-[15px]">Need filters made for your HIQ unit? <Link to="/filters" className="link">Find my filters</Link></p>
      )}

      <ul className="mt-6 flex flex-wrap gap-2" aria-label="Part categories">
        {chip("", "All parts", parts.length)}
        {PART_CATEGORIES.filter((c) => counts.get(c.slug)).map((c) => chip(c.slug, c.label, counts.get(c.slug)!))}
      </ul>

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
        <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder='Search, e.g. "1/4 elbow" or "sediment"' aria-label="Search spare parts" />
        {models.length > 0 && (
          <Select value={model?.slug ?? ""} onChange={(e) => setParam("model", e.target.value)} aria-label="Fits my model" className="sm:w-60">
            <option value="">Any system</option>
            {models.map((m) => <option key={m.slug} value={m.slug}>Fits {m.model}</option>)}
          </Select>
        )}
      </div>

      {list.length === 0 ? (
        <div className="mt-8"><EmptyState title="No parts match" body="Try a different search or category, or ask us which part you need."
          action={<ButtonLink to="/parts" onClick={() => setQ("")}>See all parts</ButtonLink>} /></div>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{list.map((p) => <li key={p.slug}><PartCard p={p} /></li>)}</ul>
      )}
      <p className="mt-3 text-sm text-slate-600" aria-live="polite">{list.length} of {parts.length} parts</p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-card bg-hiq-sky p-5">
          <h2 className="text-lg">Buying in bulk to resell or install?</h2>
          <p className="mt-1 text-[15px] text-slate-700">Ask for reseller pricing on cartridges, tubing and fittings by the box.</p>
          <ButtonLink to="/business?interest=spare-parts#quote" variant="outline" className="mt-3">Request a bulk quote</ButtonLink>
        </div>
        <div className="rounded-card p-5 ring-1 ring-slate-200">
          <h2 className="text-lg">Not sure which part you need?</h2>
          <p className="mt-1 text-[15px] text-slate-700">Tell us about your system, or have an HIQ technician check it and fit the part for you.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <ButtonLink to="/contact" variant="outline">Ask us</ButtonLink>
            <ButtonLink to="/service/book?service=maintenance" variant="ghost">Book a service visit</ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
