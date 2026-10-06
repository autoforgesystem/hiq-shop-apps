import { BUSINESS } from "../config/site";
import { IconShield } from "./Icons";

export function TrustBar() {
  return (
    <a href={BUSINESS.championOfChange} className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 text-[15px] ring-1 ring-hiq-water hover:ring-hiq-blue">
      <IconShield className="text-hiq-blue" />
      <span><strong>Champion of Change</strong> endorser with Break Free From Plastic</span>
    </a>
  );
}

/** Partner names only; logos need [CONFIRM LOGO PERMISSION]. */
export function PartnerStrip() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {BUSINESS.partners.map((p) => (
        <li key={p.name} className="rounded-card bg-white p-4 ring-1 ring-slate-200">
          <p className="font-display font-bold">{p.name}</p>
          <p className="mt-1 text-sm text-slate-600">{p.role}</p>
        </li>
      ))}
    </ul>
  );
}
