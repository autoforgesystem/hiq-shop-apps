import { createContext, useContext } from "react";
import { NavLink, Route, Routes, Link, useNavigate } from "react-router-dom";
import { MOCK } from "./mockData";
import { useAccountData, type AccountData } from "./useAccountData";
import { Badge, Button, ButtonLink, EmptyState, PriceTag, Tbc } from "../../components/ui";
import { useAuth } from "../../lib/auth";
import { useApi } from "../../lib/api";
import { useSeo } from "../../lib/seo";
import { cx } from "../../lib/format";

const TABS = [["", "Dashboard"], ["units", "My Units"], ["orders", "Orders"], ["filters", "Filter replacements"], ["subscriptions", "Subscriptions"], ["bookings", "Service bookings"], ["warranty", "Warranty"], ["loyalty", "Loyalty points"], ["addresses", "Addresses"], ["payments", "Payment methods"]] as const;
const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
/** An empty date means the filter schedule isn't known yet (intervals are [TBC]). */
const DueBadge = ({ date }: { date: string }) => {
  if (!date) return <Badge tone="slate">Schedule [TBC]</Badge>;
  const n = daysUntil(date);
  return n < 0 ? <Badge tone="amber">Overdue</Badge> : n <= 30 ? <Badge tone="amber">Due in {n} days</Badge> : <Badge tone="green">Due {date}</Badge>;
};
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const DataCtx = createContext<AccountData>(MOCK);
const useData = () => useContext(DataCtx);

function Units() {
  const { units } = useData();
  if (!units.length) return <EmptyState title="No units yet" body="When HIQ installs a system for you, it appears here with its filter due dates and service history." action={<ButtonLink to="/shop">Shop water filters</ButtonLink>} />;
  return <ul className="space-y-4">{units.map((u) => (
    <li key={u.id} className="rounded-card p-5 ring-1 ring-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-xl">{u.model}</h3><p className="text-[15px] text-slate-600">{u.address}</p></div><DueBadge date={u.nextFilterDue} /></div>
      <dl className="mt-4 grid gap-3 text-[15px] sm:grid-cols-3"><div><dt className="text-slate-600">Installed</dt><dd className="font-semibold">{u.installed}</dd></div><div><dt className="text-slate-600">Next filter due</dt><dd className="font-semibold">{u.nextFilterDue || <Tbc />}</dd></div><div><dt className="text-slate-600">Warranty</dt><dd>{u.warranty.includes("TBC") ? <span className="tbc">{u.warranty}</span> : <span className="font-semibold">{u.warranty}</span>}</dd></div></dl>
      <details className="mt-3"><summary className="min-h-[44px] cursor-pointer py-2 font-semibold text-hiq-blue">Service history</summary><ul className="text-[15px]">{u.history.map((h, i) => <li key={`${h.date}-${i}`}>{h.date} — {h.what}</li>)}</ul></details>
      <div className="mt-3 flex flex-wrap gap-2"><ButtonLink to={`/filters?model=${u.slug}`} variant="primary">Replace filters</ButtonLink><ButtonLink to={`/service/book?unit=${u.slug}`} variant="outline">Book service</ButtonLink></div>
    </li>))}</ul>;
}

function Dashboard() {
  const { units, orders, bookings } = useData();
  const due = units.filter((u) => u.nextFilterDue && daysUntil(u.nextFilterDue) <= 30);
  return (
    <div className="space-y-8">
      <section><h2 className="mb-3 text-xl">My Units</h2><Units /></section>
      <div className="grid gap-4 sm:grid-cols-2">
        {[["orders", "Orders", plural(orders.length, "order")], ["filters", "Filter replacements", due.length ? `${due.length} due soon` : "Nothing due"], ["bookings", "Service bookings", plural(bookings.length, "booking")], ["loyalty", "Loyalty points", "[CONFIRM PROGRAMME]"]].map(([to, t, s]) => (
          <Link key={to} to={to} className="rounded-card p-5 ring-1 ring-slate-200 hover:ring-hiq-blue"><p className="font-display text-lg font-bold">{t}</p><p className="text-[15px] text-slate-600">{s}</p></Link>
        ))}
      </div>
    </div>
  );
}

function Orders() {
  const { orders } = useData();
  if (!orders.length) return <EmptyState title="No orders yet" body="Orders you place while signed in appear here." action={<ButtonLink to="/shop" variant="primary">Shop water filters</ButtonLink>} />;
  return <ul className="space-y-3">{orders.map((o) => <li key={o.id} className="flex flex-wrap justify-between gap-2 rounded-card p-5 ring-1 ring-slate-200"><div><p className="font-semibold">{o.id}</p><p className="text-[15px] text-slate-600">{o.date} · {o.items}</p></div><div className="text-right"><PriceTag price={o.total} /><p className="mt-1"><Badge tone="green">{o.status}</Badge></p></div></li>)}</ul>;
}

function Filters() {
  const { units } = useData();
  if (!units.length) return <EmptyState title="No filters to track yet" body="Filter reminders start once a unit is installed on your account." action={<ButtonLink to="/filters">Find my filters</ButtonLink>} />;
  return <ul className="space-y-3">{units.map((u) => <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card p-5 ring-1 ring-slate-200"><div><p className="font-semibold">{u.model}</p><p className="text-[15px] text-slate-600">Interval: <span className="tbc">[TBC]</span></p></div><div className="flex items-center gap-3"><DueBadge date={u.nextFilterDue} /><ButtonLink to={`/filters?model=${u.slug}`} variant="primary">Replace</ButtonLink></div></li>)}</ul>;
}

function Bookings() {
  const { bookings } = useData();
  return <ul className="space-y-3">{bookings.map((b) => <li key={b.id} className="rounded-card p-5 ring-1 ring-slate-200"><p className="font-semibold">{b.service} · {b.unit}</p><p className="text-[15px] text-slate-600">Preferred {b.date}</p><Badge tone="amber">{b.status}</Badge></li>)}<li><ButtonLink to="/service/book">Book a service</ButtonLink></li></ul>;
}

function Addresses() {
  const { addresses } = useData();
  if (!addresses.length) return <EmptyState title="No saved addresses" body="Addresses you add at checkout or for service visits will appear here." />;
  return <ul className="space-y-2">{addresses.map((a) => <li key={a} className="rounded-card p-4 ring-1 ring-slate-200">{a}</li>)}</ul>;
}

export default function Account() {
  useSeo({ title: "My account", description: "Your HIQ units, orders, filters and service bookings.", path: "/account", noindex: true });
  const { user, logout } = useAuth();
  const { data, error } = useAccountData();
  const nav = useNavigate();
  return (
    <div className="page py-10">
      {!useApi && <div className="mb-6 rounded-lg bg-amber-50 p-3 text-[15px] text-warning ring-1 ring-amber-200">Demo data — accounts need the backend described in /docs/API.md. Nothing here is saved.</div>}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-[32px] sm:text-[40px]">Mabuhay, {user?.firstName ?? MOCK.user.name.split(" ")[0]}</h1><p className="mt-1 text-[15px] text-slate-600">{user?.email}</p></div>
        <Button variant="ghost" onClick={() => { logout(); nav("/login"); }}>Sign out</Button>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Account" className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
          {TABS.map(([to, l]) => <NavLink key={to} end to={`/account${to ? "/" + to : ""}`} className={({ isActive }) => cx("flex min-h-[44px] shrink-0 items-center rounded-lg px-3 text-[15px] font-semibold", isActive ? "bg-hiq-sky text-hiq-blue" : "hover:bg-slate-50")}>{l}</NavLink>)}
        </nav>
        <div>
          {error ? <p role="alert" className="rounded-lg bg-red-50 p-4 text-[15px] font-medium text-error ring-1 ring-red-200">{error}</p>
            : !data ? <p role="status" className="py-12 text-center text-slate-600">Loading your account…</p>
            : <DataCtx.Provider value={data}>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="units" element={<Units />} />
                <Route path="orders" element={<Orders />} />
                <Route path="filters" element={<Filters />} />
                <Route path="subscriptions" element={<EmptyState title="No subscriptions yet" body="Subscribe & Save for filters is being confirmed [CONFIRM SUBSCRIPTION OFFER]." action={<ButtonLink to="/filters">Find my filters</ButtonLink>} />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="warranty" element={<div className="space-y-3"><p>Warranty periods: <Tbc>WARRANTY TBC</Tbc></p><ButtonLink to="/service/book?service=warranty" variant="outline">Make a warranty claim</ButtonLink></div>} />
                <Route path="loyalty" element={<EmptyState title="Loyalty points" body="A loyalty programme is being considered [CONFIRM PROGRAMME]." />} />
                <Route path="addresses" element={<Addresses />} />
                <Route path="payments" element={<EmptyState title="No saved payment methods" body="Card, GCash, Maya and online banking are handled by the commerce platform at checkout." />} />
              </Routes>
            </DataCtx.Provider>}
        </div>
      </div>
    </div>
  );
}
