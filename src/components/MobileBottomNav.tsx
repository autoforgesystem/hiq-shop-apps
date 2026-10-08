import { NavLink, useLocation } from "react-router-dom";
import { IconCompass, IconFilter, IconHome, IconShop, IconUser } from "./Icons";
import { cx } from "../lib/format";

const ITEMS = [
  { to: "/", label: "Home", Icon: IconHome, end: true },
  { to: "/shop", label: "Shop", Icon: IconShop },
  { to: "/find-my-system", label: "Find", Icon: IconCompass },
  { to: "/filters", label: "Filters", Icon: IconFilter },
  { to: "/account", label: "Account", Icon: IconUser },
];
/** Browsing pages only — hidden on product and part pages (sticky Add to Cart) and throughout checkout. */
export const hideBottomNav = (path: string) => /^\/(product|cart|checkout|order|parts\/.)/.test(path);

export function MobileBottomNav() {
  const { pathname } = useLocation();
  if (hideBottomNav(pathname)) return null;
  return (
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {ITEMS.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={({ isActive }) => cx("flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-center text-[12px] font-semibold leading-tight", isActive ? "text-hiq-blue" : "text-slate-600")}>
              <Icon size={22} />{label === "Find" ? "Find My System" : label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
