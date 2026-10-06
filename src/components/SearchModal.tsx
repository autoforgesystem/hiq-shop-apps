import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Modal } from "./Modal";
import { products } from "../data/catalog";
import { ARTICLES } from "../data/guide";
import { Input } from "./ui";
import { track } from "../lib/analytics";

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const res = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return { p: [], a: [] };
    return {
      p: products.filter((p) => [p.model, p.category, p.summary, ...p.filtration].join(" ").toLowerCase().includes(s)).slice(0, 6),
      a: ARTICLES.filter((a) => a.published && (a.title + a.description).toLowerCase().includes(s)).slice(0, 4),
    };
  }, [q]);
  return (
    <Modal open={open} onClose={onClose} title="Search the shop">
      <form role="search" onSubmit={(e) => { e.preventDefault(); track("search", { search_term: q }); }}>
        <label htmlFor="site-search" className="sr-only">Search products and guides</label>
        <Input id="site-search" autoFocus type="search" placeholder="Try “RO”, “dispenser” or “HW-110”" value={q}
          onChange={(e) => setQ(e.target.value)} onBlur={() => q && track("search", { search_term: q })} />
      </form>
      <div className="mt-4 space-y-5">
        {res.p.length > 0 && <section><h3 className="mb-2 text-sm text-slate-600">Products</h3><ul className="space-y-1">{res.p.map((p) => (
          <li key={p.slug}><Link onClick={onClose} to={`/product/${p.slug}`} className="flex min-h-[44px] items-center justify-between rounded-lg px-3 hover:bg-hiq-sky"><span className="font-semibold">{p.model}</span><span className="text-sm text-slate-600">{p.filtration.join(" · ")}</span></Link></li>
        ))}</ul></section>}
        {res.a.length > 0 && <section><h3 className="mb-2 text-sm text-slate-600">Water Quality Guide</h3><ul className="space-y-1">{res.a.map((a) => (
          <li key={a.slug}><Link onClick={onClose} to={`/guide/${a.slug}`} className="flex min-h-[44px] items-center rounded-lg px-3 hover:bg-hiq-sky">{a.title}</Link></li>
        ))}</ul></section>}
        {q.trim().length >= 2 && !res.p.length && !res.a.length && <p className="text-slate-700">No matches for “{q}”. Try a model number, or <Link onClick={onClose} to="/find-my-system" className="link">answer six questions</Link> to find your system.</p>}
      </div>
    </Modal>
  );
}
