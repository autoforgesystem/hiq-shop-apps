import { NavLink, Route, Routes, Link, useNavigate } from "react-router-dom";
import { MOCK } from "./mockData";
import { Badge, Button, ButtonLink, EmptyState, Tbc } from "../../components/ui";
import { useAuth } from "../../lib/auth";
import { useSeo } from "../../lib/seo";
import { cx } from "../../lib/format";

const TABS = [["", "Dashboard"], ["units", "My Units"], ["orders", "Orders"], ["filters", "Filter replacements"], ["subscriptions", "Subscriptions"], ["bookings", "Service bookings"], ["warranty", "Warranty"], ["loyalty", "Loyalty points"], ["addresses", "Addresses"], ["payments", "Payment methods"]] as const;
const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
const DueBadge = ({ date }: { date: string }) => { const n = daysUntil(date); return n < 0 ? <Badge tone="amber">Overdue</Badge> : n <= 30 ? <Badge tone="amber">Due in {n} days</Badge> : <Badge tone="green">Due {date}</Badge>; };

function Units() {
  return <ul className="space-y-4">{MOCK.units.map((u) => (
    <li key={u.id} className="rounded-card p-5 ring-1 ring-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-xl">{u.model}</h3><p className="text-[15px] text-slate-600">{u.address}</p></div><DueBadge date={u.nextFilterDue} /></div>
      <dl className="mt-4 grid gap-3 text-[15px] sm:grid-cols-3"><div><dt className="text-slate-600">Installed</dt><dd className="font-semibold">{u.installed}</dd></div><div><dt className="text-slate-600">Next filter due</dt><dd className="font-semibold">{u.nextFilterDue}</dd></div><div><dt className="text-slate-600">Warranty</dt><dd><span className="tbc">{u.warranty}</span></dd></div></dl>
      <details className="mt-3"><summary className="min-h-[44px] cursor-pointer py-2 font-semibold text-hiq-blue">Service history</summary><ul className="text-[15px]">{u.history.map((h) => <li key={h.date}>{h.date} — {h.what}</li>)}</ul></details>
      <div className="mt-3 flex flex-wrap gap-2"><ButtonLink to={`/filters?model=${u.slug}`} variant="primary">Replace filters</ButtonLink><ButtonLink to={`/service/book?unit=${u.slug}`} variant="outline">Book service</ButtonLink></div>
    </li>))}</ul>;
}

function Dashboard() {
  const due = MOCK.units.filter((u) => daysUntil(u.nextFilterDue) <= 30);
  return (
    <div className="space-y-8">
      <section><h2 className="mb-3 text-xl">My Units</h2><Units /></section>
      <div className="grid gap-4 sm:grid-cols-2">
        {[["orders", "Orders", `${MOCK.orders.length} order`], ["filters", "Filter replacements", due.length ? `${due.length} due soon` : "Nothing due"], ["bookings", "Service bookings", `${MOCK.bookings.length} upcoming`], ["loyalty", "Loyalty points", "[CONFIRM PROGRAMME]"]].map(([to, t, s]) => (
          <Link key={to} to={to} className="rounded-card p-5 ring-1 ring-slate-200 hover:ring-hiq-blue"><p className="font-display text-lg font-bold">{t}</p><p className="text-[15px] text-slate-600">{s}</p></Link>
        ))}
      </div>
    </div>
  );
}

export default function Account() {
  useSeo({ title: "My account", description: "Your HIQ units, orders, filters and service bookings.", path: "/account", noindex: true });
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="page py-10">
      <div className="mb-6 rounded-lg bg-amber-50 p-3 text-[15px] text-warning ring-1 ring-amber-200">Demo data — accounts need the backend described in /docs/API.md. Nothing here is saved.</div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-[32px] sm:text-[40px]">Mabuhay, {user?.firstName ?? MOCK.user.name.split(" ")[0]}</h1><p className="mt-1 text-[15px] text-slate-600">{user?.email}</p></div>
        <Button variant="ghost" onClick={() => { logout(); nav("/login"); }}>Sign out</Button>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Account" className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
          {TABS.map(([to, l]) => <NavLink key={to} end to={`/account${to ? "/" + to : ""}`} className={({ isActive }) => cx("flex min-h-[44px] shrink-0 items-center rounded-lg px-3 text-[15px] font-semibold", isActive ? "bg-hiq-sky text-hiq-blue" : "hover:bg-slate-50")}>{l}</NavLink>)}
        </nav>
        <div>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="units" element={<Units />} />
            <Route path="orders" element={<ul className="space-y-3">{MOCK.orders.map((o) => <li key={o.id} className="flex flex-wrap justify-between gap-2 rounded-card p-5 ring-1 ring-slate-200"><div><p className="font-semibold">{o.id}</p><p className="text-[15px] text-slate-600">{o.date} · {o.items}</p></div><div className="text-right"><Tbc>PRICE TBC</Tbc><p className="mt-1"><Badge tone="green">{o.status}</Badge></p></div></li>)}</ul>} />
            <Route path="filters" element={<ul className="space-y-3">{MOCK.units.map((u) => <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card p-5 ring-1 ring-slate-200"><div><p className="font-semibold">{u.model}</p><p className="text-[15px] text-slate-600">Interval: <span className="tbc">[TBC]</span></p></div><div className="flex items-center gap-3"><DueBadge date={u.nextFilterDue} /><ButtonLink to={`/filters?model=${u.slug}`} variant="primary">Replace</ButtonLink></div></li>)}</ul>} />
            <Route path="subscriptions" element={<EmptyState title="No subscriptions yet" body="Subscribe & Save for filters is being confirmed [CONFIRM SUBSCRIPTION OFFER]." action={<ButtonLink to="/filters">Find my filters</ButtonLink>} />} />
            <Route path="bookings" element={<ul className="space-y-3">{MOCK.bookings.map((b) => <li key={b.id} className="rounded-card p-5 ring-1 ring-slate-200"><p className="font-semibold">{b.service} · {b.unit}</p><p className="text-[15px] text-slate-600">Preferred {b.date}</p><Badge tone="amber">{b.status}</Badge></li>)}<li><ButtonLink to="/service/book">Book a service</ButtonLink></li></ul>} />
            <Route path="warranty" element={<div className="space-y-3"><p>Warranty periods: <Tbc>WARRANTY TBC</Tbc></p><ButtonLink to="/service/book?service=warranty" variant="outline">Make a warranty claim</ButtonLink></div>} />
            <Route path="loyalty" element={<EmptyState title="Loyalty points" body="A loyalty programme is being considered [CONFIRM PROGRAMME]." />} />
            <Route path="addresses" element={<ul className="space-y-2">{MOCK.addresses.map((a) => <li key={a} className="rounded-card p-4 ring-1 ring-slate-200">{a}</li>)}</ul>} />
            <Route path="payments" element={<EmptyState title="No saved payment methods" body="Card, GCash, Maya and online banking are handled by the commerce platform at checkout." />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
