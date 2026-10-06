import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { IconCart, IconChevronDown, IconClose, IconMenu, IconPhone, IconSearch, IconUser } from "./Icons";
import { SearchModal } from "./SearchModal";
import { useCommerce } from "../commerce/CommerceContext";
import { BUSINESS, mainSiteUrl } from "../config/site";
import { CATEGORIES, NEEDS } from "../data/catalog";
import { cx } from "../lib/format";

const NAV = [
  { to: "/find-my-system", label: "Find My System" },
  { to: "/filters", label: "Filters" },
  { to: "/service", label: "Service" },
  { to: "/business", label: "Business" },
  { to: "/guide", label: "Guide" },
];

export function TopBar() {
  return (
    <div className="bg-hiq-blue text-white">
      <div className="page flex min-h-[40px] items-center justify-between gap-4 text-[14px]">
        <a href={mainSiteUrl("home", "topbar")} className="inline-flex min-h-[40px] items-center gap-1 font-medium hover:underline">← HIQ main site</a>
        <a href={BUSINESS.championOfChange} className="hidden min-h-[40px] items-center hover:underline md:inline-flex">Champion of Change — Break Free From Plastic</a>
        <a href={BUSINESS.phoneHref} className="inline-flex min-h-[40px] items-center gap-1.5 font-medium hover:underline"><IconPhone size={16} />{BUSINESS.phone}</a>
      </div>
    </div>
  );
}

function MegaMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="absolute inset-x-0 top-full border-t border-slate-200 bg-white shadow-lift">
      <div className="page grid grid-cols-[1fr_1.4fr_1fr] gap-8 py-8">
        <div>
          <h3 className="mb-3 text-sm text-slate-600">Shop by need</h3>
          <ul className="space-y-1">{NEEDS.map((n) => <li key={n.slug}><Link onClick={onNavigate} to={`/shop/need/${n.slug}`} className="block rounded-lg px-3 py-2 hover:bg-hiq-sky"><span className="font-semibold">{n.label}</span><span className="block text-sm text-slate-600">{n.blurb}</span></Link></li>)}</ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm text-slate-600">Shop by product</h3>
          <ul className="grid grid-cols-2 gap-1">{CATEGORIES.map((c) => <li key={c.slug}><Link onClick={onNavigate} to={c.quote ? "/business" : `/shop/${c.slug}`} className="block rounded-lg px-3 py-2 font-semibold hover:bg-hiq-sky">{c.label}{c.quote && <span className="block text-sm font-normal text-slate-600">Request a quote</span>}</Link></li>)}
            <li className="col-span-2"><Link onClick={onNavigate} to="/shop" className="link block px-3 py-2">See all products</Link></li>
          </ul>
        </div>
        <Link onClick={onNavigate} to="/find-my-system" className="rounded-card bg-hiq-sky p-5 ring-1 ring-hiq-water hover:ring-hiq-blue">
          <p className="font-display text-lg font-bold">Not sure which system?</p>
          <p className="mt-1 text-[15px] text-slate-700">Answer six quick questions and we'll match you with options that fit your space and your water.</p>
          <span className="link mt-3 inline-block">Find My System</span>
        </Link>
      </div>
    </div>
  );
}

export function Header() {
  const { count, adapter } = useCommerce();
  const [mega, setMega] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  const loc = useLocation();
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => { setMega(false); setDrawer(false); }, [loc.pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMega(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  const navCls = ({ isActive }: { isActive: boolean }) => cx("inline-flex min-h-[44px] items-center rounded-full px-3 text-[15px] font-semibold hover:bg-hiq-sky", isActive ? "text-hiq-blue" : "text-hiq-navy");

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur" ref={wrap} onMouseLeave={() => setMega(false)}>
      <div className="border-b border-slate-200">
        <div className="page flex h-16 items-center gap-2">
          <button className="-ml-2 grid h-11 w-11 place-items-center rounded-full hover:bg-hiq-sky md:hidden" aria-label="Open menu" onClick={() => setDrawer(true)}><IconMenu /></button>
          <Logo />
          <nav aria-label="Main" className="ml-6 hidden items-center gap-1 lg:flex">
            <button aria-expanded={mega} aria-haspopup="true" onMouseEnter={() => setMega(true)} onClick={() => setMega((m) => !m)}
              className={cx("inline-flex min-h-[44px] items-center gap-1 rounded-full px-3 text-[15px] font-semibold hover:bg-hiq-sky", loc.pathname.startsWith("/shop") ? "text-hiq-blue" : "")}>
              Shop <IconChevronDown size={16} className={cx("transition-transform", mega && "rotate-180")} />
            </button>
            {NAV.map((n) => <NavLink key={n.to} to={n.to} className={navCls} onMouseEnter={() => setMega(false)}>{n.label}</NavLink>)}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => setSearch(true)} className="grid h-11 w-11 place-items-center rounded-full hover:bg-hiq-sky" aria-label="Search"><IconSearch /></button>
            <Link to="/account" className="hidden h-11 w-11 place-items-center rounded-full hover:bg-hiq-sky md:grid" aria-label="My account"><IconUser /></Link>
            <button onClick={() => adapter.goToCart()} className="relative grid h-11 w-11 place-items-center rounded-full hover:bg-hiq-sky" aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}>
              <IconCart />
              {count > 0 && <span className="absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-hiq-accent px-1 text-[12px] font-bold text-white">{count}</span>}
            </button>
          </div>
        </div>
      </div>
      {mega && <div className="hidden lg:block"><MegaMenu onNavigate={() => setMega(false)} /></div>}

      {drawer && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-hiq-navy/40" onClick={() => setDrawer(false)} />
          <nav className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-white">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <Logo /><button className="grid h-11 w-11 place-items-center" aria-label="Close menu" onClick={() => setDrawer(false)}><IconClose /></button>
            </div>
            <div className="space-y-6 p-4">
              <div><p className="mb-1 px-3 text-sm text-slate-600">Shop by product</p>
                {CATEGORIES.map((c) => <Link key={c.slug} to={c.quote ? "/business" : `/shop/${c.slug}`} className="flex min-h-[44px] items-center rounded-lg px-3 font-semibold hover:bg-hiq-sky">{c.label}</Link>)}
                <Link to="/shop" className="flex min-h-[44px] items-center px-3 link">All products</Link>
              </div>
              <div><p className="mb-1 px-3 text-sm text-slate-600">Shop by need</p>
                <div className="grid grid-cols-2 gap-1">{NEEDS.map((n) => <Link key={n.slug} to={`/shop/need/${n.slug}`} className="flex min-h-[44px] items-center rounded-lg bg-hiq-sky px-3 font-semibold">{n.label}</Link>)}</div>
              </div>
              <div className="border-t border-slate-200 pt-4">{[...NAV, { to: "/rent", label: "Buy or Rent" }, { to: "/eco", label: "Break the Habit" }, { to: "/help", label: "Help & Contact" }, { to: "/account", label: "My Account" }].map((n) =>
                <Link key={n.to} to={n.to} className="flex min-h-[44px] items-center rounded-lg px-3 font-semibold hover:bg-hiq-sky">{n.label}</Link>)}</div>
              <div className="space-y-1 rounded-card bg-hiq-sky p-3 text-[15px]">
                <a href={mainSiteUrl("home", "drawer")} className="flex min-h-[44px] items-center px-2 font-semibold text-hiq-blue">← HIQ main site</a>
                <a href={BUSINESS.championOfChange} className="flex min-h-[44px] items-center px-2">Champion of Change — Break Free From Plastic</a>
                <a href={BUSINESS.phoneHref} className="flex min-h-[44px] items-center gap-2 px-2 font-semibold"><IconPhone size={18} />{BUSINESS.phone}</a>
              </div>
            </div>
          </nav>
        </div>
      )}
      <SearchModal open={search} onClose={() => setSearch(false)} />
    </header>
  );
}
