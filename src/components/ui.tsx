import { Link } from "react-router-dom";
import type { ButtonHTMLAttributes, ReactNode, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cx, formatPHP } from "../lib/format";
import { mainSiteUrl, type MainSiteKey } from "../config/site";
import { IconChevron, IconExternal } from "./Icons";

type Variant = "primary" | "secondary" | "outline" | "ghost";
const btn = (v: Variant, full?: boolean) => cx(
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
  v === "primary" && "bg-hiq-accent text-white hover:bg-hiq-accent-dark", // commerce CTAs only
  v === "secondary" && "bg-hiq-blue text-white hover:bg-hiq-blue-dark",
  v === "outline" && "border-2 border-hiq-blue text-hiq-blue hover:bg-hiq-sky",
  v === "ghost" && "text-hiq-blue hover:bg-hiq-sky",
  full && "w-full",
);

export function Button({ variant = "secondary", full, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; full?: boolean }) {
  return <button {...p} className={cx(btn(variant, full), className)} />;
}
export function ButtonLink({ to, variant = "secondary", full, className, children, onClick }: { to: string; variant?: Variant; full?: boolean; className?: string; children: ReactNode; onClick?: () => void }) {
  return <Link to={to} onClick={onClick} className={cx(btn(variant, full), className)}>{children}</Link>;
}

export const Chip = ({ children, active, className }: { children: ReactNode; active?: boolean; className?: string }) => (
  <span className={cx("inline-flex items-center rounded-full px-2.5 py-1 text-[13px] font-semibold", active ? "bg-hiq-blue text-white" : "bg-hiq-water text-hiq-navy", className)}>{children}</span>
);

const filtrationTone: Record<string, string> = {
  UF: "bg-hiq-sky text-hiq-navy ring-1 ring-hiq-water",
  Nano: "bg-hiq-water text-hiq-navy",
  RO: "bg-hiq-blue text-white",
  UV: "bg-white text-hiq-blue ring-1 ring-hiq-blue",
  Alkaline: "bg-white text-hiq-navy ring-1 ring-slate-300",
};
export const FiltrationChip = ({ f }: { f: string }) => (
  <span className={cx("inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] font-semibold", filtrationTone[f] ?? filtrationTone.Alkaline)}>{f}</span>
);

export const Badge = ({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "green" | "amber" | "slate" }) => (
  <span className={cx("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[13px] font-semibold",
    tone === "blue" && "bg-hiq-sky text-hiq-blue", tone === "green" && "bg-green-50 text-success",
    tone === "amber" && "bg-amber-50 text-warning", tone === "slate" && "bg-slate-100 text-slate-700")}>{children}</span>
);

/** Visible placeholder for anything the business must still supply. */
export const Tbc = ({ children = "TBC" }: { children?: ReactNode }) => <span className="tbc">[{children}]</span>;

export function PriceTag({ price, size = "md", quote }: { price: number | null; size?: "md" | "lg"; quote?: boolean }) {
  if (quote) return <span className={cx("font-semibold text-hiq-navy", size === "lg" ? "text-xl" : "text-base")}>Price on quote</span>;
  if (price == null) return <span className={size === "lg" ? "text-lg" : ""}><Tbc>PRICE TBC</Tbc></span>;
  return <span className={cx("font-display font-bold", size === "lg" ? "text-3xl" : "text-lg")}>{formatPHP(price)}</span>;
}

export function FormField({ label, id, error, hint, children }: { label: string; id: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[15px] font-semibold">{label}</label>
      {hint && <p id={`${id}-hint`} className="text-sm text-slate-600">{hint}</p>}
      {children}
      {error && <p id={`${id}-err`} role="alert" className="text-sm font-medium text-error">{error}</p>}
    </div>
  );
}
export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cx("field", p.className)} />;
export const Select = (p: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={cx("field pr-8", p.className)} />;
export const Textarea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={cx("field min-h-[110px] py-2.5", p.className)} />;

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-hiq-water bg-hiq-sky/50 px-6 py-12 text-center">
      <h2 className="text-xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-slate-700">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {it.to ? <Link to={it.to} className="hover:text-hiq-blue hover:underline">{it.label}</Link> : <span aria-current="page" className="font-medium text-hiq-navy">{it.label}</span>}
            {i < items.length - 1 && <IconChevron size={14} />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Links that leave the shop: same tab, clearly labelled, with UTM parameters. */
export function MainSiteLink({ to, children, className, content }: { to: MainSiteKey; children: ReactNode; className?: string; content?: string }) {
  return (
    <a href={mainSiteUrl(to, content ?? to)} className={cx("inline-flex items-center gap-1", className)}>
      {children}<span className="sr-only"> (opens the HIQ main site)</span><IconExternal size={15} />
    </a>
  );
}

export const SectionTitle = ({ title, intro, className }: { title: string; intro?: ReactNode; className?: string }) => (
  <div className={cx("mb-8 max-w-2xl", className)}>
    <h2 className="text-[28px] sm:text-[34px]">{title}</h2>
    {intro && <p className="mt-3 text-lg text-slate-700">{intro}</p>}
  </div>
);
