import { lazy, Suspense, useState, type FormEvent } from "react";
import { Link, NavLink, Route, Routes } from "react-router-dom";
import { Button, ButtonLink, FormField, Input } from "../../components/ui";
import { IconExternal } from "../../components/Icons";
import { LogoMark } from "../../components/Logo";
import { useCatalog, repository, loadCatalog } from "../../data/catalogStore";
import { api, tokens, useApi } from "../../lib/api";
import { PHOTO_DEFAULTS, PHOTO_PLACES, type PhotoKey } from "../../data/images";
import { useSeo } from "../../lib/seo";
import { cx } from "../../lib/format";
import { Card, PageHeader } from "./adminUi";

const AdminProducts = lazy(() => import("./AdminProducts"));
const ProductEditor = lazy(() => import("./ProductEditor"));
const AdminFilters = lazy(() => import("./AdminFilters"));
const AdminParts = lazy(() => import("./AdminParts"));
const PartEditor = lazy(() => import("./PartEditor"));
const AdminPhotos = lazy(() => import("./AdminPhotos"));
const AdminData = lazy(() => import("./AdminData"));

/**
 * With VITE_API_URL set, admins sign in with their account on the HIQ API, which checks every change.
 * Otherwise this is a DEMO SIGN-IN: the password sits in the browser bundle, so it keeps casual visitors out
 * of the screens but is not security (docs/ADMIN.md).
 */
const DEMO_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "hiq-admin";
const SESSION_KEY = "hiq-admin-session";
const readSession = () => {
  if (useApi) return !!tokens.get("admin");
  try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
};

function SignIn({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (useApi) {
      setBusy(true);
      try {
        const r = await api<{ token: string }>("/admin/auth/login", { body: { email, password: pw } });
        tokens.set("admin", r.token, false); // admin sessions end when the tab closes
        await loadCatalog(); // now includes hidden products
        onDone();
      } catch (x) { setError((x as Error).message); } finally { setBusy(false); }
      return;
    }
    if (pw !== DEMO_PASSWORD) return setError("That password isn't right. Please try again.");
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* still let them in for this page view */ }
    onDone();
  };
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-hiq-sky px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lift sm:p-8">
        <LogoMark size={48} />
        <h1 className="mt-3 text-[28px]">Shop admin</h1>
        <p className="mt-2 text-[15px] text-slate-600">Sign in to manage products, filters, spare parts and photos.</p>
        {useApi && <div className="mt-6"><FormField label="Email" id="admin-email">
          <Input id="admin-email" type="email" autoComplete="username" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} autoFocus />
        </FormField></div>}
        <div className={useApi ? "mt-4" : "mt-6"}><FormField label="Password" id="admin-pw" error={error}>
          <Input id="admin-pw" type="password" autoComplete="current-password" value={pw} onChange={(e) => { setPw(e.target.value); setError(""); }} autoFocus={!useApi} aria-invalid={!!error} aria-describedby={error ? "admin-pw-err" : undefined} />
        </FormField></div>
        <Button type="submit" full className="mt-5" disabled={busy} aria-busy={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
        {!useApi && <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-warning ring-1 ring-amber-200">Demo sign-in. The password is <strong>{import.meta.env.VITE_ADMIN_PASSWORD ? "set in .env" : "hiq-admin"}</strong>. Real accounts come with the database.</p>}
      </form>
    </div>
  );
}

function Dashboard() {
  const { products, filters, parts, photos } = useCatalog();
  const todo: { text: string; to: string }[] = [];
  for (const p of products) {
    if (p.channel === "shop" && p.price == null) todo.push({ text: `${p.model}: add the price`, to: `/admin/products/${p.slug}` });
    if (!p.images?.length) todo.push({ text: `${p.model}: add product photos`, to: `/admin/products/${p.slug}` });
    const blanks = Object.entries(p.specs).filter(([, v]) => v == null).map(([k]) => k);
    if (blanks.length) todo.push({ text: `${p.model}: fill in ${blanks.join(", ").toLowerCase()}`, to: `/admin/products/${p.slug}` });
  }
  const filtersTodo = filters.filter((f) => f.sku.includes("TBC") || f.price == null || f.intervalMonths == null).length;
  if (filtersTodo) todo.push({ text: `${filtersTodo} replacement filters are missing a SKU, price or replacement interval`, to: "/admin/filters" });
  const partsTodo = parts.filter((p) => !p.hidden && (p.sku.includes("TBC") || p.price == null || !p.images.length)).length;
  if (partsTodo) todo.push({ text: `${partsTodo} spare parts are missing a SKU, price or photo`, to: "/admin/parts?show=shown" });
  const usedPhotos = (Object.keys(PHOTO_DEFAULTS) as PhotoKey[]).filter((k) => !PHOTO_PLACES[k].startsWith("Not shown"));
  const missingPhotos = usedPhotos.filter((k) => !photos[k]?.src).length;
  if (missingPhotos) todo.push({ text: `${missingPhotos} website photos are still placeholders`, to: "/admin/photos" });

  const stats = [
    ["Products on the shop", products.filter((p) => !p.hidden).length, "/admin/products"],
    ["Hidden products", products.filter((p) => p.hidden).length, "/admin/products?show=hidden"],
    ["Replacement filters", filters.length, "/admin/filters"],
    ["Spare parts on the shop", parts.filter((p) => !p.hidden).length, "/admin/parts"],
    ["Things to fill in", todo.length, "#todo"],
  ] as const;

  return (
    <>
      <PageHeader title="Dashboard" intro="An overview of the shop and what still needs to be filled in."
        actions={<><ButtonLink to="/admin/products/new" variant="primary">Add a product</ButtonLink><ButtonLink to="/admin/filters?new=1" variant="outline">Add a filter</ButtonLink><ButtonLink to="/admin/parts/new" variant="outline">Add a spare part</ButtonLink></>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {stats.map(([label, n, to]) => {
          const body = <><p className="font-display text-3xl font-bold text-hiq-navy">{n}</p><p className="text-[15px] text-slate-600">{label}</p></>;
          const cls = "rounded-card bg-white p-4 ring-1 ring-slate-200 hover:ring-hiq-blue";
          return to.startsWith("#") ? <a key={label} href={to} className={cls}>{body}</a> : <Link key={label} to={to} className={cls}>{body}</Link>;
        })}
      </div>
      <Card title="Still to fill in" intro="These show on the shop as amber [TBC] tags until they're filled in." className="mt-6">
        <div id="todo">
          {todo.length === 0 ? <p className="text-[15px] text-success">Everything is filled in.</p> : (
            <ul className="divide-y divide-slate-100">
              {todo.slice(0, 40).map((t, i) => <li key={i}><Link to={t.to} className="flex min-h-[44px] items-center justify-between gap-3 py-2 text-[15px] hover:text-hiq-blue"><span>{t.text}</span><span aria-hidden className="text-hiq-blue">→</span></Link></li>)}
              {todo.length > 40 && <li className="py-2 text-sm text-slate-600">…and {todo.length - 40} more</li>}
            </ul>
          )}
        </div>
      </Card>
    </>
  );
}

const NAV = [["", "Dashboard"], ["products", "Products"], ["filters", "Replacement filters"], ["parts", "Spare parts"], ["photos", "Website photos"], ["data", "Backup & reset"]] as const;

export default function Admin() {
  useSeo({ title: "Shop admin", description: "HIQ Shop administration.", path: "/admin", noindex: true });
  const [signedIn, setSignedIn] = useState(readSession);
  if (!signedIn) return <SignIn onDone={() => setSignedIn(true)} />;
  const signOut = () => {
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
    if (useApi) { tokens.set("admin", null); void loadCatalog(); } // back to the public catalogue
    setSignedIn(false);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-hiq-navy text-white">
        <div className="mx-auto flex min-h-[60px] max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/admin" className="flex items-center gap-2 font-display text-lg font-bold"><LogoMark size={28} /><span className="text-hiq-water">Shop admin</span></Link>
          <div className="flex items-center gap-1">
            <a href="/" target="_blank" rel="noopener" className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-[15px] font-semibold hover:bg-white/10">View shop<IconExternal size={16} /><span className="sr-only"> (opens in a new tab)</span></a>
            <button onClick={signOut} className="min-h-[44px] rounded-full px-3 text-[15px] font-semibold hover:bg-white/10">Sign out</button>
          </div>
        </div>
      </header>
      {repository.local && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-warning">
          Demo mode: changes are saved in <strong>this browser only</strong> and are visible here and on the shop in this browser. They will move to the database later.
        </div>
      )}
      <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr] lg:py-8">
        <nav aria-label="Admin" className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:sticky lg:top-[84px] lg:mx-0 lg:flex-col lg:self-start lg:px-0">
          {NAV.map(([to, label]) => (
            <NavLink key={to} end={to === ""} to={`/admin${to ? "/" + to : ""}`}
              className={({ isActive }) => cx("flex min-h-[44px] shrink-0 items-center rounded-lg px-3 text-[15px] font-semibold", isActive ? "bg-hiq-sky text-hiq-blue ring-1 ring-hiq-water" : "text-hiq-navy hover:bg-white")}>{label}</NavLink>
          ))}
        </nav>
        <main className="min-w-0">
          <Suspense fallback={<p className="py-16 text-center text-slate-600" role="status">Loading…</p>}>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<ProductEditor />} />
              <Route path="products/:slug" element={<ProductEditor />} />
              <Route path="filters" element={<AdminFilters />} />
              <Route path="parts" element={<AdminParts />} />
              <Route path="parts/new" element={<PartEditor />} />
              <Route path="parts/:slug" element={<PartEditor />} />
              <Route path="photos" element={<AdminPhotos />} />
              <Route path="data" element={<AdminData />} />
              <Route path="*" element={<Card title="Page not found"><ButtonLink to="/admin">Back to dashboard</ButtonLink></Card>} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
