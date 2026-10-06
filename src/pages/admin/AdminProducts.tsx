import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Badge, ButtonLink, EmptyState, Input, Select, Tbc } from "../../components/ui";
import { useToast } from "../../components/Toast";
import { catalogAdmin, useCatalog } from "../../data/catalogStore";
import { categoryLabel } from "../../data/catalog";
import type { Product } from "../../data/types";
import { formatPHP } from "../../lib/format";
import { ConfirmDialog, PageHeader, Thumb } from "./adminUi";
import { CATEGORY_OPTIONS } from "./productForm";

export default function AdminProducts() {
  const { products } = useCatalog();
  const toast = useToast();
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState("");
  const [deleting, setDeleting] = useState<Product | null>(null);
  const cat = sp.get("category") ?? "";
  const show = sp.get("show") ?? "all";
  const setParam = (k: string, v: string) => { const n = new URLSearchParams(sp); if (v) n.set(k, v); else n.delete(k); setSp(n, { replace: true }); };

  const list = products.filter((p) =>
    (!cat || p.category === cat) &&
    (show === "all" || (show === "hidden" ? p.hidden : !p.hidden)) &&
    (!q || `${p.model} ${p.slug} ${p.summary}`.toLowerCase().includes(q.toLowerCase())));

  const toggleHidden = async (p: Product) => {
    try {
      await catalogAdmin.saveProduct({ ...p, hidden: !p.hidden }, p.slug);
      toast.show(p.hidden ? `${p.model} is now shown on the shop` : `${p.model} is now hidden from the shop`);
    } catch (e) { toast.show((e as Error).message, { tone: "error" }); }
  };

  return (
    <>
      <PageHeader title="Products" intro="Add new products, change prices and photos, or hide a product from the shop without deleting it."
        actions={<ButtonLink to="/admin/products/new" variant="primary">Add a product</ButtonLink>} />
      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <Input type="search" placeholder="Search by model name" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
        <Select value={cat} onChange={(e) => setParam("category", e.target.value)} aria-label="Category" className="sm:w-56">
          <option value="">All categories</option>
          {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </Select>
        <Select value={show} onChange={(e) => setParam("show", e.target.value === "all" ? "" : e.target.value)} aria-label="Visibility" className="sm:w-44">
          <option value="all">Shown and hidden</option><option value="shown">Shown only</option><option value="hidden">Hidden only</option>
        </Select>
      </div>

      {list.length === 0 ? (
        <EmptyState title="No products found" body={products.length ? "Try a different search or category." : "Add your first product to get started."} action={<ButtonLink to="/admin/products/new">Add a product</ButtonLink>} />
      ) : (
        <ul className="space-y-2">
          {list.map((p) => (
            <li key={p.slug} className="grid grid-cols-[64px_1fr] items-center gap-x-4 gap-y-3 rounded-card bg-white p-3 ring-1 ring-slate-200 sm:grid-cols-[72px_1fr_auto]">
              <Link to={`/admin/products/${p.slug}`} className="block"><Thumb src={p.images?.[0]?.src} alt={p.model} /></Link>
              <div className="min-w-0">
                <Link to={`/admin/products/${p.slug}`} className="font-display text-lg font-bold text-hiq-navy hover:text-hiq-blue">{p.model}</Link>
                <p className="text-sm text-slate-600">{categoryLabel(p.category)} · {p.channel === "quote" ? "Price on quote" : p.price != null ? formatPHP(p.price) : <Tbc>PRICE TBC</Tbc>}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {p.hidden ? <Badge tone="slate">Hidden</Badge> : <Badge tone="green">On the shop</Badge>}
                  {p.channel === "quote" && <Badge>Quote only</Badge>}
                  {!p.images?.length && <Badge tone="amber">No photos</Badge>}
                </div>
              </div>
              <div className="col-span-2 flex flex-wrap gap-1 sm:col-span-1 sm:justify-end">
                <ButtonLink to={`/admin/products/${p.slug}`} variant="outline" className="min-h-[40px] px-4">Edit</ButtonLink>
                <button onClick={() => void toggleHidden(p)} className="min-h-[40px] rounded-full px-4 text-[15px] font-semibold text-hiq-blue hover:bg-hiq-sky">{p.hidden ? "Show" : "Hide"}</button>
                {!p.hidden && <a href={`/product/${p.slug}`} target="_blank" rel="noopener" className="inline-flex min-h-[40px] items-center rounded-full px-4 text-[15px] font-semibold text-hiq-blue hover:bg-hiq-sky">View<span className="sr-only"> {p.model} on the shop (new tab)</span></a>}
                <button onClick={() => setDeleting(p)} className="min-h-[40px] rounded-full px-4 text-[15px] font-semibold text-error hover:bg-red-50">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-sm text-slate-600">{list.length} of {products.length} products</p>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title="Delete this product?" confirmLabel="Delete product"
        body={<p>This permanently removes <strong>{deleting?.model}</strong> and its photos. If you only want to take it off the shop for now, use <strong>Hide</strong> instead.</p>}
        onConfirm={async () => {
          if (!deleting) return;
          try { await catalogAdmin.deleteProduct(deleting.slug); toast.show(`${deleting.model} deleted`); }
          catch (e) { toast.show((e as Error).message, { tone: "error" }); }
        }} />
    </>
  );
}
