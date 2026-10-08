import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Badge, ButtonLink, EmptyState, Input, Select, Tbc } from "../../components/ui";
import { useToast } from "../../components/Toast";
import { catalogAdmin, useCatalog } from "../../data/catalogStore";
import { PART_CATEGORIES, PART_UNIT_LABEL, TBC_PART_SKU, partCategoryLabel } from "../../data/catalog";
import type { SparePart } from "../../data/types";
import { formatPHP } from "../../lib/format";
import { ConfirmDialog, PageHeader, Thumb } from "./adminUi";

export default function AdminParts() {
  const { parts, products } = useCatalog();
  const toast = useToast();
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState("");
  const [deleting, setDeleting] = useState<SparePart | null>(null);
  const cat = sp.get("category") ?? "";
  const show = sp.get("show") ?? "all";
  const setParam = (k: string, v: string) => { const n = new URLSearchParams(sp); if (v) n.set(k, v); else n.delete(k); setSp(n, { replace: true }); };
  const modelName = (slug: string) => products.find((p) => p.slug === slug)?.model ?? slug;

  const list = parts.filter((p) =>
    (!cat || p.category === cat) &&
    (show === "all" || (show === "hidden" ? p.hidden : !p.hidden)) &&
    (!q || `${p.name} ${p.sku} ${p.slug}`.toLowerCase().includes(q.toLowerCase())));

  const toggleHidden = async (p: SparePart) => {
    try {
      await catalogAdmin.savePart({ ...p, hidden: !p.hidden || undefined }, p.slug);
      toast.show(p.hidden ? `${p.name} is now shown on the shop` : `${p.name} is now hidden from the shop`);
    } catch (e) { toast.show((e as Error).message, { tone: "error" }); }
  };

  return (
    <>
      <PageHeader title="Spare parts" intro="Fittings, tubing, faucets, valves, housings and general-purpose cartridges. Filters made for one HIQ model belong under Replacement filters."
        actions={<ButtonLink to="/admin/parts/new" variant="primary">Add a spare part</ButtonLink>} />
      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <Input type="search" placeholder="Search by name or SKU" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search spare parts" />
        <Select value={cat} onChange={(e) => setParam("category", e.target.value)} aria-label="Category" className="sm:w-56">
          <option value="">All categories</option>
          {PART_CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
        </Select>
        <Select value={show} onChange={(e) => setParam("show", e.target.value === "all" ? "" : e.target.value)} aria-label="Visibility" className="sm:w-44">
          <option value="all">Shown and hidden</option><option value="shown">Shown only</option><option value="hidden">Hidden only</option>
        </Select>
      </div>

      {list.length === 0 ? (
        <EmptyState title="No spare parts found" body={parts.length ? "Try a different search or category." : "Add your first spare part to get started."} action={<ButtonLink to="/admin/parts/new">Add a spare part</ButtonLink>} />
      ) : (
        <ul className="space-y-2">
          {list.map((p) => (
            <li key={p.slug} className="grid grid-cols-[64px_1fr] items-center gap-x-4 gap-y-3 rounded-card bg-white p-3 ring-1 ring-slate-200 sm:grid-cols-[72px_1fr_auto]">
              <Link to={`/admin/parts/${p.slug}`} className="block"><Thumb src={p.images[0]?.src} alt={p.name} /></Link>
              <div className="min-w-0">
                <Link to={`/admin/parts/${p.slug}`} className="font-display text-lg font-bold text-hiq-navy hover:text-hiq-blue">{p.name}</Link>
                <p className="text-sm text-slate-600">
                  {partCategoryLabel(p.category)} · SKU {p.sku === TBC_PART_SKU ? <Tbc>SKU TBC</Tbc> : p.sku} · {p.price != null ? `${formatPHP(p.price)} ${PART_UNIT_LABEL[p.unit]}` : <Tbc>PRICE TBC</Tbc>}
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {p.hidden ? <Badge tone="slate">Hidden</Badge> : <Badge tone="green">On the shop</Badge>}
                  {p.compatibleModels.length ? p.compatibleModels.map((s) => <Badge key={s} tone="slate">{modelName(s)}</Badge>) : <Badge tone="slate">Fits any system</Badge>}
                  {!p.images.length && <Badge tone="amber">No photos</Badge>}
                </div>
              </div>
              <div className="col-span-2 flex flex-wrap gap-1 sm:col-span-1 sm:justify-end">
                <ButtonLink to={`/admin/parts/${p.slug}`} variant="outline" className="min-h-[40px] px-4">Edit</ButtonLink>
                <button onClick={() => void toggleHidden(p)} className="min-h-[40px] rounded-full px-4 text-[15px] font-semibold text-hiq-blue hover:bg-hiq-sky">{p.hidden ? "Show" : "Hide"}</button>
                {!p.hidden && <a href={`/parts/${p.slug}`} target="_blank" rel="noopener" className="inline-flex min-h-[40px] items-center rounded-full px-4 text-[15px] font-semibold text-hiq-blue hover:bg-hiq-sky">View<span className="sr-only"> {p.name} on the shop (new tab)</span></a>}
                <button onClick={() => setDeleting(p)} className="min-h-[40px] rounded-full px-4 text-[15px] font-semibold text-error hover:bg-red-50">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-sm text-slate-600">{list.length} of {parts.length} spare parts</p>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title="Delete this spare part?" confirmLabel="Delete part"
        body={<p>This permanently removes <strong>{deleting?.name}</strong> and its photos. Past orders keep the part's name. If you only want to take it off the shop for now, use <strong>Hide</strong> instead.</p>}
        onConfirm={async () => {
          if (!deleting) return;
          try { await catalogAdmin.deletePart(deleting.slug); toast.show(`${deleting.name} deleted`); }
          catch (e) { toast.show((e as Error).message, { tone: "error" }); }
        }} />
    </>
  );
}
