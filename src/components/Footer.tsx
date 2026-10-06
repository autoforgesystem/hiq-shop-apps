import { Link } from "react-router-dom";
import { useState } from "react";
import { BUSINESS, mainSiteUrl } from "../config/site";
import { Logo } from "./Logo";
import { Button, Input, Tbc } from "./ui";
import { track } from "../lib/analytics";
import { submitForm } from "../lib/forms";

const SHOP_LINKS = [
  ["/shop", "All products"], ["/find-my-system", "Find My System"], ["/filters", "Replacement filters"], ["/service", "Installation & service"],
  ["/rent", "Buy or rent"], ["/business", "Office & business"], ["/eco", "Break the habit"], ["/guide", "Water Quality Guide"], ["/help", "Help & FAQ"],
] as const;
const MAIN_LINKS = [
  ["home", "About HIQ"], ["hotelBottling", "Hotel Bottling (Ecopure)"], ["bottleWashers", "Bottle Washers"], ["waco", "WACO Philippines"],
  ["sustainableSolutions", "Sustainable Solutions"], ["contact", "Contact"],
] as const;

export function Footer() {
  const [done, setDone] = useState(false);
  return (
    <footer className="mt-16 bg-hiq-navy pb-24 text-white md:pb-0">
      <div className="page grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
        <div className="space-y-4 text-[15px] text-white/85">
          <Logo />
          <p>{BUSINESS.legalName}</p>
          <address className="not-italic">{BUSINESS.addressLine}</address>
          <p>{BUSINESS.hours} <Tbc>CONFIRM DAYS</Tbc></p>
          <p><a href={BUSINESS.phoneHref} className="hover:underline">{BUSINESS.phone}</a><br /><a href={`mailto:${BUSINESS.email}`} className="hover:underline">{BUSINESS.email}</a></p>
          <ul className="flex flex-wrap gap-2">
            {Object.entries(BUSINESS.social).map(([k, url]) => <li key={k}><a href={url} className="inline-flex min-h-[44px] items-center rounded-full bg-white/10 px-3 text-sm capitalize hover:bg-white/20">{k === "x" ? "X" : k}</a></li>)}
          </ul>
        </div>
        <nav aria-label="Shop">
          <h2 className="mb-3 text-base text-white">Shop</h2>
          <ul className="space-y-1 text-[15px]">{SHOP_LINKS.map(([to, l]) => <li key={to}><Link to={to} className="inline-flex min-h-[36px] items-center text-white/85 hover:text-white hover:underline">{l}</Link></li>)}</ul>
        </nav>
        <nav aria-label="HIQ Philippines">
          <h2 className="mb-3 text-base text-white">HIQ Philippines</h2>
          <ul className="space-y-1 text-[15px]">{MAIN_LINKS.map(([k, l]) => <li key={k}><a href={mainSiteUrl(k, "footer")} className="inline-flex min-h-[36px] items-center text-white/85 hover:text-white hover:underline">{l} ↗</a></li>)}</ul>
          <p className="mt-3 text-[13px] text-white/60">These pages open on the HIQ main site.</p>
        </nav>
        <div>
          <h2 className="mb-2 text-base text-white">Mabuhay! Stay in the loop</h2>
          <p className="text-[15px] text-white/85">Filter reminders, new products and tips for breaking the plastic-bottle habit.</p>
          {done ? <p role="status" className="mt-4 font-semibold text-hiq-water">Thanks — you're subscribed.</p> : (
            <form className="mt-4 flex gap-2" onSubmit={async (e) => {
              e.preventDefault();
              const email = new FormData(e.currentTarget).get("email") as string;
              if (!/^\S+@\S+\.\S+$/.test(email)) return;
              await submitForm("Newsletter sign-up", { Email: email }).catch(() => undefined);
              track("newsletter_signup"); setDone(true);
            }}>
              <label htmlFor="nl" className="sr-only">Email address</label>
              <Input id="nl" name="email" type="email" required placeholder="you@example.com" autoComplete="email" className="!border-white/20" />
              <Button type="submit" variant="secondary" className="shrink-0 bg-white !text-hiq-navy hover:bg-hiq-sky">Subscribe</Button>
            </form>
          )}
          <div className="mt-8">
            <h2 className="mb-2 text-sm text-white/70">Partners</h2>
            <p className="text-[14px] text-white/85">{BUSINESS.partners.map((p) => p.name).join(" · ")}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="page flex flex-wrap items-center justify-between gap-3 py-5 text-[14px] text-white/70">
          <p>© {new Date().getFullYear()} {BUSINESS.legalName}. Break the habit.</p>
          <ul className="flex gap-4"><li><Link to="/privacy" className="hover:underline">Privacy</Link></li><li><Link to="/terms" className="hover:underline">Terms</Link></li><li><Link to="/warranty-policy" className="hover:underline">Warranty policy</Link></li></ul>
        </div>
      </div>
    </footer>
  );
}
